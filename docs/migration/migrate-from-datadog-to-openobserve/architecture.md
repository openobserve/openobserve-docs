---
title: Datadog vs OpenObserve Architecture - Migration Path & Terminology | OpenObserve
description: How Datadog Agent, DogStatsD, and APM components map to OpenObserve. Architecture comparison, terminology reference, and protocol compatibility for migrating off Datadog.
---

# Architecture & Terminology

## Architecture: Datadog vs OpenObserve

### Before: Datadog

A typical Datadog deployment looks like this:

- **Datadog Agent** runs on every host (or as a DaemonSet on Kubernetes). It collects host metrics, integration metrics, logs, traces (via APM), and process data.
- **DogStatsD**, embedded in the Agent on UDP port `8125`, accepts custom application metrics.
- **APM tracers** (`dd-trace-java`, `dd-trace-py`, `dd-trace-go`, etc.) embedded in your apps send spans to the Agent over port `8126`.
- The Agent ships everything to the **Datadog SaaS backend** via Datadog-proprietary HTTPS APIs.
- **Dashboards, monitors, notebooks, and SLOs** are managed in the Datadog UI.

Components to operate: the Agent fleet, plus whatever shipping/log forwarders you've layered on top (Vector, Fluent Bit, custom forwarders). All ingestion and storage is owned by Datadog.

### After: OpenObserve

The migration introduces an **OpenTelemetry Collector** as a translation layer in front of OpenObserve. The Collector accepts data in Datadog wire formats (DogStatsD, Datadog Agent API, Datadog APM) and exports it to OpenObserve in OTLP.

- **Datadog Agent** (optionally retained) continues to collect host and integration data, but now forwards to the local OTel Collector instead of Datadog SaaS.
- **DogStatsD clients** in your apps emit metrics unchanged. The OTel Collector's `statsd` receiver listens on port `8125` just like the Datadog Agent did.
- **APM tracers** continue to emit spans; the Collector's `datadog` receiver translates them into OTLP.
- **OpenTelemetry Collector** translates everything into OTLP and exports to OpenObserve.
- **OpenObserve** stores everything as columnar Parquet in your own object storage (S3/GCS/Azure Blob/local disk).

Components to operate: **2**, the OTel Collector and OpenObserve. The Datadog Agent can stay during migration or be replaced by the OTel Collector entirely.

### What Changes and What Doesn't

**Your application code does not change.** DogStatsD calls, APM tracer instrumentation, and log emission stay exactly as they are. Only the destination endpoints change.

| Layer | Changes? | Details |
|---|---|---|
| Applications (your code) | No | `dd-trace-*` libraries and `statsd` clients keep working unchanged |
| Datadog Agent | Optional | Can stay during dual-write; eventually replaced by OTel Collector |
| OTel Collector | New | Acts as the Datadog-to-OTLP translator |
| Backend (Datadog SaaS) | Replaced | By OpenObserve |
| Visualization (Datadog UI) | Replaced | By OpenObserve's built-in UI |


## Terminology Mapping

If you're coming from Datadog, most concepts have direct equivalents in OpenObserve. The mapping isn't always 1:1. Datadog has many product-named features that become generic capabilities in OpenObserve.

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
| Datadog Monitors | OpenObserve Alerts | PromQL or SQL-based; Slack/PagerDuty/Email/Webhook destinations |
| Datadog Notebooks | OpenObserve Dashboards + SQL queries | Combine narrative panels with live queries |
| Datadog SLOs | Scheduled pipelines + alerts | Pre-aggregate the SLI, alert on burn rate |
| Datadog Watchdog | Manual alerts (no AI auto-detect today) | Watchdog is Datadog-proprietary; configure explicit thresholds in OpenObserve |
| Datadog Hosts | Streams + service.name field | OpenObserve doesn't charge per host; there is no host concept in billing |
| Datadog Tags | Labels / fields | Tags become labels on metrics (PromQL) or columns on logs/traces (SQL) |
| Custom Metrics | Same, sent via DogStatsD or OTLP | No per-metric pricing |
| Datadog Pipelines (log processing) | OpenObserve Pipelines (VRL-based) | Parse, enrich, route, and transform logs in-flight |
| Datadog Live Tail | OpenObserve Logs Live Mode | Real-time log streaming in the Logs explorer |
| Organization / Account | Organization | OpenObserve uses orgs for multi-tenancy (default org is `default`) |

### Protocol Compatibility

**OpenObserve can accept Datadog's wire formats through the OTel Collector**, and it natively speaks open ingestion protocols. You're not changing how data is collected; you're routing it through a translation layer.

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

Datadog and OpenTelemetry use different vocabularies for metric types. The OTel Collector handles the translation, but it helps to know what becomes what:

| Datadog Type | OpenTelemetry Type | Notes |
|---|---|---|
| Gauge | Gauge | Same semantics |
| Count | Sum (monotonic, cumulative) | Datadog Count maps to OTel cumulative Sum |
| Rate | Sum (monotonic, delta) | Datadog Rate maps to OTel delta Sum |
| Distribution | Exponential Histogram | Datadog Distributions become OTel Exponential Histograms |
| Histogram (timing) | Histogram | Configurable bucket strategy in the `statsd` receiver |


## Next Steps

- [Migrating Metrics](metrics.md): start with metrics, the most common Datadog signal
- [Migrating Traces](traces.md): migrate Datadog APM to OTLP
- [Migrating Logs](logs.md): migrate log sources from Datadog


## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
