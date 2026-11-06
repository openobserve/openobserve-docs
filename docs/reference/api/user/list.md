---
title: List
metaTitle: List Users - OpenObserve API
description: List all users in an OpenObserve organization, including email, name, and role, with a simple GET request.
---

# List users

Endpoint: `GET /api/{organization}/users`

## Request

None

## Response

```json
{
	"data": [
		{
			"email": "admin@example.com",
			"first_name": "ming",
			"last_name": "xing",
			"role": "admin",
			"is_external": false,
			"created_at": 1717400000000000
		}
	]
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| email      | string    | -             | user email |
| first_name | string    | -             | first name |
| last_name  | string    | -             | last name |
| role       | string    | -             | user role: `admin`, `editor`, `viewer`, `user`, `service_account` or `root` |
| is_external | bool     | false         | `true` for users created through SSO/LDAP |
| created_at | int64     | -             | creation time |
