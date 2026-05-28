---
title: OpenObserve as a Datadog Alternative | Comparison
description: How OpenObserve compares to Datadog on per-host pricing, custom metrics fees, vendor lock-in, OpenTelemetry support, and data ownership. Feature comparison and migration guidance for teams moving off Datadog.
---

# OpenObserve as a Datadog Alternative

Datadog is a capable, polished observability platform. For teams running at scale, the per-host pricing, the per-custom-metric fees, and the proprietary agent/format combo are the most common reasons to look at alternatives. This page summarizes how OpenObserve compares.

If you're ready to plan a migration, see the [Datadog to OpenObserve Migration Guide](../../migration/migrate-from-datadog-to-openobserve/index.md) for step-by-step instructions covering metrics, traces, logs, dashboards, and monitors.

## Why Teams Consider Moving Off Datadog

### Per-host pricing

Datadog's Infrastructure tier bills **per host per month**, with separate per-host fees for APM and other products. A few hundred hosts becomes a sizeable monthly invoice before any data volume is considered.

OpenObserve has **no per-host fee**. Pricing is ingest-based only. Doubling your host count without changing telemetry volume doesn't change cost.

### Custom metrics fees

Datadog charges per **custom metric** (above the included quota). The fee is small per metric but multiplies quickly across high-cardinality services. Teams routinely rein in instrumentation to dodge metric-count overage.

OpenObserve includes **unlimited custom metrics**. There is no per-metric line item.

### Vendor lock-in

Datadog's wire formats (the Agent HTTPS API, DogStatsD, the APM trace intake, the log intake) are proprietary. Once you've built dashboards, monitors, and integrations against them, the switching cost feels high.

OpenObserve speaks open protocols end to end: **OpenTelemetry (OTLP)** for all signals, plus Prometheus Remote Write, Loki Push API, and JSON over HTTP. The instrumentation you do for OpenObserve works against any OTel-compatible backend.

### Fragmented product SKUs

Datadog is sold as a bundle of distinct products (Infrastructure, APM, Logs, RUM, Synthetics, CSPM, Watchdog), each priced separately, each with its own data model and quirks. In OpenObserve, logs/metrics/traces are stream types in one unified store with one UI and one query engine.

### Data ownership

In Datadog, raw telemetry lives on Datadog's cluster. You can query it through their UI and API but can't cheaply backfill, re-process, or join it against the rest of your data.

In OpenObserve, raw events live as **Apache Parquet in your bucket**: S3, GCS, Azure Blob, MinIO, or local disk. Any tool that reads Parquet can read your telemetry data.

## Feature Comparison

| Feature | Datadog | OpenObserve |
|---|---|---|
| Logs | Yes | Yes |
| Metrics | Yes | Yes |
| Traces | Yes | Yes |
| Open source | No | Yes |
| Dashboards | Yes | Yes |
| Alerts | Yes | Yes |
| Pipelines | Yes | Yes |
| OpenTelemetry native | Partial | Full |
| Per-host pricing | $15 to $27 / host / month | $0 |
| Custom metrics | Per-metric overage above quota | Unlimited, included |
| Self-hosted option | No | Yes |
| Bring your own storage | No | Yes (S3, GCS, Azure Blob, MinIO) |
| IAM & SSO | Enterprise tier only | Included (SAML, OIDC, LDAP, role-based access) |

## Architectural Differences

| Layer | Datadog | OpenObserve |
|---|---|---|
| Ingest agents | Datadog Agent (proprietary) | OpenTelemetry Collector, OTel SDKs, Fluent Bit, Vector |
| Custom metric protocol | DogStatsD (proprietary dialect) | OTLP, Prometheus Remote Write, OTel `statsd` receiver |
| APM trace protocol | Datadog APM intake (`dd-trace-*`) | OTLP (with OTel Collector `datadog` receiver as a translation layer for existing `dd-trace` SDKs) |
| Storage | Datadog-managed (opaque) | Apache Parquet on object storage |
| Query | Datadog query DSL + log search syntax | SQL + PromQL |
| Visualization | Datadog UI | OpenObserve UI (built-in) |
| Deployment | SaaS only | Self-host or OpenObserve Cloud |

## Cost Profile

Datadog cost is dominated by **per-host + per-product + per-custom-metric** line items, with ingest-based add-ons for logs. Adding hosts or custom dimensions to a metric increases cost without any change in data volume.

OpenObserve cost is dominated by **ingest + object storage + query compute**. There are no per-host, per-user, or per-metric fees. The architecture is designed so that:

- Long retention is cheap (object storage rates)
- High host counts don't multiply cost
- High-cardinality custom metrics don't multiply cost

## What Stays the Same

Migrating off Datadog typically does **not** require re-instrumenting your applications:

- **DogStatsD clients** keep sending UDP to port `8125`. The OTel Collector's `statsd` receiver listens on the same port and translates to OTLP.
- **`dd-trace-*` APM SDKs** keep sending spans on port `8126`. The OTel Collector's `datadog` receiver translates the payloads into OTLP traces.
- **Datadog Agent** can stay during the migration window. Repoint its `dd_url` at the local OTel Collector and it continues collecting host and integration metrics without any other change.
- **Log shippers** (Fluent Bit, Vector) only need a one-line output swap.

The OpenTelemetry Collector with the appropriate receivers acts as a Datadog-to-OTLP translation layer, so the application surface area stays untouched.

## Migration Shape

A typical move off Datadog runs in three steps:

1. **Stand up an OTel Collector** alongside the existing Datadog Agent fleet. Configure it with the `statsd`, `datadog`, and (optionally) log receivers so it accepts the same wire formats Datadog uses.
2. **Run dual-write.** Point apps (or the Datadog Agent itself) at both Datadog and the Collector for a validation window. Compare metrics, traces, and logs side by side.
3. **Cut over.** Migrate dashboards and monitors to OpenObserve (the AI Assistant translates Datadog query DSL to PromQL/SQL), then decommission the Datadog Agent.

Teams already on OpenTelemetry can start ingesting into OpenObserve within hours. A full Datadog Agent-based fleet usually completes the move in days to a few weeks.

For the detailed, step-by-step procedure, see the [Datadog to OpenObserve Migration Guide](../../migration/migrate-from-datadog-to-openobserve/index.md):

- [Architecture & Terminology](../../migration/migrate-from-datadog-to-openobserve/architecture.md)
- [Migrating Metrics](../../migration/migrate-from-datadog-to-openobserve/metrics.md): DogStatsD, Datadog Agent, OTel
- [Migrating Traces](../../migration/migrate-from-datadog-to-openobserve/traces.md): Datadog APM to OTLP
- [Migrating Logs](../../migration/migrate-from-datadog-to-openobserve/logs.md)
- [Migrating Dashboards & Monitors](../../migration/migrate-from-datadog-to-openobserve/dashboards-and-alerts.md)

## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
