---
title: Environment Variables
metaTitle: Environment Variables Reference | OpenObserve
description: Configure OpenObserve with flexible environment variables for roles, storage, performance, and scaling across open source and enterprise deployments.
---

# Environment Variables

OpenObserve is configured using environment variables. This page is the full reference, grouped by area. It applies to both Open Source and Enterprise editions.

## How to set these variables

Pick the form that matches how you run OpenObserve:

- **Binary / shell**: `ZO_ROOT_USER_EMAIL=root@example.com ./openobserve`
- **Docker**: `docker run -e ZO_ROOT_USER_EMAIL=root@example.com ...`
- **Kubernetes (Helm)**: set under `config:` or `auth:` in `values.yaml` (see [HA deployment](../deployment/ha-deployment.md)).

## Basic Configuration
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ROOT_USER_EMAIL | - | Email ID of the root user. |
| ZO_ROOT_USER_PASSWORD | - | Password for the root user. |
| ZO_LOCAL_MODE | true | If local mode is set to true, OpenObserve becomes single node deployment.If it is set to false, it indicates cluster mode deployment which supports multiple nodes with different roles. For local mode one needs to configure SQLite DB, for cluster mode one needs to configure PostgreSQL. |
| ZO_LOCAL_MODE_STORAGE | disk | Applicable only for local mode. By default, local disk is used as storage. OpenObserve supports both disk and S3 in local mode. |
| ZO_NODE_ROLE | all | Node role assignment. Possible values are ingester, querier, router, compactor, scheduler, and all. A single node can have multiple roles by specifying them as a comma-separated list. For example, compactor, scheduler. |
| ZO_NODE_ROLE_GROUP | "" | Each query-processing node can be assigned to a specific group using ZO_NODE_ROLE_GROUP. <br>- **interactive**: Handles queries triggered directly by users through the UI. <br>- **background**: Handles automated or scheduled queries, such as alerts and reports. <br>- **empty string** (default): Handles all query types. <br>
In high-load environments, alerts or reports can run large, resource-intensive queries. By assigning dedicated groups, administrators can prevent such queries from blocking or slowing down real-time user searches. |
| ZO_NODE_HEARTBEAT_TTL | 30 | Time-to-live (TTL) for node heartbeats in seconds. |
| ZO_INSTANCE_NAME | - | In the cluster mode, each node has a instance name. Default is instance hostname. |
| ZO_CLUSTER_COORDINATOR | nats | Defines how nodes in the cluster discover each other. |

## Network and Communication
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_HTTP_PORT | 5080 | Port number on which the OpenObserve server listens for HTTP requests. |
| ZO_HTTP_ADDR | | IP address on which the OpenObserve server listens for HTTP requests. |
| ZO_HTTP_IPV6_ENABLED | false | Set this to true to enable IPv6 support for HTTP. |
| ZO_HTTP_WORKER_NUM | 0 | Number of threads for HTTP services. Default is equal to the number of CPU cores (cpu_num). |
| ZO_HTTP_WORKER_MAX_BLOCKING | 256 | Maximum number of blocking connections allowed per HTTP thread. |
| ZO_HTTP_REAL_IP_SOURCE | XEnvoyExternalAddress,XRealIp,RightmostXForwardedFor | Comma-separated list of sources used to resolve the real client IP when OpenObserve runs behind a proxy or load balancer. Sources are tried in order and the first match wins, with the TCP peer always used as the final fallback. Supported values: `XEnvoyExternalAddress` (Envoy/Istio), `XRealIp` (nginx, Traefik), `RightmostXForwardedFor` (nginx/HAProxy/AWS ALB/GCP LB), `RightmostForwarded` (RFC 7239), `CfConnectingIp` (Cloudflare), `TrueClientIp` (Akamai/Cloudflare Enterprise), `FlyClientIp` (Fly.io), `CloudFrontViewerAddress` (AWS CloudFront), and `ConnectInfo` (TCP peer). Only list sources whose proxy actually sits in front of this server, since clients can spoof any trusted header. |
| ZO_GRPC_PORT | 5081 | Port number on which the OpenObserve server listens for gRPC requests. |
| ZO_GRPC_ADDR | | IP address on which the OpenObserve server listens for gRPC requests. |
| ZO_GRPC_ORG_HEADER_KEY | organization | Header key for sending organization information in traces using OTLP over gRPC. |
| ZO_GRPC_STREAM_HEADER_KEY | stream-name | Header key for sending stream name information in traces using OTLP over gRPC. |
| ZO_GRPC_MAX_MESSAGE_SIZE | 32 | Maximum gRPC message size in MB. Default is 32 MB. |
| ZO_GRPC_CONNECT_TIMEOUT | 5 | Timeout in seconds for connecting to the gRPC server. |
| ZO_ROUTE_TIMEOUT | 600 | Timeout value for the router node in seconds. |
| ZO_ROUTE_MAX_CONNECTIONS | 1024 | Sets the maximum number of simultaneous connections per type of scheme for the Router node role. |
| ZO_CORS_ALLOWED_ORIGINS | | Comma-separated list of origins allowed to make cross-origin (CORS) requests to the OpenObserve server. When empty, all origins are allowed. Example: `https://app.example.com,https://admin.example.com`. |
| ZO_SSRF_ALLOW_LOOPBACK | false | Allow outbound requests, such as webhook alert destinations and URL-based enrichment tables, to target loopback addresses (`127.0.0.1`, `localhost`, `::1`). Part of OpenObserve's SSRF (Server-Side Request Forgery) protection, which blocks these targets by default. Does not allow other private network ranges, such as `10.0.0.0/8`, `172.16.0.0/12`, or `192.168.0.0/16`; use `ZO_SKIP_SSRF_CHECKS` for those. Enable only in trusted environments, such as CI/CD pipelines or single-node self-hosted setups where the server needs to send requests to itself. |
| ZO_SKIP_SSRF_CHECKS | false | Disable SSRF protection for outbound requests made by the server for features that check it, such as webhook alert destinations and URL-based enrichment tables, allowing URLs that target loopback addresses, private network ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local addresses, and cloud metadata endpoints (for example, `169.254.169.254`). Use this in a self-hosted deployment to reach a notification service or another system on a private network, such as a homelab. Enable only when you trust every destination URL configured on this instance. |


## Data Storage and Directories
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_DATA_DIR | ./data/openobserve/ | Defaults to "data" folder in current working directory if not provided. |
| ZO_DATA_DB_DIR | ./data/openobserve/db/ | Directory for storing the metadata database locally. |
| ZO_DATA_WAL_DIR | ./data/openobserve/wal/ | Directory for storing Write-Ahead Log (WAL) data. |
| ZO_DATA_STREAM_DIR | ./data/openobserve/stream/ | Directory for storing stream data locally. Applicable only in local mode. |
| ZO_FILE_FORMAT | parquet | File format for data storage: `parquet` or `vortex`. Changing the value affects newly written files. Existing files keep their format and remain queryable, and a single query can read both formats. Metrics streams are written as Parquet on ingesters regardless of this setting and use the configured format only during compaction. |
| ZO_VORTEX_THREAD_NUM | 0 | Number of worker threads for the Vortex runtime. The default `0` uses one worker per CPU core. |


## Ingestion and Schema Management
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_COLS_PER_RECORD_LIMIT | 1000 | Maximum number of fields allowed per record during ingestion. Records with more fields than this limit are discarded. |
| ZO_ALLOW_USER_DEFINED_SCHEMAS | false | When set to true, allows users to define user-defined schemas for a stream. |
| ZO_SKIP_FORMAT_STREAM_NAME | false | When set to true, it skips formatting stream name while ingestion. |
| ZO_CONCATENATED_SCHEMA_FIELD_NAME | _all | Field name where all fields, after applying user-defined schema rules and flattening, are stored as a single field. The default value is _all. For example, if the processed data is {a:5, b:"abc"}, an additional field _all is added as {a:5, b:"abc", _all:"{a:5,b:"abc"}"}. This field is used for full-text search, allowing match_all queries to run across all data instead of being limited to a single field. |
| ZO_INGEST_ALLOWED_UPTO | 5 | Discards events older than the specified number of hours. By default, OpenObserve accepts data only if it is not older than 5 hours from the current ingestion time. |
| ZO_INGEST_ALLOWED_IN_FUTURE | 24 | Discards events dated beyond the specified number of future hours. By default, OpenObserve accepts data only if it is not timestamped more than 24 hours into the future. |
| ZO_INGEST_FLATTEN_LEVEL | 3 | The level of flatten ingestion json data, if you want flatten everything you can simple set it to 0, or you can set it to N to limit the flatten level. |
| ZO_INGEST_BLOCKED_STREAMS            | -             | Comma-separated list of streams blocked from ingestion.      |
| ZO_FORMAT_STREAM_NAME_TO_LOWERCASE | true          | Converts stream names to lowercase.                          |
| ZO_MEM_TABLE_STREAMS                 | -             | Comma-separated list of streams that use dedicated MemTables. |
| ZO_INGEST_DEFAULT_HEC_STREAM        | -             | Default stream used for HEC ingestion.                       |

## File Management, WAL, and Memtable
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_MAX_FILE_SIZE_ON_DISK | 512 | Maximum WAL log file size in MB before creating a new log file. Default is 512 MB. WAL files are created per organization and stream type. |
| ZO_MAX_FILE_SIZE_IN_MEMORY | 512 | Maximum memtable size in MB before it becomes immutable and is written to disk. Default is 512 MB. |
| ZO_MAX_FILE_RETENTION_TIME | 600 | Maximum retention time in seconds for a WAL log file or memtable. Default is 600 seconds (10 minutes). When this limit is reached, a new WAL file is created and the memtable is written to disk. |
| ZO_FILE_PUSH_INTERVAL | 2 | Interval in seconds at which WAL files are moved to storage. Default is 2 seconds. |
| ZO_FILE_PUSH_LIMIT | 0 | Maximum number of WAL files that can be pushed to storage in a single cycle. |
| ZO_FILE_MOVE_THREAD_NUM | - | Number of threads used by the ingester to move WAL files to storage. Default equals the number of CPU cores. |
| ZO_MEM_DUMP_THREAD_NUM | - | Number of threads used by the ingester to dump memtables to disk. Default equals the number of CPU cores. |
| ZO_FILE_MERGE_THREAD_NUM | - | Number of threads used by the compactor to merge WAL files to storage. Default equals the number of CPU cores. |
| ZO_FILE_MOVE_FIELDS_LIMIT | 2000 | Field count threshold per WAL file. If exceeded, merging is skipped on the ingester. |
| ZO_MEM_TABLE_MAX_SIZE | 0 | Total size limit of all memtables. Multiple memtables exist for different organizations and stream types. Each memtable cannot exceed ZO_MAX_FILE_SIZE_IN_MEMORY, and the combined size cannot exceed this limit. If exceeded, the system returns a MemoryTableOverflowError to prevent out-of-memory conditions. Default is 50 percent of total memory. |
| ZO_MEM_PERSIST_INTERVAL | 2 | Interval in seconds at which immutable memtables are persisted from memory to disk. Default is 2 seconds. |
| ZO_WAL_FSYNC_DISABLED | true | Skips the fsync call when a WAL file is synced, so data is flushed to the OS but not forced to disk. Set to false to fsync every sync, which is safer on power loss but slower. |
| ZO_FEATURE_SHARED_MEMTABLE_ENABLED | false | When set to true, it turns on the shared memtable feature and several organizations can use the same in-memory table instead of each organization creating its own. This helps reduce memory use when many organizations send data at the same time. It also works with older non-shared write-ahead log (WAL) files. |
| ZO_MEM_TABLE_BUCKET_NUM | 0 | Controls how many in-memory tables OpenObserve creates. The default `0` derives the number from the memtable budget (`ZO_MEM_TABLE_MAX_SIZE` / `ZO_MAX_FILE_SIZE_IN_MEMORY` / 2), between 1 and the number of CPU cores. Behavior depends on `ZO_FEATURE_SHARED_MEMTABLE_ENABLED`. <br><br>**Shared memtable enabled (`true`):** OpenObserve creates the specified number of shared in-memory tables that all organizations use together. Higher values create more shared tables, each holding data from fewer organizations (faster writes, more memory). Lower values create fewer shared tables, each holding data from more organizations (less memory, slightly slower writes when many orgs ingest at once). <br><br>**Shared memtable disabled (`false`):** Each organization creates its own set of in-memory tables based on this value. For example, with `ZO_MEM_TABLE_BUCKET_NUM=4`, each organization creates 4 separate in-memory tables. Useful when you have only one organization, as multiple tables can improve ingestion performance. |

## Indexing
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_FEATURE_FULLTEXT_EXTRA_FIELDS | - | Automatically enables global full-text indexing on the specified fields if they exist in the ingested log data. By default, OpenObserve applies full-text indexing to the following global fields: log, message, msg, content, data, and JSON. Example: field1,field2 |
| ZO_FEATURE_INDEX_EXTRA_FIELDS | - | Automatically enables global secondary indexing on the specified fields if they exist in the ingested log data. Example: field1,field2 |
| ZO_FEATURE_QUERY_PARTITION_STRATEGY | file_hash | Query partition strategy. Possible values are file_num, file_size, file_hash. |
| ZO_ENABLE_INVERTED_INDEX | true | Enables inverted index creation. |
| ZO_FEATURE_QUERY_REMOVE_FILTER_WITH_INDEX | true | Optimizes query execution by removing redundant filters when an index fully covers the query condition. When enabled, OpenObserve returns results directly from the inverted index without performing position verification. This improves query performance but can also expand the result set compared to running the query with filter verification. |

## Compaction and Data Retention
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_COMPACT_ENABLED | true | Enables compact for small files. |
| ZO_COMPACT_INTERVAL | 10 | The interval at which job compacts small files into larger files. default is 10s, unit: second |
| ZO_COMPACT_MAX_FILE_SIZE | 2048 | Max file size for a single compacted file, after compaction all files will be below this value. Default is 2048 MB, unit: MB |
| ZO_COMPACT_DATA_RETENTION_DAYS | 3650 | Data retention days, default is 10 years. Minimal 3. eg: 30, it means will auto delete the data older than 30 days. You also can set data retention for stream in the UI. |
| ZO_COMPACT_SYNC_TO_DB_INTERVAL | 600 | The interval time in seconds after which compactor sync cache to db is run. |
| ZO_COMPACT_DELETE_FILES_DELAY_MINUTES | 120 | The number of minutes the compactor waits before deleting pending deleted files. Values less than 1 fall back to 120. |
| ZO_COMPACT_DELETE_FILES_DELAY_HOURS | 0 | Deprecated since 0.92.2. Use `ZO_COMPACT_DELETE_FILES_DELAY_MINUTES` instead. If set to a value greater than 0, it is converted to minutes and overrides `ZO_COMPACT_DELETE_FILES_DELAY_MINUTES`. This variable will be removed in a future release. |
| ZO_COMPACT_BLOCKED_ORGS | | Use comma to split multiple orgs. Blocked organizations will not be able to ingest data |
| ZO_COMPACT_FAST_MODE | false |Enables fast compaction mode. Uses more memory but improves performance. Disabling reduces memory usage by about 50 percent. |
| ZO_COMPACT_OLD_DATA_INTERVAL             | 3600          | Interval to compact old data in seconds.                                                       |
| ZO_COMPACT_STRATEGY                        | file_time    | Compaction strategy. Allowed values are file_size, file_time, time_range.                   |
| ZO_COMPACT_EXTENDED_DATA_RETENTION_DAYS | 3650          | Extended data retention period in days.                                                        |
| ZO_COMPACT_OLD_DATA_STREAMS              | -             | Comma-separated stream list to treat as old data.                                              |
| ZO_COMPACT_OLD_DATA_MAX_DAYS            | 7             | Maximum age of data to qualify as old in days.                                                 |
| ZO_COMPACT_OLD_DATA_MIN_HOURS           | 2             | Minimum age of data to qualify as old in hours.                                                |
| ZO_COMPACT_OLD_DATA_MIN_FILES           | 10            | Minimum number of files smaller than half of `ZO_COMPACT_MAX_FILE_SIZE` required in an hour to trigger old-data compaction. |
| ZO_COMPACT_BATCH_SIZE                     | 0             | Batch size for fetching pending compaction jobs.                                               |
| ZO_COMPACT_JOB_RUN_TIMEOUT               | 600           | Time limit for one compaction job in seconds. Jobs that exceed this time are marked as failed. |
| ZO_COMPACT_JOB_CLEAN_WAIT_TIME          | 7200          | Minimum age of finished jobs before cleanup in seconds.                                        |
| ZO_COMPACT_PENDING_JOBS_METRIC_INTERVAL | 300           | Interval to publish pending job metrics in seconds.                                            |
| ZO_COMPACT_MAX_GROUP_FILES               | 10000         | Maximum number of files allowed in a compaction group.                                         |
| ZO_COMPACT_FILE_LIST_DELETED_BATCH_SIZE | 1000                       | Controls the batch size used when deleting entries from `file_list` during compaction and data retention.                                                                            |
| ZO_COMPACT_RETENTION_ALLOWED_HOURS      | "" (empty, no restriction) | Specifies the UTC hours during which data retention jobs are allowed to start. Provide a comma-separated list of hours (e.g., `5,6,7,8` to allow retention between 05:00 and 08:00 UTC). |

## UI and Web
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_UI_SQL_BASE64_ENABLED | false | Enable base64 encoding for SQL in UI. |
| ZO_WEB_URL | http://localhost:5080 | UI access URL. For example, http://localhost:5080 is used as redirect URL and alert URL. |
| ZO_BASE_URI | - | If OpenObserve is hosted under a subpath, set the path prefix. Use this for deployments with a Kubernetes NGINX ingress or any reverse proxy that serves OpenObserve under a subpath such as www.example.com/openobserve. |
| ZO_SWAGGER_ENABLED | true | Generate SWAGGER API documentation by default. |
| ZO_EXPERIMENTAL | false | Shows experimental features in the UI. In the Enterprise edition, `true` adds **AutoObserve** to the sidebar. |

## Dashboard
| Environment Variable                 | Default Value | Description                                       |
| ------------------------------------ | ------------- | ------------------------------------------------- |
| ZO_DASHBOARD_SHOW_SYMBOL_ENABLED | false         | Shows the symbol selector in dashboards.          |
| ZO_DASHBOARD_PLACEHOLDER           | `_o2_all_`     | Placeholder stream name used in dashboards.       |
| ZO_MIN_AUTO_REFRESH_INTERVAL     | 5             | Minimum allowed auto refresh interval in seconds. |

## Payload Limits
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_PAYLOAD_LIMIT | 209715200 | The max payload size of http request body. |

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
| ZO_TELEMETRY_HEARTBEAT | 1800 | Telemetry report interval in seconds. Default is 1800 (30 minutes). |
| ZO_PROMETHEUS_ENABLED | true | Enables prometheus metrics on /metrics endpoint |
| ZO_CALCULATE_STATS_INTERVAL | 600 | In seconds. How often stream stats (total size) is calculated |

## File Retention
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_LOGS_QUERY_RETENTION | hourly | Time partition level used to look up log files at query time. Supported values are hourly and daily. |
| ZO_TRACES_QUERY_RETENTION | hourly | Time partition level used to look up trace files at query time. Supported values are hourly and daily. |
| ZO_METRICS_QUERY_RETENTION | daily | Time partition level used to look up metric files at query time. Supported values are hourly and daily. |
| ZO_LOGS_FILE_RETENTION | hourly | Deprecated, use `ZO_LOGS_QUERY_RETENTION`. A non-default value is copied to it when that one is left at `hourly`. |
| ZO_TRACES_FILE_RETENTION | hourly | Deprecated, use `ZO_TRACES_QUERY_RETENTION`. A non-default value is copied to it when that one is left at `hourly`. |
| ZO_METRICS_FILE_RETENTION | hourly | Deprecated, use `ZO_METRICS_QUERY_RETENTION`. |

## Metrics
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_METRICS_DEDUP_ENABLED | true | Enable de-duplication for metrics |
| ZO_METRICS_LEADER_PUSH_INTERVAL | 15 | Interval at which current leader information is updated to metadata store , default 15s, unit: second |
| ZO_METRICS_LEADER_ELECTION_INTERVAL | 30 | Interval after which new leader for metrics will be elected, when data is not received from current leader, default: 30, unit: second. |
| ZO_SELF_METRIC_CONSUMPTION_ENABLED    | false         | Self-consumption metrics generated by OpenObserve.   |
| ZO_SELF_METRIC_CONSUMPTION_INTERVAL   | 60            | Interval in seconds for self-consumption of metrics. |
| ZO_SELF_METRIC_CONSUMPTION_ACCEPTLIST | -             | Comma-separated list of metrics to self-consume.     |


## Alerts and Reports
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_ALERT_SCHEDULE_INTERVAL | 10s | Defines how often the scheduler checks for scheduled jobs such as alerts, reports, or scheduled pipelines. The default value is 10 seconds. This means the scheduler fetches and processes alerts, reports, and pipelines every 10 seconds. |
| ZO_ALERT_SCHEDULE_TIMEOUT           | 90     | The maximum expected time duration in seconds within which the processing of alert by the scheduler should be complete. If the processing of the alert is not complete within the timeframe, the alert will become available again for other schedulers to pick. |
| ZO_SCHEDULER_WATCH_INTERVAL         | 30    | The scheduler frequently watches if there are any scheduled jobs which are in processing state for more than the `ZO_ALERT_SCHEDULE_TIMEOUT`/`ZO_REPORT_SCHEDULE_TIMEOUT`, if so it increases their `retries` field by 1 and marks them as available for processing again by schedulers. |
| ZO_ALERT_SCHEDULE_CONCURRENCY       | 50 | The number of scheduled jobs the the scheduler will pull at a time from the scheduler for processing |
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
| ZO_REPORT_USER_NAME                 |  | The username that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_REPORT_USER_PASSWORD             |  | The password that will be used by the headless chromium to login into openobserve and generate report. |
| ZO_ENABLE_EMBEDDED_REPORT_SERVER    | false  | If true, the scheduler (for which this ENV is enabled) spawns a new report-server running on PORT `5082` (default, can be changed through `ZO_REPORT_SERVER_HTTP_PORT`). |
| ZO_REPORT_SERVER_HTTP_PORT          | `5082` | The port used by the newly spawned report-server. |
| ZO_REPORT_SERVER_HTTP_ADDR          | `127.0.0.1`  | The ip address used by the newly spawned report-server. |
| ZO_REPORT_SERVER_URL                | `http://localhost:5082` | The report server server URL. E.g. - `https://report-server.example.com/api`. |
| ZO_REPORT_SERVER_SKIP_TLS_VERIFY    | false| If true, it will skip tls verification while making request to report-server from scheduler. |

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
| ZO_COMPACT_FILE_LIST_DUMP_ENABLED | false | Enables file list dump. |

## Queue
| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_QUEUE_STORE | - | Queue backend: `nats` or `memory`. When empty, OpenObserve uses `memory` in local mode and `nats` in cluster mode. `memory` works only in local mode, and enterprise rate limiting requires `nats`. See [Queue backend](./queue-backend.md). |
| ZO_MEMORY_QUEUE_MAX_SIZE_MB | 64 | Memory limit in MB across all topics of the in-memory queue (`ZO_QUEUE_STORE=memory`). |


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
| ZO_PRINT_KEY_CONFIG | false | Print key config information in logs. |
| ZO_PRINT_KEY_SQL | true | Print key sql in logs. |
| RUST_LOG | info | Log level, also supports: error, warn, info, debug, trace. |
| ZO_FEATURE_QUICK_MODE_FIELDS | -             | Comma-separated list of field names to use when quick mode is enabled. Overrides the default quick mode fields. |

## Caching

| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| ZO_DATA_CACHE_DIR | ./data/openobserve/cache/ | local query cache storage directory, applicable only for cluster mode. |
| ZO_MEMORY_CACHE_ENABLED | false | Enables in-memory caching for files. When enabled, the latest files are cached in memory for accelerated queries. |
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
| ZO_DISK_CACHE_BUCKET_NUM | 0 | Disk data cache bucket num, multiple bucket means multiple locker, default is 0 |
| ZO_DISK_CACHE_ENABLED | true | Enable in-disk caching for files, default is true, the latest files are cached for accelerated queries. when the memory cache is not enough will try to cache in local disk, you can consider the memory cache is first level, disk cache is second level. |
| ZO_DISK_CACHE_MAX_SIZE | - | Default 50% of the total free disk for in-disk cache, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_SKIP_SIZE | - | Default 80% of the total disk cache size, A query will skip disk cache if it need more than this value. one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_RELEASE_SIZE | - | Default drop 1% entries from in-disk cache as cache is full, one can set it to desired amount unit: MB |
| ZO_DISK_CACHE_STRATEGY | time_lru | Disk data cache strategy, values are lru, time_lru, fifo |
| ZO_MEMORY_CACHE_MAX_AGE_DAYS | 0 | Maximum age in days for files admitted into the memory cache. Files whose data is older than this value are skipped; queries read them directly from object storage instead of downloading them into the cache. Set to `0` to disable (no age limit, current behavior). |
| ZO_DISK_CACHE_MAX_AGE_DAYS | 0 | Maximum age in days for files admitted into the disk cache. Files whose data is older than this value are skipped; queries read them directly from object storage instead of downloading them into the cache. Set to `0` to disable (no age limit, current behavior). |
| ZO_FILE_DOWNLOAD_SYNC_MAX_SIZE | 1 | Files up to this size in MB that are missing from the querier cache are downloaded into the cache before a search runs, instead of being range-read from object storage. Larger files are downloaded in the background as before. Set to `0` to disable. |


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



## NATS
| Environment Variable       | Default Value | Description                                                                           |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| ZO_NATS_ADDR              | `localhost:4222` |NATS server address - If not stated explicitly the `nats://` schema and port `4222` is assumed.|
| ZO_NATS_PREFIX            | `o2_`            | NATS prefix for openobserve.        |
| ZO_NATS_USER              |  -  | NATS user name.                     |
| ZO_NATS_PASSWORD          |  -   | NATS user password.                 |
| ZO_NATS_REPLICAS          | 3                | Number of replicas for NATS.        |
| ZO_NATS_CONNECT_TIMEOUT   | 5                | NATS connection timeout in seconds. |
| ZO_NATS_LOCK_WAIT_TIMEOUT | 3600             | NATS lock wait timeout in seconds.  |
| ZO_NATS_QUEUE_MAX_AGE     | 60               | NATS queue maximum age in days.     |
| ZO_NATS_HISTORY          | 1 | Number of historical entries to keep in NATS key value buckets.                       |
| ZO_NATS_DELIVER_POLICY  | all           | Starting point in the stream for message delivery. Allowed values are all, last, new. |
| ZO_NATS_SUB_CAPACITY    | 65535         | Maximum subscription capacity.                                                        |
| ZO_NATS_QUEUE_MAX_SIZE | 2048          | Maximum queue size in megabytes.                                                      |
| ZO_NATS_KV_WATCH_MODULES | - | Defines which internal modules use the NATS Key-Value Watcher instead of the default NATS Queue for event synchronization. Add one or more module prefixes separated by commas, such as /nodes/ or /user_sessions/. When left empty, all modules use the default NATS Queue mechanism.                                                      |
| ZO_NATS_EVENT_STORAGE | file | Controls how NATS JetStream stores event data. Use memory for high-speed, in-memory event storage or file for durable, disk-based storage that persists across restarts. <br> Performance Benchmark Results: <br> • File Storage: 10,965 ops/sec (10.71 MB/s throughput, ~911 µs mean latency) <br>• Memory Storage: 16,957 ops/sec (16.56 MB/s throughput, ~589 µs mean latency) <br> Memory storage offers ~55 percent higher throughput and lower latency, while file storage ensures durability.                                                      |
| ZO_NATS_V211_SUPPORT | false          | Enables support for NATS version 2.11 TTL markers for node health detection. When set to true, NATS generates purge events when a node fails to send a keepalive message within the TTL period (configured by `ZO_NODE_HEARTBEAT_TTL`, default `30` seconds). This allows other nodes to immediately detect and remove the crashed node from their cache, preventing query timeouts and connection errors that would otherwise occur while nodes wait to detect the failure. <br>
When set to false, nodes rely on slower failure detection mechanisms and continue attempting to communicate with crashed nodes, resulting in timeout or connection errors. <br>
**Note**: This feature requires NATS version 2.11 or later. Setting this to true with earlier NATS versions will cause configuration errors. The default is false to maintain compatibility with NATS versions prior to 2.11.                                                   |



## S3 and Object Storage
| Environment Variable                   | Default Value | Description                                                                                                                                                           |
| -------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL               | -             | Default for aws s3 & leave it empty, but for `minIO`, `gcs`, or RustFS one should configure it. |
| ZO_S3_REGION_NAME              | -             | Region name                                                                          |
| ZO_S3_ACCESS_KEY               | -             | Access key                                                                           |
| ZO_S3_SECRET_KEY               | -             | Secret key                                                                           |
| ZO_S3_BUCKET_NAME              | -             | Bucket name                                                                          |
| ZO_S3_BUCKET_PREFIX            | -             | You can store data in a sub directory, like: `openobserve/`                          |
| ZO_S3_PROVIDER                 | - | S3 provider name, like: aws, s3, gcs, gcp, azure, oss, minio, rustfs, swift. When empty, it is detected from `ZO_S3_SERVER_URL`: `gcs` for `googleapis.com`, `oss` for `aliyuncs.com`, otherwise `aws`.                             |
| ZO_S3_FEATURE_FORCE_HOSTED_STYLE | false         | Feature: `force_hosted_style`.                                                     |
| AWS_EC2_METADATA_DISABLED      | false         | Feature, default enable for `swift`.                                                 |
| ZO_S3_FEATURE_BULK_DELETE       | false         | Enables bulk deletion of streams in object stores that support stream deletion. If your object store supports stream delete, you can enable this variable. AWS S3 and Azure ObjectStore are known to support it. When set to **true**, OpenObserve issues a single operation to delete all files under the stream’s storage prefix, reducing deletion time and API usage.                                                                             |
| ZO_S3_ACCOUNTS                       | -             | Comma-separated list of account identifiers. |
| ZO_S3_STREAM_STRATEGY               | -             | Stream to account selection strategy. Empty uses the default account. Other values are file_hash, stream_hash, and explicit mappings in the form stream1:account1. |
| ZO_S3_CONNECT_TIMEOUT               | 10            | Connect timeout in seconds. |
| ZO_S3_REQUEST_TIMEOUT               | 3600          | Request timeout in seconds.   |
| ZO_S3_ALLOW_INVALID_CERTIFICATES   | false         | Allows invalid TLS certificates.   |
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
| ZO_PIPELINE_BATCH_TIMEOUT_MS                  | 1000          | Maximum time to wait for a batch to fill up in milliseconds.                                                                      |
| ZO_PIPELINE_BATCH_SIZE_BYTES                  | 10485760      | Maximum batch size in bytes.                                                                                                      |
| ZO_PIPELINE_BATCH_RETRY_MAX_ATTEMPTS         | 3             | Maximum number of retry attempts for batch flush.                                                                                 |
| ZO_PIPELINE_BATCH_RETRY_INITIAL_DELAY_MS    | 1000          | Initial delay for batch flush retries in milliseconds.                                                                            |
| ZO_PIPELINE_BATCH_RETRY_MAX_DELAY_MS        | 30000         | Maximum delay for batch flush retries in milliseconds.                                                                            |
| ZO_PIPELINE_USE_SHARED_HTTP_CLIENT           | false         | Uses shared HTTP client instances to improve connection pooling.                                                                  |
| ZO_PIPELINE_REMOVE_FILE_AFTER_MAX_RETRY     | true          | Removes the WAL file after reaching the maximum retry count.                                                                      |
| ZO_PIPELINE_MAX_RETRY_COUNT                   | 10            | Maximum number of retries for pipeline exporters.                                                                                 |
| ZO_PIPELINE_MAX_RETRY_TIME_IN_HOURS         | 24            | Maximum retry time for pipeline exporters in hours.                                                                               |
| ZO_PIPELINE_MAX_FILE_SIZE_ON_DISK_MB       | 256 | Maximum file size on disk for pipeline files in megabytes.                                                                        |
| ZO_PIPELINE_MAX_FILE_RETENTION_TIME_SECONDS | 600           | Maximum retention time for pipeline files in seconds.                                                                             |

## Health Check
| Environment Variable             | Default Value | Description                                                                     |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| ZO_HEALTH_CHECK_ENABLED       | true          | Enables node health checks.                                                     |
| ZO_HEALTH_CHECK_TIMEOUT       | 5             | Health check timeout in seconds.                                                |
| ZO_HEALTH_CHECK_FAILED_TIMES | 3             | Removes the node from the consistent hash after this many consecutive failures. |

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
| ZO_TRACING_SEARCH_ENABLED                | false         | Enables tracing for search operations.    |
| ZO_TRACING_ENABLED             | false  | enable it to send traces to remote trace server.          |
| ZO_TRACING_HEADER_KEY          | Authorization| Remote trace server endpoint authentication header key.   |
| ZO_TRACING_HEADER_VALUE        | - / e.g. Basic gjdsgfksgkfjgdskfgsdlfglsjdg | remote trace server endpoint authentication header value. |
| OTEL_OTLP_HTTP_ENDPOINT        | - / e.g. https://api.openobserve.ai/api/default  | Remote trace server endpoint.                             |

## Tokio Console
| Environment Variable             | Default Value | Description                                         |
| -------------------------------- | ------------- | --------------------------------------------------- |
| ZO_TOKIO_CONSOLE_SERVER_ADDR | 0.0.0.0       | Address for the Tokio console server.               |
| ZO_TOKIO_CONSOLE_SERVER_PORT | 6699          | Port for the Tokio console server.                  |
| ZO_TOKIO_CONSOLE_RETENTION    | 60            | Retention period in seconds for Tokio console data. |

## Tantivy Index
| Environment Variable                                  | Default Value | Description                                                              |
| ----------------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| ZO_INVERTED_INDEX_RESULT_CACHE_ENABLED           | false         | Enables Tantivy result cache.                                            |
| ZO_INVERTED_INDEX_COUNT_OPTIMIZER_ENABLED        | true          | Enables inverted index count optimizer.                                  |


## MaxMind GeoIP
| Environment Variable                   | Default Value                                                                                      | Description                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ZO_MMDB_DISABLE_DOWNLOAD          | false | By default, MMDB files are downloaded automatically. Set this to true to disable the download.            |
| ZO_MMDB_DATA_DIR                    | ./data/openobserve/mmdb/ | Defines the local directory path where OpenObserve looks for MaxMind database files. |
| ZO_MMDB_UPDATE_DURATION_DAYS       | 30                                                                                                 | Update interval for MMDB downloads in days.                                     |
| ZO_MMDB_GEOLITE_CITYDB_URL         | [https://geoip.zinclabs.dev/GeoLite2-City.mmdb](https://geoip.zinclabs.dev/GeoLite2-City.mmdb)     | GeoLite City database URL.                                                      |
| ZO_MMDB_GEOLITE_ASNDB_URL          | [https://geoip.zinclabs.dev/GeoLite2-ASN.mmdb](https://geoip.zinclabs.dev/GeoLite2-ASN.mmdb)       | GeoLite ASN database URL.                                                       |
| ZO_MMDB_GEOLITE_CITYDB_SHA256_URL | [https://geoip.zinclabs.dev/GeoLite2-City.sha256](https://geoip.zinclabs.dev/GeoLite2-City.sha256) | GeoLite City database SHA-256 URL.                                              |
| ZO_MMDB_GEOLITE_ASNDB_SHA256_URL  | [https://geoip.zinclabs.dev/GeoLite2-ASN.sha256](https://geoip.zinclabs.dev/GeoLite2-ASN.sha256)   | GeoLite ASN database SHA-256 URL.                                               |

## Meta Storage
| Environment Variable                  | Default Value | Description                                                                                                                                                                    |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZO_META_STORE                       | -             | Metadata store. Default is `sqlite` in local mode. Cluster mode requires `postgres`. Supported values: sqlite, postgres. MySQL is no longer supported. Note that sqlite is supported only for local mode. |
| ZO_META_TRANSACTION_RETRIES        | 3             | Maximum time the transaction in the meta table will be retried.                                                                                                                |
| ZO_META_POSTGRES_DSN               | -             | If you enable postgres as meta store, you need configure the database source address, like this: postgres://postgres:12345678@localhost:5432/openobserve                     |
| ZO_META_CONNECTION_POOL_MIN_SIZE | -             | Minimum number of connections created in the connection pool size for postgres and sqlite. Defaults to cpu_limits                                                     |
| ZO_META_CONNECTION_POOL_MAX_SIZE | -             | Maximum number of connections created in the connection pool size for postgres and sqlite. Defaults to `cpu_limits * 2` |

> For local mode, OpenObserve use SQLite as the metadata store.
> For cluster mode, OpenObserve uses PostgreSQL as the metadata store.

## Bloom Filter
| Environment Variable                    | Default Value | Description                                                         |
| --------------------------------------- | ------------- | ------------------------------------------------------------------- |
| ZO_BLOOM_FILTER_ENABLED              | true          | Enable by default, but only enabled for trace_id field.            |
| ZO_BLOOM_FILTER_DEFAULT_FIELDS      | -             | Add more fields support by bloom filter, will add UI setting later. |

## Usage Reporting
| Environment Variable          | Default Value                                                                                | Description                                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZO_USAGE_REPORTING_ENABLED | true | Enable usage reporting. This will start capturing how much data has been ingested across each org/stream. You can use this info to enable charge back for internal teams.   |
| ZO_USAGE_BATCH_SIZE        | 2000  | How many requests should be batched before flushing the usage data from memory to disk.    |
| ZO_USAGE_REPORTING_MODE    | local  | Local mode means the usage will be reported only in the `_meta` organization of the internal cluster. remote mode means that the usage reporting will be ingested to the remote target. both ingests the usage reports both to internal and remote target. |
| ZO_USAGE_REPORTING_URL     | [http://localhost:5080/api/_meta/usage/_json](http://localhost:5080/api/_meta/usage/_json) | In case of remote or both value of ZO_USAGE_REPORTING_MODE, this URL is used to post the usage reports to remote target.  |
| ZO_USAGE_REPORTING_CREDS   | -  | The credentials required to send along with the post request to the ZO_USAGE_REPORTING_URL. E.g. - Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4UGFzcyMxMjM=.  |
| ZO_USAGE_PUBLISH_INTERVAL  | 60 | Duration in seconds after the last reporting usage will be published. |

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
| ZO_QUERY_PARTITION_BY_SECS | 5 | Query partition size. Unit is seconds. |
| ZO_QUERY_GROUP_BASE_SPEED | 1024 | Baseline throughput per core for group operations. Unit is MB per second per core. |
| ZO_MEMORY_CIRCUIT_BREAKER_ENABLED   | false         | Enables memory circuit breaker.                                                      |
| ZO_MEMORY_CIRCUIT_BREAKER_RATIO     | 90            | Memory usage threshold percentage for circuit breaker.                               |
| ZO_RESTRICTED_ROUTES_ON_EMPTY_DATA | false         | Redirects users to the ingestion page when no stream is found.                       |
| ZO_QUERY_ON_STREAM_SELECTION        | true          | Triggers search based on a button click event.                                       |
| ZO_RESULT_CACHE_ENABLED              | true          | Enables result cache for query results.                                              |
| ZO_USE_MULTIPLE_RESULT_CACHE        | false         | Uses multiple result caches for query results.                                       |
| ZO_RESULT_CACHE_SELECTION_STRATEGY  | overlap       | Strategy for selecting result cache. Allowed values include both, overlap, duration. |
| ZO_AGGREGATION_TOPK_ENABLED         | true          | Enables approx top-k aggregations.                                                   |
| ZO_FEATURE_QUERY_QUEUE_ENABLED    | true          | Enterprise edition must not enable this. In the open source edition, when enabled, the system processes only one search request at a time. |
| ZO_HISTOGRAM_ENABLED  | true             | Enables histogram-based query aggregation and visual display for dashboards and log views.                                                                             |
| ZO_SHOW_STREAM_DATES_DOCS_NUM  | true             | Displays the date range and document count for streams in the user interface. |
| ZO_METRICS_RESULT_CACHE_MAX_SIZE | 0 | Memory budget in MB for the PromQL result cache index. `0` means 1 percent of total memory, clamped to 32-256 MB. |
| ZO_QUERY_DEFAULT_LIMIT  | 1000             | Default row limit applied when a SQL query does not specify a LIMIT clause.                             |
| ZO_QUERY_INGESTER_TIMEOUT  | 0             | Timeout duration (in seconds) for ingester-side query execution. Zero disables timeout.                             |
| ZO_USAGE_REPORTING_THREAD_NUM  | 0             |Number of threads used for usage reporting operations.                             |
| ZO_USER_DEFINED_SCHEMA_MAX_FIELDS  | 1000 | Maximum number of fields allowed in a user-defined schema.                            |
| ZO_UI_ENABLED  | true             | Enables or disables the OpenObserve web user interface.                            |
| ZO_PRINT_KEY_EVENT  | false             | Enables printing of key-level events in logs for debugging.                    |

## Super-Cluster

> The following environment variables are available only in the Enterprise edition.


| Environment Variable         | Default Value | Description                                     |
| ---------------------------- | -------------  | ----------------------------------------------- |
| O2_SUPER_CLUSTER_ENABLED     | false  | Indicates if super cluster is enabled.          |
| O2_SUPER_CLUSTER_REGION      | default   | Region of super cluster.                        |
| O2_SUPER_CLUSTER_PUBLIC_ADDR | | Public address of super cluster.                |
| O2_SUPER_CLUSTER_PUBLIC_PORT |  | Public port of super cluster (in case of gRPC). |
| O2_SUPER_CLUSTER_GRPC_TOKEN  |  | gRPC token.                                     |

## Work groups
> The following environment variables are available only in the Enterprise edition. They replace the removed `O2_SEARCH_GROUP_*` settings. See [Work group](../../user-guide/account-administration/work-group-v2.md) for how queries are classified and admitted, and for the slot-based admission settings.

| Environment Variable | Default Value | Description |
| -------------------- | ------------- | ----------- |
| O2_WORK_GROUP_BASE_SPEED | 1024 | Assumed scan speed in MB per second, used to estimate query execution time. |
| O2_WORK_GROUP_BASE_SECS | 10 | Queries with an estimated execution time above this many seconds are long queries. |
| O2_WORK_GROUP_LONG_MAX_PERCENT | 0.4 | Maximum share of CPU and memory the long group can use, as a fraction between 0 and 1. |
| O2_WORK_GROUP_SHORT_MAX_PERCENT | 0.8 | Maximum share of CPU and memory the short group can use. |
| O2_WORK_GROUP_BACKGROUND_MAX_PERCENT | 0.4 | Maximum share of CPU and memory the background group can use. |
| O2_WORK_GROUP_LONG_MAX_CONCURRENCY | 5 | Maximum concurrent long queries across the cluster. |
| O2_WORK_GROUP_SHORT_MAX_CONCURRENCY | 10 | Maximum concurrent short queries across the cluster. |
| O2_WORK_GROUP_BACKGROUND_MAX_CONCURRENCY | 10 | Maximum concurrent background tasks across the cluster. |
| O2_WORK_GROUP_ORG_LONG_MAX_CONCURRENCY | 5 | Maximum concurrent long queries per organization. |
| O2_WORK_GROUP_ORG_SHORT_MAX_CONCURRENCY | 10 | Maximum concurrent short queries per organization. |
| O2_WORK_GROUP_USER_LONG_MAX_CONCURRENCY | 2 | Maximum concurrent long queries per user. |
| O2_WORK_GROUP_USER_SHORT_MAX_CONCURRENCY | 4 | Maximum concurrent short queries per user. |
| O2_WORK_GROUP_CPU_LIMIT_ENABLED | false | When true, both CPU and memory are limited per group. When false, only memory is limited. |
| O2_WORK_GROUP_DYNAMIC_RESOURCE | true | When true, the resources for each query shrink as more queries run in the same group. |

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
| O2_DEX_LDAP_GROUP_ATTRIBUTE | ou | LDAP attribute that maps a user to an OpenObserve organization. |
| O2_DEX_LDAP_ROLE_ATTRIBUTE | cn | LDAP attribute that sets the user's role in the organization. |
| O2_DEX_DEFAULT_ORG          | default | Default organization for users not belonging to any group in ldap.   |
| O2_DEX_TOKEN_EP_SUFFIX      | `/token` | Suffix for dex token endpoint.|
| O2_DEX_KEYS_EP_SUFFIX       | `/keys` | Suffix for dex keys endpoint. |
| O2_DEX_AUTH_EP_SUFFIX       | `/auth` | Suffix for dex authentication endpoint. |
| O2_DEX_NATIVE_LOGIN_ENABLED | true | Indicates if native dex login is enabled. |


## Other Enterprise Features

| Environment Variable      | Default Value | Description                                                                             |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------- |
| O2_AUDIT_ENABLED          | true | Records non-ingest API calls, with credential fields redacted, in the audit stream of the meta organization. Set to false to opt out.                                                |
| O2_AUDIT_BATCH_SIZE       | 500           | How many requests should be batched before flushing the audit data from memory to disk. |
| O2_CUSTOM_LOGO_TEXT       |             | Custom logo text that will appear along with the openobserve logo.                      |
| O2_CUSTOM_SLACK_URL       |            | Custom slack URL that will be used by the `Slack` menu on the openobserve UI.           |
| O2_CUSTOM_DOCS_URL        |            | Custom docs URL that will be used by the `docs` tab on the openobserve UI.              |
| O2_CUSTOM_HIDE_MENUS      |          | Comma-separated menu items that should not be shown in the menu on openobserve UI. For example, `metrics,traces`. |
| O2_LOG_PATTERNS_SIMILARITY_THRESHOLD | 0.3 | How strictly log patterns group logs, from 0.0 to 1.0. Lower values create more specific patterns; higher values merge more logs into general patterns. |


## AI Integration

> The following environment variables are available only in the Enterprise edition.


| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| O2_AI_ENABLED | true | Enables AI-powered features such as query assistance, anomaly detection, and root cause analysis. Requires the o2ai agent service (Helm `enterprise.o2ai`). Set to false to opt out. |
| O2_TOOL_API_URL | - | URL for OpenObserve API that AI agent can use for tool calls. Auto-generated to point to router service. Example: http://o2-openobserve-router:5080 |
| O2_AGENT_URL | - | URL of the o2ai agent service. The Helm chart generates it when `enterprise.o2ai.enabled` is true. Example: `http://<release>-o2ai:8000` |

## AI agent (o2ai) configuration

> The following environment variables are available only in the Enterprise edition. They configure the o2ai agent service, not OpenObserve itself. In the Helm chart, set them under `enterprise.o2ai.config` (`O2_AI_API_KEY`, `O2_MCP_USERNAME` and `O2_MCP_PASSWORD` go under `auth`). The `O2_SRE_HOST`, `O2_SRE_PORT` and `O2_SRE_LOG_LEVEL` settings of the former o2-sre-agent are now `O2_AI_HOST`, `O2_AI_PORT` and `O2_AI_LOG_LEVEL`.


| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| O2_AI_HOST | 0.0.0.0 | Host address for the o2ai agent service to bind to. |
| O2_AI_PORT | 8000 | Port number for the o2ai agent service. |
| O2_AI_LOG_LEVEL | INFO | Logging level for the o2ai agent service. Supported values: DEBUG, INFO, WARNING, ERROR |
| O2_AI_PROVIDER | - | AI provider name for direct API calls (used only when gateway is not enabled). Supported values: anthropic, openai, bedrock, or other compatible providers. |
| O2_AI_MODEL | - | AI model identifier to use for AI requests. The value depends on the provider (e.g., claude-sonnet-4-5-20250929 for Anthropic, gpt-4 for OpenAI). |
| O2_AI_API_KEY | - | Authentication API key for accessing the AI service. Required for AI features. |
| O2_AI_GATEWAY_ENABLED | false | Set to "true" to route AI requests through an AI Gateway instead of direct provider API calls. |
| O2_AI_GATEWAY_TIMEOUT | 120 | Request timeout for gateway requests in seconds |
| O2_AI_GATEWAY_URL | - | URL of the AI Gateway service (e.g., http://my-gateway:80). When specified, all AI requests are routed through this gateway. |
| O2_MCP_USERNAME | - | Username for MCP (Model Context Protocol) authentication with the o2ai agent. Optional. |
| O2_MCP_PASSWORD | - | Password for MCP (Model Context Protocol) authentication with the o2ai agent. Optional. |
| O2_MCP_VALIDATION_ENABLED | true | Enables Model Context Protocol (MCP) validation for AI requests. |
| O2_MCP_VALIDATION_RETRY | true | Enables retry mechanism for failed MCP validation. |
| O2_MCP_CONTENT_VALIDATION_ENABLED | true | Enables content validation for MCP requests and responses. |
| O2_MCP_CONTENT_VALIDATION_MODE | hybrid | Validation mode for MCP content. Supported values: strict, hybrid, permissive |
| O2_MCP_RESPONSE_VALIDATION_ENABLED | true | Enables validation of AI response format and structure. |

## Incidents and RCA

> The following environment variables are available only in the Enterprise edition.


| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| O2_INCIDENTS_ENABLED | false | Enables the incidents management feature for tracking and managing system incidents. |
| O2_INCIDENTS_RCA_ENABLED | false | Enables root cause analysis (RCA) for incidents to automatically identify potential causes using AI. |
| O2_INCIDENTS_AUTO_RESOLVE_AFTER_MINUTES | 4320 | Time in minutes without new alerts after which incidents are automatically resolved. Default is 4320 (3 days). Set to -1 to disable auto-resolution. |
| O2_INCIDENTS_RCA_TIMEOUT_SECS | 600 | Time limit in seconds for one RCA run. A run still going after this ends with a timeout unless the report was already submitted. `0` uses the default 600. |

## Service Graph

> The following environment variables are available only in the Enterprise edition.


| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| O2_SERVICE_GRAPH_ENABLED | true | Runs the service graph rollup job for visualizing service dependencies and relationships from trace data. |
| O2_SERVICE_GRAPH_INTERVAL_SECS | 60 | How often the service graph rollup job runs, in seconds. |
| O2_SERVICE_GRAPH_FLUSH_SECS | 60 | Width of a service graph window in seconds. One sample is written per series per window. |

## Service Streams

> The following environment variables are available only in the Enterprise edition.


| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| O2_SERVICE_STREAMS_ENABLED | true | Enables service discovery (adds ingester CPU) for automatically correlating logs and metrics with services based on trace data. |
| O2_SERVICE_STREAMS_SAMPLE_RATE | 10 | Processes 1 out of every N streams per sample window. Set to 1 to process all streams. |
| O2_SERVICE_STREAMS_MAX_STREAMS_PER_SERVICE | 50 | Maximum number of streams that can be associated with a single service to prevent unbounded growth. |
| O2_SERVICE_STREAMS_SAMPLE_WINDOW_SECS | 300 | Time window in seconds (default: 5 minutes) for sampling and analyzing service stream correlations. |

## Removed settings

The following settings no longer exist in OpenObserve. Setting them has no effect. Where a replacement exists, it is listed.

| Removed setting | Replacement |
| --------------- | ----------- |
| `ZO_HEARTBEAT_INTERVAL` | `ZO_TELEMETRY_HEARTBEAT` (seconds) |
| `ZO_FILE_LIST_DUMP_ENABLED` | `ZO_COMPACT_FILE_LIST_DUMP_ENABLED` |
| `ZO_SKIP_FORMAT_BULK_STREAM_NAME` | `ZO_SKIP_FORMAT_STREAM_NAME` |
| `ZO_METRICS_CACHE_ENABLED` | `ZO_RESULT_CACHE_ENABLED` |
| `ZO_METRICS_CACHE_MAX_ENTRIES` | `ZO_METRICS_RESULT_CACHE_MAX_SIZE` |
| `ZO_META_MYSQL_DSN` | None. MySQL is no longer supported as a metadata store; use PostgreSQL. |
| `O2_SEARCH_GROUP_*` | `O2_WORK_GROUP_*` (see [Work groups](#work-groups)) |
| `O2_DEX_GROUP_ATTRIBUTE`, `O2_DEX_ROLE_ATTRIBUTE` | `O2_DEX_LDAP_GROUP_ATTRIBUTE`, `O2_DEX_LDAP_ROLE_ATTRIBUTE` |
| `O2_SRE_HOST`, `O2_SRE_PORT`, `O2_SRE_LOG_LEVEL` | `O2_AI_HOST`, `O2_AI_PORT`, `O2_AI_LOG_LEVEL` |
| `O2_SERVICE_GRAPH_PROCESSING_INTERVAL_SECS` | `O2_SERVICE_GRAPH_INTERVAL_SECS` |
| `O2_SERVICE_STREAMS_SAMPLE_EVERY_NTH_STREAM` | `O2_SERVICE_STREAMS_SAMPLE_RATE` |
| `ZO_APP_NAME`, `ZO_DATA_IDX_DIR`, `ZO_ES_VERSION`, `ZO_JSON_LIMIT`, `ZO_RUM_VERSION`, `ZO_USAGE_ORG` | None |
| `ZO_ENTRY_PER_SCHEMA_VERSION_ENABLED`, `ZO_WIDENING_SCHEMA_EVOLUTION`, `ZO_SKIP_SCHEMA_VALIDATION`, `ZO_INGEST_INFER_SCHEMA_PER_REQUEST` | None |
| `ZO_FEATURE_INGEST_BUFFER_ENABLED`, `ZO_INGEST_BUFFER_QUEUE_NUM` | None |
| `ZO_IGNORE_FILE_RETENTION_BY_STREAM`, `ZO_COMPACT_DATA_RETENTION_HISTORY`, `ZO_SCHEDULER_CLEAN_INTERVAL` | None |
| `ZO_DISTINCT_VALUES_INTERVAL`, `ZO_DISTINCT_VALUES_HOURLY`, `ZO_FEATURE_DISTINCT_EXTRA_FIELDS` | None. The `_values` API no longer uses distinct-value streams. |
| `ZO_FILE_LIST_DUMP_DUAL_WRITE`, `ZO_FILE_LIST_DUMP_MIN_HOUR`, `ZO_FILE_LIST_DUMP_DEBUG_CHECK` | None |
| `ZO_EVENTS_ENABLED`, `ZO_EVENTS_AUTH`, `ZO_EVENTS_BATCH_SIZE` | None |
| `ZO_SCHEMA_CACHE_COMPRESS_ENABLED`, `ZO_FILE_DOWNLOAD_MIN_RECORDS`, `ZO_S3_SYNC_TO_CACHE_INTERVAL`, `ZO_NATS_COMMAND_TIMEOUT` | None |
| `ZO_PIPELINE_BATCH_SIZE`, `ZO_MASTER_ENCRYPTION_ALGORITHM`, `ZO_MASTER_ENCRYPTION_KEY` | None |
| `ZO_TRACES_SPAN_METRICS_ENABLED`, `ZO_TRACES_SPAN_METRICS_EXPORT_INTERVAL`, `ZO_TRACES_SPAN_METRICS_CHANNEL_BUFFER` | None |
| `ZO_PROF_PPROF_ENABLED`, `ZO_PROF_PPROF_PROTOBUF_ENABLED`, `ZO_PROF_PPROF_FLAMEGRAPH_PATH`, `ZO_PROF_PYROSCOPE_ENABLED`, `ZO_PROF_PYROSCOPE_SERVER_URL`, `ZO_PROF_PYROSCOPE_PROJECT_NAME` | None |
| `ZO_INVERTED_INDEX_OLD_FORMAT`, `ZO_INVERTED_INDEX_CAMEL_CASE_TOKENIZER_DISABLED`, `ZO_BLOOM_FILTER_DISABLED_ON_SEARCH`, `ZO_ALIGN_PARTITIONS_FOR_INDEX` | None |
| `ZO_QUERY_INDEX_THREAD_NUM`, `ZO_QUERY_OPTIMIZATION_NUM_FIELDS`, `ZO_PARQUET_MAX_ROW_GROUP_SIZE`, `ZO_META_TRANSACTION_LOCK_TIMEOUT` | None |
| `ZO_FEATURE_FILELIST_DEDUP_ENABLED`, `ZO_FEATURE_QUERY_INFER_SCHEMA` | None |
| `O2_INCIDENTS_ALERT_GRAPH_ENABLED`, `O2_SERVICE_GRAPH_QUERY_TIME_RANGE_MINUTES`, `O2_SERVICE_GRAPH_EXCLUDE_INTERNAL_SPANS` | None |
| `O2_SERVICE_STREAMS_SAMPLE_EVERY_NTH_FILE`, `O2_SERVICE_STREAMS_MIN_CORRELATION_CONFIDENCE`, `O2_FQN_PRIORITY_DIMENSIONS` | None |

## Next steps

- [Architecture](../../architecture.md): how the components these variables tune fit together.
- [HA deployment](../deployment/ha-deployment.md): where to set these in a Helm `values.yaml`.
- [Capacity planning](../../enterprise-setup/capacity-planning.md): sizing CPU, memory, and storage per component.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)

