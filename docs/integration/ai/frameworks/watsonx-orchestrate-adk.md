---
title: Watsonx Orchestrate ADK
description: Instrument IBM Watsonx Orchestrate ADK agents and send traces to OpenObserve via OpenTelemetry.
---

# **Watsonx Orchestrate ADK → OpenObserve**

Capture agent invocation latency, input/output metadata, and error details for every IBM Watsonx Orchestrate agent run. Watsonx Orchestrate ADK is IBM's Python SDK for building and deploying AI agents with YAML/JSON configuration and custom Python tools. Instrumentation wraps each agent call in an OpenTelemetry span exported directly to OpenObserve.

## **Prerequisites**

* Python 3.11+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An IBM Watsonx API key and URL
* An OpenAI API key (used as the underlying LLM provider in this example)

## **Installation**

```shell
pip install openobserve-telemetry-sdk ibm-watsonx-orchestrate python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
IBM_WATSONX_API_KEY=your-ibm-api-key
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
OPENAI_API_KEY=your-openai-api-key
```

## **Instrumentation**

Call `openobserve_init()` to set up the tracer provider. Wrap each agent invocation in a manual span to capture input and output attributes.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
from ibm_watsonx_orchestrate.agent_builder.agents import AgentBuilder
from ibm_watsonx_orchestrate.agent_builder.models import ModelConfig

tracer = trace.get_tracer(__name__)

model_config = ModelConfig(
    provider="openai",
    model_id="gpt-4o-mini",
    api_key=os.environ["OPENAI_API_KEY"],
)

agent_builder = AgentBuilder(
    ibm_api_key=os.environ["IBM_WATSONX_API_KEY"],
    ibm_url=os.environ["IBM_WATSONX_URL"],
    model_config=model_config,
)

with tracer.start_as_current_span("watsonx_orchestrate.invoke") as span:
    span.set_attribute("watsonx.input", "What is distributed tracing?")
    result = agent_builder.invoke("What is distributed tracing?")
    output = result.get("output", str(result))
    span.set_attribute("watsonx.output_length", len(str(output)))
    span.set_attribute("span_status", "OK")

print(output)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `watsonx_input` | The prompt passed to the agent |
| `watsonx_output_length` | Character length of the agent response |
| `span_status` | `OK` or `ERROR` |
| `error_message` | Error detail on failures |
| `duration` | End-to-end agent invocation latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by operation name `watsonx_orchestrate.invoke` to see all agent calls
3. Click any span to inspect input, output length, and latency
4. Filter by `span_status` `ERROR` to find failed invocations

![Watsonx Orchestrate ADK traces in OpenObserve](../../../images/integration/ai/watsonx-orchestrate-adk.png)

## **Next Steps**

With Watsonx Orchestrate ADK instrumented, every agent run is recorded in OpenObserve. From here you can track latency per agent configuration, monitor error rates, and set alerts when agent invocations fail.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
