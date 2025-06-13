After data [ingestion is complete](streams-in-openobserve.md/#ingest-data-into-stream), you can view detailed information about a stream using the **Stream Details** panel. 
This guide explains how to access the **Stream Details** panel and the information available in the panel. 

## Access 

From the Streams page, select the **Explore** icon from the **Actions** column.   
![stream details access](../../images/stream-details-access.png) 

This opens the **Stream Details** panel, which provides configuration details, schema settings, and extended retention options.

## Permission

User roles that have permission to update Streams can modify the stream settings from the **Stream Details** page. The permission needs to be assigned to appropriate user roles using role-based access control (RBAC). 

![stream details permission](../../images/stream-details-permission.png)

## Stream Details
The **Stream Details** panel displays key configuration and usage information for the selected stream:

![stream details](../../images/stream-details.png)

## General Information

- **Stream Name**: Name of the selected stream.  
- **Docs Count**: Total number of ingested events.  
- **Ingested Data**: Uncompressed size of the stored data.  
- **Compressed Size**: Storage space used after compression.  
- **Index Size**: Size of the tantivy files generated for full text search index. Other index types, such as KeyValue filters and hash partitions, do not affect this value.   
- **Start Time and End Time**: Start time is the timestamp of the oldest data and end time is the timestamp of the newest data.   

!!! Note

    - If the ingested data has a `_timestamp` field, it will be according to that.  
    - If the ingested data does not have a ` _timestamp` field, then the start time will be the oldest time of ingestion and end time will be the newest time of ingestion.  

## Retention and Query Settings

- **Data Retention in Days**: Sets how long data is retained in this stream. If not configured, the global retention period applies. By default, this is 30 days.  
- **Max Query Range in Hours**: Sets the maximum time span allowed per query. This can help reduce query load. Note that this is stream and org specific.   

    You can set a global value as the maximum query range, for all streams across all organizations using the following environment variable:  

    ```
    ZO_DEFAULT_MAX_QUERY_RANGE_DAYS  
    ```  
    > However, when a non-zero Max query range is set on a stream, the value set from the Stream Details panel overrides the global value. <br> By default, both the environment variable and **Max Query Range** in the UI is set to zero (o), which means no limit.
  
- **Use Stream Stats for Partitioning**: When you enable this toggle, OpenObserve assumes that all your data present in the stream is equally split and creates equal sized partitions between the start and end time. 

## Next Steps

- [Schema Settings](schema-settings.md)
- [Extended Retention](extended-retention.md)