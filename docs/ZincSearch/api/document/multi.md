# Create multiple documents

Upload mutiple documents

Endpoint - POST /api/:target/_multi

This will create multiple documents in batch. It is preferred over CreateDocument API when you have multiple documents to be inserted as it is magnitude of times faster than uploading individual documents.

This is different `bulk` API, it accept multiple line documents in one request.

```json
{ "title": "this is the first document", "attr": "foo" }
{ "title": "this is the second document", "attr": "bar" }
```

## Request

e.g. 
POST /api/myindex/_multi

Payload - mulitple line json documents

e.g. 

```json
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HAJOS, Alfred", "Country": "HUN", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Gold", "Season": "summer"}
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HERSCHMANN, Otto", "Country": "AUT", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Silver", "Season": "summer"}
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "CHASAPIS, Spiridon", "Country": "GRE", "Gender": "Men", "Event": "100M Freestyle For Sailors", "Medal": "Silver", "Season": "summer"}
```

If you want use speical doc id, you can set `_id` field in documents.

```json
{"_id": "myid", "Year": 1896, "City": "Athens", "Sport": "Aquatics"}
```
