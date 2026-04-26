---
title: mcp-use
description: Instrument mcp-use MCP agent calls and send traces to OpenObserve via OpenTelemetry.
---

# **mcp-use → OpenObserve**

Capture agent run latency, tool call counts, and MCP server interactions for every mcp-use agent invocation. mcp-use is a Python library that connects LLM agents to Model Context Protocol (MCP) servers. Instrumentation uses manual OpenTelemetry spans wrapping each agent run.

## **Prerequisites**

* Python 3.10+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* Node.js installed (for running MCP servers via `npx`)
* An OpenAI API key (or another LangChain-supported LLM)

## **Installation**

```shell
pip install openobserve-telemetry-sdk mcp-use langchain-openai opentelemetry-api python-dotenv
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

Call `openobserve_init()` **before** running any agent. Wrap each `agent.run()` call in a manual span and record the prompt, server name, and result.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

from opentelemetry import trace
import os
import asyncio
from mcp_use import MCPClient, MCPAgent
from langchain_openai import ChatOpenAI

tracer = trace.get_tracer(__name__)

config = {
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
        }
    }
}

llm = ChatOpenAI(model="gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])

async def run(prompt: str):
    with tracer.start_as_current_span("mcp_use.agent_run") as span:
        span.set_attribute("mcp_use.prompt", prompt[:200])
        span.set_attribute("mcp_use.server", "filesystem")
        async with MCPClient.create(config) as client:
            agent = MCPAgent(llm=llm, client=client, max_steps=5)
            result = await agent.run(prompt)
            span.set_attribute("mcp_use.result_length", len(str(result)))
            return result

asyncio.run(run("List the files in the /tmp directory."))
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `mcp_use.prompt` | The user prompt sent to the agent |
| `mcp_use.server` | Name of the MCP server being used |
| `mcp_use.result_length` | Character count of the agent's final result |
| `span_status` | `OK` or error status |
| `error.message` | Error detail on failed runs |
| `duration` | End-to-end agent execution latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `mcp_use.agent_run` to see all agent runs
3. Click a span to inspect which prompt was sent and how long the run took
4. To also capture child LLM spans, add `OpenAIInstrumentor().instrument()` before `openobserve_init()`

## **Next Steps**

With mcp-use instrumented, every agent run connecting to MCP servers is recorded in OpenObserve. From here you can monitor tool use frequency, track agent execution time, and correlate MCP calls with LLM spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [MCP Integration](../mcp/)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
