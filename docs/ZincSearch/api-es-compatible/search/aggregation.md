# Aggregation

Endpoint - POST /es/:target/_search

Search for documents with aggregations

aggregation support:

1. Bucketing
    1. `terms` - Supported on fields of type keyword, numeric
    1. `range` - Supported on fields of type numeric, date
    1. `date_range` - Supported on fields of type date
    1. `histogram` - Supported on fields of type numeric, date
    1. `date_histogram` - Supported on fields of type date
    1. `auto_date_histogram` - Supported on fields of type date
1. Metrics
    1. `min`, `max`, `count`, `sum` - Supported on fields of type numeric
    1. `avg`, `weighted_vg` - Supported on fields of type numeric
    1. `Cardinality` - Supported on fields of type numeric


## Request

e.g. 
POST http://localhost:4080/es/myindex/_search

Request Body: 

```json
{
    "query": {
        "bool": {
            "should": {
                "match": {
                    "_all": "Ice Hockey"
                }
            }
        }
    },
    "sort": ["-@timestamp"],
    "from": 0,
    "size": 20,
    "aggs": {
        "Medal": {
            "terms": {
                "field": "Medal",
                "size": 10
            }
        },
        "Year": {
            "range": {
                "field": "Year",
                "ranges": [
                    { "from": 1900, "to": 1920},
                    { "from": 1921, "to": 1950},
                    { "from": 1951, "to": 2000},
                    { "from": 2000, "to": 2021}
                ]
            }
        },
        "@timestamp": {
            "date_range": {
                "field": "@timestamp",
                "ranges": [
                    { "from": "2020-01-21T09:22:50.604Z", "to": "2021-01-21T09:22:50.604Z"},
                    { "from": "2021-01-22T09:22:50.604Z", "to": "2023-01-21T09:22:50.604Z"}
                ]
            }
        },
        "max_Year": {
            "max": { "field": "Year" }
        },
        "min_Year": {
            "min": { "field": "Year" }
        },
        "avg_Year": {
            "avg": { "field": "Year" }
        },
        "weighted_avg_Year": {
            "weighted_avg": { 
                "field": "Year", 
                "weight_field": "Year" 
            }
        },
        "sum_Year": {
            "sum": { "field": "Year" }
        },
        "count_Sport": {
            "count": { "field": "Sport" }
        }
    }
}
```

## Response

```json
{
    "took": 250,
    "timed_out": false,
    "hits": {
        "total": {
            "value": 3051
        },
        "max_score": 17.82873837347811,
        "hits": null
    },
    "aggregations": {
        "@timestamp": {
            "buckets": [
                {
                    "key": "[2020-01-21T09:22:50Z,2021-01-21T09:22:50Z)",
                    "doc_count": 0
                },
                {
                    "key": "[2021-01-22T09:22:50Z,2023-01-21T09:22:50Z)",
                    "doc_count": 6102
                }
            ]
        },
        "Medal": {
            "buckets": [
                {
                    "key": "gold",
                    "doc_count": 1026
                },
                {
                    "key": "silver",
                    "doc_count": 1024
                },
                {
                    "key": "bronze",
                    "doc_count": 1001
                }
            ]
        },
        "Year": {
            "buckets": [
                {
                    "key": "[1900.000000,1920.000000)",
                    "doc_count": 132
                },
                {
                    "key": "[1921.000000,1950.000000)",
                    "doc_count": 2292
                },
                {
                    "key": "[1951.000000,2000.000000)",
                    "doc_count": 9822
                },
                {
                    "key": "[2000.000000,2021.000000)",
                    "doc_count": 5646
                }
            ]
        },
        "avg_Year": {
            "value": 1980.4818092428711
        },
        "count_Sport": {
            "value": 3051
        },
        "max_Year": {
            "value": 2014
        },
        "min_Year": {
            "value": 1908
        },
        "sum_Year": {
            "value": 36254700
        },
        "weighted_avg_Year": {
            "value": 1980.4818092428711
        }
    },
    "error": ""
}
```
