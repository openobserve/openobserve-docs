This guide explains how to configure data and metadata storage in OpenObserve. The information applies to both the open-source and enterprise versions.

## Overview
There are 2 primary items that need to be stored in OpenObserve.

- Ingested stream data
- Metadata for ingested stream data

By default: 

- Metadata is always stored on disk using **SQLite** in **Local mode**.
- Metadata is always stored on disk using **postgres** in **Cluster mode**.
- Stream data can be stored on disk or object storage such as Amazon S3, minIO, Google GCS, Alibaba OSS, or Tencent COS.

## Storage Modes

- OpenObserve runs in **Local mode** by default.
- To enable **Cluster mode**, set the environment variable `LOCAL_MODE=false`.
- In **Local mode**, stream data can be stored in S3 by setting `ZO_LOCAL_MODE_STORAGE=s3`.
- GCS and OSS support the S3 SDK and can be treated as S3-compatible storages. Azure Blob storage is also supported.

## Data Storage Format

Stream data is stored in Parquet format. Parquet is columnar storage format optimized for storage efficiency and query performance. 

## Stream Data Storage Options

### Disk

Disk is default storage place for stream data. **Ensure that sufficient disk space is available for storing stream data.**


### Amazon S3

To use Amazon S3 for storing stream data:

1. Create the bucket in S3 first. 
2. Provide AWS credentials through one of the supported AWS SDK mechanisms:

  - Set environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. This is not recommended due to security concerns. 
  - Use AWS CLI credentials in `~/.aws/credentials`. 
  - Use EC2 instance metadata for instances with IAM roles, or assign IAM roles directly to ECS or Fargate tasks. These roles are accessed through the Instance Metadata Service (IMDS or IMDSv2). ECS is not recommended for stateful workloads.
  - Use IAM Roles for service Accounts in Amazon EKS. 


### MinIO
To use MinIO for storing stream data, first create the bucket in MinIO.
Then set the following environment variables:

| Environment Variable | Value | Description                                     |
| -------------------- | ----- | ----------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | MinIO server address                            |
| ZO_S3_REGION_NAME    | -     | Region name, such as `us-west-1` |
| ZO_S3_ACCESS_KEY     | -     | Access key                                      |
| ZO_S3_SECRET_KEY     | -     | Secret key                                      |
| ZO_S3_BUCKET_NAME    | -     | Bucket name                                     |
| ZO_S3_PROVIDER       | minio    | Used to specify settings like `force_style=true`  |


### Openstack Swift
To use OpenStack Swift for storing stream data, first create the bucket in Swift.
Then set the following environment variables:

| Environment Variable      | Value | Description                                     |
| ------------------------- | ----- | ----------------------------------------------- |
| ZO_S3_SERVER_URL          | -     | Swift server address, such as `https://us-west-1.example.com`   |
| ZO_S3_REGION_NAME         | -     | Region name, such as `us-west-1` |
| ZO_S3_ACCESS_KEY          | -     | Access key                                      |
| ZO_S3_SECRET_KEY          | -     | Secret key                                      |
| ZO_S3_BUCKET_NAME         | -     | Bucket name                                     |
| ZO_S3_FEATURE_HTTP1_ONLY  | true  | 	Enables compatibility with Swift                                              |
| ZO_S3_PROVIDER            | s3    | Enables S3-compatible API                           |
| AWS_EC2_METADATA_DISABLED | true  | Disables EC2 metadata access, which is not supported by Swift |


### Google GCS
To use GCS for storing stream data, first create the bucket in GCS.

**Using the S3-compatible API:**

| Environment Variable     | Value  | Description                                                     |
| ------------------------ | -------| --------------------------------------------------------------- |
| ZO_S3_SERVER_URL         | -      | GCS server address. Should be sent to `https://storage.googleapis.com` |
| ZO_S3_REGION_NAME        | -      | GCS region name, or set to `auto`                        |
| ZO_S3_ACCESS_KEY         | -      | Access key                                                      |
| ZO_S3_SECRET_KEY         | -      | Secret key                                                      |
| ZO_S3_BUCKET_NAME        | -      | Bucket name                                                     |
| ZO_S3_FEATURE_HTTP1_ONLY | true   | Required for compatibility                                                              |
| ZO_S3_PROVIDER           | s3     | Enables S3-compatible API                                           |

Refer to [GCS AWS migration documentation]((https://cloud.google.com/storage/docs/aws-simple-migration)) for more information.

**Using GCS directly:**

| Environment Variable     | Value  | Description                                                             |
| ------------------------ | -------| ----------------------------------------------------------------------- |
| ZO_S3_SERVER_URL         | -      | GCS server address. should be: `https://storage.googleapis.com`         |
| ZO_S3_REGION_NAME        | -      | region name, gcs region name, or: `auto`                                |
| ZO_S3_ACCESS_KEY         | -      | Path to gcp json private key if not available through instance metadata |
| ZO_S3_BUCKET_NAME        | -      | bucket name                                                             |
| ZO_S3_PROVIDER           | gcs    | Use GCS API                                                             |

OpenObserve uses the [object_store crate](https://docs.rs/object_store/0.10.1/object_store/gcp/struct.GoogleCloudStorageBuilder.html) to initialize the storage configuration. It calls the with_env() function by default. If the ZO_S3_ACCESS_KEY variable is set, OpenObserve additionally uses the with_service_account_path() function to load the GCP service account key.

### Alibaba OSS (aliyun)
To use Alibaba OSS for storing stream data, first create the bucket in Alibaba Cloud.
Then set the following environment variables:

| Environment Variable           | Value | Description                                                     |
| ------------------------------ | ----- | --------------------------------------------------------------- |
| ZO_S3_SERVER_URL               | -     | OSS endpoint, such as `https://bucketname.oss-ap-southeast-1.aliyuncs.com` |
| ZO_S3_REGION_NAME              | -     | OSS region name, such as `oss-cn-beijing`.             |
| ZO_S3_BUCKET_NAME              | -     | Bucket name                                                     |
| ZO_S3_ACCESS_KEY               | -     | Access key                                                      |
| ZO_S3_SECRET_KEY               | -     | Secret key                                                      |
| ZO_S3_FEATURE_FORCE_HOSTED_STYLE | true  | Enables hosted-style addressing                                                              |

Refer to [Alibaba OSS region and endpoint documentation](https://help.aliyun.com/zh/oss/user-guide/regions-and-endpoints).

### Tencent COS
To use Tencent COS for storing stream data, first create the bucket in Tencent Cloud.
Then set the following environment variables:

| Environment Variable | Value | Description                  |
| -------------------- | ----- | ---------------------------- |
| ZO_S3_SERVER_URL     | -     | COS endpoint address         |
| ZO_S3_REGION_NAME    | -     | COS region name |
| ZO_S3_ACCESS_KEY     | -     | Access key                   |
| ZO_S3_SECRET_KEY     | -     | Secret key                   |
| ZO_S3_BUCKET_NAME    | -     | Bucket name                  |

Refer to [Tencent COS documentation](https://cloud.tencent.com/document/product/436/37421).

### UCloud US3
To use UCloud US3 for storing stream data, first create the bucket in UCloud.
Then set the following environment variables:

| Environment Variable | Value | Description                                          |
| -------------------- | ----- | ---------------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | US3 endpoint, such as `http://internal.s3-sg.ufileos.com` |
| ZO_S3_ACCESS_KEY     | -     | Access key                                           |
| ZO_S3_SECRET_KEY     | -     | Secret key                                           |
| ZO_S3_BUCKET_NAME    | -     | Bucket name                                          |
| ZO_S3_FEATURE_HTTP1_ONLY    | true     | Required for HTTP1 compatibility                                         |

Refer to [UCloud S3 documentation](https://docs.ucloud.cn/ufile/s3/s3_introduction).

### Baidu BOS
To use Baidu BOS for storing stream data, first create the bucket in Baidu Cloud.
Then set the following environment variables:

| Environment Variable | Value | Description                                          |
| -------------------- | ----- | ---------------------------------------------------- |
| ZO_S3_SERVER_URL     | -     | BOS endpoint, such as `https://s3.bj.bcebos.com` |
| ZO_S3_REGION_NAME    | -     | BOS region name, such as `bj`               |
| ZO_S3_ACCESS_KEY     | -     | Access key                                           |
| ZO_S3_SECRET_KEY     | -     | Secret key                                           |
| ZO_S3_BUCKET_NAME    | -     | Bucket name                                          |

Refer to [Baidu BOS documentation](https://cloud.baidu.com/doc/BOS/s/xjwvyq9l4).

### Azure Blob

OpenObserve can use azure blob for storing stream data. Following environment variables needs to be setup:

| Environment Variable       | Value                | Description                                  |
| -------------------------- | -------------------- | -------------------------------------------- |
| ZO_S3_PROVIDER             | azure                | Enables Azure Blob storage support                   |
| ZO_LOCAL_MODE_STORAGE      | s3                   | Required only if running in single node mode |
| AZURE_STORAGE_ACCOUNT_NAME | Storage account name | Need to provide mandatorily                  |
| AZURE_STORAGE_ACCOUNT_KEY  | Access key           | Need to provide mandatorily                  |
| ZO_S3_BUCKET_NAME          | Blob Container name  | Need to provide mandatorily                  |


## Metadata Storage

OpenObserve supports multiple metadata store backends, configurable using the `ZO_META_STORE` environment variable.

### SQLite
- Set `ZO_META_STORE=sqlite`.
- No additional configuration is required.
- Suitable for single-node installations.
- This is generally not recommended as losing the SQLite data will make OpenObserve inoperable.

### PostgreSQL
- Set `ZO_META_STORE=postgres`.
- Recommended for production deployments due to reliability and scalability. 
- The default Helm chart (after February 23, 2024) uses [cloudnative-pg](https://cloudnative-pg.io/) to create a postgres cluster (primary + replica) which is used as the meta store. These instances provide high availability and backup support.

### etcd (Deprecated)
- Set `ZO_META_STORE=etcd`.
- While etcd is used as the cluster coordinator, it was also the default metadata store in Helm charts released before 23 February 2024. This configuration is now deprecated. Helm charts released after 23 February 2024 use PostgreSQL as the default metadata store.

### MySQL (Deprecated)
- Set `ZO_META_STORE=mysql`.
- Deprecated. 
- Use PostgreSQL instead.
