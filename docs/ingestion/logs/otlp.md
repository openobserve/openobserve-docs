---
title: OpenTelemetry Collector (OTEL) - OTLP Log, Metric, and Trace Ingestion | OpenObserve
description: Complete OpenTelemetry Collector guide for OTLP log ingestion, metrics collection, and trace ingestion via HTTP and gRPC protocols for unified observability.
---

# OpenTelemetry Collector (OTEL) / OTLP Log Ingestion

OpenObserve supports the OpenTelemetry Protocol (OTLP) for `logs`, `metrics` and `traces` ingestion using the OpenTelemetry Collector. This page covers log ingestion; for metrics and traces, see the dedicated pages under [Ingestion](../index.md).

## Choose a protocol

OpenObserve supports two OTLP transports:

- **OTLP/HTTP**: simpler to set up, works through most proxies and firewalls.
- **OTLP/gRPC**: higher throughput and lower per-request overhead; requires HTTP/2. Supported in single-node mode from v0.6.4 and distributed mode from v0.7.4.

## Prerequisites

- An OpenObserve instance (Cloud or self-hosted) and your login credentials.
- The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) installed.

!!! note "Generating the `Authorization` header"
    The `Authorization` header is `Basic <base64(email:password)>`. Generate the value with:

    ```bash
    echo -n 'your-email:your-password' | base64
    ```

## OTLP/HTTP

| Field | Value |
|---|---|
| Endpoint | `https://<your-openobserve-host>/api/<your-org>/v1/logs` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `stream-name` header | `your-stream` |

**Example: OpenTelemetry Collector exporter**

```yaml
exporters:
  otlphttp/openobserve:
    endpoint: http://<your-openobserve-host>/api/<your-org>
    headers:
      Authorization: Basic cm9v****************************************Ng==
      stream-name: your-stream
```

!!! warning "No trailing slash on `endpoint`"
    The `endpoint` value must not end with a `/`. The collector appends `/v1/logs` itself, and a trailing slash will produce a 404.

## OTLP/gRPC

The default gRPC port is `5081`. You can change it using the `ZO_GRPC_PORT` environment variable.

| Field | Value |
|---|---|
| Endpoint | `<your-openobserve-host>:5081` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `organization` header | `your-org` |
| `stream-name` header | `your-stream` |
| `tls.insecure` | `false/true` |

**Example: OpenTelemetry Collector exporter**

```yaml
exporters:
  otlp/openobserve:
    endpoint: localhost:5081
    headers:
      Authorization: "Basic cm9v****************************************Ng=="
      organization: your-org
      stream-name: your-stream
    tls:
      insecure: true
```

## Verify ingestion

After starting the collector, confirm logs are landing in OpenObserve:

1. Open the OpenObserve UI.
2. Click **Logs** in the left sidebar.
3. From the stream dropdown (top-left), select the stream you configured in `stream-name`.
4. You should see incoming log entries within a few seconds.

If no data appears, double-check that the endpoint has no trailing slash, the `Authorization` header is correctly base64-encoded, and the collector logs do not show export errors.

## Next steps

- [Quickstart](../../quickstart.md): get OpenObserve running if you haven't yet.
- [Logs UI](../../user-guide/data-exploration/logs/logs.md): search and explore ingested logs.
- [Other log ingestion options](./index.md): Vector, Fluent Bit, syslog, language SDKs.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
