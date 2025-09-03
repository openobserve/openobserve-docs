This guide explains how to configure OpenObserve to store data in multiple object storage accounts. It also covers how to set environment variables to specify which stream should be stored in each account.

## Why Use Multiple Object Storage Accounts

- Using multiple object storage accounts or buckets in OpenObserve helps you:
- Store data across different regions or providers.
- Separate critical and non-critical data into different accounts or buckets.
- Optimize storage cost and meet compliance requirements.
- Improve write throughput by avoiding single-bucket performance limits. For example, some providers such as AWS S3 impose a throughput limit per bucket. Using multiple buckets helps distribute the load and increase overall ingestion throughput.
- Use flexible combinations of accounts and buckets:

    - A single account with multiple buckets.
    - Multiple accounts with one or more buckets.
    - A combination of specific accounts and buckets for each stream.
    
This setup is useful for organizations that manage large-scale log ingestion across diverse environments.
    
## Steps to Configure Multiple Object Storage Accounts

Let us say, you want to store logs based on their importance:

- Critical logs should go to an AWS S3 bucket in us-east-1
- Internal logs should go to a MinIO bucket in us-west-1

Follow these steps to configure multiple object storage accounts in OpenObserve:


### Prerequisites

- At least two S3-compatible object storage accounts.
- Valid credentials, regions, and bucket names for each.

### Step 1: Set Storage Account Environment Variables
Define the environment variables required to connect to each object storage account:
```
ZO_S3_ACCOUNTS="acc1,acc2"
ZO_S3_PROVIDER="aws,minio"
ZO_S3_SERVER_URL="https://s3.amazonaws.com,https://minio.example.com"
ZO_S3_REGION_NAME="us-east-1,us-west-1"
ZO_S3_ACCESS_KEY="key1,key2"
ZO_S3_SECRET_KEY="secret1,secret2"
ZO_S3_BUCKET_NAME="critical-logs,internal-logs"
ZO_S3_BUCKET_PREFIX="logs/"
```

!!! info "Important"
    - The first account is treated as the default account. Configure the old account as the first one.
    - All variables must contain the same number of comma-separated values.

### Step 2: Configure Stream Strategy
Set the `ZO_S3_STREAM_STRATEGY` environment variable to control how streams are assigned to accounts.

You can choose one of the following strategies:

**Use Default Account** <br>
```
ZO_S3_STREAM_STRATEGY=""
```
All streams are stored in the first configured account.

**File Name Hashing** <br>
```
ZO_S3_STREAM_STRATEGY="file_hash"
```
The storage account is selected based on a hash of the file name.

**Stream Name Hashing** <br>
```
ZO_S3_STREAM_STRATEGY="stream_hash"
```
The storage account is selected based on a hash of the stream name.

**Static Stream-to-Account Mapping** <br>
```
ZO_S3_STREAM_STRATEGY="payments:acc1,operations:acc1,internal:acc2"
```
Each stream is mapped explicitly to a storage account.

### Step 3: Verify Configuration

1. Restart OpenObserve.
2. Ingest test logs.
3. Confirm logs are written to the correct storage buckets.
