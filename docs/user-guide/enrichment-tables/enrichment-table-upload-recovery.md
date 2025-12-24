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


## Region-based caching in multi-region super clusters
In a multi-region super cluster deployment, enrichment tables are typically queried from all regions when a node starts up and rebuilds its cache. While this ensures data completeness, it can slow startup or cause failures if one or more regions are unavailable.

To address this, OpenObserve Enterprise supports primary region–based caching, controlled by the environment variable `ZO_ENRICHMENT_TABLE_GET_REGION`.

### Requirements 

- Available only in Enterprise Edition.
- Requires Super Cluster to be enabled.
- The `ZO_ENRICHMENT_TABLE_GET_REGION` variable must specify a valid region name.

### How it works
When a node starts, OpenObserve calls internal methods such as `get_enrichment_table_data()` and `cache_enrichment_tables()` to retrieve enrichment table data. <br>
The boolean parameter `apply_primary_region_if_specified` controls whether to use only the primary region for these fetch operations.

In a multi-region super cluster deployment, when `apply_primary_region_if_specified = true`, OpenObserve checks the value of `ZO_ENRICHMENT_TABLE_GET_REGION`. 

- If `ZO_ENRICHMENT_TABLE_GET_REGION` specifies a primary region, the node queries only that region to fetch enrichment table data during cache initialization. 
- If `ZO_ENRICHMENT_TABLE_GET_REGION` is not set, or the region name is empty, OpenObserve continues to query all regions as before.



