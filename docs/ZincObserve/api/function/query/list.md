# List query functions

Endpoint: `GET /api/{organization}/transform`

## Request

None

## Response

```json
{
	"list": [
		{
			"name": "fun1",
			"function": "function(col1 , col2) return col1 .. \" \" .. col2 end",
			"num_args": 2,
			"trans_type": 0
		}
	]
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| name       | string    | -             | the function name |
| function   | string    | -             | function body |
| num_args   | int64     | -             | the params num of the function |
| trans_type | int64     | 0             | Lua function is 0, JavaScript function is 1 |
