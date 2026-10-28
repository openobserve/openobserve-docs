---
title: Update
metaTitle: Update a User - OpenObserve API
description: Update an OpenObserve user's name, password, or role using a PUT request. Old password is required to change password.
---

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
| old_password   | string    | -         | current password. Required when you change your own password; omit it otherwise. |
| new_password   | string    | -         | new password. Omit it if you don't want to change the password. A root user or admin can set it for another user without `old_password`. |
| role       | string    | -             | user role: `admin`, `editor`, `viewer`, `user` or `service_account` |

## Response

```json
{
	"code": 200,
	"message": "User updated successfully"
}
```
