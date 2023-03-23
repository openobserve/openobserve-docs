# _msearch - multi search

Executes several searches with a single API request

Is similar to _search but can accept multiple requests

## Request

POST /es/_msearch

Body:

Format is:

```txt
header\n
body\n
header\n
body\n
```

e.g.

```json
{"index": "olympics"}
{ "query": { "bool": { "must": [ { "match": { "City":  "paris"        }}, { "match": { "Medal": "gold" }} ], "filter": [ { "term":  { "Country": "ger" }}, { "range": { "@timestamp": { "gte": "2015-01-01", "format": "2006-01-02" }}} ] } } }
{"index": "olympics"}
{"query" : {"match_all" : {}}}
```

## Response


