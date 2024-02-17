# Create or update ingestion function

Endpoint: `POST /api/{organization}/{stream}/functions/{name}`

Ingestion function can be used to modify input data. You can use it to drop some fields, convert some field's data type, or drop some records.

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

> Currently, we only support `VRL` as a functional language.

## Response

```json
{
	"code": 200,
	"message": "Function saved successfully"
}
```
