## Overview
Previously, when a query was executed, the system used gRPC calls to check whether other nodes in the cluster already had cached results for that query. This required distributed coordination across all nodes.<br>
OpenObserve now implements a local result caching system that improves query performance by storing query results on the same node where the query is executed. The caching system relies on **consistent hashing**, which ensures that identical queries are always routed to the same node. This deterministic routing enables each node to maintain and reuse its own cached results without requiring cross-node communication. <br>
The local cache reduces network overhead, improves response times, and ensures stable query performance across large deployments.

## How result cache works

### Query routing and cache locality
OpenObserve uses consistent hashing to route each query to a specific node.
Consistent hashing is a distributed hashing technique that assigns queries to nodes based on a hash value generated from the query text, time range, and other parameters. This guarantees that the same query always lands on the same node.
Because of this routing behavior:

- Each node stores and retrieves its own cache.
- There is no need to query other nodes for cached data.
- Cache lookups are faster and more predictable.

## Cache operations
The result cache is stored locally on each node and managed through a read-write mechanism that maintains accuracy and performance.

### Write logic
When query results are written to the cache, the following checks are applied to maintain data quality:

1. Remove incomplete histogram records: Any record that does not contain complete data for the time interval is discarded.
2. Exclude recent data: Records newer than `ZO_CACHE_DELAY_SECS` (default is `300`s) are not cached. This prevents incomplete or in-progress data from being stored.
3. Skip invalid cache files: Empty cache files or files covering less than `300` seconds of data are not saved.
This write logic ensures that only stable and complete query results are cached.

### Read logic
When a query is executed, the node performs the following steps:

1. Finds all cache files belonging to the same query.
2. Selects the most appropriate file based on time range and histogram alignment.
3. If multiple cache files are allowed (which is configured using `ZO_USE_MULTIPLE_RESULT_CACHE`), retrieves all matching files and merges the results.
4. Generates a new query time range based on existing cache results.

    - The system checks which parts of the requested time range already exist in cache and which do not.
    - It executes a new query only for the uncached portion of the time range.
    - The newly retrieved data is then merged with the cached data.
    - The merged dataset is filtered to include records within the full query time range, then sorted and deduplicated before returning the output. <br>
    Example: <br>
    If a user queries data for 9 AM to 11 AM and cache files are available for 9 AM to 10 AM, OpenObserve will query only the missing 10 AM to 11 AM data. It then merges this new result with the cached 9 AM to 10 AM data and returns the combined dataset to the user.
    The resulting dataset is then returned as the query output.

## Cache invalidation
Cache invalidation ensures that query results remain accurate when underlying data changes. <br>
In OpenObserve, cache retrieval is handled locally by each node, but cache invalidation must still be coordinated across all nodes to maintain consistency. This is done using a dedicated background mechanism that relies on the `delete_result_cache` RPC. The `delete_result_cache` RPC is a remote procedure call (RPC) endpoint that allows nodes in the OpenObserve cluster to coordinate cache invalidation.

## Configuration
| Variable            | Default | Description                                                                                                                                                    |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZO_CACHE_DELAY_SECS | 300     | Defines the delay window in seconds before recent query results are eligible for caching. This prevents caching of incomplete data that may still be changing. |