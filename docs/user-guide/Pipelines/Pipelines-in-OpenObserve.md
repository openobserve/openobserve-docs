This page provides an overview of pipelines, their types, and how they work.<br>

## What are Pipelines?
Pipelines enable seamless data ingestion and transformation using an intuitive drag-and-drop interface.

![Pipelines in OpenObserve](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/images/Pipelines%20in%20O2.png)

## Types of Pipelines
OpenObserve supports two types of pipelines to cater to different data processing needs: 

- **Real-time pipelines** 
- **Scheduled pipelines**

### Real-Time Pipelines
Real-time pipelines process incoming data instantly.

#### How they work

1. **Source stream**: Data enters the pipeline through the source stream. 
2. **Transform**: The pipeline applies conditions or functions to filter and transform the data in real-time.
3. **Destination stream**: The transformed data is sent to the destination stream for further use or storage.
#### When to use
Use real-time pipelines when you need immediate processing, such as monitoring live data and cleaning logs in real-time.

### Scheduled Pipelines
Scheduled pipelines process data at defined intervals.

#### How they work

1. **Source query**: Data gets ingested into a stream periodically. Using an SQL query, the pipeline fetches all data ingested within a specific period. The query runs automatically at the defined interval. <br>
Users define how frequently the query runs and fetches data using the following options:

    | Parameter          | Description                                                                                             | Example                                                                                              |
    |--------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
    | Frequency          | Defines how often the query should be executed.                                                        | **Frequency**: 2 minutes<br>It ensures the query runs every 2 minutes.                              |
    | Period             | Defines the period for which the query fetches the data.<br>**Note**: The period should be the same as frequency. | **Period**: 2 minutes<br>It ensures the query fetches the data that was ingested in the last 2 minutes. |
    | Frequency with Cron| Cron allows you to define custom execution schedules based on specific expressions and timezones. It is ideal for scenarios requiring tasks to run at predefined times. | **Cron Expression**: `0 0 1 * *`<br>**Timezone**: Asia/Kolkata<br>It ensures the query runs at 12:00 AM IST (00:00 in 24-hour format) on the first day of the month. |

3. **Transform**: The pipeline applies conditions or functions to refine the fetched data as needed.
4. **Destination stream**: The pipeline sends the transformed data to the destination stream for further use or storage.
#### When to use
Use scheduled pipelines for tasks that require processing at fixed intervals instead of continuously, such as generating periodic reports and processing historical data in batches.

## Next Steps
- [Create and Use Pipelines](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/user-guide/Pipelines/Create-and-Use-Pipelines.md)
- [Manage Pipelines](https://github.com/openobserve/openobserve-docs/blob/new-docs/docs/user-guide/Pipelines/Manage-Pipelines.md)