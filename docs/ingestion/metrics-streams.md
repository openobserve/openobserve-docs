---
description: Optimize metrics ingestion throughput on high-cardinality clusters by packing multiple stream partitions into large WAL files instead of one file per stream.
---

# Metrics Streams — WAL Pack

OpenObserve's ingester writes incoming data to a write-ahead log (WAL) on disk. In the default mode, each memtable rotation creates **one parquet file per stream**, which works well for logs and traces but becomes a bottleneck on clusters with hundreds of thousands of metrics streams. When you enable **WAL Pack**, OpenObserve packs many streams into a few large files, drastically reducing disk I/O and allowing the file mover to keep up.

## When to enable WAL Pack

You benefit from WAL Pack when your ingesters exhibit one or more of these symptoms:

- A large backlog of WAL files piling up under `data/wal/files/`
- The file mover cannot upload files fast enough (the `ZO_FILE_PUSH_LIMIT` ceiling is hit every cycle)
- Metrics ingestion throughput stalls even though the node has spare CPU and memory

WAL Pack applies to **metrics streams only**. Logs and traces continue using the standard per-stream persist path regardless of this flag.

## Enable WAL Pack

Set the environment variable on each **ingester** node:

```bash
ZO_FEATURE_WAL_PACK_ENABLED=true
```

No other configuration is required. The existing WAL and file-mover settings continue to govern the new path:

| Setting | Role with WAL Pack |
|---|---|
| `ZO_MAX_FILE_SIZE_ON_DISK` | Maximum size of a single pack file before rollover |
| `ZO_MAX_FILE_RETENTION_TIME` | Oldest allowable segment age before the mover flushes it |
| `ZO_FILE_PUSH_INTERVAL` | Interval at which the pack mover snapshots pending streams |
| `ZO_FILE_MOVE_THREAD_NUM` | Number of concurrent upload workers |
| `ZO_COMPACT_MAX_FILE_SIZE` | Also used as a flush threshold alongside `ZO_MAX_FILE_SIZE_ON_DISK` |

Restart your ingesters after setting the flag. Nodes without the flag continue using the legacy per-stream path — you can roll out the change gradually.

## How it works

### Persist: one file per rotation instead of one per stream

Without WAL Pack, rotating a memtable holding 50,000 streams writes 50,000 parquet files. With WAL Pack, the same rotation writes **a handful of pack files**, each containing many streams. A pack file looks like this:

```
[segment 0: parquet bytes][segment 1: parquet bytes]...[footer JSON]
[footer_len u32 LE][footer_hash u64 LE][version u16 LE][magic 8B]
```

Each segment is a **complete, self-contained parquet file** identified by stream name and partition key. The footer is a JSON index of every segment with its byte offset and length, validated by a gxhash checksum.

Pack files live at `{data_wal_dir}/pack/{idx}/{memtable_id}.{seq}.pack` and roll over at `ZO_MAX_FILE_SIZE_ON_DISK`.

### Query: in-memory segment index

On startup, OpenObserve rebuilds an in-memory segment index by reading the footer of every `.pack` file. When a query arrives for a stream, the index resolves it to the exact byte ranges inside the relevant packs. The data is read directly and materialized into record batches — no directory scans, no file listing.

Deduplication against data still in the active memtable uses the existing `memtable_ids` mechanism, so you never see the same row twice.

### Mover: snapshot-based upload

The legacy file mover walks the `wal/files` directory tree every `ZO_FILE_PUSH_INTERVAL` seconds, stats every file, and is capped by `ZO_FILE_PUSH_LIMIT`. The pack mover bypasses all of that: it snapshots the in-memory segment index, picks streams that meet the flush thresholds, and uploads directly.

A single segment is uploaded **as-is** (zero-copy, no decode/re-encode). When multiple segments are merged into one object-storage file, they are decoded, aligned to a union schema (handling schema evolution), and re-encoded as a single parquet file.

Consumed segments are tracked in `.consumed` sidecar files next to each pack, so partial progress survives a restart without re-uploading segments. Once every segment in a pack is consumed, the pack file and its sidecar are deleted.

### Crash recovery

WAL Pack uses the same lock-file recovery flow as the legacy path, adapted to handle `.pack.tmp` files:

1. On startup, `.lock` files that reference `.pack.tmp` files are resolved — the `.tmp` suffix is stripped to finalize the pack.
2. Orphan `.tmp` files (with no corresponding `.lock`) are deleted.
3. The segment index is rebuilt from the surviving `.pack` footers and `.consumed` sidecars.
4. Orphan `.par` files from the legacy path are cleaned up in a background task to avoid blocking startup on clusters with millions of files.

### Shared memtable hashing change

When `ZO_FEATURE_SHARED_MEMTABLE_ENABLED` is enabled alongside WAL Pack, the memtable-to-shard hash key changes from `{thread_id}_{org_id}` to `{org_id}_{stream_name}`. This gives each stream a stable memtable binding independent of the HTTP thread that handled the request, which produces more predictable pack sizes.

## Observability

The pack mover logs segment count, sizes, and per-stream upload timings. You can monitor the segment index size with the logs prefixed `[INGESTER:PACK]` for registration counts, pack file creation, and consumption events. The same `INGEST_WAL_*` Prometheus metrics track bytes written, read, and consumed for pack data.

## Disable WAL Pack

Remove or set the flag to `false` on all ingesters and restart them. Existing `.pack` files on disk remain searchable — the query path reads them regardless of the flag. New data resumes the legacy per-stream path immediately.
