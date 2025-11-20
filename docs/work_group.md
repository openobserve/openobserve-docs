---
description: Manage query performance in enterprise with Work Group settings—optimize CPU, memory, and concurrency for long and short queries in OpenObserve streams.
---

Work groups control how OpenObserve allocates CPU, memory, and concurrency for different types of search tasks. They help maintain consistent performance when multiple users and system processes run searches at the same time. 

!!! note "Note"
    This feature is available in the Enterprise Edition.


## Overview
OpenObserve evaluates each search task and assigns it to a work group. Each group receives its own limits for CPU, memory, and concurrency. When many tasks run at the same time, work groups prevent heavy tasks from slowing down interactive user queries.

OpenObserve uses three work groups:

- Short
- Long
- Background

!!! note "Note"
    Short and long groups manage user queries. The background group handles system tasks.

## Background work group
The background work group handles system tasks that run independently of user activity. These tasks include:

- Alert evaluations
- Report generation
- Derived stream processing

The background group uses its own queue and resource limits. This ensures that system tasks do not interfere with user query performance.


## Environment variables
Work groups rely on the following environment variables for resource management and concurrency limits.

```ini
ZO_FEATURE_QUERY_QUEUE_ENABLED = false

O2_SEARCH_GROUP_BASE_SPEED = 1024 // MB
O2_SEARCH_GROUP_BASE_SECS = 10 // seconds

O2_SEARCH_GROUP_CPU_LIMIT_ENABLED = false
O2_SEARCH_GROUP_DYNAMIC_RESOURCE = true

O2_SEARCH_GROUP_LONG_MAX_CPU = 80%
O2_SEARCH_GROUP_LONG_MAX_MEMORY = 80%
O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 2

O2_SEARCH_GROUP_SHORT_MAX_CPU = 20%
O2_SEARCH_GROUP_SHORT_MAX_MEMORY = 20%
O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY = 4

O2_SEARCH_GROUP_USER_LONG_MAX_CONCURRENCY = 1
O2_SEARCH_GROUP_USER_SHORT_MAX_CONCURRENCY = 2
```
These variables define how much CPU and memory each group can use and how many queries each group can run at the same time.


### How OpenObserve assigns queries to work groups
OpenObserve estimates the execution time for each query and assigns it to the short or long work group based on the expected cost. 

The estimation uses the following values:

- Allocate resources based on whether the query is short or long.
- Define two resource groups with 3 environments to limit the resource on each querier node:

    - `O2_SEARCH_GROUP_x_MAX_CPU`, should be a percentage of the total CPU cores.
    - `O2_SEARCH_GROUP_x_MAX_MEMORY`, should be a percentage of the total `Datafusion` memory.
    - `O2_SEARCH_GROUP_x_MAX_CONCURRENCY`, should be a fixed number, minimal `1`. 

    - Long query group:

        - `O2_SEARCH_GROUP_LONG_MAX_CPU = 80%`
        - `O2_SEARCH_GROUP_LONG_MAX_MEMORY = 80%`
        - `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 2`

    - Short query group:

        - `O2_SEARCH_GROUP_SHORT_MAX_CPU = 20%`
        - `O2_SEARCH_GROUP_SHORT_MAX_MEMORY = 20%`
        - `O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY = 4`

- The amount of memory available to a single search request in a group equals: `O2_SEARCH_GROUP_x_MAX_MEMORY / O2_SEARCH_GROUP_x_MAX_CONCURRENCY`

!!! note "Example" 

    - If total system memory is `10GB` then Datafusion can use `50%`, DataFusion has `5GB`.  
    - If the long group has `O2_SEARCH_GROUP_LONG_MAX_MEMORY = 80%`, it can use `4GB`. 
    - With `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 2`, each long query can use up to `2GB` of memory.

- A search request uses all CPU cores assigned to its work group as defined by `O2_SEARCH_GROUP_x_MAX_CPU`.
- When a search request exceeds the concurrency defined by `O2_SEARCH_GROUP_x_MAX_CONCURRENCY`, it is placed in a queue and executed later in first-in, first-out order.



###  User quota-based resource management

OpenObserve applies per-user quotas inside each work group. These limits prevent a single user from using all group concurrency.

- `O2_SEARCH_GROUP_USER_LONG_MAX_CONCURRENCY = 1`
- `O2_SEARCH_GROUP_USER_SHORT_MAX_CONCURRENCY = 2`

**Example**:

- Short group allows four concurrent short queries through `O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY = 4`.
- One user can run only two short queries at the same time.
- If the same user sends more than two short queries, the extra queries wait in the queue even if global capacity is available.

### How to calculate whether a search request is a long query or a short query
OpenObserve uses base speed and base seconds to estimate the expected execution time.

- `O2_SEARCH_GROUP_BASE_SPEED = 1024` defines the assumed scan speed in megabytes per second, which is about one gigabyte per second.
- `O2_SEARCH_GROUP_BASE_SECS = 10` defines the time threshold for classification. Queries that exceed this threshold are long queries.
- The system knows the total CPU cores across querier nodes.
- The system knows the `scan_size` of the search request.

OpenObserve uses the following logic:

```rust linenums="1"
let cpu_cores = max(2, CLUSTER_TOTAL_CPU_CORES * O2_SEARCH_GROUP_SHORT_MAX_CPU);
let predict_secs = scan_size / O2_SEARCH_GROUP_BASE_SPEED / cpu_cores;
if predict_secs > O2_SEARCH_GROUP_BASE_SECS {
    // this is a long query
} else {
    // this is a short query
}
```

- The predicted time is the scan size divided by `O2_SEARCH_GROUP_BASE_SPEED` and then divided by the number of CPU cores used for the calculation.
- If the predicted time is greater than the value of `O2_SEARCH_GROUP_BASE_SECS`, the request is a long query.
- Otherwise, it is a short query.


## How to decide long or short query: example

Cluster example:

- Ten querier nodes
- Sixteen CPU cores and sixty-four gigabytes of memory per node
- Total CPU cores for queries: one hundred sixty

From the environment variables:

- Long queries use eighty percent of available CPU cores, which is one hundred twenty-eight cores.
- Short queries use twenty percent of available CPU cores, which is thirty-two cores.


**Short query example**:

- Scan size: one hundred gigabytes
- Base speed: one gigabyte per second
- CPU for short queries: thirty-two cores


**Estimated time**: `100GB / 1GB per second / 32 cores = 3 seconds`
<br>
**Threshold**: `O2_SEARCH_GROUP_BASE_SECS = 10`
<br>
**Result**: This is a short query.

<br>
**Long query example**

- Scan size: one terabyte
- Base speed: one gigabyte per second
- CPU for short queries: thirty-two cores


**Estimated time**: `1024GB / 1GB per second / 32 cores = 31 seconds`
<br>
**Result**: This is a long query.


## How to decide the maximum concurrency
Concurrency determines how many queries are allowed to run at the same time in each group. Increasing concurrency increases parallelism but also increases the response time for each task.


Cluster example:

- Total CPU cores: one hundred sixty
- Scan size: one terabyte
- Base speed: one gigabyte per second


**Single request**: 
<br>
`1024GB / 1GB per second / 160 cores = 6.4 seconds`
<br><br>
**Two parallel requests**
<br>
Each request receives eighty cores:
<br>
`1024GB / 1GB per second / 80 cores = 12.8 seconds`
<br><br>
**Four parallel requests**
<br>
Each request receives forty cores:
<br>
`1024GB / 1GB per second / 40 cores = 25.6 seconds`
<br><br>
**Ten parallel requests**
<br>
Each request receives sixteen cores:
<br>
`1024GB / 1GB per second / 16 cores = 64 seconds`
<br>
If the number of requests exceeds the value of `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY`, the extra requests wait in the queue.