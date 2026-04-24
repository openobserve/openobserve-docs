---
title: Qwen (Alibaba DashScope)
description: Instrument Qwen model calls via Alibaba DashScope and send traces to OpenObserve via OpenTelemetry.
---

# **Qwen → OpenObserve**

Automatically capture token usage, latency, and model metadata for every Qwen inference call in your Python application. Alibaba DashScope exposes an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at the DashScope endpoint.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An [Alibaba Cloud](https://www.alibabacloud.com/) account with DashScope enabled and an API key

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
# OpenObserve instance URL
# Default for self-hosted: http://localhost:5080
OPENOBSERVE_URL=https://api.openobserve.ai/

# Your OpenObserve organisation slug or ID
OPENOBSERVE_ORG=your_org_id

# Basic auth token — Base64-encoded "email:password"
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>

# Alibaba DashScope API key
DASHSCOPE_API_KEY=your-dashscope-api-key
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at the DashScope international endpoint and pass your DashScope API key.

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
    api_key=os.environ["DASHSCOPE_API_KEY"],
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

response = client.chat.completions.create(
    model="qwen-turbo",
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

The international endpoint (`dashscope-intl.aliyuncs.com`) requires an Alibaba Cloud international account. If your account was created on the China portal, use `dashscope.aliyuncs.com/compatible-mode/v1` instead.

## **Available Models**

| Model | Speed | Notes |
| ----- | ----- | ----- |
| `qwen-turbo` | Fastest | Best for high-volume, cost-sensitive workloads |
| `qwen-plus` | Balanced | Higher quality than Turbo |
| `qwen-max` | Highest quality | Slower and more expensive |

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model name (e.g. `qwen-turbo`) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `llm_system` | `openai` (the client library used) |
| `openinference_span_kind` | `LLM` |
| `duration` | End-to-end request latency |
| `error` | Exception details if the request failed |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts and the full request payload
3. Filter by `llm_model_name` to compare `qwen-turbo` vs `qwen-plus` latency and cost side by side

## **Next Steps**

With Qwen instrumented, every inference call is recorded in OpenObserve. From here you can benchmark Qwen model tiers, track token consumption, and set alerts on error spans from failed requests.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
