---
description: >-
  Use Multi-window Selector in scheduled alerts to compare current vs.
  historical data, detect anomalies, and trigger alerts based on trends over
  time.
---
This page explains the importance of the Multi-window Selector in OpenObserve, how it works, and the key concepts of period, window, and frequency. It also describes how OpenObserve processes scheduled alerts when the Multi-window Selector is applied.

## Why You Need Multi-window Selector
When you want to set up alerts that detect unusual behaviour over time, you need to compare your current data with historical data. This helps you understand whether the current numbers fall within normal patterns or if they signal a potential issue.

Imagine you are running an e-commerce platform where users place orders online. Occasionally, users may face temporary issues during checkout. When this happens, the system allows them to retry the purchase. 

Let’s say there have been **200 checkout retries in the last 30 minutes**. On its own, this number does not tell you if something is wrong.

To make sense of this number, you need to compare it with past data:

- If your system usually sees around **50 retries** in the same time frame, **200 retries** is a clear spike that likely signals a problem.  
- If your normal pattern is around **180 to 210 retries**, then **200 retries** might fall within expected behaviour.

Manual comparison like this is time-consuming and error-prone. 

The **Multi-window Selector** solves this problem by automating the comparison between your current data and historical data.

## What Multi-window Selector Does

The Multi-window Selector allows you to:

- Define the time window you want to monitor, such as the last 30 minutes or last 4 hours.  
- Select one or more past windows to compare against, such as 1 day ago or 4 days ago.  
- Write logic using Vector Remap Language (VRL) that compares the windows and detects meaningful changes. If the result crosses your threshold, OpenObserve sends an alert.

You can apply this feature to logs, metrics, or traces in your system.

## Period, Frequency, and Window

To use the Multi-window Selector effectively, it is important to understand how period, frequency, and windows work together.

**Period** defines the length of each window. It determines the time range of data the alert manager will evaluate during each run.

Example:

If the period is set to 30 minutes, the alert manager evaluates the last 30 minutes of data each time it runs.

**Window** applies the defined period at different points in time.

Example:

- Current window: The last 30 minutes.  
- Past window (1 day ago): The same 30-minute range, but from exactly one day earlier.

**Frequency** controls how often the alert manager runs the evaluation.

Example:

If the frequency is set to every 30 minutes, the alert manager runs every 30 minutes. During each run, it evaluates:

- Current window: The latest 30 minutes before the evaluation time.  
- Past window: The same 30-minute range from 1 day ago.

Consider this scenario:

- **Frequency**: Every 30 minutes  
- **Period**: 30 minutes  
- **Past window**: 1 day ago

If the current time is 10:30 AM, the alert manager runs the evaluation on:

- Current window: 10:00 AM – 10:30 AM  
- Past window (1 day ago): 10:00 AM – 10:30 AM (previous day)

At the next run at 11:00 AM, the alert manager runs the evaluation on:

- Current window: 10:30 AM – 11:00 AM  
- Past window (1 day ago): 10:30 AM – 11:00 AM (previous day)

This setup ensures that you consistently compare the same time ranges across different points in time, helping you detect patterns and changes.

## How OpenObserve Processes Alerts With Multi-window 

When you create a Scheduled Alert in SQL mode and apply the Multi-window Selector, OpenObserve follows a flow during each evaluation:

1. Based on the defined frequency, the alert manager runs your SQL query for all selected windows. This includes the current window and any past windows you have configured.  
2. After the SQL query completes, the alert manager passes the results to your VRL function for processing. Your VRL function processes this data, compares the selected windows, and calculates any differences or changes between them.  
3. The alert manager checks the output from your VRL function against the threshold condition you defined in the alert.  
4. If the condition is met, the alert manager sends an alert notification to your configured alert destination.

**Important**: In addition to sending alerts, OpenObserve also allows you to automate actions based on alert triggers. You can use Actions to perform automated responses when alerts are triggered. [Learn more about Actions in OpenObserve](https://openobserve.ai/docs/user-guide/actions/actions-in-openobserve/).

### Next Step
[Learn how to use the Multi-window Selector in Scheduled Alerts](how-to-access-multi-window-selector-scheduled-alerts.md).

