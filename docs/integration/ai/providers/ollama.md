---
title: Ollama
description: Instrument Ollama calls and send traces to OpenObserve via OpenTelemetry.
---

# **Ollama → OpenObserve**

Automatically capture token usage, latency, and model metadata for every Ollama inference call in your Python application — no cloud API key required.

## **Prerequisites**

* Python 3.8+
* [Ollama](https://ollama.com/) running locally (default: `http://localhost:11434`)
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

Pull a model before running the examples:

```shell
ollama pull llama3.2
```

## **Installation**

```shell
pip install openobserve-telemetry-sdk opentelemetry-instrumentation-ollama ollama python-dotenv
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
OPENOBSERVE_AUTH_TOKEN="Basic <your_base64_token>"

# Ollama base URL (change if Ollama is running on a different host)
OLLAMA_HOST=http://localhost:11434
```

## **Instrumentation**

Call `OllamaInstrumentor().instrument()` **before** any Ollama client is created.

```python
from opentelemetry.instrumentation.ollama import OllamaInstrumentor
from openobserve import openobserve_init

# Instrument before importing the Ollama client
OllamaInstrumentor().instrument()
openobserve_init()

import ollama

# Chat completion
response = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response["message"]["content"])
```

### Streaming

```python
stream = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Write a haiku about observability."}],
    stream=True,
)
for chunk in stream:
    print(chunk["message"]["content"], end="", flush=True)
```

### Using the OpenAI-compatible endpoint

If you use Ollama's OpenAI-compatible API (`/v1/chat/completions`), instrument it with the OpenAI instrumentor instead:

```python
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init
from openai import OpenAI

OpenAIInstrumentor().instrument()
openobserve_init()

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

response = client.chat.completions.create(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `gen_ai_request_model` | Model name (e.g. `llama3.2`) |
| `gen_ai_usage_input_tokens` | Tokens in the prompt |
| `gen_ai_usage_output_tokens` | Tokens in the response |
| `llm_usage_tokens_total` | Total tokens consumed |
| `llm_usage_cost_input` | Estimated input cost in USD |
| `llm_usage_cost_output` | Estimated output cost in USD |
| `gen_ai_system` | `ollama` |
| `duration` | End-to-end request latency |
| `error` | Exception details if the request failed |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts and full request metadata
3. Use `gen_ai_request_model` to compare latency across different locally-hosted models

## **Next Steps**

With Ollama instrumented, every local inference call is automatically recorded in OpenObserve — no cloud API key required. From here you can compare token throughput across models, monitor latency for different prompt sizes, and benchmark locally-hosted models side by side.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
