---
title: Architecture & Terminology
metaTitle: "LGTM Stack vs OpenObserve - Architecture & Terminology"
description: "How Loki, Grafana, Tempo, and Mimir map to OpenObserve: architecture comparison, terminology reference, and protocol compatibility for LGTM migrations."
---

# LGTM Stack vs OpenObserve: Architecture & Terminology

This page compares the LGTM stack (Loki, Grafana, Tempo, Mimir) with OpenObserve. It shows what changes when you move, how terms map, and which protocols work as they are.

## Architecture: LGTM vs OpenObserve

### Before — LGTM Stack

![LGTM Stack telemetry flow](../../images/migration/lgtm/grafana-stack.png)

**Components to operate: 6+.** You run a Collector, Loki, Mimir, Tempo, Grafana, and object storage. Storage is often MinIO, RustFS, or a separate S3 bucket per component. Each one has its own Helm chart, config format, scaling knobs, and upgrade path.

### After — OpenObserve

![OpenObserve Stack telemetry flow](../../images/migration/lgtm/openobserve-stack.png)

**Components to operate: 2.** You run a Collector and OpenObserve. There is one Helm chart, one config, one storage backend, and one upgrade path.


### What Changes and What Doesn't

The key point: **your data collection layer stays the same**. Your apps, exporters, and agents send telemetry the same way. They don't care if the data ends up in Loki or OpenObserve. Only the destination endpoints change. The table below shows each layer.

| Layer | Changes? | Details |
|---|---|---|
| Applications (your code) | No | OTel SDKs, Prometheus client libraries — unchanged |
| Exporters (node_exporter, cAdvisor, etc.) | No | They expose metrics, they don't care who scrapes |
| Collector (OTel Collector, Alloy, Telegraf) | Config only | Swap exporter endpoints, same receivers and processors |
| Backend (Loki/Mimir/Tempo) | Replaced | By OpenObserve |
| Visualization (Grafana) | Replaced | By OpenObserve's built-in UI |

---

## Terminology Mapping

If you're coming from the LGTM stack, most concepts have a direct match in OpenObserve. The mapping isn't always 1:1. Some things are simpler in OpenObserve, because there's less to name when it all lives in one system.

### Concepts

| LGTM Stack Concept | OpenObserve Equivalent | Notes |
|---|---|---|
| Data Source | Data sources (**Data > Data sources**) | Not the same: a Grafana data source is a backend Grafana queries; OpenObserve's Data sources page holds ready-to-use ingestion configs for each sender (apps, infra, cloud) |
| Loki (log backend) | Logs (built-in) | Logs are a stream type in OpenObserve, not a separate system |
| Mimir (metrics backend) | Metrics (built-in) | Metrics are a stream type in OpenObserve |
| Tempo (trace backend) | Traces (built-in) | Traces are a stream type in OpenObserve |
| Grafana (visualization) | OpenObserve UI (built-in) | Dashboards, exploration, alerting — all in one UI |
| Stream (Loki log stream) | Stream | Same concept — a named flow of data. OpenObserve uses streams for logs, metrics, and traces |
| Label (Loki/Prometheus) | Field / Column | In Loki, labels are indexed keys. In OpenObserve, every field is queryable via SQL |
| LogQL | SQL | OpenObserve uses SQL for log queries (with functions like `match_all()`, `re_match()`) |
| PromQL | PromQL | Same — OpenObserve supports PromQL for metrics queries |
| TraceQL | SQL | OpenObserve uses SQL for trace queries |
| Alertmanager | OpenObserve Alerts | Built-in alerting under **Reliability > Alerts**, with Slack, email, PagerDuty, webhook support |
| Tenant / Org (Mimir multi-tenancy) | Organization | OpenObserve uses orgs for multi-tenancy (default org is `default`) |
| Grafana Agent / Alloy | OpenObserve Collector (optional) | OTel-based collector optimized for OpenObserve. Or keep using any OTel-compatible collector |
| Promtail | No equivalent needed | Replace with OTel Collector or Fluent Bit — Promtail is Loki-specific |
| Chunk Store (Loki) | Apache Parquet files | OpenObserve stores data as columnar Parquet files in object storage |
| TSDB blocks (Mimir) | Apache Parquet files | Same — unified columnar storage for all signal types |
| Grafana Dashboard | OpenObserve Dashboard | Built-in drag-and-drop dashboard builder with 18+ chart types |

### Protocol Compatibility

The key point for migration: **OpenObserve speaks the same ingestion protocols your data sources already use**. You don't change how data is collected. You only change where it's sent.

| Protocol | LGTM Endpoint | OpenObserve Endpoint |
|---|---|---|
| Prometheus Remote Write | `http://mimir:9009/api/v1/push` | `http://openobserve:5080/api/default/prometheus/api/v1/write` |
| OTLP HTTP | `http://tempo:4318` | `http://openobserve:5080/api/default/` |
| OTLP gRPC | `tempo:4317` | `openobserve:5081` |
| Loki Push API | `http://loki:3100/loki/api/v1/push` | `http://openobserve:5080/api/{org}/loki/api/v1/push` |
| JSON over HTTP | N/A | `http://openobserve:5080/api/default/<stream>/_json` |

---

## Next Steps

- [Migrating Metrics](metrics.md): Start with metrics. It is the simplest endpoint swap.
- [Migrating Traces](traces.md): This is usually the easiest signal, since most setups already use OTLP.
- [Migrating Logs](logs.md): Move your log sources from Loki.

---

[Back to Overview](index.md) | Next: [Migrating Metrics](metrics.md)
