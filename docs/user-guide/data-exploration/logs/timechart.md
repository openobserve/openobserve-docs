---
title: Timechart View
metaTitle: Timechart View for Logs in OpenObserve
description: Chart the current Logs query over time with the Timechart view in OpenObserve, and enable it on your server with ZO_TIMECHART_ENABLED.
---

The **Timechart** view turns the query on the **Logs** page into a chart, without leaving the page. Use it to see how a search or an aggregation changes over the selected time range, then save the chart to a dashboard.

## Enable the Timechart view
The Timechart view is off by default. To show it, set this environment variable on the OpenObserve server and restart it:

| Variable | Default | Description |
| --- | --- | --- |
| `ZO_TIMECHART_ENABLED` | `false` | Shows the **Timechart** view on the Logs page. |

```bash
ZO_TIMECHART_ENABLED=true
```

The setting applies to every organization on the server. When it is `false`, the **Timechart** button does not appear on the Logs toolbar.

## Use the Timechart view
1. Go to the **Logs** page.
2. Select a stream, a time range, and write your query.
3. Run the query.
4. Select **Timechart** in the view buttons on the left of the toolbar.

The query opens in the panel editor as a chart. Choose one of these chart types: **Area**, **Area Stacked**, **Bar**, **Horizontal Bar**, **Line**, **Scatter**, or **Table**. Select **Add To Dashboard** to save the chart as a panel on a dashboard.

Without SQL mode, the view builds SQL from your search and charts the matching events over time, like the histogram. With SQL mode on, it charts the result of your SQL query, so you can plot your own aggregations. If a VRL function is applied in the Function Editor, the chart opens as a **Table**, because VRL functions work only with table charts.

When you share the page link while on the Timechart view, the link keeps the chart type and settings.

## Requirements and limits
The **Timechart** button is unavailable, or the chart shows an error, when:

- More than one stream is selected and SQL mode is off. Turn on SQL mode or select a single stream.
- The query is empty.
- The editor holds more than one SQL query.
- An aggregated field has no alias. For example, write `count(*) AS total` instead of `count(*)`.
- The current query has not been run yet. Run it first.

## Timechart and Visualize
The Logs toolbar also has a **Visualize** view. **Visualize** opens a field-based query builder where you pick fields and aggregations to build a new chart. **Timechart** charts the query you already wrote.

## Related links
- [Logs](logs.md)
- [Quick Mode and Interesting Fields](quickmode.md)
- [Dashboards](../../analytics/dashboards/dashboards-in-openobserve.md)
