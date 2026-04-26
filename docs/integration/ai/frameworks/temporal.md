---
title: Temporal
description: Instrument Temporal durable workflows and send traces to OpenObserve via OpenTelemetry.
---

# **Temporal → OpenObserve**

Automatically capture workflow execution spans, activity calls, and retry events from every Temporal workflow run. Temporal is a durable execution platform that propagates OpenTelemetry trace context through workflow steps and activities. Enable the built-in OTel interceptor and configure it to export to OpenObserve.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* Temporal server running (`docker run --rm -p 7233:7233 temporalio/auto-setup`)

## **Installation**

```shell
pip install openobserve-telemetry-sdk temporalio opentelemetry-sdk \
  opentelemetry-exporter-otlp-proto-http python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
TEMPORAL_HOST=localhost:7233
```

## **Instrumentation**

Configure an OTLP tracer provider and pass `TracingInterceptor` to both the client and the worker. Temporal will then emit spans for every workflow and activity execution.

```python
from dotenv import load_dotenv
load_dotenv()

import os, asyncio
from datetime import timedelta
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

from temporalio import activity, workflow
from temporalio.client import Client
from temporalio.worker import Worker
from temporalio.contrib.opentelemetry import TracingInterceptor

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(
    endpoint=os.environ["OPENOBSERVE_URL"].rstrip("/") + "/api/" + os.environ["OPENOBSERVE_ORG"] + "/v1/traces",
    headers={"Authorization": os.environ["OPENOBSERVE_AUTH_TOKEN"]},
)))
trace.set_tracer_provider(provider)

@activity.defn
async def process(text: str) -> str:
    return f"Processed: {text[:30]}"

@workflow.defn
class TextWorkflow:
    @workflow.run
    async def run(self, text: str) -> str:
        return await workflow.execute_activity(
            process, text, start_to_close_timeout=timedelta(seconds=10)
        )

async def main():
    client = await Client.connect(
        os.environ.get("TEMPORAL_HOST", "localhost:7233"),
        interceptors=[TracingInterceptor()],
    )
    async with Worker(
        client,
        task_queue="oo-queue",
        workflows=[TextWorkflow],
        activities=[process],
        interceptors=[TracingInterceptor()],
    ):
        result = await client.execute_workflow(
            TextWorkflow.run,
            "Explain distributed tracing.",
            id="oo-test-1",
            task_queue="oo-queue",
        )
        print(result)

asyncio.run(main())
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `temporal_workflow_type` | The workflow class name |
| `temporal_activity_type` | The activity function name |
| `temporal_task_queue` | Task queue used for execution |
| `temporal_workflow_id` | Unique workflow execution ID |
| `temporal_run_id` | Run ID for this specific execution |
| `duration` | Workflow and activity execution latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each workflow execution appears as a root span with child activity spans
3. Filter by `temporal_workflow_type` to isolate a specific workflow
4. Retry attempts appear as sibling spans, making retry loops visible in the trace

## **Next Steps**

With Temporal instrumented, every durable workflow execution is recorded in OpenObserve. From here you can monitor activity latency, track retry counts, and alert on workflow failures.

## **Read More**

- [Restate](restate.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
