---
title: Hugging Face Inference API
description: Instrument Hugging Face Inference API calls and send traces to OpenObserve via OpenTelemetry.
---

# **Hugging Face Inference API → OpenObserve**

Automatically capture token usage, latency, and model metadata for every Hugging Face serverless inference call in your Python application. The Hugging Face Inference API exposes an OpenAI-compatible endpoint, so instrumentation uses the standard OpenAI instrumentor pointed at the Hugging Face endpoint.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Hugging Face](https://huggingface.co/settings/tokens) access token (`read` scope is sufficient)

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

# Hugging Face access token
HF_TOKEN=hf_your_token_here
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Use the full Hugging Face Hub model ID as the model string.

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
    api_key=os.environ["HF_TOKEN"],
    base_url="https://api-inference.huggingface.co/v1",
)

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
    max_tokens=100,
)
print(response.choices[0].message.content)
```

The model string is the full Hugging Face Hub model ID (e.g. `Qwen/Qwen2.5-7B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.3`). Only models that support the serverless inference endpoint work with this API — check the model page on the Hub for the "Inference API" badge. Some models (such as gated Llama variants) require you to accept the model's license on the Hub before your token will be authorised.

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Full Hub model ID (e.g. `Qwen/Qwen2.5-7B-Instruct`) |
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
3. Filter by `llm_model_name` to compare latency across different open-source models

## **Next Steps**

With the Hugging Face Inference API instrumented, every serverless inference call is recorded in OpenObserve. From here you can compare open-source model performance, track token consumption, and monitor error rates caused by rate limits or missing model access.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
