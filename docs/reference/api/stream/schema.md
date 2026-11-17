---
title: Schema
description: Retrieve schema, stats, and settings for a log, metric, or trace stream in OpenObserve via GET API. Includes timestamps, field types, and storage info.
---

# Get schema for stream

Endpoint: `GET /api/{organization}/streams/{stream}/schema?type={StreamType}`

## Request

- type: `logs` / `metrics` / `traces` / `enrichment_tables` / `metadata`

    default is `logs`.

- keyword: only return fields whose name contains this text (optional).

- offset, limit: paginate the field list (optional; `limit=0`, the default, returns all fields).

## Response

```json
{
    "name": "k8s",
    "storage_type": "s3",
    "stream_type": "logs",
    "stats": {
        "doc_time_min": 1673715046856933,
        "doc_time_max": 1673849134852901,
        "doc_num": 3300000,
        "file_num": 16,
        "storage_size": 3323.5,
        "compressed_size": 11.42
    },
    "schema": [
        {
            "name": "_timestamp",
            "type": "Int64"
        },
        {
            "name": "kubernetes.annotations.kubernetes.io/psp",
            "type": "Utf8"
        },
    ],
    "settings": {
        "partition_keys": {},
        "full_text_search_keys": ["log"]
    }
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| name       | string    | -             | stream name |
| storage_type | string  | -             | s3 / disk   |
| stream_type | string   | logs          | logs / metrics / traces / enrichment_tables / metadata |
| stats      | object    | -             | stats for the stream |
| stats.doc_time_min | int64 | 0         | the minimum timestamp of the record in the stream |
| stats.doc_time_max | int64 | 0         | the maximum timestamp of the record in the stream |
| stats.doc_num      | int64 | 0         | the records num of the stream |
| stats.file_num     | int64 | 0         | the files num in storage of the stream |
| stats.storage_size | float64 | 0       | ingestion data size of the original data |
| stats.compressed_size | float64 | 0    | stored size in storage after compression |
| schema     | array     | -             | the fields of the stream |
| schema.name | string   | -             | field name |
| schema.type | string   | -             | field data type: Utf8 / Int64 / Float64 / Timestamp / Boolean |
| settings   | object    | -             | settings of the stream (see [Settings](setting.md) for all fields) |
| settings.partition_keys | object | -   | custom partition keys, keyed `L0`, `L1`, … Each value has `field`, `types` (`"value"`, `"prefix"` or `{"hash": <buckets>}`) and `disabled`. OpenObserve always partitions by time first |
| settings.full_text_search_keys | array[string] | - | full text search fields set on the stream. When empty, `match_all` searches the default fields (`ZO_FEATURE_FULLTEXT_EXTRA_FIELDS` adds more). |
