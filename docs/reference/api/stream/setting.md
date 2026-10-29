---
title: Settings
description: Create or update OpenObserve stream settings via API. Configure partitions, index fields, full-text search keys, retention, and more.
---

## Set or Update Stream Settings

You can configure settings for a stream when you create it (`POST /api/{org_id}/streams/{stream_name}`) or update them later (`PUT /api/{org_id}/streams/{stream_name}/settings`). There is no `POST` on the `/settings` path.

## Create a stream with settings

Use this operation to create a stream and define its settings in one call.

### Endpoint
```
POST /api/{org_id}/streams/{stream_name}?type=logs
```
`type` is `logs` (default), `metrics` or `traces`.

### Request Body

The body has two keys: `fields` (the initial schema, each with `name` and `type`) and `settings` (the `StreamSettings` schema; every setting is optional). In `settings`, `partition_keys` is a list of objects.

```json
{
  "fields": [
    { "name": "k8s_cluster", "type": "Utf8" },
    { "name": "k8s_pod_name", "type": "Utf8" }
  ],
  "settings": {
    "partition_keys": [
      { "field": "k8s_cluster", "types": "value" },
      { "field": "k8s_namespace_name", "types": { "hash": 32 } }
    ],
    "index_fields": ["k8s_pod_name", "k8s_container_name"],
    "full_text_search_keys": ["body"],
    "bloom_filter_fields": ["k8s_node_name"],
    "data_retention": 30,
    "flatten_level": 1,
    "defined_schema_fields": [
      "body",
      "k8s_cluster",
      "k8s_pod_name",
      "service_name",
      "severity"
    ],
    "max_query_range": 30,
    "store_original_data": true,
    "approx_partition": false,
    "extended_retention_days": [],
    "index_original_data": false,
    "index_all_values": false,
    "storage_type": "compliance"
  }
}
```

## Update Stream Settings
Use this operation to partially update an existing stream's settings.

### Endpoint

```
PUT /api/{org_id}/streams/{stream_name}/settings?type=logs
```
### Request Body

Use the `UpdateStreamSettings` schema. Only the fields you send are changed.

- List fields (`partition_keys`, `full_text_search_keys`, `index_fields`, `bloom_filter_fields`, `defined_schema_fields`, `distinct_value_fields`, `extended_retention_days`) take a wrapper object with `add` and/or `remove` arrays. There is no `set`: to replace a list, `remove` the old values and `add` the new ones.
- Scalar fields (`data_retention`, `flatten_level`, `max_query_range`, `store_original_data`, `approx_partition`, `index_original_data`, `index_all_values`, `storage_type`, …) take the plain new value.

```json
{
  "partition_keys": {
    "add": [{ "field": "k8s_cluster", "types": "value" }]
  },
  "full_text_search_keys": {
    "add": ["body"]
  },
  "index_fields": {
    "add": ["k8s_pod_name"],
    "remove": ["k8s_container_name"]
  },
  "bloom_filter_fields": {
    "add": ["k8s_node_name"]
  },
  "data_retention": 30,
  "flatten_level": 1,
  "defined_schema_fields": {
    "add": ["service_version"]
  },
  "max_query_range": 120,
  "store_original_data": true,
  "approx_partition": false,
  "extended_retention_days": {
    "add": [{ "start": 1748736000000000, "end": 1751241600000000 }]
  },
  "index_original_data": false,
  "index_all_values": false,
  "storage_type": "compliance"
}

```

### Response
```
{
  "code": 200
}
```

## Field Description
### StreamSettings Field Reference

| Field name                | Description                                                                                                                                                                       |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `partition_keys`          | Fields used to create data partitions. Each entry is `{"field": ..., "types": ...}` where `types` is `"value"` (one partition per value), `"prefix"` (first letter) or `{"hash": <buckets>}` (minimum 16 buckets). Improves read performance by skipping unrelated files. Does not make the field searchable. |
| `index_fields`            | Fields to create secondary indexes for exact-match filters. Improves query performance on `field = value`.                                                                        |
| `full_text_search_keys`   | Fields tokenized for full-text search. Required for substring or `match_all` queries. Defaults to common log fields if not set.                                                   |
| `bloom_filter_fields`     | Fields with high-cardinality values to optimize rare value searches. Improves performance by skipping non-matching data blocks.                                                   |
| `data_retention`          | Number of days to retain data in the stream. Overrides the global retention setting (`ZO_COMPACT_DATA_RETENTION_DAYS`). Compliance streams require a 30-day minimum.                              |
| `flatten_level`           | Maximum depth for flattening nested JSON objects into fields. Helps expose nested keys for querying.                                                                              |
| `defined_schema_fields`   | Fields to retain in the user-defined schema. Others are excluded or stored as raw if `store_original_data` is true.                                                               |
| `max_query_range`         | Maximum time range in hours for a single query. Prevents resource-heavy long-range queries.                                                                                       |
| `store_original_data`     | Stores the full original log body if schema filtering is applied. Allows retrieval of dropped fields.                                                                             |
| `approx_partition`        | Uses evenly divided time ranges for query execution. Helps distribute query load in skewed data.                                                                                  |
| `extended_retention_days` | List of time ranges (`start`, `end` in microseconds) to retain beyond `data_retention`. Must be applied before data expires.                                                                                  |
| `index_original_data`     | Enables full-text indexing on the raw log body. Allows search across fields not part of the schema.                                                                               |
| `index_all_values`        | Indexes all fields for exact-match lookups. Increases ingestion and index size. Best for fixed schemas.                                                                           |
| `storage_type`            | Storage class for the stream: `normal` (default) or `compliance`. When `compliance`, compacted files are written to the infrequent-access storage class (requires `ZO_S3_FEATURE_FORCE_INFREQUENT_ACCESS=true`), and `data_retention` must be at least 30 days. |
