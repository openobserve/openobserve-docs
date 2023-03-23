# Create update user

Create/Update a new index

Endpoint - POST /api/user

Create/Update a new/existing user.

## Request

e.g. 
POST http://localhost:4080/api/user

Request Body: 

```json
{ 
    "_id": "prabhat",
	"name": "Prabhat Sharma",
	"role": "admin", // or user
	"password": "Complexpass#123"
}
```
