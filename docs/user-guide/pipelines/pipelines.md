This page provides an overview of pipelines, their types, and how they work.<br>

## What are Pipelines?
Pipelines enable seamless data ingestion and transformation using an intuitive drag-and-drop interface.

![Pipelines in OpenObserve](../../images/pipeline-new-editor.png)

## Types of Pipelines
OpenObserve supports two types of pipelines to cater to different data processing needs: 

- **Real-time pipelines** 
- **Scheduled pipelines**

### Real-Time Pipelines
A real-time Pipeline processes incoming raw data instantly, enabling immediate transformations and routing without delays.

#### How they work

1. **Source**: As soon as raw data is ingested into the source stream, the pipeline begins processing it.
    - The supported source stream types are Logs, Metrics, or Traces.<br>**Note**: Each source stream can be associated with only one real-time pipeline. 
    ![Pipelines in OpenObserve](../../images/pipelines-new-realtime.png)
2. **Transform**: The pipeline applies conditions or functions to filter and transform the data in real-time. 
![Pipelines in OpenObserve](../../images/pipeline-new-realtime-transform-condition.png)
3. **Destination**: The transformed data is sent to the following destination(s) for further use or storage: 
    - **Stream**: The supported destination stream types are Logs, Metrics, Traces, or Enrichment tables. <br>**Note**: Enrichment Tables can only be used as destination streams in scheduled pipelines.
    ![Pipelines in OpenObserve](../../images/pipeline-new-realtime-destination.png)
    - **Remote**: Select **Remote** if you wish to send data from the pipeline to [external destinations](#external-pipeline-destinations).

#### When to use
Use real-time pipelines when you need immediate processing, such as monitoring live data and cleaning logs in real-time.

### Scheduled Pipelines

A scheduled pipeline automates the processing of historical data from an existing stream at user-defined intervals. This is useful when you need to extract, transform, and load (ETL) data at regular intervals without manual intervention. 
![Scheduled Pipelines in OpenObserve](../../images/pipelines-new-%20scheduled.png)

!!! note "Performance"
    OpenObserve maintains a cache for scheduled pipelines to prevent the alert manager from making unnecessary database calls. This cache becomes particularly beneficial when the number of scheduled pipelines is high. For example, with 500 scheduled pipelines, the cache eliminates 500 separate database queries each time the pipelines are triggered, significantly improving performance.
    
#### How they work

1. **Source**: To create a scheduled pipeline, you need an existing stream, which serves as the source stream. 
    - The supported source stream types are Logs, Metrics, or Traces. 
2. **Query**: You write a SQL query to fetch historical data from the source stream. When defining the query, you also set the [**Frequency** and **Period**](#the-scheduled-pipeline-runs-based-on-the-user-defined-frequency-and-period) to control the scheduling. 
![Scheduled Pipelines Query in OpenObserve](../../images/create-pipeline-sch-query.png)
3. **Transform**: The fetched data is transformed by applying functions or conditions.
![Scheduled Pipelines Transform in OpenObserve](../../images/pipeline-new-scheduled-condition.png)
4. **Destination**: The transformed data is sent to the following destination(s) for storage or further processing: 
    - **Stream**: The supported destination stream types are Logs, Metrics, Traces, or Enrichment tables. <br>**Note**: Enrichment Tables can only be used as destination streams in scheduled pipelines.
    - **Remote**: Select **Remote** if you wish to send data to [external destination](https://openobserve.ai/docs/user-guide/pipelines/remote-destination/).

#### Frequency and Period
The scheduled pipeline runs based on the user-defined **Frequency** and **Period**. 

- **Frequency**: Defines how often the query should be executed. <br> **Example**: **Frequency**: 5 minutes<br>It ensures the query runs every 5 minutes.
- **Period**: Defines the period for which the query fetches the data. <br> 
    **Note**: The period should be the same as frequency, and both must be greater than 4. <br> 
    **Example**: **Period**: 5 minutes<br>It ensures the query fetches the data that was ingested in the last 5 minutes. 
- **Frequency with Cron**: Cron allows you to define custom execution schedules based on specific expressions and timezones. It is ideal for scenarios requiring tasks to run at predefined times. <br>**Example**: **Cron Expression**: `0 0 1 * *`
<br>**Timezone**: Asia/Kolkata
<br>It ensures the query runs at 12:00 AM IST (00:00 in 24-hour format) on the first day of the month. 

#### When to use
Use scheduled pipelines for tasks that require processing at fixed intervals instead of continuously, such as generating periodic reports and processing historical data in batches.


## Next Steps
- [Create and Use Pipelines](../use-pipelines/)
- [Manage Pipelines](../manage-pipelines/)