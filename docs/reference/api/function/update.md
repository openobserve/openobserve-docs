---
title: Update
metaTitle: Update a Function - OpenObserve API
description: Update data transformation functions via PUT /api/{org}/functions/{name}. Use VRL to drop fields, change types, or filter records.
---

# Update function

Endpoint: `PUT /api/{organization}/functions/{name}`

Returns `404` ("Function not found") if no function with that name exists. If the body is identical to the stored function, the stored function is returned unchanged.

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
