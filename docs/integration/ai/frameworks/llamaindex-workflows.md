---
title: LlamaIndex Workflows
description: Instrument LlamaIndex Workflows and send traces to OpenObserve via OpenTelemetry.
---

# **LlamaIndex Workflows → OpenObserve**

Automatically capture step-by-step execution spans for every LlamaIndex Workflow run. LlamaIndex Workflows are event-driven, step-based pipelines built on top of the LlamaIndex core. The OpenInference LlamaIndex instrumentor covers the workflow execution path, emitting spans for each step and any LLM calls within them.

## **Prerequisites**

* Python 3.9+ (use `llama-index-core==0.10.68` for Python 3.9 compatibility)
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-llama-index \
  "llama-index-core==0.10.68" "llama-index-llms-openai==0.1.31" \
  python-dotenv
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

Call `LlamaIndexInstrumentor().instrument()` **before** importing LlamaIndex components. Define your workflow steps normally.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.llama_index import LlamaIndexInstrumentor
from openobserve import openobserve_init

LlamaIndexInstrumentor().instrument()
openobserve_init()

import os
import asyncio
from llama_index.core.workflow import Workflow, StartEvent, StopEvent, step, Event
from llama_index.llms.openai import OpenAI

class QuestionEvent(Event):
    question: str

class QAWorkflow(Workflow):
    @step
    async def start(self, ev: StartEvent) -> QuestionEvent:
        return QuestionEvent(question=ev.get("question", "What is AI?"))

    @step
    async def answer(self, ev: QuestionEvent) -> StopEvent:
        llm = OpenAI(model="gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])
        response = await llm.acomplete(f"Answer briefly: {ev.question}")
        return StopEvent(result=str(response))

async def main():
    workflow = QAWorkflow(timeout=30, verbose=False)
    result = await workflow.run(question="Explain distributed tracing in one sentence.")
    print(result)

asyncio.run(main())
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `openinference_span_kind` | `CHAIN` for the workflow root, `LLM` for model calls within steps |
| `workflow_name` | The workflow class name |
| `step_name` | The name of the executing step handler |
| `llm_model_name` | Model used inside LLM steps |
| `llm_token_count_prompt` | Prompt tokens consumed |
| `llm_token_count_completion` | Completion tokens returned |
| `input_value` | Input event data |
| `output_value` | Step or workflow output |
| `duration` | Latency per step and for the full workflow |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each workflow run appears as a root span with child spans per step
3. Expand the trace to see the step execution order and which step called the LLM
4. Filter by `workflow_name` to compare different workflow designs

## **Next Steps**

With LlamaIndex Workflows instrumented, every pipeline run is recorded in OpenObserve. From here you can monitor step latency, track token usage per step, and identify slow or failing steps.

## **Read More**

- [LlamaIndex](llamaindex.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
