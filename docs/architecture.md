---
title:  OpenObserve Architecture
description: >-
  Learn how OpenObserve is structured: deployment modes (single-node and HA),
  the role of each component, how data flows through the system, and how
  durability is handled.
keywords: 'openobserve, architecture, tutorial'
---

# Architecture and Deployment Modes

This page explains how OpenObserve is structured: the deployment modes you can run it in, what each component does, how data flows from ingest to query, and how the system keeps your data durable. It is useful if you are sizing a deployment, troubleshooting a cluster, or evaluating OpenObserve against other observability backends.

## Single-Node Mode

Please refer to the [Quickstart](./getting-started.md) for single-node deployments.

### SQLite and Local Disk

This is the default mode for running OpenObserve. Use it for light usage and testing or if you don't require HA. You can still ingest and search over 2 TB on a single machine per day. 

Based on our tests (using an Apple M2 chip), you can ingest data at approximately 31 MB per second with the default configuration. This is equivalent to 1.8 GB per minute or 2.6 TB per day. 

The [Quickstart](./getting-started.md) describes various ways to set up this configuration.

![Single node architecture using SQLite and local disk](../images/arch-single-local.jpg){ width="60%" }

### SQLite and Object Storage

![Single node architecture using SQLite and s3](../images/arch-single-s3.jpg){ width="60%" }

## High Availability (HA) Mode

HA mode does not support local disk storage. Please refer to [HA Deployment](administration/deployment/ha-deployment.md) for cluster-mode deployment.

![HA architecture using NATS and s3](../images/arch-ha.webp){ width="80%" }

To accommodate higher traffic, you can horizontally scale the following nodes:

- Router
- Querier
- Ingester
- Compactor
- AlertManager

HA mode uses NATS as a cluster coordinator as well as for cluster events and storing the nodes' information.

It uses PostgreSQL to store metadata, such as the organization, users, functions, alert rules, stream schema and file list (an index of parquet files).

Object storage (for example, Amazon S3, MinIO or GCS) stores all the parquet files data.

## Durability

**The short answer:** ingesters batch data briefly in memory and on local disk before flushing it to highly durable object storage. That window of single-copy data sounds risky, but modern infrastructure makes it safe in practice.

**Why a single in-flight copy is fine.** Most distributed systems were built in an era when storage was much less reliable than it is today, requiring users to make two or three copies of files to ensure they didn't lose data. Not only is storage more reliable today, you may face penalties for replicating data. In environments like AWS, replicating data across multiple Availability Zones (AZs) results in a cross-AZ data transfer penalty of 2 cents per GB (1 cent in each direction). Amazon EBS volumes are already replicated within an AZ: standard GP3 volumes offer 99.8% durability, and the io2 volumes that OpenObserve uses for its cloud service offer 99.999%. At those levels, additional in-app replication mostly adds cost and complexity without meaningfully reducing risk. Once data lands in S3 (99.999999999% durability), it is effectively permanent.

**What this means for you.** Building the system this way lets us offer a simpler and more cost-effective product, with no ongoing data replication to manage.


## Components

Router → Ingester → Compactor → Querier → AlertManager.

### Router

The Router node dispatches requests to an ingester or a querier. It also responds with the GUI in the browser. A router is a super simple proxy for sending appropriate requests between an ingester and a querier.

### Ingester

OpenObserve uses Ingester nodes to receive ingest requests, to convert data into parquet format and to store it in object storage. Ingesters store data temporarily in WAL before transferring it to object storage.

The data ingestion flow is as follows:

![Data Ingestion Flow](../images/arch-sequence-ingester.svg){ width="90%" }

1. Receive data from an HTTP or gRPC API request.
1. Parse data line by line.
1. Check whether there are any functions (ingest functions) used to transform data, then call each ingest function by the function order.
1. Check for a timestamp field and either convert the timestamp to microseconds or, if no timestamp field is present in the record, set it to the current timestamp.
1. Check the stream schema to identify whether the schema needs evolution. If the schema needs to be updated (to add new fields or change the data type of existing fields), acquire `lock` to update the schema.
1. Evaluate real time alerts, if any are defined for the stream.
1. Write to WAL file by timestamp in hourly buckets. Then, convert records in a request to Arrow RecordBatch and write into Memtable.

    1. Create one Memtable per `organization/stream_type`. If data is being ingested only for `logs`, there would be only one Memtable.
    1. The WAL file and Memtable are created in a pair. One WAL file has one Memtable. The WAL files are located at `data/wal/logs`.

1. As the Memtable size reaches `ZO_MAX_FILE_SIZE_IN_MEMORY=256` MB or the WAL file reaches `ZO_MAX_FILE_SIZE_ON_DISK=128` MB, move the Memtable to Immutable and create a new Memtable and WAL file for writing data.
2. Every `ZO_MEM_PERSIST_INTERVAL=5` seconds, dump Immutable to local disk. One Immutable will result in multiple parquet files, as it may contain multiple streams and multiple partitions. The parquet files are located at `data/wal/files`.
3. Every `ZO_FILE_PUSH_INTERVAL=10` seconds, check local parquet files. If any partition's total size is above `ZO_MAX_FILE_SIZE_ON_DISK=128` MB or any file has been retained for `ZO_MAX_FILE_RETENTION_TIME=600` seconds, merge all such small files in a partition into a big file (each big file will be maximum `ZO_COMPACT_MAX_FILE_SIZE=2048 MB (2 GB)`) and move that file to object storage.

**Ingesters store data in three parts:**

1. Data in Memtable
1. Data in Immutable
1. Parquet files in `wal` that haven't been uploaded to object storage

All of these need to be queried.

### Compactor

The Compactor node merges small files into big files to make searches more efficient. Compactors also enforce the data retention policy, carry out full stream deletions and update file list indices.

### Querier

OpenObserve uses Querier nodes to query data. Queriers are fully stateless.

The data query flow is as follows:

![Query Flow](../images/arch-sequence-querier.svg){ width="90%" }

1. Receive the search request using HTTP or API. The node receiving the query request becomes `LEADER querier for the query` and other queriers become `WORKER queriers for query`.
1. `LEADER` parses and verifies SQL.
1. `LEADER` finds the data time range and gets the file list from the file list index.
1. `LEADER` fetches querier nodes from cluster metadata.
1. `LEADER` partitions the list of files to be queried by each querier. For example, if 100 files need to be queried and there are five querier nodes, each querier gets to query 20 files: `LEADER` works on 20 files, and the four `WORKERS` work on 20 files each.
1. `LEADER` calls the gRPC service running on each `WORKER` querier to dispatch the search query to the Querier node. Inter-querier communication happens using gRPC.
1. `LEADER` collects, merges and sends the result back to the user.

!!! tip "Querier caching"
    - The queriers will cache parquet files in memory by default. Use the `ZO_MEMORY_CACHE_MAX_SIZE` environment variable to configure how much memory a querier uses for caching. By default, queriers use 50% of their available memory for caching.
    - In a distributed environment, each querier node will just cache a part of the data.
    - You also have the option to enable caching the latest parquet files in memory. The ingester will notify queriers to cache the file when an ingester generates a new parquet file and uploads it to object storage.

#### Federated Search

!!! info "Applies to"
    Enterprise version only.

The federated search spans over multiple OpenObserve clusters:

1. Receive the search request on one of the clusters. The node receiving the query request becomes `LEADER cluster for the query` and other clusters become `WORKER clusters for that query`.
2. `LEADER cluster` finds all the clusters using super cluster metadata.
3. `LEADER cluster` calls a gRPC service on each `WORKER cluster` with the same query payload as input.
4. `WORKER clusters` execute the query as described above. One of the nodes in each cluster becomes a `LEADER querier` and calls other `WORKER queriers` in the same cluster. The results from all workers and leaders are merged by `LEADER cluster`.
5. `LEADER cluster` collects, merges and sends the result back to the user.

### AlertManager

The AlertManager node runs the standard alert queries, reports jobs and sends notifications.

## Next steps

- [Quickstart](./getting-started.md): get a single-node instance running.
- [HA Deployment](administration/deployment/ha-deployment.md): deploy a production HA cluster.
- [Performance tuning](./enterprise-setup/performance.md): sizing, caching, and configuration for high-throughput deployments.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
