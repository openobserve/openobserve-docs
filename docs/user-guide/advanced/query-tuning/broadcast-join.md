---
title: Broadcast Join - OpenObserve Query Optimization Feature
description: Broadcast join in OpenObserve: 43% faster queries, 99.9% less network transfer. Automatic optimization for enrichment tables and subqueries.
---

This document explains how broadcast join works as an automatic query optimization feature in OpenObserve. 

!!! info "Availability"
    This feature is available in Enterprise Edition. 

## Overview

Broadcast Join is a query optimization feature in OpenObserve that dramatically improves the performance of distributed join operations. Instead of shuffling large amounts of data across the network, this optimization broadcasts smaller datasets to all computing nodes, enabling local join processing.

**Key Benefits:**
- 43% faster query execution, verified by reducing time from 14 seconds to 8 seconds on production queries
- 99.9% reduction in network data transfer, verified by reducing transfer from 8.9 million rows to 5.7 thousand rows
- Automatic activation when conditions are met
- Works across superclusters

---

## How broadcast join works

Broadcast join reduces data transmission and improves parallel execution by broadcasting the smaller dataset to all computing nodes instead of shuffling large amounts of data across the network.

When the smaller side of a join operation is small enough to fit in memory, it is broadcast to all nodes performing the join operation, allowing each node to perform the join locally.

---

## Two types of broadcast join

OpenObserve automatically applies broadcast join in two scenarios:

### 1. Enrichment table pattern
**When**: Joining a large dataset with a small, pre-loaded reference table  
**Example**: Adding service metadata to logs  
**Key**: Enrichment table must already be in memory on all nodes

### 2. Subquery pattern  
**When**: Using IN-list queries with a limited subquery result  
**Example**: Filtering by a list of selected namespaces or trace IDs  
**Key**: Subquery must have LIMIT and return < 10,000 rows

---

## Enrichment table broadcast join

### When it applies

This optimization is automatically triggered when **all three conditions** are met:

1. **Enrichment table is loaded in memory** and consistent across all nodes, including superclusters
2. **Enrichment table is on the LEFT side** of the join
3. **Right side is a table scan** with optional filter

### Example

```sql
SELECT logs.service_name,
       enrich.region,
       enrich.team_owner,
       COUNT(*) AS total_errors
FROM logs
JOIN service_metadata AS enrich
  ON logs.service_name = enrich.service_name
WHERE logs.status_code = 500
GROUP BY logs.service_name, enrich.region, enrich.team_owner;
```

### Execution flow

1. The enrichment table (`service_metadata`) is already available in memory on all nodes
2. The `logs` table is scanned with the filter (`status_code = 500`)
3. Each node performs the join locally between its log partition and the enrichment table
4. The leader node merges results from all nodes

---

## Subquery broadcast join

### When it applies

This optimization is automatically triggered when **all four conditions** are met:

1. **Subquery has Aggregate + LIMIT**: Must produce a bounded result set
2. **Main query is a simple scan**: Table scan with optional filters
3. **Only one join**: Two tables only, not three or more
4. **Within size limits**: Subquery result less than 10,000 rows and less than 10 MB

### Example 1: Kubernetes namespace filtering

```sql
SELECT kubernetes_namespace_name,
       array_agg(DISTINCT kubernetes_container_name) AS container_name
FROM default
WHERE log LIKE '%zinc%'
  AND kubernetes_namespace_name IN (
    SELECT DISTINCT kubernetes_namespace_name
    FROM default
    WHERE log LIKE '%zinc%'
    ORDER BY kubernetes_namespace_name
    LIMIT 10
  )
GROUP BY kubernetes_namespace_name
ORDER BY kubernetes_namespace_name
LIMIT 10;
```

### Example 2: Trace ID lookup

```sql
SELECT trace_id,
       array_agg(DISTINCT service_name) AS name
FROM trace_list_index
WHERE trace_id IN (
    SELECT DISTINCT trace_id
    FROM trace_list_index
    ORDER BY trace_id
    LIMIT 10000
  )
GROUP BY trace_id
ORDER BY trace_id
LIMIT 10;
```

**Performance**:
- Without Broadcast Join: 14 seconds
- With Broadcast Join: 8 seconds, representing a 43% improvement
- Data transfer: Reduced from 8,938,099 rows to 5,743 rows

### Execution flow

1. Leader node executes the subquery and returns 10 namespaces
2. Subquery results are saved to object storage in Arrow format
3. Result set is broadcast to all follower nodes
4. Each follower performs the join locally with its partition of the main table
5. Leader merges results from all nodes

---

## Configuration

Broadcast join is enabled by default. You can adjust the limits for the subquery pattern:

### Maximum rows
```bash
export ZO_FEATURE_BROADCAST_JOIN_LEFT_SIDE_MAX_ROWS=10000
```
**Default**: 10,000 rows  
**Purpose**: Subquery results exceeding this will not trigger broadcast join

### Maximum size
```bash
export ZO_FEATURE_BROADCAST_JOIN_LEFT_SIDE_MAX_SIZE=10485760
```
**Default**: 10 MB  
**Purpose**: Subquery results exceeding this size will not trigger broadcast join

**Note**: These limits only apply to the subquery pattern. Enrichment tables are managed separately.

---

## When broadcast join is not applied

### When enrichment pattern will not trigger:

- Enrichment table is not pre-loaded in memory
- Enrichment table is on the RIGHT side of the join
- Query has multiple join operations
- Enrichment table state is inconsistent across nodes

### When subquery pattern will not trigger:

- Subquery result exceeds the configured limit of 10,000 rows
- Subquery result exceeds the configured limit of 10 MB
- Subquery lacks LIMIT clause
- Subquery lacks Aggregate operation
- Main query is not a simple table scan
- Query involves three or more tables in multi-table joins

### Performance note:

**Low cardinality IN-lists**, for example IN (1, 2, 3): For queries with low cardinality, the performance is basically the same as ordinary queries. Broadcast join is most effective for high cardinality IN-list queries.

---

## Verifying broadcast join is active

Use `EXPLAIN` to view the query execution plan:

```sql
EXPLAIN SELECT ...
```

**For Subquery Pattern**, the plan will show:
- Temporary storage path for the broadcasted data
- The subquery is executed separately from the main query

**For Enrichment Pattern**, the plan will show:
- Enrichment table positioned as the left side of the join
- No data repartitioning for the enrichment table

---

## Troubleshooting

### Issue: Broadcast join not triggering

**Check**:
1. Does the subquery have both Aggregate and LIMIT?
2. Count subquery rows: `SELECT COUNT(*) FROM (subquery)`
3. Is it a two-table join only?
4. Verify configuration: `echo $ZO_FEATURE_BROADCAST_JOIN_LEFT_SIDE_MAX_ROWS`

**For enrichment tables**:
1. Is the table loaded in memory as an enrichment table?
2. Is it on the LEFT side of the join?
3. Is the right side a simple table scan?

### Issue: Performance degradation

**Possible causes**:
- Broadcasted table is too large; adjust limits
- High network latency to object storage
- Query does not benefit from broadcast; try standard join

**Solution**: Add more selective filters to reduce subquery size

---

## Summary

Broadcast Join optimizes distributed queries by broadcasting small datasets instead of shuffling large ones. OpenObserve supports two patterns:

**Enrichment tables**: Pre-loaded reference tables joined with large datasets with zero network overhead

**Subquery pattern**: IN-list queries with limited results showing 99.9% reduction in data transfer

Both patterns activate automatically when conditions are met, requiring minimal configuration while delivering substantial performance improvements.

**Key takeaways**:
- 43% faster queries verified in production
- 99.9% less network data transfer
- Automatic optimization without requiring query rewriting
- Works across superclusters
- Enterprise-ready with configurable limits