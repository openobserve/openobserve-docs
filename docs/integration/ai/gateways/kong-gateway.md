---
title: Kong AI Gateway
description: Instrument Kong AI Gateway calls and send traces to OpenObserve via OpenTelemetry.
---

# **Kong AI Gateway → OpenObserve**

Automatically capture token usage, latency, and model metadata for every request routed through the Kong AI Gateway. Kong exposes an OpenAI-compatible proxy endpoint, so instrumentation uses the standard OpenAI instrumentor pointed at your Kong instance.

## **Prerequisites**

* Python 3.8+
* Kong Gateway running with the AI Proxy plugin configured (see [Kong AI Gateway docs](https://docs.konghq.com/hub/kong-inc/ai-proxy/))
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

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
KONG_GATEWAY_URL=http://localhost:8000/openai/v1
KONG_API_KEY=your-kong-consumer-key
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at your Kong AI Gateway route.

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
    api_key=os.environ.get("KONG_API_KEY", ""),
    base_url=os.environ.get("KONG_GATEWAY_URL", "http://localhost:8000/openai/v1"),
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
| `llm_model_name` | Model name routed by Kong (e.g. `gpt-4o-mini`) |
| `llm_system` | `openai` (the client library used) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `ChatCompletion` |
| `duration` | End-to-end request latency including Kong proxy overhead |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts, model, and latency
3. Use `duration` to measure Kong Gateway proxy overhead

## **Next Steps**

With Kong AI Gateway instrumented, every proxied request is recorded in OpenObserve. From here you can monitor latency per route, enforce rate-limit visibility, and set alerts on error rates.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
