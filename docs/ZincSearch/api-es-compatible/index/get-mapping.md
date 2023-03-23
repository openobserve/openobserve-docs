# Get index mapping

Get an index mapping

Endpoint - GET /es/:target/_mapping

Get an index mapping

## Request

e.g. 

GET http://localhost:4080/es/olympics/_mapping


## Response

```json
{
    "myindex": {
        "mappings": {
            "properties": {
                "_id": {
                    "type": "keyword",
                    "index": true,
                    "store": false,
                    "sortable": true,
                    "aggregatable": true,
                    "highlightable": false
                },
                "@timestamp": {
                    "type": "date",
                    "index": true,
                    "store": false,
                    "sortable": true,
                    "aggregatable": true,
                    "highlightable": false
                },
                "Athlete": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "City": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Country": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Discipline": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Event": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Gender": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Medal": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Season": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Sport": {
                    "type": "text",
                    "index": true,
                    "store": true,
                    "sortable": false,
                    "aggregatable": false,
                    "highlightable": true
                },
                "Year": {
                    "type": "numeric",
                    "index": true,
                    "store": false,
                    "sortable": true,
                    "aggregatable": true,
                    "highlightable": false
                }
            }
        }
    }
}
```
