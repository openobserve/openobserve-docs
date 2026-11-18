---
title: Architecture & Terminology
metaTitle: "Datadog vs OpenObserve - Architecture & Terminology"
description: "How Datadog Agent, DogStatsD, and APM components map to OpenObserve: architecture comparison, terminology, and protocol compatibility."
---

# Datadog vs OpenObserve: Architecture & Terminology

This page compares a Datadog setup with OpenObserve. It shows what changes when you move, how Datadog terms map to OpenObserve, and which protocols still work.

## Architecture: Datadog vs OpenObserve

### Before: Datadog

A typical Datadog deployment looks like this:

- **Datadog Agent** runs on every host (or as a DaemonSet on Kubernetes). It collects host metrics, integration metrics, logs, traces (via APM), and process data.
- **DogStatsD** is built into the Agent on UDP port `8125`. It accepts custom app metrics.
- **APM tracers** (`dd-trace-java`, `dd-trace-py`, `dd-trace-go`, etc.) run inside your apps. They send spans to the Agent over port `8126`.
- The Agent ships everything to the **Datadog SaaS backend**. It uses Datadog's own HTTPS APIs.
- You manage **dashboards, monitors, notebooks, and SLOs** in the Datadog UI.

Components to operate: the Agent fleet, plus any log forwarders you've added on top (Vector, Fluent Bit, custom forwarders). Datadog owns all ingestion and storage.

### After: OpenObserve

The migration adds an **OpenTelemetry Collector** in front of OpenObserve. It acts as a translation layer. The Collector accepts data in Datadog wire formats (DogStatsD, Datadog Agent API, Datadog APM). It then exports that data to OpenObserve in OTLP.

- **Datadog Agent** (optional) still collects host and integration data. But it now forwards to the local OTel Collector instead of Datadog SaaS.
- **DogStatsD clients** in your apps send metrics unchanged. The OTel Collector's `statsd` receiver listens on port `8125`, just like the Datadog Agent did.
- **APM tracers** still send spans. The Collector's `datadog` receiver turns them into OTLP.
- **OpenTelemetry Collector** turns everything into OTLP and exports it to OpenObserve.
- **OpenObserve** stores everything as columnar Parquet in your own object storage (S3/GCS/Azure Blob/local disk).

Components to operate: **2**, the OTel Collector and OpenObserve. The Datadog Agent can stay during migration. Or the OTel Collector can replace it fully.

### What Changes and What Doesn't

**Your application code does not change.** DogStatsD calls, APM tracer setup, and log output stay exactly as they are. Only the destination endpoints change. The table below shows each layer.

| Layer | Changes? | Details |
|---|---|---|
| Applications (your code) | No | `dd-trace-*` libraries and `statsd` clients keep working unchanged |
| Datadog Agent | Optional | Can stay during dual-write; eventually replaced by OTel Collector |
| OTel Collector | New | Acts as the Datadog-to-OTLP translator |
| Backend (Datadog SaaS) | Replaced | By OpenObserve |
| Visualization (Datadog UI) | Replaced | By OpenObserve's built-in UI |


## Terminology Mapping

If you're coming from Datadog, most concepts have a direct match in OpenObserve. The mapping isn't always 1:1. Datadog gives many features their own product names. In OpenObserve, these are general features.

### Concepts

| Datadog Concept | OpenObserve Equivalent | Notes |
|---|---|---|
| Datadog Agent | OpenTelemetry Collector (or OpenObserve Collector) | OTel Collector with Datadog receivers handles ingestion. Or use the OpenObserve Collector for an OTel-native setup |
| DogStatsD | OTel Collector `statsd` receiver | Same UDP port `8125`, same line protocol, no app changes |
| Datadog APM | OTel Collector `datadog` receiver to OTLP traces | `dd-trace-*` SDKs keep working; traces become OTLP downstream |
| Datadog Logs | OpenObserve Logs (built-in stream type) | Ingested via OTLP, Loki Push API, JSON, Fluent Bit, Vector, etc. |
| Datadog Metrics | OpenObserve Metrics (built-in stream type) | PromQL-compatible |
| Datadog Traces | OpenObserve Traces (built-in stream type) | OTLP-native |
| Datadog Dashboards | OpenObserve Dashboards | Built-in dashboard builder with 18+ chart types |
| Datadog Monitors | OpenObserve Alerts | PromQL or SQL-based, under **Reliability > Alerts**; Slack/PagerDuty/Email/Webhook destinations |
| Datadog Notebooks | OpenObserve Dashboards + SQL queries | Combine narrative panels with live queries |
| Datadog SLOs | OpenObserve SLOs | Count, time-slice, or alert-based SLOs under **Reliability > SLOs**, with burn-rate and error-budget alerts |
| Datadog Watchdog | Anomaly detection alerts *(Enterprise and Cloud)* or explicit thresholds | Watchdog is Datadog-proprietary; OpenObserve anomaly detection learns a baseline per alert |
| Datadog Hosts | Streams + `service_name` / host fields | OpenObserve doesn't charge per host; there is no host concept in billing |
| Datadog Tags | Labels / fields | Tags become labels on metrics (PromQL) or columns on logs/traces (SQL) |
| Custom Metrics | Same, sent via DogStatsD or OTLP | No per-metric pricing |
| Datadog Pipelines (log processing) | OpenObserve Pipelines (VRL-based) | Parse, enrich, route, and transform logs in-flight |
| Datadog Live Tail | Logs **Auto Refresh** | Re-runs the Logs search on an interval for a near-real-time view |
| Organization / Account | Organization | OpenObserve uses orgs for multi-tenancy (default org is `default`) |

### Protocol Compatibility

**OpenObserve can accept Datadog's wire formats through the OTel Collector.** It also speaks open ingestion protocols natively. You don't change how data is collected. You just route it through a translation layer.

| Protocol | Datadog Endpoint | OpenObserve / Collector Endpoint |
|---|---|---|
| DogStatsD | `localhost:8125` (UDP, Agent) | `localhost:8125` (UDP, OTel Collector `statsd` receiver) |
| Datadog APM (trace intake) | `localhost:8126` (Agent) | `localhost:8126` (OTel Collector `datadog` receiver) |
| Datadog Agent metrics API | `https://api.datadoghq.com/api/v1/series` | OTel Collector `datadogreceiver` to OTLP to OpenObserve |
| OTLP HTTP | (Datadog supports OTLP) | `http://openobserve:5080/api/default/` |
| OTLP gRPC | (Datadog supports OTLP) | `openobserve:5081` |
| Prometheus Remote Write | N/A in Datadog | `http://openobserve:5080/api/default/prometheus/api/v1/write` |
| Loki Push API | N/A in Datadog | `http://openobserve:5080/api/{org}/loki/api/v1/push` |
| JSON over HTTP | N/A in Datadog | `http://openobserve:5080/api/default/<stream>/_json` |

### Metric Type Mapping

Datadog and OpenTelemetry use different names for metric types. The OTel Collector handles the translation. Still, it helps to know what becomes what:

| Datadog Type | OpenTelemetry Type | Notes |
|---|---|---|
| Gauge | Gauge | Same semantics |
| Count | Sum (monotonic, cumulative) | Datadog Count maps to OTel cumulative Sum |
| Rate | Sum (monotonic, delta) | Datadog Rate maps to OTel delta Sum |
| Distribution | Exponential Histogram | Datadog Distributions become OTel Exponential Histograms |
| Histogram (timing) | Histogram | Configurable bucket strategy in the `statsd` receiver |


## Next Steps

- [Migrating Metrics](metrics.md): Start with metrics, the most common Datadog signal.
- [Migrating Traces](traces.md): Move Datadog APM to OTLP.
- [Migrating Logs](logs.md): Move log sources from Datadog.


## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community).
- Or [Contact support](https://openobserve.ai/contact-us/).
