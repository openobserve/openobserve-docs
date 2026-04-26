---
title: Langdock
description: Instrument Langdock assistant API calls and send traces to OpenObserve via OpenTelemetry.
---

# **Langdock → OpenObserve**

Capture per-request latency, question text, and response lengths for every Langdock assistant chat call. Langdock is an enterprise AI workspace that provides assistants powered by multiple LLM providers. Instrumentation wraps Langdock's REST API in manual OpenTelemetry spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Langdock](https://langdock.com/) API key
* Optionally: a Langdock assistant ID

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
LANGDOCK_API_KEY=your-langdock-api-key
LANGDOCK_ASSISTANT_ID=your-assistant-id
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each Langdock chat request in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

api_key = os.environ["LANGDOCK_API_KEY"]
assistant_id = os.environ.get("LANGDOCK_ASSISTANT_ID", "")
BASE_URL = "https://api.langdock.com/assistant/v1"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

def chat(question: str):
    with tracer.start_as_current_span("langdock.chat") as span:
        span.set_attribute("langdock.question", question[:100])
        if assistant_id:
            span.set_attribute("langdock.assistant_id", assistant_id)
        payload = {"messages": [{"role": "user", "content": question}]}
        if assistant_id:
            payload["assistantId"] = assistant_id
        resp = requests.post(
            f"{BASE_URL}/chat",
            headers=headers,
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data.get("content", str(data))
        span.set_attribute("langdock.response_length", len(content))
        span.set_attribute("span_status", "OK")
        return content

result = chat("Explain distributed tracing in one sentence.")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `langdock.question` | The user's question (truncated to 100 chars) |
| `langdock.assistant_id` | The Langdock assistant ID (when configured) |
| `langdock.response_length` | Character count of the assistant's response |
| `langdock.status_code` | HTTP status code on error responses |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | API call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `langdock.chat` to see all assistant chat calls
3. Filter by `span_status` `ERROR` to find failed requests
4. Sort by duration to identify the slowest responses

## **Next Steps**

With Langdock instrumented, every assistant interaction is recorded in OpenObserve. From here you can monitor response latency, track usage by assistant ID, and set up alerts on failed API calls.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
