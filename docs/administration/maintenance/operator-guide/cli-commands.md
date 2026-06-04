---
title: CLI Commands in OpenObserve
description: Reference for the OpenObserve binary maintenance CLI commands operators use to reset data, garbage collect storage, and recover file lists.
---
# CLI Commands

The OpenObserve binary (`./openobserve`) ships with a set of maintenance subcommands that operators run from the command line to reset data, clean up storage, migrate metadata, and inspect a running cluster.

## Overview

These commands operate directly against the OpenObserve database and object storage, outside of the regular ingestion and query paths. You run them from the same host and with the same environment variables (for example `ZO_ROOT_USER_EMAIL`, `ZO_ROOT_USER_PASSWORD`, and your object storage settings) as a running OpenObserve node, because the binary reads its configuration the same way the server does.

Most subcommands follow the pattern `./openobserve <command> [options]`. Run a command with no required arguments to see its usage, or run `./openobserve --help` to list all subcommands.

Several of these commands modify or delete data. Read the safety notes for each command before running it in production, and prefer dry-run mode where it is available.

## Command summary

| Command | Purpose |
|---------|---------|
| `reset -c <component>` | Reset data for a component (root user, alerts, dashboards, functions, stream stats, file list jobs, and more). |
| `gc-file-list` | Delete stale stream files left on remote object storage past data retention. |
| `recover-file-list` | Rebuild the file list from files found in remote object storage. |
| `migrate-file-list` | Migrate `file_list` tables between databases. |
| `migrate-meta` | Migrate metadata tables between databases (excludes `file_list` tables). |
| `delete-parquet` | Delete a single parquet file from object storage and the file list. |
| `view -c <component>` | Print the stored version or the cached user list. |
| `node <subcommand>` | Manage and inspect cluster nodes. |
| `sql -e <query>` | Run an ad hoc SQL query from the command line. |

## reset

The `reset` command resets data for a single component. The component is selected with `-c` / `--component`.

```bash
./openobserve reset -c <component>
```

Available components:

| Component | What it resets |
|-----------|----------------|
| `root` | Resets the root user using `ZO_ROOT_USER_EMAIL` and `ZO_ROOT_USER_PASSWORD`. |
| `user` | Resets user data. |
| `alert` | Resets alerts. |
| `dashboard` | Deletes all dashboards. |
| `report` | Resets reports. |
| `function` | Resets functions. |
| `stream-stats` | Resets the stream stats offset and recalculates stats from the file list. |
| `file-list-jobs` | Re-queues file list jobs and resets compact offsets so compaction reruns over historical data. |
| `index-updated-at` | Resets the index `updated_at` watermark for a stream. |

### reset -c root

Resets the root user account. The new password is taken from `ZO_ROOT_USER_PASSWORD` and must meet the configured password policy, otherwise the command fails.

```bash
./openobserve reset -c root
```

> **Note**: Set `ZO_ROOT_USER_EMAIL` and `ZO_ROOT_USER_PASSWORD` in the environment before running this command. The email identifies the account to reset and the password becomes its new password.

### reset -c file-list-jobs

Re-runs compaction over a stream's historical file list. The command re-queues `file_list_jobs` rows to the pending state and resets the compact offsets, so the compactor processes the affected files again.

```bash
./openobserve reset -c file-list-jobs [-t <microseconds>] [-s <org/stream_type/stream_name>]
```

Options:

| Option | Description | Default |
|--------|-------------|---------|
| `-t`, `--time` | Reset offsets and re-queue jobs from this timestamp, in microseconds. | `0` |
| `-s`, `--stream` | Limit the reset to a single stream, in the form `org/stream_type/stream_name`. | All streams |

What the command does:

1. Checks the cluster for online dedicated compactor nodes and aborts with an error naming them if any are found.
2. If a `single_node` (Role::All) node is online, prints a warning that it must be restarted after the reset.
3. Resets the compact file offsets in the meta table to the supplied time.
4. Sets matching `file_list_jobs` rows back to pending so they are picked up again.

Examples:

```bash
# Re-run compaction for all streams from the beginning
./openobserve reset -c file-list-jobs

# Re-run from a specific microsecond timestamp
./openobserve reset -c file-list-jobs -t 1700000000000000

# Limit to a single stream
./openobserve reset -c file-list-jobs -s default/logs/app

# Combine time and stream
./openobserve reset -c file-list-jobs -t 1700000000000000 -s default/logs/app
```

> **Warning**: Stop all dedicated compactor nodes before running this command. The command refuses to run while a compactor is online to avoid concurrent processing of the jobs it is re-queuing.

> **Warning**: If you run a `single_node` (all-in-one) deployment, restart those nodes after the command finishes so their in-memory compact state is cleared.

### reset -c index-updated-at

Resets the index `updated_at` watermark. With no options it applies to all streams and uses each stream's minimum data date.

```bash
./openobserve reset -c index-updated-at [-t <microseconds>] [-s <org/stream_type/stream_name>]
```

Options:

| Option | Description | Default |
|--------|-------------|---------|
| `-t`, `--time` | Timestamp in microseconds. | Stream minimum data date |
| `-s`, `--stream` | Limit to a single stream, in the form `org/stream_type/stream_name`. | All streams |

## gc-file-list

Deletes stale stream files left on remote object storage that are past their data retention. The compactor retention job marks files as deleted in the `file_list` table but can fail to remove the physical objects from storage, leaving orphaned files behind. This command cleans up that leftover data.

```bash
./openobserve gc-file-list [-a <account>] [-s <org/stream_type/stream_name>] [-d]
```

Options:

| Option | Description | Default |
|--------|-------------|---------|
| `-a`, `--account` | Override the storage account used to list and delete. Required for `file_hash` multi-account setups. | Resolve per stream |
| `-s`, `--stream` | Clean only a specific stream, in the form `org/stream_type/stream_name`. | All streams |
| `-d`, `--dry-run` | Print what would be deleted without touching storage. | Off |

How it decides what to delete:

- The effective retention for a stream is its `data_retention` setting, falling back to `ZO_COMPACT_DATA_RETENTION_DAYS`.
- It deletes date directories whose data is entirely past the retention cutoff, so the boundary day is always preserved.
- It preserves any day that overlaps an extended retention range.

Examples:

```bash
# All streams
./openobserve gc-file-list

# A single stream
./openobserve gc-file-list -s default/logs/mystream

# Preview deletions for a single stream
./openobserve gc-file-list -s default/logs/mystream -d

# Override the storage account (file_hash multi-account setups)
./openobserve gc-file-list -a account2
```

> **Warning**: This command permanently deletes objects from remote storage. Run it with `-d` / `--dry-run` first and review the output before running it for real.

> **Note**: `gc-file-list` only works with remote object storage (s3, gcs, azure). It errors out on local disk storage.

> **Note**: Streams with an effective retention of 1 day or less are skipped as a safety guard, so the command never deletes near-current data.

## recover-file-list

Rebuilds the file list from parquet files found under a prefix in remote object storage. Use this to recover the `file_list` after metadata loss.

```bash
./openobserve recover-file-list -a <account> -p <prefix> [-i]
```

Options:

| Option | Description | Required |
|--------|-------------|----------|
| `-a`, `--account` | The storage account name. | Yes |
| `-p`, `--prefix` | Only process the given prefix. | Yes |
| `-i`, `--insert` | Insert the recovered file list into the database. Without this flag the command only reports what it finds. | No |

```bash
# Preview what would be recovered under a prefix
./openobserve recover-file-list -a default -p files/default/logs/app/

# Recover and insert into the database
./openobserve recover-file-list -a default -p files/default/logs/app/ -i
```

## migrate-file-list

Migrates the `file_list` related tables between databases, for example from SQLite to PostgreSQL.

```bash
./openobserve migrate-file-list -f <from> -t <to> [options]
```

Options:

| Option | Description | Default |
|--------|-------------|---------|
| `-f`, `--from` | Source database: `sqlite` or `postgresql`. | Required |
| `-t`, `--to` | Target database: `sqlite` or `postgresql`. | Required |
| `-b`, `--batch-size` | Batch size for migration. | `1000` |
| `--tables` | Only migrate the specified tables (comma-separated). | All |
| `--exclude` | Exclude the specified tables (comma-separated). | None |
| `--truncate-target` | Truncate target tables before migration. | Off |
| `--incremental` | Run in incremental mode. | Off |
| `--since` | Incremental start time, in microseconds. | None |
| `--dry-run` | Only print the plan, do not execute. | Off |

```bash
./openobserve migrate-file-list -f sqlite -t postgresql
```

## migrate-meta

Migrates metadata tables between databases. This excludes the `file_list` tables, which are handled by `migrate-file-list`. It accepts the same options as `migrate-file-list`.

```bash
./openobserve migrate-meta -f <from> -t <to> [options]
```

```bash
./openobserve migrate-meta -f sqlite -t postgresql
```

## delete-parquet

Deletes a single parquet file from object storage and removes its entry from the `file_list`.

```bash
./openobserve delete-parquet -f <file> [-a <account>]
```

Options:

| Option | Description | Required |
|--------|-------------|----------|
| `-f`, `--file` | The parquet file name to delete. | Yes |
| `-a`, `--account` | The storage account name. | No |

## view

Prints stored data for inspection. The component is selected with `-c` / `--component`.

```bash
./openobserve view -c <component>
```

| Component | What it prints |
|-----------|----------------|
| `version` | The stored schema/data version. |
| `user` | The cached user list. |

## node

Manages and inspects cluster nodes.

```bash
./openobserve node <subcommand>
```

| Subcommand | Description |
|------------|-------------|
| `offline` | Mark the node offline. |
| `online` | Mark the node online. |
| `flush` | Flush the memtable to disk. |
| `status` | Show node status. |
| `list` | List cached nodes. Add `-m` / `--metrics` to include node metrics. |
| `metrics` | Show local node metrics. |
| `reload` | Reload cache from the database. Use `-m` / `--module` with a comma-separated list of modules (for example `schema,user,functions`). |

```bash
# List cached nodes with metrics
./openobserve node list --metrics

# Reload specific caches from the database
./openobserve node reload -m schema,user,functions
```

## sql

Runs an ad hoc SQL query from the command line.

```bash
./openobserve sql -e "<query>" [-o <org>] [-t <time>] [-l <limit>]
```

Options:

| Option | Description | Default |
|--------|-------------|---------|
| `-e`, `--execute` | The SQL query to run. | Required |
| `-o`, `--org` | Organization name. | `default` |
| `-t`, `--time` | Time range, for example `15m`, `1h`, `1d`, `1w`, `1y`. | `15m` |
| `-l`, `--limit` | Maximum number of results (1–1000). | `10` |

```bash
./openobserve sql -e "SELECT * FROM logs" -o default -t 1h -l 50
```

## Best practices

- Run destructive commands (`reset`, `gc-file-list`, `delete-parquet`) against a non-production environment first to confirm the behavior.
- Always use `--dry-run` with `gc-file-list` before a real run.
- Stop dedicated compactor nodes before `reset -c file-list-jobs`, and restart any `single_node` deployments afterward.
- Ensure the command runs with the same environment configuration (database, object storage, root user) as your running cluster, since the binary reads its configuration the same way the server does.
