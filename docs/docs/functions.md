
# Functions


## Query Functions

### str_match(field, 'v')

filter the keyword in the field.

### str_match_ignore_case(field, 'v')

filter the keyword in the field with case_insensitive. it can match `KeyWord` or `keyWord`.

### match_all('v')

filter the kekyword in multiple fields. default will search in fields: `log`, `msg`, `message`, `content`, `data`. you can set the full text search fields in the UI or through `index.setting` API.

### match_all_ignore_case('v')

filter the kekyword in multiple fields with case_insensitive.

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

## Temporal Functions

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

- Timestamp strings, the same as supported by the regular timestamp() function (except the output is a timestamp of secondseconds resolution)
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

`histogram(field, 'interval')` or  `histogram(field, num)`

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
