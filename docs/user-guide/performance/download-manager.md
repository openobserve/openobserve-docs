This guide explains how OpenObserve ensures fast and reliable query performance. It introduces the Download Manager, a built-in component that manages how files are downloaded during ingestion and search.

## How the Download Manager Works

OpenObserve stores the ingested data in Parquet files, a column-based file format optimized for efficient querying and compression. These files are saved in object storage, such as Amazon S3 or MinIO, and are not stored locally on the machines that execute queries.

To run a query, the required Parquet files must be available on the querier node’s local disk. Querier nodes are the components in OpenObserve that process and execute search queries.

The Download Manager is a background service that runs on each querier node. Its role is to download Parquet files from object storage to the local disk whenever they are needed. These downloads are triggered in two situations:

- When new data is ingested
- When a user initiates a search query 



## When the Download Manager Is Triggered

=== "Ingestion"

    During ingestion, OpenObserve continuously collects and stores incoming data. This data is stored in the form of small Parquet files. Smaller files are periodically merged into larger ones by either the ingester or the compactor. When a larger Parquet file is created, the system uses a [hashing mechanism](../../performance.md/#pre-cache-files-for-faster-query-execution) to select one of the querier nodes to receive and cache the file.

    The selected querier receives a broadcast event notifying it about the new file. It then uses the Download Manager to:

    1. Download the file from the object storage, such as S3. 
    2. Store it in its local disk cache.  

    !!! Note
        This process is a form of **proactive caching**. The file is downloaded and cached before any user queries it, ensuring faster response times when recent data is searched.

=== "Search"

    When a user runs a search query, the querier must access all Parquet files that fall within the query’s time range.

    If some files are not cached locally, the querier:

    1. Queries metadata to identify required files  
    2. Uses the Download Manager to fetch missing files  

    !!! Note
        This is a **reactive caching mechanism**. The querier downloads only the files needed to fulfill the user’s search.

## Queue-Based Downloading

Prior to version `v0.14.7`, the Download Manager used a single queue to manage all file download requests. This queue operated in a first-in, first-out (FIFO) manner. All downloads, regardless of whether they were triggered by ingestion or search, were processed in the order in which they arrived.

This model had limitations. For example, a large historical search could generate many download requests for older files, delaying the download of more recent files created by ongoing ingestion. As a result, recent data could become temporarily unavailable for querying, even though it had already been ingested.

To address this issue, OpenObserve introduced a dual-queue system in version `v0.14.7`.

## Dual Queue System 
The dual-queue system separates file download requests into two categories:

- **Priority Queue**: Handles downloads for files with recent data.
- **Normal Queue**: Handles downloads for older files.

The classification is based on the file’s **latest timestamp**, which represents the most recent log entry in the file. If this timestamp falls within the configured time window (known as the priority window), the file is routed to the priority queue. Otherwise, it is routed to the normal queue.

> Both ingestion and search workflows use the same Download Manager and follow this queueing logic.

## Dual Queue System Configuration 
!!! info "The following environment variables are used to control the dual-queue system:"

    - `ZO_FILE_DOWNLOAD_ENABLE_PRIORITY_QUEUE`  
    **Type:** Boolean  
    **Default:** `true`  
    **Description:** Enables or disables the dual-queue system (priority and normal queues).

    - `ZO_FILE_DOWNLOAD_PRIORITY_QUEUE_WINDOW_SECS`  
    **Type:** Integer (seconds)  
    **Default:** `3600`  
    **Description:** Defines the time window for files to be considered **recent**. Files within this range are routed to the Priority Queue.

    - `ZO_FILE_DOWNLOAD_PRIORITY_QUEUE_THREAD_NUM`  
    **Type:** Integer  
    **Default:** `0` (auto-calculated as max(1, CPU cores/2))  
    **Description:** Number of threads to use for downloading files from the Priority Queue.  
    **Note:** A thread here refers to a background worker process used to perform downloads.


## File Assignment Examples 
The following examples illustrate how files are assigned to the priority or normal queue based on their latest timestamps.

!!! tip "Each file’s latest timestamp is compared against the current time. If it falls within the configured priority window, it is placed in the priority queue."

    === "Ingestion Download Queuing Across a Large Time Range"

        **Current Time:** 2025-05-29 14:00 UTC  
        **Priority window:** 3600 seconds (1 hour)

        During ingestion, the compactor processes a large volume of logs and creates the following three compacted Parquet files:

        - **File A**

            - Covers Logs From: 2025-05-28 10:00 – 2025-05-28 16:00  
            - Latest Timestamp: 2025-05-28 16:00  
            - Queue Assignment: Normal Queue  

        - **File B**

            - Covers Logs From: 2025-05-29 09:00 – 2025-05-29 12:00  
            - Latest Timestamp: 2025-05-29 12:00  
            - Queue Assignment: Normal Queue  

        - **File C**  

            - Covers Logs From: 2025-05-29 13:00 – 2025-05-29 13:40  
            - Latest Timestamp: 2025-05-29 13:40  
            - Queue Assignment: Priority Queue  


        After receiving the broadcast, the querier uses the Download Manager to fetch these files and assigns queues based on timestamps. 

    === "Search Download Queuing Across a Long Time Range"

        **Current Time:** 2025-05-29 14:00 UTC  
        **Priority window:** 3600 seconds (1 hour)  
        **User search query:** 2025-05-28 14:00 to 2025-05-29 14:00

        The querier checks its local disk cache and finds some files within this range are already cached. They are used directly. However, the following files are missing and must be downloaded using the Download Manager:

        - **File X**
            
            - Covers Logs From: 2025-05-28 14:00 – 2025-05-28 20:00  
            - Latest Timestamp: 2025-05-28 20:00  
            - Queue Assignment: Normal Queue  

        - **File Y** 

            - Covers Logs From: 2025-05-29 09:00 – 2025-05-29 12:00  
            - Latest Timestamp: 2025-05-29 12:00  
            - Queue Assignment: Normal Queue  

        - **File Z**

            - Covers Logs From: 2025-05-29 13:00 – 2025-05-29 13:45  
            - Latest Timestamp: 2025-05-29 13:45  
            - Queue Assignment: Priority Queue  

        For each missing file, the Download Manager checks its latest timestamp. 
        Queue decisions are made by comparing each file’s latest timestamp against the current time and the configured priority window.

        !!! Note 
            The querier does not begin processing the search query until all required files, regardless of whether they were downloaded via the Priority or Normal Queue.


## Frequently Asked Questions 

**Q. My query includes both recent and old data. Do I get results faster with the new system?** <br>
**A.** Yes. Files within the configured priority window are downloaded immediately. This helps reduce total wait time, even though the query waits for all required files.


**Q. If the query waits for older files anyway, what is the point of downloading files from the priority window first?** <br>
**A.** The system downloads files in parallel:

- Files in the priority queue are handled with higher urgency.
- Older files go to the Normal Queue.  

This improves responsiveness and prevents blocking.


**Q. I searched for the last 15 minutes. Does the new system help me?** <br>
**A.** Yes. If your requested files fall within the priority window, they are downloaded through the Priority Queue ahead of others. Your query completes faster, even if the system is busy.

