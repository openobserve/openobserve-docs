Aggregate functions compute a single result from a set of input values. For usage of standard SQL aggregate functions such as `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`, refer to [PostgreSQL documentation](https://www.postgresql.org/docs/).

---

### `histogram`
**Syntax**: `histogram(field, 'duration')`
**Description:** <br>
Use the `histogram` function to divide your time-based log data into time buckets of a fixed duration and then apply aggregate functions such as `COUNT()` or `SUM()` to those intervals.
This helps in visualizing time-series trends and performing meaningful comparisons over time. <br><br>
**Syntax:** <br>
```sql
histogram(<timestamp_field>, '<duration>')
```

- `timestamp_field`: A valid timestamp field, such as _timestamp.
- `duration`: A fixed time interval in readable units such as '30 seconds', '1 minute', '15 minutes', or '1 hour'.

**Histogram with aggregate function** <br>
```sql
SELECT histogram(_timestamp, '30 seconds') AS key, COUNT(*) AS num
FROM "default"
GROUP BY key
ORDER BY key
```
**Expected Output**: <br>

This query divides the log data into 30-second intervals. 
Each row in the result shows:

- **`key`**: The start time of the 30-second bucket.
- **`num`**: The count of log records that fall within that time bucket.
<br>
![histogram](./images/sql-reference/histogram.png)

!!! note
    To avoid unexpected bucket sizes based on internal defaults, always specify the bucket duration explicitly using units. 

