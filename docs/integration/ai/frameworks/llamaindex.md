---
title: LlamaIndex
description: Instrument LlamaIndex queries and send traces to OpenObserve via OpenTelemetry.
---

# **LlamaIndex → OpenObserve**

Automatically capture query, retrieve, and LLM spans for every LlamaIndex pipeline run. The OpenInference LlamaIndex instrumentor wraps query engines, retrievers, and chat engines to emit structured OTLP traces directly to OpenObserve.

## **Prerequisites**

* Python 3.9+ (use `llama-index==0.10.x` for Python 3.9 compatibility)
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key (or another LlamaIndex-supported LLM)

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-llama-index \
  "llama-index-core==0.10.68" "llama-index==0.10.68" "llama-index-llms-openai==0.1.31" \
  python-dotenv
```

Pin `llama-index` to `0.10.x` on Python 3.9. Later versions use `X | Y` union syntax that requires Python 3.10+.

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
```

## **Instrumentation**

Call `LlamaIndexInstrumentor().instrument()` **before** importing LlamaIndex components. This patches the core query engine, retriever, and LLM call paths.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.llama_index import LlamaIndexInstrumentor
from openobserve import openobserve_init

LlamaIndexInstrumentor().instrument()
openobserve_init()

import os
from llama_index.core import VectorStoreIndex, Document
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings

Settings.llm = OpenAI(model="gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])

documents = [
    Document(text="OpenObserve is an observability platform for logs, metrics, and traces."),
    Document(text="OpenTelemetry is a vendor-neutral standard for collecting telemetry data."),
]
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

response = query_engine.query("What is OpenObserve?")
print(response)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `openinference_span_kind` | `CHAIN` for the query engine, `RETRIEVER` for the retriever, `LLM` for the model call |
| `llm_model_name` | Model used for synthesis (e.g. `gpt-4o-mini`) |
| `llm_token_count_prompt` | Tokens in the synthesized prompt |
| `llm_token_count_completion` | Tokens in the response |
| `retrieval_documents` | Retrieved document chunks (text and scores) |
| `input_value` | The query string |
| `output_value` | The synthesized answer |
| `duration` | Latency of each span |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each query appears as a root span (`CHAIN`) with child spans for retrieval and LLM synthesis
3. Expand the retriever span to inspect which document chunks were matched
4. Filter by `llm_model_name` to compare synthesis models

## **Next Steps**

With LlamaIndex instrumented, every query pipeline run is recorded in OpenObserve. From here you can monitor retrieval quality, track token usage across pipeline stages, and alert on slow retrieval spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
