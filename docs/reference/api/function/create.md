---
title: Create
metaTitle: Create a Function - OpenObserve API
description: Create a data transformation function via POST /api/{org}/functions using VRL to drop fields, convert types, or filter records before ingestion.
---

# Create function

Endpoint: `POST /api/{organization}/functions`

Function can be used to modify input data. You can use it to drop some fields, convert some field's data type, or drop some records.

## Request

```json
{
	"name": "add_env",
	"function": ".env = \"prod\"\n.",
	"transType": 0
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| name       | string    | -             | function name, required |
| function   | string    | -             | function body, required. For VRL, a trailing `.` is added if missing |
| transType  | int       | 0             | `0` = [VRL](https://playground.vrl.dev/), `1` = JavaScript |
| params     | string    | -             | optional, function parameters |

## Response

```json
{
	"code": 200,
	"message": "Function saved successfully"
}
```
