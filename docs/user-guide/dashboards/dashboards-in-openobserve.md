---
description: >-
  Visualize and monitor data in OpenObserve Dashboards with interactive panels,
  real-time insights, and flexible organization using folders and tabs.
---
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

![access dashboard](../../images/dashboard-1.png)

## How to Build Dashboards

<iframe width="560" height="315" src="https://www.youtube.com/embed/kjUvXQdL798?si=guA2AK3COvYJolIr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Dashboard Structure in OpenObserve

### Folders
Dashboards are stored in folders. By default, the **default** folder is created. However, you can create additional folders to organize **Dashboards** based on your requirements.

!!! info "Create Folders"
    To create a new folder, click the **New Folder** button, and provide a folder name and description.

![create folders in dashboard](../../images/dashboard-2.png)

!!! info "Editing or Deleting Folders"
    To edit or delete a folder, click the vertical ellipsis (three dots) menu next to the folder name in the folder list. This allows you to rename or remove the folder as needed.

![edit or delete folder](../../images/dashboard-3.png)

### Dashboards
Inside each folder, you can create one or more **Dashboards**. Dashboards hold Panels, which represent visualizations of your data.

!!! info "Create Dashboards"
    To create a new Dashboard, click the **New Dashboard** button, add Name and Description for the Dashboard, and select an existing folder or create a new folder to organize the Dashboard. Use the **Import** button to import an existing Dashboard.  
    <br>
    Dashboards can contain one or more Panels for visualizing various data points or metrics.

![create dashboards](../../images/dashboard-4.png)

### Panels
A Panel displays a single visualization using one of the [supported chart types](#supported-chart-types-in-dashboards), based on specific data.

!!! info "Create Panels"
    To add a Panel inside a Dashboard, click the **Add Panel** button. <br>  
    Each Panel displays one type of visualization. You can add multiple Panels to a Dashboard to represent different data.

![add panels](../../images/dashboard-5.png)

Example of a Dashboard with Panels:

![dashboards with panels](../../images/dashboard-6.png)

### Supported Chart Types in Dashboards
!!! info "The following charts are supported in Dashboards:" 

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
    14. Heatmap 
    15. Metric Text 
    16. Gauge
    17. HTML
    18. Markdown
    19. Sankey
    20. Custom Charts

### Tabs
Tabs help organize your Panels into different sections within a **Dashboard**. For example, you might have one Tab for Performance, another for Errors, and another for Traffic Analysis.
By default, Panels are added to the **Default** tab.  
!!! info "Create New Tabs" 
    To create a new Tab, click the + icon next to the default Tab and enter a Tab name. You can create new Tabs from the **Tabs** menu under the **Dashboard Settings**.

![create new tabs](../../images/dashboard-7.png)

Example of a Dashboard with Panels in different Tabs:

![dashboard with panels in mulitple tabs](../../images/dashboard-8.png)

![dashboard with panels in multiple tabs](../../images/dashboard-9.png)

## FAQ
**Q**: **Why does my dashboard chart say "No data"?** <br>
**A**: OpenObserve shows a "No data" message on a dashboard chart when the selected query returns no results for the specified time range.
This helps clarify that the chart loaded successfully, but no matching data was found. It is not an error.
When a dashboard loads a blank chart placeholder appears while data is loading.
 If the query returns data for the selected time range, the chart is rendered normally.
 If the query returns no data, the chart shows a No data message to indicate an empty result.
> To resolve this, try adjusting the time range or filters, and refresh the dashboard.


## Next Step
- [Manage Dashboards](manage-dashboards.md)
