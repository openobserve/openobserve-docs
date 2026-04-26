---
title: Coval
description: Instrument Coval voice AI evaluations and send traces to OpenObserve via OpenTelemetry.
---

# **Coval → OpenObserve**

Capture LLM generation spans and evaluation submission traces for every Coval voice AI eval run. Coval is a platform for evaluating voice AI agents across metrics like task completion, latency, and naturalness. Instrument it by wrapping LLM calls and Coval API submissions in manual OTel spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Coval](https://coval.dev/) API key
* An OpenAI API key

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai opentelemetry-api requests python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
COVAL_API_KEY=your-coval-api-key
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` and `openobserve_init()` **before** running evaluations. Wrap each eval case in a `coval.eval_run` span that covers both the LLM generation and the Coval submission.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

OpenAIInstrumentor().instrument()
openobserve_init()

from opentelemetry import trace
import os
import uuid
import requests
from openai import OpenAI

tracer = trace.get_tracer(__name__)
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

coval_headers = {
    "Authorization": f"Bearer {os.environ['COVAL_API_KEY']}",
    "Content-Type": "application/json",
}

def eval_conversation(user_message: str):
    with tracer.start_as_current_span("coval.eval_run") as span:
        span.set_attribute("coval.message", user_message[:200])
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": user_message}],
            max_tokens=200,
        )
        reply = response.choices[0].message.content
        span.set_attribute("coval.reply_length", len(reply))

        requests.post("https://api.coval.dev/v1/runs", headers=coval_headers, json={
            "conversation": [
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": reply},
            ],
            "run_id": str(uuid.uuid4()),
        }, timeout=10)
        span.set_attribute("span_status", "OK")
        return reply

result = eval_conversation("Hello, I need help booking a flight.")
print(result)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `coval.message` | The user message in the evaluation |
| `coval.reply_length` | Character count of the assistant reply |
| `llm_model_name` | Model used (from OpenAI instrumentor) |
| `llm_token_count_prompt` | Prompt tokens |
| `llm_token_count_completion` | Completion tokens |
| `duration` | Total eval run latency |
| `span_status` | `OK` or error status |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `coval.eval_run` to see all eval cases
3. Expand each trace to see the LLM generation child span
4. Sort by duration to find the slowest eval runs

## **Next Steps**

With Coval and OpenObserve both instrumented, you get automated voice AI evaluation scores from Coval and detailed trace data from OpenObserve. Use OpenObserve dashboards to track generation latency trends alongside Coval's pass rates.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
