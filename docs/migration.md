# Migration

Migration can be done using OpenObserve binary as a CLI.

> Only work with <= 0.12.x, we will fix it in latest version soon.

```
./openobserve -h
OpenObserve is an observability platform that allows you to capture, search, and analyze your logs, metrics, and traces.

Usage: openobserve [COMMAND]

Commands:
  reset               reset openobserve data
  import              import openobserve data
  export              export openobserve data
  view                view openobserve data
  init-dir            init openobserve data dir
  migrate-file-list   migrate file-list
  migrate-meta        migrate meta
  migrate-dashboards  migrate-dashboards
  delete-parquet      delete parquet files from s3 and file_list
  help                Print this message or the help of the given subcommand(s)

Options:
  -h, --help     Print help
```

You must use the `migrate-meta` command to migrate meta store.

```shell
./openobserve migrate-meta -h
migrate meta

Usage: openobserve migrate-meta --from <from> --to <to>

Options:
  -f, --from <from>  migrate from: sled, sqlite, etcd, mysql, postgresql
  -t, --to <to>      migrate to: sqlite, etcd, mysql, postgresql
  -h, --help         Print help
```

You must use `migrate-file-list` command to migrate the parquet file list
```shell
./openobserve migrate-file-list -h                         
migrate file-list

Usage: openobserve migrate-file-list [OPTIONS] --from <from> --to <to>

Options:
  -p, --prefix <prefix>  only migrate specified prefix, default is all
  -f, --from <from>      migrate from: sled, sqlite, etcd, mysql, postgresql
  -t, --to <to>          migrate to: sqlite, mysql, postgresql
  -h, --help             Print help
```

There are some environments for metadata store:

```yaml
ZO_META_STORE: "postgres"
ZO_META_MYSQL_DSN: "mysql://user:password@server-address:3306/app"
ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/app"
```


## Cluster mode migration

All the commands must be run in the pod `compactor`, If you can't login into the pod, please change your image tag to `debug` version, for example:

> You are using `v0.9.1` then you can set the image to debug version `public.ecr.aws/zinclabs/openobserve:v0.9.1-debug`

Please choose the version you are using and add suffix `-debug` to the tag, If you don't know which version you are using, you can login OpenObserve UI and click `About` menu to get it.

1. Change the image tag to debug version if you are running in kubernetes.
1. Deploy MySQL / PostgreSQL first, You also can create a RDS service in the cloud, or enable postgres using our helm chart:
    ```
    postgres:
      enabled: true
    ```
    You can copy the values from: https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve/values.yaml#L521
1. Stop all the pods except `compactor`, you can scale all the other services to `0` and `compactor` to `1`, Just keep only `1` compactor.
1. Login into `compactor` pod.
1. Set following environment variables depends on you want to use MySQL or PostgreSQL
    ```shell
    $ export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/app"
    $ export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/app"
    ```
1. Run the command depends on you want to use MySQL or PostgreSQL

    If there is no `wal` directory please create it.
    ```shell
    mkdir -p data/openobserve/wal/
    ```
    > Remember change the `data/openobserve/` to your real data directory.

    ```shell
    ./openobserve migrate-meta --from etcd --to mysql
    ./openobserve migrate-meta --from etcd --to postgres
    ```
    This will migrate metadata.
    ```shell
    ./openobserve migrate-file-list --from etcd --to mysql
    ./openobserve migrate-file-list --from etcd --to postgres
    ```
    This will migrate the file list. 

1. If everything is fine then add these new environments to your deploy:

    MySQL:
    ```yaml
    ZO_META_STORE: "mysql"
    ZO_META_MYSQL_DSN: "mysql://user:password@server-address:3306/app"
    ```
    PostgreSQL:
    ```yaml
    ZO_META_STORE: "postgres"
    ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/app"
    ```

Restart OpenObserve, it should working with MySQL / PostgreSQL now. 

You can connect to the database and you will see these tables:

```
+-----------------------+
| Tables_in_openobserve |
+-----------------------+
| file_list             |
| file_list_deleted     |
| meta                  |
| scheduled_jobs        | (>= v0.10.0)
| stream_stats          |
+-----------------------+
5 rows in set (0.00 sec)
```

## Local mode migration

If you can't login into the pod, please change your image tag to `debug` version, for example:

> You are using `v0.9.1` then you can set the image to debug version `public.ecr.aws/zinclabs/openobserve:v0.9.1-debug`

Please choose the version you are using and add suffix `-debug` to the tag, If you don't know which version you are using, you can login OpenObserve UI and click `About` menu to get it.

1. Change the image tag to debug version if you are running in kubernetes.
1. Deploy MySQL / PostgreSQL first, You also can create a RDS service in the cloud.
1. Stop ingestion to avoid data write during migration.
1. Login into the pod.
1. Set following environment variables depends on you want to use MySQL or PostgreSQL
    ```shell
    $ export ZO_META_MYSQL_DSN="mysql://user:password@server-address:3306/app"
    $ export ZO_META_POSTGRES_DSN="postgres://user:password@server-address:5432/app"
    ```
1. Run the command depends on you want to use MySQL or PostgreSQL

    If there is no `wal` directory please create it.
    ```shell
    mkdir -p data/openobserve/wal/
    ```
    > Remember change the `data/openobserve/` to your real data directory.

    ```shell
    ./openobserve migrate-meta --from sqlite --to mysql
    ./openobserve migrate-meta --from sqlite --to postgres
    ```
    This will migrate metadata.
    ```shell
    ./openobserve migrate-file-list --from sqlite --to mysql
    ./openobserve migrate-file-list --from sqlite --to postgres
    ```
    This will migrate the file list. 

1. If everything is fine then add these new environments to your deploy:

    MySQL:
    ```yaml
    ZO_META_STORE: "mysql"
    ZO_META_MYSQL_DSN: "mysql://user:password@server-address:3306/app"
    ```
    PostgreSQL:
    ```yaml
    ZO_META_STORE: "postgres"
    ZO_META_POSTGRES_DSN: "postgres://user:password@server-address:5432/app"
    ```

Restart OpenObserve, it should working with MySQL / PostgreSQL now. 

You can connect to the database and you will see these tables:

```
+-----------------------+
| Tables_in_openobserve |
+-----------------------+
| file_list             |
| file_list_deleted     |
| meta                  |
| scheduled_jobs        | (>= v0.10.0)
| stream_stats          |
+-----------------------+
5 rows in set (0.00 sec)
```

## Local mode to Cluster mode

TODO
