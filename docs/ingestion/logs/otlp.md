---
title: otel-collector
metaTitle: "OTLP Log Ingestion: OpenTelemetry Collector to OpenObserve"
description: "OTLP log, metric, and trace ingestion into OpenObserve via OpenTelemetry Collector - covers HTTP and gRPC setup, protocol comparison, and direct SDK examples."
---

# OpenTelemetry Collector (OTEL) / OTLP Log Ingestion

OpenObserve supports the OpenTelemetry Protocol (OTLP) for `logs`, `metrics`, `traces`, and `profiles` ingestion using the OpenTelemetry Collector. This page covers log ingestion; for the other signals, see [metrics](../metrics/index.md), [traces](../traces/index.md), and [profiles](../profiles/index.md).

## What Is OTLP?

The OpenTelemetry Protocol (OTLP) is the native wire protocol of the OpenTelemetry project. It defines how telemetry data - logs, metrics, and traces - is encoded and transported between instrumented services, the OpenTelemetry Collector, and observability backends like OpenObserve. OTLP replaces older formats like Jaeger and Zipkin with a single, vendor-neutral standard supported by every major observability platform.

OTLP supports two transports:

- **OTLP/HTTP** (port 4318 by default): uses HTTP/1.1 with Protobuf or JSON encoding. Works through most proxies and firewalls and is the simplest option to get started with.
- **OTLP/gRPC** (port 4317 by default, port 5081 on OpenObserve): uses HTTP/2 with binary Protobuf encoding for higher throughput and lower per-request overhead. Requires a network path that supports HTTP/2.

Because OTLP is the OpenTelemetry native protocol, any application instrumented with an OpenTelemetry SDK can send data directly to OpenObserve without a custom plugin or format conversion. This makes OTLP the recommended ingestion method for new projects.

## OTLP vs Other Ingestion Methods

| Protocol | Signals supported | Setup complexity | Best for |
|---|---|---|---|
| **OTLP** | Logs, metrics, traces, profiles | Low - single collector config | New projects, OTel-instrumented apps |
| **Prometheus remote write** | Metrics only | Low - one `remote_write` block | Existing Prometheus stacks |
| **Loki-compatible API** | Logs only | Low - drop-in Loki replacement | Teams migrating from Grafana Loki |
| **Elasticsearch-compatible API** | Logs only | Low - works with Filebeat, Fluent Bit | Teams with existing Elastic shippers |

## Prerequisites

- An OpenObserve instance (Cloud or self-hosted) and your login credentials.
- The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) installed.

:::note[Generating the `Authorization` header]
The `Authorization` header is `Basic <base64(email:password)>`. Generate the value with:

```bash
echo -n 'your-email:your-password' | base64
```

**Data > Data sources > Custom > Logs > OTEL Collector** shows a ready-to-copy exporter configuration with this header filled in.
:::

## Choose a protocol

OpenObserve supports two OTLP transports:

- **OTLP/HTTP**: simpler to set up, works through most proxies and firewalls.
- **OTLP/gRPC**: higher throughput and lower per-request overhead; requires HTTP/2. Supported in single-node mode from v0.6.4 and distributed mode from v0.7.4.

## OTLP/HTTP

| Field | Value |
|---|---|
| Endpoint | `https://<your-openobserve-host>/api/<your-org>/v1/logs` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `stream-name` header | `your-stream` |

**Complete collector config - OTLP/HTTP**

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    send_batch_size: 10000
    timeout: 10s

exporters:
  otlphttp/openobserve:
    endpoint: https://<your-openobserve-host>/api/<your-org>
    headers:
      Authorization: Basic <base64(email:password)>
      stream-name: your-stream

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/openobserve]
```

:::warning[No trailing slash on `endpoint`]
The `endpoint` value must not end with a `/`. The collector appends `/v1/logs` itself, and a trailing slash will produce a 404.
:::

## OTLP/gRPC

The default gRPC port is `5081`. You can change it using the `ZO_GRPC_PORT` environment variable.

| Field | Value |
|---|---|
| Endpoint | `<your-openobserve-host>:5081` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `organization` header | `your-org` |
| `stream-name` header | `your-stream` |
| `tls.insecure` | `false/true` |

**Complete collector config - OTLP/gRPC**

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    send_batch_size: 10000
    timeout: 10s

exporters:
  otlp/openobserve:
    endpoint: <your-openobserve-host>:5081
    headers:
      Authorization: "Basic <base64(email:password)>"
      organization: your-org
      stream-name: your-stream
    tls:
      insecure: true

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/openobserve]
```

## Verify ingestion

After starting the collector, confirm logs are landing in OpenObserve:

1. Open the OpenObserve UI.
2. Click **Logs** in the left sidebar.
3. From the stream dropdown (top-left), select the stream you configured in `stream-name`.
4. You should see incoming log entries within a few seconds.

If no data appears, double-check that the endpoint has no trailing slash, the `Authorization` header is correctly base64-encoded, and the collector logs do not show export errors.

## OTLP Metrics Ingestion

OpenObserve accepts OTLP metrics over both HTTP and gRPC using the same collector config pattern. The OTLP/HTTP endpoint for metrics is:

```
https://<your-openobserve-host>/api/<your-org>/v1/metrics_json
```

Add a `metrics` pipeline to your collector config pointing to the same exporter. See the [metrics ingestion guide](../metrics/index.md) for the full configuration and supported metric types.

## OTLP Trace Ingestion

Distributed traces use the same OTLP transport. The OTLP/HTTP endpoint for traces is:

```
https://<your-openobserve-host>/api/<your-org>/v1/traces
```

The [trace ingestion guide](../traces/opentelemetry.md) covers SDK auto-instrumentation for Node.js, Python, and Go, as well as collector-based trace pipelines.

## Direct SDK Ingestion (without Collector)

You can send OTLP logs directly from application code without running a collector - useful for simple setups or reducing infrastructure components.

### Python

```bash
pip install opentelemetry-sdk opentelemetry-exporter-otlp-proto-http
```

```python
import base64
from opentelemetry.sdk._logs import LoggerProvider
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry._logs import set_logger_provider
import logging
from opentelemetry.sdk._logs import LoggingHandler

endpoint = "https://<your-openobserve-host>/api/<your-org>/v1/logs"
token = base64.b64encode(b"your-email:your-password").decode()

exporter = OTLPLogExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {token}", "stream-name": "your-stream"},
)
provider = LoggerProvider()
provider.add_log_record_processor(BatchLogRecordProcessor(exporter))
set_logger_provider(provider)

handler = LoggingHandler(level=logging.DEBUG, logger_provider=provider)
logging.getLogger().addHandler(handler)
logging.warning("Hello from OpenTelemetry Python SDK")
```

### Node.js

```bash
npm install @opentelemetry/sdk-logs @opentelemetry/exporter-logs-otlp-http
```

```js
const { LoggerProvider, BatchLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");

const token = Buffer.from("your-email:your-password").toString("base64");
const exporter = new OTLPLogExporter({
  url: "https://<your-openobserve-host>/api/<your-org>/v1/logs",
  headers: { Authorization: `Basic ${token}`, "stream-name": "your-stream" },
});

const provider = new LoggerProvider();
provider.addLogRecordProcessor(new BatchLogRecordProcessor(exporter));

const logger = provider.getLogger("my-app");
logger.emit({ severityText: "INFO", body: "Hello from OpenTelemetry Node.js SDK" });
provider.shutdown();
```

## Next steps

- [Quickstart](../../getting-started.md): get OpenObserve running if you haven't yet.
- [Logs UI](../../user-guide/data-exploration/logs/logs.md): search and explore ingested logs.
- [Metrics ingestion](../metrics/index.md): ingest metrics via OTLP, Prometheus remote write, or Telegraf.
- [Trace ingestion](../traces/opentelemetry.md): instrument applications for distributed tracing.
- [Other log ingestion options](./index.md): Vector, Fluent Bit, syslog, language SDKs.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contact-us/)
