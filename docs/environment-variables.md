> Applicable to open source & enterprise version

OpenObserve is configured through the use of below environment variables.

## Common

| Environment Variable                 | Default Value              | Mandatory    | Description                                                                       |
| ------------------------------------ | -------------------------- | ------------ | --------------------------------------------------------------------------------- | 
| ZO_ROOT_USER_EMAIL                   | -                          | On first run | Email of first/root user                                                          |
| ZO_ROOT_USER_PASSWORD                | -                          | On first run | Password for first/root user                                                      |
| ZO_LOCAL_MODE                        | true                       | No           | If local mode is set to true ,OpenObserve becomes single node deployment, false indicates cluster mode deployment which supports multiple nodes with different roles. For local mode one needs to configure `sqlite db`, for cluster mode one needs to config `etcd`.                    |
| ZO_LOCAL_MODE_STORAGE                | disk                       | No           | `disk` or `s3`, Applicable only for local mode , by default local disk is used as storage, we also support s3 in local mode. |
| ZO_NODE_ROLE                         | all                        | No           | Possible values are : `all`, `ingester`, `querier`, `router`, `compactor`, `alertmanager`, A single node can have multiple roles id desired. Specify roles separated by comma. e.g. compactor,alertmanager. |
| ZO_NODE_HEARTBEAT_TTL                | 30                         | No           | Node Heartbeat time to live in seconds.                                           |
| ZO_HTTP_PORT                         | 5080                       | No           | openobserve server listen HTTP port                                               |
| ZO_HTTP_ADDR                         |                            | No           | openobserve server listen HTTP ip address                                         |
| ZO_HTTP_IPV6_ENABLED                 | false                      | No           | enable ipv6 support for HTTP                                                      |
| ZO_HTTP_WORKER_NUM                   | 0                          | No           | number of threads for http services, default equal to cpu_num.                    |
| ZO_HTTP_WORKER_MAX_BLOCKING          | 1024                       | No           | number of per http thread blocking connection in queue                            |
| ZO_GRPC_PORT                         | 5081                       | No           | openobserve server listen gRPC port                                               |
| ZO_GRPC_ADDR                         |                            | No           | openobserve server listen gRPC ip address                                         |
| ZO_GRPC_ORG_HEADER_KEY               | openobserve-org-id         | No           | header key for sending organization information for `traces` using OTLP over grpc |
| ZO_GRPC_STREAM_HEADER_KEY            | stream-name                | No           | header key for sending stream-name information for `traces` using OTLP over grpc  |
| ZO_GRPC_MAX_MESSAGE_SIZE             | 16                         | No           | Max grpc message size in MB, default is 16 MB.                                    |
| ZO_GRPC_CONNECT_TIMEOUT              | 5 (seconds)                | No           | The timeout in seconds to connect to the grpc server.                             |
| ZO_ROUTE_TIMEOUT                     | 600                        | No           | timeout for router node.                                                          |
| ZO_ROUTE_MAX_CONNECTIONS             | 1024                       | No           | Set total number of simultaneous connections per type of scheme for the Router node role. |
| ZO_INSTANCE_NAME                     | -                          | No           | in the cluster mode, each node has a instance name, default is instance hostname. |
| ZO_DATA_DIR                          | ./data/openobserve/        | No           | Defaults to "data" folder in current working directory if not provided.           |
| ZO_DATA_DB_DIR                       | ./data/openobserve/db/     | No           | metadata database local storage directory.                                        |
| ZO_DATA_WAL_DIR                      | ./data/openobserve/wal/    | No           | local WAL data directory.                                                         |
| ZO_DATA_STREAM_DIR                   | ./data/openobserve/stream/ | No           | streams local data storage directory ,applicable only for local mode.             |
| ZO_DATA_IDX_DIR                      | ""                         | No           | Local WAL Idx directory.                                                          |
| ZO_COLUMN_TIMESTAMP                  | \_timestamp                | No           | for each log line, if not present with this key , we add a timestamp with this key, used for queries with time range.  |
| ZO_COLS_PER_RECORD_LIMIT             | 1000                       | No           | number of fields allowed per records during ingestion , records having more fields than configured value will be discarded  |
| ZO_WIDENING_SCHEMA_EVOLUTION         | true                       | No           | if set to false user can add new columns to data being ingested but changes to existing data for data type are not supported .  |
| ZO_SKIP_SCHEMA_VALIDATION            | false                      | No           | Default we check ingested every record for schema validation, but if your schema is fixed, you can skip it, this will increase 2x ingestion performance.  |
| ZO_FEATURE_INGEST_BUFFER_ENABLED     | false                      | No           | enable it to enqueue ingestion requests for background processing, used to improve responsiveness of ingestion endpoints     |
| ZO_FEATURE_PER_THREAD_LOCK           | false                      | No           | default we share a lock for each thread for WAL, enable this option to create one lock for per thread, it improves ingest performance, but results in more small data files, which will be merged by compactor to create larger merged files. This is particularly helpful when you are ingesting high speed data in a single stream.     |
| ZO_FEATURE_FULLTEXT_EXTRA_FIELDS     | -                          | No           | default full text search uses `log`, `message`, `msg`, `content`, `data`, `events`, `json` as global setting, but you can add more fields as global full text search fields. eg: `field1,field2`  |
| ZO_FEATURE_DISTINCT_EXTRA_FIELDS     | ""                         | No           |  |
| ZO_FEATURE_QUICK_MODE_FIELDS         | ""                         | No           |  |
| ZO_FEATURE_FILELIST_DEDUP_ENABLED    | false                      | No           |  |
| ZO_FEATURE_QUERY_QUEUE_ENABLED       | true                       | No           |  |
| ZO_FEATURE_QUERY_INFER_SCHEMA        | false                      | No           |  |
| ZO_FEATURE_QUERY_PARTITION_STRATEGY  | file_num                   | No           | Query partition strategy. Possible values - `file_num`, `file_size`, `file_hash`.       |
| ZO_WAL_MEMORY_MODE_ENABLED           | false                      | No           | For performance, we can write WAL file into memory instead of write into disk, this will increase ingestion performance, but it has data lose risk when the system crashed.  |
| ZO_WAL_LINE_MODE_ENABLED             | true                       | No           | Default we write WAL file line by line, it is a bit slow but it safety, you can disable it to increase a bit performance, but it increase WAL file incorrect risk.  |
| ZO_PARQUET_COMPRESSION               | zstd                       | No           | Default we use `zstd` as the parquet file compress algorithm. but you can choose: `snappy`, `gzip`, `brotli`, `lz4`, `zstd`. |
| ZO_PARQUET_MAX_ROW_GROUP_SIZE        |                            | No           |                                                                                         |
| ZO_UI_ENABLED                        | true                       | No           | default we enable embed UI, one can disable it.                                         |
| ZO_UI_SQL_BASE64_ENABLED             | false                      | No           | Enable base64 encoding for SQL in UI.                                                   |
| ZO_WEB_URL                           | -                          | No           | UI access URL, eg: `http://localhost:5080`, used for redirect url and alert url.        |
| ZO_BASE_URI                          | -                          | No           | If you set OpenObserve with a prefix in k8s nginx ingress, you can set the prefix path. |
| ZO_JSON_LIMIT                        | 209715200                  | No           | The max payload size of json.                                                           |
| ZO_PAYLOAD_LIMIT                     | 209715200                  | No           | The max payload size of http request body.                                              |
| ZO_MAX_FILE_SIZE_ON_DISK             | 64                         | No           | max WAL log file size before creating a new log file, default is `64MB`, unit: MB, we created WAL log file by `organization/stream_type` |
| ZO_MAX_FILE_SIZE_IN_MEMORY           | 256                        | No           | max memtable size before moving to immutable and then write to disk, default is `256MB`, unit: MB  |
| ZO_MAX_FILE_RETENTION_TIME           | 600                        | No           | max retention time for WAL log and memtable, default is `600s` (10m), unit: second, Whether it's the log file or the corresponding memtable that reaches this time limit, a new log file will be created and the memtable will be written to disk.                                                    |
| ZO_FILE_PUSH_INTERVAL                | 60                         | No           | interval at which job moves files from WAL to storage, default `60s`, unit: second              |
| ZO_FILE_MOVE_THREAD_NUM              | -                          | No           | number of threads for job to move WAL files to storage on ingester, default equal to cpu_num.   |
| ZO_MEM_DUMP_THREAD_NUM               | -                          | No           | number of threads for job to dump MemTable to disk on ingester, default equal to cpu_num.       |
| ZO_FILE_MERGE_THREAD_NUM             | -                          | No           | number of threads for job to merge files on compactor WAL to storage, default equal to cpu_num. |
| ZO_FILE_PUSH_LIMIT                   | 0                          | No           |  |
| ZO_FILE_MOVE_FIELDS_LIMIT            | 2000                       | No           | Over this limit will skip merging on ingester. |
| ZO_FILE_MOVE_THREAD_NUM              | 0                          | No           | Number of threads to use for perquet file move. If `0`, the number of threads will be equal to the number of CPU cores. |
| ZO_MEM_TABLE_MAX_SIZE                | -                          | No           | The total size limit of memory tables, we have multiple memtable for different `organization/stream_types`. The maximum value of each memtable is `ZO_MAX_FILE_SIZE_IN_MEMORY`, but the sum of all memtable cannot exceed this limit. Otherwise, an error will be returned: `MemoryTableOverflowError` to protect the system from OOM. default `50%` of the total memory. |
| ZO_MEM_PERSIST_INTERVAL              | 5                          | No           | interval at which job persist immutable from memory to disk, default `5s`, unit: second       |
| ZO_COMPACT_ENABLED                   | true                       | No           | enable compact for small files.                                                               |
| ZO_COMPACT_INTERVAL                  | 60                         | No           | interval at which job compacts small files into larger files. default is `60s`, unit: second  |
| ZO_COMPACT_MAX_FILE_SIZE             | 256                        | No           | max file size for a single compacted file, after compaction all files will be below this value. default is 256MB, unit: MB   |
| ZO_COMPACT_DATA_RETENTION_DAYS       | 3650                       | No           | Data retention days, default is 10 years. Minimal 3. eg: 30, it means will auto delete the data older than 30 days. You also can set data retention for stream in the UI.   |
| ZO_COMPACT_SYNC_TO_DB_INTERVAL       | 1800                       | No           | The interval time in seconds after which compactor sync cache to db is run.                   |
| ZO_COMPACT_DELETE_FILES_DELAY_HOURS  | 2                          | No           | The number of hours to delay to delete the pending deleted files by compactor. Value can not be less than `1`. |
| ZO_COMPACT_DATA_RETENTION_HISTORY    | false                      | No           | If enabled this will move the `file_list` into `file_list_history` and not delete files from storage. |
| ZO_COMPACT_BLOCKED_ORGS              | ""                         | No           | Use comma to split multiple orgs. Blocked organizations will not be able to ingest data       |
| ZO_COMPACT_FAST_MODE                 | true                       | No           | Enable fast mode compact, will use more memory but faster, disable it will reduce 50% memory  |
| ZO_TELEMETRY                         | true                       | No           | Send anonymous telemetry info for improving OpenObserve. You can disable by set it to `false` |
| ZO_TELEMETRY_URL                     | https://e1.zinclabs.dev    | No           | OpenTelemetry report URL. You can report to your own server.                                  |
| ZO_HEARTBEAT_INTERVAL                | 30                         | No           | OpenTelemetry report frequency. unit is: minutes, default is 30m                              |
| ZO_PROMETHEUS_ENABLED                | false                      | No           | Enables prometheus metrics on /metrics endpoint                                               |
| ZO_LOGS_FILE_RETENTION               | hourly                     | No           | log streams default time partition level: hourly, supported: hourly, daily                    |
| ZO_TRACES_FILE_RETENTION             | hourly                     | No           | traces streams default time partition level: hourly, supported: hourly, daily                 |
| ZO_METRICS_FILE_RETENTION            | daily                      | No           | metrics streams default time partition level: daily, supported: hourly, daily                 |
| ZO_METRICS_DEDUP_ENABLED             | true                       | No           | enable de-duplication for metrics                                                             |
| ZO_METRICS_LEADER_PUSH_INTERVAL      | 15                         | No           | interval at which current leader information is updated to metadata store , default 15s, unit: second   |
| ZO_METRICS_LEADER_ELECTION_INTERVAL  | 30                         | No           | interval after which new leader for metrics will be elected , when data isn't received from current leader, default 30s, unit: second   |
| ZO_PROMETHEUS_HA_CLUSTER             | cluster                    | No           | for Prometheus cluster deduplication                                                          |
| ZO_PROMETHEUS_HA_REPLICA             | `__replica__`              | No           | for Prometheus cluster deduplication                                                          |
| ZO_PRINT_KEY_CONFIG                  | false                      | No           | Print key config information in logs                                                          |
| ZO_PRINT_KEY_SQL                     | false                      | No           | Print key sql in logs                                                                         |
| RUST_LOG                             | info                       | No           | log level, default is info, supports: error, warn, info, debug, trace                         |
| ZO_BASE_URI                          | ""                         | No           | Change it in case you are hosting at a subpath e.g. www.example.com/openobserve               |
| ZO_BULK_RESPONSE_INCLUDE_ERRORS_ONLY | false                      | No           | When using \_bulk API which is compatible with Elasticsearch do not respond with records that succeeded. This allows for higher performance by returing smaller amount of data.  |
| ZO_ALLOW_USER_DEFINED_SCHEMAS        | false                      | No           | If `true`, it allows user defined schemas for a stream.                                       |
| ZO_SKIP_FORMAT_BULK_STREAM_NAME      | false                      | No           | If `true`, it enables formatting of bulk stream name while ingestion.                         |
| ZO_SKIP_FORMAT_BULK_STREAM_NAME      | false                      | No           | do not rename stream by changing hyphen to underscore.                                        |
| ZO_CONCATENATED_SCHEMA_FIELD_NAME    | \_all                      | No           |  |
| ZO_STARTING_EXPECT_QUERIER_NUM       | 0                          | No           | The number of queriers expected to be running while caching enrichment tables.                |
| ZO_QUERY_OPTIMIZATION_NUM_FIELDS     | 1000                       | No           |  |
| ZO_QUERY_FULL_MODE_LIMIT             | 1000                       | No           |  |
| ZO_QUERY_PARTITION_BY_SECS           | 10 (seconds)               | No           |  |
| ZO_QUERY_PARTITION_MIN_SECS          | 600 (seconds)              | No           |  |
| ZO_QUERY_GROUP_BASE_SPEED            |                            | No           |  |
| ZO_QUERY_THREAD_NUM                  | -                          | No           | number of threads for searching in data files.  |
| ZO_QUERY_TIMEOUT                     | 600                        | No           | Default timeout of query, unit: seconds         |
| ZO_QUERY_ON_STREAM_SELECTION         |                            | No           |  |
| ZO_ENABLE_INVERTED_INDEX             | false                      | No           |  |
| ZO_INVERTED_INDEX_SPLIT_CHARS        | .,;:\|/#_ =-+*^&%$@!~\`     | No           | These are the default characters used for splitting the text for creating the inverted index. |
| ZO_IGNORE_FILE_RETENTION_BY_STREAM   |                            | No           |  |
| ZO_ACTIX_REQ_TIMEOUT                 | 30                         | No           | Sets actix server client timeout in seconds for first request. |
| ZO_ACTIX_KEEP_ALIVE                  | 30                         | No           | Sets actix server keep-alive preference in seconds.            |
| ZO_ACTIX_SHUTDOWN_TIMEOUT            |                            | No           | Sets timeout for graceful worker shutdown of actix workers.    |
| ZO_COOKIE_SAME_SITE_LAX              | true                       | No           | If `true`, same site "lax" cookie is set by the server while authentication. |
| ZO_COOKIE_SECURE_ONLY                | false                      | No           | If `true`, secure flag is enabled for the cookie set by the server while authentication. |
| ZO_DISTINCT_VALUES_INTERVAL          |                            | No           |  |
| ZO_DISTINCT_VALUES_HOURLY            |                            | No           |  |
| ZO_INGEST_ALLOWED_UPTO               | 5                          | No           | allow historical data ingest up to `now - 5 hours` data, default 5 hours, unit: hours  |
| ZO_INGEST_BUFFER_QUEUE_NUM           | 5                          | No           | number of queues to buffer ingestion requests. `ZO_FEATURE_INGEST_BUFFER_ENABLED` must be true  |
| ZO_INGESTER_SERVICE_URL              |                            | No           |  |
| ZO_INGEST_BLOCKED_STREAMS            |                            | No           |  |
| ZO_INGEST_INFER_SCHEMA_PER_REQUEST   |                            | No           |  |
| ZO_INGEST_FLATTEN_LEVEL              | 5                          | No           | The level of flatten ingestion json data, if you want flatten everything you can simple set it to `0`, or you can set it to `N` to limit the flatten level.   |
| ZO_ENTRY_PER_SCHEMA_VERSION_ENABLED  |                            | No           |  |
| ZO_CLUSTER_COORDINATOR               | etcd                       | No           | How the nodes in the cluster find each other. Options are etcd and nats. nats is preferred. |
| ZO_QUEUE_STORE                       |                            | No           |  |
| ZO_SHOW_STREAM_DATES_DOCS_NUM        |                            | No           |  |
| ZO_RESTRICTED_ROUTES_ON_EMPTY_DATA   |                            | No           |  |
| ZO_ALERT_SCHEDULE_INTERVAL           |                            | No           |  |
| ZO_TCP_PORT                          | 5514                       | No           | TCP port for syslog  |
| ZO_UDP_PORT                          | 5514                       | No           | UDP port for syslog  |
| ZO_APP_NAME                          |                            | No           |  |
| ZO_DEFAULT_SCRAPE_INTERVAL           |                            | No           |  |
| ZO_CIRCUIT_BREAKER_ENABLE            |                            | No           |  |
| ZO_CIRCUIT_BREAKER_RATIO             |                            | No           |  |
| ZO_CALCULATE_STATS_INTERVAL          | 600                        | No           | In seconds. How often stream stats (total size) is calculated  |
| ZO_ENRICHMENT_TABLE_LIMIT            |                            | No           |  |

> For local mode, OpenObserve use sqlite as the metadata store.
>
> For cluster mode, OpenObserve use postgres(recommended)/mysql as the metadata store.

## Meta storage


| Environment Variable               | Default Value | Mandatory | Description                                                       |
| ---------------------------------- | ------------- | --------- | ----------------------------------------------------------------- |
| ZO_META_STORE                      | -             | No        | Default is `sqlite` for local mode, `etcd` for cluster mode. and supported values are: `sqlite`, `etcd`, `postgres`, `mysql`. `sqlite` is supported only for local mode. etcd is deprecated.  |
| ZO_META_TRANSACTION_LOCK_TIMEOUT   | 600           | No        | Timeout (in seconds) of transaction lock in meta table.           |
| ZO_META_TRANSACTION_RETRIES        | 3             | No        | Maximum time the transaction in the meta table will be retried.   |
| ZO_META_POSTGRES_DSN               | -             | No        | If you enable `postgres` as meta store, you need configure the database source address, like this: `postgres://postgres:12345678@localhost:5432/openobserve`   |
| ZO_META_MYSQL_DSN                  |               | No        | set this if you want to use MySQL as metadata and filelist store. |
| ZO_META_CONNECTION_POOL_MIN_SIZE   | -             | No        | Minimum number of connections created in the connection pool size for `postgres`, `sqlite`, and `mysql`. Defaults to `cpu_limits`   |
| ZO_META_CONNECTION_POOL_MAX_SIZE   | -             | No        | Maximum number of connections created in the connection pool size for `postgres`, `sqlite`, and `mysql`. Defaults to `cpu_limits * 2` |


## Bloom filter

| Environment Variable               | Default Value | Mandatory | Description                                                         |
| ---------------------------------- | ------------- | --------- | ------------------------------------------------------------------- |
| ZO_BLOOM_FILTER_ENABLED            | true          | No        | Enable by default, but only enabled for trace_id field.             |
| ZO_BLOOM_FILTER_DEFAULT_FIELDS     | -             | No        | Add more fields support by bloom filter, will add UI setting later. |
| ZO_BLOOM_FILTER_DISABLED_ON_SEARCH | false         | No        | Disable bloom filter for search queries.                            |


## Usage reporting

| Environment Variable               | Default Value | Mandatory | Description                         |
| ---------------------------------- | ------------- | --------- | ----------------------------------- |
| ZO_USAGE_REPORTING_ENABLED         | false         | No        | Enable usage reporting. This will start capturing how much data has been ingested across each org/stream. You can use this info to enable charge back for internal teams. |
| ZO_USAGE_ORG                       | _meta_        | No        | To which org the usage data should be sent. |
| ZO_USAGE_BATCH_SIZE                | 2000          | No        | How many requests should be batched before flushing the usage data from memory to disk |
| ZO_USAGE_REPORTING_MODE            | `local`       | No        | `local` mode means the usage will be reported only in the internal cluster of `ZO_USAGE_ORG`. `remote` mode means that the usage reporting will be ingested to the remote target. `both` ingests the usage reports both to internal and remote target. |
| ZO_USAGE_REPORTING_URL             | `http://localhost:5080/api/_meta/usage/_json` | No        | In case of `remote` or `both` value of `ZO_USAGE_REPORTING_MODE`, this URL is used to post the usage reports to remote target. |
| ZO_USAGE_REPORTING_CREDS           | ""            | No        | The credentials required to send along with the post request to the `ZO_USAGE_REPORTING_URL`. E.g. - `Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4UGFzcyMxMjM=`. |
| ZO_USAGE_PUBLISH_INTERVAL          | 600           | No        | Duration in seconds after the last reporting usage will be published. |

## Reports and Alerts

| Environment Variable                | Default Value     | Mandatory | Description |
| ----------------------------------- | ----------------- | --------- | ----------- |
| ZO_CHROME_ENABLED                   | `false`           | No        | When `true`, it looks for chromium executable. Required for dashboard reports. |
| ZO_CHROME_PATH                      | -                 | No        | If chrome is enabled, custom chrome executable path can be specified. If not specified, it looks for chrome executable in default locations. If still not found, it automatically downloads a good known version of chromium. |
| ZO_CHROME_CHECK_DEFAULT_PATH        | `true`            | No        | If `false`, it skips default locations (e.g. CHROME env, usual chrome file path etc.) when looking for chrome executable. |
| ZO_CHROME_NO_SANDBOX                | `false`           | No        | If true, it launches chromium in no-sandbox environment. |
| ZO_CHROME_SLEEP_SECS                | 20                | No        | Specify the number of timeout seconds the headless chrome will wait until all the dashboard data is loaded. |
| ZO_CHROME_WITH_HEAD                 | `false`           | No        | If `true`, it launches the chromium browser in non-headless mode. |
| ZO_CHROME_WINDOW_WIDTH              | 1370              | No        | Specifies the width of the headless chromium browser. |
| ZO_CHROME_WINDOW_HEIGHT             | 730               | No        | Specifies the height of the headless chromium browser. |
| ZO_CHROME_AUTO_DOWNLOAD             | `false`           | No        | Only used by the report-server. If `true`, the report-server automatically downloads a good known version of chromium if chromium is not found in the system. **Note:** If auto download of chromium is desired, make sure that the system has all the required dependency libraries of chromium already installed. |
| ZO_ALERT_SCHEDULE_CONCURRENCY       | 5                 | No        | The number of scheduled jobs the the alert manager will pull at a time from the scheduler for processing |
| ZO_ALERT_SCHEDULE_TIMEOUT           | 90                | No        | The maximum expected time duration in seconds within which the processing of alert by the alert manager should be complete. If the processing of the alert is not complete within the timeframe, the alert will become available again for other alert managers to pick. |
| ZO_REPORT_SCHEDULE_TIMEOUT          | 300               | No        | The maximum expected time duration in seconds within which the processing of report by the alert manager should be complete. If the processing of the report is not complete within the timeframe, the report will become available again for other alert managers to pick. |
| ZO_SCHEDULER_MAX_RETRIES            | 3                 | No        | The maximum number of times the scheduler will retry processing the alert/report. If exceeded, the scheduler will skip to the next trigger time of the alert/report. |
| ZO_SCHEDULER_CLEAN_INTERVAL         | 30                | No        | The interval in seconds after which the scheduler will clean up the completed scheduled jobs. |
| ZO_SCHEDULER_WATCH_INTERVAL         | 30                | No        | The scheduler frequently watches if there are any scheduled jobs which are in processing state for more than the `ZO_ALERT_SCHEDULE_TIMEOUT`/`ZO_REPORT_SCHEDULE_TIMEOUT`, if so it increases their `retries` field by 1 and marks them as available for processing again by alert managers. |
| ZO_REPORT_USER_NAME                 | ""                | No        | The username that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_REPORT_USER_PASSWORD             | ""                | No        | The password that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_ENABLE_EMBEDDED_REPORT_SERVER    | `false`           | No        | If true, the alert manager (for which this ENV is enabled) spawns a new report-server running on PORT `5082` (default, can be changed through `ZO_REPORT_SERVER_HTTP_PORT`). |
| ZO_REPORT_SERVER_HTTP_PORT          | `5082`            | No        | The port used by the newly spawned report-server. |
| ZO_REPORT_SERVER_HTTP_ADDR          | `127.0.0.1`       | No        | The ip address used by the newly spawned report-server. |
| ZO_REPORT_SERVER_URL                | `localhost:5082`  | No        | The report server server URL. E.g. - `https://report-server.example.com/api`. |
| ZO_REPORT_SERVER_SKIP_TLS_VERIFY    | `false`           | No        | If `true`, it will skip tls verification while making request to report-server from alert manager. |

**NOTE:** For report-server to work correctly, `ZO_WEB_URL`, `ZO_BASE_URI` (if any) and `ZO_REPORT_SERVER_URL` must be specified for every alert managers.

## Caching

| Environment Variable                   | Default Value             | Mandatory | Description                                                               |
| -------------------------------------- | ------------------------- | --------- | ------------------------------------------------------------------------- |
| ZO_DATA_CACHE_DIR                      | ./data/openobserve/cache/ | No        | local query cache storage directory, applicable only for cluster mode.    |
| ZO_MEMORY_CACHE_ENABLED                | true                      | No        | enable in-memory caching for files, default is true, the latest files are cached for accelerated queries.           |
| ZO_MEMORY_CACHE_CACHE_LATEST_FILES     | false                     | No        | by default we just cache files required by data being queried, enable this option to cache all the latest generated files. Caching all latest generated files can accelerate the queries on latest data, the time range for latest cached files depends on the max cache size.   |
| ZO_MEMORY_CACHE_MAX_SIZE               | -                         | No        | default 50% of the total memory used for in-memory cache, one can set it to desired amount unit: MB  |
| ZO_MEMORY_CACHE_SKIP_SIZE              | -                         | No        | default 80% of the total memory cache size, A query will skip memory cache if it need more than this value. one can set it to desired amount unit: MB  |
| ZO_MEMORY_CACHE_RELEASE_SIZE           | -                         | No        | default drop 1% entries from in-memory cache as cache is full, one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_DATAFUSION_MEMORY_POOL | -                         | No        | memory pool for datafusion, supported: `greedy`, `fair`, `none`, default is: `fair`, you can choose from: https://docs.rs/datafusion/latest/datafusion/execution/memory_pool/index.html |
| ZO_MEMORY_CACHE_DATAFUSION_MAX_SIZE    | -                         | No        | default 50% of the total memory used for in-memory cache, one can set it to desired amount unit: MB |
| ZO_MEMORY_CACHE_STRATEGY               | lru                       | No        | Memory data cache strategy, default is lru, other value is fifo           |
| ZO_MEMORY_CACHE_BUCKET_NUM             | 0                         | No        | Memory data cache bucket num, multiple bucket means multiple locker, default is 0 |
| ZO_MEMORY_CACHE_GC_SIZE                | 50 (MB)                   | No        |  |
| ZO_DISK_CACHE_ENABLED                  | true                      | No        | enable in-disk caching for files, default is true, the latest files are cached for accelerated queries. when the memory cache is not enough will try to cache in local disk, you can consider the memory cache is first level, disk cache is second level.  |
| ZO_DISK_CACHE_MAX_SIZE                 | -                         | No        | default 50% of the total free disk for in-disk cache, one can set it to desired amount unit: MB   |
| ZO_DISK_CACHE_SKIP_SIZE                | -                         | No        | default 80% of the total disk cache size, A query will skip disk cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_RELEASE_SIZE             | -                         | No        | default drop 1% entries from in-disk cache as cache is full, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_STRATEGY                 | lru                       | No        | Disk data cache strategy, default is lru, other value is fifo |
| ZO_DISK_CACHE_BUCKET_NUM               | 0                         | No        | Disk data cache bucket num, multiple bucket means multiple locker, default is 0 |
| ZO_DISK_CACHE_MULTI_DIR                |                           | No        |   |
| ZO_DISK_CACHE_GC_SIZE                  | 100 (MB)                  | No        |   |
| ZO_DISK_CACHE_GC_INTERVAL              | 0 (seconds)               | No        |   |
| ZO_SCHEMA_CACHE_COMPRESS_ENABLED       | false                     | No        |   |

## Maxmind GeoIP

| Environment Variable              | Default Value | Mandatory | Description |
| --------------------------------- | ------------- | --------- | ----------- |
| ZO_MMDB_DISABLE_DOWNLOAD          | false         | No        |             |
| ZO_MMDB_UPDATE_DURATION           |  86400        | No        |             |
| ZO_MMDB_DATA_DIR                  |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_URL        |               | No        |             |
| ZO_MMDB_GEOLITE_ASNDB_URL         |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL |               | No        |             |

## OpenObserve self introspection and debugging

| Environment Variable           | Default Value | Mandatory | Description                                               |
| ------------------------------ | ------------- | --------- | --------------------------------------------------------- |
| ZO_TOKIO_CONSOLE_SERVER_ADDR   | "0.0.0.0"     | No        |                                                           |
| ZO_TOKIO_CONSOLE_SERVER_PORT   | 6699          | No        |                                                           |
| ZO_TOKIO_CONSOLE_RETENTION     | 60            | No        |                                                           |
| ZO_PROF_PYROSCOPE_ENABLED      |               | No        |                                                           |
| ZO_PROF_PYROSCOPE_SERVER_URL   |               | No        |                                                           |
| ZO_PROF_PYROSCOPE_PROJECT_NAME |               | No        |                                                           |
| OTEL_OTLP_HTTP_ENDPOINT        | -             | No        | remote trace server endpoint.                             |
| ZO_TRACING_ENABLED             | false         | No        | enable it to send traces to remote trace server.          |
| ZO_TRACING_HEADER_KEY          | Authorization | No        | remote trace server endpoint authentication header key.   |
| ZO_TRACING_HEADER_VALUE        | -             | No        | remote trace server endpoint authentication header value. |
| ZO_TRACING_SEARCH_ENABLED      |               | No        |                                                           |

## Quick mode

| Environment Variable             | Default Value | Mandatory | Description                                             |
| -------------------------------- | ------------- | --------- | ------------------------------------------------------- |
| ZO_QUICK_MODE_ENABLED            | false         | No        | Indicates if quick mode is enabled.                     |
| ZO_QUICK_MODE_NUM_FIELDS         | 500           | No        | The number of fields to consider for quick mode.        |
| ZO_QUICK_MODE_STRATEGY           | ""            | No        | Possible values - `first`, `last`, `both`               |
| ZO_QUICK_MODE_FILE_LIST_ENABLED  | false         | No        | Indicates if file list is enabled for quick mode        |
| ZO_QUICK_MODE_FILE_LIST_INTERVAL | 300           | No        | File list interval in seconds.                          |

## SMTP

| Environment Variable | Default Value | Mandatory | Description                                                                 |
| -------------------- | ------------- | --------- | --------------------------------------------------------------------------- |
| ZO_SMTP_ENABLED      | `false`       | No        | Indicates if smtp configuration is present.                                 |
| ZO_SMTP_HOST         | `localhost`   | No        | The SMTP host to connect to.                                                |
| ZO_SMTP_PORT         | 25            | No        | The SMTP port to connect to.                                                |
| ZO_SMTP_USER_NAME    | ""            | No        | SMTP user name. `Required` when using smtp.                                 |
| ZO_SMTP_PASSWORD     | ""            | No        | SMTP user password. `Required` when using smtp.                             |
| ZO_SMTP_REPLY_TO     | ""            | No        | The user email whom people can reply to.                                    |
| ZO_SMTP_FROM_EMAIL   | ""            | No        | The user email that is going to send the email. `Required` when using smtp. |
| ZO_SMTP_ENCRYPTION   | ""            | No        | Smtp encryption method. Possible values - `ssltls`, `starttls` and "" (in case of localhost smtp). |

## NATS

| Environment Variable      | Default Value    | Mandatory | Description                         |
| ------------------------- | -------------    | --------- | ----------------------------------- |
| ZO_NATS_ADDR              | `localhost:4222` | No        | NATS server address - If not stated explicitly the `nats://` schema and port `4222` is assumed.|
| ZO_NATS_PREFIX            | `o2_`            | No        | NATS prefix for openobserve.        |
| ZO_NATS_USER              | ""               | No        | NATS user name.                     |
| ZO_NATS_PASSWORD          | ""               | No        | NATS user password.                 |
| ZO_NATS_REPLICAS          | 3                | No        | Number of replicas for NATS.        |
| ZO_NATS_CONNECT_TIMEOUT   | 5                | No        | NATS connection timeout in seconds. |
| ZO_NATS_COMMAND_TIMEOUT   | 10               | No        | NATS command timeout in seconds.    |
| ZO_NATS_LOCK_WAIT_TIMEOUT | 3600             | No        | NATS lock wait timeout in seconds.  |
| ZO_NATS_QUEUE_MAX_AGE     | 60               | No        | NATS queue maximum age in days.     |

## Etcd

Using etcd is discouraged. Please use NATS as cluster coordinator and postgres/mysql as metastore.

For backward compatibility, we still support etcd but most of you should be able to migrate to NATS and postgres/mysql.

| Environment Variable      | Default Value       | Mandatory | Description                                                                                          |
| ------------------------- | ------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| ZO_ETCD_ADDR              | localhost:2379      | No        | default etcd endpoint                                                                                |
| ZO_ETCD_PREFIX            | /openobserve/oxide/ | No        | etcd keys prefix                                                                                     |
| ZO_ETCD_CONNECT_TIMEOUT   | 5                   | No        | endpoint connection timeout, unit: seconds                                                           |
| ZO_ETCD_COMMAND_TIMEOUT   | 10                  | No        | command execute timeout, unit: seconds                                                               |
| ZO_ETCD_LOCK_WAIT_TIMEOUT | 60                  | No        | max ttl for a lock, the lock will report timeout above this limit.                                   |
| ZO_ETCD_LOAD_PAGE_SIZE    | 1000                | No        | set/change this to detect pagination size for loading data from etcd.                                |
| ZO_ETCD_USER              | -                   | No        | authentication, username, refer: https://etcd.io/docs/v3.5/op-guide/authentication/rbac/             |
| ZO_ETCD_PASSWORD          | -                   | No        | authentication, password                                                                             |
| ZO_ETCD_CLIENT_CERT_AUTH  | false               | No        | authentication with TLS, default is disabled, refer: https://etcd.io/docs/v3.5/op-guide/security/    |
| ZO_ETCD_TRUSTED_CA_FILE   | -                   | No        | authentication with TLS, ca file path                                                                |
| ZO_ETCD_CERT_FILE         | -                   | No        | authentication with TLS, cert file path                                                              |
| ZO_ETCD_KEY_FILE          | -                   | No        | authentication with TLS, key file path                                                               |
| ZO_ETCD_DOMAIN_NAME       | -                   | No        | authentication with TLS, cert domain name, default is empty, OpenObserve uses the domain in the cert |

## S3 / Object store

| Environment Variable           | Default Value | Mandatory | Description                                                                          |
| ------------------------------ | ------------- | --------- | ------------------------------------------------------------------------------------ |
| ZO_S3_SERVER_URL               | -             | No        | default for aws s3 & leave it empty, but for `minIO`, `gcs` one should configure it. |
| ZO_S3_REGION_NAME              | -             | No        | region name                                                                          |
| ZO_S3_ACCESS_KEY               | -             | No        | access key                                                                           |
| ZO_S3_SECRET_KEY               | -             | No        | secret key                                                                           |
| ZO_S3_BUCKET_NAME              | -             | No        | bucket name                                                                          |
| ZO_S3_BUCKET_PREFIX            | -             | No        | you can store data in a sub directory, like: `openobserve/`                          |
| ZO_S3_PROVIDER                 | s3            | No        | s3 provider name, like: aws, gcs, gcp, oss, minio, swift                             |
| ZO_S3_FEATURE_FORCE_PATH_STYLE | false         | No        | feature: `force_path_style`, default enable for provider `minio` and `swift`.        |
| AWS_EC2_METADATA_DISABLED      | false         | No        | feature, default enable for `swift`.                                                 |
| ZO_S3_FEATURE_HTTP1_ONLY       | false         | No        | feature                                                                              |
| ZO_S3_FEATURE_HTTP2_ONLY       | false         | No        | feature                                                                              |

## Enterprise

Below are the Environment variables only available in the enterprise edition.

## Misc

| Environment Variable      | Default Value | Mandatory | Description                                                                             |
| ------------------------- | ------------- | --------- | --------------------------------------------------------------------------------------- |
| O2_AUDIT_ENABLED          | `false`       | No        | Indicates if audit reporting is enabled.                                                |
| O2_AUDIT_BATCH_SIZE       | 500           | No        | How many requests should be batched before flushing the audit data from memory to disk. |
| O2_CUSTOM_LOGO_TEXT       | ""            | No        | Custom logo text that will appear along with the openobserve logo.                      |
| O2_CUSTOM_SLACK_URL       | ""            | No        | Custom slack URL that will be used by the `Slack` menu on the openobserve UI.           |
| O2_CUSTOM_DOCS_URL        | ""            | No        | Custom docs URL that will be used by the `docs` tab on the openobserve UI.              |
| O2_CUSTOM_HIDE_MENUS      | ""            | No        | comma(',') separated menu items that should not be shown in the menu on openobserve UI. E.g. - `metrics,traces` |

## Super-Cluster

| Environment Variable         | Default Value | Mandatory | Description                                     |
| ---------------------------- | ------------- | --------- | ----------------------------------------------- |
| O2_SUPER_CLUSTER_ENABLED     | `false`       | No        | Indicates if super cluster is enabled.          |
| O2_SUPER_CLUSTER_REGION      | default       | No        | Region of super cluster.                        |
| O2_SUPER_CLUSTER_PUBLIC_ADDR | ""            | No        | Public address of super cluster.                |
| O2_SUPER_CLUSTER_PUBLIC_PORT | ""            | No        | Public port of super cluster (in case of gRPC). |
| O2_SUPER_CLUSTER_GRPC_TOKEN  | ""            | No        | gRPC token.                                     |

## Search-Group

| Environment Variable                    | Default Value | Mandatory | Description         |
| --------------------------------------- | ------------- | --------- | ------------------- |
| O2_SEARCH_GROUP_LONG_MAX_CPU            | `80%`         | No        |                     |
| O2_SEARCH_GROUP_LONG_MAX_MEMORY         | `80%`         | No        |                     |
| O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY    | `2`           | No        |                     |
| O2_SEARCH_GROUP_SHORT_MAX_CPU           | `20%`         | No        |                     |
| O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY   | `4`           | No        |                     |
| O2_SEARCH_GROUP_SHORT_MAX_MEMORY        | `20%`         | No        |                     |
| O2_SEARCH_GROUP_BASE_SPEED              | `1024`        | No        | Base speed in MB.   |
| O2_SEARCH_GROUP_BASE_SECS               | `10`          | No        | Base speed in secs. |

## OpenFGA

| Environment Variable               | Default Value                  | Mandatory | Description                                                                  |
| ---------------------------------- | ------------------------------ | --------- | ---------------------------------------------------------------------------- |
| O2_OPENFGA_ENABLED                 | `false`                        | No        | Indicates if openfga is enabled.                                             |
| O2_OPENFGA_BASE_URL                | `http://127.0.0.1:8080/stores` | No        | The base URL of openfga stores server. **Required** when openfga is enabled. |
| O2_OPENFGA_STORE_NAME              | `openobserve`                  | No        | OpenFGA store name. **Required** when openfga is enabled.                    |
| O2_MAP_GROUP_TO_ROLE               | `false`                        | No        | If true, the group claims are mapped into roles in the default org.          |
| O2_OPENFGA_PAGE_SIZE               | `100`                          | No        | The page size used for openfga queries.                                      |
| O2_OPENFGA_LIST_ONLY_PERMITTED     | `false`                        | No        | If `true`, openobserve only lists resources that have `GET` permission.      |
| O2_MAP_GROUP_TO_ROLE_SKIP_CREATION | `true`                         | No        | Used with `O2_MAP_GROUP_TO_ROLE`. Skips creating the roles mapped from group claims assuming they already exists. |

## DEX

| Environment Variable        | Default Value               | Mandatory | Description                                                         |
| --------------------------- | --------------------------- | --------- | ------------------------------------------------------------------- |
| O2_DEX_ENABLED              | false                       | No        | Enables SSO in OpenObserve using Dex.                               |
| O2_DEX_CLIENT_ID            | -                           | No        | Client id of static client. **Required** when dex is enabled.       |
| O2_DEX_CLIENT_SECRET        | -                           | No        | Client secret of static client. **Required** when dex is enabled.   |
| O2_DEX_BASE_URL             | `http://127.0.0.1:5556/dex` | No        | URL of the Dex identity provider. **Required** when dex is enabled. |
| O2_CALLBACK_URL             | -                           | No        | Set this value to `<openobserve base url>/web/cb`, after successful token received from dex, user will be redirected to this page. **Required** when dex is enabled. |
| O2_DEX_REDIRECT_URL         | -                           | No        | Set this value to `<openobserve base url>/config/callback`, Should match to redirect uri specified in dex. **Required** when dex is enabled. |
| O2_DEX_SCOPES               | openid profile email groups offline_access | No        | scopes to be fetched from dex.                       |
| O2_DEX_GROUP_ATTRIBUTE      | ou                          | No        | Maps user to OpenObserve organization.                              |
| O2_DEX_ROLE_ATTRIBUTE       | cn                          | No        | User's role in the organization.                                    |
| O2_DEX_DEFAULT_ORG          | default                     | No        | Default organization for users not belonging to any group in ldap   |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth`                     | No        | Suffix for dex authentication endpoint                              |
| O2_DEX_TOKEN_EP_SUFFIX      | `/token`                    | No        | Suffix for dex token endpoint                                       |
| O2_DEX_KEYS_EP_SUFFIX       | `/keys`                     | No        | Suffix for dex keys endpoint                                        |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth`                     | No        | Suffix for dex authentication endpoint                              |
| O2_DEX_NATIVE_LOGIN_ENABLED | `true`                      | No        | Indicates if native dex login is enabled.                           |
