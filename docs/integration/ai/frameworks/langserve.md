---
title: LangServe
description: Instrument LangServe applications and send traces to OpenObserve via OpenTelemetry.
---

# **LangServe → OpenObserve**

Automatically trace every remote chain invocation when calling a LangServe-hosted API. LangServe uses LangChain under the hood, so the same LangChain instrumentor captures calls made via `RemoteRunnable`.

## **Prerequisites**

* Python 3.8+
* A running LangServe server (see [LangServe docs](https://python.langchain.com/docs/langserve/))
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Installation**

```shell
pip install openobserve-telemetry-sdk opentelemetry-instrumentation-langchain langserve python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
LANGSERVE_URL=http://localhost:8000
```

## **Instrumentation**

Call `LangchainInstrumentor().instrument()` **before** importing or instantiating `RemoteRunnable`.

```python
from dotenv import load_dotenv
load_dotenv()

from opentelemetry.instrumentation.langchain import LangchainInstrumentor
from openobserve import openobserve_init

LangchainInstrumentor().instrument()
openobserve_init()

import os
from langserve import RemoteRunnable

chain = RemoteRunnable(f"{os.environ.get('LANGSERVE_URL', 'http://localhost:8000')}/chain/")

result = chain.invoke({"input": "What is OpenTelemetry?"})
print(result)
```

### Starting a minimal LangServe server

```python
from fastapi import FastAPI
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langserve import add_routes

app = FastAPI()
llm = ChatOpenAI(model="gpt-4o-mini")
prompt = ChatPromptTemplate.from_template("Answer in one sentence: {input}")
chain = prompt | llm | StrOutputParser()
add_routes(app, chain, path="/chain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `langchain_request_type` | `chain` for the remote runnable call |
| `gen_ai_request_model` | Model used by the server-side chain |
| `gen_ai_usage_input_tokens` | Input tokens consumed |
| `gen_ai_usage_output_tokens` | Output tokens generated |
| `llm_usage_cost_input` | Estimated input cost in USD |
| `llm_usage_cost_output` | Estimated output cost in USD |
| `duration` | End-to-end request latency |
| `error` | Exception details on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Click any root span to see the remote chain execution
3. Inspect token counts and latency for each server-side LLM call

## **Next Steps**

With LangServe instrumented, every remote chain call is recorded in OpenObserve. From here you can monitor API latency, track token usage per endpoint, and alert on error rates.

## **Read More**

- [LangChain](langchain.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
