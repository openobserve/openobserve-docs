
There are 2 primary items that need to be stored in ZincSearch. 

1. Indexes
1. Metadata of indexes

Metadata of indexes is always stored on disk.

Indexes can be stored in 3 different places.

## Disk

Disk is default storage place for indexes. Make sure that you have enough storage available on your disk for index storage. During data ingestion the index name that you provide may not be present. In that case a new disk based index will be created automatically for storing the index data.

## S3 (deprecated)

To use S3 for storing index data following needs to be done:

* Precreate the index
e.g. 
POST [http://localhost:4080/api/index](http://localhost:4080/api/index)

Request Body: 
```json
{ 
    "name": "myshinynewindex", 
    "storage_type": "s3" 
}
```

* Make AWS IAM credentials available to ZincSearch by any supported mechanism. ZincSearch uses AWS Go SDK which looks for credentials through:

    - Environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (Not recommended due to security concerns)
    - Your aws CLI credentials stored in ~/.aws/credentials
    - Instance metadata on an EC2 Instance/Fargate container/ECS container. You do this providing an IAM role to an EC2 instance or a task role to an ECS task - IMDS/IMDSv2 . ECS is not recommended as it does not have support for stateful workloads off EBS as of now.
    - IAM Roles for service Accounts in EKS


## MinIO (deprecated)

ZincSearch can use MinIO for storing indexes. Just like S3 storage, for using MinIO the index needs to be precreated.

* Precreate the index
e.g. 
PUT [http://localhost:4080/api/index](http://localhost:4080/api/index)

Request Body: 
```json
{ 
    "name": "myshinynewindex", 
    "storage_type": "minio" 
}
```

The following environment variables need to be setup:


| Environment Variable          | Description                                                               |
| :---------------------------- | :------------------------------------------------------------------------ |
| ZINC_MINIO_ENDPOINT           | MinIO server endpoint. e.g localhost:9000 . See no http                   |
| ZINC_MINIO_ACCESS_KEY_ID      | MinIO ACCESS_KEY_ID                                                       |
| ZINC_MINIO_SECRET_ACCESS_KEY  | MinIO SECRET_ACCESS_KEY                                                   |
| ZINC_MINIO_BUCKET             | MinIO bucket for index storage                                            |
