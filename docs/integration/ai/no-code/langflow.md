---
title: Langflow
description: Send Langflow workflow execution traces to OpenObserve via OpenTelemetry.
---

# **Langflow → OpenObserve**

Automatically capture flow execution spans, LLM calls, and component latency from your Langflow applications. Langflow is a visual Python workflow builder for LLM applications. It has built-in OpenTelemetry support that activates when OTLP environment variables are set.

## **Prerequisites**

* [Langflow](https://www.langflow.org/) self-hosted
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Configuration**

Set the following environment variables before starting Langflow:

```
LANGFLOW_OTEL_EXPORTER_TYPE=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=langflow
```

Replace `localhost:5080` with your OpenObserve host and update the Base64 token with your actual credentials.

Start Langflow with these variables:

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces \
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=" \
OTEL_SERVICE_NAME=langflow \
python -m langflow run
```

## **What Gets Captured**

Each flow run emits spans for every component in the visual canvas:

| Attribute | Description |
| ----- | ----- |
| `langflow.flow_id` | The flow being executed |
| `langflow.component_id` | Individual component ID |
| `langflow.component_type` | Component type: `ChatOpenAI`, `ChromaDB`, `PromptTemplate`, etc. |
| `llm_model_name` | Model used by LLM components |
| `llm_token_count_prompt` | Prompt tokens |
| `llm_token_count_completion` | Completion tokens |
| `duration` | Component execution latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name` `langflow` to isolate Langflow traces
3. Click a trace to see the component execution order
4. Filter by `langflow.component_type` to compare different component types

## **Sending a Test Request**

After configuring tracing, trigger a flow run via the API:

```python
import os
import requests
import uuid

resp = requests.post(
    f"http://localhost:7860/api/v1/run/{os.environ['LANGFLOW_FLOW_ID']}",
    headers={"Content-Type": "application/json"},
    json={
        "input_value": "Explain distributed tracing in one sentence.",
        "output_type": "chat",
        "input_type": "chat",
        "session_id": str(uuid.uuid4()),
    },
)
print(resp.json())
```

## **Next Steps**

With Langflow traces in OpenObserve, you can monitor component execution order, track LLM token usage, and alert on flow errors.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
- [Alerts](../../../user-guide/analytics/alerts/)
