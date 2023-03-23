# Aggregation

Endpoint - POST /api/:target/_search

Search for documents with aggregations

aggregation support:

1. Bucketing
    1. term - Supported on fields of type text, keyword, numeric
    1. range - Supported on fields of type numeric
    1. date_range - Supported on fields of type time
1. Metrics
    1. min, max, count, sum - Supported on fields of numeric type
    1. avg, weighted_vg - Supported on fields of type numeric


## Request

e.g. 
POST http://localhost:4080/api/olympics/_search

Request Body: 

```json
{
    "search_type": "match",
    "query": {
        "term": "Ice Hockey"
    },
    "sort_fields": ["-@timestamp"],
    "from": 0,
    "max_results": 20,
    "aggs": {
        "Medal": {
            "agg_type": "term",
            "field": "Medal",
            "size": 10
        },
        "Year": {
            "agg_type": "range",
            "field": "Year",
            "size": 10,
            "ranges": [
                {"from": 1900, "to": 1920},
                {"from": 1921, "to": 1950},
                {"from": 1951, "to": 2000},
                {"from": 2000, "to": 2021}
            ]
        },
        "@timestamp": {
            "agg_type": "date_range",
            "field": "@timestamp",
            "size": 10,
            "date_ranges": [
                {
                    "from": "2020-01-21T09:22:50.604Z",
                    "to": "2021-01-21T09:22:50.604Z"
                },
                {
                    "from": "2021-01-22T09:22:50.604Z",
                    "to": "2023-01-21T09:22:50.604Z"
                }
            ]
        },
        "max_Year": {
            "agg_type": "max",
            "field": "Year"
        },
        "min_Year": {
            "agg_type": "min",
            "field": "Year"
        },
        "avg_Year": {
            "agg_type": "avg",
            "field": "Year"
        },
        "weighted_avg_Year": {
            "agg_type": "weighted_avg",
            "field": "Year",
            "weight_field": "Year"
        },
        "sum_Year": {
            "agg_type": "sum",
            "field": "Year"
        },
        "count_Sport": {
            "agg_type": "count",
            "field": "Sport"
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
