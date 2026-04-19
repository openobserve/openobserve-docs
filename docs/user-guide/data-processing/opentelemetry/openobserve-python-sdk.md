# OpenObserve Telemetry SDK

A simple and lightweight Python SDK for exporting OpenTelemetry logs, metrics, and traces to [OpenObserve](https://openobserve.ai/).

## Features

- **Easy Integration** – Minimal setup with automatic instrumentation for popular libraries
- **Multi-Signal Support** – Capture logs, metrics, and traces simultaneously
- **Flexible Protocol** – Choose between HTTP/Protobuf (default) or gRPC
- **Lightweight** – Minimal dependencies, designed for production use
- **OpenTelemetry Native** – Built on OpenTelemetry standards for compatibility

## Quick Start

**Generate auth token:**
```bash
echo -n "root@example.com:Complexpass#123" | base64
# Output: cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
```

**Set environment variables:**
```bash
# OpenObserve Configuration (Required)
export OPENOBSERVE_AUTH_TOKEN="Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM="

# Optional OpenObserve settings (defaults shown)
export OPENOBSERVE_URL="http://localhost:5080"
export OPENOBSERVE_ORG="default"

# API keys for services you're using (optional, based on instrumentation)
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"
```

**Install dependencies:**
```bash
pip install openobserve-telemetry-sdk openai opentelemetry-instrumentation-openai
```

**Quick Example – OpenAI Instrumentation:**
```python
from opentelemetry.instrumentation.openai import OpenAIInstrumentor
from openobserve import openobserve_init

# Initialize OpenObserve and instrument OpenAI
OpenAIInstrumentor().instrument()
openobserve_init()

from openai import OpenAI

# Use OpenAI as normal - traces are automatically captured
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

**Quick Example – Anthropic Instrumentation:**
```python
from opentelemetry.instrumentation.anthropic import AnthropicInstrumentor
from openobserve import openobserve_init

# Initialize OpenObserve and instrument Anthropic
AnthropicInstrumentor().instrument()
openobserve_init()

from anthropic import Anthropic

# Use Claude as normal - traces are automatically captured
client = Anthropic()
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.content[0].text)
```

### Selecting Signals

By default, `openobserve_init()` initializes all signals (logs, metrics, traces). You can also initialize selectively:

```python
# All signals (default)
openobserve_init()

# Specific signals only
openobserve_init(logs=True)
openobserve_init(metrics=True)
openobserve_init(traces=True)

# Combine signals
openobserve_init(logs=True, metrics=True)  # no traces
```

**Note:** For logs, you still need to bridge Python's standard `logging` module:
```python
import logging
from opentelemetry.sdk._logs import LoggingHandler

openobserve_init(logs=True)
handler = LoggingHandler()
logging.getLogger().addHandler(handler)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENOBSERVE_URL` | No | OpenObserve base URL (default: "http://localhost:5080") |
| `OPENOBSERVE_ORG` | No | Organization name (default: "default") |
| `OPENOBSERVE_AUTH_TOKEN` | ✅ | Authorization token (Format: "Basic <base64>") |
| `OPENOBSERVE_TIMEOUT` | No | Request timeout in seconds (default: 30) |
| `OPENOBSERVE_ENABLED` | No | Enable/disable tracing (default: "true") |
| `OPENOBSERVE_PROTOCOL` | No | Protocol: "grpc" or "http/protobuf" (default: "http/protobuf") |
| `OPENOBSERVE_TRACES_STREAM_NAME` | No | Stream name for traces (default: "default") |
| `OPENOBSERVE_LOGS_STREAM_NAME` | No | Stream name for logs (default: "default") |

### Protocol Configuration Notes

**HTTP/Protobuf (default)**
- Uses HTTP with Protocol Buffers encoding.
- Works with both HTTP and HTTPS endpoints.
- Organization is specified in the URL path: `/api/{org}/v1/{signal}`, where `{signal}` is `traces`, `logs`, or `metrics`.
- Automatically adds the `stream-name` header from `OPENOBSERVE_TRACES_STREAM_NAME` for traces and `OPENOBSERVE_LOGS_STREAM_NAME` for logs.
- Standard HTTP header handling (preserves case).

**gRPC**
- Uses gRPC protocol with automatic configuration:
  - Organization is passed as a header (not in the URL).
  - Automatically adds required headers:
    - `organization`: Set to `OPENOBSERVE_ORG`.
    - `stream-name`: Set to `OPENOBSERVE_TRACES_STREAM_NAME` for traces and `OPENOBSERVE_LOGS_STREAM_NAME` for logs.
  - Headers are normalized to lowercase per gRPC specification.
  - TLS is automatically configured based on URL scheme:
    - `http://` URLs use insecure (non-TLS) connections.
    - `https://` URLs use secure (TLS) connections.

## Installation

Choose your preferred installation method:

```bash
# From PyPI (recommended)
pip install openobserve-telemetry-sdk

# From source (development)
pip install -e .

# Using requirements.txt
pip install -r requirements.txt
```

Both HTTP/Protobuf (default) and gRPC protocols are included in all installations.

## Supported Instruments

The SDK works with OpenTelemetry instrumentation packages:

- **OpenAI** – Use with `opentelemetry-instrumentation-openai` for API call traces
- **Anthropic** – Use with `opentelemetry-instrumentation-anthropic` for Claude API traces
- **LangChain** – Use with `opentelemetry-instrumentation-langchain` for LLM chain tracing
- **Standard Python Logging** – Built-in support via `LoggingHandler`
- **Metrics** – OpenTelemetry counters, histograms, and up/down counters

## Examples

Run any of these examples to see the SDK in action. First, ensure environment variables are set:

```bash
# Traces with OpenAI
python examples/openai_example.py

# Logs with standard Python logging
python examples/logs_example.py

# Metrics (counters, histograms, up/down counters)
python examples/metrics_example.py

# LangChain Q&A with session tracking
python examples/session_demo.py
```

See the `examples/` directory for more samples including LangChain RAG chains and user tracking patterns.

## Contributing

We welcome contributions! Please feel free to open issues or submit pull requests on [GitHub](https://github.com/openobserve/openobserve-python-sdk).

## Support

- 📖 [OpenObserve Documentation](https://docs.openobserve.ai/)
- 🐛 [Report Issues](https://github.com/openobserve/openobserve-python-sdk/issues)
- 💬 [OpenObserve Community](https://openobserve.ai/)
