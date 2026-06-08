---
title: Dashboards API | OpenObserve
description: >-
  Manage individual dashboard panels via API. Add, update, and delete panels on
  v8 dashboards with optimistic-concurrency conflict detection.
---
# Dashboards API

OpenObserve exposes panel-level APIs for performing granular create, update, and delete operations on dashboard panels. These endpoints let you modify a single panel without sending the entire dashboard payload.

All requests must include an authorization header. See the [API Index](../index.md) for details on building the header.

!!! note "Version support"
    Panel operations are supported only for **v8 dashboards**. Calling these endpoints against a dashboard of any other version returns `400 Bad Request` with the message `Panel operations are only supported for v8 dashboards`.

!!! note "Optimistic concurrency"
    The `hash` query parameter is **mandatory** on all three endpoints. It carries the current dashboard hash and is used for optimistic-concurrency conflict detection. If the dashboard has changed since the hash was issued, the request fails with `409 Conflict`. Each successful response returns a new `hash` value that you can use for the next chained operation.

The full dashboard resource (create, get, update, delete, list, move) is also documented in the bundled OpenAPI/Swagger specification, available from the OpenObserve UI.

## Add Panel

Adds a new panel to an existing dashboard. If the panel layout is omitted (or supplied as all-zero coordinates), the layout is auto-computed and the panel is placed to the right of the last panel when there is room, or below all existing panels otherwise. A panel ID is generated automatically when none is provided.

### Endpoint
```
POST /api/{org_id}/dashboards/{dashboard_id}/panels
```

### Path Parameters

| Name           | Type   | Description       |
|----------------|--------|-------------------|
| `org_id`       | string | Organization name |
| `dashboard_id` | string | Dashboard ID      |

### Query Parameters

| Name     | Type   | Required | Description                                                              |
|----------|--------|----------|--------------------------------------------------------------------------|
| `hash`   | string | Yes      | Current dashboard hash, used for optimistic-concurrency conflict detection. |
| `folder` | string | No       | Folder ID where the dashboard is located. Defaults to the default folder. |

### Request Body

| Field   | Type   | Description                                                                                  |
|---------|--------|----------------------------------------------------------------------------------------------|
| `panel` | object | The panel definition to add. Uses the v8 `Panel` schema. `layout` is optional (auto-computed). |
| `tabId` | string | Optional tab ID to add the panel to. Defaults to the first tab if omitted.                   |

```json
{
  "panel": {
    "id": "",
    "type": "bar",
    "title": "Requests per minute",
    "description": "",
    "queryType": "sql",
    "queries": [
      {
        "query": "SELECT histogram(_timestamp) AS x, count(*) AS y FROM default GROUP BY x",
        "customQuery": false,
        "fields": {
          "stream": "default",
          "stream_type": "logs",
          "x": [],
          "y": [],
          "filter": { "filterType": "group", "logicalOperator": "AND", "conditions": [] }
        },
        "config": {}
      }
    ],
    "config": {}
  },
  "tabId": "default"
}
```

### Response

Returns the stored panel (including the resolved/auto-computed layout), the new dashboard hash, and the resolved tab ID.

```json
{
  "panel": {
    "id": "7148506321657856",
    "type": "bar",
    "title": "Requests per minute",
    "description": "",
    "queryType": "sql",
    "queries": [ ... ],
    "config": {},
    "layout": { "x": 0, "y": 0, "w": 96, "h": 18, "i": 1 }
  },
  "hash": "13845632198765432100",
  "tabId": "default"
}
```

| Status | Description                                            |
|--------|--------------------------------------------------------|
| 200    | Panel added.                                           |
| 400    | Unsupported dashboard version, or `hash` missing.      |
| 404    | Dashboard or tab not found.                            |
| 409    | Panel ID already exists, or hash conflict.             |

## Update Panel

Updates a single panel in a dashboard, identified by its panel ID. The panel ID in the URL path is authoritative. If the request body omits `layout`, the existing layout of the panel is preserved.

### Endpoint
```
PUT /api/{org_id}/dashboards/{dashboard_id}/panels/{panel_id}
```

### Path Parameters

| Name           | Type   | Description           |
|----------------|--------|-----------------------|
| `org_id`       | string | Organization name     |
| `dashboard_id` | string | Dashboard ID          |
| `panel_id`     | string | ID of the panel to update |

### Query Parameters

| Name     | Type   | Required | Description                                                              |
|----------|--------|----------|--------------------------------------------------------------------------|
| `hash`   | string | Yes      | Current dashboard hash, used for optimistic-concurrency conflict detection. |
| `folder` | string | No       | Folder ID where the dashboard is located. Defaults to the default folder. |

### Request Body

| Field   | Type   | Description                                                                       |
|---------|--------|-----------------------------------------------------------------------------------|
| `panel` | object | The updated panel definition. Uses the v8 `Panel` schema. Omit `layout` to preserve the existing layout. |
| `tabId` | string | Optional tab ID containing the panel. Defaults to the first tab if omitted.       |

```json
{
  "panel": {
    "type": "line",
    "title": "Requests per minute (updated)",
    "description": "",
    "queryType": "sql",
    "queries": [
      {
        "query": "SELECT histogram(_timestamp) AS x, count(*) AS y FROM default GROUP BY x",
        "customQuery": false,
        "fields": {
          "stream": "default",
          "stream_type": "logs",
          "x": [],
          "y": [],
          "filter": { "filterType": "group", "logicalOperator": "AND", "conditions": [] }
        },
        "config": {}
      }
    ],
    "config": {}
  },
  "tabId": "default"
}
```

### Response

Returns the updated panel, the new dashboard hash, and the resolved tab ID.

```json
{
  "panel": {
    "id": "7148506321657856",
    "type": "line",
    "title": "Requests per minute (updated)",
    "description": "",
    "queryType": "sql",
    "queries": [ ... ],
    "config": {},
    "layout": { "x": 0, "y": 0, "w": 96, "h": 18, "i": 1 }
  },
  "hash": "98712345600112233445",
  "tabId": "default"
}
```

| Status | Description                                       |
|--------|---------------------------------------------------|
| 200    | Panel updated.                                    |
| 400    | Unsupported dashboard version, or `hash` missing. |
| 404    | Dashboard, tab, or panel not found.               |
| 409    | Hash conflict.                                    |

## Delete Panel

Deletes a single panel from a dashboard, identified by its panel ID. If `tabId` is supplied, only that tab is searched; otherwise all tabs are searched until the panel is found.

### Endpoint
```
DELETE /api/{org_id}/dashboards/{dashboard_id}/panels/{panel_id}
```

### Path Parameters

| Name           | Type   | Description           |
|----------------|--------|-----------------------|
| `org_id`       | string | Organization name     |
| `dashboard_id` | string | Dashboard ID          |
| `panel_id`     | string | ID of the panel to delete |

### Query Parameters

| Name     | Type   | Required | Description                                                              |
|----------|--------|----------|--------------------------------------------------------------------------|
| `hash`   | string | Yes      | Current dashboard hash, used for optimistic-concurrency conflict detection. |
| `tabId`  | string | No       | Tab ID to search for the panel. If omitted, all tabs are searched.       |
| `folder` | string | No       | Folder ID where the dashboard is located. Defaults to the default folder. |

### Response

Returns the new dashboard hash and the ID of the deleted panel.

```json
{
  "hash": "44556677889900112233",
  "panelId": "7148506321657856"
}
```

| Status | Description                                       |
|--------|---------------------------------------------------|
| 200    | Panel deleted.                                    |
| 400    | Unsupported dashboard version, or `hash` missing. |
| 404    | Dashboard, tab, or panel not found.               |
| 409    | Hash conflict.                                    |

## Next steps

- [API Index](../index.md): authentication and the full list of OpenObserve APIs.
- [Stream Settings](../stream/setting.md): configure stream behavior via API.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
