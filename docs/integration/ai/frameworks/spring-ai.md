---
title: Spring AI
description: Instrument Spring AI applications and send traces to OpenObserve via OpenTelemetry.
---

# **Spring AI → OpenObserve**

Capture LLM call latency, model name, token usage, and prompt metadata for every Spring AI chat call. Spring AI integrates with Spring Boot's Micrometer observability stack. Add the `micrometer-tracing-bridge-otel` and `opentelemetry-exporter-otlp` dependencies, configure your OTLP endpoint, and every `ChatClient` call is automatically traced.

## **Prerequisites**

* Java 17+
* Maven 3.9+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key

## **Installation**

Add the following to your `pom.xml`:

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.4.0</version>
</parent>

<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>1.0.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>
  <dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
  </dependency>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
  </dependency>
</dependencies>
```

## **Configuration**

Set the following in `src/main/resources/application.yml`:

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o-mini

management:
  tracing:
    sampling:
      probability: 1.0
  otlp:
    tracing:
      endpoint: ${OPENOBSERVE_OTLP_URL:http://localhost:5080/api/default/v1/traces}
      headers:
        Authorization: ${OPENOBSERVE_AUTH_TOKEN}
```

## **Instrumentation**

Inject `ChatClient.Builder`, build a `ChatClient`, and call `.prompt().call().content()`. Spring AI and Micrometer automatically trace each call.

```java
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MyApp {

    public static void main(String[] args) {
        SpringApplication.run(MyApp.class, args);
    }

    @Bean
    CommandLineRunner runner(ChatClient.Builder builder) {
        return args -> {
            ChatClient client = builder.build();
            String response = client
                .prompt("What is distributed tracing?")
                .call()
                .content();
            System.out.println(response);
            System.exit(0);
        };
    }
}
```

Run with:

```shell
export OPENAI_API_KEY=your-key
export OPENOBSERVE_AUTH_TOKEN="Basic <your_base64_token>"
mvn spring-boot:run
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `gen_ai_system` | AI provider (e.g. `openai`) |
| `gen_ai_request_model` | Model requested |
| `gen_ai_response_model` | Model that served the response |
| `gen_ai_usage_input_tokens` | Prompt tokens consumed |
| `gen_ai_usage_output_tokens` | Completion tokens generated |
| `gen_ai_response_finish_reasons` | Why generation stopped |
| `duration` | ChatClient call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `gen_ai_system` to see all Spring AI calls
3. Filter by `gen_ai_request_model` to compare latency across models
4. Click any span to inspect token usage and finish reasons
5. Filter by `span_status` `ERROR` to find failed chat calls

![Spring AI traces in OpenObserve](../../../images/integration/ai/spring-ai.png)

## **Next Steps**

With Spring AI instrumented, every `ChatClient` call is recorded in OpenObserve. From here you can track token consumption per endpoint, build cost dashboards, and alert on latency regressions across Spring AI services.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Quarkus LangChain4j](./quarkus-langchain4j.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
