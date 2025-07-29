---
title: Upload, Caching, and Restart Behavior – OpenObserve
description: Explains enrichment table upload, caching, and recovery behavior in OpenObserve based on file size and system settings.
---
This page describes how OpenObserve handles [enrichment table](../enrichment/) uploads, caching, and table loading behavior during node restart.


## Upload Behavior
The upload flow adapts based on the file size, controlled by the environment variable `ZO_ENRICHMENT_TABLE_MERGE_THRESHOLD_MB`. 
> Default value: 60 MB

### When the file is smaller than 60 MB
- Uploaded to the metadata and file list storage system. For example, PostgreSQL.
- A background job runs  job at regular intervals to:

    - Merge all enrichment files received in the last interval.
    - Create a single Parquet file.
    - Upload the merged file to the remote telemetry storage such as S3.

!!! info "To configure the interval:"
    Set the `ZO_ENRICHMENT_TABLE_MERGE_INTERVAL` environment variable.

    - This variable defines how frequently the merge job runs.
    - The value is in seconds.
    - Default: 600

### When the file is 60 MB or larger

- Skips the metadata and file list storage system.
- Directly uploads to remote telemetry storage such as S3.
- No merging or background sync is involved in this path.



## Local Disk Cache
After every enrichment table upload, OpenObserve caches the data locally to allow quick recovery and reduce remote fetches. 

- Default path: `/data/openobserve/cache/enrichment_table_cache`
- Configurable with: `ZO_ENRICHMENT_TABLE_CACHE_DIR`

This cache is the primary recovery source during node restarts.


## Behavior on Node Restart
When a node restarts, OpenObserve restores the enrichment table in the following order:

### If local disk cache is available

OpenObserve first checks whether a local disk cache is available. If found, it then verifies whether the cached enrichment table is up to date.

- If the cache is current, OpenObserve loads the enrichment table directly from the local disk into memory.
- If the cache is outdated, OpenObserve proceeds with the same flow used when no local disk cache is available.

### If local disk cache is missing

When no local disk cache is available: 

- OpenObserve sends a single search request to one of the querier nodes.
- The querier fetches the latest enrichment data from the metadata database, such as PostgreSQL, and the remote storage system, such as S3. It then provides the data to the restarting node.



