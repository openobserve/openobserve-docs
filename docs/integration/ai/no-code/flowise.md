---
title: Flowise
description: Send Flowise chatflow execution traces to OpenObserve via OpenTelemetry.
---

# **Flowise → OpenObserve**

Automatically capture chatflow execution spans, LLM calls, and tool invocations from your Flowise applications. Flowise is an open-source drag-and-drop LLM flow builder built on LangChain. Instrument it by configuring the LangChain OTLP exporter environment variables when starting Flowise.

## **Prerequisites**

* [Flowise](https://flowiseai.com/) self-hosted
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Configuration**

Set the following environment variables before starting the Flowise process:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=flowise
```

Replace `localhost:5080` with your OpenObserve host and update the Base64 token with your actual credentials.

Start Flowise with these variables set:

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces \
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=" \
OTEL_SERVICE_NAME=flowise \
npx flowise start
```

## **What Gets Captured**

Each chatflow prediction emits a trace with spans for every LangChain component:

| Attribute | Description |
| ----- | ----- |
| `langchain.request.model` | The LLM model used in the chatflow |
| `langchain.request.type` | Request type: `llm`, `chain`, `tool`, `retriever` |
| `llm_token_count_prompt` | Prompt tokens |
| `llm_token_count_completion` | Completion tokens |
| `duration` | Span execution latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name` `flowise` to isolate Flowise traces
3. Click a trace to see the full chatflow execution tree
4. Filter by `langchain.request.type` `llm` to focus on model calls

## **Sending a Test Request**

After configuring tracing, trigger a chatflow prediction:

```python
import os
import requests

resp = requests.post(
    f"http://localhost:3000/api/v1/prediction/{os.environ['FLOWISE_CHATFLOW_ID']}",
    headers={"Content-Type": "application/json"},
    json={"question": "Explain distributed tracing in one sentence."},
)
print(resp.json().get("text", ""))
```

## **Next Steps**

With Flowise traces in OpenObserve, you can monitor chatflow latency, compare different flow designs, and set alerts on prediction failures.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [LangChain](../frameworks/langchain.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
