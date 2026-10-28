---
title: Exemplars
metaTitle: Exemplars on PromQL Dashboard Panels | OpenObserve
description: Show OTLP exemplars on PromQL time-series panels and open the trace behind a metric spike with one click.
---

# Exemplars

Exemplars mark individual requests on a PromQL chart, so you can go from a spike straight to the trace that caused it. OpenObserve stores the exemplars that arrive with OTLP metrics and draws them on line, area, bar, scatter and heatmap panels that run a PromQL range query.

## Turn exemplars on

Exemplars are off by default. A panel with exemplars off does not request them.

- **For everyone:** in the panel editor, open the **Config** tab and turn on **Show exemplars**. The setting is saved with the panel, so everyone who opens the dashboard sees the markers.
- **For yourself:** select the exemplars icon in the panel header or in full-screen view. Its tooltip reads **Show exemplars (trace samples)**. This turns exemplars on or off for you only, for the current browser session, and overrides the saved setting.

![the exemplars icon in a dashboard panel header](images/show-exemplars-on-promql-charts-1.png)

![the Show exemplars switch in the panel editor Config tab](images/show-exemplars-on-promql-charts-2.png)

## Read the markers

On a `histogram_quantile` panel, a marker sits at the exemplar's value. On other charts, such as rates and counters, it sits on its query's line at the exemplar's time. Values beyond the axis are drawn at its edge.

![a PromQL chart with exemplar markers drawn on the line](images/show-exemplars-on-promql-charts-3.png)

Hover a marker to see the value in the metric's own unit, the time, the query, the `trace_id`, and the exemplar's labels.

![the exemplar card shown when hovering a marker](images/show-exemplars-on-promql-charts-4.png)

## Open the trace

Select **Open trace** in the card, or click the marker, to open the trace with the exemplar's span selected. Browser **Back** returns to the panel. If the trace was not found in any stream, the card shows **Trace not available — sampled out or past retention**. If the lookup could not finish, for example because it timed out, the button reads **Open trace (unverified)**.

![the trace opened from an exemplar with the exemplar's span selected](images/show-exemplars-on-promql-charts-5.png)

## Metrics explorer

Metrics explorer cards have the same icon. A histogram card, which shows a heatmap by default, switches to its percentiles view while exemplars are on.

![a metrics explorer card with exemplars enabled showing the percentiles view](images/show-exemplars-on-promql-charts-6.png)
