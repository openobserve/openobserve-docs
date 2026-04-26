---
title: Restate
description: Instrument Restate durable workflows and send traces to OpenObserve via OpenTelemetry.
---

# **Restate → OpenObserve**

Automatically capture durable execution spans for every Restate workflow invocation. Restate is a durable execution platform that propagates OpenTelemetry trace context through workflow steps, retries, and side-effects. Configure the Restate server to export OTLP traces to OpenObserve and every workflow run becomes a structured, searchable trace.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* Restate server running (Docker image: `restatedev/restate`)

## **Installation**

```shell
pip install restate-sdk python-dotenv
```

Start the Restate server with OTLP tracing enabled:

```shell
docker run --rm \
  -p 8080:8080 \
  -p 9070:9070 \
  -e RESTATE_OBSERVABILITY__TRACING__ENDPOINT=http://host.docker.internal:5080/api/default/v1/traces \
  -e RESTATE_OBSERVABILITY__TRACING__HEADERS="Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=" \
  restatedev/restate
```

Replace the Base64 token with your actual OpenObserve auth token.

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
RESTATE_INGRESS_URL=http://localhost:8080
RESTATE_ADMIN_URL=http://localhost:9070
```

## **Instrumentation**

Define Restate services normally. Trace context propagates automatically through durable handlers, sleeps, and side-effects.

```python
from dotenv import load_dotenv
load_dotenv()

import asyncio
import restate
from restate import Context, Service

svc = Service("AISummariser")

@svc.handler()
async def summarise(ctx: Context, text: str) -> str:
    await ctx.sleep(0.01)
    return f"Summary: {text[:50]}"

app = restate.app(services=[svc])
```

Run with `hypercorn`:

```shell
pip install hypercorn
python -m hypercorn app:app --bind 0.0.0.0:9080
```

Register the service with Restate and invoke it:

```shell
curl -X POST http://localhost:9070/deployments \
  -H 'Content-Type: application/json' \
  -d '{"uri": "http://host.docker.internal:9080"}'

curl -X POST http://localhost:8080/AISummariser/summarise \
  -H 'Content-Type: application/json' \
  -d '"Explain observability in AI applications."'
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `rpc_service` | The Restate service name (e.g. `AISummariser`) |
| `rpc_method` | The handler name (e.g. `summarise`) |
| `restate_invocation_id` | Unique identifier for the durable invocation |
| `restate_invocation_target` | Full handler path |
| `duration` | Total handler execution time including retries |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each service invocation appears as a root span with child spans for sleeps, side-effects, and nested calls
3. Filter by `rpc_service` to isolate a specific Restate service
4. Retry spans appear as siblings in the same trace, making retry loops visible

## **Next Steps**

With Restate instrumented, every durable workflow invocation is recorded in OpenObserve. From here you can trace multi-step workflows, monitor retry counts, and alert on handler failures.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
