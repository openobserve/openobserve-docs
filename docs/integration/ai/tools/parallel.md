---
title: Parallel
description: Instrument Parallel AI task runs and send traces to OpenObserve via OpenTelemetry.
---

# **Parallel → OpenObserve**

Capture task IDs, status, and latency for every Parallel AI workflow execution. Parallel is a platform for running AI tasks and workflows at scale. Instrumentation uses manual OpenTelemetry spans wrapping Parallel REST API calls.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Parallel](https://parallel.ai/) API key

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
PARALLEL_API_KEY=your-parallel-api-key
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each Parallel task submission in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

api_key = os.environ["PARALLEL_API_KEY"]
BASE_URL = "https://api.parallel.ai/v1"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

def run_task(task: str):
    with tracer.start_as_current_span("parallel.run_task") as span:
        span.set_attribute("parallel.task", task[:100])
        resp = requests.post(
            f"{BASE_URL}/tasks",
            headers=headers,
            json={"task": task, "model": "gpt-4o-mini"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        span.set_attribute("parallel.task_id", str(data.get("id", "")))
        span.set_attribute("parallel.status", str(data.get("status", "")))
        span.set_attribute("span_status", "OK")
        return data

result = run_task("Explain distributed tracing in one sentence.")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `parallel.task` | The task description (truncated to 100 chars) |
| `parallel.task_id` | Unique identifier for the submitted task |
| `parallel.status` | Task status returned by the API |
| `parallel.status_code` | HTTP status code on error responses |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | API call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `parallel.run_task` to see all task submissions
3. Filter by `span_status` `ERROR` to find failed requests
4. Sort by duration to identify slow task submissions

## **Next Steps**

With Parallel instrumented, every task run is recorded in OpenObserve. From here you can monitor task submission latency, track status distributions, and set up alerts on failed task executions.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
