---
title: BytePlus
description: Instrument BytePlus AI model calls and send traces to OpenObserve via OpenTelemetry.
---

# **BytePlus → OpenObserve**

Automatically capture token usage, latency, and model metadata for every BytePlus AI inference call in your Python application. BytePlus AI (powered by VolcEngine) exposes an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at the BytePlus endpoint.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [BytePlus](https://www.byteplus.com/) or [VolcEngine](https://www.volcengine.com/) API key and a deployed model endpoint

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
BYTEPLUS_API_KEY=your-byteplus-api-key
BYTEPLUS_MODEL=doubao-pro-4k
```

`BYTEPLUS_MODEL` is either a model alias (e.g. `doubao-pro-4k`) or a deployed endpoint ID in the format `ep-xxxxxxxxxxxxxxxx-xxxxx`.

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at the BytePlus API endpoint.

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
    api_key=os.environ["BYTEPLUS_API_KEY"],
    base_url="https://ark.ap-southeast.bytepluses.com/api/v3",
)

response = client.chat.completions.create(
    model=os.environ.get("BYTEPLUS_MODEL", "doubao-pro-4k"),
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model name or endpoint ID |
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
2. Click any span to inspect token counts and latency
3. Filter by `llm_model_name` to compare deployed BytePlus model variants

## **Next Steps**

With BytePlus instrumented, every inference call is recorded in OpenObserve. From here you can monitor throughput, track token usage, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
