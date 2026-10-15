---
title: Dynamic Merge
description: Reduce small-file overhead in low-volume streams by merging the files of a finished day into fewer, larger files with the Dynamic Merge stream setting and its environment-variable default.
---

Dynamic Merge lets the compactor merge the files of a finished day across hours, so low-volume streams hold fewer, larger files instead of many small ones. Enable it globally with an environment variable, or override it per stream with the `dynamic_merge` stream setting.

## What is Dynamic Merge

In OpenObserve, the compactor merges small files into larger ones to reduce the overhead of storing and querying many small files. By default, compaction works within a single hour. Dynamic Merge extends compaction so that the files of an entire finished day are merged across hours — useful for low-volume streams whose day holds many more files than the size of the data actually needs.

This page describes the controls and the query-side behavior. Enabling Dynamic Merge changes how file-list queries bound their `max_ts` so that short queries still find the merged files, which can now span up to a day.

## How it works

When Dynamic Merge is enabled for a stream:

- The compactor treats a finished day of that stream as a single merge unit, merging its files across hours.
- Queries over that stream widen their `max_ts` upper bound to a day, because a merged file can span a full day. Without this, a short query would not select the file and would miss its data.

For streams where Dynamic Merge is not enabled, queries keep the existing per-type retention bound from `ZO_LOGS_QUERY_RETENTION`, `ZO_TRACES_QUERY_RETENTION`, or `ZO_METRICS_QUERY_RETENTION`.

The file-list dump search also uses a daily bound for `Filelist` dump streams, because the dump file of a merged day spans that day.

## Enable Dynamic Merge globally

Set the environment variable `ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES` to a comma-separated list of the stream types whose closed days the compactor should merge across hours.

| Value | Effect |
|-------|--------|
| `""` (empty, default) | Dynamic Merge is disabled; behavior is unchanged |
| `logs` | Enable Dynamic Merge for logs streams |
| `logs,metrics` | Enable Dynamic Merge for logs and metrics streams |
| `logs,metrics,traces` | Enable Dynamic Merge for all three supported types |

Only `logs`, `metrics`, and `traces` are accepted. Any other value fails at startup.

```env
ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES=logs,metrics
```

## Enable Dynamic Merge per stream

Use the `dynamic_merge` stream setting to override the environment-variable list for a single stream. The setting is available for logs, metrics, and traces streams only.

On the **Stream Details** page, open the **Configuration** tab. The **Dynamic Merge** switch sits alongside **Data Retention**.

![TODO: screenshot of the Dynamic Merge switch in the stream Configuration tab](images/placeholder.png)

| Stream state | What the switch shows | Meaning |
|--------------|-----------------------|---------|
| Never set (key absent) | Off, with a **default** label | The stream follows `ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES` |
| Set to `true` | On | Closed days of this stream are merged across hours |
| Set to `false` | Off | Never merged across hours, even if the server default enables the type |

Once you change the switch, the stream keeps its own value. There is no "back to default": the update API treats a missing key and `null` as unchanged, like every other stream setting.

:::note[Note]
Turning a stream off after it was on does not undo merges that have already happened. Existing merged files remain; the setting only controls future compaction.
:::

## Configure via API

The setting is returned by the stream schema endpoint only when it has been set. A missing key means the stream was never set.

```
GET /api/{org_id}/streams/{stream_name}/schema?type=logs
```

```json
{
  "settings": {
    "dynamic_merge": true
  }
}
```

Set it with the stream settings endpoint:

```
PUT /api/{org_id}/streams/{stream_name}/settings?type=logs
```

| Payload | Effect |
|---------|--------|
| `"dynamic_merge": true` | Enable Dynamic Merge for this stream |
| `"dynamic_merge": false` | Disable Dynamic Merge for this stream |
| Key absent or `"dynamic_merge": null` | Unchanged |

Sending a boolean for any other stream type returns `400` with `dynamic_merge is only supported for logs, metrics and traces streams`.

## Turning Dynamic Merge off

Nothing records that a stream once had merged days. If you remove a type from `ZO_COMPACT_DYNAMIC_MERGE_STREAM_TYPES`, short queries over already merged days no longer find their files, because the daily query bound is gone.

To keep short queries working over already merged days, set the corresponding query retention to daily when you remove a type:

```env
ZO_LOGS_QUERY_RETENTION=daily
```

Metrics query retention already defaults to daily, so metrics queries are unaffected by removing the type.
