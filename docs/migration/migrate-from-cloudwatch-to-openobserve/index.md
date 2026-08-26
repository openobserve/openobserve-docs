---
title: Overview
metaTitle: Migrate from CloudWatch to OpenObserve
description: "Migrate AWS CloudWatch dashboards and metrics to OpenObserve via Firehose in OpenTelemetry format and the Dashboard Migrator."
---

# Migrate from CloudWatch to OpenObserve

If you're using Amazon CloudWatch for AWS infrastructure metrics and dashboards and want to move to OpenObserve, this guide walks you through the migration. The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts CloudWatch dashboards into OpenObserve dashboards automatically, and CloudWatch Metric Streams carry the underlying data across.

Migrating CloudWatch has two parts:

1. **The data** — stream CloudWatch metrics into OpenObserve using CloudWatch Metric Streams → Kinesis Firehose in OpenTelemetry format. The metrics land in a log stream with a fixed column shape (namespace, metric name, dimensions, sum/count/min/max).
2. **The dashboards** — convert your CloudWatch dashboards into OpenObserve dashboards with the Dashboard Migrator, which turns each metric widget into a SQL query over that stream.

## Table of Contents

1. [Overview](index.md) — why migrate and what changes
2. [Migrating Dashboards](dashboards-and-alerts.md) — convert CloudWatch dashboards with the Dashboard Migrator

---

## Why Migrate?

CloudWatch is convenient when you're already in AWS, but it bills per custom metric, per alarm, per dashboard, and per ingested log GB, and it keeps metrics for a limited retention window. As your footprint grows, the cost and the operational opacity both climb.

OpenObserve stores the same metrics as Apache Parquet on object storage (up to **140x more efficient**), keeps data as long as you want, and lets you query metrics, logs, and traces in one place with SQL.

## What OpenObserve Changes

| | CloudWatch | OpenObserve |
|---|---|---|
| **Pricing model** | Per custom metric, alarm, dashboard, log GB | Storage + compute only |
| **Storage backend** | AWS-managed, fixed retention | Apache Parquet on S3 / GCS / Azure Blob / local disk |
| **Query language** | CloudWatch Metrics Insights / Logs Insights | SQL |
| **Dashboards** | CloudWatch dashboard JSON | OpenObserve dashboard builder |
| **Cross-signal correlation** | Separate consoles for metrics vs. logs | Unified logs, metrics, traces in one UI |
| **Lock-in** | AWS-specific formats | Open standards; data lives in your bucket |

## How CloudWatch metrics reach OpenObserve

CloudWatch metrics are ingested into OpenObserve as a **logs** stream via a CloudWatch Metric Stream:

```
CloudWatch → Kinesis Data Firehose (OpenTelemetry format) → OpenObserve
```

The metric stream flattens each metric into a row with these columns, which is what the dashboard migrator then queries:

| Column | Meaning |
|---|---|
| `namespace` | The CloudWatch namespace (e.g., `AWS/EC2`) |
| `metric_name` | The metric name (e.g., `CPUUtilization`) |
| `dimensions_<name>` | One column per dimension, lowercased |
| `region` | The AWS region |
| `unit` | The metric unit |
| `value_sum`, `value_count`, `value_min`, `value_max` | Aggregated sample values over the period |
| `_timestamp` | The sample time |

See the [OpenObserve ingestion docs](../../ingestion/logs/kinesis-firehose.md) for the Firehose setup.

## Before You Start

- **Export your dashboards:** note which CloudWatch dashboards you actually use, and export them via the AWS API (`get-dashboard`) or the migrator's "browse from AWS" option.
- **Confirm the metric stream:** make sure your CloudWatch Metric Stream → Firehose → OpenObserve pipeline is running before you migrate dashboards, so the queries have data to validate against.

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

- [Migrating Dashboards](dashboards-and-alerts.md) — convert CloudWatch dashboards with the Dashboard Migrator
- [OpenObserve Ingestion](../../ingestion/index.md) — stream CloudWatch metrics and other signals into OpenObserve

## Need Help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
