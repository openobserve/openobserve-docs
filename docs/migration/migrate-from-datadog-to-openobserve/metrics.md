---
title: Migrate Metrics from Datadog to OpenObserve (Agent, DogStatsD, OTel)
description: Migrate Datadog metrics to OpenObserve using the OpenTelemetry Collector. Covers DogStatsD, Datadog Agent forwarding, OTel Collector swaps, Kubernetes (Datadog Helm chart), AWS CloudWatch, and Azure Monitor.
---

# Migrating Metrics

## Overview

This section walks you through migrating metrics from Datadog to OpenObserve. You will:

1. Assess what metric sources you currently have
2. Identify the migration path for each source type
3. Update configs so metrics flow into OpenObserve (via the OpenTelemetry Collector when needed)
4. Validate that metrics are flowing correctly

The recommended pattern is to introduce an **OpenTelemetry Collector** in front of OpenObserve. The Collector accepts Datadog wire formats (DogStatsD, Datadog Agent API) and exports OTLP to OpenObserve. Application code does not change.

## Step 1: Assess Your Current Metric Sources

Group your Datadog metrics by how they're emitted today:

| Source Type | Examples | Migration Path |
|---|---|---|
| **DogStatsD from applications** | Custom counters/gauges/histograms via `statsd` clients | [Point apps at OTel Collector `statsd` receiver](#from-dogstatsd) |
| **Datadog Agent (host + integrations)** | `system.cpu.user`, integration metrics, custom checks | [Use the OTel Collector `datadog` receiver](#from-datadog-agent) |
| **APM / dd-trace metrics** | Runtime metrics from `dd-trace-*` SDKs | [Switch to OTel SDK or keep Agent and Collector](#from-dd-trace-runtime-metrics) |
| **Kubernetes (Datadog Helm chart)** | DaemonSet Agent, Cluster Agent | [Repoint Agent or replace with OTel Collector](#from-kubernetes-datadog-helm-chart) |
| **OTel Collector already in use** | `datadog` exporter sending to Datadog | [Swap exporter to `otlphttp`](#from-otel-collector) |
| **AWS CloudWatch metrics** | Datadog AWS integration | [Ingest CloudWatch directly into OpenObserve](#from-aws-cloudwatch) |
| **Azure Monitor metrics** | Datadog Azure integration | [Ingest Azure Monitor directly into OpenObserve](#from-azure-monitor) |

## Step 2: Stand Up an OpenTelemetry Collector

Install the **contrib** distribution (the upstream `otelcol-contrib` binary), which includes the `statsd`, `datadog`, and `otlphttp` components you need.

```bash
curl --proto '=https' --tlsv1.2 -fOL \
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.1/otelcol-contrib_0.115.1_linux_amd64.tar.gz

tar -xvf otelcol-contrib_0.115.1_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --version
```

Get the exact `Authorization` header and endpoint URL for the OTLP exporter from the OpenObserve UI under **Data Sources > Custom > Metrics > OTel Collector**.

## Step 3: Migrate Each Source

### From DogStatsD

This is the most common Datadog custom-metrics path. Your apps emit lines like `my.counter:1|c|#env:prod` over UDP `8125`. The Datadog Agent listens on that port today; the OTel Collector's `statsd` receiver listens on the same port and translates to OTLP. Your application code does not change.

**Collector config:**

```yaml
receivers:
  statsd:
    endpoint: "0.0.0.0:8125"
    aggregation_interval: 60s
    enable_metric_type: true
    timer_histogram_mapping:
      - statsd_type: "timing"
        observer_type: "histogram"
        histogram:
          max_size: 100
      - statsd_type: "histogram"
        observer_type: "histogram"
        histogram:
          max_size: 100

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
    metrics:
      receivers: [statsd]
      processors: [batch]
      exporters: [otlphttp/openobserve]
```

**Cutover:** Stop the Datadog Agent's DogStatsD listener (set `use_dogstatsd: false` in `/etc/datadog-agent/datadog.yaml`) and start the OTel Collector on UDP port `8125`. Apps continue to send to `localhost:8125`, but the Collector receives instead of the Agent. No app changes.

If you want to dual-write to both Datadog and OpenObserve during validation, run the Collector's `statsd` receiver on a **different port** (e.g., `18125`) and forward DogStatsD packets from the Agent to that port:

```yaml
# /etc/datadog-agent/datadog.yaml
dogstatsd_forward_host: localhost
dogstatsd_forward_port: 18125
```

Then update the Collector's `statsd` receiver endpoint to `0.0.0.0:18125` to match.

**Datadog-to-OpenTelemetry metric-type mapping** (handled automatically by the receiver):

| DogStatsD | OpenTelemetry |
|---|---|
| Gauge (`g`) | Gauge |
| Count (`c`) | Sum (monotonic, cumulative) |
| Rate | Sum (monotonic, delta) |
| Distribution (`d`) | Exponential Histogram |
| Timing / Histogram (`ms`, `h`) | Histogram |

**Test:**

```bash
echo "test.metric:42|c|#myKey:myVal" | nc -w 1 -u localhost 8125
```

The metric `test_metric` (DogStatsD `.` becomes `_` in PromQL) should appear in OpenObserve under the configured stream.


### From Datadog Agent

If the Datadog Agent is doing more than DogStatsD (host metrics, integrations like Postgres, Redis, Nginx, custom checks), keep the Agent for now and use the OTel Collector's `datadog` receiver to accept the Agent's outbound payloads.

**Collector config:**

The contrib `datadog` receiver listens on a single HTTP endpoint and accepts both the Agent's metric series API and the APM trace intake. Wire it into both a `metrics` and a `traces` pipeline:

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
    metrics:
      receivers: [datadog]
      processors: [batch]
      exporters: [otlphttp/openobserve]
    traces:
      receivers: [datadog]
      processors: [batch]
      exporters: [otlphttp/openobserve]
```

**Repoint the Datadog Agent at the local Collector.** Edit `/etc/datadog-agent/datadog.yaml`:

```yaml
# Send metrics and APM traces to the local OTel Collector instead of Datadog SaaS
dd_url: http://localhost:8126
apm_config:
  apm_dd_url: http://localhost:8126
```

The Datadog Agent's logs forwarder uses a separate TCP framed protocol that the OTel `datadog` receiver does not accept. For logs, use Fluent Bit, Vector, or the OpenObserve Collector instead. See [Migrating Logs](logs.md).

Restart the Agent:

```bash
sudo systemctl restart datadog-agent
```

The Agent will keep collecting integration data, but now ships it to the Collector instead of `api.datadoghq.com`. The Collector translates to OTLP and forwards to OpenObserve.


### From dd-trace Runtime Metrics

`dd-trace-*` SDKs emit runtime metrics (heap, GC, goroutines, threadpool) alongside spans. These are normally collected by the Agent on port `8125` (DogStatsD).

Two options:

1. **Keep the SDK, route through the Collector.** The same `statsd` receiver above ingests these metrics. No code changes.
2. **Switch to the OpenTelemetry SDK.** Use `opentelemetry-*` libraries to emit OTLP metrics directly. This is the longer-term direction once your dashboards and alerts work against OpenObserve.


### From Kubernetes (Datadog Helm chart)

If you deployed the Datadog Agent as a DaemonSet via the `datadog/datadog` Helm chart, the simplest path is to keep the chart and repoint the Agent at an in-cluster OTel Collector.

**Deploy an OTel Collector DaemonSet** in the same namespace:

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  --set mode=daemonset \
  --values otel-values.yaml \
  -n monitoring
```

`otel-values.yaml` uses the `statsd` + `datadog` receivers and the `otlphttp` exporter shown above.

**Update Datadog Helm values** to send the Agent's traffic to the Collector service:

```yaml
datadog:
  apiKey: "any-string-will-do"  # required by chart, not used downstream
  dd_url: "http://otel-collector.monitoring.svc.cluster.local:8126"
  apm:
    enabled: true
    apm_dd_url: "http://otel-collector.monitoring.svc.cluster.local:8126"
```

```bash
helm upgrade datadog datadog/datadog -f values.yaml -n monitoring
```

Alternatively, replace the Datadog Agent DaemonSet entirely with the [OpenObserve Collector Helm chart](https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve-collector/README.md).


### From OTel Collector

If you already run an OpenTelemetry Collector that ships to Datadog via the `datadog` exporter, the migration is a one-exporter swap.

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

Update the pipeline `exporters:` list to point at `otlphttp/openobserve` and restart the Collector. Copy the exact configuration from the **Data Sources UI** in OpenObserve.


### From AWS CloudWatch

The Datadog AWS integration mirrors CloudWatch metrics into Datadog. To migrate, ingest CloudWatch directly into OpenObserve:

> **Dedicated guide:** [AWS CloudWatch Metrics → OpenObserve](https://openobserve.ai/blog/monitor-aws-rds-with-cloudwatch-metrics/)


### From Azure Monitor

The Datadog Azure integration mirrors Azure Monitor metrics into Datadog. To migrate, ingest Azure Monitor directly into OpenObserve:

> **Dedicated guide:** [Azure Monitor Metrics → OpenObserve](https://openobserve.ai/blog/azure-monitor-metrics/)


## Step 4: How to Verify

### Check in the UI

1. Open the OpenObserve UI → **Metrics** in the left sidebar.
2. Confirm each metric from your Datadog inventory appears. DogStatsD metrics have `.` translated to `_` (e.g. `my.counter` → `my_counter`).
3. Run a test PromQL query (e.g. `sum(rate(my_counter[1m]))`) and compare values to the equivalent Datadog query.
4. Confirm tags (Datadog) come through as labels (OpenObserve).

### Dual-write comparison

During the migration window, keep the Datadog Agent active and send the same metrics to both backends. Plot the same series side by side and watch for:

- **Counter vs. cumulative-sum drift.** Datadog Rate maps to OTel delta Sum; Datadog Count maps to OTel cumulative Sum. Most dashboards Just Work, but recording rules that assume specific aggregation may need tweaks.
- **Histogram bucket shape.** Distributions become Exponential Histograms; percentile values match closely but won't be bit-identical.
- **Tag-to-label name normalization.** Datadog tags with dashes or dots become labels with underscores.

### Troubleshooting

- **No data:** Check the Collector logs for receiver errors or auth failures. Confirm the OTLP exporter endpoint and `Authorization` header.
- **Buffer overflow / dropped batches:** Increase batch size and timeout:

  ```yaml
  processors:
    batch:
      send_batch_size: 20000
      timeout: 20s
  ```
- **Verify connectivity:**

  ```bash
  nc -zv localhost 8125
  ```
- **Inspect DogStatsD traffic at the Agent:**

  ```bash
  sudo tail -f /var/log/datadog/dogstatsd.log
  ```
- **Case mismatch in PromQL:** OpenObserve label matching is case-sensitive. Confirm tag values match exactly as ingested.

## PromQL Compatibility

OpenObserve supports PromQL for metrics queries. Common Datadog-equivalent patterns:

| Datadog query | OpenObserve PromQL |
|---|---|
| `avg:system.cpu.user{*}` | `avg(system_cpu_user)` |
| `sum:http.requests{service:api}.as_rate()` | `sum(rate(http_requests{service="api"}[1m]))` |
| `p95:trace.servlet.request{*}` | `histogram_quantile(0.95, sum by (le)(rate(trace_servlet_request_bucket[5m])))` |

Functions like `rate()`, `histogram_quantile()`, `sum by()`, and label matchers work as expected.

## Next Steps

- [Migrating Traces](traces.md): migrate Datadog APM next
- [Migrating Logs](logs.md): migrate your log sources


[Back to Overview](index.md) | Previous: [Architecture & Terminology](architecture.md) | Next: [Migrating Traces](traces.md)
