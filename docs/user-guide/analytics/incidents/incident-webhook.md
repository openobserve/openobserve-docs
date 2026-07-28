---
description: "Push alerts from Alertmanager, Datadog, Grafana, or any system that can POST JSON into OpenObserve incident correlation using the incident ingest webhook."
---

# Incident Ingest Webhook

The incident ingest webhook accepts alerts from systems outside OpenObserve and correlates them into incidents alongside the alerts OpenObserve evaluates itself.

Most teams adopting OpenObserve already run Alertmanager, Datadog, or Grafana, and will not move every alert rule at once. Without this endpoint, incident correlation only ever sees OpenObserve's own alerts and produces a partial picture of an incident. This endpoint closes that gap.

!!! note
    Incident Management is available in OpenObserve Enterprise and Cloud editions. This endpoint requires `O2_INCIDENTS_ENABLED=true` and returns `403` when incident correlation is disabled.

## Endpoint

```
POST /api/v2/{org_id}/alerts/incidents/ingest
```

Authenticate the same way as any other OpenObserve API call — HTTP basic auth with your email and passcode, or a service-account token.

## Send a firing alert

```bash
curl -u "$EMAIL:$PASSCODE" https://your-instance:5080/api/v2/default/alerts/incidents/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "alertmanager",
    "alert_name": "HighErrorRate",
    "dedup_key": "a1b2c3",
    "severity": "critical",
    "status": "firing",
    "labels": {
      "service": "checkout",
      "k8s_namespace_name": "production",
      "host": "ip-10-0-1-5"
    },
    "annotations": {
      "summary": "Error rate above 5% for 10 minutes"
    },
    "external_url": "https://alertmanager.example.com/#/alerts"
  }'
```

Response:

```json
{
  "action": "incident_created",
  "alert_id": "2Ab3Cd4Ef5Gh6Ij7Kl8Mn9Op0Qr",
  "incident_id": "2Xy9Zw8Vu7Ts6Rq5Po4Nm3Lk2Ji"
}
```

## Payload reference

| Field | Required | Description |
|-------|----------|-------------|
| `source` | Yes | Originating system, e.g. `alertmanager`. Namespaces the alert so two systems' identically-named alerts stay distinct. Max 128 characters. |
| `alert_name` | Yes | Name of the alert rule in the originating system. Max 512 characters. |
| `labels` | No | Identity labels. **This is the only field that drives correlation.** Max 64 entries, 1024 characters per key or value. |
| `dedup_key` | No | Idempotency key. Two deliveries carrying the same key inside 30 minutes are treated as one firing. |
| `severity` | No | Severity in the originating system's vocabulary. See [Severity mapping](#severity-mapping). |
| `status` | No | `firing` (default) or `resolved`. |
| `timestamp` | No | Firing time in epoch **microseconds**. Defaults to receipt time. Values outside 2000–2100 are rejected — see [Timestamps](#timestamps). |
| `annotations` | No | Display-only context such as summary or runbook. Never used for correlation. Same size limits as `labels`. |
| `external_url` | No | Deep link back into the originating system. Must be `http://` or `https://`. Max 2048 characters. |

### Timestamps

`timestamp` is **microseconds**, not seconds or milliseconds — the unit most systems hand you.

Values outside the year 2000–2100 range are rejected with a `400` that names the likely mistake. This is deliberate: a seconds-precision value would place the incident in 1970, where the auto-resolve sweep treats it as long stale and closes it immediately. You would see a `200`, and the alert would silently disappear. Failing the request is the kinder outcome.

Omit the field entirely to use receipt time, which is correct for most senders.

## How correlation works

Only `labels` decides which incident an alert joins.

OpenObserve normalizes label names through its semantic field groups before matching, so vendor-specific spellings converge automatically. Prometheus' `instance`, Datadog's `host`, and OpenTelemetry's `k8s.node.name` all resolve to the same canonical dimension. **You do not need a per-vendor adapter** — you only need to send the labels you have.

From there:

- **Labels match an open incident** — the alert joins it. This is true whether the other alerts in that incident arrived over this webhook or came from OpenObserve's own alert evaluation. That mixing is the point of the feature.
- **Labels match nothing** — the alert gets an incident of its own.
- **No labels at all** — same as above. An alert with nothing to correlate on is isolated rather than lumped in arbitrarily.

### Alert identity and notifications

`source` and `alert_name` together identify the alert **rule**. OpenObserve derives a stable internal id from `(organization, source, alert_name)`, so you do not register anything in advance — just send the same two values each time.

That identity determines whether a delivery notifies:

| Situation | `action` | Notifies |
|---|---|---|
| No open incident matched | `incident_created` | Yes |
| This rule appears in an existing incident for the first time | `alert_joined` | Yes — a new alert type joining is an escalation signal |
| This rule is already in the incident | `alert_repeated` | No — suppressed by design |
| Redelivery of a seen `dedup_key` | `duplicate_ignored` | No — nothing is written |

So keep `source` and `alert_name` stable across deliveries of the same rule. Varying them makes every firing look like a brand-new alert type and re-notifies.

### Severity mapping

`severity` is mapped onto OpenObserve's incident severities. Matching is case-insensitive.

| Incident severity | Accepted values |
|---|---|
| P1 | `p1`, `1`, `critical`, `crit`, `fatal`, `emergency`, `disaster` |
| P2 | `p2`, `2`, `error`, `high`, `major` |
| P3 | `p3`, `3`, `warning`, `warn`, `medium`, `average` |
| P4 | `p4`, `4`, `info`, `information`, `informational`, `low`, `minor`, `debug` |

An unrecognized value is not a guess and not an error — the configured default is used instead.

## Resolve an alert

Send the same `source` and `alert_name` with `status: resolved`:

```bash
curl -u "$EMAIL:$PASSCODE" https://your-instance:5080/api/v2/default/alerts/incidents/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "alertmanager",
    "alert_name": "HighErrorRate",
    "status": "resolved"
  }'
```

The incident resolves once **every** alert in it has resolved. If other alerts are still firing, the incident stays open and you get `alert_resolved` rather than `incident_resolved`.

!!! note
    An incident that also contains alerts OpenObserve evaluated itself will not auto-close this way. Native alerts have no upstream "resolved" signal, so they never count as resolved here and the incident stays open for a human to close or for the auto-resolve timeout. This is deliberate — closing an incident because its external half recovered would hide a native alert that is still firing.

| `action` | Meaning |
|---|---|
| `alert_resolved` | This alert resolved; the incident still has others firing |
| `incident_resolved` | This was the last one firing, so the incident closed |
| `nothing_to_resolve` | No open incident contained this alert, or it was already resolved |

!!! warning
    If you never send resolves, externally-ingested alerts keep their incidents open until the auto-resolve timeout (`O2_INCIDENTS_AUTO_RESOLVE_AFTER_MINUTES`, 3 days by default) or someone resolves them by hand. Wire up resolves if your source supports them.

## Idempotency

Senders retry. Pass a `dedup_key` that is stable for a given firing — Alertmanager's `fingerprint` works well — and redeliveries inside a 30-minute window are dropped instead of inflating the incident's alert count.

Without a `dedup_key`, deliveries are deduplicated on `(source, alert_name)` alone within the same window. That is safe, but it also means two genuinely distinct firings of the same rule minutes apart collapse into one. Send a key if you care about the distinction.

## Forwarding from Alertmanager

Alertmanager posts its own fixed payload shape, which this endpoint does not accept directly. Map it first — pointing a `webhook_config` straight at the endpoint looks correct and fails with `400`.

```bash
# Relay: reshape Alertmanager's payload, then forward each alert.
jq -c '.alerts[] | {
  source:       "alertmanager",
  alert_name:   .labels.alertname,
  dedup_key:    .fingerprint,
  severity:     .labels.severity,
  status:       .status,
  labels:       .labels,
  annotations:  .annotations,
  external_url: .generatorURL
}' \
  | while read -r alert; do
      curl -u "$EMAIL:$PASSCODE" \
        https://your-instance:5080/api/v2/default/alerts/incidents/ingest \
        -H 'Content-Type: application/json' -d "$alert"
    done
```

Alertmanager's `status` field already uses `firing` and `resolved`, so resolves flow through without extra work.

The same shape works for any source — produce the fields in the [payload reference](#payload-reference) and the correlation behaves identically regardless of where the alert came from.

## Viewing external alerts

Externally-ingested alerts appear in the incident's alert list with their `source`, and link back to the originating system when you supply `external_url`.

They deliberately carry **no notification destinations**. Routing for an incident is owned by the OpenObserve alerts in it — an external system cannot choose who gets paged. If an incident contains only external alerts, add a native OpenObserve alert to the same correlation dimensions to control its routing.

## Setup in the UI

The endpoint, ready-to-run examples, and your organization's credentials are available in the product under **Data Sources → Custom → Alerts**.

## Errors

| Status | Cause |
|---|---|
| `400` | Payload failed validation — blank `source` or `alert_name`, a labels/annotations map over the size limits, a non-`http(s)` `external_url`, or a `timestamp` that is not plausible microseconds. The response body names the offending field. |
| `403` | Incident correlation is disabled (`O2_INCIDENTS_ENABLED`), or you are on an edition without Incident Management. |

## Related

- [Incident Management](index.md) — how correlation, RCA, and the incident timeline work
- [Alerts Overview](../alerts/index.md) — alerts OpenObserve evaluates itself
