---
title: Log Patterns
metaTitle: Log Patterns in OpenObserve
description: "How the Patterns tab groups logs into recurring templates, shows wildcard value distributions, and lets you filter logs by individual values."
---

This guide explains how to use the **Patterns** view on the Logs page to discover recurring log templates, inspect the values behind each wildcard, and filter your logs by a pattern.

:::note[Availability]
Log Patterns is available in Enterprise Edition.
:::

## Overview
Log Patterns automatically analyzes your log data and groups similar messages into a smaller set of recurring templates. The parts of a message that stay the same across many logs form the template text, and the parts that change from log to log are replaced with wildcard tokens such as `<*>`. This lets you understand the shape of high-volume log streams without reading every individual line.

Each extracted pattern represents many underlying log lines that share the same structure. By collapsing thousands of similar messages into a single template, the Patterns tab helps you quickly see what your logs are made of, which patterns occur most often, and where to focus when troubleshooting.

From the Patterns view you can review every template and its frequency, inspect the sample values that appeared in any wildcard position, and pivot straight to the logs view by filtering on a pattern of interest.

## Viewing patterns
The Patterns view lists the templates extracted from the logs that match your current stream and time range.

1. Go to the **Logs** page.
2. Select the desired stream from the left panel.
3. Choose the time range and run your query.
4. Select the **Patterns** view in the toolbar.

Each pattern in the list shows:

- **Count**: How many log lines matched this template, so you can identify the most and least common patterns at a glance.
- **Volume**: How the pattern's log volume changes over the time range.
- **Status**: The severity detected for the pattern, such as **Error**, **Warn**, **Info** or **Debug**.
- **Service**: The service that emits the pattern.
- **Pattern**: The recurring message structure, with stable text shown as plain text and variable parts shown as wildcard tokens such as `<*>`. Typed wildcards may also appear, for example `<:IP>`, `<:NUM>`, or `<:TIMESTAMP>`, indicating the kind of value that was detected in that position. Badges such as **New**, **Spike**, **Drop** and **Rare** flag patterns whose volume changed or that match under 1% of logs.

Use the severity chips above the list to show only patterns of the selected severities.

Click a pattern to open **Pattern Details**, which shows the full **Pattern Template**, its **Statistics** (**Occurrences** and **Percentage**), its **Variables**, and **Example Logs**. Use **Previous** and **Next** to move between patterns.

## Inspecting wildcard values
Every wildcard token in a template is a chip you can inspect to understand which real values appeared in that position.

Hover over a `<*>` wildcard chip to open a popover. The popover header shows the detected value type and the number of unique values. Below it, the popover shows the top 10 sample values that occurred in that wildcard position, most frequent first. Each row displays:

- The **value** that appeared in that position.
- A **count** of how often it occurred.
- A **bar** whose length is proportional to the count, and the value's share as a percentage.

The footer shows the total number of occurrences.

The popover works the same way wherever wildcard chips appear, including the pattern list and the pattern details view. Move your pointer away from the chip and the popover closes.

> **Tip**: Use the distribution to spot rare or unexpected values in an otherwise uniform pattern, such as a single error code mixed in with normal status values.

## Filtering by pattern
You can filter your logs by a pattern without writing a query by hand. In **Pattern Details**, the **Actions** section has three options:

- **Include in query**: Adds a `match_all('...')` filter for each fixed part of the template, joined with `AND`, so the logs view shows only entries that match the pattern.
- **Exclude**: Adds the same filter wrapped in `NOT`, so the logs view hides entries that match the pattern.
- **Create alert**: Starts a new alert from the pattern.

When you choose **Include in query** or **Exclude**, OpenObserve applies the filter and switches from the Patterns view to the Search view, where you can review the matching log lines directly. If a template has no fixed text, OpenObserve shows **This pattern has no distinctive text to filter on.** instead.

## Best practices
- Start with the highest-frequency patterns to understand the bulk of your log volume, then scan low-frequency patterns for anomalies.
- Hover wildcard chips to see which values actually appear in the data before you filter.
- Use **Exclude** to remove noisy, well-understood patterns and narrow the logs view down to the entries you still need to investigate.

## Troubleshooting
### No patterns appear in the Patterns view

**Problem**: The Patterns view is empty after running a query.

**Solution**:

1. Confirm that the selected **stream** has data within the chosen **time range**.
2. Widen the time range so there are enough log lines for patterns to be extracted.
3. Re-run the query and reopen the **Patterns** view.

### A wildcard popover shows no values

**Problem**: Hovering a `<*>` chip opens the popover but no distribution bars are shown.

**Solution**:

1. Verify that the pattern still matches data in the current time range.
2. Re-run the query so sample values are recomputed for the current results.
