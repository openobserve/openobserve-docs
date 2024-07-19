# Functions

## Query Functions

### str_match(field, 'v')

filter the keyword in the field.

### str_match_ignore_case(field, 'v')

filter the keyword in the field with case_insensitive. it can match `KeyWord` or `keyWord`.

### match_all('v')

filter the keyword in the fields, whose **Index Type** is set to `Full text search` in streams settings. To utilize Inverted Index, you must set environment variable `ZO_ENABLE_INVERTED_INDEX` to `true` first,
then you can specify Index Type for one or multiple fields (e.g. `body`, `message`) to `Inverted Index` by going to stream settings.

> We have default fields: `log`, `message`, `msg`, `content`, `data`, `events`, `json`. you can set the full text search fields in the UI or through `index.setting` API.

_Please note: `match_all` searches through the inverted indexed terms, which are all indexed in lowercase internally. Therefore, search keywords for `match_all` are case-insensitive. For case-sensitive searches, please use `match_all_raw` and `match_all_raw_ignore_case` described below accordingly._

### match_all_raw('v')

filter the keyword in multiple fields. Unlike `match_all`, `match_all_raw` does not utilize `Inverted Index`, instead searches through entire original data. This function is case-sensitive.

### match_all_raw_ignore_case('v')

same as `match_all_raw` but with case-insensitive.

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


## Math Functions

### abs(x)

absolute value

### acos(x)

inverse cosine

### asin(x)

inverse sine

### atan(x)

inverse tangent

### atan2(y, x)

inverse tangent of y / x

### ceil(x)

nearest integer greater than or equal to argument

### cos(x)

cosine

### exp(x)

exponential

### floor(x)

nearest integer less than or equal to argument

### ln(x)

natural logarithm

### log10(x)

base 10 logarithm

### log2(x)

base 2 logarithm

### power(base, exponent)

base raised to the power of exponent

### round(x)

round to nearest integer

### signum(x)

sign of the argument (-1, 0, +1)

### sin(x)

sine

### sqrt(x)

square root

### tan(x)

tangent

### trunc(x)

truncate toward zero

## String Functions

### ascii

### bit_length

### btrim

### char_length

### character_length

### concat

### concat_ws

### chr

### initcap

### left

### length

### lower

### lpad

### ltrim

### md5

### octet_length

### repeat

### replace

### reverse

### right

### rpad

### rtrim

### digest

### split_part

### starts_with

### strpos

### substr

### translate

### trim

### upper

## Time and Date Functions

### time_range

`time_range(field, start, end)`

eg:

```sql
time_range(_timestamp, 1682506648678743, 1682506648678743)
```

or

```sql
time_range(_timestamp, '2023-04-05T18:00:00Z',  '2023-04-05T18:10:00Z')
```

### date_format

`date_format(field, format, timezone)`

`format` please refer to: https://docs.rs/chrono/latest/chrono/format/strftime/index.html

eg:

```sql
date_format(_timestamp, '%Y-%m-%d', 'UTC')
```

or

```sql
date_format(_timestamp, '%H:%M:%S', '+08:00')
```

### to_timestamp

`to_timestamp()` is similar to the standard SQL function. It performs conversions to type `Timestamp(Nanoseconds, None)`, from:

- Timestamp strings
  - `1997-01-31T09:26:56.123Z` # RCF3339
  - `1997-01-31T09:26:56.123-05:00` # RCF3339
  - `1997-01-31 09:26:56.123-05:00` # close to RCF3339 but with a space er than T
  - `1997-01-31T09:26:56.123` # close to RCF3339 but no timezone et specified
  - `1997-01-31 09:26:56.123` # close to RCF3339 but uses a space and timezone offset
  - `1997-01-31 09:26:56` # close to RCF3339, no fractional seconds
- An Int64 array/column, values are nanoseconds since Epoch UTC
- Other Timestamp() columns or values

Note that conversions from other Timestamp and Int64 types can also be performed using `CAST(.. AS Timestamp)`. However, the conversion functionality here is present for consistency with the other `to_timestamp_xx()` functions.

### to_timestamp_millis

`to_timestamp_millis()` does conversions to type `Timestamp(Milliseconds, None)`, from:

- Timestamp strings, the same as supported by the regular timestamp() function (except the output is a timestamp of Milliseconds resolution)
  - `1997-01-31T09:26:56.123Z` # RCF3339
  - `1997-01-31T09:26:56.123-05:00` # RCF3339
  - `1997-01-31 09:26:56.123-05:00` # close to RCF3339 but with a space er than T
  - `1997-01-31T09:26:56.123` # close to RCF3339 but no timezone et specified
  - `1997-01-31 09:26:56.123` # close to RCF3339 but uses a space and timezone offset
  - `1997-01-31 09:26:56` # close to RCF3339, no fractional seconds
- An Int64 array/column, values are milliseconds since Epoch UTC
- Other Timestamp() columns or values

Note that `CAST(.. AS Timestamp)` converts to Timestamps with Nanosecond resolution; this function is the only way to convert/cast to millisecond resolution.

### to_timestamp_micros

`to_timestamp_micros()` does conversions to type `Timestamp(Microseconds, None)`, from:

- Timestamp strings, the same as supported by the regular timestamp() function (except the output is a timestamp of microseconds resolution)
  - `1997-01-31T09:26:56.123Z` # RCF3339
  - `1997-01-31T09:26:56.123-05:00` # RCF3339
  - `1997-01-31 09:26:56.123-05:00` # close to RCF3339 but with a space er than T
  - `1997-01-31T09:26:56.123` # close to RCF3339 but no timezone et specified
  - `1997-01-31 09:26:56.123` # close to RCF3339 but uses a space and timezone offset
  - `1997-01-31 09:26:56` # close to RCF3339, no fractional seconds
- An Int64 array/column, values are microseconds since Epoch UTC
- Other Timestamp() columns or values

Note that `CAST(.. AS Timestamp)` converts to Timestamps with Nanosecond resolution; this function is the only way to convert/cast to microsecond resolution.

### to_timestamp_seconds

`to_timestamp_seconds()` does conversions to type `Timestamp(Seconds, None)`, from:

- Timestamp strings, the same as supported by the regular timestamp() function (except the output is a timestamp of seconds resolution)
  - `1997-01-31T09:26:56.123Z` # RCF3339
  - `1997-01-31T09:26:56.123-05:00` # RCF3339
  - `1997-01-31 09:26:56.123-05:00` # close to RCF3339 but with a space er than T
  - `1997-01-31T09:26:56.123` # close to RCF3339 but no timezone et specified
  - `1997-01-31 09:26:56.123` # close to RCF3339 but uses a space and timezone offset
  - `1997-01-31 09:26:56` # close to RCF3339, no fractional seconds
- An Int64 array/column, values are seconds since Epoch UTC
- Other Timestamp() columns or values

Note that `CAST(.. AS Timestamp)` converts to Timestamps with Nanosecond resolution; this function is the only way to convert/cast to seconds resolution.

### extract

`extract(field FROM source)`

The `extract` function retrieves subfields such as year or hour from date/time values. `source` must be a value expression of type timestamp, Date32, or Date64. `field` is an identifier that selects what field to extract from the source value. The `extract` function returns values of type u32.

- `year :extract(year FROM to_timestamp('2020-09-08T12:00:00+00:00')) -> 2020`
- `month:extract(month FROM to_timestamp('2020-09-08T12:00:00+00:00')) -> 9`
- `week :extract(week FROM to_timestamp('2020-09-08T12:00:00+00:00')) -> 37`
- `day: extract(day FROM to_timestamp('2020-09-08T12:00:00+00:00')) -> 8`
- `hour: extract(hour FROM to_timestamp('2020-09-08T12:00:00+00:00')) -> 12`
- `minute: extract(minute FROM to_timestamp('2020-09-08T12:01:00+00:00')) -> 1`
- `second: extract(second FROM to_timestamp('2020-09-08T12:00:03+00:00')) -> 3`

### date_part

`date_part('field', source)`

The `date_part` function is modeled on the postgres equivalent to the SQL-standard function `extract`. Note that here the field parameter needs to be a string value, not a name. The valid field names for `date_part` are the same as for `extract`.

- `date_part('second', to_timestamp('2020-09-08T12:00:12+00:00')) -> 12`

### date_trunc

### date_bin

### from_unixtime

### now

Returns current time as `Timestamp(Nanoseconds, UTC)`. Returns same value for the function wherever it appears in the statement, using a value chosen at planning time.

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

### min

minimum of the field values

### max

maximum of the field values

### count

count the records

### avg

average of the field values

### sum

sum of the field values
