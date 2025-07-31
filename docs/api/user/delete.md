---
description: >-
  Remove a user from an OpenObserve organization using a simple DELETE request.
  No request body required.
---
# Remove user from organization

Endpoint: `DELETE /api/{organization}/users/{user_email}`

## Request

None

## Response

```json
{
	"code": 200,
	"message": "User removed from organization"
}
```
