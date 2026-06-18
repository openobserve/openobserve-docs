---
title: Migrate Logs from Datadog to OpenObserve (Agent, Fluent Bit, Vector)
description: Migrate logs from Datadog to OpenObserve. Migration paths for the Datadog Agent log collector, Fluent Bit, Vector, OpenTelemetry Collector, Kubernetes container logs, AWS CloudWatch, and Azure Monitor logs.
---

# Migrating Logs

## Overview

This section walks you through migrating logs from Datadog to OpenObserve. You will:

1. Assess how logs currently reach Datadog
2. Identify the migration path for each source type
3. Update configs so logs flow into OpenObserve
4. Validate that logs are flowing correctly

OpenObserve accepts logs via OTLP, the Loki Push API, Fluent Bit's HTTP output, Vector's HTTP sink, or plain JSON over HTTP. You can keep your existing log shipper. Only the destination changes.

## Step 1: Assess Your Current Log Sources

Common ways logs reach Datadog:

- **Datadog Agent log collection** tailing files declared in `logs:` blocks (Kubernetes integrations, host files, container stdout/stderr)
- **Fluent Bit** with the `datadog` output plugin
- **Vector** with the `datadog_logs` sink
- **OpenTelemetry Collector** with the `datadog` exporter
- **Cloud integrations** (AWS CloudWatch Logs, Azure Diagnostic Settings, GCP Logging)
- **Direct API ingest**, where applications POST to `https://http-intake.logs.datadoghq.com/api/v2/logs`

## Step 2: Categorize Your Sources

| Source Type | Migration Path |
|---|---|
| **Datadog Agent log collection** | [Repoint Agent at OTel Collector or replace with Fluent Bit](#from-datadog-agent) |
| **Fluent Bit with `datadog` output** | [Switch output to `http` (or `loki`)](#from-fluent-bit) |
| **Vector with `datadog_logs` sink** | [Switch sink to `http` (or `loki`)](#from-vector) |
| **OTel Collector with `datadog` exporter** | [Swap exporter to `otlphttp`](#from-otel-collector) |
| **Direct API ingest** | [Repoint apps at OpenObserve `_json` endpoint](#from-direct-api-ingest) |
| **Kubernetes container logs** | [Use OpenObserve Collector Helm chart](#from-kubernetes-container-logs) |
| **AWS CloudWatch logs** | [See dedicated guide](#from-aws-cloudwatch-logs) |
| **Azure Monitor logs** | [See dedicated guide](#from-azure-monitor-logs) |

## Step 3: Migrate Each Source

### From Datadog Agent

If the Datadog Agent is collecting logs (`logs_enabled: true` in `datadog.yaml`, with `logs:` blocks defined per-integration), the Agent will need to be replaced for logs. The Datadog Agent's logs forwarder speaks a proprietary TCP framed protocol that the upstream OTel `datadog` receiver does not accept, so simply repointing `logs_dd_url` at the Collector will not work.

The recommended replacement is **Fluent Bit** (or the [OpenObserve Collector](https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve-collector/README.md)) tailing the same files that the Agent was tailing. The `logs:` configs from `datadog.yaml` map cleanly to Fluent Bit `INPUT tail` sections — same paths, same parsing rules. See the Fluent Bit section below for the output config that ships to OpenObserve.

You can keep the Datadog Agent running for metrics and APM (as described in the [metrics](metrics.md) and [traces](traces.md) sections) while Fluent Bit handles logs in parallel. Once logs are flowing to OpenObserve, set `logs_enabled: false` in `datadog.yaml` to stop the Agent's log collector.


### From Fluent Bit

**Current config:**

```ini
[OUTPUT]
    Name datadog
    Match *
    Host http-intake.logs.datadoghq.com
    TLS on
    apikey <DD_API_KEY>
```

**Updated config.** Switch to the `http` output and point it at OpenObserve:

```ini
[OUTPUT]
    Name http
    Match *
    URI /api/default/default/_json
    Host <your-openobserve-host>
    Port 443
    tls on
    Format json
    Json_date_key _timestamp
    Json_date_format iso8601
    HTTP_User admin@example.com
    HTTP_Passwd Complexpass#123
    Header Content-Type application/json
```

Copy the exact Fluent Bit configuration from the **Data Sources UI** in OpenObserve.


### From Vector

**Current config:**

```toml
[sinks.datadog]
  type = "datadog_logs"
  inputs = ["logs"]
  default_api_key = "${DD_API_KEY}"
```

**Updated config.** Switch to the `http` sink:

```toml
[sinks.openobserve]
  type = "http"
  inputs = ["logs"]
  uri = "https://<your-openobserve-host>/api/default/default/_json"
  encoding.codec = "json"
  auth.strategy = "basic"
  auth.user = "admin@example.com"
  auth.password = "Complexpass#123"
  request.headers.Content-Type = "application/json"
```

Copy the exact Vector configuration from the **Data Sources UI** in OpenObserve.


### From OTel Collector

If logs already flow through an OTel Collector with the `datadog` exporter, the swap is the same as for metrics and traces.

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

Update the `logs` pipeline's `exporters` list and restart.


### From Direct API Ingest

If applications POST JSON logs directly to `https://http-intake.logs.datadoghq.com/api/v2/logs`, repoint them at OpenObserve's `_json` ingest endpoint:

```
POST https://<your-openobserve-host>/api/{org}/{stream}/_json
Authorization: Basic <base64-creds>
Content-Type: application/json

[
  { "_timestamp": "2026-05-26T12:00:00Z", "level": "info", "message": "hello", "service": "api" }
]
```

The endpoint accepts a JSON array of records and auto-creates the stream on first write.


### From Kubernetes Container Logs

If the Datadog Agent DaemonSet is tailing container logs in your cluster, the simplest replacement is the OpenObserve Collector Helm chart:

```bash
helm repo add openobserve https://charts.openobserve.ai
helm upgrade --install o2c openobserve/openobserve-collector \
  --set exporters.openobserve.endpoint=https://<your-openobserve-host> \
  --set exporters.openobserve.auth=<base64-creds> \
  -n monitoring --create-namespace
```

Copy the exact installation command from the **Data Sources UI** in OpenObserve. Once logs are flowing and dashboards look right, scale the Datadog Agent DaemonSet down.


### From AWS CloudWatch Logs

> **Dedicated guide:** [AWS CloudWatch Logs → OpenObserve](https://openobserve.ai/blog/how-to-send-aws-cloudwatch-logs-to-s3-using-kinesis-data-firehose/)


### From Azure Monitor Logs

> **Dedicated guide:** [Azure Monitor → OpenObserve](https://openobserve.ai/blog/azure-monitor-metrics/)


## Step 4: How to Verify

### Check in the UI

1. Open the OpenObserve UI → **Logs** in the left sidebar.
2. Confirm each log stream from your Datadog inventory appears in the stream list.
3. Run a test query against a known stream: `SELECT * FROM "default"`.
4. Verify field names look correct, especially that structured fields (`level`, `service`, `trace_id`) are parsed as columns, not buried in a raw string.

### Field parsing

If your apps log JSON, OpenObserve auto-parses them into columns. Check that expected fields appear as filterable columns in the Logs explorer. If a field is missing, check whether the raw log line is actually valid JSON.

### Datadog reserved attributes → OpenObserve fields

| Datadog attribute | OpenObserve field |
|---|---|
| `@timestamp` / `timestamp` | `_timestamp` |
| `service` | `service` |
| `host` | `host` |
| `status` (Datadog log status) | `level` (conventional) |
| `dd.trace_id` | `trace_id` |
| `dd.span_id` | `span_id` |
| `ddtags` (comma-separated) | individual columns (after parsing) |

You can normalize these with an OpenObserve **Pipeline** (VRL) at ingest time so existing log queries don't need to change.

### Troubleshooting

- **No streams visible:** Check the shipper's output logs for HTTP errors. Confirm the URI path matches your org (`/api/default/<stream>/_json` for the default org).
- **Fields not parsed:** If logs aren't JSON, add a parser before the exporter (Fluent Bit `parsers.conf`, Vector `remap` transform, OTel `logstransform` processor).
- **`_timestamp` is wrong:** Map your timestamp field to `_timestamp` explicitly (`Json_date_key _timestamp` in Fluent Bit; or a Pipeline `vrl` step in OpenObserve).
- **Auth errors:** Regenerate the Base64 credential string; whitespace in the original input will break it.

## Next Steps

- [OpenObserve Logs User Guide](https://openobserve.ai/docs/user-guide/logs/): exploring streams, running queries, and configuring stream settings in the UI
- [OpenObserve Full-Text Search Functions](https://openobserve.ai/docs/sql-functions/full-text-search/): reference for `match_all()`, `str_match()`, `re_match()`, and more
- [OpenObserve Pipelines](https://openobserve.ai/docs/user-guide/pipelines/): parse, enrich, route, and transform logs at ingest


## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
