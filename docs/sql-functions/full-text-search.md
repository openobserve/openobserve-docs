---
title: Full-Text Search Functions in OpenObserve
description: This page describes the full-text search functions supported in OpenObserve, including their syntax, behavior, and examples. Functions such as str_match, str_match_ignore_case, match_all, re_match, and re_not_match allow users to filter logs based on exact string matches, case-insensitive searches, keyword searches across multiple fields, and pattern-based filtering using regular expressions. The guide also explains the role of inverted indexing and how to enable it for enhanced search coverage. Sample queries and output visuals are provided to help users apply these functions effectively in log analysis.
---
The full-text search functions allow you to filter records based on keyword or pattern matches within one or more fields. <br>This page lists the full-text search functions supported in OpenObserve, along with their usage formats, descriptions, and examples.

---

### `str_match`

**Syntax**: `str_match(field, 'value')` <br>
**Alias**: `match_field(field, 'value')` 
>The alias is available in OpenObserve version 0.15.0 and later.
 
**Description**: <br>

- Filters logs where the specified field contains the exact string value. 
- The match is case-sensitive. 
- Only logs that include the exact characters and casing specified will be returned. <br>

**Example**:
```sql
SELECT * FROM "default" WHERE str_match(k8s_pod_name, 'main-openobserve-ingester-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains the exact string `main-openobserve-ingester-1`. It does not match values such as `Main-OpenObserve-Ingester-1`, `main-openobserve-ingester-0`, or any case variation.
<br>
![str_match](../images/sql-reference/str-match.png)


---
### `str_match_ignore_case`

**Syntax**: `str_match_ignore_case(field, 'value')` <br>
**Alias**: `match_field_ignore_case(field, 'value')` 
> The alias is available in OpenObserve version 0.15.0 and later.

**Description**: <br>

- Filters logs where the specified field contains the string value. 
- The match is case-insensitive. 
- Logs are returned even if the casing of the value differs from what is specified in the query. <br>

**Example**:
```sql
SELECT * FROM "default" WHERE str_match_ignore_case(k8s_pod_name, 'MAIN-OPENOBSERVE-INGESTER-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains any casing variation of `main-openobserve-ingester-1`, such as `MAIN-OPENOBSERVE-INGESTER-1`, `Main-OpenObserve-Ingester-1`, or `main-openobserve-ingester-1`.
<br>
![str_match_ignore_case](../images/sql-reference/str-ignore-case.png)

---

### `match_all`
**Syntax**: `match_all('value')` <br>
**Description**: <br>

- Filters logs by searching for the keyword across all fields that have the Index Type set to Full Text Search in the [stream settings](../user-guide/streams/schema-settings/). 
- This function is case-insensitive and returns matches regardless of the keyword's casing.

!!! Note 
    To enable support for fields indexed using the Inverted Index method, set the environment variable `ZO_ENABLE_INVERTED_INDEX` to true. Once enabled, you can configure the fields to use the Inverted Index by updating the [stream settings](../user-guide/streams/schema-settings/) in the user interface or through the [setting API](../api/stream/setting/).

    The `match_all` function searches through inverted indexed terms, which are internally converted to lowercase. Therefore, keyword searches using `match_all` are always case-insensitive.

**Example**:
```sql
SELECT * FROM "default" WHERE match_all('openobserve-querier')
```
This query returns all logs in the `default` stream where the keyword `openobserve-querier` appears in any of the full-text indexed fields. It matches all casing variations, such as `OpenObserve-Querier` or `OPENOBSERVE-QUERIER`.
<br>
![match_all](../images/sql-reference/match-all.png)

---

### `re_match`
**Syntax**: `re_match(field, 'pattern')` <br>
**Description**: <br>

- Filters logs by applying a regular expression to the specified field. 
- The function returns records where the field value matches the given pattern. 
- This function is useful for identifying complex patterns, partial matches, or multiple keywords in a single query.

> You can use standard regular expression syntax as defined in the [Regex Documentation](https://docs.rs/regex/latest/regex/).


**Example**:

```sql
SELECT * FROM "default" WHERE re_match(k8s_container_name, 'openobserve-querier|controller|nats')
```
This query returns logs from the `default` stream where the `k8s_container_name` field matches any of the strings `openobserve-querier`, `controller`, or `nats`. The match is case-sensitive.
<br>
![re_match](../images/sql-reference/re-match.png)


To perform a case-insensitive search:

```sql
SELECT * FROM "default" WHERE re_match(k8s_container_name, '(?i)openobserve-querier')
```
This query returns logs where the `k8s_container_name` field contains any casing variation of `openobserve-querier`, such as `OpenObserve-Querier` or `OPENOBSERVE-QUERIER`.
<br>
![re_match_ignore_case](../images/sql-reference/re-match-ignore-case.png)

---

### `re_not_match`
**Syntax**: `re_not_match(field, 'pattern')` <br>
**Description**: <br>

- Filters logs by applying a regular expression to the specified field and returns records that do not match the given pattern.
- This function is useful when you want to exclude specific patterns or values from your search results.

**Example**:
```sql
SELECT * FROM "default" WHERE re_not_match(k8s_container_name, 'openobserve-querier|controller|nats')
```
This query returns logs from the `default` stream where the `k8s_container_name` field does not match any of the values `openobserve-querier`, `controller`, or `nats`. The match is case-sensitive.
<br>
![re_not_match](../images/sql-reference/re-not-match.png)

