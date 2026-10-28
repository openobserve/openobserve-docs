---
title: Alert Conditions and Filters
description: "Define alert conditions in OpenObserve with the natural language builder: count and measure modes, aggregation functions, group-by, and filters."
---

This guide explains how to define alert conditions in OpenObserve using the condition sentence builder and filter system.

## Condition sentence

The condition sentence is the core of the alert configuration. It reads as natural language, making the alert logic immediately clear. The sentence structure changes based on the selected function.

### Count mode

When the function is set to **total events** (the default for logs and traces), the condition counts matching records:

**"Alert if total events >= 3 matching logs found"**

- The **operator** and **threshold** control when the alert fires
- No column selection is needed — the alert counts all records matching the filters
- Group-by is not available in count mode

![Count mode showing "Alert if total events >= 3 matching logs found" with Check every and filters](../../../images/add-alert-count-mode-v2.png)

### Measure mode

When you select an aggregation function (avg, min, max, sum, etc.), the condition evaluates a specific field:

**"Alert if avg of cpu_usage is >= 80"**

- A **column selector** appears — choose the field to aggregate
- **Group by** becomes available — evaluate the condition per dimension
- The operator and threshold now apply to the aggregated value

![Measure mode showing "Alert if avg of [column] is >= [value]" with Group by option](../../../images/add-alert-measure-mode.png)

### Metrics streams

For **metrics** stream types, count mode (total events) is not available. The condition always uses measure mode with an aggregation function.

---

## Aggregation functions

The function dropdown determines how data is evaluated. Each function includes a tooltip describing what it computes.

![Function dropdown showing all available options with tooltip](../../../images/function-dropdown-options.png)

| Function | Description | Mode |
|----------|-------------|------|
| **total events** | Count the total number of events matching filters (`COUNT(*)`) | Count |
| **count** | Count non-null values of the selected field | Measure |
| **avg** | Average value of the selected field | Measure |
| **min** | Minimum value of the selected field | Measure |
| **max** | Maximum value of the selected field | Measure |
| **sum** | Sum of all values of the selected field | Measure |
| **median** | Median (50th percentile) of the selected field | Measure |
| **p50** | 50th percentile value of the selected field | Measure |
| **p75** | 75th percentile value of the selected field | Measure |
| **p90** | 90th percentile value of the selected field | Measure |
| **p95** | 95th percentile value of the selected field | Measure |
| **p99** | 99th percentile value of the selected field | Measure |

---

## Group by

In measure mode, click **+** next to **Group by** to add one or more fields. When group-by is configured:

- The alert evaluates the condition independently for each unique combination of group-by field values
- If any group meets the condition, the alert triggers
- The notification includes which groups triggered the alert

For example, grouping by `hostname` with "Alert if avg of cpu_usage >= 80" evaluates CPU usage per host and alerts if any individual host exceeds the threshold.

### Having groups

**Having groups** sets the minimum number of groups that must satisfy the condition for the alert to trigger. For example, with a value of 3, the alert fires only when at least 3 group-by combinations meet the condition.

:::note[Note]
When aggregation or group-by is enabled, the right-hand **Preview** panel renders a multi-series chart. When there are three or more group-by fields, the preview is shown as a table instead.
:::

---

## Filter conditions

Filters narrow which data the alert evaluates. Click the **filters** dropdown in the condition area to expand the filter section.

### Add a filter

1. Click **+ Condition** to add a new filter row.
2. Select a **field** from the stream's available columns.
3. Select an **operator**: `=`, `!=`, `>=`, `<=`, `>`, `<`, `Contains`, `NotContains`, `Is Null`, `Is Not Null`, `Is Empty`, or `Is Not Empty`.
4. Enter a **value** to match. The four null and empty operators take no value.

### Multiple filters

- The first condition is labeled **if**.
- Additional conditions are joined with **and** by default, so all conditions must be true for a record to match. Click the toggle button next to the label to switch between **and** and **or**.
- Click the **x** button on any condition row to remove it.

### Filter groups

Click **+ Condition Group** to create a grouped block of conditions. Groups support their own logical operator, enabling nested logic such as:

`(level = error AND service = api) OR (level = warn AND response_time > 5000)`

:::note[Note]
Condition groups can be nested two levels below the top-level conditions. At that depth the **Condition Group** button is disabled.
:::

### SQL preview

A SQL preview of the generated query is always visible within the filter section. It updates automatically as you add or modify conditions. The preview is limited to two lines and scrolls for longer queries.

---

## Query modes

### Builder mode

The default mode. Use the condition sentence and filters to define alert logic without writing code. Suitable for most monitoring use cases.

### SQL mode

Click the **SQL** tab to switch to SQL mode. The condition sentence is replaced with:

- An inline SQL editor with the generated query
- An **Open Full Editor** button for a full-screen editor with a field browser, AI assistance, and results preview
- **Check every** and **Alert if No. of events** controls below the editor

![SQL mode with editor, Open Full Editor button, and threshold controls](../../../images/add-alert-sql-mode-v2.png)

:::warning[Warning]
Queries using `SELECT *` are not allowed for scheduled alerts. Specify the columns you need.
:::

### PromQL mode

Available for **metrics** stream types only. Click the **PromQL** tab to enter a Prometheus query expression. The condition sentence shows operator and value controls for the PromQL result.

#### Rule mode

Turn on the **Rule mode** switch below the PromQL editor to let the expression decide when the alert fires. In rule mode, the alert matches whenever the expression returns **any** series, so you write the threshold into the expression itself instead of setting separate Critical or Warning values.

![PromQL alert with Rule mode turned on, the Alert aggregation choice, and the Preview panel reporting how many series match](images/promql-rule-mode.png)

To create a rule-mode alert:

1. Set the stream type to **metrics** and select the **PromQL** tab.
2. Turn on **Rule mode**.
3. Enter the full matching expression, for example `rate(http_requests_total[5m]) > 4`.
4. Optionally leave the stream name empty. OpenObserve infers it from the metrics streams the expression references.

Turning on rule mode clears and hides the value-threshold controls and the **Having series** count. Each evaluation runs the expression as an instant query at the scheduled time. The **Preview** panel shows how many series currently match, for example "10 returned series match now".

**Alert aggregation** controls how many alerts rule mode produces:

- **Simple alert** tracks one alert for the whole rule. It stays firing while any series is returned and clears when the expression returns no series.
- **Multi alert (per series)** tracks each returned series (each distinct label set) separately, so every series fires and recovers on its own.

When **Hold for** ([the pending period](advanced-alert-configuration.md#pending-period-hold-before-firing), in the **Settings** section) is greater than zero, **Multi alert** is selected and locked, because each series keeps its own pending timer. A series must keep matching for the full period before it fires. If it stops matching, its timer resets and restarts when the series returns. Set **Hold for** to zero to choose between **Simple alert** and **Multi alert** again.

![Rule mode with Hold for set to 10 minutes, so Multi alert is selected and locked](images/promql-rule-mode-hold-for-multi.png)

PromQL can return special values such as `NaN`, `+Inf` and `-Inf`. Rule mode treats any returned series as a match, including these values, and keeps them as-is in notifications and [alert history](alert-history.md).

:::note[Note]
Rule mode works only with **metrics** streams and the **PromQL** tab. It cannot be combined with Critical or Warning value thresholds or with **Compare with Past**.
:::

---

## Operators

The following comparison operators are available for both count and measure mode thresholds:

| Operator | Description |
|----------|-------------|
| `>=` | Greater than or equal to (default) |
| `>` | Greater than |
| `<=` | Less than or equal to |
| `<` | Less than |
| `=` | Equal to |
| `!=` | Not equal to |

---

## Switching between modes

When switching from measure mode back to count mode:

- The column selector and group-by fields are hidden.
- The aggregation configuration is cleared.
- The operator and threshold revert to controlling the event count.

When switching from count mode to measure mode:

- The column selector appears — select the field to aggregate.
- The group-by option becomes available.
- The operator and threshold now apply to the aggregated value.
