---
title: Testable Minds
description: Instrument Testable Minds human evaluation submissions and send traces to OpenObserve via OpenTelemetry.
---

# **Testable Minds → OpenObserve**

Capture LLM generation spans in OpenObserve while simultaneously submitting responses to Testable Minds for human evaluation. Testable Minds is a human evaluation platform for LLM applications, connecting AI output to a pre-screened crowd of evaluators. The two tools complement each other: Testable Minds provides qualitative human scores; OpenObserve stores the full trace with token counts and latency.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A [Testable Minds](https://minds.testable.org/) API key
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
TESTABLE_MINDS_API_KEY=your-testable-minds-api-key
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` and `openobserve_init()` **before** creating any clients. Submit LLM responses to Testable Minds alongside OTel generation spans.

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

api_key = os.environ["TESTABLE_MINDS_API_KEY"]
BASE_URL = "https://api.minds.testable.org/v1"

testable_headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

def generate_and_submit(prompt: str):
    with tracer.start_as_current_span("testable_minds.eval_run") as span:
        span.set_attribute("testable_minds.prompt", prompt[:100])

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
        )
        reply = response.choices[0].message.content
        span.set_attribute("testable_minds.reply_length", len(reply))

        trace_id = hex(span.get_span_context().trace_id)
        span.set_attribute("testable_minds.trace_id", trace_id)

        requests.post(
            f"{BASE_URL}/evaluations",
            headers=testable_headers,
            json={
                "id": str(uuid.uuid4()),
                "input": prompt,
                "output": reply,
                "metadata": {"trace_id": trace_id, "model": "gpt-4o-mini"},
            },
            timeout=15,
        )
        span.set_attribute("span_status", "OK")
        return reply

result = generate_and_submit("Explain distributed tracing in one sentence.")
print(result)
```

## **What Gets Captured**

**In OpenObserve (OTel traces):**

| Attribute | Description |
| ----- | ----- |
| `testable_minds.prompt` | The user prompt |
| `testable_minds.reply_length` | Character count of the model's response |
| `testable_minds.trace_id` | Trace ID for cross-referencing with Testable Minds |
| `llm_token_count_prompt` | Prompt tokens (from OpenAI instrumentor) |
| `llm_token_count_completion` | Completion tokens (from OpenAI instrumentor) |
| `duration` | Total eval run latency |
| `span_status` | `OK` or error status |

**In Testable Minds:**

| Property | Description |
| ----- | ----- |
| `input` | The user's prompt |
| `output` | The model's response |
| `metadata.trace_id` | OpenObserve trace ID for drill-down |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `testable_minds.eval_run` to see all evaluation submissions
3. Expand each trace to see the LLM generation child span with token counts
4. Use the `testable_minds.trace_id` in Testable Minds to cross-reference with the OTel trace

## **Next Steps**

With Testable Minds and OpenObserve both instrumented, human evaluation scores from Testable Minds are correlated with detailed trace data. Use Testable Minds dashboards to track human satisfaction scores and OpenObserve to diagnose the specific requests that received low scores.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
