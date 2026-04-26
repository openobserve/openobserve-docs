---
title: Weco
description: Instrument Weco AI optimization runs and send traces to OpenObserve via OpenTelemetry.
---

# **Weco → OpenObserve**

Capture optimization run IDs, task descriptions, and status for every Weco AI run. Weco is an AI-driven autoresearch platform that iteratively optimizes prompts, code, and model parameters against any target metric. Instrumentation uses manual OpenTelemetry spans wrapping Weco REST API calls.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Weco](https://weco.ai/) API key
* An OpenAI API key

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai opentelemetry-api requests python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
WECO_API_KEY=your-weco-api-key
WECO_PROJECT_ID=your-project-id
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` and `openobserve_init()` **before** making API calls. Wrap each Weco optimization call in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

OpenAIInstrumentor().instrument()
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

api_key = os.environ["WECO_API_KEY"]
project_id = os.environ.get("WECO_PROJECT_ID", "")
BASE_URL = "https://api.weco.ai/v1"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

def optimize(prompt: str):
    with tracer.start_as_current_span("weco.optimize") as span:
        span.set_attribute("weco.prompt", prompt[:100])
        if project_id:
            span.set_attribute("weco.project_id", project_id)
        payload = {"prompt": prompt, "model": "gpt-4o-mini", "objective": "maximize_quality"}
        if project_id:
            payload["project_id"] = project_id
        resp = requests.post(f"{BASE_URL}/optimize", headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        span.set_attribute("weco.run_id", str(data.get("id", "")))
        span.set_attribute("weco.status", str(data.get("status", "")))
        span.set_attribute("span_status", "OK")
        return data

result = optimize("Explain distributed tracing in one sentence.")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `weco.prompt` | The optimization prompt (truncated to 100 chars) |
| `weco.project_id` | The Weco project ID (when configured) |
| `weco.run_id` | Unique identifier for the optimization run |
| `weco.status` | Run status returned by the API |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | API call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `weco.optimize` to see all optimization runs
3. Filter by `span_status` `ERROR` to find failed requests
4. Sort by duration to identify slow optimization calls

## **Next Steps**

With Weco instrumented, every optimization run is recorded in OpenObserve. From here you can track run latency trends, monitor error rates, and correlate optimization performance with specific prompt types or project IDs.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
