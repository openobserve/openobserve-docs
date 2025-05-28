OpenObserve does not restrict the number of records returned or the length of the time range in a query. 

You can query a few minutes or a longer time range, based on your data retention settings. The default retention is 1 year, but this may vary by configuration.

However, queries that return a large number of results, especially those with small time intervals, breakdown fields, or large text fields, can overload the browser. 
This may cause the UI to become unresponsive or crash, particularly on the **Logs** page or in **Dashboard Panels**.

Two scenarios where this risk is significant:

## 1. Long Range Queries with Small Intervals 

> **Where this issue can occur**: Log Search and Dashboards
<br>

When you run histogram queries using `histogram("timestamp", interval)`, the `interval` defines how the data is grouped over time. For example, an `interval` of `5m` groups logs into 5-minute buckets. The longer the time range and the smaller the interval, the more buckets the query will return.

Each bucket becomes a row in the query result. If the query returns a large number of rows, the browser must load and render all of them. This can slow down the UI or cause it to crash.

Example: 

```sql linenums="1"

SELECT histogram(_timestamp, '5m') AS log_time_interval,
       COUNT(*) AS total_logs
FROM "default"
GROUP BY log_time_interval
ORDER BY log_time_interval ASC
```

The above query returns the number of logs collected every 5 minutes. When run over a 7-day period, it generates more than 2,000 time buckets, each representing a row that the browser must load and render. This volume of data can cause the UI to become unresponsive or crash.

> **Note:** <br>
>**In Dashboard Panels- Breakdown Fields Multiply the Problem**<br>
>In dashboard panels, if you add a breakdown to the query (e.g., by `log.level`), it multiplies the number of rows. <br> For example,
>
>- You already have 2,000 time buckets  
>- `log.level` has 5 unique values: `INFO`, `ERROR`, `DEBUG`, `WARN`, `TRACE`
>
>The result becomes: 2,000 time buckets × 5 breakdown values = 10,000 rows
>
>That is 5X more data than without the breakdown. 
>
>All of it must be fetched, loaded, and rendered in your browser. It ends up crashing the UI. 

## 2. Tables that Include Large Text Fields 

> **Where this issue can occur**: Dashboards


When you display logs in a table on a dashboard, avoid including large text fields such as `log.body`. 

Over longer time ranges, such as several days, these fields can significantly increase the size of the response. This results in a larger payload, which can cause the UI to become unresponsive or crash.

## Best Practices to Avoid UI Crashes

To keep the user interface responsive and avoid crashes, follow these recommendations when working with large datasets:

**For long-duration queries with small intervals**

- Increase the interval when querying longer time ranges. Example: Use `8h` or `12h` instead of `5m` if you are querying several days of logs.  
- Limit the time range to reduce the number of records returned by the query.   
- Avoid or limit breakdown fields on large datasets. Breakdown fields multiply the number of results significantly. 

**For tables that include large text fields**

- Avoid including large fields such as `log.body` in dashboard tables unless absolutely necessary.  
- Preview the field before including it in a large table.  
- Use shorter time ranges when you need to view logs with large messages.



prevent-ui-crashes-from-large-queries