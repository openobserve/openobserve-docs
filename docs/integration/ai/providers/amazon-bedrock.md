---
title: Amazon Bedrock
description: Instrument Amazon Bedrock LLM calls and send traces to OpenObserve via OpenTelemetry.
---

# **Amazon Bedrock → OpenObserve**

Automatically capture token usage, latency, and model metadata for every Amazon Bedrock inference call in your Python application using the OpenInference Bedrock instrumentor.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* AWS credentials with `bedrock:InvokeModel` permission (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`)

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
```

## **Instrumentation**

Call `BedrockInstrumentor().instrument()` **before** creating the boto3 client.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.bedrock import BedrockInstrumentor
from openobserve import openobserve_init

BedrockInstrumentor().instrument()
openobserve_init()

import boto3

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

response = bedrock.converse(
    modelId="anthropic.claude-3-haiku-20240307-v1:0",
    messages=[
        {"role": "user", "content": [{"text": "Explain distributed tracing in one sentence."}]}
    ],
)
print(response["output"]["message"]["content"][0]["text"])
```

### Using other Bedrock models

The `converse` API works with any Bedrock model that supports it. Swap the `modelId` to use Meta, Mistral, or Amazon Titan models.

```python
response = bedrock.converse(
    modelId="meta.llama3-8b-instruct-v1:0",
    messages=[
        {"role": "user", "content": [{"text": "What is a span in tracing?"}]}
    ],
)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Bedrock model ID (e.g. `anthropic.claude-3-haiku-20240307-v1:0`) |
| `llm_token_count_prompt` | Input tokens consumed |
| `llm_token_count_completion` | Output tokens generated |
| `llm_token_count_total` | Total tokens consumed |
| `openinference_span_kind` | `LLM` |
| `input_value` | Messages sent to the model |
| `output_value` | Model response |
| `duration` | End-to-end request latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Click any span to inspect token counts, model ID, and latency
3. Filter by `llm_model_name` to compare different Bedrock models

## **Next Steps**

With Amazon Bedrock instrumented, every `converse` call is recorded in OpenObserve. From here you can track token usage across model providers available on Bedrock, monitor latency, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
