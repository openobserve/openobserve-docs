---
title: Amazon Bedrock AgentCore
description: Instrument Amazon Bedrock AgentCore invocations and send traces to OpenObserve via OpenTelemetry.
---

# **Amazon Bedrock AgentCore → OpenObserve**

Capture latency and invocation metadata for every Amazon Bedrock AgentCore runtime call using manual OpenTelemetry spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* AWS credentials with `BedrockAgentCoreFullAccess` and `AmazonBedrockFullAccess` permissions
* A deployed AgentCore runtime ARN

## **Installation**

```shell
pip install openobserve-telemetry-sdk boto3 python-dotenv
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
BEDROCK_AGENTCORE_RUNTIME_ARN=arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/your-runtime-id
```

## **Instrumentation**

AgentCore does not have an auto-instrumentation package. Wrap each invocation in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init(resource_attributes={"service.name": "amazon-bedrock-agentcore"})

from opentelemetry import trace
import os, json, uuid, boto3

RUNTIME_ARN = os.environ["BEDROCK_AGENTCORE_RUNTIME_ARN"]

client = boto3.client(
    "bedrock-agentcore",
    region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
)

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("bedrock_agentcore.invoke") as span:
    span.set_attribute("bedrock_agentcore.runtime_arn", RUNTIME_ARN)
    span.set_attribute("bedrock_agentcore.input", "Explain observability in one sentence.")

    response = client.invoke_agent_runtime(
        agentRuntimeArn=RUNTIME_ARN,
        runtimeSessionId=str(uuid.uuid4()),
        payload=json.dumps({"input": "Explain observability in one sentence."}).encode(),
        contentType="application/json",
        accept="application/json",
    )
    output = json.loads(response["response"].read()).get("output", "")
    span.set_attribute("bedrock_agentcore.output_length", len(output))
    print(output)
```

## **What Gets Captured**

| Attribute | Description |
|---|---|
| `operation_name` | Always `bedrock_agentcore.invoke` |
| `bedrock_agentcore_runtime_arn` | ARN of the invoked runtime |
| `bedrock_agentcore_input` | Input text sent to the agent |
| `bedrock_agentcore_output_length` | Character length of the response |
| `span_status` | `OK` on success, `ERROR` on failure |
| `duration` | End-to-end invocation latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces** in the left sidebar
2. Filter by `service_name = amazon-bedrock-agentcore`
3. Click any `bedrock_agentcore.invoke` span to inspect latency and input/output attributes

![Amazon Bedrock AgentCore trace in OpenObserve](../../../images/integration/ai/amazon-bedrock-agentcore.png)

## **Next Steps**

With AgentCore invocations traced, you can track agent latency over time, set up alerts on slow or failing invocations, and correlate agent spans with downstream Bedrock model calls.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Amazon Bedrock](../providers/amazon-bedrock.md)
- [Explore Traces](../../../user-guide/data-exploration/traces/index.md)
- [Alerts](../../../user-guide/analytics/alerts/index.md)
