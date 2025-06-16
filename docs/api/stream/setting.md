## Set or Update Stream Settings

You can configure settings for a stream at creation time or update them later. Use the same endpoint with different HTTP methods depending on the operation.

## Create Stream Settings

Use this operation to define stream settings when creating a stream.

### Endpoint
```
POST /api/{org_id}/streams/{stream_name}/settings
```
### Request Body

Use the `StreamSettings` schema. All fields are optional.

```json
{
  "partition_time_level": "day",
  "partition_keys": ["k8s_cluster", "k8s_namespace_name"],
  "index_fields": ["k8s_pod_name", "service_name"],
  "full_text_search_keys": ["body"],
  "bloom_filter_fields": ["trace_id"],
  "data_retention": 30,
  "flatten_level": 1,
  "defined_schema_fields": ["severity", "log_file_path"],
  "max_query_range": 168,
  "store_original_data": true,
  "approx_partition": false,
  "extended_retention_days": [],
  "index_original_data": false,
  "index_all_values": false
}
```
### Response
```
{
  "code": 200
}
```

## Update Stream Settings
Use this operation to partially update an existing stream’s settings.

### Endpoint

```
PUT /api/{org_id}/streams/{stream_name}/settings
```
### Request Body

Use the `UpdateStreamSettings` schema. Fields that support `add`, `remove`, or `set` use wrapper syntax.

```
{
  "data_retention": 120,
  "max_query_range": 30,
  "extended_retention_days": {
    "add": [
      {
        "start": "2025-06-16T00:00:00Z",
        "end": "2026-02-21T00:00:00Z"
      }
    ]
  }
}
```
### Response
```
{
  "code": 200
}
```

## Field Description

| Field name                | Description |
|---------------------------|-------------|
| `partition_time_level`    | Sets time-based partition granularity: `hour`, `day`, or `month`. Default is `hour` for logs and `day` for metrics. |
| `partition_keys`          | Additional fields used to partition data folders. Improves query performance for filtered fields. Use low to medium cardinality fields. |
| `full_text_search_keys`   | Fields to tokenize for full-text search. Required for `match_all` or substring queries. Defaults to common log message field names if unset. |
| `index_fields`            | Fields to enable exact-match indexing. Improves `field = value` query speed. Use selectively to avoid index bloat. |
| `bloom_filter_fields`     | Fields to apply bloom filters. Optimizes rare value lookups. Best for high-cardinality identifiers like `trace_id`. |
| `data_retention`          | Number of days to retain stream data. Overrides global retention. Minimum allowed is 3 days. |
| `flatten_level`           | Defines how many JSON levels to flatten. `0` flattens all levels. Controls field explosion in nested logs. |
| `defined_schema_fields`   | Fields explicitly included in the user-defined schema. Others are dropped or stored raw. Reduces schema and index size. |
| `max_query_range`         | Limits the maximum query window in hours. Prevents overly large queries from affecting performance. |
| `store_original_data`     | Retains the original log body for dropped fields. Enables viewing but not searching unless `index_original_data` is enabled. |
| `approx_partition`        | Enables uniform time slicing for query execution. Improves parallelism for skewed data distributions. |
| `extended_retention_days` | Defines time ranges to retain data beyond standard retention. Must be configured before data expires. |
| `index_original_data`     | Indexes the raw log body for full-text search. Allows search across fields not defined in the schema. |
| `index_all_values`        | Indexes all fields for exact-match search. Increases ingestion cost. Best for small, stable schemas. |
| `distinct_value_fields`   | Maintains summaries of distinct field values. Powers UI filter suggestions and value lookups. |


