
We prefer environment variables for configuration as opposed to configuration files or command line options as its easier to provide environment variables in a containerized environment as well as local setup.


| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZINC_FIRST_ADMIN_USER         | -             | On first run  | First admin user of ZincSearch. Not required after first run of ZincSearch.  |
| ZINC_FIRST_ADMIN_PASSWORD     | -             | On first run  | Password for first admin user                                             |
| ZINC_SERVER_ADDRESS           | 0.0.0.0       | No            | ZincSearch server IP address to bind to                                         |
| ZINC_SERVER_PORT              | 4080          | No            | ZincSearch server listen http port                                              |
| GIN_MODE                      | -             | No            | if the value is release then gin will run in production mode.             |
| ZINC_DATA_PATH                | ./data        | No            | Defaults to "data" folder in current working directory if not provided.   |
| ZINC_ICE_COMPRESSOR           | zstd          | No            | Algorithm of compress segment file, default is: zstd, supports: snappy, s2, zstd |
| ZINC_S3_BUCKET                | -             | No            | (deprecated) S3 bucket to be used for index storage                                    |
| ZINC_MINIO_ENDPOINT           | -             | No            | (deprecated) MinIO server endpoint. e.g localhost:9000 . See no http                   |
| ZINC_MINIO_ACCESS_KEY_ID      | -             | No            | (deprecated) MinIO ACCESS_KEY_ID                                                       |
| ZINC_MINIO_SECRET_ACCESS_KEY  | -             | No            | (deprecated) MinIO SECRET_ACCESS_KEY                                                   |
| ZINC_MINIO_BUCKET             | -             | No            | (deprecated) MinIO bucket for index storage                                            |
| ZINC_MAX_RESULTS              | 100           | No            | Maximum results to be returned from server. Defaults to 1000              |
| ZINC_BATCH_SIZE               | 1024          | No            | Internal batch size for batching records when bulk indexing is done.      |
| ZINC_AGGREGATION_TERMS_SIZE   | 1000          | No            | terms aggregation returns max bucket size                                 |
| ZINC_SHARD_NUM                | 3             | No            | We use shards to improve performance                                      |
| ZINC_SHARD_MAX_SIZE           | 1073741824    | No            | We use multiple backend indexes for one big index, limit one shard size default is 1GB |
| ZINC_READ_GORUTINE_NUM        | 10            | No            | control parallelsim thread num for shard reads                            |
| ZINC_TELEMETRY                | true          | No            | Send anonymous telemetry info for improving ZincSearch. enabled or disabled.  |
| ZINC_SENTRY                   | true          | No            | Send anonymous error reports for debugging                                |
| ZINC_SENTRY_DSN               | -             | No            | Entry DNS, default is: https://15b6d9b8be824b44896f32b0234c32b7@o1218932.ingest.sentry.io/6360942 |
| ZINC_PROMETHEUS_ENABLE        | false         | No            | Enables prometheus metrics on /metrics endpoint                           |
| ZINC_PLUGIN_ES_VERSION        | -             | No            | es version, for compatible elasticsearch                                  |
| ZINC_PLUGIN_GSE_ENABLE        | false         | No            | plugin, GSE support Chinese analysis                                      |
| ZINC_PLUGIN_GSE_DICT_EMBED    | small         | No            | plugin, GSE which size dict need to load, `small` or `big`                |
| ZINC_PLUGIN_GSE_DICT_PATH     | ./plugins/gse/dict     | No   | plugin, GSE where to load user custom dictionary                          |
| ZINC_PROFILER                 | false         | No            | Default is false, ZincObserve uses pyroscope server to profiling                    |
| ZINC_PROFILER_SERVER          | -             | No            | default pyroscope server is: https://pyroscope.dev.zincsearch.com         |
| ZINC_PROFILER_API_KEY         | -             | No            | pyroscope server api key                                                  |
| ZINC_PROFILER_FRIENDLY_PROFILE_ID | -         | No            | pyroscope identifier id, example: zinc-alex                               |
| ZINC_ENABLE_TEXT_KEYWORD_MAPPING | false      | No            | create a keyword field for text field. named `field.keyword`              |
| ZINC_WAL_SYNC_INTERVAL        | 1s            | No            | ZincObserve uses WAL to ensure not loss data, and asynchorous write to backend index, default every 1s sync to storage |
| ZINC_WAL_REDOLOG_NO_SYNC      | false         | No            | ZincObserve uses REDO log to ensure asynchorous is correct, but redo log do a sync to disk every time, we can disable SYNC to have better performance, but it have a rist maybe dumplicated documents with a ZINC_BATCH_SIZE |

