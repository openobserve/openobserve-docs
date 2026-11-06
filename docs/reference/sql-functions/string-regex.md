---
title: String and Regex Functions
metaTitle: String and Regex SQL Functions | OpenObserve
description: "OpenObserve SQL functions that extract values with regular expressions and split strings into arrays: re_matches, regexp_match_to_fields, string_to_array_v2."
---

These functions pull values out of text fields at query time. To filter records with a regular expression, use [`re_match` and `re_not_match`](full-text-search.md#re_match).

All patterns use [Rust regex syntax](https://docs.rs/regex/latest/regex/#syntax). Look-ahead, look-behind, and back-references are not supported.

## Function index

| Function | Purpose |
|---|---|
| [`re_matches`](#re_matches) | Return every match of a pattern as an array |
| [`regexp_match_to_fields`](#regexp_match_to_fields) | Return named capture groups as a struct with one field per group |
| [`string_to_array_v2`](#string_to_array_v2) | Split a string on a set of delimiter characters |

## `re_matches`

**Syntax**: `re_matches(field, 'pattern')`

**Description**:

- Returns an array with one entry per match of `pattern` in `field`.
- When the pattern has capture groups, each entry is the innermost group that matched. Without groups, each entry is the whole match.
- Double quotes around an extracted value are removed, so `"value":"hello"` with pattern `"value":("[^"]+")` gives `hello`.
- Returns `NULL` when the pattern does not match.

**Example**:
```sql
SELECT _timestamp, log, re_matches(log, 'user=(\w+)') AS users FROM "docs_sql_examples" WHERE re_match(log, 'user=')
```
For a log line `login ok user=alice retry user=bob`, `users` is `["alice", "bob"]`.

:::note[Gotchas]
- Filter with `re_match` first, as in the example. `re_matches` runs on every row it is given and is slower than a filter.
- The result is an array. Use array functions such as `array_length(users)` or `users[1]` (1-based) to work with it.
:::

## `regexp_match_to_fields`

**Syntax**: `regexp_match_to_fields(field, 'pattern')`

**Description**:

- Matches `pattern` against `field` and returns a struct with one field per named capture group, `(?P<name>...)` or `(?<name>...)`.
- Useful to break one unstructured line into named parts without a pipeline function.

**Example**:
```sql
SELECT regexp_match_to_fields(log, '(?P<client_ip>[^\s]+) (?P<method>[A-Z]+) (?P<path>[^\s]+)') AS parsed FROM "docs_sql_examples" WHERE str_match(log, 'GET') LIMIT 1
```
For a log line `15.128.22.213 GET /api/orders 200`, `parsed` is `{client_ip: 15.128.22.213, method: GET, path: /api/orders}`.

:::note[Gotchas]
- The pattern must use named capture groups. A pattern with only unnamed groups fails the query.
- The function returns the captures of the first row it reads, for every row in that batch. Use it on a single record (as with `LIMIT 1` above), or use [`re_matches`](#re_matches) or a [VRL function](other.md#vrl-functions-in-sql) to parse many rows.
- If the first row does not match the pattern, the query fails.
:::

## `string_to_array_v2`

**Syntax**: `string_to_array_v2(field, 'delimiters')`

**Description**:

- Splits `field` into an array of strings.
- Every character in `delimiters` is a separator on its own. `', ;'` splits on commas, spaces, and semicolons.
- Empty parts are dropped, so `a,,b` gives `["a", "b"]`.
- An empty `delimiters` string returns the whole value as a one-element array.

**Example**:
```sql
SELECT _timestamp, path, string_to_array_v2(path, '/?&') AS path_parts FROM "docs_sql_examples"
```
For a `path` of `/api/orders?id=42&page=2`, `path_parts` is `["api", "orders", "id=42", "page=2"]`.

:::note[Gotchas]
- `delimiters` is a set of single characters, not a multi-character separator. `string_to_array_v2(x, '::')` splits on every `:`. For a multi-character separator, use the DataFusion `string_to_array` function.
- To work with stringified JSON arrays, use the [array functions](array.md) instead.
:::

## Next steps

- [SQL functions reference](index.md): full list of functions you can use in queries.
- [Full-text search functions](full-text-search.md): filter records by keyword or pattern.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
