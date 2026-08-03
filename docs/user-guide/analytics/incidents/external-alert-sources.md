---
title: External Alert Sources
metaTitle: External Alert Sources for Incident Management | OpenObserve
description: Ingest alerts from Grafana, Alertmanager, and generic webhooks into OpenObserve incidents. Set up integrations, view source status, and inspect raw payloads.
---

OpenObserve can ingest alerts from external monitoring systems — Grafana, Prometheus Alertmanager, or any tool that can POST a JSON webhook — and automatically correlate them into incidents alongside your native OpenObserve alerts.

:::info[Availability]
This feature is available in Enterprise and Cloud editions. The feature is gated by the `O2_INCIDENTS_ENABLED` configuration flag.
:::

## Overview

External Alert Sources lets you funnel alerts from your existing observability stack into OpenObserve's incident management. When an external system fires an alert, OpenObserve:

1. Receives the webhook at a token-authenticated endpoint.
2. Auto-detects the source format (Grafana, Alertmanager, or generic JSON) or uses the explicit source type you configured.
3. Normalizes the payload — extracting severity, labels, timestamps, and dedup key.
4. Persists the alert and correlates it into an incident using the same correlation engine that groups your internal alerts.
5. Auto-resolves the incident when all contributing external alerts have cleared.

Each organization gets a default catch-all integration automatically. You can create additional named integrations for separate source systems.

## Prerequisites

- OpenObserve Enterprise or Cloud edition
- Incidents enabled (`O2_INCIDENTS_ENABLED=true`)
- RBAC: users need the `incidents` resource permission to manage integrations

## Access external alert sources

1. Navigate to **Alerts** in the left sidebar.
2. Select the **External Alert Sources** tab.

![TODO: screenshot of External Alert Sources management page](images/placeholder.png)

## Default integration

Every organization gets a pre-created **default** integration with `source_type: auto`. It auto-detects whether inbound payloads are Grafana, Alertmanager, or generic format. The default integration:

- Has its own unique webhook URL and `o2iat_`-prefixed token.
- Cannot be deleted — disable it instead if you do not want to use it.
- Serves as a catch-all: any external system can POST to its URL and OpenObserve will parse it automatically.

## Source types

When creating an integration you can pin the source type or leave it on auto-detect:

| Type | Description |
|------|-------------|
| **Auto** | Auto-detects the source format from the payload shape and `User-Agent` header. Best for the default integration. |
| **Grafana** | Parses Grafana Alerting webhook payloads (`alerts[]` format with `orgId`/`title`/`state` keys). |
| **Alertmanager** | Parses Prometheus Alertmanager webhook payloads (`alerts[]` format with `groupKey`/`version`). |
| **Generic** | Accepts a single alert object or an array, each requiring `status` (`firing`/`resolved`) and `labels` fields. Supports optional `severity`, `dedup_key`, `title`, `source_url`, and `event_ts` fields. |

## Add an external alert source

1. On the External Alert Sources page, click **Add Source**.

   ![TODO: screenshot of Add External Alert Source form](images/placeholder.png)

2. Enter a **name** for the integration (max 100 characters).
3. Select a **source type** from the dropdown: Auto, Grafana, Alertmanager, or Generic.
4. Click **Save**. The new integration appears in the table with its own webhook URL and token.

## Configure the source system

Once an integration is created, point your external system at the webhook URL. The External Alert Sources page shows setup instructions for each source type.

### Grafana

In Grafana, create a new contact point with type **webhook** and paste the integration's URL. Grafana's default payload is auto-detected — no template changes needed.

### Alertmanager

Add the URL to your Alertmanager configuration under `receivers`:

```yaml
receivers:
  - name: openobserve-incidents
    webhook_configs:
      - url: "<your-integration-url>"
        send_resolved: true
```

Set `send_resolved: true` so Alertmanager notifies OpenObserve when alerts resolve, enabling incident auto-resolution.

### Generic webhook

POST a JSON object or array to the URL. Each alert must include `status` and `labels`:

```bash
curl -X POST '<your-integration-url>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"firing","labels":{"alertname":"HighCPU","service":"checkout"},"severity":"critical"}'
```

The generic schema supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `status` | Yes | `firing` or `resolved` |
| `labels` | Yes | Key-value pairs used for deduplication and incident correlation |
| `title` | No | Alert title (falls back to first label value) |
| `severity` | No | Mapped to incident severity: `critical`→P1, `error`→P2, `warning`→P3, `info`→P4 |
| `dedup_key` | No | Stable identifier for deduplication (defaults to hash of sorted labels) |
| `source_url` | No | Link back to the source alert |
| `event_ts` | No | Epoch timestamp in microseconds (defaults to receipt time) |

## View source connection status

The table on the External Alert Sources page shows each sender that has sent alerts through your integrations.

![TODO: screenshot of sender status table with receiving/stale/not-connected badges](images/placeholder.png)

Status badges:

- **Receiving** (green): The sender sent at least one accepted alert recently.
- **Stale** (yellow): The sender sent alerts in the past but none recently.
- **Not Connected** (gray): No alerts received from that sender yet.

When multiple upstream systems share the default integration's token, each distinct sender appears as its own row with a **shared token** badge.

## Manage integrations

Each integration row offers actions:

| Action | Icon | Description |
|--------|------|-------------|
| **Reveal/Hide token** | Eye | Toggle between masked (`o2iat_****xxxx`) and full webhook URL. |
| **Copy URL** | Copy | Copy the full webhook URL to the clipboard. |
| **Rotate token** | Refresh | Generate a new token — old one stops working immediately. Useful when a token is compromised. Confirm the action in a dialog first. |
| **Enable/Disable** | Play/Pause | Temporarily stop or resume accepting alerts through this integration. |
| **Delete** | Trash | Remove the integration. Only non-default integrations can be deleted. Confirm in a dialog first. |

## How external alerts become incidents

When an external alert arrives, OpenObserve normalizes it and feeds it through the same incident correlation engine used for native alerts:

1. **Deduplication**: Each alert has a `dedup_key` (from the `fingerprint` field for Grafana/Alertmanager, or explicit `dedup_key` for generic). Recurring alerts with the same key refresh the existing record rather than creating duplicates.

2. **Correlation**: External alerts carry labels (e.g. `service`, `namespace`, `cluster`). These labels are matched against the configured service identity dimensions to find or create the right incident, identical to how internal alerts are grouped.

3. **Severity mapping**: Severity labels are mapped to incident priority levels (P1–P4). For generic payloads, the optional `severity` field takes precedence; otherwise a label named `severity` is used.

4. **Auto-resolution**: When every external alert linked to an incident reports `resolved` status, OpenObserve automatically resolves the incident. This mirrors the auto-resolution behavior for internal alerts.

External alerts appear in the incident's **Alert Triggers** table. Hover over the correlation reason to see whether the alert came from an external source.

![TODO: screenshot of incident Alert Triggers table showing external alert entries](images/placeholder.png)

## View raw payload

To inspect exactly what a source system sent, open the raw payload for an external alert:

1. In an incident detail view, go to the **Alert Triggers** tab.
2. Find an external alert (identified by the external source label).
3. Click **View raw payload**.

![TODO: screenshot of raw payload viewer showing the original webhook JSON](images/placeholder.png)

The raw payload viewer shows the original, unmodified webhook body received from the source system — useful for debugging formatting issues or verifying what fields the source is sending.

## API reference

All endpoints require the `incidents` resource permission.

### List integrations

```
GET /api/v2/{org_id}/incidents/integrations
```

Returns all integrations for the organization, including the default.

### Create integration

```
POST /api/v2/{org_id}/incidents/integrations
```

Request body:

```json
{
  "name": "grafana-prod",
  "source_type": "grafana",
  "config": { "destinations": ["slack"] }
}
```

`source_type` defaults to `auto`. Allowed values: `auto`, `grafana`, `alertmanager`, `generic`.

### Delete integration

```
DELETE /api/v2/{org_id}/incidents/integrations/{integration_id}
```

The default integration cannot be deleted — returns 400.

### Enable or disable integration

```
PATCH /api/v2/{org_id}/incidents/integrations/{integration_id}/enable
```

Request body:

```json
{ "enabled": false }
```

### Rotate integration token

```
POST /api/v2/{org_id}/incidents/integrations/{integration_id}/rotate
```

Returns the new token. The old token stops working immediately.

### List senders

```
GET /api/v2/{org_id}/incidents/integrations/{integration_id}/senders
```

Returns observed upstream senders with accepted/rejected counts and last-seen timestamps.

### Get raw external alert payload

```
GET /api/v2/{org_id}/alerts/incidents/external-alerts/{external_alert_id}/payload
```

Returns the stored raw webhook payload for an external alert event.
