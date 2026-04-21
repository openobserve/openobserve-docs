---
description: >-
  Step-by-step guide to creating scheduled and SQL alerts in OpenObserve. Covers
  the condition builder, SQL mode, Compare with Past, deduplication, and
  advanced configuration.
---

## Create a scheduled alert

Scheduled alerts evaluate your data at regular intervals and trigger when conditions are met. This is the most common alert type.

### Prerequisites

- At least one data stream (logs, metrics, or traces) with ingested data
- At least one notification [destination](../../account-administration/management/alert-destinations/) configured
- Appropriate permissions to create alerts

---

### Step 1: Open the alert form

1. Go to **Alerts** in the left sidebar.
2. Click **New alert** in the top-right corner.

![Empty alert creation form with top bar fields and two-tab layout](../../../images/add-alert-empty-state.png)

### Step 2: Configure the top bar

Fill in the required fields across the top bar:

- **Alert name**: Enter a descriptive name (e.g., "High Error Rate - Production")
- **Folder**: Select a folder to organize the alert, or click **+** to create a new one
- **Stream Type**: Select **logs**, **metrics**, or **traces**
- **Stream Name**: Select the data stream to monitor
- **Alert Type**: Leave as **Scheduled** (default)

### Step 3: Define the condition

The **Conditions** section on the **Alert Rules** tab shows the condition sentence. By default, it uses count mode:

**"Alert if total events >= 3 matching logs found"**

Configure the condition:

- **Function**: Select from the dropdown — **total events** for count mode, or an aggregation (avg, min, max, sum, median, p50–p99) for measure mode
- **Operator**: Choose the comparison operator (>=, >, <=, <, =, !=)
- **Threshold**: Set the value that triggers the alert

![Alert form in count mode showing "Alert if total events >= 3 matching logs found" with preview and summary](../../../images/add-alert-count-mode.png)

> **Tip**: See [Alert Conditions and Filters](alert-conditions.md) for a detailed explanation of count mode vs. measure mode and all available functions.

### Step 4: Set the evaluation schedule

- **Check every**: Enter the frequency in minutes (default: 10). You can switch to a cron expression for precise scheduling using the dropdown next to the minutes input.

### Step 5: Add filters (optional)

Click the **filters** dropdown next to "on these" to expand the filter section. Use filters to narrow which data the alert evaluates.

1. Click **+ Condition** to add a filter row.
2. Select a field, operator, and value (e.g., `level = error`).
3. Additional conditions are joined with AND logic.

![Alert form with a filter condition row added](../../../images/add-alert-with-filter.png)

### Step 6: Configure settings

Scroll down to the **Settings** section on the same **Alert Rules** tab:

- **Look back window**: Time range of data to evaluate each run (default: 10 minutes)
- **Cooldown period**: Minimum time between repeated notifications (default: 10 minutes)
- **Destination**: Select one or more notification destinations. Click the refresh icon to reload, or **Add Destination** to create a new one.
- **Creates Incident**: Toggle on to automatically create an incident when the alert triggers

![Settings section with look back window, cooldown period, destination selector, and creates incident toggle](../../../images/add-alert-settings-section.png)

### Step 7: Save

Click **Save** at the bottom. OpenObserve validates all fields before saving. If validation fails, a red error indicator appears on the tab that contains the issue.

> **Tip**: Check the **Preview** panel on the right before saving. It shows whether your current conditions would trigger based on recent data.

---

## Create a SQL alert

For complex queries that go beyond the visual builder, use SQL mode.

### Step 1: Switch to SQL mode

After configuring the top bar (steps 1–2 above), click the **SQL** tab in the **Conditions** section.

![SQL mode with inline editor, Open Full Editor button, and threshold controls](../../../images/add-alert-sql-mode.png)

### Step 2: Write the query

Enter a SQL query in the inline editor, or click **Open Full Editor** for a full-screen editing experience with:

- A field browser on the left for reference
- AI assistance for query suggestions
- Query results preview on the right

!!! warning
    Queries using `SELECT *` are not allowed for scheduled alerts. Specify the columns you need.

### Step 3: Set the threshold

Below the SQL editor, configure:

- **Check every**: Evaluation interval in minutes
- **Alert if No. of events**: Set the operator and threshold for the number of rows the query returns

### Step 4: Complete settings and save

Scroll down to configure **Settings** (look back window, cooldown period, destinations) and click **Save**.

---

## Configure advanced settings

The **Advanced** tab provides additional options for scheduled alerts. Click **Advanced** next to the **Alert Rules** tab.

![Advanced tab with Compare with Past, Deduplication, and Additional Settings sections](../../../images/add-alert-advanced-tab.png)

### Compare with past

Compare current evaluations against historical data to detect relative changes rather than absolute thresholds.

The Multi-window Selector lets you compare current data with historical data in scheduled alerts. Instead of alerting on absolute thresholds, you can detect relative changes — like a 5% increase in errors compared to the same time yesterday.

#### Why use multi-window comparison

A single data point rarely tells you if something is wrong. If your system sees 200 checkout retries in the last 30 minutes, that could be normal or a serious spike — it depends on what the same period usually looks like.

The Multi-window Selector automates this comparison by:

- Defining the time window to monitor (e.g., last 30 minutes)
- Selecting one or more past windows to compare against (e.g., 1 day ago)
- Writing VRL logic that compares windows and detects meaningful changes

You can apply this to logs, metrics, or traces.

#### Key concepts

**Period**: The length of each window. If the period is 30 minutes, the alert evaluates 30 minutes of data each run.

**Window**: Applies the period at different points in time:

- **Current window**: The last 30 minutes
- **Past window (1 day ago)**: The same 30-minute range from yesterday

**Frequency**: How often the alert runs. If frequency is 30 minutes with a 30-minute period and a 1-day-ago past window:

| Run time | Current window | Past window |
|----------|---------------|-------------|
| 10:30 AM | 10:00–10:30 AM today | 10:00–10:30 AM yesterday |
| 11:00 AM | 10:30–11:00 AM today | 10:30–11:00 AM yesterday |

#### How it works

When a scheduled alert with Multi-window Selector runs:

1. The alert manager executes your SQL query for each window (current + past windows)
2. Results are passed to your VRL function for comparison
3. The VRL output is checked against your threshold condition
4. If the condition is met, a notification is sent

#### Step-by-step setup

##### Access the Multi-window Selector

For new alerts:

1. Go to **Alerts** and click **New alert**
2. Configure the top bar (stream type, stream name, alert type = Scheduled)
3. Switch to **SQL** mode in the Conditions section
4. Click the **Advanced** tab to find the **Compare with Past** section

![Access multi-window selector](../../../images/multi-window-period.png)

For existing alerts, click the alert name in the alerts list, then navigate to the **Advanced** tab.

![Access multi-window in existing alerts](../../../images/multi-window-in-existing-alerts.png)

##### Step 1: Write the SQL query

Write a SQL query that returns the data you want to compare. Use the Logs page to test your query first.

```sql
SELECT 
  histogram(_timestamp, '15 minutes') AS time_s,
  COUNT(_timestamp) AS cnt
FROM 
  "openobserve_app_analytics_log_stream"
WHERE 
  pdata_dr_level1_level2_level3_level4_level5_level6_level7_retry > 0
  AND eventtype = 'purchase'
GROUP BY 
  time_s
```

![SQL editor](../../../images/multi-window-sql-editor.png)

##### Step 2: Define the period

Set the time range to evaluate per run (e.g., last 30 minutes) in the **Compare with Past** section on the Advanced tab.

![Period configuration](../../../images/multi-window-period.png)

##### Step 3: Add a comparison window

Click **Add Comparison Window** and select the historical window to compare against (e.g., 1 day ago).

The alert manager will run two queries at runtime:

1. Current window (e.g., 9:30–10:00 AM today)
2. Past window (e.g., 9:30–10:00 AM yesterday)

##### Step 4: Write the VRL function

Click the function toggle in the SQL editor to write VRL logic that compares the windows.

!!! warning
    Always start your VRL function with `#ResultArray#` when using Multi-window Selector. This ensures your function receives a multi-dimensional array where `result[0]` = current window and `result[1]` = past window.

**VRL function example** — alert if purchase retries increased by more than 5%:

```
#ResultArray#

prev_data = []
curr_data = []
res = []
result = array!(.)

if length(result) >= 2 {
    today_data = result[0]
    yesterday_data = result[1]

    cnt_yesterday = 0.0
    cnt_today = 0.0

    for_each(array!(yesterday_data)) -> |index, p_value| {
        cnt_yesterday, err = cnt_yesterday + p_value.cnt
    }

    for_each(array!(today_data)) -> |index, p_value| {
        cnt_today, err = cnt_today + p_value.cnt
    }

    if cnt_yesterday > 0.0 {
        diff = cnt_today - cnt_yesterday
        diff_percentage, err = (diff) * 100.0 / cnt_yesterday

        if diff_percentage > 5.0 {
            diff_data = { 
                "diff": diff,
                "diff_percentage": diff_percentage
            }
            temp = []
            temp = push(temp, diff_data)
            res = push(res, temp)
        }
    }
}

. = res
.
```

![VRL editor](../../../images/multi-window-vrl-editor.png)

The VRL function outputs an empty array if the increase is 5% or less, or a non-empty array with the diff data if it exceeds 5%.

##### Step 5: Set the threshold

Set **Alert if No. of events >= 1**. This triggers when the VRL output is non-empty (meaning the condition was met).

##### Step 6: Set the frequency

Define how often the alert runs (e.g., every 30 minutes).

![Frequency configuration](../../../images/multi-window-frequency.png)

##### Step 7: Configure destination and save

Select a destination, optionally add a row template with fields from your VRL output (e.g., `{{ diff_percentage }}`), and click **Save**.

![Add destination](../../../images/multi-window-add-destination.png)

#### FAQ

**Does the period control the window length?**

Yes. Every window — current and past — uses the same duration defined by the period.

**Does the alert manager run multiple queries within one window?**

No. It runs one query per window. Frequency controls *when* the queries run; period controls *what time range* each query covers.

**What happens without `#ResultArray#` in the VRL function?**

The VRL function receives a flat array with all results mixed together. You cannot distinguish current from past window data.

### Deduplication

Group similar alerts to reduce notification noise.

- **Group similar alerts by**: Select fields that identify similar alerts (e.g., `hostname`, `service`). Leave empty for auto-detection based on the query
- **Consider alerts identical within**: Time window for grouping similar alerts (default: matches the check interval)

### Additional settings

- **Template Override**: Select a custom notification template to override the default
- **Additional Variables**: Add key-value pairs available in notification templates via the **Add Variable** button
- **Description**: Free-text description for the alert
- **Row Template**: Customize the format of individual data rows in notifications. Toggle between **String** and **JSON** template types

---

## Edit an existing alert

1. Go to **Alerts** in the left sidebar.
2. Click the alert name in the table to open it.
3. Modify any fields. Note that **Stream Type**, **Stream Name**, and **Alert Type** are read-only for existing alerts.
4. Click **Save** to apply changes.

---

## Best practices

- Start with a generous threshold and tune it down once you understand your data patterns. This prevents alert fatigue from overly sensitive conditions.
- Use **Group by** fields in measure mode to create per-dimension alerts (e.g., per host) instead of creating separate alerts for each dimension.
- Set a **Cooldown period** of at least 10 minutes to avoid notification storms during sustained incidents.
- Use **Deduplication** in the Advanced tab to group related alerts and reduce noise.
- Add a meaningful **Description** so on-call engineers understand the alert's purpose without investigating the configuration.
- Use **Compare with Past** for alerts where relative change matters more than absolute values.

---

## Troubleshooting

### Alert not triggering

**Problem**: The alert does not fire when expected.

**Solution**:

1. Check the **Preview** panel — it shows whether current data meets the condition.
2. Verify the **Stream Name** has recent data within the look back window.
3. Confirm the **Look back window** covers enough data.
4. Check that the **Threshold** value is appropriate for your data volume.
5. Ensure the alert is enabled in the alerts list (toggle in the **Status** column).

### Too many notifications

**Problem**: The alert fires too frequently, causing notification fatigue.

**Solution**:

1. Increase the **Cooldown period** to reduce notification frequency.
2. Raise the **Threshold** value to only alert on more significant conditions.
3. Enable **Deduplication** in the Advanced tab.
4. Add more specific **Filters** to narrow the data the alert evaluates.

### Validation errors when saving

**Problem**: Clicking **Save** shows errors or red indicators on tabs.

**Solution**:

1. Check the tab with the red error indicator.
2. Ensure all required fields are filled: alert name, stream type, stream name, and at least one destination.
3. For SQL mode, verify the query does not use `SELECT *`.
4. Ensure the threshold value is greater than 0.

### Destination not appearing

**Problem**: A configured destination does not show in the dropdown.

**Solution**:

1. Click the **refresh** icon next to the destination dropdown.
2. Verify the destination exists in **Alerts > Destinations**.
3. Click **Add Destination** to create one directly from the alert form.