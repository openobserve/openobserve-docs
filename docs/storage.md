> Applicable to open source & enterprise version

There are 2 primary items that need to be stored in ZincObserve. 

1. Ingested stream data
1. Metadata of ingested stream data

Metadata for stream data is always stored on disk for `Local mode` and will stored in `etcd` for `Cluster mode`.

Stream data can be stored on disk, s3, minIO and other compatible s3 API object storages, like: Google GCS, Alibaba OSS, Tencent COS. 

Tips:

1. Default ZincObserve runs as `Local mode`, you can set `LOCAL_MODE=false` to enable `Cluster mode`.
1. In `Local mode` it also can use `s3` as storage, you can set `ZO_LOCAL_MODE_STORAGE=s3` to storage data in s3.
1. For GCS, OSS they all supports `s3` SDK, so you can think they are all of s3, just configure different s3 environments.

## Disk

Disk is default storage place for stream data, make sure you have enough storage available on your disk for stream data storage. During data ingestion the stream name that you provide may not be present, in that case a new folder for stream will be created automatically for storing the stream data.

## S3

To use S3 for storing stream data following needs to be done:

* Make AWS IAM credentials available to ZincObserve by any supported mechanisms. ZincObserve uses AWS SDK which looks for credentials through:

    - Environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (Not recommended due to security concerns)
    - Your aws CLI credentials stored in ~/.aws/credentials
    - Instance metadata on an EC2 Instance/Fargate container/ECS container. You do this providing an IAM role to an EC2 instance or a task role to an ECS task - IMDS/IMDSv2 . ECS is not recommended as it does not have support for stateful workloads off EBS as of now.
    - IAM Roles for service Accounts in EKS

> You need to create the bucket in S3 first.

## MinIO

ZincObserve can use MinIO for storing stream data , following environment variables needs to be setup:

| Environment Variable        | Default Value | Mandatory     | Description                                                               |
| --------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL            | -             | No            | minIO server address |
| ZO_S3_REGION_NAME           | -             | No            | region name, can be anything, like: `us-west-1` |
| ZO_S3_ACCESS_KEY            | -             | No            | access key |
| ZO_S3_SECRET_KEY            | -             | No            | secret key |
| ZO_S3_BUCKET_NAME           | -             | No            | bucket name |
| ZO_S3_PROVIDER              | minio         | Yes           | used to specify settings like force_style=true |

> You need to create the bucket in MinIO first.

## Google GCS

ZincObserve can use google cloud storage for storing stream data , following environment variables needs to be setup:

| Environment Variable        | Default Value | Mandatory     | Description                                                               |
| --------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL            | -             | No            | gcs server address. should be: `https://storage.googleapis.com` |
| ZO_S3_REGION_NAME           | -             | No            | region name, gcs region name, or: `auto` |
| ZO_S3_ACCESS_KEY            | -             | No            | access key |
| ZO_S3_SECRET_KEY            | -             | No            | secret key |
| ZO_S3_BUCKET_NAME           | -             | No            | bucket name |
| ZO_S3_PROVIDER              | gcs         | Yes           | GCS does not support DeleteObjects API. Compactor needs to use DeleteObject API|

You can refer to: [https://cloud.google.com/storage/docs/aws-simple-migration](https://cloud.google.com/storage/docs/aws-simple-migration)

## Alibaba OSS (aliyun)

ZincObserve can use Alibaba(aliyun) OSS for storing stream data , following environment variables needs to be setup:

| Environment Variable        | Default Value | Mandatory     | Description                                                               |
| --------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL            | -             | No            | oss endpoint address, eg: `https://oss-cn-beijing.aliyuncs.com` |
| ZO_S3_REGION_NAME           | -             | No            | region name, oss region name, eg: `oss-cn-beijing` |
| ZO_S3_ACCESS_KEY            | -             | No            | access key |
| ZO_S3_SECRET_KEY            | -             | No            | secret key |
| ZO_S3_BUCKET_NAME           | -             | No            | bucket name |

You can refer to: [https://help.aliyun.com/document_detail/64919.html](https://help.aliyun.com/document_detail/64919.html)

## Tencent COS

ZincObserve can use tencent cloud storage for storing stream data , following environment variables needs to be setup:

| Environment Variable        | Default Value | Mandatory     | Description                                                               |
| --------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZO_S3_SERVER_URL            | -             | No            | cos endpoint address |
| ZO_S3_REGION_NAME           | -             | No            | region name, cos region name |
| ZO_S3_ACCESS_KEY            | -             | No            | access key |
| ZO_S3_SECRET_KEY            | -             | No            | secret key |
| ZO_S3_BUCKET_NAME           | -             | No            | bucket name |

You can refer to: [https://cloud.tencent.com/document/product/436/37421](https://cloud.tencent.com/document/product/436/37421)
