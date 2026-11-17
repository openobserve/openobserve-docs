---
title: Home
metaTitle: "OpenObserve Home Page Overview"
description: "What the OpenObserve Home page shows: alert and data health, top streams, ingest limit and data size, signal cards, incidents and recent events."
---

# Home Page Overview

**Home** is the first page you see after you sign in. Its **Overview** tab shows, on one screen, whether anything needs your attention and whether your data is arriving, intact and delivered. Most counts open the list behind them.

## Home tabs

| Tab | What it shows | Availability |
|-----|---------------|--------------|
| **O2 Assistant** | AI chat about your data | Enterprise and Cloud, when the AI assistant is enabled |
| **Overview** | Current alert, data health and storage state, plus incidents, services, anomalies and recent events | All editions |
| **Usage** | Streams, events and ingested size for the organization | All editions |
| Pinned dashboard | A dashboard pinned with **Pin to home page**, shown to everyone in the organization. Close its tab to **Remove home dashboard**. | All editions |

You can drag the tabs to change their order.

## Time range and refresh

The refresh button and time range picker sit at the top right of the **Overview** tab. The time range defaults to the last 15 minutes, and your choice is remembered in your browser.

- Only the sections under **In the selected time range** follow the time range. The cards above them show the current state; hover the refresh button to see when the data was last loaded.
- If a refresh fails, the page keeps the last good data under a notice with a **Retry** button.

## Alerts and incidents

This card is titled **Alerts and incidents** when incidents are available, and **Alerts** otherwise. Its subtitle counts the active rules and the rules failing to evaluate.

- Count boxes: **Critical level** and **Warning level** (firing alerts by level), **Open incidents** (Enterprise and Cloud) and **Rules failing**. Each box opens the alert or incident list filtered to the rows it counts.
- **Firing now, oldest first** lists firing alerts with their level, stream and how long they have been firing. When nothing fires, the card says **No alerts firing right now**.
- **View all alerts** opens the full alert list. With no alert rules yet, the card offers **Create an alert** instead.

## Data health

The **Data health** card answers "Is data arriving, intact and delivered?". Each row has a status word: **Needs action**, **Warning**, **Healthy**, **Not set up** or **Info**.

| Row | What it counts | Click opens |
|-----|----------------|-------------|
| **Streams gone quiet** | Streams that stopped writing between an hour and 7 days ago | Streams |
| **Alert rules failing to evaluate** | Rules that cannot run: blind spots, not firing alerts | Alerts, filtered to failing rules |
| **Pipelines with errors** | Enabled pipelines with an error | Pipelines, filtered to errored pipelines |
| **Alert delivery failures** | Alerts that fired but could not send a notification | Alerts, filtered to delivery failures |
| **Schema changes in 24h** | New schema versions across your streams | Streams |
| **Compaction jobs pending** | Pending compaction jobs across the stream types you can see | Streams |

**View pipelines** opens the pipeline list.

## Active incidents

**Active incidents** lists open incidents with their severity, title, age and alert count. **Investigate →** opens an incident, and **View all** opens the incident list. Incidents are available in Enterprise and Cloud. Other builds show a locked prompt here.

## Streams, storage and signals

- **Top streams by data size** lists the largest streams you can access, each with its share of the total. Click a row or **All streams** to open Streams. With no streams yet, **Start ingesting** opens Data sources.
- **Ingest limit and storage** appears on self-hosted Enterprise deployments. It shows **Ingested today (UTC)** against the daily limit, when the limit resets (00:00 UTC), and **Days over limit this month**. With a daily limit set, an **Approaching limit** badge appears from 75% and **Over limit** at 100%. The daily limit counts the UTC day, not a rolling 24 hours. Below that, the card shows the data size by signal.
- On Cloud and open-source builds, the same card is titled **Data size** and shows only the uncompressed data size, split by logs, metrics and traces.
- The **Logs**, **Metrics** and **Traces** cards show the number of **Streams**, the **Events**, **Samples** or **Spans** count and the **Data size** of each signal. **Open** goes to that signal's page.

## In the selected time range

- **Services** (Enterprise and Cloud, needs trace data): one card per service with **Error rate**, **Latency** and **Reqs**. Click a card for its latency and RED charts, or **View all** to open the service graph for the same time range.
- **Active anomalies**: anomalies detected in the time range, when anomaly detection is enabled. **View all** opens the anomaly detection list.
- **Recent events**: recent alert events, with a count when an alert fired more than once. **View all** opens the alert list.

## Ask AI

On Enterprise and Cloud with the AI assistant enabled, items that show a problem get an **Ask AI** button. It opens a new chat in the **O2 Assistant** tab with the item's counts and time range attached, and sends nothing until you do.

## Access

Each card shows only what your role is allowed to list. A card your role cannot see says that your role cannot see this data, and you can ask an org admin for access.

## Self-hosted: overview cache

The overview data is cached per user for `ZO_OVERVIEW_CACHE_TTL` seconds (default `30`). Set it to `0` to turn the cache off. Responses with a failed section are never cached, and the refresh button always skips the cache. For other settings, see [Environment variables](administration/configuration/environment-variables.md).
