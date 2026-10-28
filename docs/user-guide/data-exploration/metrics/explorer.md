---
title: Metrics Explorer
description: Browse and explore metrics with a visual card grid, build PromQL queries in builder or code mode, and drill into dashboards.
---

# Metrics Explorer

The Metrics Explorer is where you browse and query metrics data. Click **Metrics** in the sidebar to open it at `/metrics`. The mode switch at the top has three modes:

- **Explore**: the browse grid, a visual overview of every metric family in your organization.
- **Visualize**: the PromQL query editor with chart visualization and dashboard controls. The same editor is also available at `/metrics/editor`.
- **Favorites**: the metrics you starred in Explore.

![the Metrics Explorer browse grid showing metric cards with type badges, prefix/suffix/type filter rail, and search](images/metrics-explorer-revamp-1.png)

## Browse grid

The browse grid gives you a fast, visual overview of all metric families. Each card shows the metric name, its type (via a color-coded badge), the current charted value, and a mini sparkline. Use **Grid** or **Rows** to change the layout.

### Metric cards

Cards are fetched lazily as you scroll. A card queries its default aggregation only when it enters the viewport, so opening the grid on a large org never fires hundreds of queries at once.

![a single metric card showing the sparkline chart, metric name, type badge, and footer with function label](images/metrics-explorer-revamp-2.png)

**Card defaults by type:**

| Metric type | Default query | Card chart |
|---|---|---|
| Counter | `sum(rate(metric[window]))` | Line chart |
| Gauge | `avg(metric)` | Line chart |
| Histogram | `sum by (le) (rate(metric_bucket[window]))` | Heatmap |
| Summary | `avg by (quantile) (metric)` | Line chart |
| Info | `count(metric)` | Line chart |

You can override a card's function for individual metrics via the **gear (⚙) icon** on the card, which opens **Configure function**. Pick a variant, such as **Average**, **Rate (sum)** or **Percentiles**, and click **Apply**, or click **Reset to default**. The override is saved per-browser and persists across sessions.

![the gear icon override dialog showing variant options and a preview tile](images/metrics-explorer-revamp-3.png)

**Star a metric** (the ★ on a card) to add it to your favorites. The **Favorites** mode shows only starred metrics, and **Convert to dashboard** adds them all to a dashboard, one panel each.

Click **Drill down** on a card to open the metric's detail view. It shows a larger chart with **Compare to** (1 hour, 1 day or 1 week ago), **Forecast** (**Linear** or **Smoothed trend**) and, for histograms, **Exemplars**. Below the chart are three tabs:

- **Breakdown**: one chart per label. Drill down into a label to see its values, then **Add to filter** or **Exclude** a value.
- **Related**: other metrics that share labels with this one.
- **Used in**: the dashboards, alerts, SLOs and scheduled pipelines that query this metric.

Use **Open in Visualize** to continue in the query editor. In Enterprise Edition, **Logs & traces** opens the logs and traces of the metric's service. **Back to metrics** returns to the grid.

### Filtering

The left rail exposes three filter panels:

- **Prefix** — group by the first segment of the metric name. Useful in orgs that follow naming conventions like `node_cpu_*`, `node_memory_*`, `http_request_*`.
- **Suffix** — group by the last underscore-delimited segment. Surfaces common units (`_bytes`, `_seconds`, `_total`) alongside domain suffixes.
- **Type** — filter by metric type: Counter, Gauge, Histogram, Summary, or Other.

![the filter rail open on prefix grouping, showing prefix groups with counts](images/metrics-explorer-revamp-4.png)

The **Search metrics** box filters cards by name or help text. The **sort** toggle switches between **A–Z** and **Z–A** ordering. **With data** (selected by default) hides cards whose queries returned no samples, keeping the grid clean of registered-but-unused metrics; select **All** to show every metric. A count below the grid shows how many cards are hidden.

Use **Views** to save the current search, filters, sort, layout and time range as a named view, and to reopen, update or delete views. Saved views are shared with everyone in the organization.

### Label filter chips

Click **Filter** to add a label matcher: select a label, an operator (`=` exact value, `!=` any other value, `=~` regex), and a value. Filters are combined with AND. Cards are then narrowed to metrics whose streams carry every selected label, so a `status=~"5.."` filter limits the grid to metrics that actually have a `status` label.

![the label filter chip input with label name and value fields, and chips shown in the toolbar](images/metrics-explorer-revamp-5.png)

## Query editor

The **Visualize** mode (and the panel editor at `/metrics/editor`) is where you build queries, visualize results, and configure dashboard panels. It opens with the same layout as a dashboard panel editor.

![the metrics query editor showing stream selector with type badges, PromQL input, chart, time picker, Apply, and Add to Dashboard](images/metrics-explorer-revamp-6.png)

### Stream selector

The stream dropdown shows metric names with **type badges** — a single letter (`C`, `G`, `H`, `S`, `O`) on a color-coded background:

| Badge | Type | Color |
|---|---|---|
| **C** | Counter | Blue |
| **G** | Gauge | Green |
| **H** | Histogram | Purple |
| **S** | Summary | Orange |
| **O** | Other | Grey |

![the stream selector dropdown showing metric names with colored type badges](images/metrics-explorer-revamp-7.png)

The badge colors match the same palette used in the Metrics Explorer browse grid, so a type looks the same wherever you see it.

### Builder mode

The builder lets you construct PromQL queries step by step without writing raw PromQL. Select **Builder** from the mode toggle.

When you pick a metric, the builder auto-seeds a default query based on its type: `sum(rate(counter[4m]))` for a counter, `avg(gauge)` for a gauge, `histogram_quantile(...)` for a histogram. You can then add or remove operations (rate, sum, avg, topk, etc.) and label filters.

![the PromQL builder showing operation chips (Rate, Sum) and label filter editor](images/metrics-explorer-revamp-8.png)

**Operations** are organized into groups: Rate & range, Aggregation, Math, and more. Each operation is rendered as a draggable chip. Drag to reorder; the query string updates live.

The builder **writes the full PromQL** into the query input, so you can switch to **Code** mode at any time to see or edit the raw query.

### Code mode

Select **Code** to write PromQL directly in the editor. The editor provides syntax highlighting, autocompletion for metric names and label keys, and inline error indicators.

Press **Ctrl+Enter** (or **Cmd+Enter** on macOS) to run the query from the editor without clicking **Apply**. The editor flushes any pending input before running, so the query that executes is always what is on screen.

### Date and time range

The **time picker** at the top of the editor supports relative ranges (Past 15 Minutes, Past 6 Hours, etc.) and absolute custom ranges. For dashboards (where auto-apply is off), the picker's trigger label shows the range that is **actually in force**, not your pending selection — so switching the picker to "Past 6 Hours" without clicking Apply leaves the trigger reading the previous range.

Click **Apply** to run the query against the selected range. The **refresh interval** dropdown schedules automatic re-runs.

### Visualizations

The editor supports the same chart types available for dashboard panels: line, bar, area, scatter, table, heatmap, and more. Switch the chart type from the dropdown above the chart.

![the chart visualization with a line chart showing time series data](images/metrics-explorer-revamp-9.png)

### Add to Dashboard

After you have a query and chart you want to keep, click **Add to Dashboard**. Choose an existing dashboard and tab, or create a new one. The panel is inserted with the current query, chart type, time range, and PromQL builder state preserved.

## Sharing a metrics view

The **Share** button in the editor toolbar copies a URL that encodes your current panel configuration — chart type, query, stream, time range, and refresh interval. Anyone opening the link sees the same chart and data. The share URL carries the full state as a base64 blob in the `metrics_data` query parameter.

The editor also accepts lightweight deep-link parameters (`chart_type`, `query_type`, `stream_name`, `query`) for programmatic linking from alerts, dashboards, and other pages.

## Choosing a stream type auto-selects PromQL

When you create a new panel and set the stream type to **metrics**, the query mode automatically switches to PromQL. This saves you one click on exactly the new panels that need it. A panel that already has a written SQL query is never converted — so opening an existing SQL panel for editing keeps its query type intact, and SQL over metrics remains one click away.

## Next steps

- [Dashboards](../../analytics/dashboards/dashboards-in-openobserve.md): add metrics panels to dashboards
- [Downsampling](downsampling-metrics.md): reduce storage for long-term metrics
- [Prometheus ingestion](../../../ingestion/metrics/prometheus.md): send metrics via remote-write
- [Alerts](../../analytics/alerts/index.md): create alerts on metric thresholds
