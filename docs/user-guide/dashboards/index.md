# Index


## Chart types

Following chart types are supported:

1. Area
1. Area stacked
1. Line
1. Vertical Bar
1. Horizontal bar
1. Vertical Bar stacked
1. Horizontal bar stacked
1. Heatmap
1. Geo map
1. Pie
1. Donut
1. Gauge
1. Metric text / Single stat
1. Table

## Dashboard variables

Dashboard variables are used to make dashboards interactive. They can be used to filter data based on certain aspects e.g. host name, kubernetes namespace, etc. 

You must define dashboard variables at dashboard level and then use them on each chart within the dashboard. This allows for filtering data across multiple charts using the same variable. These variables can be used in both SQL based charts or PromQL based charts together in a single dashboard.

There are 2 kinds of variables:

1. [Static variables](variables.md)
1. Dynamic variables

Below is an example of a dashboard with a filter:

![Dashboard with filter](images/filter1.png)







