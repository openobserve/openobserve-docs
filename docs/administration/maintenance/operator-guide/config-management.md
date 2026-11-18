---
title: Configuration Management
metaTitle: "Configuration File and Dynamic Reloading in OpenObserve"
description: Learn how to use custom config paths and dynamic config reloading in OpenObserve to apply changes without restarts.
---

This guide shows two features. First, you can load a config file from any path. Second, OpenObserve can reload some settings while it runs. Together, they let you change settings without a restart.

## Overview
Earlier versions of OpenObserve only read the **.env** file from the current
directory. You could not point to a different path. But OpenObserve runs in many
deployment modes, such as Kubernetes, virtual machines, and systemd services.
Existing frameworks often need config files in specific places. <br><br>
Also, changing a setting used to mean restarting the whole cluster or system.
Restarts are costly. They cause downtime and drop capacity and bandwidth. You do
not want to restart your whole cluster just to make a small change, such as
raising an interval by 2 seconds.
<br><br>
OpenObserve now solves both problems. A custom config file CLI argument (`-c` or
`--config`) lets you load a config file from any location. A Config Watcher
checks the config file every 30 seconds. It reloads certain settings for you, with
no restart needed.

:::note[Who should use this]
These features are for you if you:

-   Deploy OpenObserve on virtual machines (VMs).
-   Run OpenObserve as systemd services or system daemons.
-   Use custom deployment frameworks without container orchestration tools like Kubernetes.
-   Need to avoid costly restarts that cause downtime.
:::

:::note[Who does NOT need this]
You do not need these features if you:

-   Deploy OpenObserve in Kubernetes clusters.
-   Use container orchestration platforms.

**Why Kubernetes users do not need this**
<br>
In Kubernetes deployments:

-   You manage settings through ConfigMaps, Secrets, and environment variables in YAML manifests.
-   Any config change triggers pod restarts and rollouts on its own.
-   Kubernetes handles config updates with its own built-in tools.
-   Containerized deployments do not use the .env file pattern.
:::

## Custom config file CLI argument

### What it does
It adds a CLI argument to the OpenObserve binary. You use it to pass
the path to a config file. This lets you load environment variables from
different files. Earlier versions only looked for the .env file in the
current directory.

### How to use

```bash lineNumbers
# Short form
./openobserve -c /path/to/your/config/file

```

```bash lineNumbers
# Long form
./openobserve --config /path/to/your/config/file
```

## Dynamic configuration reload

### What it does
It adds a job that watches the config file. When the file changes, the
watcher reloads the settings. You can update settings without restarting
OpenObserve.

### How it works

-   It runs every 30 seconds by default. Set the `ZO_CONFIG_WATCHER_INTERVAL` environment variable to change this. A value of `0` turns off the watcher.
-   It watches the active config file. This is .env by default, or your custom file if you set one with the `-c` flag.
-   It detects changes to config values.
-   It reloads changes only for settings that support reloading.
-   If no config file exists, the watcher stays inactive.

### Workflow example

1.  OpenObserve is running with a config file.
2.  Edit the config file and change a reloadable setting. For example, change the stream stats interval from 2 to 5 seconds.
3.  Wait up to 30 seconds.
4.  The change takes effect on its own, with no restart and no downtime.

### Limitation: Only specific configs are reloadable

Only the settings in the table below reload on the fly. Any other setting
needs a full OpenObserve restart to take effect.

### Reloadable environment variables
| Category | Environment Variables |
|----------|----------------------|
| **Data Processing Intervals** | - ZO_FILE_PUSH_INTERVAL<br>- ZO_MEM_PERSIST_INTERVAL<br>- ZO_COMPACT_INTERVAL<br>- ZO_COMPACT_OLD_DATA_INTERVAL<br>- ZO_COMPACT_SYNC_TO_DB_INTERVAL<br>- ZO_COMPACT_JOB_RUN_TIMEOUT<br>- ZO_COMPACT_JOB_CLEAN_WAIT_TIME<br>- ZO_COMPACT_PENDING_JOBS_METRIC_INTERVAL |
| **Cache Management** | - ZO_MEMORY_CACHE_GC_INTERVAL<br>- ZO_MEMORY_CACHE_MAX_SIZE<br>- ZO_MEMORY_CACHE_DATAFUSION_MAX_SIZE<br>- ZO_DISK_CACHE_GC_INTERVAL<br>- ZO_DISK_CACHE_MAX_SIZE<br>- ZO_DISK_CACHE_SKIP_SIZE<br>- ZO_DISK_CACHE_RELEASE_SIZE<br>- ZO_DISK_CACHE_GC_SIZE |
| **Metrics and Monitoring** | - ZO_METRICS_LEADER_PUSH_INTERVAL<br>- ZO_METRICS_LEADER_ELECTION_INTERVAL<br>- ZO_CALCULATE_STATS_INTERVAL<br>- ZO_TELEMETRY_HEARTBEAT |
| **Scheduling** | - ZO_ALERT_SCHEDULE_INTERVAL<br>- ZO_DERIVED_STREAM_SCHEDULE_INTERVAL<br>- ZO_SCHEDULER_WATCH_INTERVAL<br>- ZO_SEARCH_JOB_SCHEDULE_INTERVAL |
| **Job and Process Timeouts** | - ZO_SEARCH_JOB_TIMEOUT<br>- ZO_SEARCH_JOB_RUN_TIMEOUT<br>- ZO_SEARCH_JOB_RETENTION<br>- ZO_SEARCH_JOB_DELETE_INTERVAL<br>- ZO_HEALTH_CHECK_TIMEOUT |
| **Memory and Buffer Sizes** | - ZO_MEMORY_CACHE_SKIP_SIZE<br>- ZO_MEMORY_CACHE_RELEASE_SIZE<br>- ZO_MEMORY_CACHE_GC_SIZE<br>- ZO_MEM_TABLE_MAX_SIZE |
| **File Sizes** | - ZO_MAX_FILE_SIZE_ON_DISK<br>- ZO_MAX_FILE_SIZE_IN_MEMORY<br>- ZO_MAX_FILE_RETENTION_TIME<br>- ZO_COMPACT_MAX_FILE_SIZE |
| **Network and Protocol Sizes** | - ZO_STREAMING_RESPONSE_CHUNK_SIZE_MB |
| **Batch Sizes** | - ZO_COMPACT_BATCH_SIZE |
| **Pipeline Configuration** | - ZO_PIPELINE_OFFSET_FLUSH_INTERVAL<br>- ZO_PIPELINE_REMOTE_REQUEST_TIMEOUT<br>- ZO_PIPELINE_WAL_SIZE_LIMIT<br>- ZO_PIPELINE_BATCH_TIMEOUT_MS<br>- ZO_PIPELINE_BATCH_SIZE_BYTES<br>- ZO_PIPELINE_BATCH_RETRY_INITIAL_DELAY_MS<br>- ZO_PIPELINE_BATCH_RETRY_MAX_DELAY_MS<br>- ZO_PIPELINE_MAX_FILE_SIZE_ON_DISK_MB |
| **WAL and Buffer Configurations** | - ZO_WAL_WRITE_BUFFER_SIZE<br>- ZO_WAL_WRITE_QUEUE_SIZE |
| **AI Configuration** | - O2_AI_ENABLED |
| **Other Configurations** | - ZO_ROUTE_MAX_CONNECTIONS<br>- ZO_ENRICHMENT_TABLE_MERGE_INTERVAL<br>- ZO_SCHEMA_MAX_FIELDS_TO_ENABLE_UDS |
