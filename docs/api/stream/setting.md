# Set Settings for stream

Endpoint: `PUT /api/{organization}/streams/{stream}/settings?type={StreamType}`

## Request


- type: logs / metrics / traces

	default is `logs`.

- JSON Body

	```json
	{
		"partition_keys": ["namespace"],
		"full_text_search_keys": ["logs", "body"],
		"index_fields": ["k8s_namespace_name", "k8s_pod_name"],
		"bloom_filter_fields": [],
		"data_retention": 15
	}
	```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| partition_keys | array[string] | -   | custom partition keys for the stream. By default OpenObserve uses timestamp as the first level partition key |
| full_text_search_keys | array[string] | - | full text search fields, will created inverted index with split the values to multiple tokens. default OpenObserve uses `log`, `message`, `msg`, `content`, `data`, `json`, if there is no those fields in your stream, will report error: `you should set the full text search fields`. |
| index_fields |  array[string] | - | index fields, will created inverted index with the original value. |
| bloom_filter_fields |  array[string] | - | enable bloom filter for the field, for high cardinal number fields have better performance |
| data_retention | int64 | - | the default value based on `ZO_COMPACT_DATA_RETENTION_DAYS=3650` |

## Response

```json
{
	"code": 200
}
```
