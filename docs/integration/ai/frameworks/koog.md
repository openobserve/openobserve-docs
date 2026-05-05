---
title: Koog
description: Instrument JetBrains Koog agents and send traces to OpenObserve via OpenTelemetry.
---

# **Koog → OpenObserve**

Capture agent invocation latency, LLM call details, and span trees for every Koog agent run. Koog is JetBrains' Kotlin-first AI agent framework with built-in OpenTelemetry support via its `OpenTelemetry.Feature`. Install the feature on each agent with an OTLP HTTP exporter and Koog emits a structured span tree for every run automatically.

## **Prerequisites**

* JDK 17+ and Kotlin 2.x
* Maven 3.9+ (or Gradle 8+)
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key

## **Installation**

Add the following to your `pom.xml` (Maven):

```xml
<dependencies>
    <dependency>
        <groupId>ai.koog</groupId>
        <artifactId>koog-agents-jvm</artifactId>
        <version>0.7.1</version>
    </dependency>
    <dependency>
        <groupId>org.jetbrains.kotlinx</groupId>
        <artifactId>kotlinx-coroutines-core</artifactId>
        <version>1.10.2</version>
    </dependency>
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-sdk</artifactId>
        <version>1.43.0</version>
    </dependency>
    <dependency>
        <groupId>io.opentelemetry</groupId>
        <artifactId>opentelemetry-exporter-otlp</artifactId>
        <version>1.43.0</version>
    </dependency>
    <dependency>
        <groupId>io.opentelemetry.semconv</groupId>
        <artifactId>opentelemetry-semconv</artifactId>
        <version>1.25.0-alpha</version>
    </dependency>
</dependencies>
```

Or in `build.gradle.kts` (Gradle):

```kotlin
dependencies {
    implementation("ai.koog:koog-agents:0.7.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("io.opentelemetry:opentelemetry-sdk:1.43.0")
    implementation("io.opentelemetry:opentelemetry-exporter-otlp:1.43.0")
    implementation("io.opentelemetry.semconv:opentelemetry-semconv:1.25.0-alpha")
}
```

## **Configuration**

Set environment variables before running:

```shell
export OPENAI_API_KEY=your-openai-api-key
export OPENOBSERVE_URL=https://api.openobserve.ai/
export OPENOBSERVE_ORG=your_org_id
export OPENOBSERVE_AUTH_TOKEN="Basic <your_base64_token>"
```

## **Instrumentation**

Build an OTLP exporter and `OpenTelemetrySdk`, then install `OpenTelemetry.Feature` on each agent via the builder. Koog emits a span tree for every `agent.run()` call.

```kotlin
import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
import ai.koog.prompt.executor.clients.openai.OpenAIModels
import ai.koog.prompt.executor.llms.all.simpleOpenAIExecutor
import io.opentelemetry.api.common.Attributes
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter
import io.opentelemetry.sdk.OpenTelemetrySdk
import io.opentelemetry.sdk.resources.Resource
import io.opentelemetry.sdk.trace.SdkTracerProvider
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor
import io.opentelemetry.semconv.ServiceAttributes
import kotlinx.coroutines.runBlocking

fun main(args: Array<String>) {
    runBlocking {
        val ooUrl = System.getenv("OPENOBSERVE_URL") ?: "http://localhost:5080/"
        val ooOrg = System.getenv("OPENOBSERVE_ORG") ?: "default"
        val ooAuth = System.getenv("OPENOBSERVE_AUTH_TOKEN") ?: ""

        val exporter = OtlpHttpSpanExporter.builder()
            .setEndpoint("${ooUrl}api/${ooOrg}/v1/traces")
            .addHeader("Authorization", ooAuth)
            .build()

        val tracerProvider = SdkTracerProvider.builder()
            .addSpanProcessor(SimpleSpanProcessor.create(exporter))
            .setResource(Resource.create(
                Attributes.of(ServiceAttributes.SERVICE_NAME, "koog-app")
            ))
            .build()

        val sdk = OpenTelemetrySdk.builder()
            .setTracerProvider(tracerProvider)
            .build()

        val executor = simpleOpenAIExecutor(System.getenv("OPENAI_API_KEY"))

        val agent = AIAgent.builder()
            .promptExecutor(executor)
            .llmModel(OpenAIModels.Chat.GPT4oMini)
            .systemPrompt("You are a helpful assistant. Answer concisely.")
            .install(OpenTelemetry.Feature) { config ->
                config.setSdk(sdk)
                config.setServiceInfo("koog-app", "1.0")
            }
            .build()

        val response = agent.run("What is distributed tracing?")
        println(response)

        tracerProvider.shutdown()
    }
}
```

Run with Maven:

```shell
mvn compile exec:java -Dexec.mainClass=MainKt
```

Or with Gradle:

```shell
./gradlew run
```

## **What Gets Captured**

Each `agent.run()` produces a tree of spans. The root span covers the full agent lifecycle with child spans for each internal node.

| Attribute | Span | Description |
| ----- | ----- | ----- |
| `gen_ai_operation_name` | all | `create_agent`, `invoke_agent`, or `node` |
| `gen_ai_agent_id` | `create_agent`, `invoke_agent` | Agent instance UUID |
| `gen_ai_provider_name` | `create_agent`, `invoke_agent` | LLM provider (e.g. `openai`) |
| `gen_ai_request_model` | `create_agent`, `invoke_agent` | Model name sent in the request |
| `gen_ai_response_model` | `invoke_agent` | Model name returned by the API |
| `gen_ai_conversation_id` | `invoke_agent`, `node` | Conversation UUID for this run |
| `gen_ai_usage_input_tokens` | `invoke_agent` | Prompt tokens consumed |
| `gen_ai_usage_output_tokens` | `invoke_agent` | Completion tokens returned |
| `koog_event_id` | all | Internal Koog event UUID |
| `koog_node_id` | `node` | Node name (e.g. `nodeCallLLM`, `__finish__`) |
| `operation_name` | all | Human-readable span name |
| `duration` | all | Span latency |
| `span_status` | all | `OK` on success, `ERROR` on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name` = `koog-app` to see all Koog traces
3. Expand any trace to see the full span tree: `create_agent` → `invoke_agent` → node spans
4. Use `gen_ai_request_model` to filter by model
5. Filter by `span_status` = `ERROR` to find failed agent runs

![Koog traces in OpenObserve](../../../images/integration/ai/koog.png)

## **Next Steps**

With Koog instrumented, every agent run is recorded in OpenObserve. From here you can track end-to-end latency per agent, inspect node-level execution times, and alert on failed invocations.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
