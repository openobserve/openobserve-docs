# Search

Endpoint: `POST /api/{organization}/_search`

## Request

```json
{
    "query": {
        "sql": "SELECT * FROM {stream} WHERE [condition]",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 0,
        "track_total_hits": false,
        "sql_mode":"context"
    },
    "aggs": {
        "agg1": "SELECT histogram(_timestamp, '5 minute') AS key, COUNT(*) AS num FROM query GROUP BY key ORDER BY key",
        "agg2": "SELECT kubernetes.namespace_name AS namespace, COUNT(*) AS num FROM query GROUP BY namespace ORDER BY namespace",
    }
}
```

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| query      | object    | -             | query params |
| query.sql  | string    | -             | use SQL query data, and filter data by `start_time` and `end_time`, and default order by _timestamp, you can use order by override order, and fetch offset limit by `form` and `size` |
| query.start_time | int64 | 0           | unit: microseconds, filter data by time range, without it, will scan data from first record to `end_time` |
| query.end_time   | int64 | 0           | unit: microseconds, filter data by time range, without it, will scan data from `start_time` to `NOW`    |
| query.from | int64     | 0             | offset in SQL |
| query.size | int64     | 0             | limit in SQL |
| query.track_total_hits | bool  | false | response real total of the query SQL, you can set it to true for response total. when you have aggs, this value will auto set to true. |
| query.sql_mode | string | context      | mode: context / full, default is `context` mode, you cann't use `limit` `group by` in query.sql, and will use the SQL result as a context of aggregations. aggregation will get result from context. You you set it to `full`, in full mode, you can write a full SQL in query.sql, it supports `limit` `group by` and keywords, but it doesn't support aggregation. |
| aggs       | object    | -             | aggregation params, you can ignore it if you have no aggregations. |
| aggs.{name} | string | -           | SQL for each aggregation, it must `SELECT FROMM query`, the table `query` is a context from `query.sql`. |


## Response

```json
{
	"took": 155,
	"hits": [
		{
			"_p": "F",
			"_timestamp": 1674213225158000,
			"kubernetes": {
				"annotations": {
					"kubernetes": {
						"io/psp": "eks.privileged"
					}
				},
				"container_hash": "dkr.ecr.us-west-2.amazonaws.com/ziox@sha256:3dbbb0dc1eab2d5a3b3e4a75fd87d194e8095c92d7b2b62e7cdbd07020f54589",
				"container_image": "dkr.ecr.us-west-2.amazonaws.com/ziox:v0.0.3",
				"container_name": "ziox",
				"docker_id": "eb0983bdb9ff9360d227e6a0b268fe3b24a0868c2c2d725a1516c11e88bf5789",
				"host": "ip.us-east-2.compute.internal",
				"labels": {
					"app": "ziox",
					"controller-revision-hash": "ziox-ingester-579b7767cf",
					"name": "ziox-ingester",
					"role": "ingester",
					"statefulset": {
						"kubernetes": {
							"io/pod-name": "ziox-ingester-0"
						}
					}
				},
				"namespace_name": "ziox",
				"pod_id": "35a0421f-9203-4d73-9663-9ff0ce26d409",
				"pod_name": "ziox-ingester-0"
			},
			"log": "[2023-01-20T11:13:45Z INFO  actix_web::middleware::logger] 10.2.80.192 \"POST /api/demo/_bulk HTTP/1.1\" 200 68 \"-\" \"go-resty/2.7.0 (https://github.com/go-resty/resty)\" 0.001074",
			"stream": "stderr"
		}
	],
	"aggs": {
		"agg1": [
			{
				"key": "2023-01-15 14:00:00",
				"num": 345940
			},
			{
				"key": "2023-01-15 19:00:00",
				"num": 384026
			},
			{
				"key": "2023-01-20 09:00:00",
				"num": 731871
			}
		],
        "agg2": [
            {
                "namespace": "default",
                "num": 1234
            }
        ]
	},
	"total": 27179431,
	"from": 0,
	"size": 1,
	"scan_size": 28943
}
```

Response description:

Description

| Field name | Data type | Default value | Description |
|------------|-----------|---------------|-------------|
| took       | int64     | -             | unit: milliseconds, query execute time |
| total      | int64     | 0             | it will response zero if `query.track_total_hits` is false or there is no aggregations or it will response the total record the `query.sql` can matched. |
| from       | int64     | 0             | value from `query.from` |
| size       | int64     | 0             | value from `query.size` |
| scan_size  | int64     | 0             | unit: MB, it response the data size scale when execute the query. |
| hits       | array     | -             | records for query, each record is a log row what you ingested. |
| aggs       | object    | -             | values for aggregations |
| aggs.{name} | array    | -             | records for the aggregation, the fields are selected by your aggregation SQL. |


## SQL Syntax

Please refer to [PostgreSQL](https://www.postgresql.org/docs/current/sql-syntax.html) for SQL Syntax.

Something need highlighted:

- We have a build-in time field, `_timestamp` you can use it to do time range filter.
- Field name can not start with `@`.
- Field name can use double quote or without quote.
- Field integer value without quote.
- Field string value must use single quote.

## Limitation

- For now, we don't support `union`, `join` in SQL, we supported only one table for query.
- You should give a time range for each query or it will scan all data, it is a very expensive operate.


## Examples

Here list some common examples, if you want more example please create a issue tell us, we will add it.

### Query latest 10 record logs with histogram aggregation

```json
{
    "query": {
        "sql": "SELECT * FROM {stream}",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    },
    "aggs": {
        "histogram": "SELECT histogram(_timestamp, '5 minute') AS key, COUNT(*) AS num FROM query GROUP BY key ORDER BY key"
    }
}
```

### Query latest 10 record logs

```json
{
    "query": {
        "sql": "SELECT * FROM {stream}",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    }
}
```

### Query latest 10 record logs with filter

```json
{
    "query": {
        "sql": "SELECT * FROM {stream} WHERE kubernetes.namespace_name='default' AND code=200 ",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    }
}
```

### Full text query

```json
{
    "query": {
        "sql": "SELECT * FROM {stream} WHERE match_all('err') ",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    }
}
```

### Match on a filed (log)

```json
{
    "query": {
        "sql": "SELECT * FROM {stream} WHERE str_match(log, 'err') ",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    }
}
```

### Histogram aggregation (full mode)

```json
{
    "query": {
       "sql": "SELECT histogram(_timestamp, '5 minute') AS key, COUNT(*) AS num FROM {stream} GROUP BY key ORDER BY key LIMIT 10 OFFSET 1",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "sql_mode": "full"
    }
}
```

### Term aggregation (full mode)

```json
{
    "query": {
       "sql": "SELECT kubernetes.namespace_name AS namespace, COUNT(*) AS num FROM {stream} GROUP BY namespace ORDER BY namespace",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "sql_mode": "full"
    }
}
```

### Use custom functions 

```json
{
    "query": {
       "sql": "SELECT *, my_func(log) as mykey FROM {stream}",
        "start_time": 1674789786006000,
        "end_time": 1674789786006000,
        "from": 0,
        "size": 10
    }
}
```
