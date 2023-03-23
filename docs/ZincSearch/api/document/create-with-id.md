# Create document with id

Create a document and index it for searches. Provide a doc Id

Endpoint - PUT /api/:target/_doc/:id 

Create/Update a document and index it for searches

## Request

e.g. 
PUT http://localhost:4080/api/myindex/_doc/1

Request Body: 

```json
{ 
    "name": "Prabhat Sharma is meeting friends in San Francisco" 
}
```
