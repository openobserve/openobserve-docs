---
title: Exemplars
description: Show OTLP exemplars on PromQL time-series panels and open the trace behind a metric spike with one click.
---

Exemplars mark individual requests on a PromQL chart, so you can go from a spike straight to the trace that caused it.

## Turn exemplars on

Exemplars are off by default and are set per panel. Turn on **Show exemplars** in the panel header, in full-screen view, or in the panel editor **Config** tab. A panel with exemplars off does not request them.

![the Show exemplars toggle in a dashboard panel header](images/show-exemplars-on-promql-charts-1.png)

![the Show exemplars switch in the panel editor Config panel](images/show-exemplars-on-promql-charts-2.png)

## Read the markers

On a `histogram_quantile` panel, a marker sits at the exemplar's value. On other charts, such as rates and counters, it sits on its query's line at the exemplar's time. Values beyond the axis are drawn at its edge.

![a PromQL chart with exemplar markers drawn on the line](images/show-exemplars-on-promql-charts-3.png)

Hover a marker to see the value in the metric's own unit, the time, the query, the `trace_id`, and the exemplar's labels.

![the exemplar card shown when hovering a marker](images/show-exemplars-on-promql-charts-4.png)

## Open the trace

Click the trace action in the card to open the trace with the exemplar's span selected. Browser **Back** returns to the panel. If the trace was not found in any stream, the card shows **Trace not available — sampled out or past retention**. If the lookup was incomplete, the link is marked unverified.

![the trace opened from an exemplar with the exemplar's span selected](images/show-exemplars-on-promql-charts-5.png)

## Metrics explorer

Metrics explorer cards have the same toggle. A histogram card, which shows a heatmap by default, switches to its percentiles view while exemplars are on.

![a metrics explorer card with exemplars enabled showing the percentiles view](images/show-exemplars-on-promql-charts-6.png)
