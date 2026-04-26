---
title: Codename Goose
description: Instrument Codename Goose (goose CLI) sessions and send traces to OpenObserve via OpenTelemetry.
---

# **Codename Goose → OpenObserve**

Capture session run latency, exit codes, and output lengths for every Codename Goose CLI invocation. Codename Goose is Block's open-source AI developer agent that uses tools to complete multi-step software engineering tasks. Instrumentation wraps subprocess invocations of the `goose` CLI in manual OpenTelemetry spans.

## **Prerequisites**

* Python 3.8+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* [Codename Goose](https://github.com/block/goose) installed (`pip install goose-ai`)
* An OpenAI API key (or another supported provider)

## **Installation**

```shell
pip install openobserve-telemetry-sdk openinference-instrumentation-openai openai opentelemetry-api python-dotenv
pip install goose-ai
```

## **Configuration**

Create a `.env` file in your project root:

```
OPENOBSERVE_URL=https://api.openobserve.ai/
OPENOBSERVE_ORG=your_org_id
OPENOBSERVE_AUTH_TOKEN=Basic <your_base64_token>
OPENAI_API_KEY=your-openai-api-key
GOOSE_PROVIDER=openai
GOOSE_BIN=goose
```

To capture native Goose OTLP traces, set these environment variables before running `goose`:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.openobserve.ai/api/your_org_id/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <your_base64_token>
```

## **Instrumentation**

Call `OpenAIInstrumentor().instrument()` and `openobserve_init()` **before** running sessions. Wrap each `goose run` subprocess call in a manual span.

```python
from dotenv import load_dotenv
load_dotenv()

from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

OpenAIInstrumentor().instrument()
openobserve_init()

from opentelemetry import trace
import os
import subprocess

tracer = trace.get_tracer(__name__)

goose_bin = os.environ.get("GOOSE_BIN", "goose")

def run_goose(prompt: str):
    with tracer.start_as_current_span("goose.session_run") as span:
        span.set_attribute("goose.prompt", prompt[:100])
        span.set_attribute("goose.provider", os.environ.get("GOOSE_PROVIDER", "openai"))
        result = subprocess.run(
            [goose_bin, "run", "--text", prompt, "--no-session"],
            capture_output=True,
            text=True,
            timeout=60,
            env={**os.environ, "GOOSE_PROVIDER": os.environ.get("GOOSE_PROVIDER", "openai")},
        )
        output = result.stdout.strip()
        span.set_attribute("goose.exit_code", result.returncode)
        span.set_attribute("goose.output_length", len(output))
        span.set_attribute("span_status", "OK" if result.returncode == 0 else "ERROR")
        return output

output = run_goose("Explain distributed tracing in one sentence.")
print(output)
```

## **What Gets Captured**

| Attribute | Description |
| ----- | ----- |
| `goose.prompt` | The prompt passed to the session (truncated to 100 chars) |
| `goose.provider` | The LLM provider used (e.g. `openai`) |
| `goose.exit_code` | Exit code of the `goose` process (`0` = success) |
| `goose.output_length` | Character count of the session output |
| `span_status` | `OK` or error status |
| `error.message` | Error detail when the process fails or times out |
| `duration` | Total session run latency |

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by span name `goose.session_run` to see all session runs
3. Filter by `goose.exit_code` to find failed sessions
4. Sort by duration to identify the slowest runs

## **Next Steps**

With Codename Goose instrumented, every agent session is recorded in OpenObserve. From here you can monitor session latency, track exit code distributions, and correlate long-running sessions with specific prompt types.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/)
- [Building Dashboards](../../../user-guide/analytics/dashboards/)
