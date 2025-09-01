This document explains Tantivy indexing in OpenObserve, the types of indexes it builds, how to use the correct query patterns, and how to verify and configure indexing.

> This is an Enterprise feature.

## What is Tantivy?
Tantivy is the inverted index library used in OpenObserve to accelerate searches. An inverted index keeps a map of values or tokens and the row IDs of the records that contain them. When a user searches for a value, the query can use this index to go directly to the matching rows instead of scanning every log record.

Tantivy builds two kinds of indexes in OpenObserve:

## Full-text index
For fields such as `body` or `message` that contain sentences or long text. The field is split into tokens, and each token is mapped to the records that contain it.

**Example log records** <br>

- Row 1: `body = "POST /api/metrics error"`
- Row 2: `body = "GET /health ok"`
- Row 3: `body = "error connecting to database"`

The log body `POST /api/metrics error` is stored as tokens `POST`, `api`, `metrics`, `error`. A search for `error` looks up that token in the index and immediately finds the matching records.

## Secondary index
For fields that represent a single exact value. For example, `k8s_namespace_name`. In this case, the entire field value is treated as one token and indexed.

**Example log records** <br> 

- Row 1: `k8s_namespace_name = ingress-nginx`
- Row 2: `k8s_namespace_name = ziox`
- Row 3: `k8s_namespace_name = ingress-nginx`
- Row 4: `k8s_namespace_name = cert-manager`

For `k8s_namespace_name`, the index might look like:

- `ingress-nginx` > [Row 1, Row 3]
- `ziox` > [Row 2]
- `cert-manager` > [Row 4]

A query for `k8s_namespace_name = 'ingress-nginx'` retrieves those rows directly, without scanning unrelated records. By keeping these indexes, Tantivy avoids full scans across millions or billions of records. This results in queries that return in milliseconds rather than seconds. 

## Configure Environment Variable 
To enable or disable Tantivy indexing, configure the following environment variable: 
```
ZO_ENABLE_INVERTED_INDEX = true
```

## Query behavior
Tantivy optimizes queries differently based on whether the field is full-text or secondary. Using the right operator for each field type ensures the query is served from the index instead of scanning logs.

1. Full-text index scenarios

**Correct usage** <br>

- Use `match_all()` for full-text index fields such as `body` or `message`:
```sql
-- Return logs whose body contains the token "error"
WHERE match_all('error');
```
- Use `NOT` with `match_all()`:
```sql
-- Exclude logs whose body contains the token "error"
WHERE NOT match_all('error');
```

**Inefficient usage** <br>
```sql
-- Forces full string equality, bypasses token index
WHERE body = 'error';
```

2. Secondary index scenarios

**Correct usage**

- Use `=` or `IN (...)` for secondary index fields such as `k8s_namespace_name`, `k8s_pod_name`, or `k8s_container_name`.
```sql
-- Single value
WHERE k8s_namespace_name = 'ingress-nginx';

-- Multiple values
WHERE k8s_namespace_name IN ('ingress-nginx', 'ziox', 'cert-manager');
```
- Use NOT with `=` or `IN (...)`  
```sql
-- Exclude one exact value
WHERE NOT (k8s_namespace_name = 'ingress-nginx');

-- Exclude multiple values
WHERE k8s_namespace_name NOT IN ('ziox', 'cert-manager');
```

**Inefficient usage**
```sql
-- Treated as a token search, no advantage over '='
WHERE match_all('ingress-nginx');
```

3. Mixed scenarios

When a query combines full-text and secondary fields, apply the best operator for each part.

**Correct usage**

```sql
WHERE match_all('error')
  AND k8s_namespace_name = 'ingress-nginx';
```

- `match_all('error')` uses full-text index.
- `k8s_namespace_name = 'ingress-nginx'` uses secondary index.

**Incorrect usage**

```sql
-- Both operators used incorrectly
WHERE body = 'error'
  AND match_all('ingress-nginx');
```

4. AND and OR operator behavior

**AND behavior** <br>

- If both sides are indexable, Tantivy intersects the row sets from each index.
- If one side is not indexable, the indexable side is still accelerated by Tantivy, and the other side is resolved in DataFusion.


**Examples**
```sql
-- Fast: both sides indexable
WHERE match_all('error') AND k8s_namespace_name = 'ingress-nginx';

-- Mixed: one side indexable, one not
WHERE match_all('error') AND body LIKE '%error%';
```

**OR behavior**

- If all branches of the OR are indexable, Tantivy unites the row sets efficiently.
- If any branch is not indexable, Tantivy resolves what it can, and DataFusion resolves the rest.

**Examples**
```sql
-- Fast: both indexable
WHERE match_all('error') OR k8s_namespace_name = 'ziox';

-- Slower: one branch not indexable
WHERE match_all('error') OR body LIKE '%error%';
```

**NOT with grouped conditions** <br>
```sql
-- Exclude when either namespace = ziox OR body contains error
WHERE NOT (k8s_namespace_name = 'ziox' OR match_all('error'));
```

## Verify if a query is using Tantivy
To confirm whether a query used the Tantivy inverted index:

1. Open the browser developer tools and go to the **Network** tab.
2. Inspect the query response JSON.
3. Under took_detail, check the value of `idx_took`:

    - If `idx_took` is greater than `0`, the query used the inverted index.
    - If `idx_took` is `0`, the query did not use the inverted index.