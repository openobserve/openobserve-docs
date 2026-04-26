---
title: vLLM
description: Instrument vLLM inference calls and send traces to OpenObserve via OpenTelemetry.
---

# **vLLM → OpenObserve**

Automatically capture token usage, latency, and model metadata for every vLLM inference call. vLLM serves an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at your local vLLM server.

## **Prerequisites**

* Python 3.8+
* vLLM server running locally (see [vLLM docs](https://docs.vllm.ai/))
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai python-dotenv
```

## **Configuration**

Start vLLM with a model of your choice:

```shell
vllm serve Qwen/Qwen2.5-7B-Instruct --port 8000
```

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
VLLM_BASE_URL=http://localhost:8000/v1
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Point the client at your vLLM server.

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
    api_key="not-needed",
    base_url=os.environ.get("VLLM_BASE_URL", "http://localhost:8000/v1"),
)

models = client.models.list()
model_name = models.data[0].id

response = client.chat.completions.create(
    model=model_name,
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model loaded in vLLM (e.g. `Qwen/Qwen2.5-7B-Instruct`) |
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
3. Use `llm_model_name` to identify which model handled each request

## **Next Steps**

With vLLM instrumented, every inference call is recorded in OpenObserve. From here you can measure throughput, compare latency across models, and monitor GPU utilisation alongside trace data.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
