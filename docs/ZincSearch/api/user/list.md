# List users

List all users

Endpoint - GET /api/user

List all users.

## Request

e.g. 
GET http://localhost:4080/api/user


## Response

```json
{
    "took": 0,
    "timed_out": false,
    "_shards": {
        "total": 0,
        "successful": 0,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 1
        },
        "max_score": 0,
        "hits": [
            {
                "_index": "admin",
                "_type": "admin",
                "_id": "admin",
                "_score": 0,
                "@timestamp": "2022-05-31T14:27:19.285611+08:00",
                "_source": {
                    "_id": "admin",
                    "name": "admin",
                    "role": "admin",
                    "created_at": "2022-05-31T14:27:19.285611+08:00",
                    "updated_at": "2022-05-31T14:27:19.285611+08:00"
                }
            }
        ]
    },
    "error": ""
}
```
