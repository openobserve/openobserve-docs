# Create documents bulk

Upload bulk data

Endpoint - POST /api/_bulk

This will upload multiple documents in batch. It is preferred over UpdateDocument API when you have multiple documents to be inserted as it is magnitude of times faster than uploading individual documents.

You can any number of documents in batch using this API based on available server resources. On server side any batch greater than 10000 is broken down to multiple batches of 1000 or less. e.g.  A batch of 1500 will be broken into 2 btaches of 1000+500, a batch of 2500 will be broken into 3 batches of 1000+1000+500.

Log forwaders like fluentbit and syslog-ng use this API.

If an index provided in the request does not exist then it will be created.

## Request

e.g. 
POST /api/_bulk

Payload - ndjson (newline delimited json) content

e.g. ndjson contents

```json
{ "index" : { "_index" : "olympics" } } 
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HAJOS, Alfred", "Country": "HUN", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Gold", "Season": "summer"}
{ "index" : { "_index" : "olympics" } } 
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "HERSCHMANN, Otto", "Country": "AUT", "Gender": "Men", "Event": "100M Freestyle", "Medal": "Silver", "Season": "summer"}
{ "index" : { "_index" : "olympics" } } 
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "DRIVAS, Dimitrios", "Country": "GRE", "Gender": "Men", "Event": "100M Freestyle For Sailors", "Medal": "Bronze", "Season": "summer"}
{ "index" : { "_index" : "olympics" } } 
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "MALOKINIS, Ioannis", "Country": "GRE", "Gender": "Men", "Event": "100M Freestyle For Sailors", "Medal": "Gold", "Season": "summer"}
{ "index" : { "_index" : "olympics" } } 
{"Year": 1896, "City": "Athens", "Sport": "Aquatics", "Discipline": "Swimming", "Athlete": "CHASAPIS, Spiridon", "Country": "GRE", "Gender": "Men", "Event": "100M Freestyle For Sailors", "Medal": "Silver", "Season": "summer"}
```

> First line is index action
>
> Second line is document data

### Request action

Index document

```json
{ "index" : { "_index" : "olympics" } } 
```

OR

```json
{ "create" : { "_index" : "olympics" } } 
```

OR

```json
{ "update" : { "_index" : "olympics", "_id": "1" } } 
```

Delete document

```json
{ "delete" : { "_index" : "olympics", "_id": "1" } } 
```

> Delete action not need document data.
