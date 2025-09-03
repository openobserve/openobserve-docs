---
description: >-
  Explore OpenObserve's full-text, array, and aggregate functions for advanced
  querying, filtering, and analysis using SQL and DataFusion support.
---
This guide describes the custom SQL functions supported in OpenObserve for querying and processing logs and time series data. These functions extend the capabilities of standard SQL by enabling full-text search, array processing, and time-based aggregations.

## Full-text Search Functions
These functions allow you to filter records based on keyword or pattern matches within one or more fields.

### `str_match(field, 'value')`

**Alias**: `match_field(field, 'value')` (Available in OpenObserve version 0.15.0 and later) <br> 

**Description**: <br>

- Filters logs where the specified field contains the exact string value. 
- The match is case-sensitive. 
- Only logs that include the exact characters and casing specified will be returned. <br>

**Example**:
```sql
SELECT * FROM "default" WHERE str_match(k8s_pod_name, 'main-openobserve-ingester-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains the exact string `main-openobserve-ingester-1`. It does not match values such as `Main-OpenObserve-Ingester-1`, `main-openobserve-ingester-0`, or any case variation.

![str_match](./images/sql-reference/str-match.png)

---
### `str_match_ignore_case(field, 'value')`
**Alias**: `match_field_ignore_case(field, 'value')` (Available in OpenObserve version 0.15.0 and later)<br>

**Description**: <br>

- Filters logs where the specified field contains the string value. 
- The match is case-insensitive. 
- Logs are returned even if the casing of the value differs from what is specified in the query. <br>

**Example**:
```sql
SELECT * FROM "default" WHERE str_match_ignore_case(k8s_pod_name, 'MAIN-OPENOBSERVE-INGESTER-1')
```
This query filters logs from the `default` stream where the `k8s_pod_name` field contains any casing variation of `main-openobserve-ingester-1`, such as `MAIN-OPENOBSERVE-INGESTER-1`, `Main-OpenObserve-Ingester-1`, or `main-openobserve-ingester-1`.

![str_match_ignore_case](./images/sql-reference/str-ignore-case.png)

---

### `match_all('value')`
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

![match_all](./images/sql-reference/match-all.png)

---
### `re_match(field, 'pattern')`
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

![re_match](./images/sql-reference/re-match.png)


To perform a case-insensitive search:

```sql
SELECT * FROM "default" WHERE re_match(k8s_container_name, '(?i)openobserve-querier')
```
This query returns logs where the `k8s_container_name` field contains any casing variation of `openobserve-querier`, such as `OpenObserve-Querier` or `OPENOBSERVE-QUERIER`.

![re_match_ignore_case](./images/sql-reference/re-match-ignore-case.png)

---

### `re_not_match(field, 'pattern')`
**Description**: <br>

- Filters logs by applying a regular expression to the specified field and returns records that do not match the given pattern.
- This function is useful when you want to exclude specific patterns or values from your search results.

**Example**:
```sql
SELECT * FROM "default" WHERE re_not_match(k8s_container_name, 'openobserve-querier|controller|nats')
```
This query returns logs from the `default` stream where the `k8s_container_name` field does not match any of the values `openobserve-querier`, `controller`, or `nats`. The match is case-sensitive.

![re_not_match](./images/sql-reference/re-not-match.png)

---

## Array Functions
The array functions operate on fields that contain arrays. In OpenObserve, array fields are typically stored as stringified JSON arrays.
<br>For example, in a stream named `default`, there may be a field named `emails` that contains the following value:
`["jim@email.com", "john@doe.com", "jene@doe.com"]` <br>
Although the value appears as a valid array, it is stored as a string. The array functions in this section are designed to work on such stringified JSON arrays and provide support for sorting, counting, joining, slicing, and combining elements.

--- 

### `arr_descending(field)`
**Description**: <br>
ß
- Sorts the elements in the specified array field in descending order. 
- The array must be a stringified JSON array. 
- All elements in the array must be of the same type.

**Example**:
```sql
SELECT *, arr_descending(emails) as sorted_emails FROM "default" ORDER BY _timestamp DESC
```
In this query, the emails field contains a stringified JSON array such as `["jim@email.com", "john@doe.com", "jene@doe.com"]`. The query creates a new field `sorted_emails`, which contains the elements sorted in descending order:
`["john@doe.com", "jene@doe.com", "jim@email.com"]`

![arr_descending](./images/sql-reference/array-descending.png)

---

### `arrcount(arrfield)`
**Description**: <br>
Counts the number of elements in a stringified JSON array stored in the specified field. The field must contain a valid JSON array as a string.

**Example**:
```sql
SELECT *, arrcount(emails) as email_count FROM "default" ORDER BY _timestamp DESC
```
In this query, the `emails` field contains a value such as `["jim@email.com", "john@doe.com", "jene@doe.com"]`. The function counts the number of elements in the array and returns the result: `3`.

![arrcount](./images/sql-reference/array-count.png)

---

### `arrindex(field, start, end)`
**Description:**

- Returns a subset of elements from a stringified JSON array stored in the specified field. 
- The function selects a range starting from the start index up to and including the end index. 

**Example:**
```sql
SELECT *, arrindex(emails, 0, 1) as selected_emails FROM "default" ORDER BY _timestamp DESC
```
In this query, the `emails` field contains a value such as `["jim@email.com", "john@doe.com", "jene@doe.com"]`. The function extracts elements at index `0` and `1`. The result is:
`["jim@email.com", "john@doe.com"]`

![arrindex](./images/sql-reference/array-index.png)

---

### `arrjoin(field, delimiter)`
**Description:**

- Concatenates all elements in a stringified JSON array using the specified delimiter. 
- The output is a single string where array elements are joined by the delimiter in the order they appear.

```sql
SELECT *, arrjoin(emails, ' | ') as joined_numbers FROM "default" ORDER BY _timestamp DESC
```
In this query, the `emails` field contains a value such as `["jim@email.com", "john@doe.com", "jene@doe.com"]`. The function joins all elements using the delimiter `|`. The result is:
`"jim@email.com | john@doe.com | jene@doe.com"`

![arr_join](./images/sql-reference/array-join.png)

---

### `arrsort(field)`
**Description:** 

- Sorts the array field in increasing order. 
- All elements must be of the same type, such as numbers or strings.

```sql
SELECT *, arrsort(emails) as increasing_numbers FROM "default" ORDER BY _timestamp DESC
```
In this query, the emails field contains a value such as `["jim@email.com", "john@doe.com", "jene@doe.com"]`. The function sorts the elements in increasing lexicographical order. The result is:
`["jene@doe.com", "jim@email.com", "john@doe.com"]`.

![arrsort](./images/sql-reference/array-sort.png)


---

### `arrzip(field1, field2, delimiter)`
**Description:**

- Combines two stringified JSON arrays element by element using the specified delimiter. 
- Each element from the first array is joined with the corresponding element from the second array. 
- The result is a new array of joined values.

```sql
SELECT *, arrzip(emails, usernames, '|') as zipped_field FROM "default" ORDER BY _timestamp DESC
```
In this query, the `emails` field contains `["jim@email.com", "john@doe.com"]` and the `usernames` field contains `["jim", "john"]`. The function combines each pair of elements using the delimiter `|`.
The result is:
`["jim@email.com | jim", "john@doe.com | john"]`

![arrzip](./images/sql-reference/array-zip.png)

---

### `spath(field, path)`
**Description:**

- Extracts a nested value from a JSON object stored as a string by following the specified path. 
- The path must use dot notation to access nested keys. 

**Example:** 
```sql
SELECT *, spath(json_object_field, 'nested.value') as extracted_value FROM "default" ORDER BY _timestamp DESC
```
In this query, the `json_object_field` contains a value such as:

```json
{"nested": {"value": 23}}
```
The function navigates the JSON structure and extracts the value associated with the path `nested.value`.
The result is: `23`.

Sample Input in log stream:

![Nested Input](./images/sql-reference/nested-input.png)

Running SQL query using spath():

![Nested value extraction](./images/sql-reference/nested.png)

---

### `cast_to_arr(field)`
**Description:**

- Converts a stringified JSON array into a native DataFusion array. 
- This is required before applying native DataFusion array functions such as `unnest`, `array_union`, or `array_pop_back`. 
- Native functions do not work directly on stringified arrays, so this conversion is mandatory.

> Learn more about the [native datafusion array functions](https://datafusion.apache.org/user-guide/expressions.html#array-expressions).

Example:

```sql
SELECT _timestamp, nums, less,
array_union(cast_to_arr(nums), cast_to_arr(less)) as union_result
FROM "arr_udf"
ORDER BY _timestamp DESC
```

In this query:

- `nums` and `less` are fields that contain stringified JSON arrays, such as `[1, 2, 3]` and `[3, 4]`.
- The function `cast_to_arr` is used to convert these fields into native arrays.
- The result of `array_union` is a merged array with unique values: `[1, 2, 3, 4]`.

![cast_to_arr](./images/sql-reference/cast-to-array.png)

---

### `to_array_string(array)`
**Description:**

- Converts a native DataFusion array back into a stringified JSON array. 
- This is useful when you want to apply OpenObserve-specific array functions such as `arrsort` or `arrjoin` after using native array operations like `array_concat`.

**Example:**
```sql
SELECT *,
arrsort(to_array_string(array_concat(cast_to_arr(numbers), cast_to_arr(more_numbers)))) as sorted_result
FROM "default"
ORDER BY _timestamp DESC
```
In this query:

- `numbers` and `more_numbers` are stringified JSON arrays.
- `cast_to_arr` converts them into native arrays.
- `array_concat` joins the two native arrays.
- `to_array_string` converts the result back into a stringified array.
- `arrsort` then sorts the array in increasing order.

![to_array_string](./images/sql-reference/to-array-string.png)

---

## Aggregate Functions
Aggregate functions compute a single result from a set of input values. For usage of standard SQL aggregate functions such as `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`, refer to [PostgreSQL documentation](https://www.postgresql.org/docs/).

### `histogram(field, 'duration')`
**Description:** <br>
Use the `histogram` function to divide your time-based log data into time buckets of a fixed duration and then apply aggregate functions such as `COUNT()` or `SUM()` to those intervals.
This helps in visualizing time-series trends and performing meaningful comparisons over time. <br><br>
**Syntax:** <br>
```sql
histogram(<timestamp_field>, '<duration>')
```

- `timestamp_field`: A valid timestamp field, such as _timestamp.
- `duration`: A fixed time interval in readable units such as '30 seconds', '1 minute', '15 minutes', or '1 hour'.

**Histogram with aggregate function** <br>
```sql
SELECT histogram(_timestamp, '30 seconds') AS key, COUNT(*) AS num
FROM "default"
GROUP BY key
ORDER BY key
```
**Expected Output**: <br>

This query divides the log data into 30-second intervals. 
Each row in the result shows:

- **`key`**: The start time of the 30-second bucket.
- **`num`**: The count of log records that fall within that time bucket.

![histogram](./images/sql-reference/histogram.png)

!!! note
    To avoid unexpected bucket sizes based on internal defaults, always specify the bucket duration explicitly using units. 

---

### `approx_topk(field, k)`

**Description:**

- Returns the top `K` most frequent values for a specified field using the **Space-Saving algorithm** optimized for high-cardinality data.
- Results are approximate due to distributed processing. Globally significant values may be missed if they do not appear in enough partitions' local top-K results.

**Example:** 
```sql
SELECT approx_topk(clientip, 10) FROM "default"
```
It returns the `10` most frequently occurring client IP addresses from the `default` stream. 

**Function result (returns an object with an array):**

```json
{
  "item": [
    {"clientip": "192.168.1.100", "request_count": 2650},
    {"clientip": "10.0.0.5", "request_count": 2230},
    {"clientip": "203.0.113.50", "request_count": 2210},
    {"clientip": "198.51.100.75", "request_count": 1970},
    {"clientip": "172.16.0.10", "request_count": 1930},
    {"clientip": "192.168.1.200", "request_count": 1830},
    {"clientip": "203.0.113.80", "request_count": 1630},
    {"clientip": "10.0.0.25", "request_count": 1590},
    {"clientip": "172.16.0.30", "request_count": 1550},
    {"clientip": "192.168.1.150", "request_count": 1410}
  ]
}
```
**Use the `unnest()` to extract usable results:**

```sql
SELECT item.clientip as clientip, item.request_count as request_count
FROM (
  SELECT unnest(approx_topk(clientip, 10)) 
  FROM "default"
)
ORDER BY request_count DESC
```
**Final output (individual rows):** 

```json
{"clientip":"192.168.1.100","request_count":2650}
{"clientip":"10.0.0.5","request_count":2230}
{"clientip":"203.0.113.50","request_count":2210}
{"clientip":"198.51.100.75","request_count":1970}
{"clientip":"172.16.0.10","request_count":1930}
{"clientip":"192.168.1.200","request_count":1830}
{"clientip":"203.0.113.80","request_count":1630}
{"clientip":"10.0.0.25","request_count":1590}
{"clientip":"172.16.0.30","request_count":1550}
{"clientip":"192.168.1.150","request_count":1410}
```

??? info "The Space-Saving Algorithm Explained:"
    The Space-Saving algorithm enables efficient top-K queries on high-cardinality data by limiting memory usage during distributed query execution. This approach trades exact precision for system stability and performance. <br> 
    **Problem Statement** <br>

    Traditional GROUP BY operations on high-cardinality fields can cause memory exhaustion in distributed systems. Consider this query:

    ```sql
    SELECT clientip, count(*) as cnt 
    FROM default 
    GROUP BY clientip 
    ORDER BY cnt DESC 
    LIMIT 10
    ```

    **Challenges:**

    - Dataset contains 3 million unique client IP addresses
    - Query executes across 60 CPU cores with 60 data partitions
    - Each core maintains hash tables during aggregation across all partitions
    - Memory usage: 3M entries × 60 cores × 60 partitions = 10.8 billion hash table entries

    **Typical Error Message:**
    ```
    Resources exhausted: Failed to allocate additional 63232256 bytes for GroupedHashAggregateStream[20] with 0 bytes already allocated for this reservation - 51510301 bytes remain available for the total pool
    ```

    **Solution: Space-Saving Mechanism** <br>

    ```sql
    SELECT approx_topk(clientip, 10) FROM default
    ```

    Instead of returning all unique values from each partition, each partition returns only its top 10 results. The leader node then aggregates these partial results to compute the final top 10.

    **Example: Web Server Log Analysis** <br>

    **Scenario** <br>
    Find the top 10 client IPs by request count from web server logs distributed across 3 follower query nodes.

    **Raw Data Distribution** <br>

    | Rank | Node 1 | Requests | Node 2 | Requests | Node 3 | Requests |
    |------|---------|----------|---------|----------|---------|----------|
    | 1 | 192.168.1.100 | 850 | 192.168.1.100 | 920 | 192.168.1.100 | 880 |
    | 2 | 10.0.0.5 | 720 | 203.0.113.50 | 780 | 10.0.0.5 | 810 |
    | 3 | 203.0.113.50 | 680 | 198.51.100.75 | 740 | 203.0.113.50 | 750 |
    | 4 | 172.16.0.10 | 620 | 10.0.0.5 | 700 | 198.51.100.75 | 690 |
    | 5 | 192.168.1.200 | 580 | 172.16.0.10 | 660 | 172.16.0.10 | 650 |
    | 6 | 198.51.100.75 | 540 | 192.168.1.200 | 640 | 192.168.1.200 | 610 |
    | 7 | 10.0.0.25 | 500 | 203.0.113.80 | 600 | 203.0.113.80 | 570 |
    | 8 | 172.16.0.30 | 480 | 172.16.0.30 | 580 | 10.0.0.25 | 530 |
    | 9 | 203.0.113.80 | 460 | 10.0.0.25 | 560 | 172.16.0.30 | 490 |
    | 10 | 192.168.1.150 | 440 | 192.168.1.150 | 520 | 192.168.1.150 | 450 |


    **Follower Query Nodes Process Data** <br>

    Each follower node executes the query locally and returns only its top 10 results:

    | Rank | Node 1 → Leader | Requests | Node 2 → Leader | Requests | Node 3 → Leader | Requests |
    |------|-----------------|----------|-----------------|----------|-----------------|----------|
    | 1 | 192.168.1.100 | 850 | 192.168.1.100 | 920 | 192.168.1.100 | 880 |
    | 2 | 10.0.0.5 | 720 | 203.0.113.50 | 780 | 10.0.0.5 | 810 |
    | 3 | 203.0.113.50 | 680 | 198.51.100.75 | 740 | 203.0.113.50 | 750 |
    | 4 | 172.16.0.10 | 620 | 10.0.0.5 | 700 | 198.51.100.75 | 690 |
    | 5 | 192.168.1.200 | 580 | 172.16.0.10 | 660 | 172.16.0.10 | 650 |
    | 6 | 198.51.100.75 | 540 | 192.168.1.200 | 640 | 192.168.1.200 | 610 |
    | 7 | 10.0.0.25 | 500 | 203.0.113.80 | 600 | 203.0.113.80 | 570 |
    | 8 | 172.16.0.30 | 480 | 172.16.0.30 | 580 | 10.0.0.25 | 530 |
    | 9 | 203.0.113.80 | 460 | 10.0.0.25 | 560 | 172.16.0.30 | 490 |
    | 10 | 192.168.1.150 | 440 | 192.168.1.150 | 520 | 192.168.1.150 | 450 |

    **Leader Query Node Aggregates Results** <br>

    | Client IP | Node 1 | Node 2 | Node 3 | Total Requests |
    |-----------|---------|---------|---------|----------------|
    | 192.168.1.100 | 850 | 920 | 880 | **2,650** |
    | 10.0.0.5 | 720 | 700 | 810 | **2,230** |
    | 203.0.113.50 | 680 | 780 | 750 | **2,210** |
    | 198.51.100.75 | 540 | 740 | 690 | **1,970** |
    | 172.16.0.10 | 620 | 660 | 650 | **1,930** |
    | 192.168.1.200 | 580 | 640 | 610 | **1,830** |
    | 203.0.113.80 | 460 | 600 | 570 | **1,630** |
    | 10.0.0.25 | 500 | 560 | 530 | **1,590** |
    | 172.16.0.30 | 480 | 580 | 490 | **1,550** |
    | 192.168.1.150 | 440 | 520 | 450 | **1,410** |

    **Final Top 10 Results:**

    | Rank | Client IP | Total Requests |
    |------|-----------|----------------|
    | 1 | 192.168.1.100 | 2,650 |
    | 2 | 10.0.0.5 | 2,230 |
    | 3 | 203.0.113.50 | 2,210 |
    | 4 | 198.51.100.75 | 1,970 |
    | 5 | 172.16.0.10 | 1,930 |
    | 6 | 192.168.1.200 | 1,830 |
    | 7 | 203.0.113.80 | 1,630 |
    | 8 | 10.0.0.25 | 1,590 |
    | 9 | 172.16.0.30 | 1,550 |
    | 10 | 192.168.1.150 | 1,410 |

    **Why Results Are Approximate** <br>

    The approx_topk function returns approximate results because it relies on each query node sending only its local top N entries to the leader. The leader combines these partial lists to produce the final result.

    If a value appears frequently across all nodes but never ranks in the top N on any individual node, it is excluded. This can cause high-frequency values to be missed globally.

    For example, if an IP receives 400, 450, and 500 requests across three nodes but ranks 11th on each, it will not appear in any node’s top 10. Even though the global total is 1,350, it will be missed.

    **Limitations** <br>

    - Results are approximate, not exact.
    - Accuracy depends on data distribution across partitions.
    - Filter clauses are not currently supported with approx_topk

---

### `approx_topk_distinct(field1, field2, k)`

**Description:**

- Returns the top `K` values from `field1` that have the most unique values in `field2`.
- Here: 
    
    - **field1**: The field to group by and return top results for.  
    - **field2**: The field to count distinct values of. 
    - **k**: Number of top results to return.

- Uses [**HyperLogLog** algorithm] for efficient distinct counting and Space-Saving algorithm for top-K selection on high-cardinality data.
- Results are approximate due to the probabilistic nature of both algorithms and distributed processing across partitions.

**Example:**

```sql
SELECT approx_topk_distinct(clientip, clientas, 3) FROM "default" ORDER BY _timestamp DESC
```
It returns the top 3 client IP addresses that have the most unique user agents.

**Function result (returns an object with an array):**

```json
{
  "item": [
    {"clientip": "192.168.1.100", "distinct_count": 1450},
    {"clientip": "203.0.113.50", "distinct_count": 1170},
    {"clientip": "10.0.0.5", "distinct_count": 1160},
    {"clientip": "198.51.100.75", "distinct_count": 1040},
    {"clientip": "172.16.0.10", "distinct_count": 1010},
    {"clientip": "192.168.1.200", "distinct_count": 950},
    {"clientip": "203.0.113.80", "distinct_count": 830},
    {"clientip": "10.0.0.25", "distinct_count": 810},
    {"clientip": "172.16.0.30", "distinct_count": 790},
    {"clientip": "192.168.1.150", "distinct_count": 690}
  ]
}
```

**Use the `unnest()`, to extract usable results:**

```sql
SELECT item.clientip as clientip, item.distinct_count as distinct_count 
FROM (
  SELECT unnest(approx_topk_distinct(clientip, clientas, 10)) as item
  FROM "default" 
)
ORDER BY distinct_count DESC
```
**Final output (individual rows):**

```json
{"clientip":"192.168.1.100","distinct_count":1450}
{"clientip":"203.0.113.50","distinct_count":1170}
{"clientip":"10.0.0.5","distinct_count":1160}
{"clientip":"198.51.100.75","distinct_count":1040}
{"clientip":"172.16.0.10","distinct_count":1010}
{"clientip":"192.168.1.200","distinct_count":950}
{"clientip":"203.0.113.80","distinct_count":830}
{"clientip":"10.0.0.25","distinct_count":810}
{"clientip":"172.16.0.30","distinct_count":790}
{"clientip":"192.168.1.150","distinct_count":690}
```
??? info "The HyperLogLog Algorithm Explained:" 
    **Problem Statement**

    Traditional `GROUP BY` operations with `DISTINCT` counts on high-cardinality fields can cause memory exhaustion in distributed systems. Consider this query:

    ```sql
    SELECT clientip, count(distinct clientas) as cnt 
    FROM default 
    GROUP BY clientip 
    ORDER BY cnt DESC 
    LIMIT 10
    ```

    **Challenges:**

    - Dataset contains 3 million unique client IP addresses.
    - Each client IP can have thousands of unique user agents (`clientas`).
    - Total unique user agents: 100 million values.
    - Query executes across 60 CPU cores with 60 data partitions.
    - Memory usage for distinct counting: Potentially unlimited storage for tracking unique values.
    - Combined with grouping: Memory requirements become exponentially larger.

    **Typical Error Message:**
    ```
    Resources exhausted: Failed to allocate additional 63232256 bytes for GroupedHashAggregateStream[20] with 0 bytes already allocated for this reservation - 51510301 bytes remain available for the total pool
    ```

    **Solution: HyperLogLog + Space-Saving Mechanism**

    ```sql
    SELECT approx_topk_distinct(clientip, clientas, 10) FROM default
    ```

    **Combined Approach:**

    - **HyperLogLog**: Handles distinct counting using a fixed **16 kilobytes** data structure per group.
    - **Space-Saving**: Limits the number of groups returned from each partition to top K.
    - Each partition returns only its top 10 client IPs (by distinct user agent count) to the leader.

    **Example: Web Server User Agent Analysis**
    Find the top 10 client IPs by unique user agent count from web server logs in the `default` stream.

    **Raw Data Distribution**

    | Node 1 | Distinct User Agents | Node 2 | Distinct User Agents | Node 3 | Distinct User Agents |
    |---------|---------------------|---------|---------------------|---------|---------------------|
    | 192.168.1.100 | 450 | 192.168.1.100 | 520 | 192.168.1.100 | 480 |
    | 10.0.0.5 | 380 | 203.0.113.50 | 420 | 10.0.0.5 | 410 |
    | 203.0.113.50 | 350 | 198.51.100.75 | 390 | 203.0.113.50 | 400 |
    | 172.16.0.10 | 320 | 10.0.0.5 | 370 | 198.51.100.75 | 370 |
    | 192.168.1.200 | 300 | 172.16.0.10 | 350 | 172.16.0.10 | 340 |
    | 198.51.100.75 | 280 | 192.168.1.200 | 330 | 192.168.1.200 | 320 |
    | 10.0.0.25 | 260 | 203.0.113.80 | 310 | 203.0.113.80 | 300 |
    | 172.16.0.30 | 240 | 172.16.0.30 | 290 | 10.0.0.25 | 280 |
    | 203.0.113.80 | 220 | 10.0.0.25 | 270 | 172.16.0.30 | 260 |
    | 192.168.1.150 | 200 | 192.168.1.150 | 250 | 192.168.1.150 | 240 |

    **Note**: Each distinct count is computed using HyperLogLog's 16KB data structure per client IP.

    **Follower Query Nodes Process Data**

    Each follower node executes the query locally and returns only its top 10 results:

    | Rank | Node 1 → Leader | Distinct Count | Node 2 → Leader | Distinct Count | Node 3 → Leader | Distinct Count |
    |------|-----------------|----------------|-----------------|----------------|-----------------|----------------|
    | 1 | 192.168.1.100 | 450 | 192.168.1.100 | 520 | 192.168.1.100 | 480 |
    | 2 | 10.0.0.5 | 380 | 203.0.113.50 | 420 | 10.0.0.5 | 410 |
    | 3 | 203.0.113.50 | 350 | 198.51.100.75 | 390 | 203.0.113.50 | 400 |
    | 4 | 172.16.0.10 | 320 | 10.0.0.5 | 370 | 198.51.100.75 | 370 |
    | 5 | 192.168.1.200 | 300 | 172.16.0.10 | 350 | 172.16.0.10 | 340 |
    | 6 | 198.51.100.75 | 280 | 192.168.1.200 | 330 | 192.168.1.200 | 320 |
    | 7 | 10.0.0.25 | 260 | 203.0.113.80 | 310 | 203.0.113.80 | 300 |
    | 8 | 172.16.0.30 | 240 | 172.16.0.30 | 290 | 10.0.0.25 | 280 |
    | 9 | 203.0.113.80 | 220 | 10.0.0.25 | 270 | 172.16.0.30 | 260 |
    | 10 | 192.168.1.150 | 200 | 192.168.1.150 | 250 | 192.168.1.150 | 240 |

    **Leader Query Node Aggregates Results**

    | Client IP | Node 1 | Node 2 | Node 3 | Total Distinct User Agents |
    |-----------|---------|---------|---------|---------------------------|
    | 192.168.1.100 | 450 | 520 | 480 | **1,450** |
    | 10.0.0.5 | 380 | 370 | 410 | **1,160** |
    | 203.0.113.50 | 350 | 420 | 400 | **1,170** |
    | 198.51.100.75 | 280 | 390 | 370 | **1,040** |
    | 172.16.0.10 | 320 | 350 | 340 | **1,010** |
    | 192.168.1.200 | 300 | 330 | 320 | **950** |
    | 203.0.113.80 | 220 | 310 | 300 | **830** |
    | 10.0.0.25 | 260 | 270 | 280 | **810** |
    | 172.16.0.30 | 240 | 290 | 260 | **790** |
    | 192.168.1.150 | 200 | 250 | 240 | **690** |

    **Final Top 10 Results:**

    | Rank | Client IP | Total Distinct User Agents |
    |------|-----------|---------------------------|
    | 1 | 192.168.1.100 | 1,450 |
    | 2 | 203.0.113.50 | 1,170 |
    | 3 | 10.0.0.5 | 1,160 |
    | 4 | 198.51.100.75 | 1,040 |
    | 5 | 172.16.0.10 | 1,010 |
    | 6 | 192.168.1.200 | 950 |
    | 7 | 203.0.113.80 | 830 |
    | 8 | 10.0.0.25 | 810 |
    | 9 | 172.16.0.30 | 790 |
    | 10 | 192.168.1.150 | 690 |


    **Why Results Are Approximate**
    Results are approximate due to two factors:

    1. **HyperLogLog approximation:** Distinct counts are estimated, not exact.
    2. **Space-Saving distribution:** Some globally significant client IPs might not appear in individual nodes' top 10 lists due to uneven data distribution.

    **Limitations**

    - Results are approximate, not exact.
    - Distinct count accuracy depends on HyperLogLog algorithm precision.
    - Filter clauses are not currently supported with `approx_topk_distinct`.


---

## Related Links
OpenObserve uses [Apache DataFusion](https://datafusion.apache.org/user-guide/sql/index.html) as its query engine. All supported SQL syntax and functions are available through DataFusion.

