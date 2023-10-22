# Performance Optimization

## Introduction

Architecture of an application is designed for a specific purpose - to solve a specific set of problems - and it involves certain trade-offs. In the case of OpenObserve the specific set of problems is to provide a scalable, fault tolerant, high performance, low latency, cost effective, real time observability platform (Logs, Metrics, Traces, Front end monitoring).

Let's visit some of the challenges and the design decisions that were made to achieve the above goals. 

### Challenges

- **High speed data ingestion**
- **High search and aggregation performance - Logs** 
- **Data storage cost**

## Ingestion

OpenObserve stores data in parquet format compressed using zstd to reduce the storage requirements. In distributed mode OpenObserve stores data in Object storage solutions like s3 (and compatible stores. Azure blob is supported too) that are highly cost effective and scalable and allow you to reduce storage cost significantly.

OpenObserve does not do full-text indexing of data unlike Elasticsearch which is extremely compute intensive. This allows OpenObserve to be 5-10 times more performant for ingestion than Elasticsearch for the same amount of hardware.

There are things that you can do to optimize the ingestion performance of OpenObserve additionally:

1. Ensure you have enough CPU cores available for ingestion. OpenObserve uses all available CPU cores for ingestion. If you have 16 CPU cores available for ingestion, you can expect to ingest 4 times more data than if you had 4 CPU cores available for ingestion.
1. Using VRL functions at ingest time will use additional CPU during ingestion and can reduce your throughput. Impact can var based on complexity of your functions. Test and plan accordingly.
1. CPU to memory ratio of 2x is found to be a good ratio for ingestion. For example, if you have 4 CPU cores available for ingestion, you should have 8 GB of RAM available for ingestion. on AWS that means c6i or c7g instances (As of 2023) are recommended for ingestion.
1. On AWS we we recommend c7g instances which are typically 20% faster for ingestion and cost approximately 20% less than c6i instances.
1. Use SIMD version of containers/binaries for ingestion. They are able to leverage latest CPU instructions both on Intel and ARM CPUs and can help in calculating hashes for bloom filters faster.
1. OpenObserve uses local disk on ingesters for temporary storage before batching and pushing data to object storage. This requires high IOPS. 3000 IOPS for most workloads should be good enough but test, measure and size it appropriately for your workload.

OpenObserve is designed to handle 100s of thousands of events per second per node. Mostly this will result in 7-15 MB/sec ingestion per vCPU core (varies on various factors). 

##  Log search

Openobserve does not do full-text indexing like Elasticsearch. This results in very high compression ratio of ingested data. coupled with object storage this can give you~140x lower storage cost. However, this also means that search performance for full text queries in absence of full-text indexes might suffer. However log data has some unique properties that can be leveraged to improve search performance significantly. OpenObserve uses following techniques to improve search performance:

### ***Column pruning*** 
OpenObserve uses columnar storage format (parquet) which allows it to read only the columns that are required for a query. This reduces the amount of data that needs to be read from disk and improves search performance. This technique is called column pruning. It reduces the amount of data that needs to be read from disk. You must switch to SQL query mode for this and specify only the columns that you want to be returned.

### ***In memory caching*** 
OpenObserve can use RAM to cache the data that is read from disk/s3. This reduces the amount of data that needs to be read from disk and improves search performance. OpenObserve by default will try to use all the available RAM to improve performance. This can also mean high memory utilization. You can use following environment variables to configure the cache:

    | Environment Variable                    | Value | Description                                                   |
    | --------------------------------------- | ----- | ------------------------------------------------------------- |
    | ZO_MEMORY_CACHE_MAX_SIZE                | 4096  | This will limit the query cache to 4GB                        |
    | ZO_MEMORY_CACHE_DATAFUSION_MAX_SIZE     | 4096  | This will limit the query engine memory pool to 4GB           |

  You want to have at least 8 GB of memory with the above settings.


### ***Predicate pushdown: Partitioning*** 
OpenObserve uses a technique called predicate pushdown to further reduce the amount of data that needs to be read from disk. This is done by pushing down the filters to the storage layer. By default OpenObserve will partition data by `org/stream/year/month/day/hour`. So when searching, if you know the time range for which you are searching for data you should specify it and you reduce search space and search across much less data. This will improve search performance and will utilize predicate pushdown. You can also enable additional partitioning for fields on any stream by going to stream settings. Some good candidates for partition keys are host and kubernetes namespace. e.g. You can have multiple partition keys for a stream. You can then specify partition keys in your query. e.g. `host='xyz' and kubernetes_namespace='abc'`. This will improve search performance and will utilize predicate pushdown.*** `DO NOT enable partitioning on all/many filds as it wmay result in many small underlying parquet files which will result in extremely poor search performance and high s3 storage costs` ***. As a rule of thumb you would want the size of each stored parquet file to be above 5 MB. Order of partotions does not matter. You can partition by namespace, pod or pod, namespace. e.g.

```
data/stream/files/default/logs/optimized/2023/10/20/03/k8s_container_name=app
├── k8s_namespace_name=p1
│   ├── k8s_pod_name=k1-6cf68b7dfb-t4hbb
│   │   └── 7120990213769396224KU6f10.parquet
│   ├── k8s_pod_name=k2-5cb8dc848-jgztx
│   │   └── 7120989677196279808qFYgcG.parquet
│   ├── k8s_pod_name=k3-0
│   │   └── 7120984091553562624nAndCG.parquet
│   └── k8s_pod_name=k4-6f97cb4d86-tbb52
│       └── 71209900996256071685r1ZsZ.parquet
└── k8s_namespace_name=p2
    └── k8s_pod_name=k7-7c65b8fdd9-h48xs
        └── 7120981323325505536b8xiP6.parquet
```
The above will be the disk structure if you have partitioned by kubernetes container name, kubernetes namespace and kubernetes pod name. You can then specify partition keys in your query. e.g. `k8s_container_name=app and k8s_namespace_name='p1' and k8s_pod_name='k1-6cf68b7dfb-t4hbb' and match_all('error')`. This will improve search performance and will utilize predicate pushdown. You should enable partitioning for low cardinality (Relatively not too many possible values for a field - e.g. namespace, host) data.

### ***Bloom filter (available starting v0.7.0)*** 
A bloom filters is a space efficient probabilistic data structure that allow you to check if a value exists in a set. It solves proverbial `needle in a haystack` problem. OpenObserve uses bloom filters to check if a value exists in a column. This allows OpenObserve to skip reading the data from disk if the value does not exist in the column. This improves search performance by reducing `search space`. You must specify bloom filter for the specific fields that you want to search.  Fileds that are well suited for bloom filter are of very high cardinality .e.g. UUID, request_id, trace_id, device_id, etc. You can specify bloom filter for a field by going to stream settings. You can specify multiple fields for bloom filter. e.g. `request_id` and `trace_id`. You can then specify bloom filter in your query. e.g. `request_id='abc' and trace_id='xyz'`. This will improve search performance and will utilize bloom filter. Enabling bloom filter on a field with low cardinality will not result in any performance improvement. `DO NOT enable bloom filter for all fields as it may not result in any performance improvement and may reduce ingestion performance`. 
