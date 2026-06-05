---
title: Pivot Table in OpenObserve Dashboards
description: Learn how to enable pivot mode on the dashboard Table chart in OpenObserve to cross-tabulate data, turn breakdown values into column headers, and configure row and column totals.
---
This guide describes how to use **Pivot Table** mode on the **Table** chart in OpenObserve dashboards. Pivot mode cross-tabulates your data by turning the values of a breakdown field into column headers, so you can summarize one metric across two or more dimensions in a single grid.

## Overview
A standard **Table** chart renders one row per group and one column per selected field. Pivot mode reshapes that flat output into a cross-tabulation: row fields define the rows, a breakdown field supplies the column headers, and value fields fill the cells. This makes it easier to compare a metric across categories without reading down a long list of rows.

Pivot mode is useful when you want to see how a value is distributed across the combinations of two or more dimensions, such as request count by status code across services, or error totals by region across days.

Pivot mode is available only on the **Table** chart. It activates when the Table chart has at least one row field, at least one value field, and at least one breakdown field (added with the **+P** button), and it supports up to three breakdown (pivot) fields along with optional row and column totals.

## How to enable pivot mode
Pivot mode activates when the Table chart has at least one row field, at least one value field, and at least one breakdown field (added with the **+P** button).

1. In the **Panel Editor**, set the chart type to **Table**.
2. Add one or more fields to the row area and at least one field to the value area.
3. In the field list, hover over the field you want to pivot on and click the **+P** button (**Add to Pivot Field**) to add it as a breakdown field.

When a breakdown field is present, the panel switches to pivot mode. The distinct values of the breakdown field become column headers, and each value field is summarized within those columns.

> **Note**: The **+P** button appears only when the chart type is **Table**. It is not shown for other chart types.

### Field-area labels in pivot mode
The labels on the field areas change to reflect the active mode:

- In non-pivot mode, the row and value areas are labeled **First Column** and **Other Columns**.
- In pivot mode, the same areas are labeled **Row Fields** and **Value Fields**, and the breakdown area holds the pivoted fields.

When you remove the last breakdown field, the panel reverts to non-pivot mode and the labels return to **First Column** and **Other Columns**.

## Configuration options
When pivot mode is active, a **Pivot Options** group appears in the panel **Config** sidebar with the following toggles. All toggles are off by default.

| Setting | Description | Default |
|---------|-------------|---------|
| **Show Row Totals** | Displays a totals row at the bottom of the pivot table summarizing each column's values. | Off |
| **Show Column Totals** | Displays a totals column on the right side of the pivot table summarizing each row's values. | Off |
| **Sticky Column Totals** | Pins the totals column on the right so it stays visible when scrolling horizontally. Appears only when **Show Row Totals** is on. | Off |
| **Sticky Row Totals** | Pins the totals row at the bottom so it stays visible when scrolling vertically. Appears only when **Show Column Totals** is on. | Off |

The sticky toggles are shown only while their corresponding totals toggle is enabled. Turning a totals toggle off hides its sticky sub-option.

These settings are saved with the panel in the dashboard JSON under the following keys:

- `table_pivot_show_row_totals`
- `table_pivot_show_col_totals`
- `table_pivot_sticky_row_totals`
- `table_pivot_sticky_col_totals`

## Notes and limitations

- Pivot mode is supported only on the **Table** chart.
- A pivot table requires row fields, at least one breakdown field, and at least one value field.
- You can add up to three breakdown (pivot) fields. The **+P** button is disabled once three pivot fields are added.
- **Transpose** and **Dynamic Columns** are disabled while pivot mode is active. They become available again when you remove all breakdown fields.
- The sticky totals toggles appear only when the matching totals toggle is enabled: **Sticky Column Totals** requires **Show Row Totals**, and **Sticky Row Totals** requires **Show Column Totals**.

## Next steps

- [Dashboard Configuration Overview](index.md): Browse all panel and chart configuration options for dashboards.
- [Show Field as JSON](show-field-as-json.md): Render a field's value as structured JSON in Table panels.
- [Trellis Layout](trellis-layout.md): Split a panel into a grid of smaller charts by a breakdown field.
- [Dashboards in OpenObserve](../dashboards-in-openobserve.md): Learn how to create and manage dashboards.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
