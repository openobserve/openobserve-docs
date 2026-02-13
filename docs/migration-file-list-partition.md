# Manual Migration Guide: PostgreSQL `file_list` Partition Upgrade

> For the version > v0.60.x, Please upgrade to v0.60.x first if you are using old version.

## Purpose

Use this guide when OpenObserve cannot auto-migrate `file_list` tables and enters maintenance hold.

Target tables:

- `file_list`
- `file_list_history`
- `file_list_dump_stats`

Common triggers:

- `row_count > 1,000,000`
- `MAX(date)` is greater than current UTC `YYYY/MM/DD/23`

---

## Important Behavior (Code-Accurate)

1. In `ZO_META_PARTITION_MODE=manual`, startup **skips auto migration** for regular tables (`relkind='r'`).
2. Migration renames old tables to `*_default` (not `*_old`).
3. **Sequence alignment is mandatory** after migration:
- If `setval(...)` is not executed, identity may restart from `1`.

---

## Preconditions

1. PostgreSQL 12+.
2. Migration user owns table/index objects (or superuser).
3. Execute in maintenance window.
4. Stop or drain writes before migration.
5. Backup/snapshot database before running DDL.
6. After migration, restart all OpenObserve nodes.

---

## Step 1: Check Current State

```sql
SELECT c.relname, c.relkind
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relname IN ('file_list', 'file_list_history', 'file_list_dump_stats')
ORDER BY c.relname;
-- relkind: 'r' regular, 'p' partitioned
```

If a table is already `relkind='p'`, skip that table.

---

## Step 2: Check Block Reasons

```sql
SELECT COUNT(*) AS row_count, MAX(date) AS max_date FROM file_list;
SELECT COUNT(*) AS row_count, MAX(date) AS max_date FROM file_list_history;
SELECT COUNT(*) AS row_count, MAX(date) AS max_date FROM file_list_dump_stats;
SELECT to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY/MM/DD') || '/23' AS utc_today_23;
```

If `max_date > utc_today_23`, treat as future-date anomaly.

---

## Step 3: Manual Migration SQL

Run each table block in its own transaction.

### 3.1 Migrate `file_list`

```sql
BEGIN;

-- 1) Ensure columns
ALTER TABLE file_list ADD COLUMN IF NOT EXISTS account VARCHAR(32) DEFAULT '' NOT NULL;
ALTER TABLE file_list ADD COLUMN IF NOT EXISTS flattened BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE file_list ADD COLUMN IF NOT EXISTS index_size BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE file_list ADD COLUMN IF NOT EXISTS updated_at BIGINT DEFAULT 1762819200000000 NOT NULL;

-- 1b) Widen file column to match parent schema exactly
ALTER TABLE file_list ALTER COLUMN file TYPE VARCHAR(1024);

-- 2) Rename existing indexes on old table
ALTER INDEX IF EXISTS file_list_stream_file_idx RENAME TO file_list_default_stream_file_idx;
ALTER INDEX IF EXISTS file_list_stream_ts_idx RENAME TO file_list_default_stream_ts_idx;
ALTER INDEX IF EXISTS file_list_stream_date_idx RENAME TO file_list_default_stream_date_idx;

-- 3) Cleanup
DROP INDEX IF EXISTS file_list_org_idx;
DROP INDEX IF EXISTS file_list_updated_at_deleted_idx;
DROP INDEX IF EXISTS file_list_org_deleted_stream_idx;
DROP INDEX IF EXISTS file_list_deleted_idx;
ALTER TABLE file_list DROP COLUMN IF EXISTS created_at;

-- 4) Remove IDENTITY / PK before attaching as partition
ALTER TABLE file_list ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE file_list DROP CONSTRAINT IF EXISTS file_list_pkey;

-- 5) Rename old table to DEFAULT partition name
ALTER TABLE file_list RENAME TO file_list_default;

-- 6) Create partitioned parent
CREATE TABLE file_list (
    id              BIGINT GENERATED ALWAYS AS IDENTITY,
    account         VARCHAR(32) NOT NULL,
    org             VARCHAR(100) NOT NULL,
    stream          VARCHAR(256) NOT NULL,
    date            VARCHAR(16) NOT NULL,
    file            VARCHAR(1024) NOT NULL,
    deleted         BOOLEAN DEFAULT false NOT NULL,
    flattened       BOOLEAN DEFAULT false NOT NULL,
    min_ts          BIGINT NOT NULL,
    max_ts          BIGINT NOT NULL,
    records         BIGINT NOT NULL,
    original_size   BIGINT NOT NULL,
    compressed_size BIGINT NOT NULL,
    index_size      BIGINT NOT NULL,
    updated_at      BIGINT NOT NULL
) PARTITION BY RANGE (date);

-- 7) Parent indexes
CREATE UNIQUE INDEX file_list_stream_file_idx ON file_list (stream, date, file);
CREATE INDEX file_list_id_idx ON file_list (id);
CREATE INDEX file_list_stream_ts_idx ON file_list (stream, max_ts, min_ts);
CREATE INDEX file_list_stream_date_idx ON file_list (stream, date);
CREATE INDEX file_list_updated_at_idx ON file_list (updated_at);

-- 8) Attach DEFAULT partition
ALTER TABLE file_list ATTACH PARTITION file_list_default DEFAULT;

-- 9) Date index on DEFAULT partition
CREATE INDEX IF NOT EXISTS file_list_default_date_idx ON file_list_default (date);

-- 10) Pre-create future partitions (example: tomorrow + 7 days)
-- Replace dates as needed in your maintenance window
CREATE TABLE IF NOT EXISTS file_list_p_20260214 PARTITION OF file_list FOR VALUES FROM ('2026/02/14/00') TO ('2026/02/15/00');
CREATE TABLE IF NOT EXISTS file_list_p_20260215 PARTITION OF file_list FOR VALUES FROM ('2026/02/15/00') TO ('2026/02/16/00');

-- 11) REQUIRED: align sequence to max(id)+1
SELECT setval(
    pg_get_serial_sequence('public.file_list', 'id'),
    COALESCE((SELECT MAX(id) FROM public.file_list), 0) + 1,
    false
);

COMMIT;
```

### 3.2 Migrate `file_list_history`

```sql
BEGIN;

ALTER TABLE file_list_history ADD COLUMN IF NOT EXISTS account VARCHAR(32) DEFAULT '' NOT NULL;
ALTER TABLE file_list_history ADD COLUMN IF NOT EXISTS flattened BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE file_list_history ADD COLUMN IF NOT EXISTS index_size BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE file_list_history ADD COLUMN IF NOT EXISTS updated_at BIGINT DEFAULT 1762819200000000 NOT NULL;

ALTER TABLE file_list_history ALTER COLUMN file TYPE VARCHAR(1024);

ALTER INDEX IF EXISTS file_list_history_stream_file_idx RENAME TO file_list_default_history_stream_file_idx;
ALTER INDEX IF EXISTS file_list_history_stream_ts_idx RENAME TO file_list_default_history_stream_ts_idx;
ALTER INDEX IF EXISTS file_list_history_stream_date_idx RENAME TO file_list_default_history_stream_date_idx;

DROP INDEX IF EXISTS file_list_history_org_idx;
ALTER TABLE file_list_history DROP COLUMN IF EXISTS created_at;

ALTER TABLE file_list_history ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE file_list_history DROP CONSTRAINT IF EXISTS file_list_history_pkey;

ALTER TABLE file_list_history RENAME TO file_list_history_default;

CREATE TABLE file_list_history (
    id              BIGINT GENERATED ALWAYS AS IDENTITY,
    account         VARCHAR(32) NOT NULL,
    org             VARCHAR(100) NOT NULL,
    stream          VARCHAR(256) NOT NULL,
    date            VARCHAR(16) NOT NULL,
    file            VARCHAR(1024) NOT NULL,
    deleted         BOOLEAN DEFAULT false NOT NULL,
    flattened       BOOLEAN DEFAULT false NOT NULL,
    min_ts          BIGINT NOT NULL,
    max_ts          BIGINT NOT NULL,
    records         BIGINT NOT NULL,
    original_size   BIGINT NOT NULL,
    compressed_size BIGINT NOT NULL,
    index_size      BIGINT NOT NULL,
    updated_at      BIGINT NOT NULL
) PARTITION BY RANGE (date);

CREATE UNIQUE INDEX file_list_history_stream_file_idx ON file_list_history (stream, date, file);
CREATE INDEX file_list_history_id_idx ON file_list_history (id);
CREATE INDEX file_list_history_stream_ts_idx ON file_list_history (stream, max_ts, min_ts);
CREATE INDEX file_list_history_stream_date_idx ON file_list_history (stream, date);

ALTER TABLE file_list_history ATTACH PARTITION file_list_history_default DEFAULT;
CREATE INDEX IF NOT EXISTS file_list_history_default_date_idx ON file_list_history_default (date);

CREATE TABLE IF NOT EXISTS file_list_history_p_20260214 PARTITION OF file_list_history FOR VALUES FROM ('2026/02/14/00') TO ('2026/02/15/00');
CREATE TABLE IF NOT EXISTS file_list_history_p_20260215 PARTITION OF file_list_history FOR VALUES FROM ('2026/02/15/00') TO ('2026/02/16/00');

SELECT setval(
    pg_get_serial_sequence('public.file_list_history', 'id'),
    COALESCE((SELECT MAX(id) FROM public.file_list_history), 0) + 1,
    false
);

COMMIT;
```

### 3.3 Migrate `file_list_dump_stats`

```sql
BEGIN;

ALTER TABLE file_list_dump_stats ALTER COLUMN file TYPE VARCHAR(1024);

ALTER INDEX IF EXISTS file_list_dump_stats_stream_file_idx RENAME TO file_list_dump_stats_default_stream_file_idx;

DROP INDEX IF EXISTS file_list_dump_stats_org_idx;

ALTER TABLE file_list_dump_stats ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE file_list_dump_stats DROP CONSTRAINT IF EXISTS file_list_dump_stats_pkey;

ALTER TABLE file_list_dump_stats RENAME TO file_list_dump_stats_default;

CREATE TABLE file_list_dump_stats (
    id              BIGINT GENERATED ALWAYS AS IDENTITY,
    org             VARCHAR(100) NOT NULL,
    stream          VARCHAR(256) NOT NULL,
    date            VARCHAR(16) NOT NULL,
    file            VARCHAR(1024) NOT NULL,
    file_num        BIGINT DEFAULT 0 NOT NULL,
    min_ts          BIGINT DEFAULT 0 NOT NULL,
    max_ts          BIGINT DEFAULT 0 NOT NULL,
    records         BIGINT DEFAULT 0 NOT NULL,
    original_size   BIGINT DEFAULT 0 NOT NULL,
    compressed_size BIGINT DEFAULT 0 NOT NULL,
    index_size      BIGINT DEFAULT 0 NOT NULL
) PARTITION BY RANGE (date);

CREATE UNIQUE INDEX file_list_dump_stats_stream_file_idx ON file_list_dump_stats (stream, date, file);
CREATE INDEX file_list_dump_stats_id_idx ON file_list_dump_stats (id);

ALTER TABLE file_list_dump_stats ATTACH PARTITION file_list_dump_stats_default DEFAULT;
CREATE INDEX IF NOT EXISTS file_list_dump_stats_default_date_idx ON file_list_dump_stats_default (date);

CREATE TABLE IF NOT EXISTS file_list_dump_stats_p_20260214 PARTITION OF file_list_dump_stats FOR VALUES FROM ('2026/02/14/00') TO ('2026/02/15/00');
CREATE TABLE IF NOT EXISTS file_list_dump_stats_p_20260215 PARTITION OF file_list_dump_stats FOR VALUES FROM ('2026/02/15/00') TO ('2026/02/16/00');

SELECT setval(
    pg_get_serial_sequence('public.file_list_dump_stats', 'id'),
    COALESCE((SELECT MAX(id) FROM public.file_list_dump_stats), 0) + 1,
    false
);

COMMIT;
```

---

## Step 4: Future Partition Creation Template

If you want to generate tomorrow..+7 dynamically:

```sql
DO $$
DECLARE
  d date := CURRENT_DATE + 1;  -- adjust if needed
  end_d date := CURRENT_DATE + 7;
BEGIN
  WHILE d <= end_d LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF file_list FOR VALUES FROM (%L) TO (%L)',
      'file_list_p_' || to_char(d, 'YYYYMMDD'),
      to_char(d, 'YYYY/MM/DD') || '/00',
      to_char(d + 1, 'YYYY/MM/DD') || '/00'
    );

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF file_list_history FOR VALUES FROM (%L) TO (%L)',
      'file_list_history_p_' || to_char(d, 'YYYYMMDD'),
      to_char(d, 'YYYY/MM/DD') || '/00',
      to_char(d + 1, 'YYYY/MM/DD') || '/00'
    );

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF file_list_dump_stats FOR VALUES FROM (%L) TO (%L)',
      'file_list_dump_stats_p_' || to_char(d, 'YYYYMMDD'),
      to_char(d, 'YYYY/MM/DD') || '/00',
      to_char(d + 1, 'YYYY/MM/DD') || '/00'
    );

    d := d + 1;
  END LOOP;
END $$;
```

If creation fails with default overlap, move start day forward or clean overlap range in `*_default` first.

---

## Step 5: Validation

```sql
SELECT c.relname, c.relkind
FROM pg_class c
WHERE c.relnamespace = 'public'::regnamespace
  AND c.relname IN ('file_list', 'file_list_history', 'file_list_dump_stats')
ORDER BY c.relname;
-- expect relkind='p'
```

```sql
SELECT parent.relname AS parent_table, child.relname AS partition_table
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child  ON pg_inherits.inhrelid = child.oid
WHERE parent.relname IN ('file_list', 'file_list_history', 'file_list_dump_stats')
ORDER BY parent.relname, child.relname;
```

Sequence alignment check:

```sql
SELECT
  (SELECT last_value FROM file_list_id_seq) AS file_list_seq,
  (SELECT MAX(id) FROM file_list) AS file_list_max_id,
  (SELECT last_value FROM file_list_history_id_seq) AS file_list_history_seq,
  (SELECT MAX(id) FROM file_list_history) AS file_list_history_max_id,
  (SELECT last_value FROM file_list_dump_stats_id_seq) AS file_list_dump_stats_seq,
  (SELECT MAX(id) FROM file_list_dump_stats) AS file_list_dump_stats_max_id;
```

Optional stats refresh:

```sql
ANALYZE file_list;
ANALYZE file_list_history;
ANALYZE file_list_dump_stats;
```

---

## Step 6: Resume Service

1. Restart all OpenObserve nodes.
2. Confirm startup no longer logs maintenance hold.
3. Confirm new writes land in daily partitions, not only `*_default`.

---

## Rollback Notes

- If SQL in a table block fails, `ROLLBACK` that block and fix cause.
- If one table succeeded and next failed, continue from remaining tables.
- Do not drop user data to bypass default overlap unless explicitly approved.
