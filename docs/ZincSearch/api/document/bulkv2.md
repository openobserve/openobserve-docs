# Create documents bulk v2

Upload bulk data

Endpoint - POST /api/_bulkv2

This will create multiple documents in batch. It is preferred over CreateDocument API when you have multiple documents to be inserted as it is magnitude of times faster than uploading individual documents.

This is different `bulk` API, it accept standard JSON input.

```json
{
    "index": "index name",
    "records": [
        {
            "name": "Prabhat Sharma",
            "age": 18
        },
        {
            "name": "Daniel Sharma",
            "age": 36
        }
    ]
}
```

## Request

e.g. 
POST /api/_bulkv2

Payload - json content

e.g. 

```json
{
    "index" : "olympics",
    "records": [
        {"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HAJOS, Alfred", "Country": "HUN", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Gold", "Season": "summer"},
        {"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HERSCHMANN, Otto", "Country": "AUT", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Silver", "Season": "summer"},
        {"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "CHASAPIS, Spiridon", "Country": "GRE", "Gender": "Men", "Event": "100M Freestyle For Sailors", "Medal": "Silver", "Season": "summer"}
    ]
}
```
