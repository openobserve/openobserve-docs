> Applicable to open source & enterprise version

There are 2 primary items that need to be stored in OpenObserve.

1. Ingested stream data
1. Metadata of ingested stream data

Metadata for stream data is always stored:

1. on disk for `Local mode` in `sqlite` 
1. in `etcd/mysql/postgres` for `Cluster mode`. etcd is highly discouraged and `postgres` is recommended.

Stream data can be stored on disk, s3, minIO and other compatible s3 API object storages, like: Google GCS, Alibaba OSS, Tencent COS.

Tips:

1. Default OpenObserve runs as `Local mode`, you can set `LOCAL_MODE=false` to enable `Cluster mode`.
1. In `Local mode` it also can use `s3` as storage, you can set `ZO_LOCAL_MODE_STORAGE=s3` to storage data in s3.
1. For GCS, OSS they all support `s3` SDK, so you can think of them as s3 for all practical purposes. GCS is also supported if s3 is not suitable for you. Azure blob is also supported.

## Data

Data is stored in parquet format, which is columnar storage format, it is efficient for query and storage. 

### Disk

Disk is default storage place for stream data, make sure you have enough storage available on your disk for stream data storage. During data ingestion the stream name that you provide may not be present, in that case a new folder for stream will be created automatically for storing the stream data.

### S3

To use S3 for storing stream data following needs to be done:

- Make AWS IAM credentials available to OpenObserve by any supported mechanisms. OpenObserve uses AWS SDK which looks for credentials through:

  - Environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (Not recommended due to security concerns)
  - Your aws CLI credentials stored in ~/.aws/credentials
  - Instance metadata on an EC2 Instance/Fargate container/ECS container. You do this providing an IAM role to an EC2 instance or a task role to an ECS task - IMDS/IMDSv2 . ECS is not recommended as it does not have support for stateful workloads off EBS as of now.
  - IAM Roles for service Accounts in EKS

> You need to create the bucket in S3 first.

### MinIO

OpenObserve can use MinIO for storing stream data, following environment variables needs to be setup:

| Environment Variable | Value | Description                                     |
| -------------------- | ----- | ----------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | minIO server address                            |
| ZO_S3_REGION_NAME    | -     | region name, can be anything, like: `us-west-1` |
| ZO_S3_ACCESS_KEY     | -     | access key                                      |
| ZO_S3_SECRET_KEY     | -     | secret key                                      |
| ZO_S3_BUCKET_NAME    | -     | bucket name                                     |
| ZO_S3_PROVIDER       | minio    | used to specify settings like force_style=true  |

> You need to create the bucket in MinIO first.

### Openstack Swift

OpenObserve can use Openstack swift for storing stream data, following environment variables needs to be setup:

| Environment Variable      | Value | Description                                     |
| ------------------------- | ----- | ----------------------------------------------- |
| ZO_S3_SERVER_URL          | -     | swift server address, like: `https://us-west-1.xxx.com`   |
| ZO_S3_REGION_NAME         | -     | region name, can be anything, like: `us-west-1` |
| ZO_S3_ACCESS_KEY          | -     | access key                                      |
| ZO_S3_SECRET_KEY          | -     | secret key                                      |
| ZO_S3_BUCKET_NAME         | -     | bucket name                                     |
| ZO_S3_FEATURE_HTTP1_ONLY  | true  | --                                              |
| ZO_S3_PROVIDER            | s3    | Use s3 compatible API                           |
| AWS_EC2_METADATA_DISABLED | true  | swift doesn't support ec2 metadata, **Usually you don't need this**   |

> You need to create the bucket in swift first.

### Google GCS

OpenObserve can use google cloud storage for storing stream data, following environment variables needs to be setup:
Using S3 api:

| Environment Variable     | Value  | Description                                                     |
| ------------------------ | -------| --------------------------------------------------------------- |
| ZO_S3_SERVER_URL         | -      | gcs server address. should be: `https://storage.googleapis.com` |
| ZO_S3_REGION_NAME        | -      | region name, gcs region name, or: `auto`                        |
| ZO_S3_ACCESS_KEY         | -      | access key                                                      |
| ZO_S3_SECRET_KEY         | -      | secret key                                                      |
| ZO_S3_BUCKET_NAME        | -      | bucket name                                                     |
| ZO_S3_FEATURE_HTTP1_ONLY | true   | --                                                              |
| ZO_S3_PROVIDER           | s3     | Use s3 compatible API                                           |


You can refer to: [https://cloud.google.com/storage/docs/aws-simple-migration](https://cloud.google.com/storage/docs/aws-simple-migration)

Or you can use gcs directly:

| Environment Variable     | Value  | Description                                                             |
| ------------------------ | -------| ----------------------------------------------------------------------- |
| ZO_S3_SERVER_URL         | -      | gcs server address. should be: `https://storage.googleapis.com`         |
| ZO_S3_REGION_NAME        | -      | region name, gcs region name, or: `auto`                                |
| ZO_S3_ACCESS_KEY         | -      | Path to gcp json private key if not available through instance metadata |
| ZO_S3_BUCKET_NAME        | -      | bucket name                                                             |
| ZO_S3_PROVIDER           | gcs    | Use gcs api                                                             |

Under the hood [object_store crate](https://docs.rs/object_store/0.10.1/object_store/gcp/struct.GoogleCloudStorageBuilder.html) is used through `with_env()` function and if `ZO_S3_ACCESS_KEY` is set also with `with_service_account_path()` function

### Alibaba OSS (aliyun)

OpenObserve can use Alibaba(aliyun) OSS for storing stream data, following environment variables needs to be setup:

| Environment Variable           | Value | Description                                                     |
| ------------------------------ | ----- | --------------------------------------------------------------- |
| ZO_S3_SERVER_URL               | -     | oss endpoint address, eg: `https://bucketname.oss-ap-southeast-1.aliyuncs.com` |
| ZO_S3_REGION_NAME              | -     | region name, oss region name, eg: `oss-cn-beijing`.             |
| ZO_S3_BUCKET_NAME              | -     | bucket name                                                     |
| ZO_S3_ACCESS_KEY               | -     | access key                                                      |
| ZO_S3_SECRET_KEY               | -     | secret key                                                      |
| ZO_S3_FEATURE_FORCE_PATH_STYLE | true  | --                                                              |

You can refer to: [https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints](https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints)

### Tencent COS

OpenObserve can use tencent cloud storage for storing stream data, following environment variables needs to be setup:

| Environment Variable | Value | Description                  |
| -------------------- | ----- | ---------------------------- |
| ZO_S3_SERVER_URL     | -     | cos endpoint address         |
| ZO_S3_REGION_NAME    | -     | region name, cos region name |
| ZO_S3_ACCESS_KEY     | -     | access key                   |
| ZO_S3_SECRET_KEY     | -     | secret key                   |
| ZO_S3_BUCKET_NAME    | -     | bucket name                  |

You can refer to: [https://cloud.tencent.com/document/product/436/37421](https://cloud.tencent.com/document/product/436/37421)

### UCloud US3

OpenObserve can use ucloud cloud storage for storing stream data, following environment variables needs to be setup:

| Environment Variable | Value | Description                                          |
| -------------------- | ----- | ---------------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | us3 endpoint address, eg: `http://internal.s3-sg.ufileos.com` |
| ZO_S3_ACCESS_KEY     | -     | access key                                           |
| ZO_S3_SECRET_KEY     | -     | secret key                                           |
| ZO_S3_BUCKET_NAME    | -     | bucket name                                          |
| ZO_S3_FEATURE_HTTP1_ONLY    | true     | --                                          |

You can refer to: [https://docs.ucloud.cn/ufile/s3/s3_introduction](https://docs.ucloud.cn/ufile/s3/s3_introduction)

### Baidu BOS

OpenObserve can use baidu cloud storage for storing stream data, following environment variables needs to be setup:

| Environment Variable | Value | Description                                          |
| -------------------- | ----- | ---------------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | bos endpoint address, eg: `https://s3.bj.bcebos.com` |
| ZO_S3_REGION_NAME    | -     | region name, bos region name, eg: `bj`               |
| ZO_S3_ACCESS_KEY     | -     | access key                                           |
| ZO_S3_SECRET_KEY     | -     | secret key                                           |
| ZO_S3_BUCKET_NAME    | -     | bucket name                                          |

You can refer to: [https://cloud.baidu.com/doc/BOS/s/xjwvyq9l4](https://cloud.baidu.com/doc/BOS/s/xjwvyq9l4)

### Azure Blob

OpenObserve can use azure blob for storing stream data. Following environment variables needs to be setup:

| Environment Variable       | Value                | Description                                  |
| -------------------------- | -------------------- | -------------------------------------------- |
| ZO_S3_PROVIDER             | azure                | Azure blob storage provider                   |
| ZO_LOCAL_MODE_STORAGE      | s3                   | Required only if running in single node mode |
| AZURE_STORAGE_ACCOUNT_NAME | Storage account name | Need to provide mandatorily                  |
| AZURE_STORAGE_ACCOUNT_KEY  | Access key           | Need to provide mandatorily                  |
| ZO_S3_BUCKET_NAME          | Blob Container name  | Need to provide mandatorily                  |


## Metadata

Default meta store is SQLite and can be changed by using `ZO_META_STORE` environment variable.

### etcd

`ZO_META_STORE=etcd`

While etcd is used as the cluster coordinator it is also set as the default meta store by the older helm charts. Newer helm charts released after Feb 23 2024 use postgres as the meta store.

### SQLite

`ZO_META_STORE=sqlite`

Installations running on a single node can use SQLite as metadata store. You do not need to take any extra steps to use SQLite. This is generally not recommended as losing the SQLite data will causing OpenObserve to not operate.

### PostgreSQL

`ZO_META_STORE=postgres`

This is the recommended meta store as it is more reliable and scalable. A lot of service providers provide managed postgres service that you can rely upon.

Default helm chart released after Feb 23, 2024 use [cloudnative-pg](https://cloudnative-pg.io/) to create a postgres cluster (primary + replica) which is used as the meta store. these instances provide great HA capability and backup and restore is much easier too in case its required.

### MySQL

`ZO_META_STORE=mysql`

Use this if you prefer MySQL for any reason.
