# _search

POST http://localhost:4080/es/olympics/_search

```json
{
    "query": { 
        "bool": { 
            "must": [
                { "match": { "City":  "paris" }},
                { "match": { "Medal": "gold" }}
            ],
            "should": [],
            "must_not": [],
            "filter": [ 
                { "term":  { "Country": "ger" }},
                { "range": { "@timestamp": { "gte": "2015-01-01", "format": "2006-01-02" }}}
            ]
        }
    },
    "size": 10
}
```

### Response

```json
{
    "took": 0,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 11
        },
        "max_score": 12.214994762453479,
        "hits": [
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY926",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761150823Z",
                "_source": {
                    "Athlete": "HOPPENBERG, Ernst",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Backstroke",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY92j",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761346257Z",
                "_source": {
                    "Athlete": "FREY, Julius",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Team Swimming",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY92k",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761361703Z",
                "_source": {
                    "Athlete": "HAINLE, Max",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Team Swimming",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY92l",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761376725Z",
                "_source": {
                    "Athlete": "HOPPENBERG, Ernst",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Team Swimming",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY92m",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761388544Z",
                "_source": {
                    "Athlete": "SCHÖNE, Max",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Team Swimming",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6wY92n",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.761400515Z",
                "_source": {
                    "Athlete": "VON PETERSDORFF, Herbert",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Swimming",
                    "Event": "200M Team Swimming",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Aquatics",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6yo8GQ",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.766849311Z",
                "_source": {
                    "Athlete": "GOSSLER, Carl Heinrich",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Rowing",
                    "Event": "Four-Oared Shell With Coxswain (4-)",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Rowing",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6yo8GR",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.766876413Z",
                "_source": {
                    "Athlete": "GOSSLER, Gustav Ludwig",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Rowing",
                    "Event": "Four-Oared Shell With Coxswain (4-)",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Rowing",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6yo8GS",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.766898831Z",
                "_source": {
                    "Athlete": "GOSSLER, Oscar",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Rowing",
                    "Event": "Four-Oared Shell With Coxswain (4-)",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Rowing",
                    "Year": 1900
                }
            },
            {
                "_index": "olympics",
                "_type": "_doc",
                "_id": "1P0sQ6yo8GU",
                "_score": 12.214994762453479,
                "@timestamp": "2022-05-26T11:51:31.766954511Z",
                "_source": {
                    "Athlete": "KATZENSTEIN, Walther",
                    "City": "Paris",
                    "Country": "GER",
                    "Discipline": "Rowing",
                    "Event": "Four-Oared Shell With Coxswain (4-)",
                    "Gender": "Men",
                    "Medal": "Gold",
                    "Season": "summer",
                    "Sport": "Rowing",
                    "Year": 1900
                }
            }
        ]
    },
    "error": ""
}
```
