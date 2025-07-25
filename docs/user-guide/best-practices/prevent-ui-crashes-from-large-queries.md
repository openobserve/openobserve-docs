---
description: >-
  How to avoid UI crashes by limiting long-range queries with small intervals
  and large text fields. Optimize dashboards to stay responsive.
---
OpenObserve does not restrict the number of records returned or the length of the time range in a query. You can query a few minutes or a longer time range, depending on your data retention settings (by default, 1 year, may vary by configuration).

!!! warning
    Queries that return a **large number of records** or **generate a large payload size** can overload the browser. This may cause the UI to crash, particularly on the **Log Search** page or in **Dashboard panels**.

This typically happens when:

- A small interval is used over a long time range, resulting in too many rows.
- Large text fields, such as `log.body`, are included, increasing payload size.


 
Use the guidance below to understand these risks and avoid them when building queries and dashboards.

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


!!! Note
    **In Dashboard Panels- Breakdown Fields Multiply the Problem**

    In dashboard panels, if you add a breakdown to the query (e.g., by `log.level`), it multiplies the number of rows. If the query is long range and has small time interval, adding breakdown to the Panels would further worsen the problem. 
    <br> For example,

    - You already have 2,000 time buckets  
    - `log.level` has 5 unique values: `INFO`, `ERROR`, `DEBUG`, `WARN`, `TRACE`

    The result becomes: 2,000 time buckets × 5 breakdown values = 10,000 rows

    That is 5X more data than without the breakdown. 

    All of it must be fetched, loaded, and rendered in your browser. It ends up crashing the UI. 

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
