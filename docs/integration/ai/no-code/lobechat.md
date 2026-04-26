---
title: LobeChat
description: Instrument LobeChat chat completion calls and send traces to OpenObserve via OpenTelemetry.
---

# **LobeChat → OpenObserve**

Capture per-request latency and status codes for every chat completion sent through LobeChat's API. LobeChat is a self-hosted ChatGPT-like application with plugin support and a built-in model gateway. Instrumentation wraps LobeChat's HTTP API in manual OpenTelemetry spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A running [LobeChat](https://github.com/lobehub/lobe-chat) instance

## **Installation**

```shell
pip install openobserve-telemetry-sdk opentelemetry-api requests python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
LOBECHAT_BASE_URL=http://localhost:3210
LOBECHAT_ACCESS_CODE=your-access-code
```

To capture native LobeChat OTLP traces, set these environment variables when starting LobeChat:

```
OTEL_ENABLED=1
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.openobserve.ai/api/your_org_id/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your_base64_token>
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each LobeChat chat request in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

base_url = os.environ.get("LOBECHAT_BASE_URL", "http://localhost:3210")
access_code = os.environ.get("LOBECHAT_ACCESS_CODE", "")

headers = {"Content-Type": "application/json"}
if access_code:
    headers["x-lobe-access-code"] = access_code

def chat(question: str):
    with tracer.start_as_current_span("lobechat.chat_completion") as span:
        span.set_attribute("lobechat.question", question[:100])
        resp = requests.post(
            f"{base_url}/api/chat/openai",
            headers=headers,
            json={
                "messages": [{"role": "user", "content": question}],
                "model": "gpt-4o-mini",
                "max_tokens": 200,
                "stream": False,
            },
            timeout=30,
        )
        resp.raise_for_status()
        span.set_attribute("lobechat.status_code", resp.status_code)
        span.set_attribute("span_status", "OK")
        return resp.json()

result = chat("What is distributed tracing?")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `lobechat.question` | The user's question (truncated to 100 chars) |
| `lobechat.status_code` | HTTP status code from LobeChat API |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | Chat completion request latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `lobechat.chat_completion` to see all chat requests
3. Filter by `span_status` `ERROR` to find failed completions
4. Sort by duration to identify the slowest responses

## **Next Steps**

With LobeChat instrumented, every chat completion is recorded in OpenObserve. From here you can monitor response latency, track error rates, and set up alerts when the API becomes unavailable.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
