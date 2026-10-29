---
title: Date and Time Functions
metaTitle: Date and Time SQL Functions | OpenObserve
description: "OpenObserve SQL date and time functions: filter by a time range, format timestamps in a time zone, and parse text into microsecond timestamps."
---

OpenObserve stores `_timestamp` as an integer number of microseconds since the Unix epoch. The functions on this page work with such integer timestamps. Standard DataFusion functions such as `to_timestamp`, `date_trunc`, and `date_bin` also work; see the [DataFusion documentation](https://datafusion.apache.org/user-guide/sql/scalar_functions.html#time-and-date-functions).

## Function index

| Function | Purpose |
|---|---|
| [`time_range`](#time_range) | Keep records whose timestamp falls between two times |
| [`date_format`](#date_format) | Format an integer timestamp as text in a given time zone |
| [`cast_to_timestamp`](#cast_to_timestamp) | Parse text into a microsecond timestamp |

## `time_range`

**Syntax**: `time_range(field, 'start', 'end')`

**Description**:

- Returns `true` when `field` is at or after `start` and before `end`.
- `field` is an integer timestamp in microseconds, such as `_timestamp`.
- `start` and `end` are strings. Each can be an RFC 3339 time (`2026-10-29T10:00:00Z`), a `YYYY-MM-DD HH:MM:SS` time (read as UTC), or an epoch number in seconds, milliseconds, microseconds, or nanoseconds.

**Example**:
```sql
SELECT _timestamp, k8s_pod_name, log FROM "docs_sql_examples" WHERE time_range(_timestamp, '2026-10-29T10:00:00Z', '2026-10-29T10:15:00Z')
```
This query returns the records from the 15 minutes between 10:00 and 10:15 UTC, within the time range selected in the UI.

:::note[Gotchas]
- `time_range` filters inside the query time range. It does not widen it: records outside the time picker range are never read.
- If `start` or `end` cannot be parsed, the function returns `NULL` and no record matches.
- The value `'0'` means the current time, not "no limit".
:::

## `date_format`

**Syntax**: `date_format(field, 'format', 'timezone')`

**Description**:

- Returns `field` as a string, formatted with `format` in `timezone`.
- `field` is an integer epoch timestamp. Seconds, milliseconds, microseconds, and nanoseconds are detected from the size of the number.
- `format` uses [chrono format specifiers](https://docs.rs/chrono/latest/chrono/format/strftime/index.html), for example `%Y-%m-%d %H:%M:%S`.
- `timezone` is `UTC`, a fixed offset such as `+05:30` or `-07:00`, or an IANA zone name such as `Europe/Berlin`. IANA zones apply daylight saving time for each timestamp.

**Example**:
```sql
SELECT date_format(_timestamp, '%Y-%m-%d %H:00', 'Asia/Kolkata') AS hour_ist, COUNT(*) AS events FROM "docs_sql_examples" GROUP BY hour_ist ORDER BY hour_ist
```
This query counts records per hour, with hours shown in India Standard Time.

:::note[Gotchas]
- `CST` is read as China Standard Time (`+08:00`), not US Central Time. Use `America/Chicago` for US Central.
- An unknown time zone or invalid format returns `NULL`.
- A timestamp of `0` is formatted as the current time.
:::

## `cast_to_timestamp`

**Syntax**: `cast_to_timestamp(expression[, 'format', ...])`

**Description**:

- Parses `expression` and returns an integer timestamp in microseconds, the same unit as `_timestamp`, so you can compare the result with `_timestamp` directly.
- Works like the DataFusion `to_timestamp_micros` function: with no format, RFC 3339 text and numbers are accepted; with one or more [chrono formats](https://docs.rs/chrono/latest/chrono/format/strftime/index.html), each format is tried in order.

**Example**:
```sql
SELECT _timestamp, log FROM "docs_sql_examples" WHERE _timestamp >= cast_to_timestamp('2026-10-29T10:00:00Z')
```
This query returns records from 10:00 UTC onwards.

To parse a time written in a custom format:
```sql
SELECT _timestamp, log FROM "docs_sql_examples" WHERE _timestamp < cast_to_timestamp('29/10/2026 10:15:00', '%d/%m/%Y %H:%M:%S')
```

:::note[Gotchas]
- The result is an integer, not a `TIMESTAMP` value. Wrap it in `to_timestamp_micros()` if you need a timestamp type.
- Text that matches none of the formats fails the query.
:::

## Next steps

- [SQL functions reference](index.md): full list of functions you can use in queries.
- [Aggregate functions](aggregate.md): `histogram` groups records into time buckets.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
