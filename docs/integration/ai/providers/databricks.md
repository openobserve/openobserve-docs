---
title: Databricks
description: Instrument Databricks Model Serving calls and send traces to OpenObserve via OpenTelemetry.
---

# **Databricks → OpenObserve**

Automatically capture token usage, latency, and model metadata for every call to Databricks Model Serving endpoints. Databricks Model Serving exposes an OpenAI-compatible API, so instrumentation uses the standard OpenAI instrumentor pointed at your workspace serving endpoint.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Databricks](https://www.databricks.com/) workspace with at least one Model Serving endpoint enabled
* A Databricks personal access token

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
DATABRICKS_HOST=https://adb-1234567890123456.7.azuredatabricks.net
DATABRICKS_TOKEN=dapiXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DATABRICKS_MODEL=databricks-meta-llama-3-1-70b-instruct
```

`DATABRICKS_HOST` is your workspace URL. `DATABRICKS_MODEL` is either a Foundation Model API endpoint name (e.g. `databricks-dbrx-instruct`) or a custom serving endpoint name.

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` **before** creating the OpenAI client. Authenticate with your Databricks personal access token and point the client at the workspace serving endpoint.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

OpenAIInstrumentor().instrument()
openobserve_init()

import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["DATABRICKS_TOKEN"],
    base_url=f"{os.environ['DATABRICKS_HOST'].rstrip('/')}/serving-endpoints",
)

response = client.chat.completions.create(
    model=os.environ.get("DATABRICKS_MODEL", "databricks-meta-llama-3-1-70b-instruct"),
    messages=[{"role": "user", "content": "Explain distributed tracing in one sentence."}],
)
print(response.choices[0].message.content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Databricks model or endpoint name |
| `llm_system` | `openai` (the client library used) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `ChatCompletion` |
| `duration` | End-to-end request latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts and latency
3. Filter by `llm_model_name` to compare Foundation Model API endpoints

## **Next Steps**

With Databricks Model Serving instrumented, every inference call is recorded in OpenObserve. From here you can monitor latency per endpoint, track token costs, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
