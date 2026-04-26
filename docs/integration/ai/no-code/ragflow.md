---
title: RAGFlow
description: Instrument RAGFlow retrieval calls and send traces to OpenObserve via OpenTelemetry.
---

# **RAGFlow → OpenObserve**

Capture latency, query text, and retrieved chunk counts for every RAGFlow retrieval and chat request. RAGFlow is a self-hosted RAG engine with advanced document parsing and agentic reasoning. Instrumentation uses manual OpenTelemetry spans wrapping RAGFlow REST API calls.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* [RAGFlow](https://ragflow.io/) self-hosted and at least one dataset with documents indexed

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
RAGFLOW_BASE_URL=http://localhost
RAGFLOW_API_KEY=your-ragflow-api-key
```

## **Instrumentation**

Call `openobserve_init()` **before** making any RAGFlow API requests. Wrap each retrieval call in a `tracer.start_as_current_span()` block.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import requests

tracer = trace.get_tracer(__name__)

BASE_URL = os.environ.get("RAGFLOW_BASE_URL", "http://localhost")
headers = {
    "Authorization": f"Bearer {os.environ['RAGFLOW_API_KEY']}",
    "Content-Type": "application/json",
}

def retrieve(query: str, dataset_ids: list, top_k: int = 5):
    with tracer.start_as_current_span("ragflow.retrieve") as span:
        span.set_attribute("ragflow.query", query)
        span.set_attribute("ragflow.dataset_count", len(dataset_ids))
        span.set_attribute("ragflow.top_k", top_k)
        resp = requests.post(
            f"{BASE_URL}/api/v1/retrieval",
            headers=headers,
            json={"question": query, "dataset_ids": dataset_ids, "top_k": top_k},
        )
        resp.raise_for_status()
        chunks = resp.json().get("data", {}).get("chunks", [])
        span.set_attribute("ragflow.chunk_count", len(chunks))
        return chunks

chunks = retrieve("What is OpenObserve?", dataset_ids=["your-dataset-id"])
for chunk in chunks:
    print(chunk.get("content_with_weight", "")[:100])
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `ragflow.query` | The retrieval query string |
| `ragflow.dataset_count` | Number of datasets searched |
| `ragflow.top_k` | Number of chunks requested |
| `ragflow.chunk_count` | Number of chunks returned |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed requests |
| `duration` | End-to-end retrieval latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `ragflow.retrieve` to see all retrieval calls
3. Click a span to inspect the query and how many chunks were returned
4. Sort by duration to identify slow retrievals and optimise chunking strategy

## **Next Steps**

With RAGFlow instrumented, every retrieval call is recorded in OpenObserve. From here you can monitor retrieval latency, track chunk counts per query, and correlate retrieval spans with downstream LLM generation spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
