---
title: Amazon Bedrock Agents
description: Instrument Amazon Bedrock Agent invocations and send traces to OpenObserve via OpenTelemetry.
---

# **Amazon Bedrock Agents → OpenObserve**

Automatically capture agent invocation spans, tool use, orchestration steps, and token usage for every Amazon Bedrock Agent request. The OpenInference Bedrock instrumentor patches the boto3 `bedrock-agent-runtime` client to emit OTLP traces directly to OpenObserve.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* AWS credentials with `bedrock:InvokeAgent` permission
* An Amazon Bedrock Agent with at least one alias deployed (use the `TSTALIASID` test alias during development)

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-bedrock boto3 python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_DEFAULT_REGION=us-east-1
BEDROCK_AGENT_ID=ABCDEFGHIJ
BEDROCK_AGENT_ALIAS_ID=TSTALIASID
```

## **Instrumentation**

Call `BedrockInstrumentor().instrument()` **before** creating the boto3 client. The instrumentor automatically patches the `bedrock-agent-runtime` session to emit spans for each agent invocation.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.bedrock import BedrockInstrumentor
from openobserve import openobserve_init

BedrockInstrumentor().instrument()
openobserve_init()

import os
import uuid
import boto3

client = boto3.client(
    "bedrock-agent-runtime",
    region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
)

response = client.invoke_agent(
    agentId=os.environ["BEDROCK_AGENT_ID"],
    agentAliasId=os.environ.get("BEDROCK_AGENT_ALIAS_ID", "TSTALIASID"),
    sessionId=str(uuid.uuid4()),
    inputText="What can you help me with today?",
)

completion = ""
for event in response.get("completion", []):
    if "chunk" in event:
        completion += event["chunk"]["bytes"].decode("utf-8")

print(completion)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Foundation model backing the agent |
| `aws_bedrock_agent_id` | The Bedrock Agent resource ID |
| `aws_bedrock_agent_alias_id` | The alias used for this invocation |
| `llm_token_count_prompt` | Tokens in the orchestration prompt |
| `llm_token_count_completion` | Tokens in the agent response |
| `openinference_span_kind` | `AGENT` for the root span, `LLM` for model calls |
| `operation_name` | `invoke_agent` |
| `duration` | Total agent execution time |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Each agent invocation appears as a root span with child spans for each orchestration step
3. Filter by `aws_bedrock_agent_id` to isolate a specific agent
4. Expand the trace tree to see individual tool invocations and LLM calls within the agent loop

## **Next Steps**

With Bedrock Agents instrumented, every agent run is recorded in OpenObserve. From here you can trace multi-step reasoning chains, monitor tool call latency, and set alerts on failed invocations.

## **Read More**

- [Amazon Bedrock (model invocations)](amazon-bedrock.md)
- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
