---
title: Migrate Dashboards & Monitors from Datadog to OpenObserve
description: Migrate Datadog dashboards and monitors to OpenObserve. Translate Datadog query syntax to PromQL and SQL, set up notification channels, and use the OpenObserve AI Assistant to speed up migration.
---

# Migrating Dashboards & Monitors

## Overview

There is no automatic converter for Datadog dashboards or monitors; both need to be recreated in OpenObserve. That said, the effort is lower than it sounds:

- **Most metric panels port over cleanly.** Datadog `avg:metric{tag:value}` expressions have direct PromQL equivalents. Once you know the pattern, most panels translate mechanically.
- For logs, OpenObserve uses SQL with full-text functions (`match_all()`, `str_match()`, `re_match()`).
- **Monitor types become alert rules.** PromQL-based or SQL-based alerts cover all the Datadog monitor types (metric, log, anomaly threshold, composite) you actually use day to day.
- **The AI Assistant can translate queries for you.** Paste a Datadog query into the OpenObserve AI Assistant and ask for the PromQL or SQL equivalent. That removes the main friction point.

Think of this as a forced cleanup. Datadog dashboards and monitor lists tend to accumulate panels and rules that nobody looks at anymore. Recreating from scratch is a good opportunity to keep only what's genuinely useful.


## Export Your Datadog Configuration First

Before you start rebuilding, pull a static snapshot of what you have. Both endpoints are part of the Datadog public API:

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

Now you have a static record to work from. The JSON contains the title, query, and notification config for every dashboard and monitor.


## Migrating Dashboards

### What Changes

| Element | Datadog | OpenObserve |
|---|---|---|
| Metric panels | Datadog query DSL (`avg:metric{tag}`) | PromQL |
| Log panels | Datadog log search syntax | SQL with `match_all()` / `str_match()` |
| Trace panels | APM Trace Analytics | Built-in trace explorer + SQL |
| Dashboard builder | Datadog UI (timeseries, toplist, heatmap, etc.) | OpenObserve built-in dashboard builder, 18+ chart types |
| Template variables | Datadog template variables | OpenObserve dashboard variables |
| Notebooks | Datadog Notebooks | Dashboard + SQL panels |

### How to Approach It

**Step 1: Inventory your dashboards**

Walk the exported `dashboards.json`. For each dashboard:

- Which widgets are actually used (drop the rest; most dashboards have at least one stale panel)
- Which data type each widget queries (metric / log / trace)
- Which Datadog tags are referenced; these become PromQL labels or SQL columns

**Step 2: Translate queries**

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
| `service:api status:error | count by status_code` | `SELECT status_code, count(*) FROM default WHERE service = 'api' AND level = 'error' GROUP BY status_code` |

!!! tip "Use the AI Assistant"
    Instead of translating queries by hand, use the **AI Assistant** in the OpenObserve UI. Paste a Datadog query and ask: *"Convert this Datadog query to OpenObserve PromQL"* (for metrics) or *"...to OpenObserve SQL"* (for logs). It handles tag-name normalization, function mapping, and aggregation syntax in one shot, which is especially useful for complex multi-condition queries.

**Step 3: Recreate in OpenObserve**

OpenObserve has a built-in drag-and-drop dashboard builder. For each panel:

1. Open **Dashboards** → **New Dashboard** in the OpenObserve UI.
2. Add a panel and select the signal type (Logs, Metrics, or Traces).
3. Paste your translated query.
4. Configure the visualization type, axes, thresholds, and any dashboard variables.

For template variables, set them up as dashboard variables and reference them in queries with `$variable_name`, the same pattern as Datadog.


## Migrating Monitors

### What Changes

| Monitor Type | Datadog | OpenObserve |
|---|---|---|
| Metric monitor | Datadog query DSL with threshold | PromQL alert with threshold |
| Log monitor | Log search + threshold | SQL-based scheduled alert |
| APM / Trace monitor | APM query | PromQL on RED metrics or SQL on traces |
| Anomaly / Forecast | Datadog Watchdog/Anomaly | Manual thresholds (no AI auto-detect today) |
| Composite | Logical AND/OR of monitors | Composite alert in OpenObserve |
| Notification channels | Slack, PagerDuty, email, webhook (configured per monitor) | Built-in destinations (Slack, Email, PagerDuty, Webhook), configured once and reused |

### Step 1: Inventory Your Current Monitors

Walk the exported `monitors.json`. For each monitor, note:

- The query (Datadog query DSL)
- Threshold and comparison operator
- Evaluation interval / window
- Notification channel(s)
- Whether the monitor still fires usefully (now is a great time to drop the ones that never trigger or always fire)

### Step 2: Set Up Notification Destinations

Set up notification destinations in OpenObserve **before** recreating rules, so you can test end-to-end as you go.

OpenObserve supports: **Slack, Email, PagerDuty, and Webhook**.

See the [OpenObserve Alerts Documentation](https://openobserve.ai/docs/user-guide/alerts/) for setup instructions.

### Step 3: Recreate Alert Rules

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

Datadog composite monitors combine other monitors with `&&` / `||`. In OpenObserve, create a **composite alert** that references the constituent alerts the same way.

!!! tip "Use the AI Assistant"
    The same AI Assistant that converts dashboard queries works here. Paste a Datadog monitor query and threshold and ask it to produce the OpenObserve PromQL or SQL equivalent. This is faster and less error-prone than translating complex multi-condition queries by hand.

### Step 4: Verify Alerts

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

- **SLOs:** Datadog SLO objects don't have a direct equivalent. Use OpenObserve **scheduled pipelines** to pre-aggregate the SLI (e.g., `good_events / total_events`), then alert on a burn-rate threshold.
- **Watchdog (anomaly auto-detect):** Watchdog is a Datadog-proprietary ML feature with no direct OpenObserve equivalent today. Migrate Watchdog alerts to explicit threshold rules. In practice most teams find the explicit rules clearer once they're forced to define what "anomaly" actually means.


## Next Steps

- [OpenObserve Alerts Documentation](https://openobserve.ai/docs/user-guide/alerts/): full reference for alert rule types, conditions, and notification channels
- [OpenObserve Dashboards Documentation](https://openobserve.ai/docs/user-guide/dashboards/): dashboard builder, panel types, and variables
- [OpenObserve Full-Text Search Functions](https://openobserve.ai/docs/sql-functions/full-text-search/): SQL function reference for log queries (`match_all()`, `str_match()`, `re_match()`)
- [OpenObserve Scheduled Pipelines](https://openobserve.ai/docs/user-guide/pipelines/create-and-use-scheduled-pipeline/): pre-aggregate expensive queries for SLOs and dashboards


[Back to Overview](index.md) | Previous: [Migrating Logs](logs.md)
