---
title: Telemetry
description: Learn what anonymized telemetry data OpenObserve collects, how it’s used to improve the product, and how to disable or request deletion at any time.
---

# Telemetry

## Why do you collect telemetry data?
We collect anonymized data from users in order to understand OpenObserve's usage and improve OpenObserve. This can be deactivated at any time, and any data that has already been collected can be deleted on request. Please send an email to admin+privacy@zinclabs.io to request deletion of the anonymized data. 

## What tools do OpenObserve uses to collect and visualize data?
OpenObserve sends usage events in the Segment format to the endpoint set by `ZO_TELEMETRY_URL` (default `https://e1.zinclabs.dev`), identified only by a random instance ID. We then feed that data into Amplitude, a tool for graphing and highlighting data, so that we can build visualizations according to our needs.

## What Telemetry data is being collected?

| Metric                    |   Description                         | Example               |
|---------------------------|---------------------------------------|-----------------------|
| instance_id               | Unique installation id                | 7043454519337943041   |
| num_org                   | Total count of organizations          | 3                     |
| num_streams               | Total count of all streams            | 10                    |
| num_users                 | Total count of all users              | 10                    |
| num_logs_streams          | Count of logs streams                 | 6                     |
| num_metrics_streams       | Count of metrics streams              | 4                     |
| num_dashboards            | Count of dashboards                   | 5                     |
| streams_total_size_mb     | Storage size of all streams (in MB)   | 6000                  |
| streams_compressed_size_mb | Compressed size of all streams (in MB) | 60                  |
| logs_orig_size, metrics_orig_size, traces_orig_size | Original size per stream type (in MB) | 4000 |
| logs_compressed_size, metrics_compressed_size, traces_compressed_size | Compressed size per stream type (in MB) | 40 |
| num_query_functions       | Count of query functions              | 10                    |
| real_time_alerts          | Count of real-time alerts             | 3                     |
| scheduled_alerts          | Count of scheduled alerts             | 2                     |
| is_local_mode             | Is local mode deployment              | true/false            |
| local_mode_storage        | Storage type used for local mode      | disk/s3               |
| is_HA_mode                | Is Highly available deployment        | true/false            |
| number_of_nodes           | Count of nodes in HA deployment       | 4                     |
| querier_nodes, ingester_nodes | Count of querier and ingester nodes | 2                  |
| os                        | Running operating system              | Linux                 |
| os_release                | OS release                            | 5.10.161+             |
| zo_version                | Version of OpenObserve being used     | 0.1.7                 |
| deployment_type           | Open source or enterprise build       | open_source           |
| meta_store                | Metadata store in use                 | sqlite                |
| cluster_coordinator       | Cluster coordinator in use            | nats                  |
| cpu_count                 | Total count of CPUs                   | 4                     |
| total_memory              | Total memory                          | 32882744              |
| free_memory               | Free memory                           | 26867176              |
| time_zone                 | UTC offset of timezone                | 0                     |
| host_name                 | Instance name (`ZO_INSTANCE_NAME`)    | ziox-router-6f9c6c549f|


Note: This list may change upon new releases as new features are added.

## How do I disable telemetry collection

Set the environment variable `ZO_TELEMETRY=false` to disable telemetry collection. The default is `true`.

