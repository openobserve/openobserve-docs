---
title: n8n
description: Send n8n workflow execution traces to OpenObserve via OpenTelemetry.
---

# **n8n → OpenObserve**

Automatically capture workflow execution spans, node timings, and error events from your n8n automations. n8n is a self-hosted workflow automation platform with native OpenTelemetry metrics support. Activate it by setting environment variables before starting n8n.

## **Prerequisites**

* [n8n](https://n8n.io/) self-hosted
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Configuration**

Set the following environment variables before starting the n8n process:

```
N8N_METRICS=true
N8N_METRICS_PREFIX=n8n_
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:5080/api/default/v1/metrics
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=n8n
```

Replace `localhost:5080` with your OpenObserve host and update the Base64 token with your actual credentials.

Start n8n with these variables:

```shell
N8N_METRICS=true \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces \
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=" \
OTEL_SERVICE_NAME=n8n \
n8n start
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `n8n.workflow_id` | The workflow being executed |
| `n8n.workflow_name` | Human-readable workflow name |
| `n8n.execution_id` | Unique execution identifier |
| `n8n.node_type` | Node type: `n8n-nodes-base.openAi`, `n8n-nodes-base.httpRequest`, etc. |
| `n8n.node_name` | Human-readable node label |
| `duration` | Node and workflow execution latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name` `n8n` to isolate n8n traces
3. Click a workflow execution trace to see the node timing breakdown
4. Filter by `n8n.node_type` containing `openAi` to find AI-specific nodes

## **Triggering a Test Workflow**

After configuring tracing, trigger a webhook-based workflow:

```python
import requests
import os

resp = requests.post(
    f"http://localhost:5678/webhook/{os.environ['N8N_WEBHOOK_ID']}",
    headers={"Content-Type": "application/json"},
    json={"message": "Explain distributed tracing."},
)
print(resp.status_code, resp.text)
```

## **Next Steps**

With n8n traces in OpenObserve, you can monitor workflow execution time, track individual node latency, and set alerts on failed executions.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Metrics Ingestion](../../../ingestion/metrics/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
