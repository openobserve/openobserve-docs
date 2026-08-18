---
title: Migrating Dashboards & Monitors
metaTitle: Migrate Dashboards & Monitors from Datadog to OpenObserve
description: "Migrate Datadog dashboards and monitors to OpenObserve with the Dashboard Migrator, or by hand in PromQL and SQL. Covers composite alerts and SLOs."
---

# Migrating Dashboards & Monitors

## Overview

Dashboards and monitors are the main thing that makes Datadog feel sticky: they encode your team's knowledge of what "healthy" looks like, in Datadog's proprietary query DSL. There are two ways to move them to OpenObserve:

1. **Automated** — the [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts Datadog dashboards and monitors into OpenObserve dashboards and alerts, translating queries, thresholds, layout, and variables automatically.
2. **Manual** — recreate each dashboard and monitor by hand, translating Datadog query syntax to PromQL or SQL yourself (or with the AI Assistant).

For most teams the automated path handles the bulk of the work. The manual path is a fallback for the pieces the migrator flags for review, and a way to understand exactly what changed under the hood.

## Migrate automatically with the Dashboard Migrator

The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) is a free web tool that converts dashboards and alert rules from Datadog — and Grafana, Kibana, and CloudWatch — into OpenObserve-native objects. For Datadog it has two flows:

- **Dashboards** — converts Datadog dashboards into OpenObserve dashboards: metric panels become PromQL, log and trace panels become SQL, and the panel layout, tabs, and template variables carry over.
- **Monitors** — converts Datadog monitors into OpenObserve alerts: metric monitors become PromQL alerts with their operator, threshold, and evaluation window mapped; log and trace monitors are flagged for SQL completion.

### How it works

The workflow is four steps:

1. **Load** — paste or upload the JSON you export from Datadog's API (`GET /api/v1/dashboard` and `GET /api/v1/monitor`).
2. **Connect (optional)** — point the tool at your OpenObserve instance so it can read your live stream catalog and validate stream names against what actually exists. This is what makes the output schema-validated and import-clean.
3. **Review** — inspect the migrated panels and queries, correct stream mappings, and override any variable defaults before exporting.
4. **Export** — create the dashboards and alerts directly in OpenObserve, or download JSON you can import yourself.

As it migrates, it reports a coverage tally per object — **migrated**, **needs review**, and **skipped** — so you can see at a glance how much work remains.

### What it translates and what it flags

The migrator handles the mechanical majority and flags the rest for a human:

| Datadog source | Migration result |
|---|---|
| Metric panels / metric monitors (`avg:metric{tag}`) | Fully translated to PromQL with labels, aggregations, and thresholds mapped. |
| Log / trace panels and monitors | Flagged for review — the query must be written as OpenObserve SQL against the right stream. |
| Template variables | Carried over as OpenObserve dashboard variables. |
| `anomalies()`, `forecast()`, `outliers()` monitors | Migrated as a plain threshold on the underlying metric and flagged to tune manually. |

:::tip[Feed it your real export]
The migrator consumes the same JSON the Datadog API returns. Export your dashboards and monitors before you start (see below) and keep the files — they are the input to both the automated and manual paths.
:::

## Export your Datadog configuration first

Pull a static snapshot of what you have. Both endpoints are part of the Datadog public API:

```bash
# Dashboards
curl -X GET "https://api.datadoghq.com/api/v1/dashboard" \
  -H "DD-API-KEY: $DD_API_KEY" \
  -H "DD-APPLICATION-KEY: $DD_APP_KEY" > dashboards.json

# Monitors
curl -X GET "https://api.datadoghq.com/api/v1/monitor" \
  -H "DD-API-KEY: $DD_API_KEY" \
  -H "DD-APPLICATION-KEY: $DD_APP_KEY" > monitors.json
```

The JSON contains the title, query, and notification config for every dashboard and monitor — everything the migrator needs, and everything you need if you recreate by hand.

## Migrating dashboards manually

If you prefer to rebuild by hand, or want to verify what the migrator produced, here is the translation it is applying.

### What changes

| Element | Datadog | OpenObserve |
|---|---|---|
| Metric panels | Datadog query DSL (`avg:metric{tag}`) | PromQL |
| Log panels | Datadog log search syntax | SQL with `match_all()` / `str_match()` |
| Trace panels | APM Trace Analytics | Built-in trace explorer + SQL |
| Dashboard builder | Datadog UI (timeseries, toplist, heatmap, etc.) | OpenObserve built-in dashboard builder, 18+ chart types |
| Template variables | Datadog template variables | OpenObserve dashboard variables |
| Notebooks | Datadog Notebooks | Dashboard + SQL panels |

### Translate queries

Datadog-to-PromQL examples for metric panels:

| Datadog | OpenObserve PromQL |
|---|---|
| `avg:system.cpu.user{*}` | `avg(system_cpu_user)` |
| `avg:system.cpu.user{host:web-01}` | `avg(system_cpu_user{host="web-01"})` |
| `sum:http.requests{service:api}.as_rate()` | `sum(rate(http_requests{service="api"}[1m]))` |
| `sum:http.requests{*} by {status_code}.as_rate()` | `sum by (status_code)(rate(http_requests[1m]))` |
| `p95:trace.servlet.request{*}` | `histogram_quantile(0.95, sum by (le)(rate(trace_servlet_request_bucket[5m])))` |
| `top(avg:cpu.user{*} by {host}, 10, 'mean', 'desc')` | `topk(10, avg by (host)(cpu_user))` |

Datadog log search to SQL examples for log panels:

| Datadog log query | OpenObserve SQL |
|---|---|
| `service:api status:error` | `SELECT * FROM default WHERE service = 'api' AND level = 'error'` |
| `service:api "timeout"` | `SELECT * FROM default WHERE service = 'api' AND match_all('timeout')` |
| `service:payments @duration:>500` | `SELECT * FROM default WHERE service = 'payments' AND duration > 500` |
| `service:api status:error \| count by status_code` | `SELECT status_code, count(*) FROM default WHERE service = 'api' AND level = 'error' GROUP BY status_code` |

:::tip[Use the AI Assistant]
Instead of translating queries by hand, use the **AI Assistant** in the OpenObserve UI. Paste a Datadog query and ask: *"Convert this Datadog query to OpenObserve PromQL"* (for metrics) or *"...to OpenObserve SQL"* (for logs). It handles tag-name normalization, function mapping, and aggregation syntax in one shot — especially useful for complex multi-condition queries.
:::

### Recreate in OpenObserve

OpenObserve has a built-in drag-and-drop dashboard builder. For each panel:

1. Open **Dashboards** → **New Dashboard** in the OpenObserve UI.
2. Add a panel and select the signal type (Logs, Metrics, or Traces).
3. Paste your translated query.
4. Configure the visualization type, axes, thresholds, and any dashboard variables.

For template variables, set them up as dashboard variables and reference them in queries with `$variable_name`, the same pattern as Datadog.

## Migrating monitors manually

### What changes

| Monitor type | Datadog | OpenObserve |
|---|---|---|
| Metric monitor | Datadog query DSL with threshold | PromQL alert with threshold |
| Log monitor | Log search + threshold | SQL-based scheduled alert |
| APM / Trace monitor | APM query | PromQL on RED metrics or SQL on traces |
| Anomaly / Forecast | Watchdog / `anomalies()` / `forecast()` | Anomaly detection (Enterprise) or explicit thresholds |
| Composite | Logical AND/OR of monitors | [Composite alert](../../user-guide/analytics/alerts/composite-alerts.md) with `AND`/`OR`/`NOT` |
| Multi alert (grouped) | `group by` on a tag, fires per group | Group-by alert (see [Alert Conditions](../../user-guide/analytics/alerts/alert-conditions.md#group-by)) |
| Notification channels | Slack, PagerDuty, email, webhook (per monitor) | Built-in destinations, configured once and reused |

OpenObserve alerts carry **two firing severities — Warning and Critical** — rather than a single alert state, so a Datadog monitor that defines both a `warning` and a `critical` threshold maps to the same two-level model.

### Step 1: Inventory your current monitors

Walk the exported `monitors.json`. For each monitor, note:

- The query (Datadog query DSL)
- Threshold and comparison operator
- Evaluation interval / window
- Notification channel(s)
- Whether the monitor still fires usefully (drop the ones that never trigger or always fire)

### Step 2: Set up notification destinations

Set up notification destinations in OpenObserve **before** recreating rules, so you can test end-to-end as you go.

OpenObserve supports: **Slack, Email, PagerDuty, and Webhook**.

See the [OpenObserve Alert Destinations Documentation](../../user-guide/account-administration/management/alert-destinations.md) for setup instructions.

### Step 3: Recreate alert rules

**Metric monitor to PromQL alert:**

| Datadog Monitor | OpenObserve Alert |
|---|---|
| `avg(last_5m):avg:system.load.5{*} > 4` | PromQL: `avg_over_time(system_load_5[5m]) > 4` |
| `sum(last_5m):sum:http.requests{status_code:5xx}.as_rate() > 0.1` | PromQL: `sum(rate(http_requests{status_code=~"5.."}[5m])) > 0.1` |
| `avg(last_15m):p95:trace.servlet.request{service:api} > 1s` | PromQL: `histogram_quantile(0.95, sum by (le)(rate(trace_servlet_request_bucket{service="api"}[5m]))) > 1` |

**Log monitor to SQL-based scheduled alert:**

| Datadog Monitor | OpenObserve Alert |
|---|---|
| `logs("service:api status:error").index("*").rollup("count").last("5m") > 100` | SQL: `SELECT count(*) FROM default WHERE service = 'api' AND level = 'error'` with threshold > 100 over 5m |
| `logs("service:payments \"timeout\"").rollup("count").last("5m") > 50` | SQL: `SELECT count(*) FROM default WHERE service = 'payments' AND match_all('timeout')` with threshold > 50 over 5m |

**Composite monitor:**

Datadog composite monitors combine other monitors with `&&` / `||`. OpenObserve has a native [composite alert](../../user-guide/analytics/alerts/composite-alerts.md) that references the constituent alerts the same way, with `AND`, `OR`, and `NOT` (plus parentheses).

**Multi alert (grouped monitor):**

A Datadog monitor with `group by` fires separately for each tag value. In OpenObserve, enable **Group by** in the alert condition to evaluate the same threshold per group, and it notifies you with the groups that triggered.

**Warning + critical thresholds:**

Where a Datadog monitor defines a `warning` threshold below its `critical` threshold, keep the same split in OpenObserve: Warning is the "heads-up" severity, Critical is the page.

:::tip[Use the AI Assistant]
The same AI Assistant that converts dashboard queries works here. Paste a Datadog monitor query and threshold and ask it to produce the OpenObserve PromQL or SQL equivalent. This is faster and less error-prone than translating complex multi-condition queries by hand.
:::

### Step 4: Verify alerts

1. Open **Alerts** in the OpenObserve UI and confirm each rule shows an **Active** status.
2. Check the **Last Evaluated** timestamp; rules should update on their configured interval.
3. Temporarily lower a threshold to force a firing condition, or send a test notification to confirm the destination works end-to-end.
4. Cross-reference your `monitors.json` against the recreated alerts to confirm nothing was missed.

**Troubleshooting:**

- **Rule never fires:** Run the SQL or PromQL query directly in the Logs/Metrics explorer first to confirm it returns data.
- **No notification received:** Test the notification destination independently (e.g., the Slack webhook URL) before attaching it to a rule.
- **PromQL returns no data:** Confirm metric and label names in the Metrics explorer. Datadog uses `.` in metric names, OpenObserve uses `_`. Same for tags with dashes.
- **Spurious fires after migration:** Datadog monitors often have implicit `no_data_timeframe` and `notify_no_data` behavior. Configure the equivalent in OpenObserve so a missing-data state doesn't immediately page.

## SLOs & Watchdog

- **SLOs:** OpenObserve has native SLO support, so Datadog SLOs migrate cleanly instead of being rebuilt with pipelines. Define an SLO as a **count**, **time-slice**, or **alert-based** SLI over a rolling 7/30/90-day window, then alert on **burn rate** or **error budget** consumption. See the [SLO documentation](../../user-guide/analytics/slos/index.md) and [Alerting on SLOs](../../user-guide/analytics/slos/slo-alerts.md).
- **Watchdog (anomaly auto-detect):** Watchdog is Datadog-proprietary, but OpenObserve offers its own [anomaly detection](../../user-guide/analytics/alerts/anomaly-detection.md) *(Enterprise self-hosted)* for ML-based detection without hand-set thresholds. Where you want explicit control, migrate Watchdog alerts to threshold rules — most teams find the explicit rules clearer once they're forced to define what "anomaly" actually means.

## Next steps

- [OpenObserve Alerts Documentation](../../user-guide/analytics/alerts/index.md): full reference for alert rule types, conditions, and notification channels
- [Composite Alerts](../../user-guide/analytics/alerts/composite-alerts.md): combine existing alerts with boolean logic
- [Alert Conditions and Filters](../../user-guide/analytics/alerts/alert-conditions.md): condition builder, aggregation functions, and group-by (multi-alerts)
- [Service Level Objectives (SLOs)](../../user-guide/analytics/slos/index.md): measure and alert on reliability targets
- [OpenObserve Dashboards Documentation](../../user-guide/analytics/dashboards/index.md): dashboard builder, panel types, and variables
- [OpenObserve Full-Text Search Functions](../../reference/sql-functions/full-text-search.md): SQL function reference for log queries (`match_all()`, `str_match()`, `re_match()`)
- [OpenObserve Scheduled Pipelines](../../user-guide/data-processing/pipelines/create-and-use-scheduled-pipeline.md): pre-aggregate expensive queries for dashboards

## Need help?

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
