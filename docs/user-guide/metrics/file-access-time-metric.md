---
description: >-
  Analyze file access age in OpenObserve to gauge query performance. Buckets
  track how recently files were accessed, revealing hot vs. cold data trends.
---
## What Is File Access Time Metric?

This histogram metric helps analyze the age of files accessed by the querier. This helps in understanding the distribution of file access times across queries and evaluating system performance.

## How Does It Works?
The metric tracks file age in hourly buckets ranging from 1 hour to 32 hours. Each data point represents how long ago a file was accessed during query execution. 

**The metric is exposed as:**

```
Zo_file_access_time_bucket
```

## Example Usage
To calculate the 95th percentile of file access age for logs over a 5-minute window:

```
histogram_quantile(0.95, rate(zo_file_access_time_bucket{stream_type="logs"}[5m]))
```

This query returns the file age below which 95 percent of accesses occurred, offering insights into hot versus cold file reads during queries.
