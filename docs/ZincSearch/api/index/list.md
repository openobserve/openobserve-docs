# List indexes

List existing indexes

Endpoint - GET /api/index

Get the list of existing indexes

## Request

e.g. 
GET http://localhost:4080/api/index?page_num=1&page_size=20&sort_by=name&desc=false&name=f

### Request params

| Param     | Position    | Type    | Required | Explain                                                                                              |
|-----------|-------------|---------|----------|------------------------------------------------------------------------------------------------------|
| page_num  | query       | integer | false    | page num from 1                                                                                      |
| page_size | query       | integer | false    | if page size is empty or 0, then return all                                                          |
| sort_by   | query       | string  | false    | sort field, the default is "name", Sortable fields: name,doc_num,shard_num,storage_size,storage_type |
| desc      | query       | string  | false    | Sort in descending order                                                                             |
| name      | query       | string  | false    | Fuzzy query by name                                                                                  |


## Response

```json
{
  "list": [
    {
      "name": "fluent.warn-20220803",
      "storage_type": "disk",
      "shard_num": 3,
      "settings": {},
      "mappings": {
        "properties": {
          "@timestamp": {
            "type": "date",
            "index": true,
            "store": false,
            "sortable": true,
            "aggregatable": true,
            "highlightable": false
          },
          "_id": {
            "type": "keyword",
            "index": true,
            "store": false,
            "sortable": true,
            "aggregatable": true,
            "highlightable": false
          },
          "chunk": {
            "type": "text",
            "index": true,
            "store": false,
            "sortable": false,
            "aggregatable": false,
            "highlightable": false
          },
          "retry_times": {
            "type": "numeric",
            "index": true,
            "store": false,
            "sortable": true,
            "aggregatable": true,
            "highlightable": false
          }
        }
      },
      "stats": {
        "doc_time_min": 0,
        "doc_time_max": 0,
        "doc_num": 7,
        "storage_size": 61514,
        "wal_size": 0
      },
      "version": ""
    }
  ],
  "page": {
    "page_num": 1,
    "page_size": 20,
    "total": 1
  }
}

```

# GET List index Name
Return the list of index name

GET /api/index_name

## Request

e.g.
GET http://localhost:4080/api/index_name?name=f

### Request params

| Param | Position | Type   | Required | Explain             |
|-------|----------|--------|----------|---------------------|
| name  | query    | string | false    | Fuzzy query by name |


## Response

```json
[
  "fluent.info-20220802",
  "fluent.info-20220803",
  "fluent.warn-20220803"
]
```

>Return 30 items at most
