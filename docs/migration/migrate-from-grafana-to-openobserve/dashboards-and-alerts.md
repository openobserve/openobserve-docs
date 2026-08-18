---
title: Migrating Dashboards & Alerts
metaTitle: "Migrate Dashboards & Alerts from Grafana to OpenObserve"
description: "Migrate Grafana dashboards and Alertmanager rules to OpenObserve with the Dashboard Migrator, or by hand. Covers LogQL to SQL and PromQL compatibility."
---

# Migrating Dashboards & Alerts

## Overview

Grafana dashboards and alert rules are the main artifact that ties you to the LGTM stack. There are two ways to move them to OpenObserve:

1. **Automated** — the [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts Grafana dashboards, alert rules, contact points, and notification policies into OpenObserve dashboards, alerts, and destinations automatically.
2. **Manual** — recreate each dashboard and rule by hand, translating LogQL to SQL yourself (or with the AI Assistant).

For most teams the automated path handles the bulk of the work; the manual path is a fallback for the pieces the migrator flags for review.

## Migrate automatically with the Dashboard Migrator

The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) is a free web tool that converts dashboards and alert rules from Grafana — and Datadog, Kibana, and CloudWatch — into OpenObserve-native objects. For Grafana it has two flows:

- **Dashboards** — converts Grafana dashboards into OpenObserve dashboards: PromQL panels are preserved as-is, LogQL panels become SQL, and the panel layout, rows, and template variables carry over.
- **Alerts** — converts Grafana alert rules into OpenObserve alerts, mapping each rule's evaluator and threshold to an alert condition and window. If you upload the full alerting archive, it also converts **contact points → destinations**, and resolves notification policies and mute timings onto each rule.

### Dashboard flow

1. **Load** — paste or upload Grafana dashboard JSON, or connect to your Grafana instance (via a service account) to pull dashboards directly.
2. **Connect (optional)** — point the tool at your OpenObserve instance so it can read your live stream catalog and validate stream names.
3. **Review** — inspect the migrated panels and queries, correct stream mappings, and override any variable defaults.
4. **Export** — create the dashboards directly in OpenObserve, or download JSON you can import yourself.

### Alert flow

1. **Load Alert Rules** — paste or upload the rules JSON (Grafana → Alerting → Alert rules → Export), or upload the full alerting archive with contact points and policies.
2. **Connect (optional)** — link OpenObserve to resolve destinations against your real setup.
3. **Destinations** — review the contact points converted to OpenObserve destinations, and fill in any redacted secrets (webhook URLs, tokens).
4. **Review** — inspect the translated alerts, thresholds, and destination assignments.
5. **Export** — create the alerts directly in OpenObserve, or download JSON to import via Alerts → Import.

:::tip[Grafana redacts secrets on export]
Grafana's provisioning export replaces webhook URLs and tokens with `[redacted]`. The migrator flags these so you can re-enter them when it converts contact points to destinations.
:::

### What it translates and what it flags

| Grafana source | Migration result |
|---|---|
| PromQL panels and rules | Preserved as-is (multi-line queries flattened) — run unchanged in OpenObserve. |
| LogQL panels and rules | Translated to SQL; flag for review on complex `json`/`label_format` stages. |
| Template variables | Carried over as OpenObserve dashboard variables. |
| Alert evaluator + threshold | Mapped to an OpenObserve condition, operator, and look-back window. |
| Contact points | Converted to OpenObserve destinations (webhook, email, Slack, PagerDuty, etc.). |
| Notification policies & mute timings | Resolved onto each alert's destinations so the routing carries over. |

## Export your Grafana configuration first

Pull a static snapshot before you start. Dashboards and rules come from different places:

```bash
# Dashboards (list, then fetch each by uid)
curl -s "https://<grafana>/api/search?type=dash-db" \
  -H "Authorization: Bearer $GRAFANA_TOKEN" > dashboards-list.json

# Alert rules (export per group from the UI: Alerting → Alert rules → Export)
```

The migrator can also read dashboards straight from Grafana if you create a service account token (**Administration → Service accounts**). For alert rules, export the group JSON from the UI, or download the alerting archive (rules, contact points, notification policies, mute timings, and templates) if you want to migrate the full routing setup.

## Migrating dashboards manually

If you prefer to rebuild by hand, here is the translation the migrator applies.

### What changes

| Element | Grafana (LGTM) | OpenObserve |
|---|---|---|
| Metrics panels (PromQL) | PromQL queries | Same PromQL — no changes needed |
| Log panels (LogQL) | LogQL queries | SQL with OpenObserve log functions |
| Trace panels | Trace explorer | Built-in trace explorer UI |
| Dashboard builder | Grafana UI | OpenObserve built-in dashboard builder |
| Variables / template vars | Grafana variables | OpenObserve dashboard variables |

### Translate LogQL queries to SQL

This is the only part that requires real work. For each LogQL panel, you need an equivalent SQL query.

| LogQL | OpenObserve SQL |
|---|---|
| `{service="api"} \|= "error"` | `SELECT * FROM default WHERE service = 'api' AND match_all('error')` |
| `count_over_time({service="api", level="error"}[5m])` | `SELECT count(*) FROM default WHERE service = 'api' AND level = 'error'` |
| `rate({job="nginx"} \|= "timeout"[5m])` | `SELECT count(*) / 300 FROM default WHERE job = 'nginx' AND match_all('timeout')` |

:::tip[Use the AI Assistant]
Instead of translating queries by hand, use the **AI Assistant** (available in the OpenObserve UI) to convert LogQL to SQL. Paste your existing LogQL query and ask: *"Convert this LogQL query to OpenObserve SQL."* It handles the function mapping and syntax differences accurately, especially for complex filter and aggregation patterns.
:::

### Recreate in OpenObserve

OpenObserve has a built-in drag-and-drop dashboard builder with 18+ chart types. For each panel:

1. Open **Dashboards** → **New Dashboard** in the OpenObserve UI.
2. Add a panel and select the signal type (Logs, Metrics, or Traces).
3. Paste your translated query (or PromQL if it's a metrics panel).
4. Configure the visualization type, axes, and thresholds.

## Migrating alerts manually

### What changes

| Alert type | Grafana | OpenObserve |
|---|---|---|
| Metric alerts (PromQL) | Grafana-managed or Mimir ruler rules | Same PromQL — create as a metric alert |
| Log alerts (LogQL) | LogQL threshold alerts | SQL-based scheduled alert |
| Composite / multi-condition | Grafana expressions (`refId` chains) | [Composite alert](../../user-guide/analytics/alerts/composite-alerts.md) or group-by |
| Notification channels | Contact points + notification policies | Built-in [destinations](../../user-guide/account-administration/management/alert-destinations.md), configured once and reused |

OpenObserve alerts carry **two firing severities — Warning and Critical** — so a rule with both a warning and a critical threshold maps to the same two-level model.

### Step 1: Inventory your current alerts

In Grafana, go to **Alerting → Alert Rules** and export all active rules. For each rule, note:

- The query it uses (PromQL or LogQL)
- The evaluation interval and threshold
- The contact point / notification policy it routes to
- Whether the alert is still useful — now is a good time to drop alerts nobody acts on

### Step 2: Set up destinations

Set up your notification destinations in OpenObserve before recreating rules, so you can test end-to-end as you go.

OpenObserve supports: **Slack, Email, PagerDuty, Webhook**, and more.

See the [OpenObserve Alert Destinations Documentation](../../user-guide/account-administration/management/alert-destinations.md) for setup instructions.

### Step 3: Recreate alert rules

**PromQL metric alerts — direct port, no changes:**

| Grafana Alert (PromQL) | OpenObserve |
|---|---|
| `rate(http_requests_total{status=~"5.."}[5m]) > 0.1` | Same PromQL — create as a metric alert |
| `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes < 0.1` | Same PromQL |

**LogQL log alerts — translate to SQL:**

| Grafana Alert (LogQL) | OpenObserve Alert (SQL) |
|---|---|
| `count_over_time({level="error", service="api"}[5m]) > 100` | `SELECT count(*) FROM default WHERE level = 'error' AND service = 'api'` with threshold > 100 |
| `rate({service="payments"} \|= "timeout"[5m]) > 0.05` | `SELECT count(*) / 300 FROM default WHERE service = 'payments' AND match_all('timeout')` with threshold > 0.05 |

:::tip[Use the AI Assistant]
The same AI Assistant that converts LogQL for dashboards works here too. Paste your LogQL alert query and ask it to produce the OpenObserve SQL equivalent.
:::

### Step 4: Verify alerts

1. Open **Alerts** in the OpenObserve UI and confirm each rule shows an **Active** or **Normal** status.
2. Check the **Last Evaluated** timestamp — rules should update on their configured interval.
3. Temporarily lower a threshold to force a firing condition, or use OpenObserve's built-in test to send a test notification.
4. Cross-reference your original alert inventory against the recreated rules to confirm nothing was missed.

**Troubleshooting:**

- **Rule never fires:** Run the SQL query in the Logs or Metrics explorer first to confirm it returns data before using it in an alert.
- **No notification received:** Test the destination config (Slack webhook URL, SMTP settings) independently before attaching it to a rule.
- **PromQL returns no data:** Check that the metric name and label values are present in the Metrics explorer — case mismatch is the most common cause.

## Next steps

- [OpenObserve Alerts Documentation](../../user-guide/analytics/alerts/index.md) — full reference for alert rule types, conditions, and notification channels
- [Composite Alerts](../../user-guide/analytics/alerts/composite-alerts.md) — combine existing alerts with boolean logic
- [OpenObserve Dashboards Documentation](../../user-guide/analytics/dashboards/index.md) — dashboard builder, panel types, and variables
- [OpenObserve Full-Text Search Functions](../../reference/sql-functions/full-text-search.md) — SQL function reference for log queries (`match_all()`, `str_match()`, `re_match()`)
- [OpenObserve Scheduled Pipelines](../../user-guide/data-processing/pipelines/create-and-use-scheduled-pipeline.md) — pre-aggregate expensive queries, equivalent to Mimir recording rules

---

[Back to Overview](index.md) | Previous: [Migrating Logs](logs.md)
