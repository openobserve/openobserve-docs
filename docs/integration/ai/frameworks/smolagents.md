---
title: SmolAgents
description: Instrument HuggingFace SmolAgents and send traces to OpenObserve via OpenTelemetry.
---

# **SmolAgents → OpenObserve**

Automatically capture agent runs, tool executions, code generation steps, and LLM calls for every SmolAgents workflow in your Python application.

## **Prerequisites**

* Python 3.10+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key or a HuggingFace token for the model backend

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-smolagents "smolagents[litellm]" python-dotenv
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
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>

# LLM provider key (whichever model backend the agent uses)
OPENAI_API_KEY=your-openai-key
```

## **Instrumentation**

Call `SmolagentsInstrumentor().instrument()` **before** importing SmolAgents.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.smolagents import SmolagentsInstrumentor
from openobserve import openobserve_init

SmolagentsInstrumentor().instrument()
openobserve_init()

import os
from smolagents import CodeAgent, LiteLLMModel

model = LiteLLMModel(
    model_id="openai/gpt-4o-mini",
    api_key=os.environ["OPENAI_API_KEY"],
)
agent = CodeAgent(tools=[], model=model)

result = agent.run("What is the square root of 144?")
print(result)
```

### Tool use

```python
from smolagents import CodeAgent, LiteLLMModel, tool

@tool
def get_current_time() -> str:
    """Returns the current UTC time."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

agent = CodeAgent(tools=[get_current_time], model=model)
result = agent.run("What time is it right now in UTC?")
print(result)
```

## **What Gets Captured**

Each `agent.run()` call produces a root `AGENT` span with child `LLM` spans for every model call, and `TOOL` spans when tools are invoked.

**LLM span**

| Attribute | Description |
| ----- | ----- |
| `openinference_span_kind` | `LLM` |
| `operation_name` | `LiteLLMModel.generate` |
| `llm_model_name` | Model used (e.g. `openai/gpt-4o-mini`) |
| `llm_provider` | `openai` |
| `llm_system` | `openai` |
| `llm_observation_type` | `GENERATION` |
| `llm_token_count_prompt` | Input token count |
| `llm_token_count_completion` | Output token count |
| `llm_token_count_total` | Total tokens consumed |
| `llm_usage_tokens_input` | Input tokens (numeric) |
| `llm_usage_tokens_output` | Output tokens (numeric) |
| `llm_usage_cost_input` | Estimated input cost in USD |
| `llm_usage_cost_output` | Estimated output cost in USD |
| `gen_ai_response_model` | Model that handled the request |
| `duration` | Span latency |
| `span_status` | `OK` on success, `ERROR` on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Click any root agent span to open the waterfall view
3. Expand the tree to see child `LiteLLMModel.generate` LLM spans per reasoning step
4. Filter by `llm_model_name` to compare token usage across different model backends

## **Next Steps**

With SmolAgents instrumented, every agent run is recorded in OpenObserve with a full span hierarchy. From here you can track token consumption per agent task, measure tool execution latency, and monitor multi-step reasoning chains.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
