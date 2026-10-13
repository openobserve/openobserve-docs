---
title: Downtimes
description: "Schedule maintenance windows in OpenObserve that keep alerting, anomaly detection, synthetics, and SLO evaluation running but suppress notifications for the affected resources."
---

A downtime is a scheduled maintenance window that keeps your monitoring running but silences the noise while you work. During a downtime, alerts, anomaly detections, synthetics checks, and SLOs that fall inside the window continue to evaluate — they just don't notify anyone.

![TODO: screenshot of the Downtimes list page with folders and downtime rows](images/placeholder.png)

!!! note
    Downtimes are available in OpenObserve Enterprise and Cloud editions.

## What a downtime covers

A downtime targets one or more of the following modules:

| Module | What it mutes |
|--------|---------------|
| **Alerts** | Scheduled and real-time alert notifications |
| **Anomaly detections** | Anomaly alert notifications |
| **Synthetics checks** | Synthetics failure notifications |
| **SLOs** | SLO breach alerts |

Each module can be narrowed further, so a single downtime can silence exactly the resources it should. A downtime applies to every item that matches its targets and condition during its schedule.

## Create a downtime

Navigate to **Alerts > Downtimes** and click **New Downtime** (or the equivalent **+** action).

![TODO: screenshot of the create downtime form showing schedule, targets, condition, and notification sections](images/placeholder.png)

### Name and reason

- **Name** is optional. If you leave it blank, OpenObserve generates one from the schedule and the first narrowing — for example, `service=payments · weekly`.
- **Reason** is optional and limited to 1000 characters. Use it to tell your team why the maintenance is happening.

### Schedule

The schedule defines when the downtime is in force. Choose one of three repeat modes:

- **Once** — a single window with an explicit start and end time.
- **Daily** — repeats every day at a fixed local start time.
- **Weekly** — repeats on the weekdays you select (1 = Monday through 7 = Sunday).

All recurring schedules are expressed in an [IANA timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) and use a local start time in `HH:MM` form, so a window follows local clock time rather than UTC.

The window length must be between **1 minute** and **7 days**, and cannot be longer than the time between repeats. A weekly rule with only one weekday repeats once every 7 days, for example, so its window is capped at 7 days.

Daylight-saving transitions are handled automatically. On a spring-forward day a full-day window is 23 hours long; on a fall-back day it is 25. No two windows ever overlap or leave a gap across a time change.

### Targets

Add one target per module you want to silence. For each target you can narrow the scope with any combination of:

- **Folders** — all folders, or up to 50 specific folders.
- **IDs** — up to 200 specific items.
- **Tags** — up to 16 tags. Tags narrow **synthetics checks only**; they are ignored for other modules.

For example, a target of **Alerts** with a single folder id silences only alerts in that folder; the same target with no narrowing silences all alerts in the organization.

### Dimension condition

For modules that carry a dimension identity — alerts, anomaly detections, and SLOs — you can add an optional condition tree that matches on semantic dimensions such as `service`, `env`, or `host`. The tree combines `key = value` and `key != value` pairs with **AND** / **OR** groups:

```
service = payments AND (host = db-1 OR host = db-2)
```

Conditions are validated against the organization's semantic field groups and follow these rules:

- At most **32** pairs, nested **3** levels deep.
- Every way to satisfy the condition must include at least one `=` pair, so a lone `!=` cannot silently mute everything.
- A value may end in `*` as a prefix, such as `db-*`.

Synthetics checks have no dimensions, so a condition is skipped for them. If you add a condition, at least one target must be a module that has an identity.

### SLO correction mode

For **SLOs**, choose how the downtime affects the SLO's calculations:

- **Exclude** — remove the downtime window from the SLO's evaluation, so maintenance does not count against it.
- **Count as good** — treat the downtime as a period of good service.

This option applies to SLOs only.

### Notifications

Downtimes can themselves notify your team. Optionally select up to **10** alert destinations and choose which events trigger a message:

- When the downtime **starts**
- When it is **ending soon**, with a lead time between 1 minute and the full window length
- When it **ends**

### Banner

Enable **Show banner** to display an organization-wide banner while the downtime is active. The banner is a single combined notice that names the downtime and summarizes what it mutes — for example, *"Staging teardown is active. 23 alerts and 5 synthetics checks are muted."* A banner is available only for windows of at most 7 days.

![TODO: screenshot of the organization-wide downtime banner shown across the top of the app](images/placeholder.png)

## Status lifecycle

A downtime moves through the following states:

| Status | Meaning |
|--------|---------|
| **Scheduled** | The window has not started yet. |
| **Active** | The current window is in force and notifications are suppressed. |
| **Ended** | Every window has run its course. |
| **Cancelled** | Cancelled before the window started, or between recurring windows. |
| **Ended early** | Cancelled in the middle of a window, which was cut short. |

## Incidents and un-muting

An alert that fires during a downtime does not create a paging incident. When the downtime ends and the alert fires again outside a window, the mute is cleared and normal incident creation resumes. Incidents created during a downtime are tracked with their muting downtime so they can be un-muted on the next un-suppressed firing.

## Anomaly detection behavior

A muted anomaly detection run spends no cooldown and no daily alert budget. The model keeps training and scoring; only the notification is suppressed, and the run is recorded as suppressed by the downtime.

## Downtime folders

Downtimes are organized into folders, with a **default** folder created for each organization. Folders let you group and permission maintenance windows the same way you organize alerts and dashboards.

## Permissions

Downtimes are governed by role-based access control through two resources:

- **Downtimes** — individual downtime entries.
- **Downtime Folders** — the folders that contain them.

Grants on a downtime folder flow down to the downtimes inside it. To apply a downtime to **all folders**, the role needs the organization-wide **list** permission on the downtime folder type.

## Configuration

Downtimes are enabled by default and tuned with these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `O2_DOWNTIMES_ENABLED` | `true` | Master switch for the downtime feature (beta). |
| `O2_DOWNTIMES_BANNER_ENABLED` | `true` | Show the org-wide banner for downtimes that opt in. |
| `O2_DOWNTIMES_MAX_PER_ORG` | `500` | Maximum number of downtimes an organization can hold. |
| `O2_DOWNTIMES_RETENTION_DAYS` | `90` | Days an ended or cancelled downtime is kept; values below 90 are raised to 90. |
| `O2_DOWNTIMES_REPLICATION_ENABLED` | `false` | Replicate downtimes and incident un-mutes across a super cluster. |

### Super cluster replication

Downtimes are region-local by default. Turn on `O2_DOWNTIMES_REPLICATION_ENABLED` only after every region in the cluster runs a build that supports downtimes: an older region cannot decode a downtime-folder message and redelivers it until upgraded. A region with replication off still stores the rows and folders it receives and skips only the side effects; rows created while it was off reach the other regions on their next edit, with no backfill.
