---
title: Splunk HEC Log Ingestion - HTTP Event Collector | OpenObserve
description: Send logs to OpenObserve using the Splunk HTTP Event Collector (HEC) protocol with a Splunk HEC token. Configure Splunk forwarders and HEC clients for centralized log management.
---
# Splunk HEC Log Ingestion

OpenObserve provides a Splunk-compatible HTTP Event Collector (HEC) endpoint, so Splunk forwarders and other HEC clients can send events to OpenObserve using the standard Splunk HEC protocol. Authentication uses a **Splunk HEC token** — a GUID generated in OpenObserve — instead of the usual `o2oi_` ingestion token or a user password.

The organization is resolved from the token, so no organization identifier appears anywhere in the request. This lets a Splunk forwarder point at a bare host without reconfiguration.

![TODO: screenshot of the Splunk HEC tab on the Logs ingestion page](images/placeholder.png)

## Prerequisites

To send data over Splunk HEC you need a Splunk HEC token for your organization. Generate one on the **Ingestion Tokens** page:

1. Navigate to **IAM > Ingestion Tokens**.
2. Create a new token (and check **Also create a Splunk HEC token**), or edit an existing token and click the **Generate Splunk token** action in its row.

![TODO: screenshot of the Splunk HEC token column and generate/revoke actions on the Ingestion Tokens page](images/placeholder.png)

The Splunk HEC token is a lowercase hyphenated GUID, for example `7b3d9f2c-4a11-4e55-9c8b-2f6a01c34d90`. Copy it when it is shown — it is a bearer credential and is not displayed again in full.

## Endpoint

Send `POST` requests to:

| Field | Value |
|---|---|
| Endpoint | `https://<your-openobserve-host>/services/collector` |
| Alias | `/services/collector/event` (identical, accepts the same payload) |
| Health check | `GET /services/collector/health` |

The collector is mounted at the server root, so it is **not** affected by the `ZO_BASE_URI` setting. A Splunk forwarder appends the path itself and cannot be reconfigured, so do not add an organization or `/api/` segment to the path.

## Authentication

Send the token as the value of the `Authorization` header using the `Splunk` scheme:

```
Authorization: Splunk <splunk-hec-token>
```

OpenObserve maps the GUID to the underlying org ingestion token and authorizes ingestion through the same org-scoped path as every other token. The GUID itself never authenticates any `/api/` route.

## Example request

```shell
curl -k https://<your-openobserve-host>/services/collector \
  -H "Authorization: Splunk <splunk-hec-token>" \
  -d '{"event":{"level":"info","log":"test message for openobserve"},"index":"default","time":1789060000}'
```

## Event payload

Each event is a JSON object. The `event` and `index` fields are the most important:

```json
{
  "event": { "level": "info", "log": "test message for openobserve" },
  "index": "application",
  "time": 1789060000.123,
  "host": "web-01",
  "source": "/var/log/app.log",
  "sourcetype": "app:json"
}
```

- `event` — the log record. It can be a string (stored under the `log` field) or an object. It must not be empty.
- `index` — the stream to write to. Events without an `index` go to the `default` stream.
- `time` — epoch seconds; a fractional value is accepted. When missing or not positive, the receipt time is used.
- `host`, `source`, `sourcetype` — stored as columns on the event.
- `fields` — additional key/value pairs to attach. `fields` has the lowest precedence: it can add keys but never overwrite the event body or envelope metadata.

## Health check

`GET /services/collector/health` requires no authentication and answers:

```json
{"text":"HEC is healthy","code":17}
```

## Response codes

The collector returns Splunk's status codes, deliberately distinct from the legacy `/api/{org_id}/_hec` route:

| HTTP status | `code` | `text` |
|---|---|---|
| 200 | 0 | Success |
| 403 | 1 | Token disabled |
| 401 | 2 | Token is required |
| 401 | 3 | Invalid authorization |
| 403 | 4 | Invalid token |
| 400 | 5 | No data |
| 400 | 6 | Invalid data format |
| 400 | 7 | Incorrect index |
| 500 | 8 | Internal server error |
| 503 | 9 | Server is busy |
| 400 | 12 | Event field is required |
| 400 | 13 | Event field cannot be blank |
| 413 | 6 | Request entity too large |

## Splunk Edge Processor

!!! warning "Splunk Edge Processor configuration"

    - Disable `useACK` on the destination. Indexer acknowledgement is not supported, and a client waiting for one will block.
    - The **Edge Processor** forwards the upstream client's token for any data that reached it over HEC, and uses the destination token only when the data carries none. Have upstream clients send this organization's Splunk token, or send to the Edge Processor without an `Authorization` header. Getting this wrong looks like total silent data loss, because every request answers `403`.

## TLS

!!! warning "Use HTTPS"

    The Splunk HEC token is a bearer credential that is replayable over plaintext HTTP. Terminate TLS at OpenObserve (`ZO_HTTP_TLS_ENABLED`, disabled by default) or at a trusted proxy in front of it.

## Managing Splunk HEC tokens

### Create a token with a Splunk HEC token

When creating an org ingestion token, check **Also create a Splunk HEC token** in the **Create New Token** dialog. The token is minted together with the regular ingestion token and both values are shown once in the reveal dialog.

![TODO: screenshot of the Create New Token dialog with the "Also create a Splunk HEC token" checkbox](images/placeholder.png)

![TODO: screenshot of the New Token Generated dialog showing the Splunk HEC token and HEC URL](images/placeholder.png)

### Generate or revoke a Splunk HEC token

On the **Ingestion Tokens** page, use the link/unlink action in a token's row to generate or revoke its Splunk HEC token:

- **Generate Splunk token** — mints a new GUID, replacing the previous one. The old GUID stops authenticating immediately.
- **Revoke Splunk token** — removes the GUID. Forwarders using it start receiving `403` errors immediately; this cannot be undone.

## Verify ingestion

Once your forwarder is shipping, open the OpenObserve UI, click **Logs** in the sidebar, and select the stream named by the `index` field (or `default`). New entries should appear within a few seconds. If nothing appears, confirm the `Authorization` header uses the `Splunk` scheme and that the endpoint has no organization or `/api/` segment.

## Next steps

- [Ingestion Tokens](../../user-guide/account-administration/identity-and-access-management/ingestion-tokens.md): create and manage org-level ingestion tokens.
- [Logs UI](../../user-guide/data-exploration/logs/logs.md): search and explore ingested logs.
- [Other log ingestion options](./index.md): OpenTelemetry, Vector, Fluent Bit, syslog, and language SDKs.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
