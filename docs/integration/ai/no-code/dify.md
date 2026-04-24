---
title: Dify
description: Send Dify LLM application traces to OpenObserve via OpenTelemetry.
---

# **Dify → OpenObserve**

Automatically capture workflow execution traces, LLM calls, tool uses, and retrieval steps from your Dify applications. Dify has built-in tracing integration that can export OpenTelemetry-compatible data to OpenObserve.

## **Prerequisites**

* [Dify](https://dify.ai/) self-hosted (Community Edition) or Dify Cloud
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Configuration**

### Self-hosted Dify

Set the following environment variables before starting the Dify Docker stack:

```
DIFY_TRACING_ENABLED=true
DIFY_TRACING_PROVIDER=otlp
DIFY_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
DIFY_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
```

Replace `localhost:5080` with your OpenObserve host and update the Base64 token with your actual credentials.

### Dify Cloud

In the Dify Cloud dashboard:

1. Go to **Settings > Monitoring**
2. Select **Tracing** and click **Configure**
3. Choose **Custom OTLP**
4. Set the endpoint to `https://api.openobserve.ai/api/<your_org_id>/v1/traces`
5. Add the header `Authorization: Basic <your_base64_token>`
6. Click **Save**

## **What Gets Captured**

Once configured, every workflow run emits spans for each step:

| Attribute | Description |
| ----- | ----- |
| `dify.workflow_id` | The workflow being executed |
| `dify.node_type` | Node type: `llm`, `tool`, `retriever`, `agent`, `code` |
| `dify.node_title` | Human-readable node name from the workflow canvas |
| `llm_model_name` | LLM model used in LLM nodes |
| `llm_token_count_prompt` | Prompt tokens for LLM nodes |
| `llm_token_count_completion` | Completion tokens for LLM nodes |
| `duration` | Node execution latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `dify.workflow_id` to isolate a specific application
3. Expand a trace to see the step-by-step node execution tree
4. Filter by `dify.node_type` `llm` to focus on model calls

## **Sending a Test Request**

After configuring tracing, trigger a workflow run from the Dify playground or via the API:

```python
import os
import requests

resp = requests.post(
    "http://localhost/v1/chat-messages",
    headers={
        "Authorization": f"Bearer {os.environ['DIFY_APP_KEY']}",
        "Content-Type": "application/json",
    },
    json={
        "inputs": {},
        "query": "Explain distributed tracing in one sentence.",
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "test-user",
    },
)
print(resp.json().get("answer", ""))
```

## **Next Steps**

With Dify traces in OpenObserve, you can monitor workflow execution time, track per-node latency, and set alerts on failed workflow runs.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
- [Alerts](../../../user-guide/analytics/alerts/)
