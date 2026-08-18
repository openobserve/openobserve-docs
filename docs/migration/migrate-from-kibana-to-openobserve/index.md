---
title: Overview
metaTitle: Migrate from Kibana to OpenObserve
description: "Migrate Kibana dashboards and visualizations to OpenObserve with the automated Dashboard Migrator. Lucene and KQL queries become SQL, and saved-object exports convert in minutes."
---

# Migrate from Kibana to OpenObserve

If you're running Kibana on top of Elasticsearch for log exploration and dashboards and want to move to OpenObserve, this guide walks you through moving your dashboards and visualizations. The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts Kibana saved-object exports into OpenObserve dashboards automatically, translating Lucene and KQL queries to SQL.

Kibana is a visualization layer over Elasticsearch, so migrating it has two independent parts:

1. **The data** — move your Elasticsearch data into OpenObserve streams. This is a standard ingestion task (OpenTelemetry Collector, Filebeat, Logstash, or Fluent Bit) and has nothing to do with the dashboard work.
2. **The dashboards and visualizations** — convert your saved objects into OpenObserve dashboards. This is what the Dashboard Migrator automates.

## Table of Contents

1. [Overview](index.md) — why migrate and what changes
2. [Migrating Dashboards & Visualizations](dashboards-and-alerts.md) — convert Kibana saved objects with the Dashboard Migrator

---

## Why Migrate?

Kibana is a capable visualization tool, but running it means operating the whole Elastic stack — and most of that cost is spent on things you don't get visibility value from.

### License and vendor lock-in

Elasticsearch and Kibana are licensed under the SSPL, which is restrictive for teams offering Elasticsearch as a service. The query language (Lucene/KQL), the saved-object export format, and the aggregation DSL are all Elastic-specific.

OpenObserve is open source and speaks open protocols (OpenTelemetry, Prometheus Remote Write, Loki Push API, plain JSON), and queries your data with SQL — a language your team already knows.

### Operational cost

The Elastic stack is heavyweight: a JVM per node with large heap allocation, separate Elasticsearch, Kibana, and (usually) Logstash or Beats deployments, and careful index/shard lifecycle management. OpenObserve is a single binary (or Helm chart) that stores data as Apache Parquet on object storage — **up to 140x more efficient** — with no JVM, no index management, and no shard tuning.

### Storage cost

Elasticsearch keeps every field indexed by default, which balloons disk usage and memory. OpenObserve stores raw events as Parquet columns and indexes only what you tell it to, so the same data costs a fraction of the disk.

## What OpenObserve Changes

| | Kibana / Elasticsearch | OpenObserve |
|---|---|---|
| **Components to run** | Elasticsearch + Kibana (+ Beats/Logstash) | 1 binary or 1 Helm chart |
| **Storage backend** | Inverted index per shard (JVM) | Apache Parquet on S3 / GCS / Azure Blob / local disk |
| **Storage cost** | High — full-field indexing | Up to 140x more efficient |
| **Query language** | Lucene / KQL + aggregation DSL | SQL (plus PromQL for metrics) |
| **Dashboards** | Kibana saved objects | OpenObserve dashboard builder |
| **Lock-in** | Elastic-specific formats | Open standards; data lives in your bucket as Parquet |
| **Deployment** | Self-hosted (or Elastic Cloud) | Self-host or OpenObserve Cloud |

## Before You Start

Before migrating, export a snapshot of what you have:

- **Dashboards and visualizations:** in Kibana, go to **Stack Management → Saved Objects** and export everything (or the dashboards you actually use) as an `.ndjson` file. This is the input to the Dashboard Migrator.
- **Index patterns:** note which index patterns your visualizations reference — the migrator maps these to OpenObserve streams.
- **Data sources:** confirm how data reaches Elasticsearch today (Beats, Logstash, Fluent Bit, application SDKs), so you can repoint it at OpenObserve.

## Set Up OpenObserve

Before migrating, get OpenObserve running:

::::tabs
:::tab[OpenObserve Cloud]

Sign up at [cloud.openobserve.ai](https://cloud.openobserve.ai). No infrastructure to manage.

After logging in, navigate to **Data Sources** to find your ingestion credentials and endpoint URLs.
:::
:::tab[Self-Hosted]

Download OpenObserve for your platform from the [downloads page](https://openobserve.ai/downloads/).

After installation, access the UI at `http://localhost:5080` and navigate to **Data Sources** to find your ingestion credentials and ready-to-use configuration snippets.
:::
::::

## Next Steps

- [Migrating Dashboards & Visualizations](dashboards-and-alerts.md) — convert Kibana saved objects with the Dashboard Migrator
- [OpenObserve Ingestion](../../ingestion/index.md) — get your logs, metrics, and traces into OpenObserve

## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
