## Extended Retention

The Extended Retention feature in the Stream Details panel allows you to retain specific segments of your stream data beyond the configured stream-level or global retention period. 

## When to Use Extended Retention

This feature is helpful when you want to preserve logs, metrics, or traces related to specific incidents or investigations.  
For example, logs from a known incident that occurred last month, you can configure extended retention for those specific time ranges.

## How to Apply Extended Retention

1. Navigate to the **Stream Details** panel.  
2. Select the **Extended Retention** tab.  
3. Use the date selector to specify a time range in UTC. Click **Apply**.  
4. Click **Update Settings** to apply the retention policy.

!!! Note  
    The data within the selected time range will be retained for an additional 3,650 days.

![Streams Extended Retention](../../images/extended-retention.png)

!!! Note
    - **Flexible Range Selection**: You can add multiple time ranges. This enables retaining non-contiguous segments of data, such as a two-day period this week and another from the previous month.  
    - **Retain Within Allowed Window**: You can only apply extended retention to data that currently exists. You cannot select ranges older than the current retention limit because that data has already been deleted and cannot be restored.
