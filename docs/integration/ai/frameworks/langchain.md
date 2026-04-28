---
title: LangChain / LangGraph
description: Instrument LangChain and LangGraph applications and send traces to OpenObserve via OpenTelemetry.
---

# **LangChain / LangGraph → OpenObserve**

Automatically trace every chain execution, LLM call, tool invocation, and retrieval step in your LangChain or LangGraph application.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**

## **Installation**

```shell
pip install openobserve-telemetry-sdk opentelemetry-instrumentation-langchain python-dotenv
```

For LangGraph applications, also install LangGraph:

```shell
pip install langgraph
```

## **Configuration**

Create a `.env` file in your project root:

```
# OpenObserve instance URL
# Default for self-hosted: http://localhost:5080
OPENOBSERVE_URL=https://api.openobserve.ai/

# Your OpenObserve organisation slug or ID
OPENOBSERVE_ORG=your_org_id

# Basic auth token — Base64-encoded "email:password"
OPENOBSERVE_AUTH_TOKEN="Basic <your_base64_token>"

# LLM provider key (whichever backend LangChain is calling)
OPENAI_API_KEY=your-openai-key
```

## **Instrumentation**

Call `LangchainInstrumentor().instrument()` **before** importing any LangChain modules to ensure all chains, agents, and tools are captured automatically.

### LangChain

```python
from opentelemetry.instrumentation.langchain import LangchainInstrumentor
from openobserve import openobserve_init

LangchainInstrumentor().instrument()
openobserve_init()

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("user", "{question}"),
])

chain = prompt | llm | StrOutputParser()

response = chain.invoke({"question": "What is OpenTelemetry?"})
print(response)
```

### LangGraph

LangGraph builds on LangChain, so the same instrumentor covers graph executions, node transitions, and all nested LLM calls.

```python
from opentelemetry.instrumentation.langchain import LangchainInstrumentor
from openobserve import openobserve_init

LangchainInstrumentor().instrument()
openobserve_init()

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

llm = ChatOpenAI(model="gpt-4o")

class State(TypedDict):
    messages: list

def call_model(state: State):
    response = llm.invoke(state["messages"])
    return {"messages": state["messages"] + [response]}

graph = StateGraph(State)
graph.add_node("model", call_model)
graph.set_entry_point("model")
graph.add_edge("model", END)
app = graph.compile()

result = app.invoke({"messages": [{"role": "user", "content": "Hello!"}]})
print(result["messages"][-1].content)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `langchain_request_type` | Span type: `llm`, `chain`, `tool`, `retriever` |
| `gen_ai_request_model` | Model name (e.g. `gpt-4o`) |
| `gen_ai_usage_input_tokens` | Input tokens consumed |
| `gen_ai_usage_output_tokens` | Output tokens generated |
| `llm_usage_tokens_total` | Total tokens |
| `llm_usage_cost_input` | Estimated input cost in USD |
| `llm_usage_cost_output` | Estimated output cost in USD |
| `llm_usage_cost_total` | Estimated total cost in USD |
| `langchain_retriever_query` | Query sent to a retriever |
| `langchain_tool_name` | Name of the tool invoked |
| `duration` | End-to-end span latency |
| `error` | Exception details on failure |

Each chain invocation produces a root span with child spans for every nested LLM call, tool use, and retrieval step.

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Click any root span to expand the full chain execution tree
3. Inspect token counts, latency, and retriever results at each step

## **Next Steps**

With LangChain instrumented, every chain execution is automatically recorded in OpenObserve — including all nested LLM calls, tool invocations, and retrieval steps. From here you can visualise the full execution tree, track token usage per chain run, and identify latency bottlenecks across your pipeline.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
