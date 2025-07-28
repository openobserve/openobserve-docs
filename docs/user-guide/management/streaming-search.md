---
title: OpenObserve Streaming Search 
description: Learn how OpenObserve's Streaming Search delivers incremental query results using HTTP/2 partitioning for faster log analysis and real-time data processing.
---
This user guide provides details on how to configure, and use OpenObserve's **Streaming Search** feature to improve query performance and responsiveness. 

## What is Streaming Search?

Streaming Search is a feature that delivers query results incrementally to the user interface using an **HTTP/2** streaming connection. Instead of waiting for the entire query to complete, OpenObserve breaks large queries into smaller partitions and streams the results as they are processed. This allows matching log entries to appear more quickly, even while the query continues to run in the background.

!!! note "Where to Find"
    The **Streaming Search** toggle is located under **Management > General Settings**.

!!! note "Who Can Access"
    The `Root` user and any other user with permission to **update** the **Settings** module can modify the **Streaming Search** setting. Access is controlled through role-based access control (RBAC).
    ![User Access](../../images/streaming-search-access.png)
    

## Enable or Disable Streaming Search

1. Go to **Management**.
2. Select **General Settings**.
![Enable or Disable Streaming Search](../../images/enable-disable-streaming-search.png)
3. Locate the **Enable Streaming Search** option.
4. Toggle this switch to **On** to enable streaming mode, or **Off** to disable it.
5. Click **Save** to save the changes.

## How does it work?

### 1. Partitioning

OpenObserve splits the total time range into partitions, each covering a segment of time or data volume, called **partitions**. For example, an 8-hour query with 8 GB of data may be split into 8 partitions, each processing 1 GB. Each partition is executed independently and contributes partial results to the overall output.

Streaming begins as soon as the first partition completes, improving responsiveness.

### 2. Mini-Partitioning

Mini-partitioning further breaks the first partition into small slices based strictly on time. Controlled by: `ZO_MINI_SEARCH_PARTITION_DURATION_SECS`=60 (default is 60 seconds)

These short-duration partitions are created only at the beginning of the query time range. Enables the result to appear within milliseconds, even if the full partition takes longer. Once mini-partitions complete, the system switches back to processing full-size partitions.

### 3. Streaming via HTTP/2

Results from each partition are sent incrementally to the browser using a single persistent HTTP/2 connection.

### 4. Real-time delivery

As each partition is processed, its results are immediately streamed to the user interface.

This mechanism avoids delays caused by waiting for the entire result set and is especially useful for long-running or high-volume searches.


## Considerations

- Requires HTTP/2 support in the network stack.
- Fallbacks to standard query mode if disabled.
- Partitioning behavior is automatic. Mini-partitioning improves the time-to-first-result without affecting the accuracy of final results.