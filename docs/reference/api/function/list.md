---
title: List
metaTitle: List Functions - OpenObserve API
description: List all data transformation functions for your org via GET /api/{org}/functions, including stream, name, order, and function body details.
---

# List functions

Endpoint: `GET /api/{organization}/functions`

## Request

None

## Response

```json
{
	"list": [
		{
			"function": ".env = \"prod\"\n.",
			"name": "add_env",
			"params": "row",
			"numArgs": 1,
			"transType": 0
		}
	]
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| name       | string    | -             | the function name |
| function   | string    | -             | function body |
| params     | string    | -             | function parameters |
| numArgs    | int       | -             | the number of parameters of the function |
| transType  | int       | 0             | `0` = VRL, `1` = JavaScript |
| streams    | array     | -             | streams the function is applied to, with `stream`, `order`, `streamType`; omitted when empty |
