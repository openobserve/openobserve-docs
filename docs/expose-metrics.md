# Monitoring OpenObserve

OpenObserve exposes prometheus metrics about itself that allows you to monitor OpenObserve.

endpoint: `/metrics`

## Global labels

- cluster: `ZO_CLUSTER_NAME`
- instance: `ZO_INSTANCE_NAME`
- role: `ZO_NODE_ROLE`

## Metrics

| component | metrics name            | labels | data type | desc |
|-----------|-------------------------|--------|-----------|------|
| http      | http_incoming_requests  | endpoint, status, organization, stream, stream_type | Counter   | endpoint: /_bulk, /_json, /_multi, /_search, /_around |
| -         | http_response_time      | endpoint, status, organization, stream, stream_type  | Histogram | endpoint: /_bulk, /_json, /_multi, /_search, /_around |
| grpc      | grpc_incoming_requests  | endpoint, status, organization, stream, stream_type | Counter   | endpoint: search, event |
| -         | grpc_response_time      | endpoint, status, organization, stream, stream_type | Histogram | endpoint: search, event |
| ingester  | ingest_records          | organization, stream, stream_type | Counter   | - |
| -         | ingest_bytes            | organization, stream, stream_type | Counter   | - |
| -         | ingest_wal_used_bytes   | organization, stream, stream_type | Gauge   | currently WAL total size |
| -         | ingest_wal_write_bytes  | organization, stream, stream_type | Counter   | WAL write latency |
| -         | ingest_wal_read_bytes   | organization, stream, stream_type | Counter   | WAL read latency |
| querier   | query_memory_cache_limit_bytes | - | Gauge   | - |
| -         | query_memory_cache_used_bytes  | organization, stream, stream_type | Gauge   | - |
| -         | query_memory_cache_files       | organization, stream, stream_type | Gauge   | - |
| -         | query_disk_cache_limit_bytes | - | Gauge   | - |
| -         | query_disk_cache_used_bytes  | organization, stream, stream_type | Gauge   | - |
| -         | query_disk_cache_files       | organization, stream, stream_type | Gauge   | - |
| compactor | compact_used_time       | organization, stream, stream_type | Counter | - |
| -         | compact_merged_files    | organization, stream, stream_type | Counter | - |
| -         | compact_merged_bytes    | organization, stream, stream_type | Counter | - |
| -         | compact_delay_hours     | organization, stream, stream_type | Gauge   | - |
| -         | deletion / archiving    |-                                  | -       | TODO |
| storage   | storage_original_bytes  | organization, stream, stream_type | Gauge   | Storage metrics will be updated regularly. |
| -         | storage_compressed_bytes | organization, stream, stream_type | Gauge  | - |
| -         | storage_files           | organization, stream, stream_type | Gauge   | - |
| -         | storage_records         | organization, stream, stream_type | Gauge   | - |
| -         | storage_read_requests   | organization, stream, stream_type | Counter   | - |
| -         | storage_write_requests   | organization, stream, stream_type | Counter   | - |
| -         | storage_write_bytes     | organization, stream, stream_type | Counter   | - |
| -         | storage_read_bytes      | organization, stream, stream_type | Counter   | - |
| -         | storage_time            | organization, stream, stream_type, method | Counter   | method: get, put, delete |
| metadata  | meta_storage_bytes      | -                                 | Gauge   | Metadata metrics will be updated regularly. |
| -         | meta_storage_keys       | -                                 | Gauge   | - |
| -         | meta_num_nodes          | node_role                        | Gauge   | node_role |
| -         | meta_num_organizations  | -                                 | Gauge   | - |
| -         | meta_num_streams        | organization, stream_type         | Gauge   | - |
| -         | meta_num_users_total    | -                                 | Gauge   | - |
| -         | meta_num_users          | organization                      | Gauge   | - |
| -         | meta_num_functions      | organization, stream, stream_type, function_type | Gauge   | - |
| -         | meta_num_alerts         | organization, stream, stream_type | Gauge   | TODO |
| -         | meta_num_dashboards     | organization                      | Gauge   | TODO |
