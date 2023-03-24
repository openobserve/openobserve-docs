# Telemetry

## Why do you collect telemetry data?
We collects anonymized data from users in order to understand ZincObserve's usage and improve ZincObserve. This can be deactivated at any time, and any data that has already been collected can be deleted on request. Please send an email to admin+privacy@zinclabs.io to request deletion of the anonymized data. 

## What tools do ZincObserve uses to collect and visualize data?
We use Segment, a platform for data collection and management, to collect usage data. We then feed that data into Amplitude, a tool for graphing and highlighting data, so that we can build visualizations according to our needs.

## What Telemetry data is being collected?

| Metric                    |   Description                         | Example               |
|---------------------------|---------------------------------------|-----------------------|
| instance_id               | Unique installation id                | 7043454519337943041   |
| num_org                   | Total count of organizations          | 3                     |
| num_streams               | Total count of all streams            | 10                    |
| num_users                 | Total count of all users              | 10                    |
| streams_total_size        | Storage size of all streams(in MB)    | 6000                  |
| streams_compressed_size   | Compressed size of all streams(in MB) | 60                    |
| num_ingest_functions      | Count of ingest functions             | 5                     |
| num_query_functions       | Count of query functions              | 10                    |
| real_time_alerts          | Count of real time alerts             | 3                     |      
| scheduled_alerts          | Count of scheduled alerts             | 2                     |
| is_local_mode             | Is local mode deployment              | true/false            |
| local_mode_storage        | Storage type used for local mode      | disk/s3               |
| is_HA_mode                | Is Highly available deployment        | true/false            |
| number_of_nodes           | Count of node is HA deployment        | 4                     |
| os                        | Running operating system              | Linux                 |
| os_release                | OS release                            | 5.10.161+             |
| zo_version                | Version of ZincObserve being used     | 0.1.7                 |
| cpu_count                 | Total count of CPUs                   | 4                     |
| total_memory              | Total memory                          | 32882744              |
| free_memory               | Free memory                           | 26867176              |
| avail_memory              | Available memory                      | 30695456              |
| time_zone                 | UTC offset of timezone                | 0                     |
| host_name                 | Name of the host                      | ziox-router-6f9c6c549f|


Note: This list may change upon new releases as new features are added.

## How do I disable telemetry collection

You can set environment variable ZO_TELEMETRY=false to disable telemetry collection

## Do I need to know anything else?

We have implemented [sentry](https://sentry.io) in order to capture any errors happening and be able to fix them. It captures errors as and when they happen and sends them to sentry in order for us to analyze and fix them.

