> Applicable to open source & enterprise version

OpenObserve is configure through the use of below environment variables.

## common

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_ROOT_USER_EMAIL            | -             | On first run  | Email of first/super admin user  |
| ZO_ROOT_USER_PASSWORD         | -             | On first run  | Password for first/super admin user |
| ZO_LOCAL_MODE                 | true          | No            | If local mode is set to true ,OpenObserve becomes single node deployment, false indicates cluster mode deployment which supports multiple nodes with different roles. For local mode one needs to configure `sled db`, for cluster mode one needs to config `etcd`. |
| ZO_LOCAL_MODE_STORAGE         | disk          | No            | `disk` or `s3`, Applicable only for local mode , by default local disk is used as storage, we also support s3 in local mode. |
| ZO_NODE_ROLE                  | all           | No            | Possible values are : all, ingester, querier, compactor, router, alertmanager. A single node can have multiple roles id desired. Specify roles separated by comma. e.g. compactor,alertmanager |
| ZO_HTTP_PORT                  | 5080          | No            | openobserve server listen HTTP port |
| ZO_HTTP_IPV6_ENABLED          | false         | No            | enable ipv6 support for HTTP |
| ZO_GRPC_PORT                  | 5081          | No            | openobserve server listen grpc port |
| ZO_GRPC_TIMEOUT               | 600           | No            | grpc query timeout, default is 500 seconds | 
| ZO_GRPC_ORG_HEADER_KEY        | openobserve-org-id   | No            | header key for sending organization information for `traces` using OTLP over grpc |
| ZO_ROUTE_TIMEOUT              | 600           | No            | timeout for router node.             |
| ZO_INSTANCE_NAME              | -             | No            | in the cluster mode, each node has a instance name, default is instance hostname. |
| ZO_BASE_URI                   | -             | No            | if you set OpenObserve with a prefix in k8s nginx ingress, you can set the prefix path. |
| ZO_DATA_DIR                   | ./data/openobserve/        | No         | Defaults to "data" folder in current working directory if not provided.   |
| ZO_DATA_WAL_DIR               | ./data/openobserve/wal/    | No         | local WAL data directory. |
| ZO_DATA_STREAM_DIR            | ./data/openobserve/stream/ | No         | streams local data storage directory ,applicable only for local mode. |
| ZO_COLUMN_TIMESTAMP           | _timestamp    | No            | for each log line, if not present with this key , we add a timestamp with this key, used for queries with time range. |
| ZO_WIDENING_SCHEMA_EVOLUTION  | false         | No            | if set to false user can add new columns to data being ingested but changes to existing data for data type are not supported . |
| ZO_FEATURE_PER_THREAD_LOCK    | false         | No            | default we share a lock for each thread for WAL, enable this option to create one lock for per thread, it improves ingest performance, but results in more small data files, which will be merged by compactor to create larger merged files. This is particularly helpful when you are ingesting high speed data in a  single stream. |
| ZO_FEATURE_FULLTEXT_ON_ALL_FIELDS | false     | No            | default full text search uses `log`, `message`, `data` or selected stream fields. Enabling this option will perform full text search on each field, may hamper full text search performance |
| ZO_UI_ENABLED                 | true          | No            | default we enable embed UI, one can disable it. |
| ZO_UI_SQL_BASE64_ENABLED      | false         | No            | Enable base64 encoding for SQL in UI. |
| ZO_METRICS_DEDUP_ENABLED      | true          | No            | enable de-duplication for metrics |
| ZO_TRACING_ENABLED            | false         | No            | enable it to send traces to remote trace server. |
| OTEL_OTLP_HTTP_ENDPOINT       | -             | No            | remote trace server endpoint. |
| ZO_TRACING_HEADER_KEY         | Authorization | No            | remote trace server endpoint authentication header key. |
| ZO_TRACING_HEADER_VALUE       | -             | No            | remote trace server endpoint authentication header value. |
| ZO_JSON_LIMIT                 | 209715200     | No            | The max payload size of json. |
| ZO_PAYLOAD_LIMIT              | 209715200     | No            | The max payload size of http request body. |
| ZO_MAX_FILE_SIZE_ON_DISK      | 32            | No            | max WAL file size before moving it to storage, default is 32MB, unit: MB |
| ZO_MAX_FILE_RETENTION_TIME    | 600           | No            | max WAL file retention ttl, default is 600s, unit: second |
| ZO_FILE_PUSH_INTERVAL         | 60            | No            | interval at which job moves files from WAL to storage, default 60s, unit: second |
| ZO_FILE_MOVE_THREAD_NUM       | -             | No            | number of threads for job to move WAL to storage, default equal to cpu_num. |
| ZO_QUERY_THREAD_NUM           | -             | No            | number of threads for searching in data files. |
| ZO_INGEST_ALLOWED_UPTO        | 5             | No            | allow historical data ingest upto `now - 5 hours` data, default 5 hours, unit: hours  |
| ZO_COMPACT_ENABLED            | true          | No            | enable compact for small files. |
| ZO_COMPACT_INTERVAL           | 60            | No            | interval at which job compacts small files into larger files. default is 60s, unit: second |
| ZO_COMPACT_MAX_FILE_SIZE      | 256           | No            | max file size for a single compacted file, after compaction all files will be below this value. default is 256MB, unit: MB |
| ZO_COMPACT_DATA_RETENTION_DAYS | 3650         | No            | Data retention days, default is 10 years. Minimal 3. eg: 30, it means will auto delete the data older than 30 days. You also can set data retention for stream in the UI. |
| ZO_MEMORY_CACHE_ENABLED       | true          | No            | enable in-memory caching for files, default is true, the latest files are cached for accelerated queries. |
| ZO_MEMORY_CACHE_CACHE_LATEST_FILES | false    | No            | by default we just cache files required by data being queried, enable this option to cache all the latest generated files.Caching all latest generated files can accelerate the queries on latest data, the time range for latest cached files depends on the max cache size. |
| ZO_MEMORY_CACHE_MAX_SIZE      | -             | No            | default 50% of the total memory used for in-memory cache, one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_SKIP_SIZE     | -             | No            | default 80% of the total memory cache size, A query will skip memory cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_RELEASE_SIZE  | -             | No            | default drop 1% entries from in-memory cache as cache is full, one can set it to desired amount unit: MB |
| ZO_TELEMETRY                  | true          | No            | Send anonymous telemetry info for improving OpenObserve. You can disable by set it to `false` |
| ZO_TELEMETRY_URL              | https://e1.zinclabs.dev | No  | OpenTelemetry report URL. You can report to your own server. |
| ZO_PROMETHEUS_ENABLED	        | false         | No            | Enables prometheus metrics on /metrics endpoint              |
| RUST_LOG                      | info          | No            | log level, default is info, supports: error, warn, info, debug, trace |
| ZO_COLS_PER_RECORD_LIMIT      | 1000          | No            | number of fields allowed per records during ingestion , records having more fields than configured value will be discarded |
| ZO_PRINT_KEY_CONFIG           | false         | No            | Print key config information in logs |
| ZO_LUA_FN_ENABLED             | false         | No            | Enable Lua functions for ingestion and query. Do not enable this in untrusted environments due to security considerations. Use default VRL functions if unsure. |
| ZO_METRICS_LEADER_PUSH_INTERVAL | 15          | No            | interval at which current leader information is updated to metadata store , default 15s, unit: second |
| ZO_METRICS_LEADER_ELECTION_INTERVAL | 30      | No            | interval after which new leader for metrics will be elected , when data isnt received from current leader, default 30s, unit: second  |
| ZO_PROMETHEUS_HA_CLUSTER | cluster |          | No            | for Prometheus cluster deduplication |
| ZO_PROMETHEUS_HA_REPLICA | `__replica__`      | No            | for Prometheus cluster deduplication |

> For local mode, OpenObserve use sled db as the metadata store.
> For cluster mode, OpenObserve use etcd as the metadata store.

## Etcd

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_ETCD_ADDR                  | localhost:2379 | No           | default etcd endpoint |
| ZO_ETCD_PREFIX                | /openobserve/oxide/  | No            | etcd keys prefix      |
| ZO_ETCD_CONNECT_TIMEOUT       | 2             | No            | endpoint connection timeout, unit: seconds |
| ZO_ETCD_COMMAND_TIMEOUT       | 5             | No            | command execute timeout, unit: seconds |
| ZO_ETCD_LOCK_WAIT_TIMEOUT     | 60            | No            | max ttl for a lock, the lock will report timeout above this limit. |
| ZO_ETCD_LOAD_PAGE_SIZE        | 10000         | No            | set/change this to detect pagination size for loading data from etcd. |
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
| ZO_S3_PROVIDER                | s3           | No            | s3 provider name, like: aws, gcs, gcp, oss, minio, swift |
| ZO_S3_FEATURE_FORCE_PATH_STYLE | false        | No            | feature: `force_path_style`, default enable for provider `minio` and `swift`. |
| AWS_EC2_METADATA_DISABLED     | false         | No            | feature, default enable for `swift`. |
