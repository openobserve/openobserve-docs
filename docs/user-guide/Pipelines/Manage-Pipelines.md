This page describes the features designed to help you manage your pipelines in OpenObserve.

![pipeline management](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/pipeline12-%20manage%20pipelines.png)


## Filter Options

Toggle between **All**, **Real-Time**, and **Scheduled** pipelines to focus on the type of pipelines you want to view.


## Search Pipelines

Use the search bar to locate pipelines by name or attributes.


## Pipeline List View

View all pipelines in a tabular format, including:

- **Pipeline Name**: Identify the pipeline.
- **Type**: Displays whether it is real-time or scheduled.
- **Stream Name**: Indicates the associated source stream.
- **Stream Type**: Specifies the type of data in the stream- logs, metrics, traces, or enrichment tables.  
- **Frequency**: Shows how often the scheduled pipeline executes.
- **Period**: Indicates the interval duration for scheduled pipeline execution.
- **Silence**: Shows the configured silence period for scheduled pipelines.
- **Cron**: Specifies whether the scheduled pipeline uses a cron schedule (True/False).
- **SQL Query**: Displays the SQL query used in the scheduled pipeline configuration.


## Actions Tab

- **Pause/Start Pipelines**: Temporarily stop or restart pipelines as needed.
- **Edit Pipeline**: Modify the configuration of an existing pipeline.
- **Delete Pipeline**: Remove a pipeline permanently from your system.
