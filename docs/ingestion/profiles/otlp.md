---
title: OTLP
metaTitle: OTLP Profiles Ingestion via OTel Collector | OpenObserve
description: Send OpenTelemetry Profiles to OpenObserve over OTLP/HTTP or OTLP/gRPC using the OpenTelemetry Collector.
---

# OTLP Profiles Ingestion

Send profiles to OpenObserve over OTLP, the same protocol used for logs, metrics, and traces.

:::note[OTLP Profiles is Alpha]
The signal is still Alpha. The examples use [otelcol-contrib 0.153.0](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.153.0). Pin compatible profiler and Collector versions together; older experimental OTLP layouts are not interchangeable. Start it with `--feature-gates=+service.profilesSupport`.
:::

## Authorization

HTTP and gRPC both send `Authorization: Basic <base64(email:password)>`. Generate the value with:

```bash
printf '%s' 'your-email:your-password' | base64 | tr -d '\n'
```

You can also copy the endpoint and header from **Data > Data sources > Custom > Profiles**.

## OTLP/HTTP

The `resource` processor in these examples assigns a name to a single application. For a Collector receiving multiple services, omit this processor and have each producer supply `service.name`; upserting one constant name groups them together in the UI.

Send an `ExportProfilesServiceRequest` with `Content-Type: application/x-protobuf` or `application/json`. Raw pprof and JFR files are not OTLP; convert them with the integrations linked below.

| Field | Value |
|---|---|
| Endpoint | `https://<your-openobserve-host>/api/<your-org>/v1/profiles` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `stream-name` header | optional; defaults to `default` |
| `service.name` | Resource attribute; the example assigns one service name |

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

Default port is `5081` (`ZO_GRPC_PORT`). The organization travels in gRPC metadata, not in the endpoint path. The example uses plaintext for a local server (`tls.insecure: true`); use `insecure: false` and the appropriate CA configuration for a TLS endpoint.

| Field | Value |
|---|---|
| Endpoint | `<your-openobserve-host>:5081` |
| `Authorization` header | `Basic <base64(email:password)>` |
| `organization` header | `your-org` |
| `stream-name` header | optional; defaults to `default` |
| `tls.insecure` | `false` / `true` |
| `service.name` | Resource attribute; the example assigns one service name |

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
  otlp_grpc/openobserve:
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
      exporters: [otlp_grpc/openobserve]
```

```bash
otelcol-contrib --feature-gates=+service.profilesSupport --config=otelcol-config.yaml
```

## Verify ingestion

1. Start the Collector with the Profiles feature gate and send a profile from one of the integrations below.
2. Check the Collector logs for rejected or dropped exports. An HTTP 200 from the Collector receiver does not confirm that OpenObserve accepted the downstream export; also check any OTLP `partial_success` response.
3. In OpenObserve, open **Profiles**, select the destination stream (`default` unless you changed `stream-name`), and select the service, profile type, and unit. Use **Last 15 minutes** for a fresh capture.
4. Confirm that the time series and **Flame Graph**, **Call Tree**, or **Top** view contain samples. Profile type labels and units come from the producer; select the emitted pair rather than assuming every CPU profile is named `cpu`.

If a Collector 0.153.0 pprof export is rejected with `dictionary.mapping_table[0] must be the zero value`, OpenObserve is rejecting a compacted dictionary with data at index zero. Upgrade OpenObserve to a version that accepts compacted Collector dictionaries; changing the endpoint or credentials does not fix that error.

## Next steps

- [Java / async-profiler](./java.md)
- [Go / pprof](./go.md)
- [Rust / pprof](./rust.md)
- [eBPF profiler](./ebpf.md)
- [Profiles overview](./index.md)

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
