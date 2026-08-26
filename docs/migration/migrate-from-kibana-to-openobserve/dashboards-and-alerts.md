---
title: Migrating Dashboards & Visualizations
metaTitle: Migrate Kibana Dashboards & Visualizations to OpenObserve
description: "Convert Kibana saved-object exports into OpenObserve dashboards with the Dashboard Migrator. Lucene and KQL translate to SQL."
---

# Migrating Dashboards & Visualizations

## Overview

Kibana dashboards and visualizations encode your team's query logic in Lucene/KQL and the Elasticsearch aggregation DSL. There are two ways to move them to OpenObserve:

1. **Automated** — the [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) converts a Kibana saved-object export (`.ndjson`) into OpenObserve dashboards, translating queries, aggregations, and layout automatically.
2. **Manual** — recreate each dashboard by hand, rewriting Lucene/KQL as SQL.

For most teams the automated path handles the bulk of the work; the manual path is a fallback and a way to understand what changed.

## Migrate automatically with the Dashboard Migrator

The [OpenObserve Dashboard Migrator](https://migration.openobserve.ai/) is a free web tool that converts dashboards from Kibana — and Datadog, Grafana, and CloudWatch — into OpenObserve-native objects. For Kibana it reads a saved-object export and produces OpenObserve dashboards with the panels, layout, and queries translated.

### How it works

1. **Upload Export** — paste or upload the `.ndjson` (or `.json`) saved-object export from Kibana.
2. **Choose Dashboards** — pick one, several, or all of the dashboards in the export.
3. **Connect & Map** — link OpenObserve and map each Kibana **index pattern** to an OpenObserve **stream**.
4. **Review** — inspect the translated panels and queries.
5. **Export** — create the dashboards directly in OpenObserve, or download JSON to import.

As it migrates, it reports a coverage tally per object — **migrated**, **needs review**, and **skipped** — so you can see how much work remains.

### What it translates and what it flags

| Kibana source | Migration result |
|---|---|
| Lucene / KQL queries | Translated to SQL (`WHERE` clauses, `match_all()` for full-text). |
| Aggregations (avg, min, max, terms, date histogram) | Converted to SQL aggregations and `GROUP BY`. |
| Field names | Mapped to OpenObserve columns — `@timestamp` becomes `_timestamp`, `.keyword` is stripped, names are normalized. |
| Index patterns | Mapped to OpenObserve streams (you pick the mapping). |
| Layout | Panel positions and sizes carried over to the OpenObserve grid. |

## Export your Kibana configuration first

Pull a static snapshot before you start. In Kibana:

1. Go to **Stack Management → Saved Objects**.
2. Select the dashboards, visualizations, and index patterns you want to move.
3. Click **Export**, then choose **Export all** to download the `.ndjson` file.

Keep the file — it is the input to the migrator, and your reference if you recreate anything by hand.

## Migrating manually

If you prefer to rebuild by hand, here is the translation the migrator applies.

### What changes

| Element | Kibana | OpenObserve |
|---|---|---|
| Query language | Lucene / KQL | SQL |
| Full-text search | `message: "timeout"` | `match_all('timeout')` |
| Aggregations | Elasticsearch aggregation DSL | SQL `AVG()`, `MIN()`, `GROUP BY`, time buckets |
| Time field | `@timestamp` | `_timestamp` |
| Data source | Index pattern | Stream |
| Dashboard builder | Kibana Lens / TSVB | OpenObserve dashboard builder |

### Translate queries

Lucene/KQL to SQL examples:

| Kibana query | OpenObserve SQL |
|---|---|
| `status:500` | `SELECT * FROM default WHERE status = '500'` |
| `message: "timeout"` | `SELECT * FROM default WHERE match_all('timeout')` |
| `response:>=400 AND response:<500` | `SELECT * FROM default WHERE response >= 400 AND response < 500` |
| `service:api AND level:error` | `SELECT * FROM default WHERE service = 'api' AND level = 'error'` |
| `NOT service:test` | `SELECT * FROM default WHERE service != 'test'` |

Aggregation examples:

| Kibana aggregation | OpenObserve SQL |
|---|---|
| Average of `response_time` | `SELECT avg(response_time) FROM default` |
| Terms (top values) of `status` | `SELECT status, count(*) FROM default GROUP BY status` |
| Date histogram over `@timestamp` (1m) | `SELECT histogram(_timestamp, INTERVAL '1 minute') AS ts, count(*) FROM default GROUP BY ts` |

:::tip[Use the AI Assistant]
Instead of translating by hand, use the **AI Assistant** in the OpenObserve UI. Paste a Lucene/KQL query and ask: *"Convert this Kibana query to OpenObserve SQL."* It handles field mapping, function translation, and aggregation syntax in one shot.
:::

### Recreate in OpenObserve

1. Open **Dashboards** → **New Dashboard** in the OpenObserve UI.
2. Add a panel and select the signal type (Logs, Metrics, or Traces).
3. Paste your translated SQL.
4. Configure the visualization type, axes, and thresholds.

## Kibana alerting rules

Kibana's built-in alerting rules are not migrated by the Dashboard Migrator — it converts dashboards and visualizations. To move a Kibana alert, recreate it as an OpenObserve [scheduled alert](../../user-guide/analytics/alerts/index.md): take the rule's Lucene/KQL query, translate it to SQL as above, and attach the threshold and destination. See the [Alerts documentation](../../user-guide/analytics/alerts/index.md) for details.

## Next steps

- [OpenObserve Dashboards Documentation](../../user-guide/analytics/dashboards/index.md) — dashboard builder, panel types, and variables
- [OpenObserve Alerts Documentation](../../user-guide/analytics/alerts/index.md) — recreate Kibana alerting rules as OpenObserve alerts
- [OpenObserve Full-Text Search Functions](../../reference/sql-functions/full-text-search.md) — SQL function reference for log queries (`match_all()`, `str_match()`, `re_match()`)

---

[Back to Overview](index.md)
