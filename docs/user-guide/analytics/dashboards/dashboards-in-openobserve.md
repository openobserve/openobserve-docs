---
title: Dashboards in OpenObserve
metaTitle: Dashboards in OpenObserve | OpenObserve
description: Visualize and monitor data in OpenObserve Dashboards with interactive panels, real-time insights, and flexible organization using folders and tabs.
---

# Dashboards

This guide introduces you to the **Dashboards** in OpenObserve, including what they are, how to access them, and how to create a new dashboard.

## Introduction to Dashboards

In OpenObserve, **Dashboards** are the central tool for data visualization and monitoring. They provide a way to display real-time and historical data in an interactive, easy-to-understand format. 

The purpose of **Dashboards** is to offer an intuitive, at-a-glance view of your data, helping you:

- **Visualize trends**: Track performance over time with charts and graphs.  
- **Monitor systems**: Keep an eye on critical systems or services in real-time.  
- **Analyze errors**: Detect and analyze errors or issues that need attention.  
- **Facilitate collaboration**: Share and discuss insights with team members through dynamic and interactive data visualizations.

## How to Access Dashboards

On the left-hand side menu, click **Dashboards** to access the dashboard management section.

![access dashboard](../../../images/dashboard-1.png)

## How to Build Dashboards

:::tip[Video walkthrough]
<iframe width="560" height="315" src="https://www.youtube.com/embed/kjUvXQdL798?si=guA2AK3COvYJolIr" title="YouTube video player" frameborder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
:::

## Dashboard Structure in OpenObserve

### Folders
Dashboards are stored in folders. By default, the **default** folder is created. However, you can create additional folders to organize **Dashboards** based on your requirements.

:::info[Create Folders]
To create a new folder, click the **New Folder** button, and provide a folder name and description.
:::

![create folders in dashboard](../../../images/dashboard-2.png)

:::info[Editing or Deleting Folders]
To edit or delete a folder, click the vertical ellipsis (three dots) menu next to the folder name in the folder list. This allows you to rename or remove the folder as needed.
:::

![edit or delete folder](../../../images/dashboard-3.png)

### Dashboards
Inside each folder, you can create one or more **Dashboards**. Dashboards hold Panels, which represent visualizations of your data.

:::info[Create Dashboards]
To create a new Dashboard, click the **New Dashboard** button, add Name and Description for the Dashboard, and select an existing folder or create a new folder to organize the Dashboard. Use the **Import** button to import an existing Dashboard.  
<br>
Dashboards can contain one or more Panels for visualizing various data points or metrics.
:::

![create dashboards](../../../images/dashboard-4.png)

### Panels
A Panel displays a single visualization using one of the [supported chart types](#supported-chart-types-in-dashboards), based on specific data.

:::info[Create Panels]
To add a Panel inside a Dashboard, click the **Add Panel** button. <br>  
Each Panel displays one type of visualization. You can add multiple Panels to a Dashboard to represent different data.
:::

![add panels](../../../images/dashboard-5.png)

Example of a Dashboard with Panels:

![dashboards with panels](../../../images/dashboard-6.png)

### Supported Chart Types in Dashboards

The following charts are supported in Dashboards:

1. Area
2. Area stacked
3. Vertical Bar
4. Horizontal bar
5. Line
6. Scatter
7. Vertical Bar stacked
8. Horizontal bar stacked
9. Geo map
10. Maps
11. Pie
12. Donut
13. Heatmap
14. Metric Text
15. Gauge
16. HTML
17. Markdown
18. Sankey
19. Custom Charts
20. Table: Display data in rows and columns, with optional pivot mode.

The **Table** chart supports a pivot mode: add a **Breakdown** field (the **+P** button) to cross-tabulate data into columns (up to 3 pivot fields), with optional **Show Row Totals** / **Show Column Totals** (and sticky variants). **Transpose** and **Dynamic Columns** are disabled while pivot mode is active.

### Tabs
Tabs help organize your Panels into different sections within a **Dashboard**. For example, use one Tab for Performance, another for Errors, and another for Traffic Analysis.
By default, Panels are added to the **Default** tab.  
:::info[Create New Tabs]
To create a new Tab, click the + icon next to the default Tab and enter a Tab name. You can create new Tabs from the **Tabs** menu under the **Dashboard Settings**.
:::

![create new tabs](../../../images/dashboard-7.png)

Examples of a Dashboard with Panels organized in different Tabs:

<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <img src="../../../../images/dashboard-8.png" alt="dashboard with panels in multiple tabs, view 1" style="flex: 1 1 320px; max-width: 100%;" />
  <img src="../../../../images/dashboard-9.png" alt="dashboard with panels in multiple tabs, view 2" style="flex: 1 1 320px; max-width: 100%;" />
</div>

## Time Range and Auto Run

Dashboards now apply time-range changes the same way the rest of the product does, and with **Auto Run** enabled, opening a dashboard ends on the latest data instead of the last cached result.

### Auto Run on dashboards

**Auto Run** is a per-deployment feature (enabled with the `ZO_AUTO_QUERY_ENABLED=true` environment variable) that re-runs queries automatically. On dashboards it controls what happens when a dashboard opens and when you change the time range or filters.

When **Auto Run** is on and a panel uses a relative time range:

- The panel shows its cached result immediately, then re-queries in the background.
- The cached chart stays on screen until the fresh result is complete.
- The panel's loading line runs while the query is in flight, and the panel's "Xm ago" age keeps the previous value until the fresh data lands.

Only visible panels query, and each tab refreshes once per visit. Opening a dashboard from the list, a browser reload, and returning from **Edit Panel** each count as a new visit.

The **Auto Run** menu item now reads **Runs queries on open and on filter/time changes** and **Applies to all dashboards, Logs and Traces**, making it clear that the switch is not per dashboard:

![the Auto Run menu item describing when queries run](images/dashboard-fresh-on-open-1.png)

### Time pickers without an Apply button

The dashboard toolbar picker, the per-panel time pickers, and the **View Panel** dialog picker no longer have an **Apply** button. Instead, the picked range either applies at once or waits for a refresh, depending on **Auto Run**:

- **Auto Run on**: a picked range applies at once. Relative presets, the previous/next arrows, and a time-zone change apply immediately; typed absolute times apply after a 2.5 s pause (as Logs does) or when the picker closes.
- **Auto Run off** (or `ZO_AUTO_QUERY_ENABLED` unset): the picked range waits. The **Refresh** button turns yellow (**Refresh to apply the time range**), and clicking **Refresh**, the auto-refresh interval, or pressing the **R** shortcut applies it. A per-panel picker marks that panel's refresh icon instead, and the **View Panel** dialog marks its own **Refresh**.

![the dashboard toolbar time picker without an Apply button](images/dashboard-fresh-on-open-2.png)

Panels, tab switches, a panel's own refresh, and variables always use the applied range, never a waiting one. The URL and **Share** link change only when a range is applied. Picking the applied range again clears the waiting state, and turning **Auto Run** on applies a waiting range.

An invalid range (start after end, or an empty field) is never applied; when the picker closes, its label returns to the applied range.

![the yellow Refresh button indicating a waiting time range](images/dashboard-fresh-on-open-3.png)

The **Add/Edit Panel** page keeps its **Apply** button, and **Logs**, **Traces**, and other pages that share the picker are unchanged.

### Behavior on every dashboard

These changes apply whether **Auto Run** is on or off:

- An interrupted run (leaving the dashboard, cancelling, or switching tabs) no longer overwrites a panel's last complete cache entry with a partial one, so the next open no longer shows **No Data** until the query returns.
- A panel with an absolute time range restores from cache only when the cached window is the same window.
- A panel body stays blank until its first load settles (cache restored, or the first query finished, failed, or was cancelled), instead of briefly showing **No Data** on every open. An empty result still shows **No Data**.

## FAQ

### Why does my dashboard chart say "No data"?

OpenObserve shows a "No data" message on a dashboard chart when the selected query returns no results for the specified time range. This clarifies that the chart loaded successfully but no matching data was found. It is not an error.

When a dashboard loads, a blank chart placeholder appears while data is loading. If the query returns data for the selected time range, the chart is rendered normally. If the query returns no data, the chart shows a "No data" message to indicate an empty result.

**To resolve this:** try adjusting the time range or filters, and refresh the dashboard.

### Can I import an existing dashboard?

Yes. From the **Dashboards** page, click the **Import** button and upload a dashboard JSON file. You can also choose the folder to import it into, or create a new one.

### How do I move a dashboard to a different folder?

Open the dashboard, go to **Dashboard Settings**, and change the assigned folder. To move many dashboards at once, see [Bulk move and export](bulk-move-and-export-dashboards.md).

## Next steps

- [Manage Dashboards](manage-dashboards.md): edit, duplicate, delete, and share dashboards.
- [Panels](panels/index.md): deep-dive into panel configuration and chart types.
- [Filters](filters/index.md): control what data is shown across panels.
- [Variables](variables/index.md): make dashboards dynamic with reusable values.
- [Bulk move and export](bulk-move-and-export-dashboards.md): manage dashboards at scale.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
