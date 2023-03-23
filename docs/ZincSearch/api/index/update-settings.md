# Update index settings

Update an index settings

Endpoint - PUT /api/:target/_settings

Update an index settings

## Request

e.g.

PUT http://localhost:4080/api/myindex/_settings

Request Body: 

```json
{
    "analysis": {
        "analyzer": {
            "default": {
                "type": "standard"
            },
            "my_analyzer": {
                "tokenizer": "standard",
                "char_filter": [
                    "my_mappings_char_filter"
                ]
            }
        },
        "char_filter": {
            "my_mappings_char_filter": {
                "type": "mapping",
                "mappings": [
                    ":) => _happy_",
                    ":( => _sad_"
                ]
            }
        }
    }
}
```

> Settings also can defines when create index.
