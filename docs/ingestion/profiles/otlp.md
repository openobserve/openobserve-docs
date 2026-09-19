---
title: OTLP
metaTitle: OTLP Profiles Ingestion - OpenTelemetry Collector | OpenObserve
description: Send OpenTelemetry Profiles to OpenObserve over OTLP/HTTP or OTLP/gRPC using the OpenTelemetry Collector.
---

# OTLP Profiles Ingestion

Send profiles to OpenObserve over OTLP, the same protocol used for logs, metrics, and traces.

:::note[OTLP Profiles is Alpha]
The signal is still Alpha. Use [otelcol-contrib](https://github.com/open-telemetry/opentelemetry-collector-releases) 0.148 or later, and start it with `--feature-gates=+service.profilesSupport`.
:::

## Authorization

HTTP and gRPC both send `Authorization: Basic <base64(email:password)>`. Generate the value with:

```bash
echo -n 'your-email:your-password' | base64
```

You can also copy the endpoint and header from **Data Sources → Custom → Profiles**.

## OTLP/HTTP

| Field | Value |
|---|---|
| Endpoint | `https://<your-openobserve-host>/api/<your-org>/v1/profiles` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `stream-name` header | optional; defaults to `default` |
| `service.name` | Collector `resource` processor; most profilers omit it |

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  resource:
    attributes:
      - key: service.name
        value: your-service
        action: upsert

exporters:
  otlp_http/openobserve:
    profiles_endpoint: http://<your-openobserve-host>/api/<your-org>/v1/profiles
    headers:
      Authorization: Basic <paste-from-Data-Sources>
      stream-name: default

service:
  pipelines:
    profiles:
      receivers: [otlp]
      processors: [resource]
      exporters: [otlp_http/openobserve]
```

```bash
otelcol-contrib --feature-gates=+service.profilesSupport --config=otelcol-config.yaml
```

## OTLP/gRPC

Default port is `5081` (`ZO_GRPC_PORT`).

| Field | Value |
|---|---|
| Endpoint | `<your-openobserve-host>:5081` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `organization` header | `your-org` |
| `stream-name` header | optional; defaults to `default` |
| `tls.insecure` | `false` / `true` |
| `service.name` | Collector `resource` processor; most profilers omit it |

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  resource:
    attributes:
      - key: service.name
        value: your-service
        action: upsert

exporters:
  otlp/openobserve:
    endpoint: <your-openobserve-host>:5081
    headers:
      Authorization: "Basic <paste-from-Data-Sources>"
      organization: <your-org>
      stream-name: default
    tls:
      insecure: true

service:
  pipelines:
    profiles:
      receivers: [otlp]
      processors: [resource]
      exporters: [otlp/openobserve]
```

```bash
otelcol-contrib --feature-gates=+service.profilesSupport --config=otelcol-config.yaml
```

## Next steps

- [Java / async-profiler](./java.md)
- [Go / pprof](./go.md)
- [Rust / eBPF](./rust.md)
- [eBPF profiler](./ebpf.md)
- [Profiles overview](./index.md)

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
