---
title: Full-Text Search Functions in OpenObserve
description: This page describes the full-text search functions supported in OpenObserve, including their syntax, behavior, and examples.
---
# Full-text search functions

The full-text search functions allow you to filter records based on keyword or pattern matches within one or more fields. This page lists the full-text search functions supported in OpenObserve, along with their usage formats, descriptions, and examples.

## Function index

| Function | Purpose |
|---|---|
| [`str_match`](#str_match) | Case-sensitive exact-string match on a single field |
| [`NOT str_match`](#not-str_match) | Inverse of `str_match` |
| [`str_match_ignore_case`](#str_match_ignore_case) | Case-insensitive match on a single field |
| [`match_all`](#match_all) | Case-insensitive keyword search across all full-text-indexed fields |
| [`NOT match_all`](#not-match_all) | Inverse of `match_all` |
| [`re_match`](#re_match) | Regular-expression match on a single field |
| [`re_not_match`](#re_not_match) | Inverse of `re_match` |

## `str_match`

**Syntax**: `str_match(field, 'value')`

**Alias**: `match_field(field, 'value')` *(available in OpenObserve 0.15.0 and later)*

**Description**:

- Filters logs where the specified field contains the exact string value.
- The match is case-sensitive.
- Only logs that include the exact characters and casing specified will be returned.

**Example**:
```sql
SELECT * FROM "default" WHERE str_match(k8s_pod_name, 'main-openobserve-ingester-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains the exact string `main-openobserve-ingester-1`. It does not match values such as `Main-OpenObserve-Ingester-1`, `main-openobserve-ingester-0`, or any case variation.

![str_match](../../images/sql-reference/str-match.png)

## `NOT str_match`

**Syntax**: `NOT str_match(field, 'value')`

**Description**:

- Filters logs where the specified field does NOT contain the exact string value.
- The match is case-sensitive.
- Only logs that do not include the exact characters and casing specified will be returned.
- Can be combined with other conditions using AND/OR operators.

**Example**:
```sql
SELECT * FROM "default" WHERE NOT str_match(k8s_app_instance, 'dev2')
```
![NOT str_match](../../images/sql-reference/not-str-match.png)

**Combining multiple NOT conditions with AND:**
```sql
SELECT * FROM "default" WHERE (NOT str_match(k8s_app_instance, 'dev2')) AND (NOT str_match(k8s_cluster, 'dev2'))
```
![NOT str_match with AND operator](../../images/sql-reference/not-str-match-with-and.png)

**Combining NOT conditions with OR:**
```sql
SELECT * FROM "default" WHERE NOT ((str_match(k8s_app_instance, 'dev2') OR str_match(k8s_cluster, 'dev2')))
```
![NOT str_match with OR operator](../../images/sql-reference/not-str-match-with-or.png)

## `str_match_ignore_case`

**Syntax**: `str_match_ignore_case(field, 'value')`

**Alias**: `match_field_ignore_case(field, 'value')` *(available in OpenObserve 0.15.0 and later)*

**Description**:

- Filters logs where the specified field contains the string value.
- The match is case-insensitive.
- Logs are returned even if the casing of the value differs from what is specified in the query.

**Example**:
```sql
SELECT * FROM "default" WHERE str_match_ignore_case(k8s_pod_name, 'MAIN-OPENOBSERVE-INGESTER-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains any casing variation of `main-openobserve-ingester-1`, such as `MAIN-OPENOBSERVE-INGESTER-1`, `Main-OpenObserve-Ingester-1`, or `main-openobserve-ingester-1`.

![str_match_ignore_case](../../images/sql-reference/str-ignore-case.png)

## `match_all`

**Syntax**: `match_all('value')`

**Description**:

- Filters logs by searching for the keyword across all fields that have the Index Type set to Full Text Search in the [stream settings](../../user-guide/data-processing/streams/schema-settings.md).
- This function is case-insensitive and returns matches regardless of the keyword's casing.

!!! note "Inverted index support"
    To enable support for fields indexed using the Inverted Index method, set the environment variable `ZO_ENABLE_INVERTED_INDEX` to true. Once enabled, you can configure the fields to use the Inverted Index by updating the [stream settings](../../user-guide/data-processing/streams/schema-settings.md) in the user interface or through the [setting API](../api/stream/setting.md).

    The `match_all` function searches through inverted indexed terms, which are internally converted to lowercase. Therefore, keyword searches using `match_all` are always case-insensitive.

**Example**:
```sql
SELECT * FROM "default" WHERE match_all('openobserve-querier')
```
This query returns all logs in the `default` stream where the keyword `openobserve-querier` appears in any of the full-text indexed fields. It matches all casing variations, such as `OpenObserve-Querier` or `OPENOBSERVE-QUERIER`.

![match_all](../../images/sql-reference/match-all.png)

#### More pattern support

The `match_all` function also supports the following patterns for flexible searching:

| Pattern | Example | Description |
|---|---|---|
| Prefix | `match_all('ab*')` | Matches keywords that start with `ab` |
| Postfix | `match_all('*ab')` | Matches keywords that end with `ab` |
| Contains | `match_all('*ab*')` | Matches keywords that contain `ab` anywhere |
| Phrase prefix | `match_all('key1 key2*')` | Matches phrases where the last term uses prefix matching |

## `NOT match_all`

**Syntax**: `NOT match_all('value')`

**Description**:

- Filters logs by excluding records where the keyword appears in any field that has the Index Type set to Full Text Search in the stream settings.
- This function is case-insensitive and excludes matches regardless of the keyword's casing.
- Provides significant performance improvements when used with indexed fields.

!!! warning "Only Full Text Search fields are evaluated"
    `NOT match_all` only searches fields configured as Full Text Search fields. Other fields in the record are not evaluated.

**Example**:
```sql
SELECT * FROM "default" WHERE NOT match_all('foo')
```
This query returns all logs in the `default` stream where the keyword `foo` does NOT appear in any of the full-text indexed fields. Fields not configured for full-text search are ignored.

**Combining NOT match_all with NOT str_match**:
```sql
SELECT * FROM "default" WHERE (NOT str_match(f1, 'bar')) AND (NOT match_all('foo'))
```
This query returns logs where field `f1` does NOT contain `bar` AND no full-text indexed field contains `foo`. In other words, it excludes records that match either condition.

**Using NOT with OR conditions**:
```sql
SELECT * FROM "default" WHERE NOT (str_match(f1, 'bar') OR match_all('foo'))
```
This query returns logs where BOTH conditions are false: field `f1` does NOT contain `bar` AND no full-text indexed field contains `foo`. In other words, it excludes records that match either condition.

## `re_match`

**Syntax**: `re_match(field, 'pattern')`

**Description**:

- Filters logs by applying a regular expression to the specified field.
- The function returns records where the field value matches the given pattern.
- This function is useful for identifying complex patterns, partial matches, or multiple keywords in a single query.
- You can use standard regular expression syntax as defined in the [Regex documentation](https://docs.rs/regex/latest/regex/).

**Example**:
```sql
SELECT * FROM "default" WHERE re_match(k8s_container_name, 'openobserve-querier|controller|nats')
```
This query returns logs from the `default` stream where the `k8s_container_name` field matches any of the strings `openobserve-querier`, `controller`, or `nats`. The match is case-sensitive.

![re_match](../../images/sql-reference/re-match.png)

To perform a case-insensitive search:

```sql
SELECT * FROM "default" WHERE re_match(k8s_container_name, '(?i)openobserve-querier')
```
This query returns logs where the `k8s_container_name` field contains any casing variation of `openobserve-querier`, such as `OpenObserve-Querier` or `OPENOBSERVE-QUERIER`.

![re_match_ignore_case](../../images/sql-reference/re-match-ignore-case.png)

## `re_not_match`

**Syntax**: `re_not_match(field, 'pattern')`

**Description**:

- Filters logs by applying a regular expression to the specified field and returns records that do not match the given pattern.
- This function is useful when you want to exclude specific patterns or values from your search results.

**Example**:
```sql
SELECT * FROM "default" WHERE re_not_match(k8s_container_name, 'openobserve-querier|controller|nats')
```
This query returns logs from the `default` stream where the `k8s_container_name` field does not match any of the values `openobserve-querier`, `controller`, or `nats`. The match is case-sensitive.

![re_not_match](../../images/sql-reference/re-not-match.png)

## Next steps

- [SQL functions reference](index.md): full list of functions you can use in queries.
- [Example queries](../../user-guide/data-exploration/example-queries.md): copy-paste filters and SQL to try.
- [Stream schema settings](../../user-guide/data-processing/streams/schema-settings.md): configure which fields are full-text indexed.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
