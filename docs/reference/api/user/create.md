---
title: Create
metaTitle: Create a User - OpenObserve API
description: Create a new OpenObserve user by sending email, name, password, and role via POST. Supports admin and user roles.
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
| role       | string    | -             | user role: `admin`, `editor`, `viewer`, `user` or `service_account`. In Enterprise, any role other than `admin` and `service_account` needs OpenFGA (RBAC) enabled |
| custom_role | array[string] | -        | Enterprise with RBAC only: custom roles to assign |

## Response

```json
{
	"code": 200,
	"message": "User saved successfully"
}
```
