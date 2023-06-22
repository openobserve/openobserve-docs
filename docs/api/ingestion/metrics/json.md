# Metrics Ingestion - JSON

Endpoint: `POST /api/{organization}/ingest/metrics/_json`

This will upload multiple records in batch with standard json format.

### Data structure

```json
[
    {
        "__name__": "stream name",
        "__type__": "counter / gauge / histogram / summary",
        "label_name1": "label_value1",
        "label_name2": "label_value2",
        "_timestamp": 0, // unix timestamp in millisecond
        "value": 0.0 // float64 value
    }
]
```

### Limitation

- must use `__name__` set stream name.
- must use `__type__` set metrics type. and the type can't be updated after first record
- `_timestamp` needs UNIX timestamp or empty will fill by current timestamp
- `value` should be float64 or int64

### Metrics type

- counter
- guage
- histogram
- summary

You can find the detail at here: [https://prometheus.io/docs/concepts/metric_types/](https://prometheus.io/docs/concepts/metric_types/)

## Request 

e.g. `POST /api/myorg/ingest/metrics/_json`

```json
[
	{
		"__name__": "cpu",
		"__type__": "gauge",
		"namespace": "ziox",
		"container": "zo1",
        "_timestamp": 1687260776548485,
		"value": 1.31
	},
	{
		"__name__": "cpu",
		"__type__": "gauge",
		"namespace": "ziox",
		"container": "zo2",
		"value": 0.31
	}
]
```

Each line is one record.

## Response

```json
{
	"code": 200,
	"status": [
		{
			"name": "cpu",
			"successful": 2,
			"failed": 0
		}
	]
}
```

Returns successful and failed count for each stream.

## Restriction on number of fields/columns per record
> Applicable to cloud version

Please note only records having 200 or less fields/columns will be considered for ingestion , records having more than 200 fields/columns will be discarded with failed status.

> Applicable to open source version

One can configure ZO_COLS_PER_RECORD_LIMIT to set desired value for allowed number of fields/columns per record.

## Timestamp

By default we add a field `_timestamp` for each record with the value of `NOW` in microseconds (unix epoch value). 

we support use of two fields to override the default value.

- _timestamp
- @timestamp

we only support `timestamp (unix epoch value)` as data format for `timestamp`, but we can support:

- seconds
- miliseconds
- microseconds

eg:

use miliseconds

```json
[{
	"kubernetes_container_name": "prometheus", 
	"_timestamp": 1674789786006
}]
```

use microseconds

```json
[{
	"kubernetes_container_name": "prometheus", 
	"_timestamp": 1674789786006000
}]
```
