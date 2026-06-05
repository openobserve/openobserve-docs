---
title: Log Patterns in OpenObserve
description: Learn how the Patterns tab in OpenObserve automatically groups your logs into recurring templates, inspects wildcard value distributions, and filters logs by individual values.
---
This guide explains how to use the **Patterns** tab on the Logs page to discover recurring log templates, inspect the values behind each wildcard, and filter your logs by a specific value.

!!! info "Availability"
    Log Patterns is available in Enterprise Edition.

## Overview
Log Patterns automatically analyzes your log data and groups similar messages into a smaller set of recurring templates. The parts of a message that stay the same across many logs form the template text, and the parts that change from log to log are replaced with wildcard tokens such as `<*>`. This lets you understand the shape of high-volume log streams without reading every individual line.

Each extracted pattern represents many underlying log lines that share the same structure. By collapsing thousands of similar messages into a single template, the Patterns tab helps you quickly see what your logs are made of, which patterns occur most often, and where to focus when troubleshooting.

From the Patterns tab you can review every template and its frequency, inspect the sample values that appeared in any wildcard position, and pivot straight to the logs view by filtering on a value of interest.

## Viewing patterns
The Patterns tab lists the templates extracted from the logs that match your current stream and time range.

1. Go to the **Logs** page.
2. Select the desired stream from the left panel.
3. Choose the time range and run your query.
4. Open the **Patterns** tab.

Each pattern in the list shows:

- **Template**: The recurring message structure, with stable text shown as plain text and variable parts shown as wildcard tokens such as `<*>`. Typed wildcards may also appear, for example `<:IP>`, `<:NUM>`, or `<:TIMESTAMP>`, indicating the kind of value that was detected in that position.
- **Frequency**: How many log lines matched this template, so you can identify the most and least common patterns at a glance.

To see the full message structure and all wildcard positions for a single pattern, open the pattern's details.

## Inspecting wildcard values
Every wildcard token in a template is a chip you can inspect to understand which real values appeared in that position.

Hover over a `<*>` wildcard chip to open a popover. The popover shows a bar-chart distribution of the sample values that occurred in that wildcard position, ordered so the most frequent values appear first. Each row displays:

- The **value** that appeared in that position.
- A **count** of how often it occurred.
- A **bar** whose length is proportional to the count, making the relative frequency easy to compare across values.

The popover works the same way wherever wildcard chips appear, including the pattern list and the pattern details view. Move your pointer away from the chip and the popover closes.

> **Tip**: Use the distribution to spot rare or unexpected values in an otherwise uniform pattern, such as a single error code mixed in with normal status values.

## Filtering by value
You can filter your logs by any individual value shown in the wildcard popover without writing a query by hand.

In the popover, each value row has two actions:

- **Include**: Adds a `match_all('value')` filter to your search so the logs view shows only entries containing that value.
- **Exclude**: Adds a `NOT match_all('value')` filter so the logs view hides entries containing that value.

When you choose **Include** or **Exclude**, OpenObserve applies the corresponding `match_all` filter and switches from the Patterns tab to the logs view, where you can review the matching log lines directly. This lets you move from a high-level pattern straight to the specific logs behind a single value in one step.

## Best practices
- Start with the highest-frequency patterns to understand the bulk of your log volume, then scan low-frequency patterns for anomalies.
- Hover wildcard chips before filtering, so you choose a value that actually appears in the data rather than guessing.
- Use **Exclude** to remove noisy, well-understood values and narrow the logs view down to the entries you still need to investigate.

## Troubleshooting
### No patterns appear in the Patterns tab

**Problem**: The Patterns tab is empty after running a query.

**Solution**:

1. Confirm that the selected **stream** has data within the chosen **time range**.
2. Widen the time range so there are enough log lines for patterns to be extracted.
3. Re-run the query and reopen the **Patterns** tab.

### A wildcard popover shows no values

**Problem**: Hovering a `<*>` chip opens the popover but no distribution bars are shown.

**Solution**:

1. Verify that the pattern still matches data in the current time range.
2. Re-run the query so sample values are recomputed for the current results.
