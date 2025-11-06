This document describes the legend and gridline configuration options available in OpenObserve dashboard panels.

## Overview
Dashboard panels include configuration options for controlling legend display and gridline visibility. These options help optimize chart readability and space usage.

## Legend configuration options
The following options are available in the panel configuration sidebar under the legend section.

### Legends positions

Controls the placement of the legend relative to the chart.

| Option | Description |
|--------|-------------|
| Auto | Places the legend at the bottom of the chart (default) |
| Right | Places the legend on the right side of the chart |
| Bottom | Places the legend below the chart |

**Example: Legend positioned on the right**

![Legend positioned on right side of chart](../../images/legend-position-right.png)

When set to **Right**, the legend appears vertically alongside the chart. This configuration is useful for charts with many data series.

**Example: Legend positioned at the bottom**

![Legend positioned at bottom of chart](../../images/legend-position-bottom.png)

When set to **Bottom**, the legend appears horizontally below the chart. This is the default position and works well for most chart types.

### Legends type

Controls the legend display behavior.

| Option | Description |
|--------|-------------|
| Auto | Automatically selects scroll behavior (default) |
| Plain | Displays all legend items in a static, non-scrollable layout |
| Scroll | Enables scrolling through legend items when space is limited |

**Plain behavior:**

- All legend items are visible simultaneously
- Legend height adjusts to fit all items
- No pagination controls

**Example: Plain legend type**

![Plain legend showing all items](./images/legend-type-plain.png)

The plain type displays all legend items in a fixed layout. All series are visible at once without scrolling.

**Scroll behavior:**

- Legend items can be scrolled
- Pagination indicator shows current page
- Navigation arrows allow moving between pages
- Conserves vertical space

**Example: Scroll legend type**

![Scroll legend with pagination](./images/legend-type-scroll.png)

The scroll type includes navigation arrows and a page indicator (shown as "1/2" in the bottom right). Users can navigate between pages of legend items.

### Legend height

- **Input:** Enter numeric input.
- **Units:** Choose between px (pixels) or % (percentage). 
- **Availability:** Enabled only when Legends Position is set to Auto or Bottom and Legend Type is set to Plain.
- **Purpose:** Overrides the default height of the legend area. 

**Example: Legend height configuration**

![Legend height setting in UI](../../images/legend-height-config.png)


### Legend width

- **Input:** Enter numeric input.
- **Units:** Choose between px (pixels) or % (percentage). 
- **Availability:** Enabled only when Legends Position is set to Right and Legend Type is set to Plain. 
- **Purpose:** Overrides the default width of the legend area. 

**Example: Legend width configuration**

![Legend width setting in UI](../../images/legend-width-config.png)


### Chart align

Controls the horizontal alignment of the chart within its container.

| Option | Description |
|--------|-------------|
| Auto | Centers the chart (default) |
| Left | Aligns the chart to the left |
| Center | Centers the chart |

**Note:** This option is only available for pie and donut charts when legends position is set to "Right".

**Example: Chart align options for pie chart**

![Chart align dropdown showing Auto, Left, and Center options](../../images/chart-align-options.png)

Legends Position is set to Right and Legend Type is set to Plain. You can select how the chart is horizontally aligned within the remaining space.


## Gridline configuration

### Show gridlines

A toggle switch that controls gridline visibility on the chart.

- **Type:** Boolean toggle (on/off)
- **Default:** On
- **Effect:** When enabled, displays horizontal and vertical reference lines on the chart. 

**Example: Gridlines disabled**

![Chart without gridlines](../../images/gridlines-off.png)

When gridlines are disabled, the chart displays without reference lines, providing a cleaner appearance.


## Chart type support

### Legend options

Legend configuration is available for:

- Line chart
- Area chart (stacked and unstacked)
- Bar chart (vertical and horizontal)
- Scatter plots
- Stacked chart (vertical and horizontal)
- Pie chart
- Donut chart

Legend configuration is not available for:

- Table chart
- Heatmaps
- Metric chart
- Gauge chart
- Geomap chart
- Sankey chart
- Map chart

### Gridlines option

The show gridlines option is available for:

- Line chart
- Area chart (stacked and unstacked)
- Bar chart (vertical and horizontal)
- Scatter plots
- Stacked chart (vertical and horizontal)

The show gridlines option is not available for:

- Pie chart
- Donut chart
- Heatmaps
- Table chart
- Metric chart
- Gauge chart
- Geomap chart
- Sankey chart
- Map chart
