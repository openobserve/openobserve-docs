> Applicable to open source & enterprise version

OpenObserve is configure through the use of below environment variables.

## common

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_ROOT_USER_EMAIL            | -             | On first run  | Email of first/root user  |
| ZO_ROOT_USER_PASSWORD         | -             | On first run  | Password for first/root user |
| ZO_LOCAL_MODE                 | true          | No            | If local mode is set to true ,OpenObserve becomes single node deployment, false indicates cluster mode deployment which supports multiple nodes with different roles. For local mode one needs to configure `sqlite db`, for cluster mode one needs to config `etcd`. |
| ZO_LOCAL_MODE_STORAGE         | disk          | No            | `disk` or `s3`, Applicable only for local mode , by default local disk is used as storage, we also support s3 in local mode. |
| ZO_NODE_ROLE                  | all           | No            | Possible values are : `all`, `ingester`, `querier`, `router`, `compactor`, `alertmanager`, A single node can have multiple roles id desired. Specify roles separated by comma. e.g. compactor,alertmanager |
| ZO_HTTP_PORT                  | 5080          | No            | openobserve server listen HTTP port |
| ZO_HTTP_ADDR                  |               | No            | openobserve server listen HTTP ip address |
| ZO_HTTP_IPV6_ENABLED          | false         | No            | enable ipv6 support for HTTP |
| ZO_GRPC_PORT                  | 5081          | No            | openobserve server listen gRPC port |
| ZO_GRPC_ADDR                  |               | No            | openobserve server listen gRPC ip address |
| ZO_GRPC_ORG_HEADER_KEY        | openobserve-org-id   | No            | header key for sending organization information for `traces` using OTLP over grpc |
| ZO_ROUTE_TIMEOUT              | 600           | No            | timeout for router node.             |
| ZO_INSTANCE_NAME              | -             | No            | in the cluster mode, each node has a instance name, default is instance hostname. |
| ZO_DATA_DIR                   | ./data/openobserve/        | No         | Defaults to "data" folder in current working directory if not provided.   |
| ZO_DATA_DB_DIR                | ./data/openobserve/db/      | No         | metadata database local storage directory. |
| ZO_DATA_WAL_DIR               | ./data/openobserve/wal/    | No         | local WAL data directory. |
| ZO_DATA_STREAM_DIR            | ./data/openobserve/stream/ | No         | streams local data storage directory ,applicable only for local mode. |
| ZO_DATA_CACHE_DIR             | ./data/openobserve/cache/ | No         | local query cache storage directory, applicable only for cluster mode. |
| ZO_META_STORE                 | -             | No         | Default is `sqlite` for local mode, `etcd` for cluster mode. and supported values are: `sqlite`, `etcd`, `postgres`, `dynamodb`, the `sqlite` only support for local mode. |
| ZO_META_POSTGRES_DSN    | -             | No         | If you enable `postgres` as meta store, you need configure the database source address, like this: `postgres://postgres:12345678@localhost:5432/openobserve` |
| ZO_META_DYNAMO_PREFIX         | -             | No         | If you enable `dynamodb` as meta store, you need configure DynamoDB table prefix, default use s3 bucket name. |
| ZO_COLUMN_TIMESTAMP           | _timestamp    | No            | for each log line, if not present with this key , we add a timestamp with this key, used for queries with time range. |
| ZO_COLS_PER_RECORD_LIMIT      | 1000          | No            | number of fields allowed per records during ingestion , records having more fields than configured value will be discarded |
| ZO_WIDENING_SCHEMA_EVOLUTION  | true          | No            | if set to false user can add new columns to data being ingested but changes to existing data for data type are not supported . |
| ZO_SKIP_SCHEMA_VALIDATION     | false         | No            | Default we check ingested every record for schema validation, but if your schema is fixed, you can skip it, this will increase 2x ingestion performance. |
| ZO_FEATURE_PER_THREAD_LOCK    | false         | No            | default we share a lock for each thread for WAL, enable this option to create one lock for per thread, it improves ingest performance, but results in more small data files, which will be merged by compactor to create larger merged files. This is particularly helpful when you are ingesting high speed data in a  single stream. |
| ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS | false     | No            | default full text search uses `log`, `message`, `msg`, `content`, `data`, `events`, `json` or selected stream fields. Enabling this option will perform full text search on each field, may hamper full text search performance |
| ZO_FEATURE_FULLTEXT_EXTRA_FIELDS | -          | No            | default full text search uses `log`, `message`, `msg`, `content`, `data`, `events`, `json` as global setting, but you can add more fields as global full text search fields. eg: `field1,field2` |
| ZO_WAL_MEMORY_MODE_ENABLED    | false         | No            | For performance, we can write WAL file into memory instead of write into disk, this will increase ingestion performance, but it has dast lose risk when the system crashed. |
| ZO_WAL_LINE_MODE_ENABLED      | true          | No            | Default we write WAL file line by line, it is a bit slow but it safety, you can disable it to increase a bit performance, but it increase WAL file incorrect risk. |
| ZO_PARQUET_COMPRESSION        | zstd          | No            | Default we use `zstd` as the parquet file compress algorithm. but you can choose: `snappy`, `gzip`, `brotli`, `lz4`, `zstd`. |
| ZO_UI_ENABLED                 | true          | No            | default we enable embed UI, one can disable it. |
| ZO_UI_SQL_BASE64_ENABLED      | false         | No            | Enable base64 encoding for SQL in UI. |
| ZO_BASE_URI                   | -             | No            | if you set OpenObserve with a prefix in k8s nginx ingress, you can set the prefix path. |
| ZO_BLOOM_FILTER_ENABLED       | true          | No            | Enable by default, but only enabled for trace_id field |
| ZO_BLOOM_FILTER_DEFAULT_FIELDS | -            | No            | Add more fields support by bloomfilter, will add UI setting later |
| ZO_TRACING_ENABLED            | false         | No            | enable it to send traces to remote trace server. |
| OTEL_OTLP_HTTP_ENDPOINT       | -             | No            | remote trace server endpoint. |
| ZO_TRACING_HEADER_KEY         | Authorization | No            | remote trace server endpoint authentication header key. |
| ZO_TRACING_HEADER_VALUE       | -             | No            | remote trace server endpoint authentication header value. |
| ZO_JSON_LIMIT                 | 209715200     | No            | The max payload size of json. |
| ZO_PAYLOAD_LIMIT              | 209715200     | No            | The max payload size of http request body. |
| ZO_MAX_FILE_SIZE_ON_DISK      | 64            | No            | max WAL log file size before creating a new log file, default is `64MB`, unit: MB, we created WAL log file by `organization/stream_type` |
| ZO_MAX_FILE_SIZE_IN_MEMORY    | 256           | No            | max memtable size before moving to immutable and then write to disk, default is `256MB`, unit: MB |
| ZO_MAX_FILE_RETENTION_TIME    | 600           | No            | max retention time for WAL log and memtable, default is `600s` (10m), unit: second, Whether it's the log file or the corresponding memtable that reaches this time limit, a new log file will be created and the memtable will be written to disk. |
| ZO_FILE_PUSH_INTERVAL         | 60            | No            | interval at which job moves files from WAL to storage, default `60s`, unit: second |
| ZO_FILE_MOVE_THREAD_NUM       | -             | No            | number of threads for job to move WAL to storage, default equal to cpu_num. |
| ZO_MEM_TABLE_MAX_SIZE         | -             | No            | The total size limit of memory tables, we have multiple memtable for different `organization/stream_types`. The maximum value of each memtable is `ZO_MAX_FILE_SIZE_IN_MEMORY`, but the sum of all memtable cannot exceed this limit. Otherwise, an error will be returned: `MemoryTableOverflowError` to protect the system from OOM. default `50%` of the total memory. |
| ZO_MEM_PERSIST_INTERVAL       | 5             | No            | interval at which job persist immutable from memory to disk, default `5s`, unit: second |
| ZO_QUERY_THREAD_NUM           | -             | No            | number of threads for searching in data files. |
| ZO_QUERY_TIMEOUT              | 600           | No            | Default timeout of query, unit: seconds |
| ZO_HTTP_WORKER_NUM            | 0             | No            | number of threads for http services, default equal to cpu_num. |
| ZO_HTTP_WORKER_MAX_BLOCKING   | 1024          | No            | number of per http thread blocking connection in queue |
| ZO_INGEST_ALLOWED_UPTO        | 5             | No            | allow historical data ingest upto `now - 5 hours` data, default 5 hours, unit: hours  |
| ZO_COMPACT_ENABLED            | true          | No            | enable compact for small files. |
| ZO_COMPACT_INTERVAL           | 60            | No            | interval at which job compacts small files into larger files. default is `60s`, unit: second |
| ZO_COMPACT_MAX_FILE_SIZE      | 256           | No            | max file size for a single compacted file, after compaction all files will be below this value. default is 256MB, unit: MB |
| ZO_COMPACT_DATA_RETENTION_DAYS | 3650         | No            | Data retention days, default is 10 years. Minimal 3. eg: 30, it means will auto delete the data older than 30 days. You also can set data retention for stream in the UI. |
| ZO_MEMORY_CACHE_ENABLED       | true          | No            | enable in-memory caching for files, default is true, the latest files are cached for accelerated queries. |
| ZO_MEMORY_CACHE_CACHE_LATEST_FILES | false    | No            | by default we just cache files required by data being queried, enable this option to cache all the latest generated files.Caching all latest generated files can accelerate the queries on latest data, the time range for latest cached files depends on the max cache size. |
| ZO_MEMORY_CACHE_MAX_SIZE      | -             | No            | default 50% of the total memory used for in-memory cache, one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_SKIP_SIZE     | -             | No            | default 80% of the total memory cache size, A query will skip memory cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_RELEASE_SIZE  | -             | No            | default drop 1% entries from in-memory cache as cache is full, one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_DATAFUSION_MEMORY_POOL  | -   | No            | memory pool for datafusion, supported: `greedy`, `fair`, `none`, default is: `fair`, you can choose from: https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/index.html |
| ZO_MEMORY_CACHE_DATAFUSION_MAX_SIZE  | -      | No            | default 50% of the total memory used for in-memory cache, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_ENABLED         | true          | No            | enable in-disk caching for files, default is true, the latest files are cached for accelerated queries. when the memory cache is not enough will try to cache in local disk, you can consider the memory cache is first level, disk cache is second level. |
| ZO_DISK_CACHE_MAX_SIZE        | -             | No            | default 50% of the total free disk for in-disk cache, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_SKIP_SIZE       | -             | No            | default 80% of the total disk cache size, A query will skip disk cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_RELEASE_SIZE    | -             | No            | default drop 1% entries from in-disk cache as cache is full, one can set it to desired amount unit: MB |
| ZO_TELEMETRY                  | true          | No            | Send anonymous telemetry info for improving OpenObserve. You can disable by set it to `false` |
| ZO_TELEMETRY_URL              | https://e1.zinclabs.dev | No  | OpenTelemetry report URL. You can report to your own server. |
| ZO_HEARTBEAT_INTERVAL         | 30            | No            | OpenTelemetry report frequncy. unit is: minutes, default is 30m |
| ZO_PROMETHEUS_ENABLED	        | false         | No            | Enables prometheus metrics on /metrics endpoint              |
| ZO_LOGS_FILE_RETENTION        | hourly        | No            | log streams default time partiton level: hourly, supported: hourly, daily |
| ZO_TRACES_FILE_RETENTION      | hourly        | No            | traces streams default time partiton level: hourly, supported: hourly, daily |
| ZO_METRICS_FILE_RETENTION     | daily         | No            | metrics streams default time partiton level: daily, supported: hourly, daily |
| ZO_METRICS_DEDUP_ENABLED      | true          | No            | enable de-duplication for metrics |
| ZO_METRICS_LEADER_PUSH_INTERVAL | 15          | No            | interval at which current leader information is updated to metadata store , default 15s, unit: second |
| ZO_METRICS_LEADER_ELECTION_INTERVAL | 30      | No            | interval after which new leader for metrics will be elected , when data isnt received from current leader, default 30s, unit: second  |
| ZO_PROMETHEUS_HA_CLUSTER | cluster |          | No            | for Prometheus cluster deduplication |
| ZO_PROMETHEUS_HA_REPLICA | `__replica__`      | No            | for Prometheus cluster deduplication |
| ZO_PRINT_KEY_CONFIG           | false         | No            | Print key config information in logs |
| ZO_PRINT_KEY_SQL              | false         | No            | Print key sql in logs |
| ZO_USAGE_REPORTING_ENABLED              | false         | No            | Enable usage reporting. This will start capturing how much data has been ingested across each org/stream. You can use this info to enable chargeback for internal teams. |
| ZO_USAGE_ORG                            | _meta_         | No            | To which org the usage data should be sent |
| ZO_USAGE_BATCH_SIZE                     | 2000         | No            | How many requests should be batched before flushing the usage data tfrom memory to disk |
| O2_DEX_ENABLED                | false         | Yes           | Enables SSO in OpenObserve using Dex. |
| O2_DEX_CLIENT_ID              | -             | Yes           | Client id of static client |
| O2_DEX_CLIENT_SECRET          | -             | Yes           | Client secret of static client |
| O2_DEX_BASE_URL               | -             | Yes           | URL of the Dex identity provider |
| O2_CALLBACK_URL               | -             | Yes           | Set this value to `<openobserve base url>/web/cb`, after sucessful token received from dex, user will be redirected to this page   |
| O2_DEX_REDIRECT_URL           | -             | Yes           | Set this value to `<openobserve base url>/config/callback`, Should match to redirect uri specified in dex |
| O2_DEX_SCOPES                 | openid profile email groups offline_access | No            | scopes to be fetched from dex   |
| O2_DEX_GROUP_ATTRIBUTE        | ou            | No            | Maps user to OpenObserve organization. |
| O2_DEX_ROLE_ATTRIBUTE         | cn            | No            | User's role in the organization.|
| O2_DEX_DEFAULT_ORG            | default       | No            | Default organization for users not belonging to any group in ldap|
| RUST_LOG                      | info          | No            | log level, default is info, supports: error, warn, info, debug, trace |

> For local mode, OpenObserve use sqlite as the metadata store.
> 
> For cluster mode, OpenObserve use etcd as the metadata store.

## Etcd

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_ETCD_ADDR                  | localhost:2379 | No           | default etcd endpoint |
| ZO_ETCD_PREFIX                | /openobserve/oxide/  | No            | etcd keys prefix      |
| ZO_ETCD_CONNECT_TIMEOUT       | 5             | No            | endpoint connection timeout, unit: seconds |
| ZO_ETCD_COMMAND_TIMEOUT       | 10            | No            | command execute timeout, unit: seconds |
| ZO_ETCD_LOCK_WAIT_TIMEOUT     | 60            | No            | max ttl for a lock, the lock will report timeout above this limit. |
| ZO_ETCD_LOAD_PAGE_SIZE        | 1000          | No            | set/change this to detect pagination size for loading data from etcd. |
| ZO_ETCD_USER                  | -             | No            | authentication, username, refer: https://etcd.io/docs/v3.5/op-guide/authentication/rbac/ |
| ZO_ETCD_PASSWORD              | -             | No            | authentication, password |
| ZO_ETCD_CLIENT_CERT_AUTH      | false         | No            | authentication with TLS, default is disabled, refer: https://etcd.io/docs/v3.5/op-guide/security/ |
| ZO_ETCD_TRUSTED_CA_FILE       | -             | No            | authentication with TLS, ca file path |
| ZO_ETCD_CERT_FILE             | -             | No            | authentication with TLS, cert file path |
| ZO_ETCD_KEY_FILE              | -             | No            | authentication with TLS, key file path |
| ZO_ETCD_DOMAIN_NAME           | -             | No            | authentication with TLS, cert domain name, default is empty, OpenObserve uses the domain in the cert |


## sled db

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_SLED_DATA_DIR              | ./data/openobserve/db/  | No  | sled db data directory. |
| ZO_SLED_PREFIX                | /openobserve/oxide/  | No            | sled db keys prefix . |


## S3

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL              | -             | No            | default for aws s3 & leave it empty, but for `minIO`, `gcs` one should configure it. |
| ZO_S3_REGION_NAME             | -             | No            | region name |
| ZO_S3_ACCESS_KEY              | -             | No            | access key |
| ZO_S3_SECRET_KEY              | -             | No            | secret key |
| ZO_S3_BUCKET_NAME             | -             | No            | bucket name |
| ZO_S3_BUCKET_PREFIX           | -             | No            | you can store data in a sub directory, like: `openobserve/` |
| ZO_S3_PROVIDER                | s3            | No            | s3 provider name, like: aws, gcs, gcp, oss, minio, swift |
| ZO_S3_FEATURE_FORCE_PATH_STYLE | false        | No            | feature: `force_path_style`, default enable for provider `minio` and `swift`. |
| AWS_EC2_METADATA_DISABLED     | false         | No            | feature, default enable for `swift`. |
| ZO_S3_FEATURE_HTTP1_ONLY      | false         | No            | feature |
| ZO_S3_FEATURE_HTTP2_ONLY      | false         | No            | feature |
 