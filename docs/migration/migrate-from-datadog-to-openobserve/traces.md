---
title: Migrate Traces from Datadog APM to OpenObserve
description: Migrate Datadog APM traces to OpenObserve. Use the OpenTelemetry Collector's datadog receiver to accept dd-trace spans, or switch application SDKs to OpenTelemetry. Step-by-step examples and verification.
---

# Migrating Traces

## Overview

This section walks you through migrating distributed traces from Datadog APM to OpenObserve. You will:

1. Assess how traces currently reach Datadog
2. Choose between keeping `dd-trace` SDKs (translate via OTel Collector) or switching to OpenTelemetry SDKs
3. Update configs so traces flow into OpenObserve
4. Validate that traces are intact

The fastest path is to **keep your `dd-trace-*` SDKs unchanged** and use the OpenTelemetry Collector's `datadog` receiver as a translation layer. No application redeploys, no code changes.

## Step 1: Assess Your Current Trace Sources

Datadog APM traces typically reach Datadog one of two ways:

- **`dd-trace-*` SDK in the app** sends spans to the local Datadog Agent on port `8126` (Datadog trace intake protocol). The Agent batches and forwards to Datadog SaaS.
- **OpenTelemetry SDK in the app** sends OTLP spans to the Datadog Agent (Datadog has accepted OTLP since 2023) or directly to Datadog via OTLP HTTP.

Note the SDKs and instrumented services. You can usually find them by grepping deployment manifests for `dd-trace-*`, `DD_AGENT_HOST`, `DD_TRACE_*`, or `OTEL_EXPORTER_OTLP_ENDPOINT`.

## Step 2: Categorize Your Sources

| Source Type | Migration Path |
|---|---|
| **`dd-trace` SDK → Datadog Agent on 8126** | [Route Agent (or apps) at the OTel Collector `datadog` receiver](#from-dd-trace-sdks) |
| **OpenTelemetry SDK → Datadog Agent (OTLP)** | [Switch SDK endpoint to OpenObserve OTLP](#from-opentelemetry-sdks) |
| **OTel Collector with `datadog` exporter** | [Swap the exporter to `otlphttp`](#from-otel-collector) |

## Step 3: Migrate Each Source

### From dd-trace SDKs

The OpenTelemetry Collector's `datadog` receiver listens for Datadog APM trace payloads (the protocol that `dd-trace-*` SDKs and the Datadog Agent both speak) and converts them into OTLP spans.

**Collector config:**

```yaml
receivers:
  datadog:
    endpoint: "0.0.0.0:8126"

processors:
  batch:
    timeout: 10s
    send_batch_size: 10000

exporters:
  otlphttp/openobserve:
    endpoint: https://<your-openobserve-host>/api/<org_id>
    headers:
      Authorization: Basic <base64-creds>

service:
  pipelines:
    traces:
      receivers: [datadog]
      processors: [batch]
      exporters: [otlphttp/openobserve]
```

**Two ways to wire it up:**

**Option A: Point apps directly at the Collector.** Set `DD_AGENT_HOST`/`DD_TRACE_AGENT_PORT` on each service so `dd-trace` ships spans to the Collector instead of the Datadog Agent:

```bash
DD_AGENT_HOST=otel-collector.local
DD_TRACE_AGENT_PORT=8126
```

The application code does not change. Only the env vars do. Restart the service to pick up the new agent endpoint.

**Option B: Keep the Datadog Agent, repoint it.** If many services point at the local Datadog Agent and changing env vars across the fleet is awkward, repoint the Agent's APM forwarder at the local Collector:

```yaml
# /etc/datadog-agent/datadog.yaml
apm_config:
  apm_dd_url: http://localhost:8126
```

In this setup the Collector runs on a different port than the Agent (e.g. Agent on `8126`, Collector on `18126`) and the Agent forwards to the Collector, which forwards to OpenObserve.

!!! tip "Send all signals through one Collector"
    If you're also migrating metrics and logs, you can consolidate everything through a single OTel Collector with one `otlphttp/openobserve` exporter: one endpoint, one auth header, all signals.


### From OpenTelemetry SDKs

If your services already use OpenTelemetry SDKs and ship OTLP, the migration is just an endpoint change. Update the `OTEL_EXPORTER_OTLP_ENDPOINT` env var (or the equivalent in your SDK config) to point at OpenObserve:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-openobserve-host>
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <base64-creds>,stream-name=default"
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
```

For full per-language examples:

- [Go traces ingestion guide](https://openobserve.ai/docs/ingestion/traces/go/)
- [Node.js traces ingestion guide](https://openobserve.ai/docs/ingestion/traces/nodejs/)
- [Python traces ingestion guide](https://openobserve.ai/docs/ingestion/traces/python/)
- [Rust traces ingestion guide](https://openobserve.ai/docs/ingestion/traces/rust/)


### From OTel Collector

If you already run an OpenTelemetry Collector with the `datadog` exporter shipping to Datadog, replace it with `otlphttp` pointed at OpenObserve.

**Current config:**

```yaml
exporters:
  datadog:
    api:
      key: ${env:DD_API_KEY}
      site: datadoghq.com
```

**Updated config:**

```yaml
exporters:
  otlphttp/openobserve:
    endpoint: https://<your-openobserve-host>/api/<org_id>
    headers:
      Authorization: Basic <base64-creds>
```

Update the `traces` pipeline's `exporters` list to use `otlphttp/openobserve` and restart the Collector.


## Step 4: How to Verify

### Check in the UI

1. Open the OpenObserve UI → **Traces** in the left sidebar.
2. Select the trace stream and set a recent time range.
3. Filter by `service.name` to find your services. `dd-trace`'s `service` tag becomes `service.name` after translation.
4. Click into a trace to verify spans, durations, and attributes are intact.

### Span attribute mapping

When `dd-trace` spans are translated to OTLP, the following mapping applies:

| Datadog field | OpenTelemetry attribute |
|---|---|
| `service` | `service.name` |
| `resource` | `resource.name` (and span name) |
| `operation` | Span name |
| `env` | `deployment.environment` |
| `version` | `service.version` |
| Custom tags | Span attributes (same key) |

### Troubleshooting

- **No traces visible:** Check Collector logs for receiver errors and the OTLP exporter for HTTP errors. Confirm endpoint and `Authorization` header.
- **Service missing from the service list:** Ensure spans carry `service.name` after translation. If `dd-trace` was misconfigured (`DD_SERVICE` unset), spans will land but the service list will be sparse.
- **Trace appears split:** Check that the trace ID and parent span ID propagation headers (`x-datadog-trace-id`, `traceparent`) are flowing through your service mesh / load balancer.
- **Auth errors (401):** Regenerate the Base64 credential string and confirm it has no whitespace.

## Dual-write during migration

For the same reason you'd dual-write metrics, you can dual-write traces. `dd-trace` agents ship to the Datadog Agent on `8126`, and you can run the OTel Collector on a different port and have applications send to both via env-var per pod / deployment slice. Once dashboards and on-call workflows work against OpenObserve traces, drop the Datadog leg.

## Next Steps

- [Migrating Logs](logs.md): migrate your log sources next
- [OpenObserve Traces Documentation](https://openobserve.ai/docs/user-guide/traces/): exploring traces, filtering spans, and configuring trace settings in the UI


[Back to Overview](index.md) | Previous: [Migrating Metrics](metrics.md) | Next: [Migrating Logs](logs.md)
