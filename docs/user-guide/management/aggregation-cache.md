---
title: Streaming Aggregation in OpenObserv
description: Learn how Streaming Aggregation accelerates dashboards using aggregation cache in OpenObserve Enterprise.
---
This document helps you understand what Streaming Aggregation is and how it relates to aggregation cache in OpenObserve.

## What is Streaming Aggregation
Streaming Aggregation is an Enterprise setting in OpenObserve that enables aggregation cache.

!!! note "Who can use it"
    All Enterprise users. 

!!! note "Where to find it"
    To enable aggregation cache: 

    1. Go to **Management > General Settings**.  
    2. Turn on the **Enable Streaming Aggregation** toggle.
    3. Select **Save**.

## What is Aggregation Cache
Aggregation cache accelerates aggregation queries by saving results for each time partition when a dashboard panel runs. When a panel later requests the same or overlapping time range with the same stream and filters, OpenObserve reuses the saved partitions and computes only the missing partitions. Results remain correct because the system combines partition results using safe math such as adding sums and counts before computing an average.

## How Aggregation Cache works
This section explains what happens at query time. Aggregation cache stores mergeable results per time partition on the first run, then reuses matching partitions on later runs that use the same stream, filters, and grouping over the same or overlapping time range.

### First run populates the cache

1. A panel sends an aggregation query for a selected time range.
2. OpenObserve analyzes the query to decide whether it is eligible for aggregation cache. 
3. OpenObserve splits the requested range into time partitions. The system selects the partition size automatically.
4. For each partition, OpenObserve computes values that can be merged later. Examples include sum, count, minimum, maximum, and histogram bucket counts.
5. OpenObserve writes those per‑partition results to cache in memory and on disk.
6. OpenObserve merges all partition results to produce the final answer and returns it to the panel.
7. The response metadata confirms eligibility and reports cache identifiers. 

> See [How to verify caching in the product](#how-to-verify-caching-in-the-product).

### Later run reuses the cache

1. A panel sends an aggregation query with the same stream and the same filters. The time range can be the same or can overlap.
2. OpenObserve looks up partitions that match the new request.
3. For matching partitions, OpenObserve reads saved results from cache.
4. For missing partitions, OpenObserve computes new results.
5. OpenObserve merges saved results with new results and returns the final answer.
6. The response metadata shows which partitions came from aggregation cache. The ratio is one hundred for reused partitions and zero for computed partitions.

> See [How to verify caching in the product](#how-to-verify-caching-in-the-product).


### What must match for reuse

- Stream
- Filters
- Grouping or bucketing choices
- Time partitions that are fully inside the requested range

If these do not match, OpenObserve computes the partitions again and then saves them for future reuse.


## What can be cached
- Supported aggregate functions for cache reuse:
`min`, `max`, `avg`, `sum`, `count`, `median`, `array_agg`, `percentile_cont`, `summary_percentile`, `first_value`, `last_value`, `approx_distinct`, `approx_median`, `approx_percentile_cont`, `approx_percentile_cont_with_weight`, `approx_topk`, `approx_topk_distinct`.
- After the first run, if `streaming_aggs` is true and `streaming_id` has a value, the query is eligible for caching. You can check these fields in the query response by using your browser developer tools. Open **Network**, select the `_search_partition` entry, and view the **Preview** or **Response** tab to confirm the values.

## How to verify caching in the product

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

## Performance benefits
Streaming Aggregation is enabled in all the following test runs:

**Test Run 1**:

- Time range: `2025-08-13 00:00:00 - 2025-08-20 00:00:00`
- Time taken to load the dashboard: `6.84 s`
- `result_cache_ratio` is `0` in all partitions
![test run 1](test-run-one-agg-cache.png)


**Test Run 2**:

- Time range: `2025-08-13 00:00:00 - 2025-08-20 00:00:00` 
- Time taken to load the dashboard: `3.00 s`
- `result_cache_ratio` is `100` in all partitions
![test run 2](test-run-two-agg-cache.png)

**Test Run 3**:

- Time range: `2025-08-6 00:00:00 - 2025-08-20 00:00:00`
- Time taken to load the dashboard: `6.36 s`
- `result_cache_ratio` is `100` for partitions that cover the time range `2025-08-13 00:00:00 → 2025-08-20 00:00:00` and `result_cache_ratio` is `0` for the rest of the partitions 
![test run 3](test-run-three-agg-cache.png)

**Test Run 4**: 

- Time range: `2025-08-6 00:00:00 - 2025-08-20 00:00:00` 
- Time taken to load the dashboard: `3.38 s`
- `result_cache_ratio` is `100` for all partitions 
![test run 4](test-run-four-agg-cache.png)


## Limitations

- Very complex queries may not be eligible for cache reuse yet. Examples include joins, nested subqueries, heavy window functions, and large unions
- The first run pays full computation cost to populate the cache
- Reuse depends on partition availability. Eviction due to capacity limits can reduce reuse.

## Troubleshooting

1. **Second run is not faster**

    - **Cause**: The query was not cacheable or the first run did not complete. 
    - **Fix**: Align time windows and filters with the first run. Verify `streaming_aggs` and `streaming_id`. After a successful first run, confirm `result_cache_ratio` equals `100` on some partitions.

2. **Different panels do not benefit**

    - **Cause**: Time windows or filters differ. 
    - **Fix**: Use the same windows and the same filters across panels that analyze the same stream.




