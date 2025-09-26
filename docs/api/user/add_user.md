---
description: >-
  Add an existing user to an OpenObserve organization with a specified role
  using a simple POST request. Supports admin and user roles.
---
# Add existing user to org

Endpoint: `POST /api/{organization}/users/{user_email}`

## Request

```json
{	
	"role": "admin"
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| role       | string    | -             | user role, supported: admin / user |

## Response

```json
{
	"code": 200,
	"message": "User added to org successfully"
}
```
