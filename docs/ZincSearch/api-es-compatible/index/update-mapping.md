# Update index mapping

Update an index mapping

Endpoint - PUT /es/:target/_mapping

Update an index mapping

## Request

e.g.

PUT http://localhost:4080/es/olympics/_mapping

Request Body: 

```json
{
	"properties": {
		"name": {
			"type": "text",
			"index": true,
			"store": true,
			"sortable": false,
			"aggregatable": false,
			"highlightable": true
		},
		"author": {
			"type": "keyword",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"price": {
			"type": "numeric",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"published": {
			"type": "bool",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"create_at": {
			"type": "date",
			"format": "2006-01-02T15:04:05Z07:00",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		}
	}
}
```

> Mapping also can defines when create index.
