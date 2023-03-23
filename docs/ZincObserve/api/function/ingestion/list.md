# List ingestion functions

Endpoint: `GET /api/{organization}/{stream}/functions`

## Request

None

## Response

```json
{
	"list": [
		{
			"stream_name": "log1",
			"name": "fun1",
			"function": "function(row) return row end",
			"order": 1,
			"num_args": 2,
			"trans_type": 0
		}
	]
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| stream_name | string   | -             | the function will effect to which stream |
| name       | string    | -             | the function name |
| function   | string    | -             | function body |
| order      | int64     | 0             | execute order, minimum will execute first. |
| num_args   | int64     | -             | the params num of the function |
| trans_type | int64     | 0             | Lua function is 0, JavaScript function is 1 |
