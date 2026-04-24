---
title: Milvus
description: Instrument Milvus vector database operations and send traces to OpenObserve via OpenTelemetry.
---

# **Milvus → OpenObserve**

Capture latency, collection name, and result counts for every Milvus vector search, insert, and delete operation in your AI pipeline. Milvus does not expose OTel traces from the Python SDK, so instrumentation uses manual OpenTelemetry spans that wrap each operation.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A Milvus instance — local server (`docker run -p 19530:19530 milvusdb/milvus:latest standalone`), Milvus Lite (embedded, no server needed), or [Zilliz Cloud](https://zilliz.com/)

## **Installation**

```shell
pip install openobserve-telemetry-sdk "pymilvus==2.5.1" milvus-lite opentelemetry-api python-dotenv
```

Milvus Lite requires `pymilvus==2.5.1`. For a remote Milvus server or Zilliz Cloud, any recent `pymilvus` version works.

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
```

For a remote Milvus server or Zilliz Cloud, also add:

```
MILVUS_URI=https://your-cluster-id.api.gcp-us-west1.zillizcloud.com
MILVUS_TOKEN=your-api-key
```

## **Instrumentation**

Call `openobserve_init()` **before** importing PyMilvus. Wrap each database operation in a `tracer.start_as_current_span()` block and record collection and result attributes.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import random
from pymilvus import MilvusClient

tracer = trace.get_tracer(__name__)

uri = os.environ.get("MILVUS_URI", "./milvus_data.db")
token = os.environ.get("MILVUS_TOKEN", "")
client = MilvusClient(uri=uri, token=token) if token else MilvusClient(uri=uri)

DIM = 128
COLLECTION = "my_vectors"

with tracer.start_as_current_span("milvus.create_collection") as span:
    span.set_attribute("milvus.collection", COLLECTION)
    span.set_attribute("milvus.dim", DIM)
    if client.has_collection(COLLECTION):
        client.drop_collection(COLLECTION)
    client.create_collection(collection_name=COLLECTION, dimension=DIM)

with tracer.start_as_current_span("milvus.insert") as span:
    span.set_attribute("milvus.collection", COLLECTION)
    data = [{"id": i, "vector": [random.random() for _ in range(DIM)]} for i in range(100)]
    client.insert(collection_name=COLLECTION, data=data)
    span.set_attribute("milvus.insert_count", len(data))

with tracer.start_as_current_span("milvus.search") as span:
    span.set_attribute("milvus.collection", COLLECTION)
    query = [random.random() for _ in range(DIM)]
    results = client.search(collection_name=COLLECTION, data=[query], limit=10)
    span.set_attribute("milvus.result_count", len(results[0]))
    print(f"Top match distance: {results[0][0]['distance']:.4f}")

client.close()
```

## **What Gets Captured**

Each operation wrapped in a span produces the following attributes. OpenObserve stores dot-separated attribute names with underscores.

| Attribute (in OpenObserve) | Description |
| ----- | ----- |
| `operation_name` | Operation name (e.g. `milvus.search`, `milvus.insert`) |
| `milvus_collection` | The collection being queried or modified |
| `milvus_dim` | Vector dimension (on create) |
| `milvus_insert_count` | Number of vectors inserted |
| `milvus_result_count` | Number of search results returned |
| `duration` | End-to-end operation latency |
| `span_status` | `OK` on success, `ERROR` on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Filter by `operation_name = milvus.search` to see all search spans
3. Click any span to inspect `milvus_collection` and `milvus_result_count`
4. Sort by duration to identify slow queries, then tune indexing parameters

## **Next Steps**

With Milvus instrumented, every vector operation in your RAG pipeline is recorded in OpenObserve. From here you can track search latency per collection, monitor insert throughput, and correlate vector search spans with downstream LLM generation spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
