---
title:  OpenObserve Architecture
description: >-
  Deploy OpenObserve in single or HA mode. Learn about architecture, components,
  storage, data flow and performance optimization features.
keywords: 'openobserve, architecture, tutorial'
---

> Applicable to open-source and enterprise versions

# Architecture and Deployment Modes

You can run OpenObserve in a single node or in High Availability (HA) mode in a cluster.

## Single-Node Mode

Please refer to the [Quickstart](./quickstart.md) for single-node deployments.

### SQLite and Local Disk

This is the default mode for running OpenObserve. Use it for light usage and testing or if you don't require HA. You can still ingest and search over 2 TB on a single machine per day. 

Based on our tests (using an Apple M2 chip), you can ingest data at approximately 31 MB per second with the default configuration. This is equivalent to 1.8 GB per minute or 2.6 TB per day. 

The [Quickstart](./quickstart.md) describes various ways to set up this configuration.

<img src="../images/arch-single-local.jpg" alt="Single node architecture using SQLite and local disk" width="60%"/>

### SQLite and Object Storage

<img src="../images/arch-single-s3.jpg" alt="Single node architecture using SQLite and s3" width="60%"/>

## High Availability (HA) Mode

HA mode does not support local disk storage. Please refer to [HA Deployment](administration/deployment/ha-deployment.md) for cluster-mode deployment.

<img src="../images/arch-ha.webp" alt="HA architecture using NATS and s3" width="80%"/>

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

Astute users may notice that ingesters temporarily store data for batching before they send it to highly durable S3 (S3 is designed for 99.999999999% durability). Because only one copy of the data is temporarily on the ingester, it may seem vulnerable to loss if there's a disk failure before the data is sent to S3. However, this isn't necessarily true, and when it is, there are ways to handle the lack of redundancy.

Most distributed systems were built in an era when storage was much less reliable than it is today, requiring users to make two or three copies of files to ensure they didn't lose data. Not only is storage more reliable today, you may face penalties for replicating data. In environments like AWS, replicating data across multiple Availability Zones (AZs) results in a cross-AZ data transfer penalty of 2 cents per GB (1 cent in each direction).

In fact, Amazon EBS volumes are already replicated within an AZ, providing you with highly durable storage. Standard GP3 EBS volumes provide 99.8% durability, which is very high compared to regular disks. The io2 volumes that OpenObserve uses for its cloud service provide 99.999% durability, which is even higher, and at this level, you don't really need to make multiple copies for durability.

For self-hosted scenarios, we recommend using RAID 1 to ensure you have redundancy at the disk level.

Building the system like this allows us to offer a much simpler and more cost-effective solution. By eliminating the need to manage ongoing data replication across multiple nodes, we reduce both financial overhead and system complexity.

## Components

### Ingester

OpenObserve uses Ingester nodes to receive ingest requests, to convert data into parquet format and to store it in object storage. Ingesters store data temporarily in WAL before transferring it to object storage.

The data ingestion flow is as follows:

<img src="../images/arch-sequence-ingester.svg" alt="Data Ingestion Flow" width="90%"/>

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
1. Every `ZO_MEM_PERSIST_INTERVAL=5` seconds, dump Immutable to local disk. One Immutable will result in multiple parquet files, as it may contain multiple streams and multiple partitions. The parquet files are located at `data/wal/files`.
1. Every `ZO_FILE_PUSH_INTERVAL=10` seconds, check local parquet files. If any partition's total size is above `ZO_MAX_FILE_SIZE_ON_DISK=128` MB or any file has been retained for `ZO_MAX_FILE_RETENTION_TIME=600` seconds, merge all such small files in a partition into a big file (each big file will be maximum `ZO_COMPACT_MAX_FILE_SIZE=256` MB) and move that file to object storage.

**Ingesters store data in three parts:**

1. Data in Memtable
1. Data in Immutable
1. Parquet files in `wal` that haven't been uploaded to object storage

All of these need to be queried.

### Querier

OpenObserve uses Querier nodes to query data. Queriers are fully stateless.

The data query flow is as follows:

<img src="../images/arch-sequence-querier.svg" alt="Query Flow" width="90%"/>

1. Receive the search request using HTTP or API. The node receiving the query request becomes `LEADER querier for the query` and other queriers become `WORKER queriers for query`.
1. `LEADER` parses and verifies SQL.
1. `LEADER` finds the data time range and gets the file list from the file list index.
1. `LEADER` fetches querier nodes from cluster metadata.
1. `LEADER` partitions the list of files to be queried by each querier. For example, if 100 files need to be queried and there are five querier nodes, each querier gets to query 20 files: `LEADER` works on 20 files, and the four `WORKERS` work on 20 files each.
1. `LEADER` calls the gRPC service running on each `WORKER` querier to dispatch the search query to the Querier node. Inter-querier communication happens using gRPC.
1. `LEADER` collects, merges and sends the result back to the user.

Tips:

1. The queriers will cache parquet files in memory by default. You can use the `ZO_MEMORY_CACHE_MAX_SIZE` environment variable to configure how much memory a querier uses for caching. By default, queriers use 50% of their available memory for caching.
1. In a distributed environment, each querier node will just cache a part of the data.
1. You also have the option to enable caching the latest parquet files in memory. The ingester will notify queriers to cache the file when an ingester generates a new parquet file and uploads it to object storage.

#### Federated Search > `Applicable to enterprise version`

The federated search spans over multiple OpenObserve clusters:

1. Receive the search request on one of the clusters. The node receiving the query request becomes `LEADER cluster for the query` and other clusters become `WORKER clusters for that query`.
2. `LEADER cluster` finds all the clusters using super cluster metadata.
3. `LEADER cluster` calls a gRPC service on each `WORKER cluster` with the same query payload as input.
4. `WORKER clusters` execute the query as described above. One of the nodes in each cluster becomes a `LEADER querier` and calls other `WORKER queriers` in the same cluster. The results from all workers and leaders are merged by `LEADER cluster`.
5. `LEADER cluster` collects, merges and sends the result back to the user.

### Compactor

The Compactor node merges small files into big files to make searches more efficient. Compactors also enforce the data retention policy, carry out full stream deletions and update file list indices.

### Router

The Router node dispatches requests to an ingester or a querier. It also responds with the GUI in the browser. A router is a super simple proxy for sending appropriate requests between an ingester and a querier.

### AlertManager

The AlertManager node runs the Standard alert queries, reports jobs and sends notifications.
