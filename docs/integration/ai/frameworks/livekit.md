---
title: LiveKit
description: Instrument LiveKit voice AI agents and send traces to OpenObserve via OpenTelemetry.
---

# **LiveKit → OpenObserve**

Automatically capture LLM call spans, token usage, and turn latency for every LiveKit agent session. LiveKit Agents is a Python framework for building real-time voice and video AI agents. It has built-in OpenTelemetry support that activates when the standard OTLP environment variables are set.

## **Prerequisites**

* Python 3.10+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [LiveKit](https://livekit.io/) account with API credentials
* An OpenAI API key (or another LiveKit-supported LLM)

## **Installation**

```shell
pip install openobserve-telemetry-sdk "livekit-agents[openai]" python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
OPENAI_API_KEY=your-openai-api-key
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:5080/api/default/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
OTEL_SERVICE_NAME=livekit-agent
```

LiveKit Agents reads the standard `OTEL_EXPORTER_OTLP_*` environment variables and exports traces automatically.

## **Instrumentation**

No explicit `instrument()` call is needed. Define your agent normally and the OTLP exporter is configured via environment variables.

```python
from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.agents.llm import ChatContext, ChatMessage
from livekit.plugins import openai as lk_openai

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    llm = lk_openai.LLM(model="gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])

    chat_ctx = ChatContext()
    chat_ctx.append(text="Hello, how can I help you today?", role="assistant")

    async def on_message(message: str):
        chat_ctx.append(text=message, role="user")
        stream = llm.chat(chat_ctx=chat_ctx)
        reply = ""
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                reply += chunk.choices[0].delta.content
        chat_ctx.append(text=reply, role="assistant")
        return reply

    # Process participant messages
    async for event in ctx.room.on("data_received"):
        await on_message(event.data.decode())

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `livekit.agent_name` | Name of the agent worker |
| `livekit.room_name` | LiveKit room the agent joined |
| `llm_model_name` | LLM model used for responses |
| `llm_token_count_prompt` | Prompt tokens per LLM turn |
| `llm_token_count_completion` | Completion tokens per LLM turn |
| `duration` | Per-turn LLM latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each agent session appears as a series of LLM turn spans
3. Filter by `livekit.room_name` to isolate a specific session
4. Sort by duration to find the slowest voice turns

## **Next Steps**

With LiveKit Agents instrumented, every voice interaction is recorded in OpenObserve. From here you can monitor turn latency, track token usage per session, and set alerts on high-latency turns.

## **Read More**

- [Pipecat](pipecat.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
