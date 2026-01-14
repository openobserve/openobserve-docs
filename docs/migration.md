---
description: >-
  Migrate OpenObserve metadata and file lists using CLI with support for MySQL,
  PostgreSQL, and multiple backends via migrate-meta and migrate-file-list.
---
# Migration

OpenObserve provides migration tools to transfer your metadata and file lists between different database backends (SQLite, MySQL, PostgreSQL). This guide walks you through the standard migration process.

> Only works with >= 0.50.0

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

**Example: Migrating from MySQL to PostgreSQL**
```shell
export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/openobserve"
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"
```

#### Available Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ZO_META_STORE` | Target database type (sqlite/mysql/postgres) | `postgres` |
| `ZO_META_MYSQL_DSN` | MySQL connection string | `mysql://user:password@host:3306/db` |
| `ZO_META_POSTGRES_DSN` | PostgreSQL connection string | `postgres://user:password@host:5432/db` |

### Step 2: Initialize New Database

Create the required tables in your target database using the `init-db` command:

```shell
ZO_META_STORE=postgres ./openobserve init-db
```

Replace `postgres` with `mysql` if migrating to MySQL.

### Step 3: Migrate Metadata

Migrate all metadata tables (excluding file_list) from source to target:

```shell
./openobserve migrate-meta --from sqlite --to postgres
```

**Common migration paths:**
- SQLite to PostgreSQL: `--from sqlite --to postgres`
- SQLite to MySQL: `--from sqlite --to mysql`
- MySQL to PostgreSQL: `--from mysql --to postgres`

**Command options:**
```shell
./openobserve migrate-meta -h
migrate meta

Usage: openobserve migrate-meta --from <from> --to <to>

Options:
  -f, --from <from>  migrate from: sqlite, mysql, postgresql
  -t, --to <to>      migrate to: sqlite, mysql, postgresql
  -h, --help         Print help
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

Usage: openobserve migrate-file-list --from <from> --to <to>

Options:
  -f, --from <from>      migrate from: sqlite, mysql, postgresql
  -t, --to <to>          migrate to: sqlite, mysql, postgresql
  -h, --help             Print help
```

## Advanced Options

The migration commands support several advanced features:

- **Batch Processing**: Automatically handles large datasets in configurable batches
- **Incremental Syncing**: Uses timestamp-based filtering to resume partial migrations
- **Dry-Run Mode**: Test migrations without executing actual changes
- **Progress Tracking**: Real-time feedback on migration status

For more details on these options, refer to the command help text using the `-h` flag.

## Cluster Mode Migration

For OpenObserve running in cluster/Kubernetes mode, follow these steps:

### Prerequisites

1. Deploy MySQL or PostgreSQL database (or enable via helm chart)
2. Change image tag to debug version if you need shell access (e.g., `v0.50.0-rc1` → `v0.50.0-rc1-debug`)
3. Scale down all services to 0 **except** compactor (keep 1 compactor pod running)
4. All migration commands must be run inside the **compactor** pod

### Migration Steps

**1. Configure Environment Variables**

Log into the compactor pod and set the required DSN variables:

```shell
# For migrating from etcd to PostgreSQL
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"

# For migrating from etcd to MySQL
export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/openobserve"
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
# To PostgreSQL
./openobserve migrate-meta --from etcd --to postgres

# To MySQL
./openobserve migrate-meta --from etcd --to mysql
```

**4. Migrate File List**

```shell
# To PostgreSQL
./openobserve migrate-file-list --from etcd --to postgres

# To MySQL
./openobserve migrate-file-list --from etcd --to mysql
```

### Update Deployment Configuration

After successful migration, add the following environment variables to your deployment:

**For PostgreSQL:**
```yaml
ZO_META_STORE: "postgres"
ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/openobserve"
```

**For MySQL:**
```yaml
ZO_META_STORE: "mysql"
ZO_META_MYSQL_DSN: "mysql://user:password@server-address:3306/openobserve"
```

Restart OpenObserve to use the new database backend.

## Local Mode Migration

For standalone/local OpenObserve deployments:

### Prerequisites

1. Deploy MySQL or PostgreSQL database
2. Stop data ingestion to avoid writes during migration
3. Change to debug image version if you need shell access
4. Log into the OpenObserve container/pod

### Migration Steps

**1. Configure Environment Variables**

```shell
# For PostgreSQL
export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/openobserve"

# For MySQL
export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/openobserve"
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
# To PostgreSQL
./openobserve migrate-meta --from sqlite --to postgres

# To MySQL
./openobserve migrate-meta --from sqlite --to mysql
```

**4. Migrate File List**

```shell
# To PostgreSQL
./openobserve migrate-file-list --from sqlite --to postgres

# To MySQL
./openobserve migrate-file-list --from sqlite --to mysql
```

### Update Configuration

Add the environment variables to your deployment configuration:

**For PostgreSQL:**
```yaml
ZO_META_STORE: "postgres"
ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/openobserve"
```

**For MySQL:**
```yaml
ZO_META_STORE: "mysql"
ZO_META_MYSQL_DSN: "mysql://user:password@server-address:3306/openobserve"
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
