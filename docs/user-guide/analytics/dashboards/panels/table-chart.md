---
title: Table Chart
description: Configure dashboard table chart panels with per-column formatting, conditional styling, Excel-style column filters, and pagination.
---

# Table Chart

Table chart panels display query results as a tabular view, with support for per-column formatting, Excel-style column filtering, and pagination.

## Configure column formatting

Column formatting lets you override the appearance of individual columns in a table panel — change value units, set text and background colors, control alignment, and define conditional styling rules.

To open the Column Formatting dialog:

1. Open a dashboard panel with type **Table**.
2. In the panel **Config** sidebar, locate the **Column Formatting** section.
3. Click the **Configure column formatting** button.

![Config panel showing the Configure column formatting button in the Column Formatting section](images/dashboard-table-column-formatting-1-v2.png)

### Add a field

On first open, the dialog shows an empty state with an **Add field** button. Click it to see a dropdown of the panel's columns, each marked with a **Num** or **Text** badge to indicate its detected data type.

![Column Formatting dialog empty state with the Add field dropdown listing Namespace and Pod (Text) and Count (Num)](images/dashboard-table-column-formatting-2-v2.png)

Select a column to add it to the formatting list. The dialog switches to a three-pane layout:

- **Left pane** — list of all fields you have added, with type badges and a hover-to-remove **X** button. Click a field to select it.
- **Middle pane** — formatting controls for the selected field.
- **Right pane** — a live preview of the column rendered with your current settings.

![Column Formatting dialog with the Count field selected, showing the field list, formatting controls and live preview](images/dashboard-table-column-formatting-3-v2.png)

### Formatting controls

The controls available for each field depend on its field type.

#### Field Type

Choose how the column's data type is interpreted:

- **Auto** — detect from the data (columns from Y-axis fields are numeric; X-axis and breakdown fields are text).
- **Num** — force numeric interpretation, enabling value formatting and conditional styling.
- **Text** — force text interpretation; value formatting and conditional styling are hidden.

#### Value Formatting

Available when the field type is numeric. Select a unit from the dropdown. Units are grouped:

- **Number**: **Default** (inherit the panel-level unit), **Numbers** (raw numbers), **Locale Format (Auto)** (locale-aware formatting that follows the viewer's UI language), and **Other Locale** (pin the format to a fixed locale, see [Choose a locale](#choose-a-locale)).
- **Data**: **Bytes (1024)**, **Kilobytes (KB, 1024)**, **Megabytes (MB, 1024)**, **Bytes (SI, 1000)**, **Kilobytes (SI, 1000)**, **Megabytes (SI, 1000)**, **Bits (SI)**.
- **Data rate**: **Bytes/Second (1024)**, **Bytes/sec (SI, 1000)**, **Bits/sec (SI)**.
- **Throughput**: requests, operations, or events per second or per minute, plus **Per second (/s)** and **Per minute (/min)**.
- **Time**: **Seconds (s)**, **Milliseconds (ms)**, **Microseconds (μs)**, **Nanoseconds (ns)**, **Minutes**, **Hours**, **Days**.
- **Percent**: **Percent (0.0-1.0)**, **Percent (0-100)**.
- **Currency**: Dollar ($), Euro (€), Pound (£), Yen (¥), Indian Rupees (₹).
- **Custom**: enter a custom unit suffix.

When **Custom** is selected, a text input appears for the custom unit label.

### Choose a locale

By default, **Locale Format (Auto)** formats numbers according to each viewer's UI language. To pin a fixed locale — so every viewer sees the same format, for example Czech `1 234 567,89` — expand the **Other Locale** row directly below it.

The locale choice is available in two places, and works the same in both:

- The **Unit** dropdown in the panel **Config** sidebar (applies to the whole panel).
- The **Value Formatting** unit dropdown in the Column Formatting dialog (applies to a single column).

![Unit dropdown with the Other Locale row expanded to show the list of locales](images/dashboard-table-unit-other-locale.png)

To pin a locale:

1. Select **Locale Format (Auto)** in the unit dropdown.
2. Click the **Other Locale** row to expand the list of available locales.
3. Pick a locale, labelled like **English - US (en_US)**.

![Value Formatting set to Czech - CZ (cs_CZ), with the preview showing 18 743,00](images/dashboard-table-unit-locale-selected.png)

The list offers 46 locales — the 16 UI languages plus 30 additional regions such as `en-GB`, `en-IN`, `de-AT`, `de-CH`, `fr-CA`, `fr-CH`, `es-MX`, `pt-BR`, and `cs-CZ`. Search matches both the locale name and its code.

The **Other Locale** row is a toggle, not a selectable value — clicking it expands or collapses the list without changing your selection. It opens already expanded when a nested locale is currently selected, and the locale names are shown in the viewer's UI language, sorted alphabetically.

A pinned locale is stored in the existing `unit` value as `locale:<tag>` (for example `locale:cs-CZ`), so no schema change or migration is required. The locale applies everywhere the panel renders a number — charts, tables, gauges, tooltips, and PromQL panels. If a pinned locale becomes unusable (for example, after downgrading), the panel falls back to **Locale Format (Auto)** rather than showing an error.

#### Alignment

Set the column's text alignment:

- **Auto** — default alignment based on type (right for numeric, left for text).
- **Left**, **Center**, **Right** — explicit alignment.

#### Styling

- **Text** — the text color. Pick a color from the preset swatches, or use the rainbow picker for a custom color. The **X** button resets to no override.
- **Background** — same swatch-based picker for the cell background.
- **Unique value color** — when enabled, each distinct value in the column gets a unique color from the chart palette, applied as the cell background.

#### Conditional Styling

Available when the field type is numeric. Define threshold rules that change cell colors based on the value.

Each rule reads as a sentence:

**If value is** `[operator]` `[value]` **then text color** … **and background** ….

Supported operators: **less than**, **greater than**, **less than or equal to**, **greater than or equal to**, **equal to**, and **not equal to**.

Rules are evaluated in order; when multiple rules match a value, the **last matching rule** wins. This lets you layer conditions — for example, a rule for values `> 400` (amber) followed by one for `> 1000` (red) means values above 1000 will show red, not amber.

![Conditional Styling with two rules, greater than 5000 in amber and greater than 15000 in red](images/dashboard-table-column-formatting-4-v2.png)

Click **+ Add rule** to create a new condition, or the **X** button on a rule to remove it.

### Save or cancel

The dialog footer shows a count of formatted fields (for example, **2 fields formatted**). Click **Save** to apply the formatting or **Cancel** to discard changes.

Formatting settings are persisted with the dashboard and survive page reloads.

## Column filtering

Column filtering provides Excel-style dropdowns in table column headers, letting you filter the visible rows by one or more distinct column values.

![Table panel with the Namespace column filter open and default and shop selected](images/dashboard-table-column-formatting-5-v2.png)

### Enable column filtering

1. Open a dashboard panel with type **Table**.
2. In the panel **Config** sidebar, under the **Table** section, toggle **Column Filtering**.

Once enabled, a filter icon appears in each column header. Click it to open the filter panel for that column.

### Use column filtering

The filter panel contains:

- **Search** — filter the list of unique values shown in the panel.
- **Checkbox list** — each distinct value in the column is listed as a checkbox. Check values to include in the table; only rows matching at least one checked value are shown.
- **Clear filter** — resets the selection and shows all rows.

When a column has an active filter, its filter icon turns blue to indicate the column is filtered. Filters are applied client-side and do not trigger a new query.

## Hyperlink cells

When a cell in a table chart contains an absolute HTTP or HTTPS URL, the value is automatically rendered as a clickable link. This is useful for surfacing external references — such as advisory links, documentation pages, or external dashboards — directly within your table results.

![table chart with URL cells rendered as clickable links](images/hyperlink-support-dashboard-table-cells-1.png)

### Interaction

Clicking a link cell opens the URL in a new tab. A click on a link cell does **not** propagate to the table row, so it does not interfere with row-level actions or selection.

## Configuration reference

The following panel config fields control table chart behavior:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `table_filtering` | boolean | `false` | Enables per-column filter dropdowns. |
| `table_pagination` | boolean | `false` | Enables paginated mode (turns off virtual scroll). |
| `table_pagination_rows_per_page` | number | — | Rows per page when pagination is enabled. |
| `wrap_table_cells` | boolean | `false` | Wraps long text in cells instead of truncating (**Wrap table cells**). |
| `table_expandable_rows` | boolean | `false` | Adds an expand button to each row that shows all of its fields (**Expandable rows**). |
| `table_transpose` | boolean | `false` | Transposes the table (swap rows and columns). |
| `table_dynamic_columns` | boolean | `false` | Shows only columns present in the data. |
| `override_config` | array | `[]` | Per-column formatting rules (set via the Column Formatting dialog). |
