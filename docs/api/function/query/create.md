# Create or update query function

Endpoint: `POST /api/{organization}/functions/{name}`

Query function used in query SQL. you can use it to extract some new field from exist fields.

## Request

```json
{
	"function": "function(col1 , col2) return col1 .. \" \" .. col2 end"
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| function   | string    | -             | function body |

> Currently, we only support `VRL` as a functional language.

## Response

```json
{
	"code": 200,
	"message": "Function saved successfully"
}
```
