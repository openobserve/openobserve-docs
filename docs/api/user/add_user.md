# Add exiting user to org

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
