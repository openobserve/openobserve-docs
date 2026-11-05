---
title: Migrate database
description: Migrate OpenObserve metadata and file lists between SQLite and PostgreSQL with the migrate-meta and migrate-file-list CLI commands.
---

# Migration

OpenObserve provides migration tools to transfer your metadata and file lists between database backends (SQLite and PostgreSQL). This guide walks you through the standard migration process.

> Only works with >= 0.50.0

:::warning[MySQL is no longer supported]
MySQL support was removed in v0.70.0. The `migrate-meta` and `migrate-file-list` commands now accept only `sqlite` and `postgresql` (or `postgres`), and cluster mode requires PostgreSQL. If your metadata is still in MySQL, run the MySQL to PostgreSQL migration with a release older than v0.70.0 first, then upgrade.
:::

## Overview

The migration process consists of 4 main steps:
1. Configure environment variables (set both source and target database DSN)
2. Initialize the new database with required tables
3. Migrate metadata (all tables except file_list)
4. Migrate file list data

## Migration Process

### Step 1: Configure Environment Variables

Set environment variables for **both** your source and target databases. This allows OpenObserve to read from the old database and write to the new one during migration.

**Example: Migrating from SQLite to PostgreSQL**
```shell
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"
```


#### Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ZO_META_STORE` | Target database type (`sqlite` or `postgres`) | `postgres` |
| `ZO_META_POSTGRES_DSN` | PostgreSQL connection string | `postgres://user:password@host:5432/db` |

### Step 2: Initialize New Database

Create the required tables in your target database using the `init-db` command:

```shell
ZO_META_STORE=postgres ./openobserve init-db
```

### Step 3: Migrate Metadata

Migrate all metadata tables (excluding file_list) from source to target:

```shell
./openobserve migrate-meta --from sqlite --to postgres
```

**Supported migration paths:**
- SQLite to PostgreSQL: `--from sqlite --to postgres`
- PostgreSQL to SQLite: `--from postgres --to sqlite`

**Command options:**
```shell
./openobserve migrate-meta -h
migrate meta

Usage: openobserve migrate-meta [OPTIONS] --from <from> --to <to>

Options:
  -f, --from <from>                migrate from: sqlite, postgresql
  -t, --to <to>                    migrate to: sqlite, postgresql
  -b, --batch-size <batch-size>    batch size for migration [default: 1000]
      --tables <tables>            only migrate specified tables (comma-separated)
      --exclude <exclude>          exclude specified tables (comma-separated)
      --truncate-target            truncate target tables before migration
      --incremental                incremental mode
      --since <since>              incremental start time (microseconds timestamp)
      --dry-run                    only print plan, don't execute
  -h, --help                       Print help
```

### Step 4: Migrate File List

Migrate the parquet file list data from source to target:

```shell
./openobserve migrate-file-list --from sqlite --to postgres
```

**Command options:**
```shell
./openobserve migrate-file-list -h
migrate file-list

Usage: openobserve migrate-file-list [OPTIONS] --from <from> --to <to>

Options:
  -f, --from <from>      migrate from: sqlite, postgresql
  -t, --to <to>          migrate to: sqlite, postgresql
  -h, --help             Print help
```

`migrate-file-list` takes the same `--batch-size`, `--tables`, `--exclude`, `--truncate-target`, `--incremental`, `--since` and `--dry-run` options as `migrate-meta`.

## Advanced Options

The migration commands support several advanced features:

- **Batch processing** (`--batch-size`, default `1000`): moves large tables in batches
- **Table selection** (`--tables`, `--exclude`): migrate only some tables, or skip some
- **Incremental sync** (`--incremental`, `--since <microseconds>`): copy only rows newer than a timestamp, to resume or top up a migration
- **Clean target** (`--truncate-target`): empty the target tables before copying
- **Dry run** (`--dry-run`): print the plan without changing anything

For more details on these options, refer to the command help text using the `-h` flag.

## Cluster Mode Migration

Cluster mode only supports PostgreSQL as the metadata store, so a cluster that already runs on PostgreSQL needs no migration. The steps below move a cluster from MySQL to PostgreSQL and only work on releases **older than v0.70.0**; run them before you upgrade.

### Prerequisites

1. Deploy a PostgreSQL database (or enable it via the Helm chart)
2. Change image tag to debug version if you need shell access (e.g., `v0.50.0-rc1` → `v0.50.0-rc1-debug`)
3. Scale down all services to 0 **except** compactor (keep 1 compactor pod running)
4. All migration commands must be run inside the **compactor** pod

### Migration Steps

**1. Configure Environment Variables**

Log into the compactor pod and set the required DSN variables:

```shell
export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/openobserve"
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"
```

**2. Initialize New Database**

Create the directory structure if it doesn't exist:
```shell
mkdir -p data/openobserve/wal/
```
> Replace `data/openobserve/` with your actual data directory path.

Initialize the database tables:
```shell
ZO_META_STORE=postgres ./openobserve init-db
```

**3. Migrate Metadata**

```shell
./openobserve migrate-meta --from mysql --to postgres
```

**4. Migrate File List**

```shell
./openobserve migrate-file-list --from mysql --to postgres
```

### Update Deployment Configuration

After successful migration, add the following environment variables to your deployment:

```yaml
ZO_META_STORE: "postgres"
ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/openobserve"
```

Restart OpenObserve to use the new database backend.

## Local Mode Migration

For standalone/local OpenObserve deployments:

### Prerequisites

1. Deploy a PostgreSQL database
2. Stop data ingestion to avoid writes during migration
3. Change to debug image version if you need shell access
4. Log into the OpenObserve container/pod

### Migration Steps

**1. Configure Environment Variables**

```shell
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"
```

**2. Initialize New Database**

Create the WAL directory if needed:
```shell
mkdir -p data/openobserve/wal/
```
> Replace `data/openobserve/` with your actual data directory path.

Initialize the database:
```shell
ZO_META_STORE=postgres ./openobserve init-db
```

**3. Migrate Metadata**

```shell
./openobserve migrate-meta --from sqlite --to postgres
```

**4. Migrate File List**

```shell
./openobserve migrate-file-list --from sqlite --to postgres
```

### Update Configuration

Add the environment variables to your deployment configuration:

```yaml
ZO_META_STORE: "postgres"
ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/openobserve"
```

Restart OpenObserve to use the new database.

## Verification

After completing the migration, verify success by connecting to your target database and checking for the following tables:

```
+-----------------------+
| Tables                |
+-----------------------+
| file_list             |
| file_list_deleted     |
| meta                  |
| ...                   |
| stream_stats          |
+-----------------------+
```

Also can check if we have data now:

```sql
SELECT COUNT(*) FROM meta;
SELECT COUNT(*) FROM file_list;
```

You can also check that OpenObserve starts successfully and that your data is accessible through the UI.

## Enabling PostgreSQL via Helm Chart

If deploying OpenObserve via Helm, you can enable PostgreSQL directly in your values:

```yaml
postgres:
  enabled: true
```

See the full configuration options at: https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve/values.yaml#L521
