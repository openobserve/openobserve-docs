---
title: Federated Search in OpenObserve - Architecture
description: Technical explanation of OpenObserve deployment modes, normal cluster query execution, and how federated search works across single and multiple clusters.
---
This document explains the technical architecture of OpenObserve deployments, how queries execute in normal clusters, and how [federated search](../) coordinates queries across clusters in a supercluster.

> This feature is available in Enterprise Edition.

## Understanding OpenObserve deployments
Before diving into how federated search works, you need to understand how OpenObserve can be deployed. OpenObserve scales from a single machine to a globally distributed infrastructure.

## Single node deployment
The simplest deployment: one instance of OpenObserve runs all functions on one machine. Data stores locally, and the node processes queries directly. This works for testing or small deployments.

## Single cluster deployment
When you need scale, multiple specialized nodes work together as a cluster. Each node type has a specific role:

- **Router**: Entry point that forwards queries to queriers
- **Querier**: Processes queries in parallel with other queriers
- **Ingester**: Receives and stores data in object storage
- **Compactor**: Optimizes files and enforces retention
- **Alertmanager**: Executes alerts and sends notifications

A single cluster handles more data and provides higher availability than a single node.

## Supercluster deployment
When you need to operate across multiple geographical regions, multiple clusters connect as a supercluster. This is where federated search becomes relevant.

!!! note "Key point" 
    Each cluster in a supercluster operates independently with its own data storage. Data ingested into one cluster stays in that cluster. However, configuration metadata synchronizes across all clusters, allowing unified management.

## Region and cluster hierarchy
In a supercluster, regions organize clusters geographically. A region may contain one or more clusters.
<br>
**Example:**
<br>

```bash
Region: us-test-3
  ├─ Cluster: dev3
  └─ Cluster: dev3-backup

Region: us-test-4
  └─ Cluster: dev4
```
Each cluster has independent data storage. Data stays where it was ingested.

## How queries execute
Understanding query execution helps you understand how federated search works whether querying one cluster or multiple clusters.

### Normal cluster query execution
This section explains how any OpenObserve cluster processes queries internally, regardless of whether it is a standalone cluster or part of a supercluster. Understanding this internal process is essential because:

- This is how standalone clusters work
- This is what happens when you query your current cluster in a supercluster without federated search coordination
- During federated search, each individual cluster uses this same internal process to search its own data

When a cluster receives a query:

1. Router forwards the query to an available querier.
2. That querier becomes the leader querier.
3. Leader querier parses SQL, identifies data files, creates execution plan.
4. Leader querier distributes work among available queriers. These queriers become worker queriers.
5. All worker queriers search their assigned files in parallel.
6. Worker queriers send results to the leader querier.
7. Leader querier merges results and returns final answer.

### Query execution for your current cluster in a supercluster
Your current cluster is the cluster you are logged into. When you select your current cluster from the Region dropdown, this is not federated search.
<br>
For example, if you are logged into Cluster A and you select Cluster A from the Region dropdown, the query executes using the normal cluster query execution process described above. No cross-cluster communication occurs, and no federated search coordination is needed.

### Federated search for one different cluster in a supercluster
When you select a different cluster from the Region dropdown, not the cluster you are logged into, federated search coordination is used:
<br>

**Step 1: Coordination setup**
<br>
Your current cluster becomes the leader cluster.
<br>

**Step 2: Query distribution**
<br>
Leader cluster sends the query to the selected cluster via gRPC.
<br>

**Step 3: Query processing**
<br>
The selected cluster processes the query using its normal cluster query execution process.
<br>

**Step 4: Result return**
<br>
The selected cluster sends its results back to the leader cluster.
<br>

**Step 5: Result presentation**
<br>
The leader cluster displays the results.

### Federated search for multiple clusters in a supercluster

When you select no cluster or multiple clusters from the Region dropdown, federated search extends the query across all selected clusters:
<br>

**Step 1: Coordination setup**
<br>
Your current cluster becomes the leader cluster. The leader cluster identifies all selected clusters, or all clusters if none selected, that contain data for the queried stream. These other clusters become worker clusters.
<br>

**Step 2: Query distribution**
<br>
The leader cluster sends the query to all worker clusters via gRPC. All clusters now have the same query to execute.
<br>

**Step 3: Parallel processing**
<br>
Each cluster processes the query using its normal cluster query execution process. The leader cluster searches its own data if it contains data for that stream. Worker clusters search their own data. All processing happens simultaneously.
<br>

**Step 4: Result aggregation**
<br>
Each cluster aggregates its own results internally using its leader querier and worker queriers. Worker clusters send their aggregated results to the leader cluster. The leader cluster merges all results from all clusters and returns the unified response.

## Metadata synchronization
In a supercluster, clusters share configuration and schema information in real-time while keeping actual data separate. This synchronization happens via NATS, a messaging system that coordinates communication between clusters.
<br>
While stream schemas are synchronized across all clusters in real-time, the actual data for a stream only exists in the cluster or clusters where it was ingested.

| **Synchronized across clusters** | **NOT synchronized (stays local)** |
|----------------------------------|-----------------------------------|
| Schema definitions | Log data |
| User-defined functions | Metric data |
| Dashboards and folders | Trace data |
| Alerts and notifications | Raw ingested data |
| Scheduled tasks and reports | Parquet files and WAL files |
| User and organization settings | Search indices |
| System configurations | |
| Job metadata | |
| Enrichment metadata | |

This design maintains data residency compliance while enabling unified configuration management.

## Limitations

**No cluster identification in results:** Query results do not indicate which cluster provided specific data. To identify the source, query each cluster individually.