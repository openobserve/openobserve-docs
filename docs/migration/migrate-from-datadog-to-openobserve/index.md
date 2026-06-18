---
title: Migrate from Datadog to OpenObserve | Complete Migration Guide
description: Step-by-step guide to migrate metrics, traces, logs, dashboards, and monitors from Datadog to OpenObserve. Use the OpenTelemetry Collector to route Datadog Agent, DogStatsD, APM, and log data into OpenObserve without rewriting your applications.
---

# Migrate from Datadog to OpenObserve

If you're running Datadog today (Datadog Agent shipping metrics, traces, and logs to the Datadog SaaS) and you want to move to OpenObserve, this guide walks you through the entire migration, signal by signal, source by source.

The goal is to switch the backend with minimal disruption: in most cases the Datadog Agent stays in place and only the destination changes, routed through an OpenTelemetry Collector that translates Datadog protocols into OTLP.

## Table of Contents

1. [Overview](index.md): why migrate and what changes
2. [Architecture & Terminology](architecture.md): how Datadog concepts map to OpenObserve
3. [Migrating Metrics](metrics.md): migrate Datadog Agent, DogStatsD, and OTel-based metric sources
4. [Migrating Traces](traces.md): migrate Datadog APM to OTLP
5. [Migrating Logs](logs.md): migrate Datadog Agent logs, Fluent Bit, and Vector
6. [Migrating Dashboards & Monitors](dashboards-and-alerts.md): recreate Datadog dashboards and monitors


## Why Migrate?

Datadog is a capable platform, but for teams running at scale the cost curve, the lock-in, and the operational opacity become real constraints. Migrating to OpenObserve typically comes down to a few drivers.

### Cost at scale

Datadog bills per host, per ingested GB of logs, per custom metric, per APM span, and per indexed log. Once you cross even a moderate footprint (a few hundred hosts, a few TB of logs per month, a few thousand custom metrics), the monthly invoice climbs faster than the value most teams get from it. Reserved hosts, log retention tiers, and Watchdog all add line items.

OpenObserve runs on Apache Parquet over object storage (S3, GCS, Azure Blob, local disk). Storage is **up to 140x more efficient, and therefore cheaper**, than typical hosted observability backends, and there are no per-metric, per-span, or per-host fees.

### Vendor lock-in

Datadog's wire formats (the Agent HTTPS API, the trace intake, the log intake), the DogStatsD dialect, the monitor DSL, and the dashboard JSON are all proprietary. Once you've built dashboards, monitors, and integrations against them, switching costs feel high.

OpenObserve speaks open protocols: **OpenTelemetry (OTLP)** for metrics, traces, and logs, plus **Prometheus Remote Write**, **Loki Push API**, and **plain JSON over HTTP**. If you ever want to leave OpenObserve, your collectors keep working. Only the endpoint changes.

### Data ownership

In Datadog your raw telemetry lives on their cluster. You can query it through their UI and API, but you can't cheaply backfill, re-process, or join it with the rest of your data. OpenObserve stores raw events as Parquet in your own bucket. You can query it from OpenObserve, but you can also read it directly from any tool that speaks Parquet (Athena, Spark, DuckDB, Trino). The data is yours.

### One system instead of many product SKUs

Datadog is sold as a bundle of products (Infrastructure, APM, Logs, RUM, Synthetics, CSPM, Watchdog), each priced separately and each with its own data model and quirks. In OpenObserve, logs/metrics/traces are stream types in one unified store, queried with the same UI and the same query engine.

## What OpenObserve Changes

| | Datadog | OpenObserve |
|---|---|---|
| **Pricing model** | Per-host, per-GB, per-custom-metric, per-span | Storage + compute only, no per-host or per-metric fees |
| **Storage backend** | Datadog-managed (opaque) | Apache Parquet on S3 / GCS / Azure Blob / local disk |
| **Storage cost** | High at scale, retention tiers | Up to 140x efficient storage |
| **Query languages** | Datadog query DSL + log search syntax | SQL + PromQL |
| **Wire protocols** | DogStatsD, Datadog Agent API, trace intake | OTLP (HTTP/gRPC), Prometheus Remote Write, Loki Push API, JSON over HTTP |
| **Lock-in** | Proprietary formats end-to-end | Open standards; your data sits in your bucket as Parquet |
| **Deployment** | SaaS only | Self-host (single binary or Helm chart) or OpenObserve Cloud |
| **Multi-signal correlation** | Yes, within Datadog | Yes, unified UI across logs, metrics, traces |

## Before You Start

Before changing any configs, inventory what you're running:

- **Datadog Agents:** how many, and which integrations are enabled per host (look in `/etc/datadog-agent/conf.d/`).
- **DogStatsD usage:** which applications emit custom metrics via DogStatsD (port `8125` by default).
- **APM tracers:** which services use `dd-trace-*` libraries (Java, Python, Node.js, Go, Ruby, .NET, PHP).
- **Log pipelines:** how logs reach Datadog today, whether Agent log collection, Fluent Bit/Vector with Datadog output, direct API ingest, or cloud integrations (CloudWatch, Azure Monitor).
- **Dashboards & monitors:** export them via the Datadog API now so you have a static record to recreate against.

A migration path exists for every one of these. See the per-signal pages.

## Set Up OpenObserve

Before migrating signal by signal, get OpenObserve running:

=== "OpenObserve Cloud"

    Sign up at [cloud.openobserve.ai](https://cloud.openobserve.ai). No infrastructure to manage.

    After logging in, navigate to **Data Sources** to find your ingestion credentials and endpoint URLs.

=== "Self-Hosted"

    Download OpenObserve for your platform from the [downloads page](https://openobserve.ai/downloads/).

    After installation, access the UI at `http://localhost:5080` and navigate to **Data Sources** to find your ingestion credentials and ready-to-use configuration snippets.

## Migration Strategy

The recommended order:

1. **Stand up an OpenTelemetry Collector** alongside your existing Datadog Agent fleet. The Collector becomes the translation layer between Datadog wire formats (DogStatsD, Datadog Agent API, Datadog APM intake) and OTLP.
2. **Dual-write for a short period.** Point the Datadog Agent and OTel Collector at the same applications so you can compare metrics side by side in Datadog and OpenObserve. This catches any mapping issues (counter vs. sum, histogram bucketing) before you cut over.
3. **Migrate signal by signal**, starting with metrics, then traces, then logs. Each signal is independent, so you can finish one before starting the next.
4. **Recreate dashboards and monitors** in OpenObserve. There is no automatic converter, but PromQL/SQL equivalents are direct in most cases, and the OpenObserve AI Assistant can translate query syntax for you.
5. **Decommission Datadog Agents** once dashboards, monitors, and on-call workflows have been moved over.

## Next Steps

- [Architecture & Terminology](architecture.md): how the stack maps across and what terminology changes
- [Migrating Metrics](metrics.md): Datadog Agent, DogStatsD, OTel Collector
- [Migrating Traces](traces.md): migrate Datadog APM to OTLP
- [Migrating Logs](logs.md): migrate Datadog Agent logs and shipper-based pipelines
- [Migrating Dashboards & Monitors](dashboards-and-alerts.md): recreate Datadog dashboards and monitors


## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
