---
title: BeeAI
description: Instrument BeeAI agent runs and send traces to OpenObserve via OpenTelemetry.
---

# **BeeAI → OpenObserve**

Automatically capture agent workflow spans, tool calls, and LLM interactions for every BeeAI agent run. BeeAI (from IBM Research) has built-in OpenTelemetry support that exports traces to any OTLP-compatible backend when the appropriate environment variables are set.

## **Prerequisites**

* Python 3.10+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key (or another BeeAI-supported LLM backend)

## **Installation**

```shell
pip install beeai-framework openai python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=beeai-app
```

BeeAI reads the standard `OTEL_EXPORTER_OTLP_*` environment variables and automatically exports traces when they are set. Replace the Base64 token and endpoint with your actual OpenObserve credentials.

## **Instrumentation**

No explicit `instrument()` call is needed. Import BeeAI normally and the OTLP exporter is configured via environment variables.

```python
from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from beeai_framework.agents.react import ReActAgent
from beeai_framework.backend.openai import OpenAIChatModel
from beeai_framework.memory import UnconstrainedMemory

model = OpenAIChatModel("gpt-4o-mini")

async def main():
    agent = ReActAgent(llm=model, tools=[], memory=UnconstrainedMemory())
    response = await agent.run("Explain distributed tracing in one sentence.")
    print(response.result.text)

asyncio.run(main())
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `openinference_span_kind` | `AGENT` for the root agent run, `LLM` for model calls |
| `llm_model_name` | Model used (e.g. `gpt-4o-mini`) |
| `llm_token_count_prompt` | Tokens in the prompt |
| `llm_token_count_completion` | Tokens in the response |
| `agent_name` | Name of the BeeAI agent class |
| `input_value` | The user prompt sent to the agent |
| `output_value` | The agent's final response |
| `duration` | Latency of each span |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each agent run appears as a root `AGENT` span with child LLM spans for each reasoning step
3. Expand the trace to see how many reasoning turns the agent took before producing a final answer
4. Filter by `agent_name` to compare different agent configurations

## **Next Steps**

With BeeAI instrumented, every agent run is recorded in OpenObserve. From here you can monitor multi-step reasoning, track tool call frequency, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
