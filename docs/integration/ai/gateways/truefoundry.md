---
title: Truefoundry
description: Instrument Truefoundry inference endpoints and send traces to OpenObserve via OpenTelemetry.
---

# **Truefoundry → OpenObserve**

Automatically capture token usage, latency, and model metadata for every request to Truefoundry's AI inference endpoints. Truefoundry exposes OpenAI-compatible endpoints, so instrumentation uses the standard OpenAI instrumentor.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Truefoundry](https://www.truefoundry.com/) API key and a deployed model endpoint

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
TRUEFOUNDRY_API_KEY=your-truefoundry-api-key
TRUEFOUNDRY_BASE_URL=https://llm-gateway.truefoundry.com/api/inference/openai
TRUEFOUNDRY_MODEL=llama-3.1-8b-instruct
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at your Truefoundry inference endpoint.

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
    api_key=os.environ["TRUEFOUNDRY_API_KEY"],
    base_url=os.environ["TRUEFOUNDRY_BASE_URL"],
)

response = client.chat.completions.create(
    model=os.environ.get("TRUEFOUNDRY_MODEL", "llama-3.1-8b-instruct"),
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model deployed on Truefoundry |
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
3. Filter by `llm_model_name` to compare different models deployed on Truefoundry

## **Next Steps**

With Truefoundry instrumented, every inference call is recorded in OpenObserve. From here you can monitor latency per model deployment, track token usage, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
