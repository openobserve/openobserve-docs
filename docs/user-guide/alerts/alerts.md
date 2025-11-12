---
description: >-
  Learn how alerting works in OpenObserve. Supports real-time and scheduled
  alerts with thresholds, frequency, silence periods, and aggregation options.
---
## What are alerts?
Alerts automatically monitor your data streams and notify you when conditions are met. When predefined conditions trigger, alerts send notifications to your configured destinations.

---

## Alert types
There are two types of alerts in OpenObserve: Real-time and Scheduled.

- **Real-time alerts**: They monitor data continuously and trigger instantly when conditions are met. Use for critical events requiring instant action. For example, when the error count exceeds 10, alert sends notification to the destination within seconds. 
- **Scheduled alerts**: They run at fixed intervals to evaluate aggregated or historical data. Use for routine monitoring and trend analysis. For example, every hour, the alert evaluates your data and checks if average response time exceeds 500ms. If the condition is met, the alert sends a notification. 

---

## Core components
### Stream
The data source being monitored.

### Period
Time window evaluated per alert run. If period is 30 minutes, the alert evaluates the last 30 minutes of data each run.

### Frequency
How often the alert evaluation runs. Real-time alerts run continuously; scheduled alerts run as per the configured frequency.

### Condition: Quick mode and SQL mode
Conditions determine when the alert fires. 
OpenObserve supports two modes:

??? note "Quick mode (Real-time and scheduled alerts)" 
    Build conditions using the UI. Combine fields, operators, and values with `OR` or `AND` logic. Group conditions for complex nested logic.

    - **Logic**: 
        
        - `OR`: Fire if ANY condition is true
        - `AND`: Fire only if ALL conditions are true
    - **Example**: `error_count > 100` OR `response_time > 500`
    - **Operators**: `>` (greater than), `<` (less than), `==` (equal to)
    - **Groups**: Nest multiple conditions for complex scenarios
    - **Groups example**: `(error_count > 100 AND response_time > 500) OR status == "critical"`: This alert condition fires when BOTH error count AND response time are high, OR when status is critical

??? note "SQL mode (Scheduled alerts only)"
    Write custom SQL queries and VRL logic to define precise trigger conditions. Useful for complex filtering, aggregations, and multi-window comparisons.

    - Requires knowledge of SQL and VRL
    - Enables advanced workflows with multi-window analysis

### Destination
Where alerts are sent. Choose one or combine multiple:

- **Email**: Send to team members or distribution lists. Requires SMTP configuration. 
- **Webhook**: Send to external systems via HTTP. Integrates with Slack, Microsoft Teams, Jira, ServiceNow, and more.
- **Actions**: Execute custom Python scripts. Most flexible; can send to Slack AND log to stream simultaneously. Supports stateful workflows

### Silence Period
The silence period prevents duplicate notifications by temporarily pausing alert triggers after firing.

---

## Multi-window alerts
Compare current data against historical data to detect anomalies and trends.
Raw numbers alone cannot reveal trends. Multi-window alerts provide context by comparing current results with past data to detect anomalies and performance shifts. <br>
For example, 200 errors in 30 minutes is critical if you normally see 50, but normal if you typically see 180-210.

### Workflow:

1. **Set up windows**: Define current window (time period to monitor) and reference windows (historical periods to compare)
2. **Write SQL**: Query data for all windows
3. **Write VRL logic**: Compare results and calculate differences
4. **Set threshold**: Alert triggers if comparison exceeds your condition

### SQL and VRL editor 
After configuring windows, navigate to **Conditions** > **SQL mode** > **View Editor**. Use the **SQL Editor** to query data and **VRL Editor** to process results. Run queries to see output, apply VRL to see combined results, then set your alert condition.

### Use cases
- **Spike detection**: Detect sudden increases in error counts by comparing the current window with a previous time period.
- **Performance degradation**: Identify when average response times are trending upward compared to historical data.
- **Anomalous behavior**: Detect unusual activity patterns in user behavior, traffic, or system performance that deviate from expected norms.

---

## FAQ
**Question**: If I set the frequency to 5 minutes and the current time is 23:03, when will the next runs happen? <br>
**Answer**: OpenObserve aligns the next run to the nearest upcoming time that is divisible by the frequency, starting from the top of the hour in the configured timezone. This ensures that all runs occur at consistent and predictable intervals.<br>
**Example**<br>
If the current time is 23:03, here is when the next run will occur for different frequencies:

- Frequency 4 minutes > 23:04
- Frequency 5 minutes > 23:05
- Frequency 7 minutes > 23:07

Each run continues at fixed intervals from that point onward, such as 23:08, 23:12, and so on for 4-minute frequency.
