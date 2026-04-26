---
title: Zapier
description: Instrument Zapier NLA action calls and send traces to OpenObserve via OpenTelemetry.
---

# **Zapier → OpenObserve**

Capture latency, action IDs, and status codes for every Zapier Natural Language Actions (NLA) API call in your AI application. Zapier NLA lets AI agents perform actions across 5000+ apps. Instrumentation uses manual OpenTelemetry spans wrapping each API request.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Zapier NLA](https://nla.zapier.com/) API key

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
ZAPIER_NLA_API_KEY=your-zapier-nla-api-key
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each Zapier action preview or execute call in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

headers = {
    "X-API-Key": os.environ["ZAPIER_NLA_API_KEY"],
    "Content-Type": "application/json",
}
BASE_URL = "https://nla.zapier.com/api/v1"

def list_actions():
    with tracer.start_as_current_span("zapier.list_actions") as span:
        resp = requests.get(f"{BASE_URL}/exposed/", headers=headers, timeout=15)
        resp.raise_for_status()
        actions = resp.json().get("results", [])
        span.set_attribute("zapier.action_count", len(actions))
        span.set_attribute("span_status", "OK")
        return actions

def preview_action(action_id: str, instructions: str):
    with tracer.start_as_current_span("zapier.action_preview") as span:
        span.set_attribute("zapier.action_id", action_id)
        span.set_attribute("zapier.instructions", instructions[:200])
        resp = requests.post(
            f"{BASE_URL}/exposed/{action_id}/execute/",
            headers=headers,
            json={"instructions": instructions, "preview_only": True},
            timeout=15,
        )
        span.set_attribute("zapier.status_code", resp.status_code)
        span.set_attribute("span_status", "OK" if resp.ok else "ERROR")
        return resp.json()

actions = list_actions()
if actions:
    result = preview_action(actions[0]["id"], "Send a test message")
    print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `zapier.action_id` | The Zapier action being executed |
| `zapier.instructions` | Natural language instructions passed to the action |
| `zapier.action_count` | Number of exposed actions (on list calls) |
| `zapier.status_code` | HTTP response status code |
| `span_status` | `OK` or error status |
| `duration` | API call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name prefix `zapier.` to see all Zapier API calls
3. Filter by `span_status` `ERROR` to find failed action calls
4. Sort by duration to identify slow actions

## **Next Steps**

With Zapier instrumented, every AI agent action call is recorded in OpenObserve. From here you can monitor action latency, track which actions are used most often, and set alerts on failed executions.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
