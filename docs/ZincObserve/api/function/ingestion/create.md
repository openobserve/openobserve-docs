# Create or update ingestion function

Endpoint: `POST /api/{organization}/{stream}/functions/{name}`

Ingestion function used to modify data what you input. you can use it to drop some feilds, convert some fileds data type, or drop some records.

## Request

```json
{
	"function": "function(row) return row end",
	"order": 1
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| function   | string    | -             | function body |
| order      | int64     | 0             | execute order, minimum will execute first. |

> Currently, we only support `Lua` as a functional language. `JavaScript` and `WebAssembly` are under development and will be supported soon.

## Response

```json
{
	"code": 200,
	"message": "Function saved successfully"
}
```
