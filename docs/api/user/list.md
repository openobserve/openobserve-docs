---
description: >-
  List all users in an OpenObserve organization, including email, name, and
  role, with a simple GET request.
---
# List users

Endpoint: `GET /api/{organization}/users`

## Request

None

## Response

```json
{
	"list": [
		{
			"email": "admin@openobserve.ai",
			"fist_name": "ming",
			"last_name": "xing",
			"role": "admin"
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
| role       | string    | -             | user role, supported: admin / user |
