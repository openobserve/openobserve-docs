---
title: List
metaTitle: List Streams - OpenObserve API
description: List all streams in OpenObserve by type (logs, metrics, traces). Optionally include schema, storage stats, and stream settings in the response.
---

# List streams

Endpoint: `GET /api/{organization}/streams?fetchSchema=false&type={StreamType}`

## Request

All query parameters are optional.

- fetchSchema: `true` / `false` (default `false`)

	Set to `true` to include each stream's field list in `schema`. With `false`, `schema` is an empty array.

- type: `logs` / `metrics` / `traces` / `enrichment_tables` / `metadata`

	When omitted, streams of all types are listed.

- keyword: only streams whose name contains this text (case-insensitive).

- offset, limit: pagination. `limit=0` (the default) returns all streams.

- sort: field to sort by (default `name`); asc: `true` (default) or `false`.

## Response

```json
{
	"list": [
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
				"compressed_size": 11.42,
				"index_size": 0.0
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
	],
	"total": 1
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
| stats.index_size   | float64 | 0       | size of the index files |
| schema     | array     | -             | the schema of the stream; empty when `fetchSchema` is `false` |
| schema.name | string   | -             | field name |
| schema.type | string   | -             | field data type: Utf8 / Int64 / Float64 / Timestamp / Boolean |
| settings   | object    | -             | settings of the stream (see [Settings](setting.md) for all fields) |
| settings.partition_keys | object | -   | custom partition keys, keyed `L0`, `L1`, … Each value has `field`, `types` (`"value"`, `"prefix"` or `{"hash": <buckets>}`) and `disabled`. OpenObserve always partitions by time first |
| settings.full_text_search_keys | array[string] | - | full text search fields set on the stream. When empty, `match_all` searches the default fields (`ZO_FEATURE_FULLTEXT_EXTRA_FIELDS` adds more). |
| total      | int64     | -             | top-level: number of streams that matched, before pagination |
