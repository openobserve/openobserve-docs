> `Applicable to enterprise version`

## All the ENV

```
ZO_FEATURE_QUERY_QUEUE_ENABLED = true

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

### How it works

1. Allocate resources based on whether it's a short or long query.
2. Define two resource groups with 3 environments to limit the resource on each querier node:
    - `O2_SEARCH_GROUP_x_MAX_CPU`, should be a percentage of the total CPU cores.
    - `O2_SEARCH_GROUP_x_MAX_MEMORY`, should be a percentage of the total `Datafusion` memory.
    - `O2_SEARCH_GROUP_x_MAX_CONCURRENCY`, should be a fixed number, minimal `1`. 
    1. Long query group
        - `O2_SEARCH_GROUP_LONG_MAX_CPU = 80%`
        - `O2_SEARCH_GROUP_LONG_MAX_MEMORY = 80%`
        - `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 2`
    2. Short query group
        - `O2_SEARCH_GROUP_SHORT_MAX_CPU = 20%`
        - `O2_SEARCH_GROUP_SHORT_MAX_MEMORY = 20%`
        - `O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY = 4`
3. The amount of available memory for per query request equals to `O2_SEARCH_GROUP_x_MAX_MEMORY / O2_SEARCH_GROUP_x_MAX_CONCURRENCY`. For example, if total system memory is `10GB` then Datafusion allow to use `50%`, which amounts to `5GB`; therefore, long-query groups have access to `80%` equating to `4GB` and supporting `2` concurrent processes means each search request can use up to `2GB` of RAM.
4. The search request will always use all of the CPU cores in its group.
5. Search requests exceeding concurrency limits will be queued and executed in FIFO order.

### User Quota-Based Resource Management

On top of global resource management settings, we also have user quota-based design elements. For example:

- `O2_SEARCH_GROUP_USER_LONG_MAX_CONCURRENCY = 1`
- `O2_SEARCH_GROUP_USER_SHORT_MAX_CONCURRENCY = 2`

Even we allow to run `4` short queries in concurrent, but for same user only allow to run `2` short queries, if the user has over `2` request in concurrent then the exceeding request need wait into queue.

### How to calculate whether the search request is a long query or a short query?

- We assume the search speed is `1GB`, `O2_SEARCH_GROUP_BASE_SPEED=1024`, this is configurable. 
- We assume greater than `10s` is a long query, `O2_SEARCH_GROUP_BASE_SECS=10`, this is configurable.
- We know the total CPU cores of the queries in the cluster.  
- We also know the `scan_size` of a search request, and then we can calculate the predicted seconds:

```rust
let cpu_cores = max(2, CLUSTER_TOTAL_CPU_CORES * O2_SEARCH_GROUP_SHORT_MAX_CPU);
let predict_secs = scan_size / O2_SEARCH_GROUP_BASE_SPEED / cpu_cores;
if predict_secs > O2_SEARCH_GROUP_BASE_SECS {
    // this is a long query
} else {
    // this is a short query
}
```

## How to decide Long or Short query

- we have 10 querier, each node have 16 CPU cores and 64GB. then we have 160 CPU cores in the cluster for query.
- then we can use 128 (80%  set using O2_SEARCH_GROUP_LONG_MAX_CPU ) CPU cores for long term query.
- then we can use 32 (20% set using O2_SEARCH_GROUP_SHORT_MAX_CPU ) CPU cores for short term query.

### Short query

We fire a query and we know that the scan_size is 100GB, then 100GB / 1GB (base_speed set using O2_SEARCH_GROUP_BASE_SPEED) / 32 CPU cores = `3s`, and the base_secs (set using O2_SEARCH_GROUP_BASE_SECS) is `10s`, so we decide this is a **short query**.

### Long query

We fire a query and we know that the scan_size is 1TB, then 1024GB / 1GB (base_speed) / 32 CPU cores = `31s`, and the base_secs is `10s`, so we decide this is a **long query**.


## How to decide the MAX_CONCURRENCY

This is based on your resource and the response time that you expect.

For example. We have 160 CPU cores and we assume the search speed is 1GB/core/secs, then we know if we want to search 1TB data, it need 1024GB / 1GB / 160 CPU = `6.4s`, but this is for single request. 

If you want to support two requests processing in parallel, then each request can use 50% resource it means only 80 CPU cores, then concurrent 2 requests and both search for 1TB data, each request will response in 1024GB / 1GB / 80 CPU = `12.8s`.

If you set the `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 4`, then it will be:

- when there is only one request, actually it can use all the CPU cores, the response time is `6.4s`
- when there are 2 concurrent requests, each request can use 50% CPU cores, the response time is `12.8s`
- when there are 4 concurrent requests, each request can use 25% CPU cores, the response time is `25.6s`
- when there are 5 concurrent requests, each request can use 25% CPU cores, the response time is `25.6s`, and the 5 request need wait in long term queue.

If you set the `O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY = 10`, then it will be:

- when there is only one request, actually it can use all the CPU cores, the response time is `6.4s`
- when there are 2 concurrent requests, each request can use 50% CPU cores, the response time is `12.8s`
- when there are 4 concurrent requests, each request can use 25% CPU cores, the response time is `25.6s`
- when there are 10 concurrent requests, each request can use 10% CPU cores, the response time is `64s`
- when there are 11 concurrent requests, each request can use 10% CPU cores, the response time is `64s`, and the 11 request need wait in long term queue.
