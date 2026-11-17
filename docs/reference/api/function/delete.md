---
title: Delete
metaTitle: Delete a Function - OpenObserve API
description: Delete a data transformation function via DELETE /api/{org}/functions/{name}. No request body needed. Returns confirmation message.
---

# Delete function

Endpoint: `DELETE /api/{organization}/functions/{name}`

## Request

None

## Response

```json
{
	"code": 200,
	"message": "Function deleted"
}
```

A missing function returns `404` ("Function not found"). A function still used by a pipeline or associated with a stream cannot be deleted (`409` or `400` with the reason).
