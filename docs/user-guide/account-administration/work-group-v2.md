---
description: Manage query performance in enterprise with Work Group settings—optimize CPU, memory, concurrency, and slot-based admission for queries in OpenObserve.
---

Work groups control how OpenObserve allocates CPU, memory, and concurrency for different types of search tasks. They help maintain consistent performance when multiple users and system processes run searches at the same time.

!!! note "Note"
    This feature is available in the Enterprise Edition.


## Overview
OpenObserve evaluates each search task and assigns it to a work group. Each group receives its own resource share and concurrency limits. When many tasks run at the same time, work groups prevent heavy tasks from slowing down interactive user queries.

OpenObserve uses three work groups:

- Short
- Long
- Background

!!! note "Note"
    Short and long groups manage user queries. The background group handles system tasks.

Work groups apply admission control at two levels:

- **Group-level admission**: Each group has a resource share and concurrency limits at the global, organization, and user level. Queries that exceed a limit wait in a first-in, first-out queue.
- **Node-level slot admission** (optional): When enabled, each query reserves resource slots on the querier nodes it runs on, so cluster capacity scales with the number of nodes, CPU, and memory. See [Slot-based distributed admission](#slot-based-distributed-admission).

## Background work group
The background work group handles system tasks that run independently of user activity. These tasks include:

- Alert evaluations
- Report generation
- Derived stream processing

The background group uses its own queue and resource limits. This ensures that system tasks do not interfere with user query performance.

!!! note "Note"
    On nodes that run in the `background` role group, the background work group is always allowed to use 100 percent of the node resources, regardless of `O2_WORK_GROUP_BACKGROUND_MAX_PERCENT`.

## Environment variables
Work groups rely on the following environment variables for resource management and concurrency limits.

### Query classification

| Environment variable      | Default | Description |
| ------------------------- | ------- | ----------- |
| `O2_WORK_GROUP_BASE_SPEED` | `1024`  | Assumed scan speed in megabytes per second. Used to estimate query execution time. |
| `O2_WORK_GROUP_BASE_SECS`  | `10`    | Time threshold in seconds. Queries with an estimated execution time above this threshold are classified as long queries. |

### Group resource shares

| Environment variable                  | Default | Description |
| ------------------------------------- | ------- | ----------- |
| `O2_WORK_GROUP_LONG_MAX_PERCENT`       | `0.4`   | Maximum share of CPU and memory the long group can use, as a fraction between 0 and 1. `0.4` means 40 percent. |
| `O2_WORK_GROUP_SHORT_MAX_PERCENT`      | `0.8`   | Maximum share of CPU and memory the short group can use. |
| `O2_WORK_GROUP_BACKGROUND_MAX_PERCENT` | `0.4`   | Maximum share of CPU and memory the background group can use. |

When slot-based admission is enabled, these shares also act as the slot budget for each group: a group may hold at most this fraction of total cluster slots.

### Concurrency limits

| Environment variable                        | Default | Description |
| ------------------------------------------- | ------- | ----------- |
| `O2_WORK_GROUP_LONG_MAX_CONCURRENCY`         | `5`     | Maximum concurrent long queries across the cluster. |
| `O2_WORK_GROUP_SHORT_MAX_CONCURRENCY`        | `10`    | Maximum concurrent short queries across the cluster. |
| `O2_WORK_GROUP_BACKGROUND_MAX_CONCURRENCY`   | `10`    | Maximum concurrent background tasks across the cluster. |
| `O2_WORK_GROUP_ORG_LONG_MAX_CONCURRENCY`     | `5`     | Maximum concurrent long queries per organization. |
| `O2_WORK_GROUP_ORG_SHORT_MAX_CONCURRENCY`    | `10`    | Maximum concurrent short queries per organization. |
| `O2_WORK_GROUP_USER_LONG_MAX_CONCURRENCY`    | `2`     | Maximum concurrent long queries per user. |
| `O2_WORK_GROUP_USER_SHORT_MAX_CONCURRENCY`   | `4`     | Maximum concurrent short queries per user. |

### Resource enforcement

| Environment variable             | Default | Description |
| -------------------------------- | ------- | ----------- |
| `O2_WORK_GROUP_CPU_LIMIT_ENABLED` | `false` | When `true`, both CPU and memory are limited per group. When `false`, only memory is limited. |
| `O2_WORK_GROUP_DYNAMIC_RESOURCE`  | `true`  | When `true`, the resources for each query shrink as more queries run in the same group. When `false`, each query receives the group's full resource share. |
| `ZO_FEATURE_QUERY_QUEUE_ENABLED`  | `true`  | Enables the search queue used by work groups. In local mode the queue runs in memory on the node itself. |

### Slot-based admission

| Environment variable                       | Default | Description |
| ------------------------------------------ | ------- | ----------- |
| `O2_WORK_GROUP_MAX_NODES_PER_QUERY`         | `0`     | Maximum number of querier nodes a single query may fan out to. `0` disables slot-based admission and uses all online querier nodes. |
| `O2_WORK_GROUP_NODE_SELECTION_STRATEGY`     | `all`   | Node selection strategy: `all`, `org`, or `stream`. |
| `O2_WORK_GROUP_SLOT_PER_NODE_CPU`           | `1`     | Number of CPU cores that one slot represents. |
| `O2_WORK_GROUP_SLOT_PER_NODE_MEM`           | `2048`  | MiB of memory that one slot represents. Must be greater than `256`. |
| `O2_WORK_GROUP_NODE_FACTOR`                 | `1.0`   | Node overcommit factor for slots. `1.0` means no overcommit. |
| `O2_WORK_GROUP_SHORT_PER_NODE_SLOTS`        | `1`     | Slots a short query consumes on each selected node. |
| `O2_WORK_GROUP_LONG_PER_NODE_SLOTS`         | `2`     | Slots a long query consumes on each selected node. |
| `O2_WORK_GROUP_BACKGROUND_PER_NODE_SLOTS`   | `1`     | Slots a background task consumes on each selected node. |
| `O2_WORK_GROUP_RESERVED_TTL_MS`             | `2000`  | Time to live in milliseconds for a slot reservation. If a query does not start before the TTL expires, the node releases the reserved slots automatically. |


## How OpenObserve assigns queries to work groups
Background tasks such as alert evaluations and report generation always go to the background group. For user queries, OpenObserve estimates the execution time and assigns the query to the short or long group based on the expected cost.

The estimation uses the following values:

- `O2_WORK_GROUP_BASE_SPEED = 1024` defines the assumed scan speed in megabytes per second, which is about one gigabyte per second.
- `O2_WORK_GROUP_BASE_SECS = 10` defines the time threshold for classification. Queries that exceed this threshold are long queries.
- The total CPU cores across all querier nodes.
- The `scan_size` of the search request.

OpenObserve uses the following logic:

```rust linenums="1"
let cpu_cores = max(1, CLUSTER_TOTAL_CPU_CORES * O2_WORK_GROUP_SHORT_MAX_PERCENT);
let predict_secs = scan_size / O2_WORK_GROUP_BASE_SPEED / cpu_cores;
if predict_secs > O2_WORK_GROUP_BASE_SECS {
    // this is a long query
} else {
    // this is a short query
}
```

- The predicted time is the scan size divided by `O2_WORK_GROUP_BASE_SPEED` and then divided by the CPU cores available to the short group.
- If the predicted time is greater than the value of `O2_WORK_GROUP_BASE_SECS`, the request is a long query.
- Otherwise, it is a short query.

### Classification example

Cluster example:

- Ten querier nodes
- Sixteen CPU cores and sixty-four gigabytes of memory per node
- Total CPU cores for queries: one hundred sixty
- With `O2_WORK_GROUP_SHORT_MAX_PERCENT = 0.8`, the short group can use one hundred twenty-eight cores.

**Short query example**:

- Scan size: one hundred gigabytes
- Base speed: one gigabyte per second
- CPU for the short group: one hundred twenty-eight cores

**Estimated time**: `100GB / 1GB per second / 128 cores = 0.8 seconds`
<br>
**Threshold**: `O2_WORK_GROUP_BASE_SECS = 10`
<br>
**Result**: This is a short query.

<br>
**Long query example**:

- Scan size: two terabytes
- Base speed: one gigabyte per second
- CPU for the short group: one hundred twenty-eight cores

**Estimated time**: `2048GB / 1GB per second / 128 cores = 16 seconds`
<br>
**Result**: This is a long query.


## Concurrency control: global, organization, and user
Before a query starts, OpenObserve checks the concurrency limits of its work group at three levels:

- **Global**: total concurrent queries in the group across the cluster, controlled by `O2_WORK_GROUP_x_MAX_CONCURRENCY`.
- **Organization**: concurrent queries in the group for one organization, controlled by `O2_WORK_GROUP_ORG_x_MAX_CONCURRENCY`.
- **User**: concurrent queries in the group for one user, controlled by `O2_WORK_GROUP_USER_x_MAX_CONCURRENCY`.

If any level is at its limit, the query waits in the group queue and runs in first-in, first-out order when capacity frees up. Background tasks only check the global limit; organization and user limits do not apply to them.

**Example**:

- The short group allows ten concurrent short queries through `O2_WORK_GROUP_SHORT_MAX_CONCURRENCY = 10`.
- One user can run only four short queries at the same time through `O2_WORK_GROUP_USER_SHORT_MAX_CONCURRENCY = 4`.
- If the same user sends more than four short queries, the extra queries wait in the queue even if global capacity is available.


## Resource allocation within a group
Each group's `O2_WORK_GROUP_x_MAX_PERCENT` defines the share of CPU and memory available to its queries. The memory share applies to the `DataFusion` memory pool. The CPU share is enforced only when `O2_WORK_GROUP_CPU_LIMIT_ENABLED = true`; otherwise only memory is limited.

How the share is divided among queries depends on `O2_WORK_GROUP_DYNAMIC_RESOURCE`:

- When `true` (default), the group's share is divided among the queries currently running in the group. Each query receives at least `O2_WORK_GROUP_x_MAX_PERCENT / O2_WORK_GROUP_x_MAX_CONCURRENCY`.
- When `false`, each query receives the group's full share.

!!! note "Example"

    - If total system memory is `10GB` and DataFusion can use `50%`, DataFusion has `5GB`.
    - If the long group has `O2_WORK_GROUP_LONG_MAX_PERCENT = 0.4`, it can use `2GB`.
    - With `O2_WORK_GROUP_LONG_MAX_CONCURRENCY = 5`, each long query is guaranteed at least `0.4GB` of memory, and receives more when fewer long queries are running.


## Slot-based distributed admission
Fixed concurrency limits do not scale automatically when you add querier nodes: capacity stays capped by `MAX_CONCURRENCY`, and a single query may fan out to every node in the cluster, so adding nodes improves single-query latency more than overall concurrency. Slot-based admission solves this by limiting the fanout of each query and admitting queries based on resource slots, so cluster capacity grows with the number of nodes, CPU, and memory.

To enable slot-based admission, set `O2_WORK_GROUP_MAX_NODES_PER_QUERY` to a value greater than `0`. With the default value `0`, OpenObserve keeps the existing behavior: every query uses all online querier nodes.

### Slot model
A slot represents a fixed amount of CPU and memory, defined by `O2_WORK_GROUP_SLOT_PER_NODE_CPU` and `O2_WORK_GROUP_SLOT_PER_NODE_MEM`. With the defaults, one slot represents one CPU core and two gigabytes of memory.

Each querier node computes its total slots at startup from its own CPU and memory:

```text
cpu_slots   = floor(node_cpu_cores / O2_WORK_GROUP_SLOT_PER_NODE_CPU)
mem_slots   = floor(node_memory_mib / O2_WORK_GROUP_SLOT_PER_NODE_MEM)
total_slots = floor(min(cpu_slots, mem_slots) * O2_WORK_GROUP_NODE_FACTOR)
```

Using the minimum of CPU slots and memory slots ensures both resources constrain capacity. Set `O2_WORK_GROUP_NODE_FACTOR` above `1.0` to allow controlled overcommit.

**Example**: A node with sixteen CPU cores and sixty-four gigabytes of memory has `cpu_slots = 16` and `mem_slots = 32`, so `total_slots = 16`.

### Per-query slot demand
A query consumes a fixed number of slots on each node it runs on, defined per work group by `O2_WORK_GROUP_x_PER_NODE_SLOTS`. The total demand of a query is:

```text
query_total_slots = selected_nodes * O2_WORK_GROUP_x_PER_NODE_SLOTS
```

where `selected_nodes` is at most `O2_WORK_GROUP_MAX_NODES_PER_QUERY`.

### Group slot budget
With slot-based admission, `O2_WORK_GROUP_x_MAX_PERCENT` acts as the slot budget for each group:

```text
group_slot_limit = floor(cluster_total_slots * O2_WORK_GROUP_x_MAX_PERCENT)
```

A query passes group-level admission only if the slots currently held by its group plus its own demand stay within the group budget. This preserves the isolation between short, long, and background, so one query class cannot consume all cluster resources. Keep the sum of all group shares at or below `1.0` for strict isolation.

### Node selection strategy
`O2_WORK_GROUP_NODE_SELECTION_STRATEGY` controls which querier nodes a query runs on:

- `all`: Every query uses all online querier nodes. This is the default and matches the previous behavior.
- `org`: Queries from the same organization run on a stable group of nodes selected by a consistent hash of the organization ID.
- `stream`: Queries on the same stream run on a stable group of nodes selected by a consistent hash of the organization ID, stream type, and stream name.

The `org` and `stream` strategies keep queries for the same data on the same nodes, which improves cache reuse and reduces duplicate caching and object storage requests. If fewer nodes are online than `O2_WORK_GROUP_MAX_NODES_PER_QUERY`, the query uses all available nodes.

### Admission flow
When slot-based admission is enabled, a query goes through the following steps:

1. The node that receives the request classifies the query into a work group and selects target nodes using the configured node selection strategy.
2. The query passes group-level admission against the group slot budget. If the budget is insufficient, the query waits in the group queue in first-in, first-out order and is woken up when slots are released.
3. The leader node sends slot reservation requests to all selected nodes in parallel. Each reservation is held for `O2_WORK_GROUP_RESERVED_TTL_MS` milliseconds.
4. If all nodes accept, the query starts and the reservations switch to running.
5. If any node rejects, the leader releases all reservations from this attempt and retries with a short backoff, starting at twenty milliseconds and capped at five hundred milliseconds, until the request timeout is reached.
6. When the query completes, each node releases its own slots. Reservations that never start are reclaimed automatically when their TTL expires, so node restarts and failures cannot leak slots.

### Capacity planning
When workloads are roughly homogeneous, the sustainable concurrency of a group can be estimated as:

```text
max_concurrent_queries ~= group_slot_limit / (selected_nodes * per_node_slots)
```

**Example**: A cluster with ten querier nodes, each with sixteen slots, has one hundred sixty total slots. With `O2_WORK_GROUP_MAX_NODES_PER_QUERY = 3`:

- Short queries consume `3 nodes * 1 slot = 3` slots each. With a short budget of `0.8 * 160 = 128` slots, about forty-two short queries can run at the same time.
- Long queries consume `3 nodes * 2 slots = 6` slots each. With a long budget of `0.4 * 160 = 64` slots, about ten long queries can run at the same time.

Doubling the number of nodes doubles the total slots, so capacity scales with the cluster instead of being capped by a fixed concurrency number. This is a planning estimate, not a hard guarantee; actual capacity also depends on cache hit ratio, object storage throughput, and query shape.


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
If the number of requests exceeds the value of `O2_WORK_GROUP_LONG_MAX_CONCURRENCY`, the extra requests wait in the queue.
