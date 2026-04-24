---
title: Cohere
description: Instrument Cohere LLM calls and send traces to OpenObserve via OpenTelemetry.
---

# **Cohere → OpenObserve**

Capture token usage, latency, and model metadata for every Cohere inference call. The Cohere SDK does not have a dedicated OTel instrumentor, so traces are created by wrapping calls in manual spans and extracting usage data from the response.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Cohere](https://dashboard.cohere.com/) API key

## **Installation**

```shell
pip install openobserve-telemetry-sdk cohere python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
COHERE_API_KEY=your-cohere-api-key
```

## **Instrumentation**

Call `openobserve_init()` to set up the tracer provider, then wrap each Cohere call in a manual span and extract token counts from the response metadata.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

import os
from opentelemetry import trace
import cohere

tracer = trace.get_tracer(__name__)
co = cohere.Client(api_key=os.environ["COHERE_API_KEY"])


def chat(message: str, model: str = "command-r") -> str:
    with tracer.start_as_current_span("cohere.chat") as span:
        span.set_attribute("llm_model_name", model)
        span.set_attribute("input_value", message)
        response = co.chat(model=model, message=message)
        output = response.text
        span.set_attribute("output_value", output[:200])
        if hasattr(response, "meta") and response.meta and response.meta.tokens:
            span.set_attribute("llm_token_count_prompt", response.meta.tokens.input_tokens or 0)
            span.set_attribute("llm_token_count_completion", response.meta.tokens.output_tokens or 0)
        return output


result = chat("Explain distributed tracing in one sentence.")
print(result)
```

## **What Gets Captured**

Each `co.chat()` call wrapped in a span produces the following attributes.

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model used (e.g. `command-r`) |
| `input_value` | Prompt sent to the model |
| `output_value` | First 200 characters of the response |
| `llm_token_count_prompt` | Input tokens consumed |
| `llm_token_count_completion` | Output tokens generated |
| `duration` | End-to-end span latency |
| `error` | Exception details on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by operation name `cohere.chat` to find Cohere spans
3. Click any span to inspect token counts and the prompt and response

## **Next Steps**

With Cohere instrumented, every chat call is recorded in OpenObserve. From here you can track token usage per model, monitor latency, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
