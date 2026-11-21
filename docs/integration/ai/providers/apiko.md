---
title: APIKO
description: Send APIKO Chat Completions traces to OpenObserve and inspect latency, model names, token usage, and errors.
---

# APIKO → OpenObserve

Trace calls to APIKO's OpenAI-compatible Chat Completions endpoint with the OpenInference instrumentor for the OpenAI Python client. Use the traces to compare request latency and token usage or investigate failed calls.

## Prerequisites

* Python 3.10 or later
* An OpenObserve organization and its OpenTelemetry ingestion credentials
* An APIKO key with access to a chat model and enough balance for a request. Use the [APIKO model discovery endpoint](https://apiko.app/docs/api/models) to find a model ID available to that key.

## Install and configure

```shell
python -m pip install openobserve-python-sdk openinference-instrumentation-openai openai
```

Set these environment variables using your OpenObserve ingestion settings and APIKO key. For a local OpenObserve instance, the endpoint and organization may look like this:

```shell
export OPENOBSERVE_URL='http://localhost:5080'
export OPENOBSERVE_ORG='default'
export OPENOBSERVE_AUTH_TOKEN='Basic <base64-encoded-credentials>'
export APIKO_API_KEY='<your-key>'
export APIKO_CHAT_MODEL='<chat-model-id>'
```

## Send a trace

Initialize OpenObserve and instrument the client before making the request. This example uses a synthetic prompt and hides request and response content from the trace.

```python
import os

from openai import APIStatusError, OpenAI
from openinference.instrumentation import TraceConfig
from openinference.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init
from opentelemetry import trace

openobserve_init(
    protocol="http/protobuf",
    stream_name="apiko_traces",
    resource_attributes={"service.name": "apiko-demo"},
    traces=True,
)
OpenAIInstrumentor().instrument(
    config=TraceConfig(hide_inputs=True, hide_outputs=True)
)

try:
    with OpenAI(
        api_key=os.environ["APIKO_API_KEY"],
        base_url="https://api.apiko.app/v1",
        timeout=20.0,
        max_retries=0,
    ) as client:
        response = client.chat.completions.create(
            model=os.environ["APIKO_CHAT_MODEL"],
            messages=[{"role": "user", "content": "Reply with the single word trace."}],
            max_completion_tokens=64,
        )
        print(response.model)
        if response.usage:
            print(f"Input tokens: {response.usage.prompt_tokens}")
            print(f"Output tokens: {response.usage.completion_tokens}")
except APIStatusError as exc:
    print(f"APIKO returned HTTP {exc.status_code}")
    raise SystemExit(1) from None
finally:
    trace.get_tracer_provider().force_flush()
```

## Inspect the traces

1. In OpenObserve, open **Traces**, select the `apiko_traces` stream, and filter for `service_name = 'apiko-demo'`.
2. Open the `ChatCompletion` span. Check its duration and compare the resolved model and token counts with the script's output. Use APIKO's returned usage and dashboard for billing.
3. To verify the error path, rerun the script with a model ID that does not exist. Look for a new span with error status in the same stream.

## Read more

* [APIKO Text API reference](https://apiko.app/docs/api/text)
* [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/index.md)
