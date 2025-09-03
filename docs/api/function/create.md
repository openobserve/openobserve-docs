---
description: >-
  Create a data transformation function via POST /api/{org}/functions using VRL
  to drop fields, convert types, or filter records before ingestion.
---
# Create function

Endpoint: `POST /api/{organization}/functions`

Function can be used to modify input data. You can use it to drop some fields, convert some field's data type, or drop some records.

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

> Currently, we only support [VRL](https://playground.vrl.dev/) as a functional language.

## Response

```json
{
	"code": 200,
	"message": "Function saved successfully"
}
```
