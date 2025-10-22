---
title: Tantivy Indexing in OpenObserve
description: Learn how Tantivy indexing works in OpenObserve, including full-text and secondary indexes, query behaviors with AND and OR operators, and how to verify index usage.
---
This document explains Tantivy indexing in OpenObserve, the types of indexes it builds, how to use the correct query patterns for both single-stream and multi-stream queries, and how to verify and configure indexing.

> Tantivy indexing is an open-source feature in OpenObserve.

## What is Tantivy?
Tantivy is the inverted index library used in OpenObserve to accelerate searches. An inverted index keeps a map of values or tokens and the row IDs of the records that contain them. When a user searches for a value, the query can use this index to go directly to the matching rows instead of scanning every log record.

## Index types
Tantivy builds two kinds of indexes in OpenObserve:

??? note "Full-text index"
    ### Full-text index
    For fields such as `body` or `message` that contain sentences or long text. The field is split into tokens, and each token is mapped to the records that contain it.

    !!! note "Example log records:"

        - Row 1: `body = "POST /api/metrics error"`
        - Row 2: `body = "GET /health ok"`
        - Row 3: `body = "error connecting to database"`

    The log body `POST /api/metrics error` is stored as tokens `POST`, `api`, `metrics`, `error`. A search for `error` looks up that token in the index and immediately finds the matching records.

??? note "Secondary index"
    ### Secondary index
    For fields that represent a single exact value. For example, `kubernetes_namespace_name`. In this case, the entire field value is treated as one token and indexed.

    !!! note "Example log records:"

        - Row 1: `kubernetes_namespace_name = ingress-nginx`
        - Row 2: `kubernetes_namespace_name = ziox`
        - Row 3: `kubernetes_namespace_name = ingress-nginx`
        - Row 4: `kubernetes_namespace_name = cert-manager`

        For `kubernetes_namespace_name`, the index might look like:

        - `ingress-nginx` > [Row 1, Row 3]
        - `ziox` > [Row 2]
        - `cert-manager` > [Row 4]

    A query for `kubernetes_namespace_name = 'ingress-nginx'` retrieves those rows directly, without scanning unrelated records. By keeping these indexes, Tantivy avoids full scans across millions or billions of records. This results in queries that return in milliseconds rather than seconds. 

## Configure environment variable 
??? note "Enable Tantivy indexing"
    ### Enable Tantivy indexing
    To enable Tantivy indexing, configure the following environment variable:

    | Environment Variable | Description | Default Value |
    |---------------------|-------------|---------------|
    | `ZO_ENABLE_INVERTED_INDEX` | Enables or disables Tantivy indexing | `true` |
??? note "Enable Tantivy result cache (optional)"
    ### Enable Tantivy result cache (optional)
    The [Tantivy result cache](#tantivy-result-cache) feature enhances search performance by storing index query results. It is disabled by default. To enable and configure the cache, set the following environment variables:

    | Environment Variable | Description | Default Value |
    |---------------------|-------------|---------------|
    | `ZO_INVERTED_INDEX_RESULT_CACHE_ENABLED` | Enables or disables the Tantivy result cache | `false` |
    | `ZO_INVERTED_INDEX_RESULT_CACHE_MAX_ENTRIES` | Maximum number of cache entries | `10000` |
    | `ZO_INVERTED_INDEX_RESULT_CACHE_MAX_ENTRY_SIZE` | Maximum size per cache entry in bytes | `20480` (20KB) |

    For a detailed explanation of how the Tantivy result cache works, memory requirements, and performance impact, refer to the [Tantivy result cache](#tantivy-result-cache) section below.

## Query behavior
Tantivy optimizes queries differently based on whether the field is full-text or secondary, and whether the query operates on a single stream or multiple streams. Using the right operator for each field type ensures the query is served from the index instead of scanning logs.

!!! note "Note"
    Tantivy index supports logs, metrics ,traces, and metadata stream.

### Single-stream queries
A single-stream query retrieves data from one stream without using JOIN operations or subqueries that involve multiple streams.

#### Full-text index scenarios

!!! info "Correct usage:"
    - Use `match_all()` for full-text index fields such as `body` or `message`:
    ```sql linenums="1"
    -- Return logs whose body contains the token "error"
    WHERE match_all('error');
    ```
    - Use `NOT` with `match_all()`:
    ```sql linenums="1"
    -- Exclude logs whose body contains the token "error"
    WHERE NOT match_all('error');
    ```

!!! warning "Inefficient usage:"
    ```sql linenums="1"
    -- Forces full string equality, bypasses token index
    WHERE body = 'error';
    ```

#### Secondary index scenarios

!!! info "Correct usage:"
    - Use `=` or `IN (...)` for secondary index fields such as `kubernetes_namespace_name`, `kubernetes_pod_name`, or `kubernetes_container_name`.
    ```sql linenums="1"
    -- Single value
    WHERE kubernetes_namespace_name = 'ingress-nginx';

    -- Multiple values
    WHERE kubernetes_namespace_name IN ('ingress-nginx', 'ziox', 'cert-manager');
    ```
    - Use NOT with `=` or `IN (...)`  
    ```sql linenums="1"
    -- Exclude one exact value
    WHERE NOT (kubernetes_namespace_name = 'ingress-nginx');

    -- Exclude multiple values
    WHERE kubernetes_namespace_name NOT IN ('ziox', 'cert-manager');
    ```

!!! warning "Inefficient usage:"
    ```sql linenums="1"
    -- Treated as a token search, no advantage over '='
    WHERE match_all('ingress-nginx');
    ```

#### Mixed scenarios

When a query combines full-text and secondary fields, apply the best operator for each part.

!!! info "Correct usage:"

    ```sql linenums="1"
    WHERE match_all('error')
      AND kubernetes_namespace_name = 'ingress-nginx';
    ```

    - `match_all('error')` uses full-text index.
    - `kubernetes_namespace_name = 'ingress-nginx'` uses secondary index.

!!! warning "Incorrect usage:"

    ```sql linenums="1"
    -- Both operators used incorrectly
    WHERE body = 'error'
      AND match_all('ingress-nginx');
    ```

#### AND and OR operator behavior

**AND behavior** <br>

- If both sides are indexable, Tantivy intersects the row sets from each index.
- If one side is not indexable, the indexable side is still accelerated by Tantivy, and the other side is resolved in DataFusion.


**Examples**
```sql linenums="1"
-- Fast: both sides indexable
WHERE match_all('error') AND kubernetes_namespace_name = 'ingress-nginx';

-- Mixed: one side indexable, one not
WHERE match_all('error') AND body LIKE '%error%';
```

**OR behavior**

- If all branches of the OR are indexable, Tantivy unites the row sets efficiently.
- If any branch is not indexable, the entire OR is not indexable. The query runs in DataFusion.
<br>
**Examples**
```sql linenums="1"
-- Fast: both indexable
WHERE match_all('error') OR kubernetes_namespace_name = 'ziox';

-- Slower: both sides are not indexable
WHERE match_all('error') OR body LIKE '%error%';
```

**NOT with grouped conditions** <br>
```sql linenums="1"
-- Exclude when either namespace = ziox OR body contains error
WHERE NOT (kubernetes_namespace_name = 'ziox' OR match_all('error'));
```

### Multi-stream queries
A multi-stream query combines data from two or more streams using JOIN operations or subqueries that convert to JOINs internally. OpenObserve applies Tantivy indexing to both sides of a JOIN to accelerate data retrieval.

#### What are multi-stream queries?
When a subquery converts to a JOIN, OpenObserve combines data from two sources. In a JOIN operation:

- The left table is the first table in the JOIN operation. It is the base table that the query starts with.
- The right table is the second table in the JOIN operation. It provides additional data that is matched against the left table based on a join condition.


The query engine reads rows from the left table, then for each row, it looks up matching rows in the right table using the join condition.
<br>
**Example:**
```sql linenums="1"
SELECT t1.id FROM t1 JOIN t2 ON t1.id = t2.id
```
In this query:

- `t1` is the left table. It is the base table.
- `t2` is the right table. It is the table being matched. 
- The join condition `t1.id = t2.id` determines which rows from both tables are combined. 

When a query includes a subquery in a WHERE clause with an IN operator, OpenObserve converts it to a JOIN operation. For example:
```sql linenums="1"
SELECT kubernetes_namespace_name
FROM default
WHERE kubernetes_namespace_name IN (
SELECT DISTINCT kubernetes_namespace_name
FROM default
WHERE kubernetes_container_name = 'ziox'
);
```
This query internally converts to a JOIN where:

- The left table is the outer query, selecting `kubernetes_namespace_name` from `default`. 
- The right table is the subquery, selecting distinct `kubernetes_namespace_name` values where `kubernetes_container_name` is `ziox`. 

Tantivy can use indexes on both the left table and the right table to accelerate the query.

#### How indexing works in multi-stream queries
When OpenObserve executes a multi-stream query:

1. The query optimizer identifies indexable conditions on both the left table and the right table of the JOIN.
2. Tantivy retrieves row identifiers from the index for each table independently.
3. The query engine combines the results based on the JOIN condition.
4. If both tables use indexes, the query avoids scanning unrelated records entirely.

For example, 
```sql linenums="1"
SELECT DISTINCT kubernetes_namespace_name
FROM default
WHERE kubernetes_pod_name = 'ziox-ingester-0'
AND kubernetes_namespace_name IN (
SELECT DISTINCT kubernetes_namespace_name
FROM default
WHERE kubernetes_container_name = 'ziox'
)
ORDER BY kubernetes_namespace_name DESC
LIMIT 10;
```

In this query, the subquery uses the secondary index on `kubernetes_container_name` to find matching namespaces, while the outer query uses the secondary index on `kubernetes_pod_name`. Both sides benefit from Tantivy indexing, eliminating the need for full table scans.

#### match_all in multi-stream queries
The `match_all()` function is supported in multi-stream queries with specific limitations. OpenObserve checks whether the full-text index field exists in the stream before applying `match_all()`.

!!! info "Supported scenarios:" 
    Use `match_all()` in subqueries that filter a single stream:
    ```sql linenums="1"
    SELECT *
    FROM (
    SELECT *
    FROM default
    WHERE match_all('error')
    ) AS filtered_logs;
    ```
    Use `match_all()` in both the outer query and a subquery with an IN condition:
    ```sql linenums="1"
    SELECT *
    FROM default
    WHERE id IN (
    SELECT id
    FROM default
    WHERE match_all('error')
    )
    AND match_all('critical');
    ```
    In this example, both the subquery and outer query apply full-text search using `match_all()`, and both leverage the full-text index to retrieve matching row identifiers.

!!! info "Unsupported scenarios:" 
    Do not use `match_all()` outside a subquery when the subquery contains aggregation or grouping:

    ```sql linenums="1"
    SELECT *
    FROM (
    SELECT kubernetes_namespace_name, COUNT(*)
    FROM default
    GROUP BY kubernetes_namespace_name
    ORDER BY COUNT(*)
    ) AS aggregated
    WHERE match_all('error');
    ```
    In this case, `match_all('error')` cannot determine which stream to search because the subquery has already aggregated the data.

#### Partitioned search with inverted index
OpenObserve searches individual partitions using the inverted index when executing multi-stream queries. This behavior ensures that queries distribute efficiently across partitions and leverage indexing at the partition level.


## Index Optimizer

### What is the Index Optimizer?
OpenObserve includes an index optimizer that accelerates specific query patterns by using Tantivy indexes more efficiently. The optimizer works automatically for both standalone queries and subqueries when certain conditions are met.

The optimizer handles four query patterns: count, histogram, top N, and distinct queries.

### Optimized Query Patterns

#### Count Queries
!!! note ""
    The optimizer accelerates queries that count total records.
    <br>
    **Example:**
    ```sql linenums="1"
    SELECT COUNT(*) FROM stream WHERE match_all('error')
    ```
    <br>
    **Requirements:**

    - All filters in the WHERE clause must be indexable by Tantivy

#### Histogram Queries
!!! note ""
    The optimizer accelerates queries that generate histogram data grouped by time intervals.
    <br>
    **Example:**
    ```sql linenums="1"
    SELECT histogram(_timestamp, '1m') AS ts, COUNT(*) AS cnt 
    FROM table 
    WHERE match_all('error') 
    GROUP BY ts
    ```
    <br>
    **Requirements:**

    - All filters in the WHERE clause must be indexable by Tantivy

#### Top N Queries
!!! note ""
    The optimizer accelerates queries that retrieve the top N results based on count, ordered in descending order.
    <br>
    **Example:**
    ```sql linenums="1"
    SELECT kubernetes_namespace_name, COUNT(*) AS cnt 
    FROM table 
    WHERE match_all('error') 
    GROUP BY kubernetes_namespace_name 
    ORDER BY cnt DESC 
    LIMIT 10
    ```
    <br>
    **Requirements:**

    - All filters in the WHERE clause must be indexable by Tantivy
    - The field being grouped must be a secondary index field

#### Distinct Queries
!!! note ""
    The optimizer accelerates queries that retrieve distinct values for a field.
    <br>
    **Example:**
    ```sql linenums="1"
    SELECT kubernetes_namespace_name 
    FROM table 
    WHERE str_match(kubernetes_namespace_name, 'prod') 
    GROUP BY kubernetes_namespace_name 
    ORDER BY kubernetes_namespace_name ASC 
    LIMIT 10
    ```
    <br>
    **Requirements:**
    - All filters in the WHERE clause must be indexable by Tantivy
    - The field in the SELECT clause must be a secondary index field
    - The WHERE clause must use `str_match()` on that same field

!!! note "General Requirements"
    For all four query patterns, every filter condition in the WHERE clause must be indexable by Tantivy. Refer to the [Single-stream queries](#single-stream-queries) and [Multi-stream queries](#multi-stream-queries) sections for details on which operators and conditions are indexable.


## Tantivy result cache

### What is the Tantivy result cache?
The Tantivy result cache stores the output of Tantivy index searches to enhance search performance for repeated queries. When the cache is enabled and a query is executed, OpenObserve checks if identical results already exist in the cache. If found, the query retrieves results from the cache instead of re-executing index lookups, significantly reducing search time.

The cache is disabled by default. To enable it, configure the environment variables described in the [Configure environment variable](#configure-environment-variable) section.

### Memory requirements for Tantivy result cache
The Tantivy result cache requires memory based on the number of entries and the size of each entry. Calculate the memory required using this formula:
```
(MAX_ENTRY_SIZE_in_KB × MAX_ENTRIES) / 1024 = Memory required in MB
```
**Example calculation with default configuration:**
```bash
MAX_ENTRY_SIZE = 20KB
MAX_ENTRIES = 10000

Memory required = (20 × 10000) / 1024 = 195.315 MB
```

!!! note "Note"
    When adjusting `ZO_INVERTED_INDEX_RESULT_CACHE_MAX_ENTRIES` or `ZO_INVERTED_INDEX_RESULT_CACHE_MAX_ENTRY_SIZE`, use this formula to ensure sufficient memory is available.

### Performance impact
When the cache is enabled and a query result is found in the cache, search time can be reduced from hundreds of milliseconds to a few milliseconds. The cache is most effective for workloads with repeated queries using identical filters.

## Verify if a query is using Tantivy
To confirm whether a query used the Tantivy inverted index:

1. Open the browser developer tools and go to the **Network** tab.
2. Inspect the query response JSON.
3. Under took_detail, check the value of `idx_took`:

    - If `idx_took` is greater than `0`, the query used the inverted index.
    - If `idx_took` is `0`, the query did not use the inverted index.

