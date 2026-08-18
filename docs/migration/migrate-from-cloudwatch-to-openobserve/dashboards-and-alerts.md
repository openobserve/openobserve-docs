---
title: Migrating Dashboards
metaTitle: Migrate CloudWatch Dashboards to OpenObserve
description: "Convert AWS CloudWatch dashboards into OpenObserve dashboards with the Dashboard Migrator. Metric widgets become SQL queries over the CloudWatch metrics log stream."
---

# Migrating Dashboards

## Overview

CloudWatch dashboards are JSON documents of metric widgets. There are two ways to move them to OpenObserve:

1. **Automated** — the [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts CloudWatch dashboard JSON into OpenObserve dashboards, turning each metric widget into a SQL query over your CloudWatch metrics stream.
2. **Manual** — recreate each dashboard by hand.

For most teams the automated path handles the bulk of the work; the manual path is a fallback and a way to understand what changed.

## Migrate automatically with the Dashboard Migrator

The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) is a free web tool that converts dashboards from CloudWatch — and Datadog, Grafana, and Kibana — into OpenObserve-native objects. For CloudWatch it reads a dashboard's `widgets` array and produces an OpenObserve dashboard with the widgets, layout, and variables translated.

### How it works

1. **Load Dashboards** — paste or upload the dashboard JSON, or browse your dashboards directly from AWS (the tool provides a read-only CloudFormation template to grant it access).
2. **Connect (optional)** — point the tool at your OpenObserve instance so it can read your live stream catalog and validate the stream name.
3. **Review** — inspect the translated widgets and queries.
4. **Export** — create the dashboards directly in OpenObserve, or download JSON to import.

### How CloudWatch metrics map to SQL

Because CloudWatch metrics arrive as a logs stream (see the [overview](index.md)), every metric widget becomes a SQL query over that stream:

| CloudWatch concept | OpenObserve SQL |
|---|---|
| Metric `CPUUtilization` in `AWS/EC2` | `WHERE namespace = 'AWS/EC2' AND metric_name = 'CPUUtilization'` |
| Statistic **Average** | `sum(value_sum) / sum(value_count)` |
| Statistic **Sum** | `sum(value_sum)` |
| Statistic **Min** / **Max** | `min(value_min)` / `max(value_max)` |
| Dimension `InstanceId=i-123` | `WHERE dimensions_instanceid = 'i-123'` |
| Period / time range | Time filter on `_timestamp` |

### What's skipped

The migrator flags widgets it can't convert, rather than guessing:

- **Logs Insights widgets** — these query log data, not metrics; they're skipped with a note to recreate as OpenObserve SQL.
- **Alarm widgets** — CloudWatch alarms are not migrated (see below).

## Export your CloudWatch configuration first

Pull a static snapshot before you start:

```bash
# List dashboards
aws cloudwatch list-dashboards --region us-east-1

# Fetch one dashboard body
aws cloudwatch get-dashboard --dashboard-name <name> --region us-east-1
```

The `get-dashboard` response wraps the body in a `DashboardBody` string; the migrator accepts either that wrapper or the raw `{ "widgets": [...] }` body.

## Migrating manually

If you prefer to rebuild by hand, translate each metric widget to a SQL query over the metrics stream. For example, an **Average** of `CPUUtilization` for `AWS/EC2` across all instances:

```sql
SELECT _timestamp, sum(value_sum) / sum(value_count) AS avg_cpu
FROM cloudwatch_metrics
WHERE namespace = 'AWS/EC2' AND metric_name = 'CPUUtilization'
GROUP BY _timestamp
```

Add `dimensions_<name>` filters to narrow to specific instances, regions, or auto-scaling groups, and use the same aggregation mapping shown above for Sum/Min/Max.

## CloudWatch alarms

CloudWatch alarms are not migrated by the Dashboard Migrator. To move an alarm, recreate it as an OpenObserve [scheduled alert](../../user-guide/analytics/alerts/index.md): take the alarm's metric, statistic, and threshold, express them as a SQL query (using the same `value_sum` / `value_count` mapping), and attach the notification destination. See the [Alerts documentation](../../user-guide/analytics/alerts/index.md) for details.

## Next steps

- [OpenObserve Dashboards Documentation](../../user-guide/analytics/dashboards/index.md) — dashboard builder, panel types, and variables
- [OpenObserve Alerts Documentation](../../user-guide/analytics/alerts/index.md) — recreate CloudWatch alarms as OpenObserve alerts

---

[Back to Overview](index.md)
