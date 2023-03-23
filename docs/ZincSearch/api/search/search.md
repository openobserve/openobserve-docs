# Search

## Basic Search

Search for documents

Endpoint - POST /api/:target/_search

Search for documents

## Request

e.g. 
POST http://localhost:4080/api/stackoverflow-6/_search

Request Body: 
```json
{
    "search_type": "match",
    "query": {
        "term": "shell window",
        "field": "_all",
        "start_time": "2021-12-25T15:08:48.777Z",
        "end_time": "2021-12-28T16:08:48.777Z"
    },
    "sort_fields": ["-@timestamp"],
    "from": 0,
    "max_results": 20,
    "_source": [
        "Field1", "Field2" // Leave this as empty array to return all fields.
    ]
}
```

## Example


### Python example

```py
import base64
import json
import requests

user = "admin"
password = "Complexpass#123"
bas64encoded_creds = base64.b64encode(bytes(user + ":" + password, "utf-8")).decode("utf-8")

params = {
    "search_type": "match",
    "query":
    {
        "term": "DEMTSCHENKO",
        "start_time": "2021-06-02T14:28:31.894Z",
        "end_time": "2021-12-02T15:28:31.894Z"
    },
    "from": 0, # use together with max_results for paginated results.
    "max_results": 20,
    "_source": [] # Leave this as empty array to return all fields.
}

# params = {
#     "search_type": "querystring",
#     "query":
#     {
#         "term": "+City:Turin +Silver",
#         "start_time": "2021-06-02T14:28:31.894Z",
#         "end_time": "2021-12-02T15:28:31.894Z"
#     },
#     "_source": ["_all"]
# }

headers = {"Content-type": "application/json",  "Authorization": "Basic " + bas64encoded_creds}
index = "games3"
zinc_host = "http://localhost:4080"
zinc_url = zinc_host + "/api/" + index + "/_search"

res = requests.post(zinc_url, headers=headers, data=json.dumps(params))

print(res.text)
```

### Golang example

```golang
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

func main() {
    query = `{
        "search_type": "match",
        "query":
        {
            "term": "DEMTSCHENKO",
            "start_time": "2021-06-02T14:28:31.894Z",
            "end_time": "2021-12-02T15:28:31.894Z"
        },
        "from": 0,
        "max_results": 20,
        "_source": []
    }`
    req, err := http.NewRequest("POST", "http://localhost:4080/api/games3/_search", strings.NewReader(query))
    if err != nil {
        log.Fatal(err)
    }
    req.SetBasicAuth("admin", "Complexpass#123")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        log.Fatal(err)
    }
    defer resp.Body.Close()
    log.Println(resp.StatusCode)
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(string(body))
}
```

## Response

```json
{
    "took": 0,
    "timed_out": false,
    "max_score": 7.6978611753656345,
    "hits": {
        "total": {
            "value": 3
        },
        "hits": [
            {
                "_index": "games3",
                "_type": "games3",
                "_id": "bd3e67f0-679b-4aa4-b0f5-81b9dc86a26a",
                "_score": 7.6978611753656345,
                "@timestamp": "2021-10-20T04:56:39.000871Z",
                "_source": {
                    "Athlete": "DEMTSCHENKO, Albert",
                    "City": "Turin",
                    "Country": "RUS",
                    "Discipline": "Luge",
                    "Event": "Singles",
                    "Gender": "Men",
                    "Medal": "Silver",
                    "Season": "winter",
                    "Sport": "Luge",
                    "Year": 2006
                }
            },
            {
                "_index": "games3",
                "_type": "games3",
                "_id": "230349d9-72b3-4225-bac7-a8ab31af046d",
                "_score": 7.6978611753656345,
                "@timestamp": "2021-10-20T04:56:39.215124Z",
                "_source": {
                    "Athlete": "DEMTSCHENKO, Albert",
                    "City": "Sochi",
                    "Country": "RUS",
                    "Discipline": "Luge",
                    "Event": "Singles",
                    "Gender": "Men",
                    "Medal": "Silver",
                    "Season": "winter",
                    "Sport": "Luge",
                    "Year": 2014
                }
            },
            {
                "_index": "games3",
                "_type": "games3",
                "_id": "338fea31-81f2-4b56-a096-b8294fb6cc92",
                "_score": 7.671309826309841,
                "@timestamp": "2021-10-20T04:56:39.215067Z",
                "_source": {
                    "Athlete": "DEMTSCHENKO, Albert",
                    "City": "Sochi",
                    "Country": "RUS",
                    "Discipline": "Luge",
                    "Event": "Mixed Relay",
                    "Gender": "Men",
                    "Medal": "Silver",
                    "Season": "winter",
                    "Sport": "Luge",
                    "Year": 2014
                }
            }
        ]
    },
    "buckets": null,
    "error": ""
}
```

combine "from" and "max_results" to allow pagination.

sort_fields: list of fields to sort the results. Put a minus "-" before the field to change to descending order.

search_type can have following values:

1. matchall
1. match
1. matchphrase
1. term
1. querystring
1. prefix
1. wildcard
1. fuzzy
1. daterange
