# High Availability (HA) Deployment

While OpenObserve can be installed and run in HA mode on bare metal servers, VMs, Kubernetes and possibly other platforms, we currently provide installation using helm charts officially. We may provide additional installers like terraform in future. Local disk storage is not supported in HA mode and as such configuring an object store is mandatory.

## Helm charts

For accessing the object store we recommend the best security practice of using IAM roles wherever possible. In case of Amazon EKS you can use IAM roles for Service Accounts (IRSA).

You must download the [values.yaml](https://github.com/zinclabs/openobserve-helm-chart/blob/main/values.yaml) file and make required changes. At a minimum you must provide the details of bucket to be used for data storage and credentials (IAM role or keys) to access it. You can download the file using following command:

```shell
curl https://raw.githubusercontent.com/zinclabs/openobserve-helm-chart/main/values.yaml -o values.yaml
```

## Configuration

### Amazon EKS + S3

You must set a minimum of 2 values:

1. S3 bucket where data will be stored
    ```yaml
    config:
      OO_S3_BUCKET_NAME: "mysuperduperbucket"
    ```
1. IAM role for the serviceAccount to gain AWS IAM credentials to access s3
    ```yaml
    serviceAccount:
      annotations:
        eks.amazonaws.com/role-arn: arn:aws:iam::12345353456:role/zo-s3-eks
    ```

Once you have configured the above in your values.yaml file, you can run the below commands to install OpenObserve.

Follow [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) to enable IRSA and create an IAM role that you can use. You can also refer to the [IRSA introduction blog](https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/).

Sample IAM policy.

```json
{
  "Id": "Policy1678319681097",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1678319677242",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::mysuperduperbucket/*"
    }
  ]
}
```

### Any Kubernetes + s3

Add/Modify following to values.yaml

1. S3 bucket where data will be stored
    ```yaml
    auth:
      OO_S3_ACCESS_KEY: "e.g.AKIAIOSFODNN7EXAMPLE"
      OO_S3_SECRET_KEY: "e.g.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    config:
      OO_S3_BUCKET_NAME: "mysuperduperbucket"
    ```

### Any Kubernetes + minio

Add/Modify following to values.yaml

1. S3 bucket where data will be stored
    ```yaml
    auth:
      OO_S3_ACCESS_KEY: "e.g.AKIAIOSFODNN7EXAMPLE"
      OO_S3_SECRET_KEY: "e.g.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    config:
      OO_S3_SERVER_URL: "https://minio-server-url"
      OO_S3_BUCKET_NAME: "mysuperduperbucket"
      OO_S3_PROVIDER:	"minio"	
    ```

### Any Kubernetes + GCS

Add/Modify following to values.yaml

1. S3 bucket where data will be stored
    ```yaml
    auth:
      OO_S3_ACCESS_KEY: "e.g.AKIAIOSFODNN7EXAMPLE"
      OO_S3_SECRET_KEY: "e.g.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    config:
      OO_S3_SERVER_URL: "https://storage.googleapis.com"
      OO_S3_BUCKET_NAME: "mysuperduperbucket"
      OO_S3_PROVIDER:	"gcs"	
    ```

You can generate  keys for GCS bucket using following steps:

1. Go to [Google cloud console > Cloud Storage > Settings > Interoperability](https://console.cloud.google.com/storage/settings;tab=interoperability) 
1. Make sure you are in the right project.
1. Access keys for your user account > Click "CREATE A KEY"


### Any Kubernetes + Openstack swift

Add/Modify following to values.yaml

1. swift bucket where data will be stored
    ```yaml
    auth:
      OO_S3_ACCESS_KEY: "e.g.AKIAIOSFODNN7EXAMPLE"
      OO_S3_SECRET_KEY: "e.g.wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    config:
      OO_S3_SERVER_URL: "swift url"
      OO_S3_BUCKET_NAME: "mysuperduperbucket"
      OO_S3_PROVIDER:	"swift"	
    ```

## Setup

### Installation

```shell
helm repo add openobserve https://charts.openobserve.ai
helm repo update

kubectl create ns openobserve

helm --namespace openobserve -f values.yaml install zo1 openobserve/openobserve
```

### Uninstallation

```shell
helm delete zo1
```



