---
title: Google Vertex AI
description: Instrument Google Vertex AI calls and send traces to OpenObserve via OpenTelemetry.
---

# **Google Vertex AI → OpenObserve**

Capture token usage, latency, and model metadata for every Vertex AI inference call. The Vertex AI SDK does not include a dedicated OTel instrumentor, so traces are created by wrapping calls in manual spans and extracting usage data from the response.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* A Google Cloud project with Vertex AI API enabled
* Application Default Credentials configured (`gcloud auth application-default login`)

## **Installation**

```shell
pip install openobserve-telemetry-sdk google-cloud-aiplatform python-dotenv
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
```

## **Instrumentation**

Call `openobserve_init()` to set up the tracer provider, then wrap each Vertex AI call in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openobserve import openobserve_init
openobserve_init()

import os
from opentelemetry import trace
import vertexai
from vertexai.generative_models import GenerativeModel

tracer = trace.get_tracer(__name__)

vertexai.init(
    project=os.environ["GOOGLE_CLOUD_PROJECT"],
    location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1"),
)
model = GenerativeModel("gemini-1.5-flash")


def generate(prompt: str) -> str:
    with tracer.start_as_current_span("vertexai.generate") as span:
        span.set_attribute("llm_model_name", "gemini-1.5-flash")
        span.set_attribute("input_value", prompt)
        response = model.generate_content(prompt)
        output = response.text
        span.set_attribute("output_value", output[:200])
        if hasattr(response, "usage_metadata"):
            span.set_attribute("llm_token_count_prompt", response.usage_metadata.prompt_token_count)
            span.set_attribute("llm_token_count_completion", response.usage_metadata.candidates_token_count)
        return output


print(generate("Explain distributed tracing in one sentence."))
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `llm_model_name` | Model used (e.g. `gemini-1.5-flash`) |
| `input_value` | Prompt sent to the model |
| `output_value` | First 200 characters of the response |
| `llm_token_count_prompt` | Input tokens consumed |
| `llm_token_count_completion` | Output tokens generated |
| `duration` | End-to-end span latency |
| `error` | Exception details on failure |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by operation name `vertexai.generate` to find Vertex AI spans
3. Click any span to inspect token counts and the prompt and response

## **Next Steps**

With Vertex AI instrumented, every generate call is recorded in OpenObserve. From here you can track token usage, monitor latency per model version, and set alerts on error spans.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Google Gemini](gemini.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
