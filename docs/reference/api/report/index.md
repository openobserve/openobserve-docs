---
title: Reports API | OpenObserve
description: >-
  Manage folder-aware dashboard reports in OpenObserve via the v2 REST API. List,
  create, get, update, move, delete, enable, and trigger reports scoped to folders.
---
# Reports API

The Reports v2 API lets you manage automated dashboard reports that are organized into folders. Every report belongs to a folder; if you do not specify one, the report is placed in the `default` folder.

These endpoints are served under the `/api/v2/{org_id}/reports` prefix and identify reports by their `report_id` (a KSUID). Folder placement is controlled with the `folder` query parameter.

All requests require an authorization header. See the [API Reference](../index.md) for how to build the HTTP basic-auth header.

## Permissions

Report access is scoped by folder. In RBAC, permissions are evaluated against the `rfolder` (report folder) resource for the folder a report lives in, rather than against individual reports. To list, view, or modify reports in a folder, a user must hold the corresponding permission on that report folder.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`    | `/api/v2/{org_id}/reports`                    | List reports, optionally scoped to a folder |
| `POST`   | `/api/v2/{org_id}/reports`                    | Create a report in a folder |
| `GET`    | `/api/v2/{org_id}/reports/{report_id}`        | Get a report by ID |
| `PUT`    | `/api/v2/{org_id}/reports/{report_id}`        | Update a report (and optionally move it) |
| `DELETE` | `/api/v2/{org_id}/reports/{report_id}`        | Delete a report by ID |
| `DELETE` | `/api/v2/{org_id}/reports/bulk`               | Delete multiple reports by ID |
| `PATCH`  | `/api/v2/{org_id}/reports/move`               | Move reports between folders |
| `PATCH`  | `/api/v2/{org_id}/reports/{report_id}/enable` | Enable or disable a report |
| `PUT`    | `/api/v2/{org_id}/reports/{report_id}/trigger`| Manually trigger a report |

### Common path parameters

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `org_id`    | string | Organization name. |
| `report_id` | string | Report identifier (KSUID). |

## List Reports

Lists reports for the organization. Use the query parameters to scope the result to a folder or a specific dashboard.

### Endpoint
```
GET /api/v2/{org_id}/reports
```

### Query parameters

| Parameter      | Type    | Required | Description |
|----------------|---------|----------|-------------|
| `folder`       | string  | No       | Folder ID to filter by. When omitted, reports across folders are returned (subject to permissions). |
| `dashboard_id` | string  | No       | Return only reports that target this dashboard. |
| `cache`        | boolean | No       | When `true`, return only destination-less (cache) reports. |

### Example request
```
GET /api/v2/default/reports?folder=f_2abcDEF
```

### Response
```json
[
  {
    "report_id": "2cP9kZ7yQx1rT3wVnLm0",
    "name": "weekly-overview",
    "title": "Weekly Overview",
    "folder_id": "f_2abcDEF",
    "dashboards": ["3hQ8..."],
    "frequency": {
      "type": "weeks",
      "interval": 1,
      "cron": "",
      "align_time": false
    },
    "enabled": true,
    "owner": "admin@example.com",
    "last_triggered_at": 1717400000000000
  }
]
```

## Create Report

Creates a new report in the folder named by the `folder` query parameter, or in the `default` folder when omitted.

### Endpoint
```
POST /api/v2/{org_id}/reports
```

### Query parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `folder`  | string | No       | Folder ID to create the report in. Defaults to `default`. |

### Request Body

Use the `Report` schema. The `org_id`, `dashboards`, and `destinations` fields are required.

```json
{
  "name": "weekly-overview",
  "title": "Weekly Overview",
  "org_id": "default",
  "description": "Weekly summary delivered every Monday",
  "message": "Please find the weekly overview attached.",
  "enabled": true,
  "frequency": {
    "type": "weeks",
    "interval": 1,
    "cron": "",
    "align_time": false
  },
  "start": 1717400000000000,
  "timezone": "UTC",
  "timezoneOffset": 0,
  "dashboards": [
    {
      "dashboard": "3hQ8...",
      "folder": "default",
      "tabs": ["default"],
      "variables": [],
      "timerange": {
        "type": "relative",
        "period": "1w",
        "from": 0,
        "to": 0
      }
    }
  ],
  "destinations": [
    { "email": "team@example.com" }
  ]
}
```

### Field reference (Report)

| Field            | Type    | Description |
|------------------|---------|-------------|
| `name`           | string  | Unique report name within the organization. |
| `title`          | string  | Display title used in the report email. |
| `org_id`         | string  | Organization name. Required. |
| `description`    | string  | Optional description. |
| `message`        | string  | Message body included in the report email. |
| `enabled`        | boolean | Whether the report schedule is active. |
| `frequency`      | object  | Schedule definition. `type` is one of `once`, `hours`, `days`, `weeks`, `months`, `cron`. Use `interval` for periodic types and `cron` for a cron expression. |
| `start`          | integer | Start time of report generation, in UNIX microseconds. |
| `timezone`       | string  | Timezone name used to evaluate the schedule. |
| `timezoneOffset` | integer | Fixed timezone offset in minutes. |
| `dashboards`     | array   | Dashboards to render. Each entry references a `dashboard` ID, its `folder`, `tabs`, optional `variables`, and a `timerange`. |
| `destinations`   | array   | Where to deliver the report, e.g. `{ "email": "user@example.com" }`. |
| `owner`          | string  | Report owner. Defaults to the requesting user when empty. |

### Response
```json
{
  "code": 200,
  "message": "Report saved"
}
```

## Get Report

Returns a single report by ID.

### Endpoint
```
GET /api/v2/{org_id}/reports/{report_id}
```

### Response
Returns the full `Report` object. Returns `404 Not Found` if the report does not exist.

## Update Report

Updates an existing report. Provide the full `Report` body. To move the report to a different folder in the same request, include the `folder` query parameter; when omitted, the report stays in its current folder.

### Endpoint
```
PUT /api/v2/{org_id}/reports/{report_id}
```

### Query parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `folder`  | string | No       | Move the report to this folder ID. When omitted, the folder is unchanged. |

### Example request
```
PUT /api/v2/default/reports/2cP9kZ7yQx1rT3wVnLm0?folder=f_archive
```

### Response
```json
{
  "code": 200,
  "message": "Report updated"
}
```

## Delete Report

Deletes a single report by ID.

### Endpoint
```
DELETE /api/v2/{org_id}/reports/{report_id}
```

### Response
```json
{
  "code": 200,
  "message": "Report deleted"
}
```

## Bulk Delete Reports

Deletes multiple reports by ID in a single request. Deletion is idempotent: IDs that do not exist are reported as successful.

### Endpoint
```
DELETE /api/v2/{org_id}/reports/bulk
```

### Request Body
```json
{
  "ids": [
    "2cP9kZ7yQx1rT3wVnLm0",
    "2cQ0aB1cD2eF3gH4iJ5k"
  ]
}
```

### Response
```json
{
  "successful": ["2cP9kZ7yQx1rT3wVnLm0", "2cQ0aB1cD2eF3gH4iJ5k"],
  "unsuccessful": [],
  "err": null
}
```

## Move Reports

Moves one or more reports to a destination folder.

### Endpoint
```
PATCH /api/v2/{org_id}/reports/move
```

### Request Body

| Field           | Type     | Description |
|-----------------|----------|-------------|
| `report_ids`    | string[] | IDs of the reports to move. |
| `dst_folder_id` | string   | Destination folder ID. |

```json
{
  "report_ids": ["2cP9kZ7yQx1rT3wVnLm0"],
  "dst_folder_id": "f_archive"
}
```

### Response
```json
{
  "code": 200,
  "message": "Report moved"
}
```

## Enable or Disable a Report

Enables or disables a report's schedule.

### Endpoint
```
PATCH /api/v2/{org_id}/reports/{report_id}/enable
```

### Query parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| `value`   | boolean | No       | `true` to enable, `false` to disable. Defaults to `false`. |

### Example request
```
PATCH /api/v2/default/reports/2cP9kZ7yQx1rT3wVnLm0/enable?value=true
```

### Response
```json
{
  "enabled": true
}
```

## Trigger a Report

Manually triggers report generation and delivery, independent of its schedule.

### Endpoint
```
PUT /api/v2/{org_id}/reports/{report_id}/trigger
```

### Response
```json
{
  "code": 200,
  "message": "Report triggered"
}
```

## Next steps

- [API Reference](../index.md): Overview of the OpenObserve REST API and how to build the authorization header.
- [Reports](../../../user-guide/analytics/reports/index.md): Create and schedule dashboard reports from the UI.
- [Stream Settings API](../stream/setting.md): Manage stream-level settings via the API.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
