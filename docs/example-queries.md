# Example Queries


We will use the k8s [sample logs data](https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip) to demonstrate the sample queries that you can use.


1. To search for all the fields containing the word `error`. This is a case sensitive search:
    - `match_all_raw('error')`
    - match_all searches only the fields that are configured for full text search. Default set of fields are `msg, message, log, logs`. If you want more fields to be scanned during full text search, you can configure them under stream settings. You should use `str_match` for full text search in specific fields.
- Search only `log` field for error. This is much more efficient than `match_all_raw` as it search in a single field.
    - `str_match(log, 'error')`
-  To do a case insensitive search for `error`
    - `match_all_raw_ignore_case('error')`
- To search for all log entries that have log entries where `code is 200` . code is a numeric field
    - `code=200`
- To search for all log entries where code field does not contain any value
    - ✅ `code is null` 
    - ❌ code=' ' will not yield right results
- To search for all log entries where code field has some value
    - ✅ `code is not null` 
    - ❌ code!=' ' will not yield right results
- code > 399
    - `code>399`
- code >= 400
    - ✅ `code >= 400` 
    - ❌ code=>400 will not work
- A mildly complex query
    - <pre> `SELECT histogram(_timestamp) as ts_histogram, 
    count(case when code=200 then 1 end) as code_200_count, 
    count(case when code=401 then 1 end) as code_401_count, 
    count(case when code=500 then 1 end) as code_500_count FROM quickstart1 GROUP BY ts_histogram`</pre>
    - If you are looking to draw complex charts based on values in the logs (e.g. status code), you should use standard drag and drop charting functionality of OpenObserve which is very powerful and you do not have to write any SQL queries manually. Most users will be able to build 99% + of their required dashboards without writing any SQL.

- Percentile P95 P99
    
    ```sql
    SELECT histogram(_timestamp) as x_axis_1,  
        approx_percentile_cont(duration, 0.95) as percentile_95, 
        approx_percentile_cont(duration, 0.99) as percentile_99 
    FROM default 
        where service_name='$service' 
        GROUP BY x_axis_1 ORDER BY x_axis_1
    ```
