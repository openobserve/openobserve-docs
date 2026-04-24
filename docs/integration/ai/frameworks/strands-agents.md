---
title: Strands Agents
description: Instrument Strands Agents applications and send traces to OpenObserve via OpenTelemetry.
---

# **Strands Agents → OpenObserve**

Capture agent run timing, token usage, and tool calls for every Strands Agents invocation. Strands Agents does not include a dedicated OTel instrumentor, so traces are created by wrapping agent calls in manual spans.

## **Prerequisites**

* Python 3.10+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An Anthropic API key (or AWS credentials for Bedrock)

## **Installation**

```shell
pip install openobserve-telemetry-sdk strands-agents strands-agents-tools python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## **Instrumentation**

Call `openobserve_init()` to set up the tracer provider, then wrap each agent call in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
from strands import Agent
from strands.models.anthropic import AnthropicModel

tracer = trace.get_tracer(__name__)

model = AnthropicModel(model_id="claude-haiku-4-5-20251001")
agent = Agent(model=model)


def run_agent(prompt: str) -> str:
    with tracer.start_as_current_span("strands.agent") as span:
        span.set_attribute("input_value", prompt)
        response = agent(prompt)
        output = str(response)
        span.set_attribute("output_value", output[:200])
        return output


print(run_agent("What is OpenTelemetry?"))
```

### Agent with tools

```python
from strands import tool

@tool
def get_current_time() -> str:
    """Return the current UTC time."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

agent_with_tools = Agent(model=model, tools=[get_current_time])

with tracer.start_as_current_span("strands.agent") as span:
    span.set_attribute("input_value", "What time is it?")
    response = agent_with_tools("What time is it?")
    span.set_attribute("output_value", str(response)[:200])
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `input_value` | Prompt passed to the agent |
| `output_value` | First 200 characters of the agent response |
| `duration` | End-to-end agent run latency |
| `error` | Exception details on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by operation name `strands.agent` to find agent spans
3. Click any span to inspect the prompt, response, and run latency

## **Next Steps**

With Strands Agents instrumented, every agent run is recorded in OpenObserve. From here you can track latency per prompt type, monitor error rates, and set alerts on failed runs.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Anthropic (Python)](../providers/anthropic.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
