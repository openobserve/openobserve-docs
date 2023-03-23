# Concepts

## Organizations

An organization is logical entity which groups various streams, users, functions in ZincObserve. An organization can represent an enterprize, a department of an enterprize, or an application. All streams, users, functions, etc. are scoped to an organization.

## Streams

A stream in ZincObserve is sequence of events (logs/metrics/traces) that share the same source, e.g. logs from a specific application or logs from an enterprize.

## Data Ingestion

### Data Partitioning

Data ingested to ZincOberserve is partioned by default based on year month day & hour, users can additionally specify partioning key/keys which will be used to patition data. 

## Logs

Log is a type of stream, which caters to log events from applications.

## Users

> Applicable to cloud version

Users are indiviuals using application by logging in with appropriate credentials. As of today we support Google as social account for login. One can also sign up by providing valid email. 

### User Roles

A user in ZincObserve can have role `admin` or `member`.

Users with `admin` role have greater priviledges as compared to users with `member` role, e.g., inviting other users by email to an organization.

## Functions

Functions in ZincObserve can used during ingestion & query to aid advanced capabilities like enrichment, redaction, log reduction, compliance, etc. A function is defined in Lua script.

## Timestamp

`_timestamp` is considered as timestamp column in ZincObserve, if `_timestamp` or `@timestamp` isn't present in data being ingested, we add `_timestamp` to each record with the value of `NOW` upto microseconds precision.

For input data with key as `_timestamp`/`@timestamp`, for the value we support the following data types/format:

- microseconds
- string value
- RFC 3339 and ISO 8601 date and time string such as "1996-12-19T16:39:57-08:00"
- RFC 2822 date and time string such as "Tue, 1 Jul 2003 10:52:37 +0200"

> Applicable only to open source version

If user wants support for key other than `_timestamp`/`@timestamp` user can use `ZO_TIME_STAMP_COL` configuation to specify timestamp key.

## Searching

### Full text search

For full text search user can use query in-built query functions like `match_all`, `match_all_ignore_case`, please note user can restrict full text search to specific fields/columns in log stream by selecting fields/columns from stream in stream details screen.
