---
title: Streaming Aggregation in OpenObserve
description: Learn how Streaming Aggregation works in OpenObserve Enterprise.
---

## Overview

### What is Streaming Aggregation?

Streaming Aggregation is an Enterprise feature in OpenObserve that enables **Aggregation Cache**. When Streaming Aggregation is enabled, the system begins storing intermediate aggregate results per time partition during query execution. These cached results can then be reused for later queries that cover the same or overlapping time ranges.

### Why Aggregation Cache matters

Aggregation queries often scan large volumes of historical data. Without caching, every query recomputes all partitions of the requested time range, even if the results were already computed before. 
Aggregation Cache works by:

- Storing intermediate aggregate values such as `SUM`, `COUNT`, or `MIN` per partition.
- Reusing these stored values when a later query requests the same partitions.
- Computing only the missing partitions and combining them with cached results.

This approach reduces repeated computation and lowers dashboard latency while preserving accuracy.

### Relationship between Streaming Aggregation and Aggregation Cache

- **Streaming Aggregation** is the feature toggle in Enterprise settings.
- **Aggregation Cache** is the mechanism that becomes active when Streaming Aggregation is enabled.

!!! Note "Who can use it"
    All Enterprise users. 

!!! Note "Where to find it"
    To enable aggregation cache: 

    1. Go to **Management > General Settings**.  
    2. Turn on the **Enable Streaming Aggregation** toggle.
    3. Select **Save**.

!!! Note "Environment variables"

    | Environment Variable                             | Description                                                                                                                                | Default Value                     |
    | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
    | `ZO_FEATURE_QUERY_STREAMING_AGGS`                | Enables or disables Streaming Aggregation. When set to `true`, aggregation queries use the aggregation cache.                              | `true`                           |
    | `ZO_DATAFUSION_STREAMING_AGGS_CACHE_MAX_ENTRIES` | Defines the maximum number of cache entries stored in memory for streaming aggregations. Controls how many partition results are retained. | `10000`                           |
    | `ZO_DISK_RECORD_BATCH_CACHE_MAX_SIZE`            | Sets the maximum size for record batch cache on disk. By default, it is 10 percent of the local volume space, capped at 20 GB.             | 10 percent of volume, up to 20 GB |
    | `ZO_DISK_AGGREGATION_CACHE_ENABLED`              | Enables or disables disk-based aggregation cache. When set to `true`, cached aggregation results are persisted to disk for reuse.          | `true`                            |
    | `ZO_DISK_CACHE_DELAY_WINDOW_MINS`                | Defines the delay window in minutes before writing cached results to disk. Helps avoid frequent disk writes for fast-changing queries.     | `10` minutes                      |

---

## How it works

### First run: partitioning and caching intermediate results
When an aggregation query runs for the first time, OpenObserve divides the requested time range into fixed-size partitions. Each partition is processed separately. The system stores the intermediate aggregate results for each partition, such as `SUM`, `COUNT`, `MIN`, or `MAX`.

These results are cached in memory for quick access and also persisted on disk. This creates the initial **Aggregation Cache** for the query stream.

### Later runs: reuse of cached partitions with safe math

When another query runs with the same stream, filters, and grouping, OpenObserve checks the cache. If the requested time range overlaps with existing partitions, it reuses the cached results and computes only the missing partitions. The results remain accurate because OpenObserve applies safe math such as adding sums and counts before calculating averages.

### Delay window to ensure freshness

To account for late-arriving data, OpenObserve applies a delay window before writing results into the cache. This ensures that partitions include the latest available data and reduces the risk of missing delayed events.
The delay window is configured through the environment variable, `ZO_STREAMING_AGGREGATION_DELAY_SECONDS`. The default value is 60 seconds. You can adjust this value depending on how much late-arriving data you expect.

---

## Query Behavior
Example query
```sql
SELECT avg(response_time), sum(bytes), count(*)
FROM access_logs
WHERE status = 200
```

### First run

- Suppose the query time range covers two partitions, A and B.
- The system scans both partitions fully.
- Results are stored in the aggregation cache.

| Partition | SUM(bytes) | COUNT(*) | SUM(response_time) | AVG(response_time) |
| --------- | ---------- | --------- | ------------------- | ------------------- |
| A         | 3000       | 30        | 1500                | 50                  |
| B         | 5000       | 50        | 2500                | 50                  |

### Later runs

- When you run the same query again for the same or overlapping range, the system fetches results from cached partitions.
- If there is a new partition C, only C is scanned. Cached results for A and B are reused.
- Results are then merged safely.

| Partition | SUM(bytes) | COUNT(\*) | SUM(response\_time) |
| --------- | ---------- | --------- | ------------------- |
| A         | 3000       | 30        | 1500                |
| B         | 5000       | 50        | 2500                |
| C         | 4000       | 40        | 1600                |
| **Final** | **12000**      | **120**       | **5600**                |

### Safe math merges

- **SUM(bytes)** is computed as `3000 + 5000 + 4000 = 12000`.
- **COUNT(*)** is computed as `30 + 50 + 40 = 120`.
- **AVG(response_time)** is computed from merged sums and counts: `5600 ÷ 120 = 46.67`.

---

## Cacheability of Queries
Not all queries can benefit from aggregation cache. For a query to be cacheable, OpenObserve must be able to store and safely merge intermediate results across partitions.

### Supported aggregate functions
The following aggregates are directly supported for caching:

- `min`
- `max`
- `sum`
- `count`
- `avg`
- `median`
- `array_agg`
- `percentile_cont`
- `summary_percentile`
- `first_value`
- `last_value`
- `approx_distinct`
- `approx_median`
- `approx_percentile_cont`
- `approx_percentile_cont_with_weight`
- `approx_topk`
- `approx_topk_distinct`

### Queries that need rewrites
Some aggregates cannot be cached directly but can be rewritten internally into cacheable forms.

**Non-cacheable query**

```sql
SELECT (sum(bytes) / count(*)) + max(latency)
FROM access_logs
```

This is not cacheable as written because the expression mixes multiple aggregates in a single formula.

**Rewritten cacheable query**

```sql
SELECT sum(bytes), count(*), max(latency)
FROM access_logs
```

At merge time, OpenObserve computes:

- `sum(bytes)` by adding partition sums
- `count(*)` by adding partition counts
- `max(latency)` by taking the highest across partitions

Any derived expression such as `sum ÷ count + max` can be applied after merging


### How to check if a query is cacheable
After the first run, if `streaming_aggs` is true and `streaming_id` has a value, the query is eligible for caching. You can check these fields in the query response by using your browser developer tools. Open **Network**, select the `_search_partition` entry, and view the **Preview** or **Response** tab to confirm the values.

### How to verify if a query is using Aggregation Cache

**Where to capture**

Use your browser developer tools. <br>

1. Open Network and filter to **Fetch** or **XHR**.
2. Run the panel or query.
3. Select the entry named `_search_partition`.
4. Open **Preview** or **Response**.

**What to capture** <br>

Capture the following details:  

- `streaming_aggs` must be true
- `streaming_id` must have a value
- `streaming_output` must be true
- `result_cache_ratio` per partition:

    - `100` means the partition came from aggregation cache.
    - `0` means the partition was computed on this run.

**Notes:**

- The first successful run does not reuse aggregation cache because nothing has been stored yet.
- Ratios such as 70 indicate the general result cache and not aggregation cache.

---

## What Gets Stored

When aggregation cache is enabled, OpenObserve writes intermediate results into disk as Arrow IPC files. These files store values that can be safely merged later instead of the full raw logs.

### Intermediate record batches
Each partition stores pre-computed aggregate values such as sums, counts, or array states.

### Schema example for AVG(x)
For a query that uses AVG(x), the cache does not store the average directly. It stores SUM(x) and COUNT(x) so that later queries can combine them accurately:
```
{
  "sum_x": 12345,
  "count_x": 678
}
```

On a later run, OpenObserve merges the sums and counts from cached partitions with newly computed ones and calculates the final average.

### Directory layout
Cached files are organized by stream, time partition, and query identifier. 
For example:
```
/cache/aggregation/<stream>/<partition>/<streaming_id>/
    part-0000.arrow
    part-0001.arrow
```

### Guarantee of accuracy
Because the cache stores mergeable components such as sums and counts, the results remain mathematically correct after combining cached and new partitions. This ensures that averages, sums, and counts always produce the same output as if the full query had been executed over raw logs.

---

## Performance benefits
Streaming Aggregation is enabled in all the following test runs:

**Test run 1**:

- Time range: `2025-08-13 00:00:00 - 2025-08-20 00:00:00`
- Time taken to load the dashboard: `6.84 s`
- `result_cache_ratio` is `0` in all partitions
![test run 1](test-run-one-agg-cache.png)


**Test run 2**:

- Time range: `2025-08-13 00:00:00 - 2025-08-20 00:00:00` 
- Time taken to load the dashboard: `3.00 s`
- `result_cache_ratio` is `100` in all partitions
![test run 2](test-run-two-agg-cache.png)

**Test run 3**:

- Time range: `2025-08-6 00:00:00 - 2025-08-20 00:00:00`
- Time taken to load the dashboard: `6.36 s`
- `result_cache_ratio` is `100` for partitions that cover the time range `2025-08-13 00:00:00 → 2025-08-20 00:00:00` and `result_cache_ratio` is `0` for the rest of the partitions 
![test run 3](test-run-three-agg-cache.png)

**Test run 4**: 

- Time range: `2025-08-6 00:00:00 - 2025-08-20 00:00:00` 
- Time taken to load the dashboard: `3.38 s`
- `result_cache_ratio` is `100` for all partitions 
![test run 4](test-run-four-agg-cache.png)

---

## Limitations

- Very complex queries may not be eligible for cache reuse yet. Examples include joins, nested subqueries, heavy window functions, and large unions
- The first run pays full computation cost to populate the cache
- Reuse depends on partition availability. Eviction due to capacity limits can reduce reuse.

--- 

## Troubleshooting

1. **Second run is not faster**

    - **Cause**: The query was not cacheable or the first run did not complete. 
    - **Fix**: Align time windows and filters with the first run. Verify `streaming_aggs` and `streaming_id`. After a successful first run, confirm `result_cache_ratio` equals `100` on some partitions.

2. **Different panels do not benefit**

    - **Cause**: Time windows or filters differ. 
    - **Fix**: Use the same windows and the same filters across panels that analyze the same stream.




