# Update user

Endpoint: `PUT /api/{organization}/users/{user_email}`

## Request

```json
{
	"first_name": "ming",
	"last_name": "xing",
	"old_password": "11111111",
	"new_password": "22222222",
	"role": "admin"
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| first_name | string    | -             | first name |
| last_name  | string    | -             | last name |
| old_password   | string    | -         | old password for user, it shouldn't pass if you don't want to change password. |
| new_password   | string    | -         | new password for user, it shouldn't pass if you don't want to change password. |
| role       | string    | -             | user role, supported: admin / user |

## Response

```json
{
	"code": 200,
	"message": "User saved successfully"
}
```
