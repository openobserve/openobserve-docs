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

![access dashboard](../../../images/dashboard-1-v2.png)

## How to Build Dashboards

:::tip[Video walkthrough]
<iframe width="560" height="315" src="https://www.youtube.com/embed/kjUvXQdL798?si=guA2AK3COvYJolIr" title="YouTube video player" frameborder="0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
:::

## Dashboard Structure in OpenObserve

### Folders
Dashboards are stored in folders. By default, the **default** folder is created. However, you can create additional folders to organize **Dashboards** based on your requirements.

:::note[Create Folders]
To create a new folder, click **+** (**Add Folder**) at the top of the **Folders** rail, and provide a folder name and description. You can also pick an [icon](folder-icons.md) for the folder.
:::

![create folders in dashboard](../../../images/dashboard-2-v2.png)

:::note[Editing or Deleting Folders]
To edit or delete a folder, click the vertical ellipsis (three dots) menu next to the folder name in the folder list and select **Edit** or **Delete**.
:::

![edit or delete folder](../../../images/dashboard-3-v2.png)

### Dashboards
Inside each folder, you can create one or more **Dashboards**. Dashboards hold Panels, which represent visualizations of your data.

:::note[Create Dashboards]
To create a new Dashboard, click **New dashboard**, add a Name and Description for the Dashboard, and select an existing folder or create a new folder to organize the Dashboard. To bring in an existing Dashboard, open the **Import** menu and choose **Custom** (a JSON file or URL), **Templates** (the dashboard gallery), or one of the **Migrate from** options (Datadog, Grafana, Kibana, CloudWatch).  
<br>
Dashboards can contain one or more Panels for visualizing various data points or metrics.
:::

![create dashboards](../../../images/dashboard-4-v2.png)

### Panels
A Panel displays a single visualization using one of the [supported chart types](#supported-chart-types-in-dashboards), based on specific data.

:::note[Create Panels]
To add a Panel inside a Dashboard, click the **Add Panel** button. <br>  
Each Panel displays one type of visualization. You can add multiple Panels to a Dashboard to represent different data.
:::

![add panels](../../../images/dashboard-5-v2.png)

Example of a Dashboard with Panels:

![dashboards with panels](../../../images/dashboard-6-v2.png)

### Supported Chart Types in Dashboards

The following charts are supported in Dashboards:

1. Area
2. Area Stacked
3. Bar
4. Horizontal (bar)
5. Line
6. Scatter
7. Stacked (bar)
8. H-Stacked (horizontal stacked bar)
9. GeoMap
10. Maps
11. Pie
12. Donut
13. Heatmap
14. State timeline
15. Host map
16. Table: Display data in rows and columns, with optional pivot mode.
17. Metric Text
18. Gauge
19. HTML
20. Markdown
21. Sankey
22. Custom Chart

The **Table** chart supports a pivot mode: add a **Pivot Field** (the **+P** button) to cross-tabulate data into columns (up to 3 pivot fields), with optional **Show Row Totals** / **Show Column Totals** (and sticky variants). **Transpose** and **Allow Dynamic Columns** are disabled while pivot mode is active. See [Pivot Table](config/pivot-table.md).

### Tabs
Tabs help organize your Panels into different sections within a **Dashboard**. For example, use one Tab for Performance, another for Errors, and another for Traffic Analysis.
By default, Panels are added to the **Default** tab.  
:::note[Create New Tabs]
To create a new Tab, click the **+** (**Add Tab**) icon next to the Tabs and enter a Tab name. You can also create Tabs from the **Tabs** section of **Dashboard Settings**. Tabs cannot be added while the layout is in [edit mode](manage-dashboards.md#edit-dashboard-layout).
:::

![create new tabs](../../../images/dashboard-7-v2.png)

Examples of a Dashboard with Panels organized in different Tabs:

<div style="display: flex; gap: 12px; flex-wrap: wrap;">
  <img src="../../../../images/dashboard-8-v2.png" alt="dashboard with panels in multiple tabs, view 1" style="flex: 1 1 320px; max-width: 100%;" />
  <img src="../../../../images/dashboard-9-v2.png" alt="dashboard with panels in multiple tabs, view 2" style="flex: 1 1 320px; max-width: 100%;" />
</div>

## Time Range and Auto Run

**Auto Run** re-runs dashboard queries automatically when a dashboard opens and when you change the time range or filters. Enable it for your deployment with `ZO_AUTO_QUERY_ENABLED=true`. The setting applies to all dashboards, Logs, and Traces.

![the Auto Run menu item describing when queries run](images/dashboard-fresh-on-open-1.png)

When Auto Run is on, panels with a relative time range show their cached result first, then refresh in the background with the latest data.

Dashboard time pickers apply the selected range based on Auto Run:

- **Auto Run on**: The range applies immediately.
- **Auto Run off**: The **Refresh** button turns yellow. Click **Refresh** or press **R** to apply the range.

![the yellow Refresh button indicating a waiting time range](images/dashboard-fresh-on-open-3.png)

## FAQ

### Why does my dashboard chart say "No data"?

OpenObserve shows a "No data" message on a dashboard chart when the selected query returns no results for the specified time range. This clarifies that the chart loaded successfully but no matching data was found. It is not an error.

When a dashboard loads, a blank chart placeholder appears while data is loading. If the query returns data for the selected time range, the chart is rendered normally. If the query returns no data, the chart shows a "No data" message to indicate an empty result.

**To resolve this:** try adjusting the time range or filters, and refresh the dashboard.

### Can I import an existing dashboard?

Yes. From the **Dashboards** page, open the **Import** menu and select **Custom** to upload a dashboard JSON file or import it from a URL. You can also choose the folder to import it into, or create a new one. **Templates** imports a ready-made dashboard from the gallery.

### How do I move a dashboard to a different folder?

In the dashboard list, click the **Move to another Folder** icon in the dashboard's **Actions** column, select the destination folder, and click **Move**. To move many dashboards at once, see [Bulk move and export](bulk-move-and-export-dashboards.md).

## Next steps

- [Manage Dashboards](manage-dashboards.md): edit, duplicate, delete, and share dashboards.
- [Panels](panels/index.md): deep-dive into panel configuration and chart types.
- [Filters](filters/index.md): control what data is shown across panels.
- [Variables](variables/index.md): make dashboards dynamic with reusable values.
- [Bulk move and export](bulk-move-and-export-dashboards.md): manage dashboards at scale.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
