---
title: LiteLLM Proxy
description: Instrument LiteLLM Proxy calls and send traces to OpenObserve via OpenTelemetry.
---

# **LiteLLM Proxy → OpenObserve**

Automatically capture token usage, latency, and model metadata for every request routed through the LiteLLM Proxy. The proxy serves an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at your local proxy.

## **Prerequisites**

* Python 3.8+
* LiteLLM Proxy running locally (see [LiteLLM docs](https://docs.litellm.ai/docs/proxy/quick_start))
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai python-dotenv
```

## **Configuration**

Start the LiteLLM proxy with a model of your choice:

```shell
litellm --model gpt-4o-mini --port 4000
```

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
LITELLM_PROXY_URL=http://localhost:4000
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at your LiteLLM proxy.

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
    api_key=os.environ.get("LITELLM_PROXY_API_KEY", "not-needed"),
    base_url=os.environ.get("LITELLM_PROXY_URL", "http://localhost:4000"),
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model routed by the proxy (e.g. `gpt-4o-mini`) |
| `llm_system` | `openai` (the client library used) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `ChatCompletion` |
| `duration` | End-to-end request latency including proxy overhead |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts, model, and latency
3. Use `llm_model_name` to identify which model the proxy routed to

## **Next Steps**

With LiteLLM Proxy instrumented, every proxied request is recorded in OpenObserve. From here you can compare latency and token usage across models routed by the proxy, monitor fallback behaviour, and set alerts on error rates.

## **Read More**

- [LiteLLM SDK](../frameworks/litellm.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
