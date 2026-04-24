---
title: Portkey
description: Instrument Portkey gateway calls and send traces to OpenObserve via OpenTelemetry.
---

# **Portkey → OpenObserve**

Automatically capture token usage, latency, and model metadata for every request routed through the Portkey AI gateway. Portkey exposes an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at the Portkey endpoint.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Portkey](https://portkey.ai/) API key and a configured provider

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
PORTKEY_API_KEY=your-portkey-api-key
OPENAI_API_KEY=your-openai-api-key
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Pass the Portkey API key and provider routing headers.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

OpenAIInstrumentor().instrument()
openobserve_init()

import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["PORTKEY_API_KEY"],
    base_url="https://api.portkey.ai/v1",
    default_headers={
        "x-portkey-api-key": os.environ["PORTKEY_API_KEY"],
        "x-portkey-provider": "openai",
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
    },
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

### Using Portkey virtual keys

If you have configured virtual keys in Portkey, you can use them instead of passing provider credentials directly:

```python
client = OpenAI(
    api_key=os.environ["PORTKEY_API_KEY"],
    base_url="https://api.portkey.ai/v1",
    default_headers={
        "x-portkey-api-key": os.environ["PORTKEY_API_KEY"],
        "x-portkey-virtual-key": os.environ["PORTKEY_VIRTUAL_KEY"],
    },
)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model name (e.g. `gpt-4o-mini`) |
| `llm_system` | `openai` (the client library used) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `ChatCompletion` |
| `duration` | End-to-end request latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts, model, and latency
3. Use `llm_model_name` to compare different providers routed through Portkey

## **Next Steps**

With Portkey instrumented, every routed request is recorded in OpenObserve. From here you can compare latency and cost across providers, monitor fallback behaviour, and set alerts on error rates.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
