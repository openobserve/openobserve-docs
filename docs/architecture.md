> Applicable to open source & enterprise version
# Architecture and deployment modes

OpenObserve can be run in single node or in HA mode in a cluster. 

## Single Node

Please refer to [quickstart](./quickstart.md) for single node deployments.

### SQLite and Local disk

Use this mode for light usage and testing or if HA is not a requirement for you. (You could still ingest and search over 2 TB on a single machine per day. On a mac M2 in our tests, you can ingest at ~31 MB/Second or 1.8 GB/Min or 2.6 TB/Day with default configuration). This is the default mode for running OpenObserve. Check [Quickstart](./quickstart.md) to find various ways to get this setup done.

<img src="../images/arch-single-local.jpg" alt="Single node architecture using SQLite and local disk" width="60%"/>

### SQLite and Object storage

<img src="../images/arch-single-s3.jpg" alt="Single node architecture using SQLite and s3" width="60%"/>

## High Availability (HA) mode

Local disk storage is not supported in HA mode. Please refer to [HA Deployment](./ha_deployment.md) for cluster mode deployment.

<img src="../images/arch-ha.jpg" alt="HA architecture using etcd / NATS and s3" width="80%"/>

Router, Querier, Ingester, Compactor and AlertManager nodes both can be horizontally scaled to accommodate for higher traffic.

Etcd or NATS is used as cluster coordinator and store the nodes information. it also used for cluster events.

MySQL / PostgreSQL is used to store metadata like organization, users, functions, alert rules, stream schema and file list (a index of parquet files).

Object Storage (e.g. s3, minio, gcs, etc...) stores all the data of parquet files.

## Durability

Astute users may notice that, on ingesters data is stored temporarily for batching before being sent to highly durable s3 (s3 is designed for 99.999999999% durability). There is only 1 copy of the data temporarily on the ingester and it may seem that this lends data to be vulnerable to loss in case of the disk failure before it is sent to s3. That is not entirely true though and there are ways to handle the lack of redundancy here. Most distributed systems that have been built in past were built in an era where storage was much less reliable than it is today and you would make 2-3 copies to ensure that you do not loose data. 

In addition to that, in environments like AWS replicating data across multiple availability zones results in the penalty of cross AZ data transfer (2 cents per GB - 1 cent in each direction). In fact Amazon EBS volumes are already replicated within an AZ providing you with a highly durable storage. Standard GP3 EBS volumes provide 99.8% durability which is very high compared to regular disks. io2 volumes that OpenObserve team uses for its cloud service provides 99.999% durability which is even higher and at this level you don't really need to make multiple copies for durability.

For self hosted scenarios we recommend to use RAID-1 to ensure that you have redundancy at the disk level.

By choosing to build the system this way we are able to build a much more cost effective and simpler solution without having to manage ongoing replication of data across multiple nodes and the costs (money and complexity) associated with it.

## Components

### Ingester

Ingester is used to receive ingest request and convert data into parquet format and store it in object storage. They store data temporarily in WAL before transferring it to object storage.

The data ingestion flow is:

1. receive data from HTTP / gRPC API request.
1. parse data line by line.
1. check if there are some functions (ingest functions) used to transform data. will call each ingest function by the function order. like `func(row)` and will expect to return a row. if empty row is returned then it will drop the record.
1. check timestamp field, convert timestamp, and set current timestamp if there is no time field.
1. check stream schema to identify if schema needs to be evolved. Here if we found the schema need to be update like add new fields or some fields data type changed, we will use `lock` to update schema.
1. evaluate real time alerts that have been defined for the stream.
1. write to WAL file by timestamp in hourly buckets and then convert the records by stream in a request to Arrow RecordBatch and write into Memtable. 

    1. Here we create Memtable by `organization/stream_type`, if you only use `logs` it means we only create one Memtable.
    1. The WAL file and Metable is created by pair. it means one WAL file has one Memtable. the WAL file path is `data/wal/logs`.

1. When the Memtable size reached `ZO_MAX_FILE_SIZE_IN_MEMORY=256` MB or the WAL file reached `ZO_MAX_FILE_SIZE_ON_DISK=128` MB will move the Memtable to Immutable and create a new Memtable & WAL file for writting data.
1. Every `ZO_MEM_PERSIST_INTERVAL=5` seconds will dump Immutable to local disk. Here you need to know one Immutable will create multiple parquet files because it might contains multiple streams and multiple partitions. the parquet file path is `data/wal/files`.
1. Every `ZO_FILE_PUSH_INTERVAL=10` seconds will check local parquet files if each partition total size over than `ZO_MAX_FILE_SIZE_ON_DISK=128` MB or any file created over than `ZO_MAX_FILE_RETENTION_TIME=600` seconds then will merge all the small files in this partition into big file (each big file will not over `ZO_COMPACT_MAX_FILE_SIZE=256` MB) and then move to object storage.

**Ingester has three parts of data:**

1. data in Memtable
1. data in Immutable
1. parquet files in `wal` haven't upload to object storage.

All of these need to be queried.

### Querier

Querier is used to query data. Queriers nodes are fully stateless.

The data query flow is:

1. receive search request from http API. The node that receives the query request is called `LEADER querier for the query`. Other queriers are called `WORKER queriers for that query`.
1. `LEADER` parses and verifies SQL.
1. `LEADER` finds the data time range and get file list from file list index.
1. `LEADER` fetch querier nodes from cluster metadata.
1. `LEADER` partitions list of files to be queried by each querier. e.g. If 100 files need to be queried and there are 5 nodes, then each querier gets to query 20 files `LEADER` works on 20 files, `WORKERS` work on 20 files each.
1. `LEADER` calls gRPC service running on each `WORKER` querier to dispatch search query to the querier node. Inter querier communication happens using gRPC.
1. `LEADER` collects, merges and sends the result back to the user.

Tips:

1. The querier will cache parquet files in memory by default. You can configure the amount of memory used by querier for caching through environment variable `ZO_MEMORY_CACHE_MAX_SIZE`.  Default caching is done through 50% of the memory available to the particular querier.
1. In distributed environment each querier node will just cache a part of the data.
1. We also have an option to enable caching latest parquet files in memory. The ingester will send a notice to queriers to cache the files when ingester generates a new parquet file and sends it to object storage.

#### Federated Search

The federated search just add a layer over cluster:

1. receive search request from one of the clusters. The node that receives the query request is called `LEADER cluster for the query`. Other clusers are called `WORKER clusters for that query`.
1. `LEADER clsuter` finds all the clusters from super cluster metadata.
1. `LEADER cluster` calls gRPC service on each `WORKER cluster` given the same query payload.
1. `WORKER cluster` do the internal logic described in the above. one of the node will become a `LEADER querier` in the cluster and call other `WORKER queriers` and then merge the result back to `LEADER cluser`.
1. `LEADER cluster` collects, merges and sends the result back to the usuer.

### Compactor

Compactor will merge small files into a big file to make the search more efficient. Compactor also handles the data retention policy, full stream deletion and update of file list index.

### Router

Router dispatches requests to ingester or querier. It also responds with the GUI in the browser. Router is a super simple proxy to send appropriate requests between ingester and querier.

### AlertManager

AlertManager runs the Standard alert queries, report jobs and sends notification.
