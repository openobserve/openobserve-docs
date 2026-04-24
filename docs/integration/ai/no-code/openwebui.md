---
title: Open WebUI
description: Send Open WebUI chat traces to OpenObserve via OpenTelemetry.
---

# **Open WebUI → OpenObserve**

Automatically capture chat completion spans, model calls, and RAG pipeline steps from your Open WebUI instance. Open WebUI is a self-hosted, feature-rich interface for local and cloud LLMs. It exposes an OpenAI-compatible API and supports OpenTelemetry tracing via environment variables.

## **Prerequisites**

* [Open WebUI](https://openwebui.com/) self-hosted
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Configuration**

Set the following environment variables before starting Open WebUI:

```
ENABLE_OPENTELEMETRY=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=openwebui
```

Replace `localhost:5080` with your OpenObserve host and update the Base64 token with your actual credentials.

Start Open WebUI with these variables:

```shell
ENABLE_OPENTELEMETRY=true \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces \
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=" \
OTEL_SERVICE_NAME=openwebui \
docker run -d -p 3000:8080 ghcr.io/open-webui/open-webui:main
```

Or when using the Python package:

```shell
ENABLE_OPENTELEMETRY=true ... open-webui serve
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `openwebui.model` | The model selected for the chat session |
| `openwebui.chat_id` | Unique chat session identifier |
| `llm_token_count_prompt` | Prompt tokens sent to the model |
| `llm_token_count_completion` | Completion tokens returned |
| `duration` | End-to-end chat completion latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name` `openwebui` to isolate Open WebUI traces
3. Click a trace to see the full completion request including model and token counts
4. Filter by `openwebui.model` to compare different models

## **Sending a Test Request**

After configuring tracing, send a completion via the Open WebUI API:

```python
import os
import requests

resp = requests.post(
    "http://localhost:3000/api/chat/completions",
    headers={
        "Authorization": f"Bearer {os.environ['OPENWEBUI_API_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Explain distributed tracing in one sentence."}],
        "max_tokens": 100,
    },
)
print(resp.json()["choices"][0]["message"]["content"])
```

## **Next Steps**

With Open WebUI traces in OpenObserve, you can monitor chat response latency, track token usage per model, and set alerts on failed requests.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
- [Alerts](../../../user-guide/analytics/alerts/)
