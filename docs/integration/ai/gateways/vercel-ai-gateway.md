---
title: Vercel AI Gateway
description: Instrument Vercel AI Gateway calls and send traces to OpenObserve via OpenTelemetry.
---

# **Vercel AI Gateway → OpenObserve**

Automatically capture token usage, latency, and model metadata for every request routed through Vercel AI Gateway. The gateway exposes an OpenAI-compatible endpoint, so instrumentation uses the standard OpenAI instrumentor pointed at your Vercel AI Gateway URL.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A Vercel account with AI Gateway enabled, or a Vercel AI Gateway URL
* An API key for the underlying provider (e.g. OpenAI)

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
VERCEL_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_id>/openai
VERCEL_AI_GATEWAY_KEY=your-provider-api-key
VERCEL_AI_GATEWAY_MODEL=gpt-4o-mini
```

`VERCEL_AI_GATEWAY_URL` is your gateway base URL. The trailing provider path (e.g. `/openai`) selects which provider the gateway proxies to.

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at the Vercel AI Gateway URL.

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
    api_key=os.environ["VERCEL_AI_GATEWAY_KEY"],
    base_url=os.environ["VERCEL_AI_GATEWAY_URL"],
)

response = client.chat.completions.create(
    model=os.environ.get("VERCEL_AI_GATEWAY_MODEL", "gpt-4o-mini"),
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model name as requested via the gateway |
| `llm_system` | `openai` (the client library used) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `ChatCompletion` |
| `duration` | End-to-end gateway request latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts, model, and latency
3. Filter by `llm_model_name` to compare models routed through the same gateway

## **Next Steps**

With Vercel AI Gateway instrumented, every proxied inference call is recorded in OpenObserve. From here you can compare latency across providers, track token usage, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [OpenRouter](openrouter.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
