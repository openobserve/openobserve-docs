---
title: Cognee
description: Instrument Cognee knowledge graph operations and send traces to OpenObserve via OpenTelemetry.
---

# **Cognee → OpenObserve**

Capture latency and result counts for every Cognee knowledge graph ingest and search operation. Cognee is a Python framework that builds structured knowledge graphs from unstructured text for AI applications. Instrumentation uses manual OpenTelemetry spans wrapping each `add`, `cognify`, and `search` call.

## **Prerequisites**

* Python 3.9+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key (used by Cognee for embeddings and LLM reasoning)

## **Installation**

```shell
pip install openobserve-telemetry-sdk cognee opentelemetry-api python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
```

## **Instrumentation**

Call `openobserve_init()` **before** calling Cognee. Wrap each pipeline stage in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import asyncio
import cognee
from cognee import SearchType

tracer = trace.get_tracer(__name__)

cognee.config.set_llm_config({
    "llm_provider": "openai",
    "llm_model": "gpt-4o-mini",
    "llm_api_key": os.environ["OPENAI_API_KEY"],
})


async def main():
    with tracer.start_as_current_span("cognee.ingest") as span:
        await cognee.prune.prune_data()
        await cognee.add([
            "OpenObserve is an observability platform for logs, metrics, and traces.",
            "OpenTelemetry is a vendor-neutral standard for telemetry data.",
        ])
        await cognee.cognify()
        span.set_attribute("cognee.document_count", 2)

    with tracer.start_as_current_span("cognee.search") as span:
        query = "What is OpenObserve?"
        span.set_attribute("cognee.query", query)
        results = await cognee.search(SearchType.SUMMARIES, query)
        span.set_attribute("cognee.result_count", len(results))
        for r in results:
            print(r.get("text", r))


asyncio.run(main())
```

### Search types

Cognee supports three search types via the `SearchType` enum:

```python
from cognee import SearchType

# Return AI-generated summaries of matching documents
results = await cognee.search(SearchType.SUMMARIES, "What is RAG?")

# Return raw document chunks
results = await cognee.search(SearchType.CHUNKS, "What is RAG?")

# Return knowledge graph insights
results = await cognee.search(SearchType.INSIGHTS, "What is RAG?")
```

## **What Gets Captured**

Each operation wrapped in a span produces the following attributes. OpenObserve stores dot-separated attribute names with underscores.

| Attribute (in OpenObserve) | Description |
| ----- | ----- |
| `operation_name` | `cognee.search` or `cognee.ingest` |
| `cognee_query` | The search query string |
| `cognee_result_count` | Number of results returned |
| `cognee_document_count` | Number of documents ingested |
| `duration` | End-to-end operation latency |
| `span_status` | `OK` on success, `ERROR` on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Filter by `operation_name = cognee.search` to see all search spans
3. Click any span to inspect `cognee_query` and `cognee_result_count`
4. Sort by duration to identify slow ingest or search operations

## **Next Steps**

With Cognee instrumented, every knowledge graph operation in your AI pipeline is recorded in OpenObserve. From here you can monitor ingest throughput, track search latency, and correlate Cognee search spans with downstream LLM generation spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
