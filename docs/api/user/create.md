---
description: >-
  Create a new OpenObserve user by sending email, name, password, and role via
  POST. Supports admin and user roles.
---
# Create user

Endpoint: `POST /api/{organization}/users`

## Request

```json
{
	"email": "admin@openobserve.ai",
	"first_name": "ming",
	"last_name": "xing",
	"password": "complex#pass",
	"role": "admin"
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| email      | string    | -             | user email |
| first_name | string    | -             | first name |
| last_name  | string    | -             | last name |
| password   | string    | -             | user password |
| role       | string    | -             | user role, supported: admin / user |

## Response

```json
{
	"code": 200,
	"message": "User saved successfully"
}
```
