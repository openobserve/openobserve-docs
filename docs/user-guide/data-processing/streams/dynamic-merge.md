---
title: Dynamic Merge
description: Merge a finished day's small files across hours in low-volume streams, set globally with an environment variable or per stream.
---

Dynamic Merge lets the compactor merge a finished day's files across hours, so low-volume streams keep fewer, larger files. It applies to logs, metrics, and traces streams.

## Enable globally

Set `ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES` to the stream types to merge. It is empty (off) by default, and any value other than `logs`, `metrics`, or `traces` fails at startup.

```env
ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES=logs,metrics
```

## Override per stream

On **Stream Details** > **Configuration**, use the **Dynamic Merge** switch. While it shows **default**, the stream follows the environment variable; once you change it, the stream keeps its own value.

![TODO: screenshot of the Dynamic Merge switch in the stream Configuration tab](images/placeholder.png)

Through the API, send `"dynamic_merge": true` or `false` in the stream settings:

```
PUT /api/{org_id}/streams/{stream_name}/settings?type=logs
```

:::warning[Turning it off]
Merged files can span a whole day, so queries over merged streams search a daily window. If you remove a type from the environment variable, short queries stop finding already merged days. Set that type's query retention to daily, for example `ZO_LOGS_QUERY_RETENTION=daily`, to keep them searchable. Metrics already default to daily.
:::
