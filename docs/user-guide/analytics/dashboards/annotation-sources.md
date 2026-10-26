---
title: Annotation Sources
description: Add query-driven markers to dashboard time-series panels with annotation sources, using a builder or custom SQL to highlight events and bands.
---

Annotation sources draw markers from a query onto your dashboard's time-series panels. Each enabled source runs one query per dashboard load, and every returned row becomes a marker — a vertical line, or a shaded band when the source defines an end-time field. This is separate from [manual annotations](panels/panel-management.md#annotations), which you add directly on a chart.

## Open the Annotations tab

In the dashboard editor, open **Settings** > **Annotations**. The tab lists every source with its colour, panel target, and an enable toggle. Click **Add Source** (or the empty-state button) to create one, then use the row actions to edit or delete it.

![TODO: screenshot of the Annotations tab source list](images/placeholder.png)

## Create a source

Fill in the source form:

- **Name** — a label for the source, shown in the list and on markers' tooltips.
- **Enabled** — turn the source on or off without deleting it.
- **Color** — the marker colour, chosen from a swatch picker.

### Builder or Custom SQL

Choose the query mode with the **Builder / Custom SQL** toggle.

**Builder** asks for a **Stream Type**, a **Stream**, and an optional **Filters** tree. Filters reuse the alerts condition builder: add conditions with **+ Condition**, nest groups with **+ Condition Group**, and combine them with AND/OR. Dashboard variables are offered in the stream and field pickers.

![TODO: screenshot of the annotation source form in Builder mode](images/placeholder.png)

**Custom SQL** replaces the pickers with a query editor. Your query must return a `_timestamp` column; each returned row becomes a marker. Switching from Builder to SQL pre-fills the editor with the generated query.

![TODO: screenshot of the annotation source form in Custom SQL mode](images/placeholder.png)

### Marker display

- **Title** and **Description** — templates rendered per row. Type `{` to get field suggestions (for example `{service} deployed`), and `$variables` to interpolate dashboard variables.
- **End time field** — optional field that turns each marker into a shaded band from its timestamp to this value; leave empty for a single line.
- **Panels** — which panels draw the markers. **Select all** (the default) applies to every current and future time-series panel; uncheck it to pick specific panels. An empty selection blocks Save.

## Run and preview

Click **Run** to execute the source against the dashboard's current time range and variables. The preview shows the rows that become markers and flags problems such as a missing `_timestamp` or an end-time field the query cannot fill. **Save** runs the same check and is blocked on errors; zero rows in range is only a hint, not an error.

![TODO: screenshot of markers drawn on a time-series panel](images/placeholder.png)

## Limits

- A dashboard can define at most 10 annotation sources.
- Markers use the dashboard time range; per-panel time-range overrides are not honoured.
- PromQL horizontal-bar and stacked panels get no markers (the same as manual annotations).
