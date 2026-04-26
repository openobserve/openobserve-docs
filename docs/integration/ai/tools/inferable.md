---
title: Inferable
description: Instrument Inferable AI agent runs and send traces to OpenObserve via OpenTelemetry.
---

# **Inferable → OpenObserve**

Capture run creation latency, prompt metadata, and result status for every Inferable agent run. Inferable is an AI agent infrastructure platform that orchestrates tool-using LLM agents. Instrumentation uses manual OpenTelemetry spans wrapping Inferable REST API calls.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An [Inferable](https://inferable.ai/) cluster secret

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
INFERABLE_API_SECRET=your-inferable-cluster-secret
```

## **Instrumentation**

Call `openobserve_init()` **before** making API calls. Wrap each run creation and polling call in manual spans.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import time
import requests

tracer = trace.get_tracer(__name__)

headers = {
    "Authorization": f"Bearer {os.environ['INFERABLE_API_SECRET']}",
    "Content-Type": "application/json",
}
BASE_URL = "https://api.inferable.ai"

def create_run(prompt: str) -> str:
    with tracer.start_as_current_span("inferable.create_run") as span:
        span.set_attribute("inferable.prompt", prompt[:200])
        resp = requests.post(
            f"{BASE_URL}/runs",
            headers=headers,
            json={
                "initialPrompt": prompt,
                "resultSchema": {
                    "type": "object",
                    "properties": {"answer": {"type": "string"}},
                },
            },
            timeout=30,
        )
        resp.raise_for_status()
        run_id = resp.json().get("id", "")
        span.set_attribute("inferable.run_id", run_id)
        span.set_attribute("span_status", "OK")
        return run_id

def get_run_result(run_id: str):
    with tracer.start_as_current_span("inferable.get_run") as span:
        span.set_attribute("inferable.run_id", run_id)
        resp = requests.get(f"{BASE_URL}/runs/{run_id}", headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        span.set_attribute("inferable.status", data.get("status", ""))
        span.set_attribute("span_status", "OK")
        return data

run_id = create_run("Explain distributed tracing in one sentence.")
print(f"Run created: {run_id}")
time.sleep(5)
result = get_run_result(run_id)
print(result.get("result", {}).get("answer", ""))
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `inferable.prompt` | The initial prompt sent to the agent |
| `inferable.run_id` | Unique run identifier |
| `inferable.status` | Run status: `pending`, `running`, `done`, `failed` |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | API call latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name prefix `inferable.` to see all agent API calls
3. Click a `create_run` span to inspect the prompt and run ID
4. Filter by `inferable.status` `failed` to find failed runs

## **Next Steps**

With Inferable instrumented, every agent run is recorded in OpenObserve. From here you can monitor run creation latency, track status distributions, and alert on failed runs.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
