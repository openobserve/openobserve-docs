---
title: LibreChat
description: Instrument LibreChat API calls and send traces to OpenObserve via OpenTelemetry.
---

# **LibreChat → OpenObserve**

Capture per-request latency, endpoint, and status codes for every message sent through LibreChat's API. LibreChat is a self-hosted ChatGPT alternative that supports multiple LLM providers including OpenAI, Anthropic, and Ollama. Instrumentation wraps LibreChat's HTTP API in manual OpenTelemetry spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A running [LibreChat](https://www.librechat.ai/) instance
* A LibreChat user JWT token (obtained by logging in)

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
LIBRECHAT_BASE_URL=http://localhost:3080
LIBRECHAT_USER_JWT=your-librechat-jwt-token
LIBRECHAT_ENDPOINT=openAI
```

To capture native LibreChat OTLP traces, set these environment variables when starting LibreChat:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.openobserve.ai/api/your_org_id/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your_base64_token>
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each LibreChat message request in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

base_url = os.environ.get("LIBRECHAT_BASE_URL", "http://localhost:3080")
jwt_token = os.environ["LIBRECHAT_USER_JWT"]
endpoint = os.environ.get("LIBRECHAT_ENDPOINT", "openAI")

headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json",
}

def ask(question: str):
    with tracer.start_as_current_span("librechat.ask") as span:
        span.set_attribute("librechat.endpoint", endpoint)
        span.set_attribute("librechat.question", question[:100])
        resp = requests.post(
            f"{base_url}/api/ask/{endpoint}",
            headers=headers,
            json={
                "text": question,
                "model": "gpt-4o-mini",
                "endpoint": endpoint,
                "sender": "User",
                "isCreatedByUser": True,
            },
            timeout=30,
        )
        resp.raise_for_status()
        span.set_attribute("librechat.status_code", resp.status_code)
        span.set_attribute("span_status", "OK")
        return resp.json()

result = ask("What is distributed tracing?")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `librechat.endpoint` | The provider endpoint (e.g. `openAI`, `anthropic`) |
| `librechat.question` | The user's message (truncated to 100 chars) |
| `librechat.status_code` | HTTP status code from LibreChat API |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | Request latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `librechat.ask` to see all message requests
3. Filter by `librechat.endpoint` to compare latency across providers
4. Filter by `span_status` `ERROR` to find failed requests

## **Next Steps**

With LibreChat instrumented, every API call is recorded in OpenObserve. From here you can monitor latency per provider endpoint, track error rates, and set up alerts when requests fail.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
