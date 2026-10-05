---
title: Analyze Traces in OpenObserve
description: Analyze distributed traces with the critical path overlay, automatic RED insights, span percentiles, the services catalog, saved views, and drill-down analysis.
---

This guide explains the tools OpenObserve gives you to analyze distributed traces: the critical path overlay on the waterfall, automatic RED anomaly insights, span-versus-operation percentiles, request-scoped RED metrics in the services catalog, and the span-to-profile link. It also covers saved views and the per-trace graph.

## Critical path in the waterfall

The **Waterfall** tab shows every span in a trace as a horizontal bar. When a trace fans out across many parallel children, it can be hard to tell which branch actually held up the request. The **Critical path** toggle highlights the spans that form the longest chain of work.

To use it:

1. Open a trace from the **Traces** list.
2. Select the **Waterfall** tab.
3. Turn on the **Critical path** toggle in the top-right corner.

When the toggle is on, each span bar shows the segments that lie on the critical path. Spans that are not on the critical path are dimmed, so the blocking chain stands out. The span you have selected is never dimmed, even when it is off the critical path.

![TODO: screenshot of the Critical path toggle and highlighted path on the Waterfall tab](images/placeholder.png)

The toggle is off by default and remembers your choice across sessions. OpenObserve computes the path with a last-finishing-child algorithm, which means it follows the child that finishes last at each level. For traces with multiple roots, the overlay walks only the primary root.

:::note[Note]
The critical path overlay is hidden while the span details sidebar is open, and traces whose spans are all orphans (no parent links) do not get a critical path.
:::

## Automatic RED insights (Enterprise)

OpenObserve can watch your busiest services for you and raise an alert when their RED metrics — **request rate**, **error ratio**, and **p95 latency** — deviate from normal. This is the automatic RED insights feature, available in enterprise builds only.

### Enable RED insights

1. Go to **Management** > **Organization Parameters**.
2. Under the **Traces** heading, turn on **Enable automatic RED insights for traces**.

![TODO: screenshot of the Traces section in Organization Settings with the RED insights toggle](images/placeholder.png)

When enabled, a background reconciler:

- Selects the top 20 services with at least 10,000 requests in the previous 24 hours.
- Creates anomaly detectors for rate, error ratio, and p95 latency for each selected service.
- Stores the detectors in a dedicated **RED insights** alert folder, tagged `auto:red-insights`.
- Runs every 6 hours, creating at most 15 detectors per cycle, with hysteresis to avoid churn.

Turning the setting off deletes the detectors at the next cycle. Only the leader node in the claiming region runs the reconciler.

:::note[Note]
The **RED insights** alert folder is visible to administrators only until you share it. Rate and p95 detectors need roughly 8 hours of 5-minute buckets before they finish training; error-ratio detectors on services that almost never error may remain untrained and show nothing.
:::

### Read the insights in the services catalog

Recent RED anomalies surface as an **Insights** strip at the top of the **Services Catalog**. Each entry shows the service, the signal (request rate, error ratio, or p95 latency), when it fired, and how far above the threshold the score was.

![TODO: screenshot of the Insights strip and RED columns in the services catalog](images/placeholder.png)

Each entry includes two links:

- **Traces** — opens the Traces page filtered to the service and the anomaly's time window.
- **Charts** — opens the detector's **Charts** tab so you can inspect the anomaly in context.

## Span versus operation percentiles

When you select a span, the span details sidebar shows how that span's duration compares to the other spans of the same operation. A band tag appears next to the duration, such as `p90–p99 of GET /checkout`.

The tooltip on the tag shows the full distribution — p50, p75, p90, and p99 — along with the sample count. The tag's colour reflects where the span falls:

- **Grey** (default) for spans below the p90 band.
- **Warning** for spans in the p90–p99 band.
- **Error** for spans above the p99 value.

![TODO: screenshot of the span details sidebar with the percentile band tag](images/placeholder.png)

The band is hidden until OpenObserve has at least 20 samples for the operation. The percentile query is cached per stream, service, operation, and time window, so spans in the same operation share a single lookup.

## Request-scoped RED metrics in the services catalog

The **Services Catalog** summarizes RED metrics per service. The **Requests**, **Errors**, **Error Rate**, and latency columns now count only the spans that represent a request entering the service: **server** and **consumer** spans, plus root spans of any kind. This keeps each service's numbers aligned with its actual request volume.

Services with no request spans in the selected window still appear, with **—** shown for **Status**, **Error Rate**, and latency. Latency tooltips are labelled in microseconds (µs), and the p99 warning threshold is 1 second.

The columns shown above are computed this way, so the same view that lists your services also tells you which ones are slow or failing.

## Link a span to its profile

When a span has profile samples carrying its `trace_id` and `span_id`, the span details sidebar shows a **View profile** button. Selecting it opens the Profiles page seeded to that span, with its stream, time range, service, profile type, filters, and view filled in from the route, and loads directly into the span's flame graph.

![TODO: screenshot of the View profile button in the span details sidebar](images/placeholder.png)

## Saved views on the traces page

Save a traces search so you can return to the same stream, query, time range, mode, sort, and columns in one click. The saved-views dropdown is available in both **Spans** and **Traces** modes.

To manage saved views, open the saved-views dropdown in the traces search bar:

![TODO: screenshot of the saved views dropdown in the traces search bar](images/placeholder.png)

- **Apply** a view to restore its stream, query, time range, mode, sort, and columns, then run a single search.
- **Save as new** captures the current search as a new view.
- **Update** overwrites an existing view with the current search.
- **Delete** removes a view.

Traces saved views are stored with a `traces` view type, so they stay separate from logs saved views, and each type has its own name uniqueness.

## Per-trace graph: tree view, graph view, and service search

The **Trace Graph** tab inside a trace shows the services involved in that trace and the hops between them. It includes the same controls as the Service Graph page:

- A **Tree View | Graph View** toggle (remembered across sessions). Graph view renders the trace's services with the Service Graph network converter, including health-coloured borders, type icons, and arrows for edges.
- A **Search Services** box to focus the graph.

![TODO: screenshot of the Trace Graph tab with the Tree View and Graph View toggle and Search Services box](images/placeholder.png)

Searching keeps the relevant part of the graph in view: in **Graph View**, the matching services plus the services directly connected to them; in **Tree View**, the match, its ancestors, and its direct children. A search with no match shows an empty chart.

## Drill down and RED Metrics

Two toolbar changes make the traces results easier to navigate:

- **Drill down** replaces the old **Insights** button. It appears next to the **Spans | Traces | Service Graph | Service Catalog** tabs, only on the **Spans** and **Traces** tabs and only after a search has run.
- **RED Metrics** moved from the toolbar into the **More** menu.

Selecting **Drill down** opens the analysis as a full page over the results, with a **Back to results** button. The results stay mounted underneath while the analysis is open, so going back returns you to your results without re-running the query — your scroll position and any brush selection are kept. Pressing **Escape** also closes the analysis, and starting a new search closes it automatically.

![TODO: screenshot of the full-page Drill down analysis with the Back to results button](images/placeholder.png)

The **RED Metrics** switch in the **More** menu toggles the RED metrics charts on and off.
