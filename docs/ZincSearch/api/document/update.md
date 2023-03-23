# Update document with id

Update a document and index it for searches. Provide a doc Id

Endpoint - POST /api/:target/_update/:id 

Update a document and index it for searches

## Request

e.g. 
POST http://localhost:4080/api/myindex/_update/1

Request Body: 

```json
{ 
    "name": "Prabhat Sharma is meeting friends in San Francisco" 
}
```
