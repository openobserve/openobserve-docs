---
description: >-
  Configure OpenObserve with flexible environment variables for roles, storage,
  performance, and scaling across open source and enterprise deployments.
---
> Applicable to both Open Source and Enterprise editions. 

OpenObserve is configured using the following environment variables.

## Basic Configuration 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ROOT_USER_EMAIL | - | Email ID of the root user. |
| ZO_ROOT_USER_PASSWORD | - | Password for the root user. |
| ZO_LOCAL_MODE | true | If local mode is set to true, OpenObserve becomes single node deployment.If it is set to false, it indicates cluster mode deployment which supports multiple nodes with different roles. For local mode one needs to configure SQLite DB, for cluster mode one needs to configure PostgreSQL (recommended) or MySQL. |
| ZO_LOCAL_MODE_STORAGE | disk | Applicable only for local mode. By default, local disk is used as storage. OpenObserve supports both disk and S3 in local mode. |
| ZO_NODE_ROLE | all | Node role assignment. Possible values are ingester, querier, router, compactor, alertmanager, and all. A single node can have multiple roles by specifying them as a comma-separated list. For example, compactor, alertmanager. |
| ZO_NODE_ROLE_GROUP | "" | Each query-processing node can be assigned to a specific group using ZO_NODE_ROLE_GROUP. <br>
**interactive**: Handles queries triggered directly by users through the UI. <br>
**background**: Handles automated or scheduled queries, such as alerts and reports. <br>
**empty string** (default): Handles all query types. <br>
In high-load environments, alerts or reports might run large, resource-intensive queries. By assigning dedicated groups, administrators can prevent such queries from blocking or slowing down real-time user searches. |
| ZO_NODE_HEARTBEAT_TTL | 30 | Time-to-live (TTL) for node heartbeats in seconds. |
| ZO_INSTANCE_NAME | - | In the cluster mode, each node has a instance name. Default is instance hostname. |
| ZO_CLUSTER_COORDINATOR | nats | Defines how nodes in the cluster discover each other. |
| ZO_APP_NAME | openobserve | Application name for the OpenObserve instance. |

## Network and Communication
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_HTTP_PORT | 5080 | Port number on which the OpenObserve server listens for HTTP requests. |
| ZO_HTTP_ADDR | | IP address on which the OpenObserve server listens for HTTP requests. |
| ZO_HTTP_IPV6_ENABLED | false | Set this to true to enable IPv6 support for HTTP. |
| ZO_HTTP_WORKER_NUM | 0 | Number of threads for HTTP services. Default is equal to the number of CPU cores (cpu_num). |
| ZO_HTTP_WORKER_MAX_BLOCKING | 1024 | Maximum number of blocking connections allowed per HTTP thread. |
| ZO_GRPC_PORT | 5081 | Port number on which the OpenObserve server listens for gRPC requests. |
| ZO_GRPC_ADDR | | IP address on which the OpenObserve server listens for gRPC requests. |
| ZO_GRPC_ORG_HEADER_KEY | openobserve-org-id | Header key for sending organization information in traces using OTLP over gRPC. |
| ZO_GRPC_STREAM_HEADER_KEY | stream-name | Header key for sending stream name information in traces using OTLP over gRPC. |
| ZO_GRPC_MAX_MESSAGE_SIZE | 16 | Maximum gRPC message size in MB. Default is 16 MB. |
| ZO_GRPC_CONNECT_TIMEOUT | 5 | Timeout in seconds for connecting to the gRPC server. |
| ZO_ROUTE_TIMEOUT | 600 | Timeout value for the router node in seconds. |
| ZO_ROUTE_MAX_CONNECTIONS | 1024 | Sets the maximum number of simultaneous connections per type of scheme for the Router node role. |


## Data Storage and Directories
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_DATA_DIR | ./data/openobserve/ | Defaults to "data" folder in current working directory if not provided. |
| ZO_DATA_DB_DIR | ./data/openobserve/db/ | Directory for storing the metadata database locally. |
| ZO_DATA_WAL_DIR | ./data/openobserve/wal/ | Directory for storing Write-Ahead Log (WAL) data. |
| ZO_DATA_STREAM_DIR | ./data/openobserve/stream/ | Directory for storing stream data locally. Applicable only in local mode. |
| ZO_DATA_IDX_DIR | | Local WAL Idx directory. |


## Ingestion and Schema Management
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_COLS_PER_RECORD_LIMIT | 1000 | Maximum number of fields allowed per record during ingestion. Records with more fields than this limit are discarded. |
| ZO_WIDENING_SCHEMA_EVOLUTION | true | If set to false, user can add new columns to the ingested data, but changes to existing column data types are not supported. |
| ZO_SKIP_SCHEMA_VALIDATION | false | By default, every ingested record is validated against the schema. If the schema is fixed, validation can be skipped to double ingestion performance. |
| ZO_ALLOW_USER_DEFINED_SCHEMAS | false | When set to true, allows users to define user-defined schemas for a stream. |
| ZO_SKIP_FORMAT_STREAM_NAME | false | When set to true, it skips formatting stream name while ingestion. |
| ZO_CONCATENATED_SCHEMA_FIELD_NAME | _all | Field name where all fields, after applying user-defined schema rules and flattening, are stored as a single field. The default value is _all. For example, if the processed data is {a:5, b:"abc"}, an additional field _all is added as {a:5, b:"abc", _all:"{a:5,b:"abc"}"}. This field is used for full-text search, allowing match_all queries to run across all data instead of being limited to a single field. |
| ZO_INGEST_ALLOWED_UPTO | 5 | Discards events older than the specified number of hours. By default, OpenObserve accepts data only if it is not older than 5 hours from the current ingestion time. |
| ZO_INGEST_ALLOWED_IN_FUTURE | 24 | Discards events dated beyond the specified number of future hours. By default, OpenObserve accepts data only if it is not timestamped more than 24 hours into the future. |
| ZO_INGEST_BUFFER_QUEUE_NUM | 5 | Number of queues to buffer ingestion requests. ZO_FEATURE_INGEST_BUFFER_ENABLED must be true |
| ZO_INGEST_FLATTEN_LEVEL | 3 | The level of flatten ingestion json data, if you want flatten everything you can simple set it to 0, or you can set it to N to limit the flatten level. |
| ZO_FEATURE_INGEST_BUFFER_ENABLED | false | Enables ingestion requests to be enqueued for background processing, improving responsiveness of ingestion endpoints. |
| ZO_INGEST_BLOCKED_STREAMS            | -             | Comma-separated list of streams blocked from ingestion.      |
| ZO_FORMAT_STREAM_NAME_TO_LOWERCASE | true          | Converts stream names to lowercase.                          |
| ZO_MEM_TABLE_STREAMS                 | -             | Comma-separated list of streams that use dedicated MemTables. |
| ZO_INGEST_DEFAULT_HEC_STREAM        | -             | Default stream used for HEC ingestion.                       |


## File Management, WAL, and Memtable
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_MAX_FILE_SIZE_ON_DISK | 64 | Maximum WAL log file size in MB before creating a new log file. Default is 64 MB. WAL files are created per organization and stream type. |
| ZO_MAX_FILE_SIZE_IN_MEMORY | 256 | Maximum memtable size in MB before it becomes immutable and is written to disk. Default is 256 MB. |
| ZO_MAX_FILE_RETENTION_TIME | 600 | Maximum retention time in seconds for a WAL log file or memtable. Default is 600 seconds (10 minutes). When this limit is reached, a new WAL file is created and the memtable is written to disk. |
| ZO_FILE_PUSH_INTERVAL | 60 | Interval in seconds at which WAL files are moved to storage. Default is 60 seconds. |
| ZO_FILE_PUSH_LIMIT | 0 | Maximum number of WAL files that can be pushed to storage in a single cycle. |
| ZO_FILE_MOVE_THREAD_NUM | - | Number of threads used by the ingester to move WAL files to storage. Default equals the number of CPU cores. |
| ZO_MEM_DUMP_THREAD_NUM | - | Number of threads used by the ingester to dump memtables to disk. Default equals the number of CPU cores. |
| ZO_FILE_MERGE_THREAD_NUM | - | Number of threads used by the compactor to merge WAL files to storage. Default equals the number of CPU cores. |
| ZO_FILE_MOVE_FIELDS_LIMIT | 2000 | Field count threshold per WAL file. If exceeded, merging is skipped on the ingester. |
| ZO_MEM_TABLE_MAX_SIZE | 0 | Total size limit of all memtables. Multiple memtables exist for different organizations and stream types. Each memtable cannot exceed ZO_MAX_FILE_SIZE_IN_MEMORY, and the combined size cannot exceed this limit. If exceeded, the system returns a MemoryTableOverflowError to prevent out-of-memory conditions. Default is 50 percent of total memory. |
| ZO_MEM_PERSIST_INTERVAL | 5 | Interval in seconds at which immutable memtables are persisted from memory to disk. Default is 5 seconds. |
| ZO_FEATURE_SHARED_MEMTABLE_ENABLED | false | When set to true, it turns on the shared memtable feature and several organizations can use the same in-memory table instead of each organization creating its own. This helps reduce memory use when many organizations send data at the same time. It also works with older non-shared write-ahead log (WAL) files. |
| ZO_MEM_TABLE_BUCKET_NUM | 1 | This setting controls how many in-memory tables OpenObserve creates, and works differently depending on whether shared memtable is enabled or disabled. <br> 
**When ZO_FEATURE_SHARED_MEMTABLE_ENABLED is true (shared memtable enabled)**:
<br>
OpenObserve creates the specified number of shared in-memory tables that all organizations use together. <br> **If the number is higher**: OpenObserve creates more shared tables. Each table holds data from fewer organizations. This can make data writing faster because each table handles less data. However, it also uses more memory. <br>
**If the number is lower**: OpenObserve creates fewer shared tables. Each table holds data from more organizations. This saves memory but can make data writing slightly slower when many organizations send data at the same time.
<br>
**When ZO_FEATURE_SHARED_MEMTABLE_ENABLED is false (shared memtable disabled)**:
<br>
Each organization creates its own set of in-memory tables based on the ZO_MEM_TABLE_BUCKET_NUM value.
<br>
For example, if ZO_MEM_TABLE_BUCKET_NUM is set to 4, each organization will create 4 separate in-memory tables.
This is particularly useful when you have only one organization, as creating multiple in-memory tables for that single organization can improve ingestion performance.|

## Indexing
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_FEATURE_FULLTEXT_EXTRA_FIELDS | - | Automatically enables global full-text indexing on the specified fields if they exist in the ingested log data. By default, OpenObserve applies full-text indexing to the following global fields: log, message, msg, content, data, and JSON. Example: field1,field2 |
| ZO_FEATURE_INDEX_EXTRA_FIELDS | - | Automatically enables global secondary indexing on the specified fields if they exist in the ingested log data. Example: field1,field2 |
| ZO_FEATURE_QUERY_PARTITION_STRATEGY | file_num | Query partition strategy. Possible values are file_num, file_size, file_hash. |
| ZO_ENABLE_INVERTED_INDEX | true | Enables inverted index creation. |

## Compaction and Data Retention
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_COMPACT_ENABLED | true | Enables compact for small files. |
| ZO_COMPACT_INTERVAL | 60 | The interval at which job compacts small files into larger files. default is 60s, unit: second |
| ZO_COMPACT_MAX_FILE_SIZE | 256 | Max file size for a single compacted file, after compaction all files will be below this value. Default is 256MB, unit: MB |
| ZO_COMPACT_DATA_RETENTION_DAYS | 3650 | Data retention days, default is 10 years. Minimal 3. eg: 30, it means will auto delete the data older than 30 days. You also can set data retention for stream in the UI. |
| ZO_COMPACT_SYNC_TO_DB_INTERVAL | 1800 | The interval time in seconds after which compactor sync cache to db is run. |
| ZO_COMPACT_DELETE_FILES_DELAY_HOURS | 2 | The number of hours to delay to delete the pending deleted files by compactor. Value can not be less than 1. |
| ZO_COMPACT_DATA_RETENTION_HISTORY | false | When enabled, this will move the file_list into file_list_history and not delete files from storage. |
| ZO_COMPACT_BLOCKED_ORGS | | Use comma to split multiple orgs. Blocked organizations will not be able to ingest data |
| ZO_COMPACT_FAST_MODE | true |Enables fast compaction mode. Uses more memory but improves performance. Disabling reduces memory usage by about 50 percent. |
| ZO_COMPACT_OLD_DATA_INTERVAL             | 3600          | Interval to compact old data in seconds.                                                       |
| ZO_COMPACT_STRATEGY                        | file_time    | Compaction strategy. Allowed values are file_size, file_time, time_range.                   |
| ZO_COMPACT_EXTENDED_DATA_RETENTION_DAYS | 3650          | Extended data retention period in days.                                                        |
| ZO_COMPACT_OLD_DATA_STREAMS              | -             | Comma-separated stream list to treat as old data.                                              |
| ZO_COMPACT_OLD_DATA_MAX_DAYS            | 7             | Maximum age of data to qualify as old in days.                                                 |
| ZO_COMPACT_OLD_DATA_MIN_HOURS           | 2             | Minimum age of data to qualify as old in hours.                                                |
| ZO_COMPACT_OLD_DATA_MIN_RECORDS         | 100           | Minimum record count to compact old data.                                                      |
| ZO_COMPACT_OLD_DATA_MIN_FILES           | 10            | Minimum file count to compact old data.                                                        |
| ZO_COMPACT_BATCH_SIZE                     | 0             | Batch size for fetching pending compaction jobs.                                               |
| ZO_COMPACT_JOB_RUN_TIMEOUT               | 600           | Time limit for one compaction job in seconds. Jobs that exceed this time are marked as failed. |
| ZO_COMPACT_JOB_CLEAN_WAIT_TIME          | 7200          | Minimum age of finished jobs before cleanup in seconds.                                        |
| ZO_COMPACT_PENDING_JOBS_METRIC_INTERVAL | 300           | Interval to publish pending job metrics in seconds.                                            |
| ZO_COMPACT_MAX_GROUP_FILES               | 10000         | Maximum number of files allowed in a compaction group.                                         |

## UI and Web 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_UI_SQL_BASE64_ENABLED | false | Enable base64 encoding for SQL in UI. |
| ZO_WEB_URL | - | UI access URL. For example, http://localhost:5080 is used as redirect URL and alert URL. |
| ZO_BASE_URI | - | If OpenObserve is hosted under a subpath, set the path prefix. Use this for deployments with a Kubernetes NGINX ingress or any reverse proxy that serves OpenObserve under a subpath such as www.example.com/openobserve. |
| ZO_SWAGGER_ENABLED | true | Generate SWAGGER API documentation by default. |

## Dashboard
| Environment Variable                 | Default Value | Description                                       |
| ------------------------------------ | ------------- | ------------------------------------------------- |
| ZO_DASHBOARD_SHOW_SYMBOL_ENABLED | false         | Shows the symbol selector in dashboards.          |
| ZO_DASHBOARD_PLACEHOLDER           | `_o2_all_`     | Placeholder stream name used in dashboards.       |
| ZO_MIN_AUTO_REFRESH_INTERVAL     | 5             | Minimum allowed auto refresh interval in seconds. |

## Payload Limits
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_JSON_LIMIT | 209715200 | The max payload size of JSON. |
| ZO_PAYLOAD_LIMIT | 209715200 | The max payload size of http request body. |

## Actix Server   
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ACTIX_REQ_TIMEOUT | 30 | Sets actix server client timeout in seconds for first request. |
| ZO_ACTIX_KEEP_ALIVE | 30 | Sets actix server keep-alive preference in seconds. |
| ZO_ACTIX_SHUTDOWN_TIMEOUT | | Sets timeout for graceful worker shutdown of actix workers. |

## Cookies
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_COOKIE_SAME_SITE_LAX | true | If true, same site "lax" cookie is set by the server while authentication. |
| ZO_COOKIE_SECURE_ONLY | false | If true, secure flag is enabled for the cookie set by the server while authentication. |

## Telemetry and Monitoring
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_TELEMETRY | true | Sends anonymous telemetry data to help improve OpenObserve. Set to false to disable telemetry. |
| ZO_TELEMETRY_URL | https://e1.zinclabs.dev | OpenTelemetry report URL. You can report to your own server. |
| ZO_HEARTBEAT_INTERVAL | 30 | OpenTelemetry report frequency. Default is 30 minutes |
| ZO_PROMETHEUS_ENABLED | false | Enables prometheus metrics on /metrics endpoint |
| ZO_CALCULATE_STATS_INTERVAL | 600 | In seconds. How often stream stats (total size) is calculated |

## File Retention
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_LOGS_FILE_RETENTION | hourly | Default time partition level for log streams. Supported values are hourly and daily. |
| ZO_TRACES_FILE_RETENTION | hourly | Default time partition level for trace streams. Supported values are hourly and daily. |
| ZO_METRICS_FILE_RETENTION | daily | Default time partition level for metric streams. Supported values are hourly and daily. |

## Metrics 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_METRICS_DEDUP_ENABLED | true | Enable de-duplication for metrics |
| ZO_METRICS_LEADER_PUSH_INTERVAL | 15 | Interval at which current leader information is updated to metadata store , default 15s, unit: second |
| ZO_METRICS_LEADER_ELECTION_INTERVAL | 30 | Interval after which new leader for metrics will be elected, when data is not received from current leader, default: 30, unit: second. |
| ZO_SELF_METRIC_CONSUMPTION_ENABLED    | false         | Self-consumption metrics generated by OpenObserve.   |
| ZO_SELF_METRIC_CONSUMPTION_INTERVAL   | 60            | Interval in seconds for self-consumption of metrics. |
| ZO_SELF_METRIC_CONSUMPTION_ACCEPTLIST | -             | Comma-separated list of metrics to self-consume.     |


## Distinct Values 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_DISTINCT_VALUES_INTERVAL | 10s | Controls how often distinct values for a stream are written from memory to disk. Distinct values are automatically collected when data is ingested. Instead of writing every value to disk immediately, the system waits for this interval. This prevents the system from frequently writing very small chunks of data to disk. Example: If the interval is 10 seconds, distinct values ingested within that 10-second window are combined and written once. |
| ZO_DISTINCT_VALUES_HOURLY | false | Enables additional deduplication at an hourly level. When enabled, distinct values that repeat within the same hour are merged again, and the system logs a count instead of storing duplicate entries. The collected distinct values are stored in a special stream named distinct_values. Example: Suppose request IDs 123 appear multiple times in one hour. Instead of separate entries, they are merged into one record like: request_id: 123, count: 3  |

## Alerts and Reports 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ALERT_SCHEDULE_INTERVAL | 10s | Defines how often the alert manager checks for scheduled jobs such as alerts, reports, or scheduled pipelines. The default value is 10 seconds. This means the alert manager fetches and processes alerts, reports, and pipelines every 10 seconds. |
| ZO_ALERT_SCHEDULE_TIMEOUT           | 90     | The maximum expected time duration in seconds within which the processing of alert by the alert manager should be complete. If the processing of the alert is not complete within the timeframe, the alert will become available again for other alert managers to pick. |
| ZO_SCHEDULER_WATCH_INTERVAL         | 30    | The scheduler frequently watches if there are any scheduled jobs which are in processing state for more than the `ZO_ALERT_SCHEDULE_TIMEOUT`/`ZO_REPORT_SCHEDULE_TIMEOUT`, if so it increases their `retries` field by 1 and marks them as available for processing again by alert managers. |
| ZO_ALERT_SCHEDULE_CONCURRENCY       | 5   | The number of scheduled jobs the the alert manager will pull at a time from the scheduler for processing |
| ZO_CHROME_ENABLED                   | false  | When true, it looks for chromium executable. Required for dashboard reports. |
| ZO_CHROME_PATH                      | -  | If chrome is enabled, custom chrome executable path can be specified. If not specified, it looks for chrome executable in default locations. If still not found, it automatically downloads a good known version of chromium. |
| ZO_CHROME_CHECK_DEFAULT_PATH        | true | If false, it skips default locations (e.g. CHROME env, usual chrome file path etc.) when looking for chrome executable. |
| ZO_CHROME_NO_SANDBOX                | false | If true, it launches chromium in no-sandbox environment. |
| ZO_CHROME_SLEEP_SECS                | 20    | Specify the number of timeout seconds the headless chrome will wait until all the dashboard data is loaded. |
| ZO_CHROME_WITH_HEAD                 | false  | If true, it launches the chromium browser in non-headless mode. |
| ZO_CHROME_WINDOW_WIDTH              | 1370     | Specifies the width of the headless chromium browser. |
| ZO_CHROME_WINDOW_HEIGHT             | 730     | Specifies the height of the headless chromium browser. |
| ZO_CHROME_AUTO_DOWNLOAD             | false    | Only used by the report-server. If true, the report-server automatically downloads a good known version of chromium if chromium is not found in the system. **Note:** If auto download of chromium is desired, make sure that the system has all the required dependency libraries of chromium already installed. |
| ZO_SCHEDULER_MAX_RETRIES            | 3    | The maximum number of times the scheduler will retry processing the alert/report. If exceeded, the scheduler will skip to the next trigger time of the alert/report. |
| ZO_SCHEDULER_CLEAN_INTERVAL         | 30   | The interval in seconds after which the scheduler will clean up the completed scheduled jobs. |
| ZO_REPORT_USER_NAME                 |  | The username that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_REPORT_USER_PASSWORD             |  | The password that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_ENABLE_EMBEDDED_REPORT_SERVER    | false  | If true, the alert manager (for which this ENV is enabled) spawns a new report-server running on PORT `5082` (default, can be changed through `ZO_REPORT_SERVER_HTTP_PORT`). |
| ZO_REPORT_SERVER_HTTP_PORT          | `5082` | The port used by the newly spawned report-server. |
| ZO_REPORT_SERVER_HTTP_ADDR          | `127.0.0.1`  | The ip address used by the newly spawned report-server. |
| ZO_REPORT_SERVER_URL                | `localhost:5082` | The report server server URL. E.g. - `https://report-server.example.com/api`. |
| ZO_REPORT_SERVER_SKIP_TLS_VERIFY    | false| If true, it will skip tls verification while making request to report-server from alert manager. |

## Enrichment Tables
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ENRICHMENT_TABLE_LIMIT | 256 | Controls the maximum size of an enrichment table. If the enrichment table exceeds this limit, you cannot append additional records. OpenObserve returns an error when the size threshold is reached. |
| ZO_ENRICHMENT_TABLE_CACHE_DIR           | -             | Local cache directory for enrichment tables.                             |
| ZO_ENRICHMENT_TABLE_MERGE_THRESHOLD_MB | 60            | Size threshold to merge small files before uploading to S3 in megabytes. |
| ZO_ENRICHMENT_TABLE_MERGE_INTERVAL      | 600           | Background sync and merge interval in seconds.                           |

## File List Dump
| Environment Variable               | Default Value | Description                                 |
| ---------------------------------- | ------------- | ------------------------------------------- |
| ZO_FILE_LIST_DUMP_ENABLED      | false         | Enables file list dump.                     |
| ZO_FILE_LIST_DUMP_DUAL_WRITE  | true          | Enables dual write for file list dump.      |
| ZO_FILE_LIST_DUMP_MIN_HOUR    | 2             | Minimum hour of day to run file list dump.  |
| ZO_FILE_LIST_DUMP_DEBUG_CHECK | true          | Enables debug checks during file list dump. |

## Queue 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_QUEUE_STORE | | Set to "nats" to enable internal queuing through NATS for coordinating rate limiting. |


## Query Execution and Optimization
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_UTF8_VIEW_ENABLED | true | When set to true , this environment variable activates DataFusion's StringView optimization in OpenObserve, which automatically converts UTF8 string fields to the more efficient UTF8View data type during query processing. |
| ZO_SEARCH_INSPECTOR_ENABLED | false | Controls search inspector feature for detailed search operation tracing. When enabled, tracks search operations with trace_id and generates extensive logs for debugging. |


## Logs
 Environment Variable         | Default Value                                | Description                                                               |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| ZO_LOG_JSON_FORMAT        | false                                        | Emits logs in JSON format.                                                |
| ZO_LOG_FILE_DIR           | -                                            | Directory for log files.                                                  |
| ZO_LOG_FILE_NAME_PREFIX  | -                                            | Prefix for log file names.                                                |
| ZO_LOG_LOCAL_TIME_FORMAT | -                                            | Local timestamp format for logs. Use a strftime-compatible format string. |
| ZO_EVENTS_ENABLED          | false                                        | Enables internal debug events publishing.                                 |
| ZO_EVENTS_AUTH             | cm9vdEBleGFtcGxlLmNvbTpUZ0ZzZFpzTUZQdzg2SzRK | Basic authentication value used for events publishing.                    |
| ZO_EVENTS_BATCH_SIZE      | 10                                           | Number of events per publish batch.                                       |
| ZO_PRINT_KEY_CONFIG | false | Print key config information in logs. |
| ZO_PRINT_KEY_SQL | false | Print key sql in logs. |
| RUST_LOG | info | Log level, also supports: error, warn, info, debug, trace. |
| ZO_FEATURE_QUICK_MODE_FIELDS | -             | Comma-separated list of field names to use when quick mode is enabled. Overrides the default quick mode fields. |

## Caching

| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_DATA_CACHE_DIR | ./data/openobserve/cache/ | local query cache storage directory, applicable only for cluster mode. |
| ZO_MEMORY_CACHE_ENABLED | true | enable in-memory caching for files, default is true, the latest files are cached for accelerated queries. |
| ZO_CACHE_LATEST_FILES_ENABLED | false | Enables or disables latest file caching. |
| ZO_CACHE_LATEST_FILES_PARQUET | true | Enables caching of latest parquet files. |
| ZO_CACHE_LATEST_FILES_INDEX | true | Enables caching of index files. |
| ZO_CACHE_LATEST_FILES_DELETE_MERGE_FILES | false | Controls whether merged files should be deleted from cache. |
| ZO_CACHE_LATEST_FILES_DOWNLOAD_FROM_NODE | false | Downloads latest files from a peer node instead of object storage. |
| ZO_CACHE_LATEST_FILES_DOWNLOAD_NODE_SIZE | 100 | Threshold size in megabytes for node to node download. |
| ZO_MEMORY_CACHE_SKIP_DISK_CHECK | false | Skips free disk space checks during cache operations. |
| ZO_DISK_RESULT_CACHE_MAX_SIZE | 0 | Maximum disk cache size for query results in megabytes. |
| ZO_DISK_AGGREGATION_CACHE_MAX_SIZE | 0 | Maximum disk cache size for aggregation results in megabytes. |
| ZO_DISK_CACHE_MULTI_DIR | - | Comma-separated list of disk cache directories. When set, OpenObserve uses multiple directories for the disk cache. For example, ZO_DISK_CACHE_MULTI_DIR: "ssdpvc1,ssdpvc2" |
| ZO_DISK_CACHE_GC_SIZE | 100 | Amount of data to release during disk cache garbage collection in megabytes. |
| ZO_DISK_CACHE_GC_INTERVAL | 60 | Interval to check whether the disk cache is full and to run garbage collection in seconds. |
| ZO_SCHEMA_CACHE_COMPRESS_ENABLED | - | Removed. No longer supported. |
| ZO_DISK_CACHE_BUCKET_NUM | 0 | Disk data cache bucket num, multiple bucket means multiple locker, default is 0 |
| ZO_DISK_CACHE_ENABLED | true | Enable in-disk caching for files, default is true, the latest files are cached for accelerated queries. when the memory cache is not enough will try to cache in local disk, you can consider the memory cache is first level, disk cache is second level. |
| ZO_DISK_CACHE_MAX_SIZE | - | Default 50% of the total free disk for in-disk cache, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_SKIP_SIZE | - | Default 80% of the total disk cache size, A query will skip disk cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_RELEASE_SIZE | - | Default drop 1% entries from in-disk cache as cache is full, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_STRATEGY | lru | Disk data cache strategy, values are lru, time_lru, fifo |


## HTTP TLS
| Environment Variable              | Default Value | Description                                                                                       |
| --------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| ZO_HTTP_TLS_ENABLED            | false         | Enables TLS for HTTP.                                                                             |
| ZO_HTTP_TLS_CERT_PATH         | -             | Path to the TLS certificate file for HTTP.                                                        |
| ZO_HTTP_TLS_KEY_PATH          | -             | Path to the TLS key file for HTTP.                                                                |
| ZO_HTTP_TLS_MIN_VERSION       | -             | Minimum TLS version for HTTP. Supported values are 1.2 or 1.3. Empty uses all supported versions. |
| ZO_HTTP_TLS_ROOT_CERTIFICATES | webpki        | Root certificate store to use. Supported values are webpki and native.                            |

## gRPC TLS and Authentication
| Environment Variable               | Default Value | Description                                |
| ---------------------------------- | ------------- | ------------------------------------------ |
| ZO_INTERNAL_GRPC_TOKEN          | -             | Internal gRPC authentication token.        |
| ZO_GRPC_CHANNEL_CACHE_DISABLED | false         | Disables the gRPC channel cache.           |
| ZO_GRPC_TLS_ENABLED             | false         | Enables TLS for gRPC.                      |
| ZO_GRPC_TLS_CERT_DOMAIN        | -             | Expected TLS server name for gRPC.         |
| ZO_GRPC_TLS_CERT_PATH          | -             | Path to the TLS certificate file for gRPC. |
| ZO_GRPC_TLS_KEY_PATH           | -             | Path to the TLS key file for gRPC.         |


## Router
| Environment Variable | Default Value | Description                                                  |
| -------------------- | ------------- | ------------------------------------------------------------ |
| ZO_ROUTE_STRATEGY  | workload      | Dispatch strategy. Supported values are workload and random. |


## Authentication
| Environment Variable      | Default Value | Description                            |
| ------------------------- | ------------- | -------------------------------------- |
| ZO_ROOT_USER_TOKEN     | -             | Root user token.                       |
| ZO_CLI_USER_COOKIE     | -             | Cookie value used by the CLI user.     |
| ZO_COOKIE_MAX_AGE      | 2592000       | Cookie max age in seconds.             |
| ZO_EXT_AUTH_SALT       | openobserve   | Salt used for external authentication. |
| O2_ACTION_SERVER_TOKEN | -             | Token used by the action server.       |

## NATS
| Environment Variable       | Default Value | Description                                                                           |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| ZO_NATS_ADDR              | `localhost:4222` |NATS server address - If not stated explicitly the `nats://` schema and port `4222` is assumed.|
| ZO_NATS_PREFIX            | `o2_`            | NATS prefix for openobserve.        |
| ZO_NATS_USER              |  -  | NATS user name.                     |
| ZO_NATS_PASSWORD          |  -   | NATS user password.                 |
| ZO_NATS_REPLICAS          | 3                | Number of replicas for NATS.        |
| ZO_NATS_CONNECT_TIMEOUT   | 5                | NATS connection timeout in seconds. |
| ZO_NATS_COMMAND_TIMEOUT   | 10               | NATS command timeout in seconds.    |
| ZO_NATS_LOCK_WAIT_TIMEOUT | 3600             | NATS lock wait timeout in seconds.  |
| ZO_NATS_QUEUE_MAX_AGE     | 60               | NATS queue maximum age in days.     |
| ZO_NATS_HISTORY          | 3             | Number of historical entries to keep in NATS key value buckets.                       |
| ZO_NATS_DELIVER_POLICY  | all           | Starting point in the stream for message delivery. Allowed values are all, last, new. |
| ZO_NATS_SUB_CAPACITY    | 65535         | Maximum subscription capacity.                                                        |
| ZO_NATS_QUEUE_MAX_SIZE | 2048          | Maximum queue size in megabytes.                                                      |
| ZO_NATS_KV_WATCH_MODULES | 2048          | Defines which internal modules use the NATS Key-Value Watcher instead of the default NATS Queue for event synchronization. Add one or more module prefixes separated by commas, such as /nodes/ or /user_sessions/. When left empty, all modules use the default NATS Queue mechanism.                                                      |
| ZO_NATS_EVENT_STORAGE | memory          | Controls how NATS JetStream stores event data. Use memory for high-speed, in-memory event storage or file for durable, disk-based storage that persists across restarts. <br> Performance Benchmark Results: <br> • File Storage: 10,965 ops/sec (10.71 MB/s throughput, ~911 µs mean latency) <br>• Memory Storage: 16,957 ops/sec (16.56 MB/s throughput, ~589 µs mean latency) <br> Memory storage offers ~55 percent higher throughput and lower latency, while file storage ensures durability.                                                      |


## S3 and Object Storage
| Environment Variable                   | Default Value | Description                                                                                                                                                           |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL               | -             | Default for aws s3 & leave it empty, but for `minIO`, `gcs` one should configure it. |
| ZO_S3_REGION_NAME              | -             | Region name                                                                          |
| ZO_S3_ACCESS_KEY               | -             | Access key                                                                           |
| ZO_S3_SECRET_KEY               | -             | Secret key                                                                           |
| ZO_S3_BUCKET_NAME              | -             | Bucket name                                                                          |
| ZO_S3_BUCKET_PREFIX            | -             | You can store data in a sub directory, like: `openobserve/`                          |
| ZO_S3_PROVIDER                 | s3            | S3 provider name, like: aws, gcs, gcp, oss, minio, swift                             |
| ZO_S3_FEATURE_FORCE_HOSTED_STYLE | false         | Feature: `force_hosted_style`, default enable for provider `minio` and `swift`.        |
| AWS_EC2_METADATA_DISABLED      | false         | Feature, default enable for `swift`.                                                 |
| ZO_S3_FEATURE_BULK_DELETE       | false         | Enables bulk deletion of streams in object stores that support stream deletion. If your object store supports stream delete, you can enable this variable. AWS S3 and Azure ObjectStore are known to support it. When set to **true**, OpenObserve issues a single operation to delete all files under the stream’s storage prefix, reducing deletion time and API usage.                                                                             |
| ZO_S3_ACCOUNTS                       | -             | Comma-separated list of account identifiers. |
| ZO_S3_STREAM_STRATEGY               | -             | Stream to account selection strategy. Empty uses the default account. Other values are file_hash, stream_hash, and explicit mappings in the form stream1:account1. |
| ZO_S3_CONNECT_TIMEOUT               | 10            | Connect timeout in seconds. |
| ZO_S3_REQUEST_TIMEOUT               | 3600          | Request timeout in seconds.   |
| ZO_S3_ALLOW_INVALID_CERTIFICATES   | false         | Allows invalid TLS certificates.   |
| ZO_S3_SYNC_TO_CACHE_INTERVAL      | 600           | Interval to sync object storage state to cache in seconds.  |
| ZO_S3_MAX_RETRIES                   | 10            | Maximum number of retries for S3 operations. |
| ZO_S3_MAX_IDLE_PER_HOST           | 0             | Maximum idle connections per host. |
| ZO_S3_CONNECTION_KEEPALIVE_TIMEOUT | 20            | Keepalive timeout in seconds for S3 connections. |
| ZO_S3_MULTI_PART_UPLOAD_SIZE      | 100           | File size threshold for switching to multi part upload in megabytes. |
| ZO_S3_FEATURE_HTTP1_ONLY | false         | Uses HTTP 1 only for S3 client connections. |
| ZO_S3_FEATURE_HTTP2_ONLY | false         | Uses HTTP 2 only for S3 client connections. |

## SNS
| Environment Variable        | Default Value | Description                   |
| --------------------------- | ------------- | ----------------------------- |
| ZO_SNS_ENDPOINT           | -             | SNS endpoint URL.             |
| ZO_SNS_CONNECT_TIMEOUT   | 10            | Connect timeout in seconds.   |
| ZO_SNS_OPERATION_TIMEOUT | 30            | Operation timeout in seconds. |

## Real User Monitoring (RUM)
| Environment Variable              | Default Value | Description                          |
| --------------------------------- | ------------- | ------------------------------------ |
| ZO_RUM_ENABLED                  | false         | Enables Real User Monitoring.        |
| ZO_RUM_CLIENT_TOKEN            | -             | Client token used by the RUM SDK.    |
| ZO_RUM_APPLICATION_ID          | -             | RUM application identifier.          |
| ZO_RUM_SITE                     | -             | RUM site or domain.                  |
| ZO_RUM_SERVICE                  | -             | Service name reported by RUM.        |
| ZO_RUM_ENV                      | -             | Environment name reported by RUM.    |
| ZO_RUM_VERSION                  | -             | Version string reported by RUM.      |
| ZO_RUM_ORGANIZATION_IDENTIFIER | -             | Organization identifier used by RUM. |
| ZO_RUM_API_VERSION             | -             | API version for RUM.                 |
| ZO_RUM_INSECURE_HTTP           | false         | Allows HTTP for RUM endpoints.       |


## Pipeline
| Environment Variable                              | Default Value | Description                                                                                                                       |
| ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ZO_PIPELINE_REMOTE_STREAM_WAL_DIR            | -             | Directory for remote stream WAL files. Used to separate remote WAL from local WAL.                                                |
| ZO_PIPELINE_REMOTE_STREAM_CONCURRENT_COUNT   | 30            | Concurrent send count for remote stream WAL.                                                                                      |
| ZO_PIPELINE_OFFSET_FLUSH_INTERVAL             | 10            | Interval to flush the sent offset for remote stream WAL in seconds.                                                               |
| ZO_PIPELINE_REMOTE_REQUEST_TIMEOUT            | 600           | Request timeout for pipeline exporters in seconds.                                                                                |
| ZO_PIPELINE_REMOTE_REQUEST_MAX_RETRY_TIME   | 86400         | Maximum total retry time for pipeline exporters in seconds.                                                                       |
| ZO_PIPELINE_WAL_SIZE_LIMIT                    | 0             | Data size limit for the pipeline WAL directory in MB. When set to zero the default is 50 percent of available local volume space. |
| ZO_PIPELINE_MAX_CONNECTIONS                    | 1024          | Maximum number of HTTP connections for the pipeline exporter client.                                                              |
| ZO_PIPELINE_BATCH_ENABLED                      | false         | Enables batching of entries before sending HTTP requests.                                                                         |
| ZO_PIPELINE_BATCH_SIZE                         | 100           | Maximum number of entries per batch.                                                                                              |
| ZO_PIPELINE_BATCH_TIMEOUT_MS                  | 1000          | Maximum time to wait for a batch to fill up in milliseconds.                                                                      |
| ZO_PIPELINE_BATCH_SIZE_BYTES                  | 10485760      | Maximum batch size in bytes.                                                                                                      |
| ZO_PIPELINE_BATCH_RETRY_MAX_ATTEMPTS         | 3             | Maximum number of retry attempts for batch flush.                                                                                 |
| ZO_PIPELINE_BATCH_RETRY_INITIAL_DELAY_MS    | 1000          | Initial delay for batch flush retries in milliseconds.                                                                            |
| ZO_PIPELINE_BATCH_RETRY_MAX_DELAY_MS        | 30000         | Maximum delay for batch flush retries in milliseconds.                                                                            |
| ZO_PIPELINE_USE_SHARED_HTTP_CLIENT           | false         | Uses shared HTTP client instances to improve connection pooling.                                                                  |
| ZO_PIPELINE_REMOVE_FILE_AFTER_MAX_RETRY     | true          | Removes the WAL file after reaching the maximum retry count.                                                                      |
| ZO_PIPELINE_MAX_RETRY_COUNT                   | 10            | Maximum number of retries for pipeline exporters.                                                                                 |
| ZO_PIPELINE_MAX_RETRY_TIME_IN_HOURS         | 24            | Maximum retry time for pipeline exporters in hours.                                                                               |
| ZO_PIPELINE_MAX_FILE_SIZE_ON_DISK_MB       | 128           | Maximum file size on disk for pipeline files in megabytes.                                                                        |
| ZO_PIPELINE_MAX_FILE_RETENTION_TIME_SECONDS | 600           | Maximum retention time for pipeline files in seconds.                                                                             |

## Encryption
| Environment Variable              | Default Value | Description                             |
| --------------------------------- | ------------- | --------------------------------------- |
| ZO_MASTER_ENCRYPTION_ALGORITHM | -             | Master encryption algorithm identifier. |
| ZO_MASTER_ENCRYPTION_KEY       | -             | Master encryption key material.         |

## Health Check
| Environment Variable             | Default Value | Description                                                                     |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| ZO_HEALTH_CHECK_ENABLED       | true          | Enables node health checks.                                                     |
| ZO_HEALTH_CHECK_TIMEOUT       | 5             | Health check timeout in seconds.                                                |
| ZO_HEALTH_CHECK_FAILED_TIMES | 3             | Removes the node from the consistent hash after this many consecutive failures. |

## Search Group Resource Allocation
| Environment Variable                       | Default Value | Description                                        |
| ------------------------------------------ | ------------- | -------------------------------------------------- |
| O2_SEARCH_GROUP_LONG_MAX_CPU          | 0.8           | The percentage of CPU allocated to long queries    |
| O2_SEARCH_GROUP_LONG_MAX_MEMORY       | 0.8           | The percentage of memory allocated to long queries |
| O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY  | 2             | Maximum number of concurrent long queries.         |
| O2_SEARCH_GROUP_SHORT_MAX_CPU         | 0.2           | Percentage of CPU allocated to short queries.      |
| O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY | 4             | Maximum number of concurrent short queries.        |
| O2_SEARCH_GROUP_SHORT_MAX_MEMORY      | 0.2           | Percentage of memory allocated to short queries.   |

## Organization Management
| Environment Variable                                | Default Value | Description                                                                 |
| --------------------------------------------------- | ------------- | --------------------------------------------------------------------------- |
| ZO_USE_STREAM_SETTINGS_FOR_PARTITIONS_ENABLED | false         | Uses stream settings for partitions for all streams.                        |
| ZO_ADDITIONAL_REPORTING_ORGS                     | -             | Additional organizations included in reporting.                             |
| ZO_CREATE_ORG_THROUGH_INGESTION                 | true          | Allows automatic organization creation through ingestion for the root user. |
| ZO_ORG_INVITE_EXPIRY                             | 7             | Number of days an invite token remains valid.                               |


## Elasticsearch Compatibility
| Environment Variable  | Default Value | Description                           |
| --------------------- | ------------- | ------------------------------------- |
| ZO_FAKE_ES_VERSION | -             | Fake Elasticsearch version to report. |
| ZO_ES_VERSION       | -             | Elasticsearch version to report.      |
| ZO_BULK_RESPONSE_INCLUDE_ERRORS_ONLY       | false            | When using _bulk API which is compatible with Elasticsearch do not respond with records that succeeded. This allows for higher performance by returing smaller amount of data.      |


## Prometheus Integration
| Environment Variable          | Default Value | Description                                    |
| ----------------------------- | ------------- | ---------------------------------------------- |
| ZO_DEFAULT_SCRAPE_INTERVAL | 15            | Default Prometheus scrape interval in seconds. |
| ZO_PROMETHEUS_HA_CLUSTER | cluster | For Prometheus cluster deduplication. |
| ZO_PROMETHEUS_HA_REPLICA | `__replica__`   | For Prometheus cluster deduplication. |

## Traces
| Environment Variable                        | Default Value | Description                               |
| ------------------------------------------- | ------------- | ----------------------------------------- |
| ZO_TRACES_SPAN_METRICS_ENABLED          | false         | Enables span metrics for traces.          |
| ZO_TRACES_SPAN_METRICS_EXPORT_INTERVAL | 60            | Span metrics export interval in seconds.  |
| ZO_TRACES_SPAN_METRICS_CHANNEL_BUFFER  | 100000        | Buffer size for the span metrics channel. |
| ZO_TRACING_SEARCH_ENABLED                | false         | Enables tracing for search operations.    |
| ZO_TRACING_ENABLED             | false  | enable it to send traces to remote trace server.          |
| ZO_TRACING_HEADER_KEY          | Authorization| Remote trace server endpoint authentication header key.   |
| ZO_TRACING_HEADER_VALUE        | - / e.g. Basic gjdsgfksgkfjgdskfgsdlfglsjdg | remote trace server endpoint authentication header value. |
| ZO_TRACING_SEARCH_ENABLED      | false | Enables tracing for search operations. |
| OTEL_OTLP_HTTP_ENDPOINT        | - / e.g. https://api.openobserve.ai/api/default  | Remote trace server endpoint.                             |

## Tokio Console
| Environment Variable             | Default Value | Description                                         |
| -------------------------------- | ------------- | --------------------------------------------------- |
| ZO_TOKIO_CONSOLE_SERVER_ADDR | 0.0.0.0       | Address for the Tokio console server.               |
| ZO_TOKIO_CONSOLE_SERVER_PORT | 6699          | Port for the Tokio console server.                  |
| ZO_TOKIO_CONSOLE_RETENTION    | 60            | Retention period in seconds for Tokio console data. |

## Profiling
| Environment Variable               | Default Value                                  | Description                                   |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| ZO_PROF_PPROF_ENABLED           | false                                          | Enables profiling with pprof-rs.              |
| ZO_PROF_PPROF_PROTOBUF_ENABLED | false                                          | Exports pprof-rs profiles in protobuf format. |
| ZO_PROF_PPROF_FLAMEGRAPH_PATH  | -                                              | Path to save flamegraph output.               |
| ZO_PROF_PYROSCOPE_ENABLED       | false                                          | Enables profiling with pyroscope-rs.          |
| ZO_PROF_PYROSCOPE_SERVER_URL   | [http://localhost:4040](http://localhost:4040) | Pyroscope server URL.                         |
| ZO_PROF_PYROSCOPE_PROJECT_NAME | openobserve                                    | Pyroscope project name.                       |

## Tantivy Index
| Environment Variable                                  | Default Value | Description                                                              |
| ----------------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| ZO_INVERTED_INDEX_RESULT_CACHE_ENABLED           | false         | Enables Tantivy result cache.                                            |
| ZO_INVERTED_INDEX_OLD_FORMAT                      | false         | Uses the old index format that generates the same stream name for index. |
| ZO_INVERTED_INDEX_CAMEL_CASE_TOKENIZER_DISABLED | false         | Disables camel case tokenizer for inverted index.                        |
| ZO_INVERTED_INDEX_COUNT_OPTIMIZER_ENABLED        | true          | Enables inverted index count optimizer.                                  |


## MaxMind GeoIP
| Environment Variable                   | Default Value                                                                                      | Description                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ZO_MMDB_DISABLE_DOWNLOAD          | true        | By default, auto download of MMDB is disabled. To enable it, set this to false.            |
| ZO_MMDB_DATA_DIR                    | ./data/openobserve/mmdb/ | Defines the local directory path where OpenObserve looks for MaxMind database files. |
| ZO_MMDB_UPDATE_DURATION_DAYS       | 30                                                                                                 | Update interval for MMDB downloads in days.                                     |
| ZO_MMDB_GEOLITE_CITYDB_URL         | [https://geoip.zinclabs.dev/GeoLite2-City.mmdb](https://geoip.zinclabs.dev/GeoLite2-City.mmdb)     | GeoLite City database URL.                                                      |
| ZO_MMDB_GEOLITE_ASNDB_URL          | [https://geoip.zinclabs.dev/GeoLite2-ASN.mmdb](https://geoip.zinclabs.dev/GeoLite2-ASN.mmdb)       | GeoLite ASN database URL.                                                       |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL | [https://geoip.zinclabs.dev/GeoLite2-City.sha256](https://geoip.zinclabs.dev/GeoLite2-City.sha256) | GeoLite City database SHA-256 URL.                                              |
| ZO_MMDB_GEOLITE_ASNDB_SHA256_URL  | [https://geoip.zinclabs.dev/GeoLite2-ASN.sha256](https://geoip.zinclabs.dev/GeoLite2-ASN.sha256)   | GeoLite ASN database SHA-256 URL.                                               |

## Meta Storage
| Environment Variable                  | Default Value | Description                                                                                                                                                                    |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZO_META_STORE                       | -             | Default is sqlite for local mode, postgres or mysql for cluster mode. and supported values are: sqlite, postgres, mysql. Note that sqlite is supported only for local mode. |
| ZO_META_TRANSACTION_LOCK_TIMEOUT  | 600           | Timeout (in seconds) of transaction lock in meta table.                                                                                                                        |
| ZO_META_TRANSACTION_RETRIES        | 3             | Maximum time the transaction in the meta table will be retried.                                                                                                                |
| ZO_META_POSTGRES_DSN               | -             | If you enable postgres as meta store, you need configure the database source address, like this: postgres://postgres:12345678@localhost:5432/openobserve                     |
| ZO_META_MYSQL_DSN                  | -             | set this if you want to use MySQL as metadata and filelist store.                                                                                                              |
| ZO_META_CONNECTION_POOL_MIN_SIZE | -             | Minimum number of connections created in the connection pool size for postgres, sqlite, and mysql. Defaults to cpu_limits                                                     |
| ZO_META_CONNECTION_POOL_MAX_SIZE | -             | Maximum number of connections created in the connection pool size for postgres, sqlite, and mysql. Defaults to `cpu_limits * 2` |

> For local mode, OpenObserve use SQLite as the metadata store.
> For cluster mode, OpenObserve use PostgreSQL (recommended) or MySQL as the metadata store.

## Bloom Filter
| Environment Variable                    | Default Value | Description                                                         |
| --------------------------------------- | ------------- | ------------------------------------------------------------------- |
| ZO_BLOOM_FILTER_ENABLED              | true          | Enable by default, but only enabled for trace_id field.            |
| ZO_BLOOM_FILTER_DEFAULT_FIELDS      | -             | Add more fields support by bloom filter, will add UI setting later. |
| ZO_BLOOM_FILTER_DISABLED_ON_SEARCH | false         | Disable bloom filter for search queries.                            |

## Usage Reporting
| Environment Variable          | Default Value                                                                                | Description                                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZO_USAGE_REPORTING_ENABLED | false  | Enable usage reporting. This will start capturing how much data has been ingested across each org/stream. You can use this info to enable charge back for internal teams.   |
| ZO_USAGE_ORG                | meta  | To which org the usage data should be sent.  |
| ZO_USAGE_BATCH_SIZE        | 2000  | How many requests should be batched before flushing the usage data from memory to disk.    |
| ZO_USAGE_REPORTING_MODE    | local  | Local mode means the usage will be reported only in the internal cluster of ZO_USAGE_ORG. remote mode means that the usage reporting will be ingested to the remote target. both ingests the usage reports both to internal and remote target. |
| ZO_USAGE_REPORTING_URL     | [http://localhost:5080/api/_meta/usage/_json](http://localhost:5080/api/_meta/usage/_json) | In case of remote or both value of ZO_USAGE_REPORTING_MODE, this URL is used to post the usage reports to remote target.  |
| ZO_USAGE_REPORTING_CREDS   | -  | The credentials required to send along with the post request to the ZO_USAGE_REPORTING_URL. E.g. - Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4UGFzcyMxMjM=.  |
| ZO_USAGE_PUBLISH_INTERVAL  | 600   | Duration in seconds after the last reporting usage will be published. |                                                                                                     

## SMTP

| Environment Variable | Default Value| Description  |
| -------------------- | --------- | --------------------------------------------------------------------------- |
| ZO_SMTP_ENABLED      | false | Indicates if smtp configuration is present.  |
| ZO_SMTP_HOST         | `localhost` | The SMTP host to connect to.|
| ZO_SMTP_PORT         | 25  | The SMTP port to connect to.                                                |
| ZO_SMTP_USER_NAME    |  | SMTP user name. `Required` when using smtp.                                 |
| ZO_SMTP_PASSWORD     | | SMTP user password. `Required` when using smtp.                             |
| ZO_SMTP_REPLY_TO     | | The user email whom people can reply to.                                    |
| ZO_SMTP_FROM_EMAIL   |  | The user email that is going to send the email. `Required` when using smtp. |
| ZO_SMTP_ENCRYPTION   |  | SMTP encryption method. Possible values are `ssltls`, `starttls` and "" (in case of localhost smtp). |


## Streaming search

| Environment Variable             | Default Value| Description                                             |
| -------------------------------- | --------- | ------------------------------------------------------- |
| ZO_STREAMING_ENABLED     | true | Enables streaming search.               |
| ZO_STREAMING_RESPONSE_CHUNK_SIZE_MB    | 1    | Size in megabytes for each chunk when streaming search responses. |


## Rate limiting

| Environment Variable             | Default Value | Description                                             |
| -------------------------------- |  --------- | ------------------------------------------------------- |
| O2_RATE_LIMIT_ENABLED  | false  | Enables rate limiting.   |
| O2_RATE_LIMIT_RULE_REFRESH_INTERVAL  | 10   | Refresh interval for rate limit rules in seconds. |


## Quick mode

| Environment Variable             | Default Value | Description                                             |
| -------------------------------- | --------- | ------------------------------------------------------- |
| ZO_QUICK_MODE_ENABLED            | false | Indicates if quick mode is enabled.                     |
| ZO_QUICK_MODE_STRATEGY           |  | Possible values are `first`, `last`, `both`.               |
| ZO_QUICK_MODE_FORCE_ENABLED           | true | Enables automatic activation of Quick Mode from the backend. When set to true, OpenObserve applies Quick Mode automatically if the number of fields in a stream exceeds the limit defined by `ZO_QUICK_MODE_NUM_FIELDS`, even when the Quick Mode toggle in the UI is turned off.|
| ZO_QUICK_MODE_NUM_FIELDS         | 500   | This defines the number of fields beyond which the quick mode will be force enabled.        |

## Miscellaneous 
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_STARTING_EXPECT_QUERIER_NUM | 0 | The number of queriers expected to be running while caching enrichment tables. |
| ZO_QUERY_THREAD_NUM | - | The number of threads for searching in data files. |
| ZO_QUERY_TIMEOUT | 600 | Default timeout of query, unit: seconds |
| ZO_QUERY_INDEX_THREAD_NUM | 0 | Controls thread count for Tantivy index search. Set to 0 to use default: CPU cores × 4. Set a positive integer to override. 0 does not mean unlimited. |
| ZO_QUERY_OPTIMIZATION_NUM_FIELDS | 1000 | Field count threshold used by query optimizations. |
| ZO_QUERY_PARTITION_BY_SECS | 10 | Query partition size. Unit is seconds. |
| ZO_QUERY_GROUP_BASE_SPEED | 768 | Baseline throughput per core for group operations. Unit is MB per second per core. |
| ZO_MEMORY_CIRCUIT_BREAKER_ENABLED   | false         | Enables memory circuit breaker.                                                      |
| ZO_MEMORY_CIRCUIT_BREAKER_RATIO     | 90            | Memory usage threshold percentage for circuit breaker.                               |
| ZO_RESTRICTED_ROUTES_ON_EMPTY_DATA | false         | Redirects users to the ingestion page when no stream is found.                       |
| ZO_QUERY_ON_STREAM_SELECTION        | true          | Triggers search based on a button click event.                                       |
| ZO_RESULT_CACHE_ENABLED              | true          | Enables result cache for query results.                                              |
| ZO_USE_MULTIPLE_RESULT_CACHE        | false         | Uses multiple result caches for query results.                                       |
| ZO_RESULT_CACHE_SELECTION_STRATEGY  | overlap       | Strategy for selecting result cache. Allowed values include both, overlap, duration. |
| ZO_ALIGN_PARTITIONS_FOR_INDEX       | false         | Uses large partitions for index across all streams.                                  |
| ZO_TRACING_SEARCH_ENABLED            | false         | Enables tracing for search operations.                                               |
| ZO_AGGREGATION_TOPK_ENABLED         | true          | Enables approx top-k aggregations.                                                   |
| ZO_FEATURE_FILELIST_DEDUP_ENABLED | false         | Deprecated. Not used by the code. Will be removed.                                                                                         |
| ZO_FEATURE_QUERY_QUEUE_ENABLED    | true          | Enterprise edition must not enable this. In the open source edition, when enabled, the system processes only one search request at a time. |
| ZO_FEATURE_QUERY_INFER_SCHEMA     | false         | Deprecated. Not used by the code. Will be removed.                                                                                         |
| ZO_FEATURE_DISTINCT_EXTRA_FIELDS  | -             | Reserved for future use. Contact the maintainers for guidance.                                                                             |


---

## Super-Cluster

> The following environment variables are available only in the Enterprise edition.

| Environment Variable         | Default Value | Description                                     |
| ---------------------------- | -------------  | ----------------------------------------------- |
| O2_SUPER_CLUSTER_ENABLED     | false  | Indicates if super cluster is enabled.          |
| O2_SUPER_CLUSTER_REGION      | default   | Region of super cluster.                        |
| O2_SUPER_CLUSTER_PUBLIC_ADDR | | Public address of super cluster.                |
| O2_SUPER_CLUSTER_PUBLIC_PORT |  | Public port of super cluster (in case of gRPC). |
| O2_SUPER_CLUSTER_GRPC_TOKEN  |  | gRPC token.                                     |

## Search-Group
> The following environment variables are available only in the Enterprise edition.

| Environment Variable                    | Default Value | Description         |
| --------------------------------------- | ------------- | ------------------- |
| O2_SEARCH_GROUP_LONG_MAX_CPU            | 80%    | The percentage of CPU allocated to long queries. |
| O2_SEARCH_GROUP_LONG_MAX_MEMORY         | 80%   |The percentage of memory allocated to long queries. |
| O2_SEARCH_GROUP_LONG_MAX_CONCURRENCY    | 2     |Maximum number of concurrent long queries.|
| O2_SEARCH_GROUP_SHORT_MAX_CPU           | 20%    |Percentage of CPU allocated to short queries.|
| O2_SEARCH_GROUP_SHORT_MAX_CONCURRENCY   | 4     |Maximum number of concurrent short queries.|
| O2_SEARCH_GROUP_SHORT_MAX_MEMORY        | 20%    |Percentage of memory allocated to short queries.|
| O2_SEARCH_GROUP_BASE_SPEED              | 1024   | Base speed in MB.   |
| O2_SEARCH_GROUP_BASE_SECS               | 10    | Base speed in secs. |

## OpenFGA
> The following environment variables are available only in the Enterprise edition.

| Environment Variable | Default Value  | Description                                                                  |
| ---------------------------------- | --------- | ---------------------------------------------------------------------------- |
| O2_OPENFGA_ENABLED | false| Indicates if openfga is enabled. |
| O2_OPENFGA_BASE_URL | `http://127.0.0.1:8080/stores` | The base URL of openfga stores server. **Required** when openfga is enabled. |
| O2_OPENFGA_STORE_NAME  | `openobserve` | OpenFGA store name. **Required** when openfga is enabled. |
| O2_MAP_GROUP_TO_ROLE  | false | If true, the group claims are mapped into roles in the default org. |
| O2_OPENFGA_PAGE_SIZE | `100`| The page size used for openfga queries.                                      |
| O2_OPENFGA_LIST_ONLY_PERMITTED     | false   | If true, openobserve only lists resources that have `GET` permission. |
| O2_MAP_GROUP_TO_ROLE_SKIP_CREATION | true | Used with `O2_MAP_GROUP_TO_ROLE`. Skips creating the roles mapped from group claims assuming they already exists. |

## DEX
> The following environment variables are available only in the Enterprise edition.

| Environment Variable        | Default Value   |Description                                                         |
| --------------------------- | --------------------------- | ------------------------------------------------------------------- |
| O2_DEX_ENABLED              | false | Enables SSO in OpenObserve using Dex.                               |
| O2_DEX_CLIENT_ID            | - | Client id of static client. **Required** when dex is enabled.       |
| O2_DEX_CLIENT_SECRET        | - | Client secret of static client. **Required** when dex is enabled.   |
| O2_DEX_BASE_URL             | `http://127.0.0.1:5556/dex` | URL of the Dex identity provider. **Required** when dex is enabled. |
| O2_CALLBACK_URL             | - | Set this value to `<openobserve base url>/web/cb`, after successful token received from dex, user will be redirected to this page. **Required** when dex is enabled. |
| O2_DEX_REDIRECT_URL         | - | Set this value to `<openobserve base url>/config/redirect`, Should match to redirect uri specified in dex. **Required** when dex is enabled. |
| O2_DEX_SCOPES               | openid profile email groups offline_access | Scopes to be fetched from dex.  |
| O2_DEX_GROUP_ATTRIBUTE      | ou | Maps user to OpenObserve organization. |
| O2_DEX_ROLE_ATTRIBUTE       | cn  | User's role in the organization. |
| O2_DEX_DEFAULT_ORG          | default | Default organization for users not belonging to any group in ldap.   |
| O2_DEX_TOKEN_EP_SUFFIX      | `/token` | Suffix for dex token endpoint.|
| O2_DEX_KEYS_EP_SUFFIX       | `/keys` | Suffix for dex keys endpoint. |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth` | Suffix for dex authentication endpoint. |
| O2_DEX_NATIVE_LOGIN_ENABLED | true | Indicates if native dex login is enabled. |


## Other Enterprise Features

| Environment Variable      | Default Value | Description                                                                             |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| O2_AUDIT_ENABLED          | false       | Indicates if audit reporting is enabled.                                                |
| O2_AUDIT_BATCH_SIZE       | 500           | How many requests should be batched before flushing the audit data from memory to disk. |
| O2_CUSTOM_LOGO_TEXT       |             | Custom logo text that will appear along with the openobserve logo.                      |
| O2_CUSTOM_SLACK_URL       |            | Custom slack URL that will be used by the `Slack` menu on the openobserve UI.           |
| O2_CUSTOM_DOCS_URL        |            | Custom docs URL that will be used by the `docs` tab on the openobserve UI.              |
| O2_CUSTOM_HIDE_MENUS      |          | Comma-separated menu items that should not be shown in the menu on openobserve UI. For example, `metrics,traces`. |



<!--

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
| ZO_COLS_PER_RECORD_LIMIT             | 1000                       | No           | number of fields allowed per records during ingestion , records having more fields than configured value will be discarded  |
| ZO_WIDENING_SCHEMA_EVOLUTION         | true                       | No           | if set to false user can add new columns to data being ingested but changes to existing data for data type are not supported .  |
| ZO_SKIP_SCHEMA_VALIDATION            | false                      | No           | Default we check ingested every record for schema validation, but if your schema is fixed, you can skip it, this will increase 2x ingestion performance.  |
| ZO_FEATURE_INGEST_BUFFER_ENABLED     | false                      | No           | enable it to enqueue ingestion requests for background processing, used to improve responsiveness of ingestion endpoints     |
| ZO_FEATURE_FULLTEXT_EXTRA_FIELDS     | -                          | No           | Automatically enables global full-text indexing on the specified fields if they exist in the ingested log data. By default, OpenObserve applies full-text indexing to the following global fields: `log`, `message`, `msg`, `content`, `data`, and `json`. Example: `field1`,`field2`  |
| ZO_FEATURE_INDEX_EXTRA_FIELDS     | -                          | No           | 	Automatically enables global secondary indexing on the specified fields if they exist in the ingested log data. Example: `field1`,`field2`  |
| ZO_FEATURE_DISTINCT_EXTRA_FIELDS     | ""                         | No           |  |
| ZO_FEATURE_QUICK_MODE_FIELDS         | ""                         | No           |  |
| ZO_FEATURE_FILELIST_DEDUP_ENABLED    | false                      | No           |  |
| ZO_FEATURE_QUERY_QUEUE_ENABLED       | true                       | No           |  |
| ZO_FEATURE_QUERY_INFER_SCHEMA        | false                      | No           |  |
| ZO_FEATURE_QUERY_PARTITION_STRATEGY  | file_num                   | No           | Query partition strategy. Possible values - `file_num`, `file_size`, `file_hash`.       |
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
| ZO_TELEMETRY                         | true                       | No           | Send anonymous telemetry info for improving OpenObserve. You can disable by set it to false |
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
| ZO_PROMETHEUS_HA_REPLICA             | __replica__              | No           | for Prometheus cluster deduplication                                                          |
| ZO_PRINT_KEY_CONFIG                  | false                      | No           | Print key config information in logs                                                          |
| ZO_PRINT_KEY_SQL                     | false                      | No           | Print key sql in logs                                                                         |
| RUST_LOG                             | info                       | No           | log level, default is info, supports: error, warn, info, debug, trace                         |
| ZO_BASE_URI                          | ""                         | No           | Change it in case you are hosting at a subpath e.g. www.example.com/openobserve               |
| ZO_BULK_RESPONSE_INCLUDE_ERRORS_ONLY | false                      | No           | When using _bulk API which is compatible with Elasticsearch do not respond with records that succeeded. This allows for higher performance by returing smaller amount of data.  |
| ZO_ALLOW_USER_DEFINED_SCHEMAS        | false                      | No           | If true, it allows user defined schemas for a stream.                                       |
| ZO_SKIP_FORMAT_STREAM_NAME           | false                      | No           | If true, it skip formatting stream name while ingestion.                                    |
| ZO_CONCATENATED_SCHEMA_FIELD_NAME    | _all                      | No           |  |
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
| ZO_IGNORE_FILE_RETENTION_BY_STREAM   |                            | No           |  |
| ZO_ACTIX_REQ_TIMEOUT                 | 30                         | No           | Sets actix server client timeout in seconds for first request. |
| ZO_ACTIX_KEEP_ALIVE                  | 30                         | No           | Sets actix server keep-alive preference in seconds.            |
| ZO_ACTIX_SHUTDOWN_TIMEOUT            |                            | No           | Sets timeout for graceful worker shutdown of actix workers.    |
| ZO_COOKIE_SAME_SITE_LAX              | true                       | No           | If true, same site "lax" cookie is set by the server while authentication. |
| ZO_COOKIE_SECURE_ONLY                | false                      | No           | If true, secure flag is enabled for the cookie set by the server while authentication. |
| ZO_DISTINCT_VALUES_INTERVAL          |                            | No           |  |
| ZO_DISTINCT_VALUES_HOURLY            |                            | No           |  |
| ZO_INGEST_ALLOWED_UPTO               | 5                          | No           | allow historical data ingest up to `now - 5 hours` data, default 5 hours, unit: hours  |
| ZO_INGEST_BUFFER_QUEUE_NUM           | 5                          | No           | number of queues to buffer ingestion requests. `ZO_FEATURE_INGEST_BUFFER_ENABLED` must be true  |
| ZO_INGESTER_SERVICE_URL              |                            | No           |  |
| ZO_INGEST_BLOCKED_STREAMS            |                            | No           |  |
| ZO_INGEST_INFER_SCHEMA_PER_REQUEST   |                            | No           |  |
| ZO_INGEST_FLATTEN_LEVEL              | 3                          | No           | The level of flatten ingestion json data, if you want flatten everything you can simple set it to `0`, or you can set it to `N` to limit the flatten level.   |
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
| ZO_SWAGGER_ENABLED                   | true                       | No           | Generate SWAGGER API documentation by default. (since v0.10.8)  |
| ZO_INGEST_ALLOWED_UPTO                   | 5                       | No           | Discards events older than the specified number of hours. By default, OpenObserve accepts data only if it is not older than 5 hours from the current ingestion time.|
| ZO_INGEST_ALLOWED_IN_FUTURE                   | 24                       | No           | Discards events dated beyond the specified number of future hours. By default, OpenObserve accepts data only if it is not timestamped more than 24 hours into the future.|
| ZO_QUERY_INDEX_THREAD_NUM                   | 0                       | No           | Controls thread count for Tantivy index search. Set to `0` to use default: `CPU cores × 4`. Set a positive integer to override. `0` does not mean unlimited.|
| ZO_SEARCH_INSPECTOR_ENABLED                   | false                       | No           | Controls search inspector feature for detailed search operation tracing. When enabled, tracks search operations with `trace_id` and generates extensive logs for debugging. |
| ZO_UTF8_VIEW_ENABLED                   | true                       | No           | When set to true, this environment variable activates DataFusion's StringView optimization in OpenObserve, which automatically converts UTF8 string fields to the more efficient UTF8View data type during query processing.  |


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
| ZO_CHROME_ENABLED                   | false           | No        | When true, it looks for chromium executable. Required for dashboard reports. |
| ZO_CHROME_PATH                      | -                 | No        | If chrome is enabled, custom chrome executable path can be specified. If not specified, it looks for chrome executable in default locations. If still not found, it automatically downloads a good known version of chromium. |
| ZO_CHROME_CHECK_DEFAULT_PATH        | true            | No        | If false, it skips default locations (e.g. CHROME env, usual chrome file path etc.) when looking for chrome executable. |
| ZO_CHROME_NO_SANDBOX                | false           | No        | If true, it launches chromium in no-sandbox environment. |
| ZO_CHROME_SLEEP_SECS                | 20                | No        | Specify the number of timeout seconds the headless chrome will wait until all the dashboard data is loaded. |
| ZO_CHROME_WITH_HEAD                 | false           | No        | If true, it launches the chromium browser in non-headless mode. |
| ZO_CHROME_WINDOW_WIDTH              | 1370              | No        | Specifies the width of the headless chromium browser. |
| ZO_CHROME_WINDOW_HEIGHT             | 730               | No        | Specifies the height of the headless chromium browser. |
| ZO_CHROME_AUTO_DOWNLOAD             | false           | No        | Only used by the report-server. If true, the report-server automatically downloads a good known version of chromium if chromium is not found in the system. **Note:** If auto download of chromium is desired, make sure that the system has all the required dependency libraries of chromium already installed. |
| ZO_SCHEDULER_MAX_RETRIES            | 3                 | No        | The maximum number of times the scheduler will retry processing the alert/report. If exceeded, the scheduler will skip to the next trigger time of the alert/report. |
| ZO_SCHEDULER_CLEAN_INTERVAL         | 30                | No        | The interval in seconds after which the scheduler will clean up the completed scheduled jobs. |
| ZO_REPORT_USER_NAME                 | ""                | No        | The username that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_REPORT_USER_PASSWORD             | ""                | No        | The password that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_ENABLE_EMBEDDED_REPORT_SERVER    | false           | No        | If true, the alert manager (for which this ENV is enabled) spawns a new report-server running on PORT `5082` (default, can be changed through `ZO_REPORT_SERVER_HTTP_PORT`). |
| ZO_REPORT_SERVER_HTTP_PORT          | `5082`            | No        | The port used by the newly spawned report-server. |
| ZO_REPORT_SERVER_HTTP_ADDR          | `127.0.0.1`       | No        | The ip address used by the newly spawned report-server. |
| ZO_REPORT_SERVER_URL                | `localhost:5082`  | No        | The report server server URL. E.g. - `https://report-server.example.com/api`. |
| ZO_REPORT_SERVER_SKIP_TLS_VERIFY    | false           | No        | If true, it will skip tls verification while making request to report-server from alert manager. |

**NOTE:** For report-server to work correctly, `ZO_WEB_URL`, `ZO_BASE_URI` (if any) and `ZO_REPORT_SERVER_URL` must be specified for every alert managers.

## Caching

| Environment Variable                   | Default Value             | Mandatory | Description                                                               |
| -------------------------------------- | ------------------------- | --------- | ------------------------------------------------------------------------- |
| ZO_DATA_CACHE_DIR                      | ./data/openobserve/cache/ | No        | local query cache storage directory, applicable only for cluster mode.    |
| ZO_MEMORY_CACHE_ENABLED                | true                      | No        | enable in-memory caching for files, default is true, the latest files are cached for accelerated queries.           |
| ZO_CACHE_LATEST_FILES_ENABLED                | false                      | No        | Enables or disables latest file caching.|
| ZO_CACHE_LATEST_FILES_PARQUET                | true                      | No        | Enables caching of latest parquet files.|
| ZO_CACHE_LATEST_FILES_INDEX                | true                      | No        | Enables caching of index files.|
| ZO_CACHE_LATEST_FILES_DELETE_MERGE_FILES                | false                      | No        | Controls whether merged files should be deleted from cache.|
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
| ZO_DISK_CACHE_STRATEGY                 | lru                       | No        | Disk data cache strategy, values are lru, time_lru, fifo |
| ZO_DISK_CACHE_BUCKET_NUM               | 0                         | No        | Disk data cache bucket num, multiple bucket means multiple locker, default is 0 |
| ZO_DISK_CACHE_MULTI_DIR                |                           | No        |   |
| ZO_DISK_CACHE_GC_SIZE                  | 100 (MB)                  | No        |   |
| ZO_DISK_CACHE_GC_INTERVAL              | 0 (seconds)               | No        |   |
| ZO_SCHEMA_CACHE_COMPRESS_ENABLED       | false                     | No        |   |

## Maxmind GeoIP

| Environment Variable              | Default Value | Mandatory | Description |
| --------------------------------- | ------------- | --------- | ----------- |
| ZO_MMDB_DISABLE_DOWNLOAD          | false         | No        | Controls whether OpenObserve automatically downloads the MaxMind GeoLite2 databases (City and ASN) from the configured URLs.            |
| ZO_MMDB_UPDATE_DURATION           |  86400        | No        |             |
| ZO_MMDB_DATA_DIR                  |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_URL        |               | No        |             |
| ZO_MMDB_GEOLITE_ASNDB_URL         |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL |               | No        |             |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL |               | No        |             |

## OpenObserve self introspection and debugging

| Environment Variable           | Default Value / Example | Mandatory | Description                                               |
| ------------------------------ | ------------- | --------- | --------------------------------------------------------- |
| ZO_TOKIO_CONSOLE_SERVER_ADDR   | "0.0.0.0"     | No        |                                                           |
| ZO_TOKIO_CONSOLE_SERVER_PORT   | 6699          | No        |                                                           |
| ZO_TOKIO_CONSOLE_RETENTION     | 60            | No        |                                                           |
| ZO_PROF_PYROSCOPE_ENABLED      | false              | No        |                                                           |
| ZO_PROF_PYROSCOPE_SERVER_URL   | http://localhost:4040              | No        |                                                           |
| ZO_PROF_PYROSCOPE_PROJECT_NAME | openobserve              | No        |                                                           |
| OTEL_OTLP_HTTP_ENDPOINT        | - / e.g. https://api.openobserve.ai/api/default            | No        | remote trace server endpoint.                             |
| ZO_TRACING_ENABLED             | false         | No        | enable it to send traces to remote trace server.          |
| ZO_TRACING_HEADER_KEY          | Authorization | No        | remote trace server endpoint authentication header key.   |
| ZO_TRACING_HEADER_VALUE        | - / e.g. Basic gjdsgfksgkfjgdskfgsdlfglsjdg             | No        | remote trace server endpoint authentication header value. |
| ZO_TRACING_SEARCH_ENABLED      | false              | No        |                                                           |

## Quick mode

| Environment Variable             | Default Value | Mandatory | Description                                             |
| -------------------------------- | ------------- | --------- | ------------------------------------------------------- |
| ZO_QUICK_MODE_ENABLED            | false         | No        | Indicates if quick mode is enabled.                     |
| ZO_QUICK_MODE_NUM_FIELDS         | 500           | No        | The number of fields to consider for quick mode.        |
| ZO_QUICK_MODE_STRATEGY           | ""            | No        | Possible values - `first`, `last`, `both`               |


## Streaming search

| Environment Variable             | Default Value | Mandatory | Description                                             |
| -------------------------------- | ------------- | --------- | ------------------------------------------------------- |
| ZO_STREAMING_ENABLED            | true         | No        | Enables streaming search.               |
| ZO_STREAMING_RESPONSE_CHUNK_SIZE_MB            | 1         | No        | Size in megabytes for each chunk when streaming search responses.               |

## Rate limiting

| Environment Variable             | Default Value | Mandatory | Description                                             |
| -------------------------------- | ------------- | --------- | ------------------------------------------------------- |
| O2_RATE_LIMIT_ENABLED            | false         | No        | Enables rate limiting.               |
| O2_RATE_LIMIT_RULE_REFRESH_INTERVAL            | 10         | No        | Refresh interval for rate limit rules in seconds.               |



## SMTP

| Environment Variable | Default Value | Mandatory | Description                                                                 |
| -------------------- | ------------- | --------- | --------------------------------------------------------------------------- |
| ZO_SMTP_ENABLED      | false       | No        | Indicates if smtp configuration is present.                                 |
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
| ZO_S3_FEATURE_FORCE_HOSTED_STYLE | false         | No        | feature: `force_hosted_style`, default enable for provider `minio` and `swift`.        |
| AWS_EC2_METADATA_DISABLED      | false         | No        | feature, default enable for `swift`.                                                 |
| ZO_S3_FEATURE_HTTP1_ONLY       | false         | No        | feature                                                                              |
| ZO_S3_FEATURE_HTTP2_ONLY       | false         | No        | feature                                                                              |
| ZO_S3_FEATURE_BULK_DELETE       | false         | No        | Enables bulk deletion of streams in object stores that support stream deletion. If your object store supports stream delete, you can enable this variable. AWS S3 and Azure ObjectStore are known to support it. When set to **true**, OpenObserve issues a single operation to delete all files under the stream’s storage prefix, reducing deletion time and API usage.                                                                             |

## Enterprise

Below are the Environment variables only available in the enterprise edition.

## Miscellaneous

| Environment Variable      | Default Value | Mandatory | Description                                                                             |
| ------------------------- | ------------- | --------- | --------------------------------------------------------------------------------------- |
| O2_AUDIT_ENABLED          | false       | No        | Indicates if audit reporting is enabled.                                                |
| O2_AUDIT_BATCH_SIZE       | 500           | No        | How many requests should be batched before flushing the audit data from memory to disk. |
| O2_CUSTOM_LOGO_TEXT       | ""            | No        | Custom logo text that will appear along with the openobserve logo.                      |
| O2_CUSTOM_SLACK_URL       | ""            | No        | Custom slack URL that will be used by the `Slack` menu on the openobserve UI.           |
| O2_CUSTOM_DOCS_URL        | ""            | No        | Custom docs URL that will be used by the `docs` tab on the openobserve UI.              |
| O2_CUSTOM_HIDE_MENUS      | ""            | No        | comma(',') separated menu items that should not be shown in the menu on openobserve UI. E.g. - `metrics,traces` |

## Super-Cluster

| Environment Variable         | Default Value | Mandatory | Description                                     |
| ---------------------------- | ------------- | --------- | ----------------------------------------------- |
| O2_SUPER_CLUSTER_ENABLED     | false       | No        | Indicates if super cluster is enabled.          |
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
| O2_OPENFGA_ENABLED                 | false                        | No        | Indicates if openfga is enabled.                                             |
| O2_OPENFGA_BASE_URL                | `http://127.0.0.1:8080/stores` | No        | The base URL of openfga stores server. **Required** when openfga is enabled. |
| O2_OPENFGA_STORE_NAME              | `openobserve`                  | No        | OpenFGA store name. **Required** when openfga is enabled.                    |
| O2_MAP_GROUP_TO_ROLE               | false                        | No        | If true, the group claims are mapped into roles in the default org.          |
| O2_OPENFGA_PAGE_SIZE               | `100`                          | No        | The page size used for openfga queries.                                      |
| O2_OPENFGA_LIST_ONLY_PERMITTED     | false                        | No        | If true, openobserve only lists resources that have `GET` permission.      |
| O2_MAP_GROUP_TO_ROLE_SKIP_CREATION | true                         | No        | Used with `O2_MAP_GROUP_TO_ROLE`. Skips creating the roles mapped from group claims assuming they already exists. |

## DEX

| Environment Variable        | Default Value               | Mandatory | Description                                                         |
| --------------------------- | --------------------------- | --------- | ------------------------------------------------------------------- |
| O2_DEX_ENABLED              | false                       | No        | Enables SSO in OpenObserve using Dex.                               |
| O2_DEX_CLIENT_ID            | -                           | No        | Client id of static client. **Required** when dex is enabled.       |
| O2_DEX_CLIENT_SECRET        | -                           | No        | Client secret of static client. **Required** when dex is enabled.   |
| O2_DEX_BASE_URL             | `http://127.0.0.1:5556/dex` | No        | URL of the Dex identity provider. **Required** when dex is enabled. |
| O2_CALLBACK_URL             | -                           | No        | Set this value to `<openobserve base url>/web/cb`, after successful token received from dex, user will be redirected to this page. **Required** when dex is enabled. |
| O2_DEX_REDIRECT_URL         | -                           | No        | Set this value to `<openobserve base url>/config/redirect`, Should match to redirect uri specified in dex. **Required** when dex is enabled. |
| O2_DEX_SCOPES               | openid profile email groups offline_access | No        | scopes to be fetched from dex.                       |
| O2_DEX_GROUP_ATTRIBUTE      | ou                          | No        | Maps user to OpenObserve organization.                              |
| O2_DEX_ROLE_ATTRIBUTE       | cn                          | No        | User's role in the organization.                                    |
| O2_DEX_DEFAULT_ORG          | default                     | No        | Default organization for users not belonging to any group in ldap   |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth`                     | No        | Suffix for dex authentication endpoint                              |
| O2_DEX_TOKEN_EP_SUFFIX      | `/token`                    | No        | Suffix for dex token endpoint                                       |
| O2_DEX_KEYS_EP_SUFFIX       | `/keys`                     | No        | Suffix for dex keys endpoint                                        |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth`                     | No        | Suffix for dex authentication endpoint                              |
| O2_DEX_NATIVE_LOGIN_ENABLED | true                      | No        | Indicates if native dex login is enabled.                           |


-->