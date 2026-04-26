---
title: Vapi
description: Instrument Vapi voice AI API calls and send traces to OpenObserve via OpenTelemetry.
---

# **Vapi → OpenObserve**

Capture latency, call status, and assistant metadata for every Vapi API call in your voice AI application. Vapi is a platform for building phone and web voice agents. Instrumentation uses manual OpenTelemetry spans wrapping Vapi REST API calls and webhook handler logic.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Vapi](https://vapi.ai/) account and private API key

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
VAPI_API_KEY=your-vapi-private-api-key
```

## **Instrumentation**

### Instrumenting REST API calls

Wrap Vapi API calls in manual spans to capture request latency and response status.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

VAPI_BASE = "https://api.vapi.ai"
headers = {
    "Authorization": f"Bearer {os.environ['VAPI_API_KEY']}",
    "Content-Type": "application/json",
}

def create_assistant(name: str, first_message: str):
    with tracer.start_as_current_span("vapi.create_assistant") as span:
        span.set_attribute("vapi.assistant_name", name)
        resp = requests.post(f"{VAPI_BASE}/assistant", headers=headers, json={
            "name": name,
            "firstMessage": first_message,
            "model": {"provider": "openai", "model": "gpt-4o-mini"},
            "voice": {"provider": "playht", "voiceId": "jennifer"},
        })
        resp.raise_for_status()
        assistant_id = resp.json()["id"]
        span.set_attribute("vapi.assistant_id", assistant_id)
        span.set_attribute("vapi.status_code", resp.status_code)
        return assistant_id

assistant_id = create_assistant("ObsBot", "Hello! How can I assist you?")
print(f"Created: {assistant_id}")
```

### Instrumenting webhook handlers

Wrap incoming webhook events in spans to trace call lifecycle events.

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/vapi-webhook", methods=["POST"])
def webhook():
    event = request.json
    with tracer.start_as_current_span("vapi.webhook_event") as span:
        span.set_attribute("vapi.event_type", event.get("type", "unknown"))
        span.set_attribute("vapi.call_id", event.get("call", {}).get("id", ""))
        span.set_attribute("vapi.assistant_id", event.get("call", {}).get("assistantId", ""))
        return jsonify({"status": "ok"})
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `vapi.assistant_name` | Name of the voice assistant |
| `vapi.assistant_id` | Unique assistant resource ID |
| `vapi.status_code` | HTTP status code of the API response |
| `vapi.event_type` | Webhook event type: `call-started`, `call-ended`, `transcript`, etc. |
| `vapi.call_id` | Unique call session identifier |
| `span_status` | `OK` or error status |
| `duration` | API call or webhook handler latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name prefix `vapi.` to see all Vapi spans
3. Filter by `vapi.event_type` to isolate specific call events
4. Sort by duration to find slow assistant creation or call setup

## **Next Steps**

With Vapi instrumented, every API call and webhook event in your voice AI application is recorded in OpenObserve. From here you can monitor call setup latency, track assistant usage, and alert on failed calls.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
