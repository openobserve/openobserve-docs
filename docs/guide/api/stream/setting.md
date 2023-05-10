# Set Settings for stream

Endpoint: `POST /api/{organization}/{stream}/settings`

## Request

```json
{
    "partition_keys": ["kubernetes.namespace_name"],
	"full_text_search_keys": ["log"]
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| partition_keys | array[string] | -   | custom partition keys for the stream. By default ZincObserve uses timestamp as the first level partition key |
| full_text_search_keys | array[string] | - | full text search fields, default ZincObserve uses `log`, `message`, `content`, `data`, if there is no those fields in your stream, will report error: `you should set the full text search fields`. |

## Response

```json
{
	"code": 200
}
```
