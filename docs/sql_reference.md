This guide describes the custom SQL functions supported in OpenObserve for querying and processing logs and time series data. These functions extend the capabilities of standard SQL by enabling full-text search, array processing, and time-based aggregations.

## Full-text Search Functions
These functions allow you to filter records based on keyword or pattern matches within one or more fields.

### `match_field(field, 'value')`
**Alias for**: `str_match(field, 'v')` <br>
**Description**: <br>
Filters logs by matching the exact string value within the specified field. The match is case-sensitive. <br>
**Example**:
```sql
SELECT * FROM logs WHERE match_field("status", 'Success')
```
This filters logs where the status field contains the string 'Success'. It does not match 'success' or 'SUCCESS'.

### `match_field_ignore_case(field, 'value')`
**Alias for**: `str_match_ignore_case` <br>
**Description**: <br>
Filters logs by matching the string value within the specified field, ignoring case. The match is case-insensitive. <br>
**Example**:
```sql
SELECT * FROM logs WHERE match_field_ignore_case("status", 'success')
```
This matches logs where the status field contains 'success', 'Success', 'SUCCESS', or any other casing variation.



### match_all('v')
**Description**: <br>
Filters the keyword in the fields, whose **Index Type** is set to `Full text search` in streams settings. To utilize Inverted Index, you must set environment variable `ZO_ENABLE_INVERTED_INDEX` to `true` first,
then you can specify Index Type for one or multiple fields (e.g. `body`, `message`) to `Inverted Index` by going to stream settings.

> We have default fields: `log`, `message`, `msg`, `content`, `data`, `json`. you can set the full text search fields in the UI or through `index.setting` API.

_Please note: `match_all` searches through the inverted indexed terms, which are all indexed in lowercase internally. Therefore, search keywords for `match_all` are case-insensitive._

### re_match(field, 'pattern')

use regexp to match the pattern in the field. Please refer to [Regex](https://docs.rs/regex/latest/regex/) for Regex Syntax.

eg:

find `err` or `panic` in log field.

```sql
SELECT * FROM {stream} WHERE re_match(log, '(err|panic)')
```

find `err` with case case_insensitive in log field.

```sql
SELECT * FROM {stream} WHERE re_match(log, '(?i)err')
```

### re_not_match(field, 'pattern')

use regexp to not match the pattern in the field.

## Array Functions

Below array functions work on array fields of a stream. Say, we have a stream named `default` which has an array field named `emails`. An example value of the `emails` field would be - `"[\"email@email.com\", \"john@doe.com\", \"jene@doe.com\"]"`. Note that, the value of `emails` field is a stringified json array.

### arr_descending
Sorts the given array field in descending order. E.g. `arr_descending(arrfield)`. Expects the array fields to be of same type.

Exmaple -
Say, we have a stream named `default` which has an array field `numbers`. `numbers` contains json stringified number array, e.g. - `[1,2,3,4]`. Following query will contain a new field `descending_numbers` (e.g. - `[4,3,2,1]`)

```
SELECT *, arr_descending(numbers) as descending_numbers FROM "default" ORDER BY _timestamp DESC
```

### arrcount
Counts elements in an array. E.g. `arrcount(arrfield)` returns the number of elements in the array field.

E.g. -
```
SELECT *, arrcount(numbers) as number_count FROM "default" ORDER BY _timestamp DESC
```

### arrindex
Selects a range of elements from an array. arrindex(field, start, end) where end is inclusive. E.g. `arrindex(arrfield, 0, 0)` returns `"[\"element1\"]"`.

```
SELECT *, arrindex(elements, 0, 2) as three_elements FROM "default" ORDER BY _timestamp DESC
```

### arrjoin
Concatenates arrays with a specified delimiter. E.g. arrjoin(field, ' | ') returns "element1 | element2 | element3".

```
SELECT *, arrjoin(numbers, ' | ') as joined_numbers FROM "default" ORDER BY _timestamp DESC
```

### arrsort
Sorts the array field in increasing order. E.g. `arrsort(arrfield)`. Expects the array field elements to be of same type (e.g. array of numbers).

```
SELECT *, arrsort(numbers) as increasing_numbers FROM "default" ORDER BY _timestamp DESC
```

### arrzip
Zips multiple array fields together with a delimiter. E.g. `arrzip(arrfield1, arrfield2, ',')` returns "[\"element01,element11\", \"element02,element12\"]".

```
SELECT *, arrzip(numbers, strings, '|') as zipped_field FROM "default" ORDER BY _timestamp DESC
```

### spath
Works on Json object by splitting paths and extracting values. E.g - Say we have a field `json_object_field` which contains value like - `"{\"nested\": {\"value\": 23}}"`. We can extract the value of `nested.value` with this - `spath(json_object_field, 'nested.value')`.

```
SELECT *, spath(json_object_field, 'nested.value') as nested_value FROM "default" ORDER BY _timestamp DESC
```

### cast_to_arr(field)
Casts an json array string to a native datafusion array that can be used with `unnest(cast_to_arr(field))`, and other datafusion array functions such as `array_pop_back(cast_to_arr(arrfield))` etc.

**NOTE**: Native datafusion array functions don't work with stringified json array field, so `cast_to_arr(field)` udf needs to be applied before applying other native datafusion udfs. Native datafusion array functions - https://datafusion.apache.org/user-guide/expressions.html#array-expressions.
Example query on default org, `arr_udf` stream-
```
SELECT _timestamp, bools, games, nums, floats, less, arrzip(bools, games, ' | ') as zipped_bools_games, arrindex(nums, 0, 0) as num_index, array_union(cast_to_arr(nums), cast_to_arr(less)) as union_nums_less, arrjoin(nums, ',') as joined_nums FROM "arr_udf" ORDER BY _timestamp DESC
```

### to_array_string(array)
It is a reverse of `cast_to_arr(field)` to improve the interoperability between stringified json array fields in openobserve streams and native datafusion arrays.

Example -
```
SELECT *, arrsort(to_array_string(array_concat(cast_to_arr(numbers), cast_to_arr(more_numbers)))) as increasing_numbers FROM "default" ORDER BY _timestamp DESC
```
In the above query, we used `cast_to_arr` to convert stringified json array field into native datafusion array to use the `array_concat` udf. `array_concat` returns native datafusion array, so we convert it into stringified json array again in order to use `arrsort`.

More array functions examples -
```
SELECT *, arrzip(arrzip(field1, field2, '|'), field3, '|') as three_fields FROM "stream" ORDER BY _timestamp DESC

select _timestamp, names, games from "test3" where arrindex(arrsort(nums), 0, 1) = '[3,12]' order by _timestamp desc


select _timestamp, names, games from "test3" where arrcount(more) = 3 order by _timestamp desc
```




## Aggregate Functions

Aggregate functions operate on a set of values to compute a single result. Please refer to PostgreSQL for usage of standard SQL functions.

### histogram

`histogram(field, 'interval')` or `histogram(field, num)`

histogram of the field values

- field: must be a timestamp field
- interval: step of histogram, it will auto generate if value miss.
- num: generate how many bucket, it depends on `time_range`, the expression is: `time_range / num = interval`

The `interval` supported:

- second
- minute
- hour
- day
- week

eg:

date interval is `30 seconds`

```sql
SELECT histogram(_timestamp, '30 seconds') AS key, COUNT(*) AS num FROM {stream} GROUP BY key ORDER BY key
```

response:

```json
[
  {
    "key": "2023-01-15 14:00:00",
    "num": 345940
  },
  {
    "key": "2023-01-15 14:00:30",
    "num": 384026
  },
  {
    "key": "2023-01-20 14:01:00",
    "num": 731871
  }
]
```

it will auto generate interval based on time_range:

```sql
SELECT histogram(_timestamp) AS key, COUNT(*) AS num FROM {stream} WHERE time_range(_timestamp, '2022-10-19T15:19:24.587Z','2022-10-19T15:34:24.587Z') GROUP BY key ORDER BY key
```

you can ask for always generate `100` buckets:

```sql
SELECT histogram(_timestamp, 100) AS key, COUNT(*) AS num FROM {stream} WHERE time_range(_timestamp, '2022-10-19T15:19:24.587Z','2022-10-19T15:34:24.587Z') GROUP BY key ORDER BY key
```

## Datafusion SQL reference

OpenObsreve is built on top of datafusion and all SQL query syntax and datafusion supported functions are supported in OpenObserve.

You can find the details at [Datafussion SQL reference](https://datafusion.apache.org/user-guide/sql/index.html)
