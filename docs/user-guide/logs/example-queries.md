# Example Queries


We will use the k8s [sample logs data](https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip) to demonstrate the sample queries that you can use.


1. To search for all the fields containing the word `error`. This is a case snesitive search:
    - `match_all('error')`
-  To do a case insensitive search for `error`
    - `match_all_ignore_case('error')`
- To search for all log entries that have log entries where `code is 200` . code is a numeric field
    - `code=200`
- To search for all log entries where code field does not contain any value
    - `code is null` . code=' ' will not yield right results
- To search for all log entries where code field has some value
    - `code is not null` . code!=' ' will not yield right results

