This guide explains how to deploy [OpenObserve Enterprise Edition](https://openobserve.ai/downloads/)  in a **Kubernetes** environment using **Helm**. 

> These instructions use Amazon EKS and S3 for demonstration, but the deployment works with any Kubernetes platform such as GKE or AKS, and other S3-compatible storage services such as Azure Blob, MinIO, or GCS.

> For support, reach out in the [Slack channel](https://short.openobserve.ai/community).

??? info "Architecture Overview" 
    OpenObserve Enterprise Edition depends on several components to support scalable ingestion, search, storage, and access control:

    - **Object Storage**, such as S3, Azure Blob, GCS, or MinIO, stores all telemetry data in Parquet format.
    - **PostgreSQL** stores metadata such as dashboards, stream configurations, users, and the filelist table.
    - **NATS** coordinates communication between ingestion and query nodes.
    - **Dex and OpenFGA** enable Single Sign-On (SSO) and Role-Based Access Control (RBAC).


## Installation Steps
Follow these steps to install OpenObserve Enterprise Edition:


??? info "Prerequisites"
    Before you begin, ensure that the following are available:

    - An active AWS account with permissions to create EKS clusters, S3 buckets, IAM roles, and policies.
    - AWS CLI installed and configured using the `aws configure` command.


???  "Step 1: Create a Kubernetes Cluster Using `eksctl`"  
    > **Cluster Setup**: This step sets up the Kubernetes cluster using Amazon EKS. You can use any other Kubernetes service instead of EKS.

    1. Download the cluster configuration file:
    ```
    wget https://raw.githubusercontent.com/openobserve/eks-openobserve/main/o2-eks.yaml
    ```
    2. Open `o2-eks.yaml` and update the `CLUSTER_NAME`.
    3. Run the following command to create the cluster:
    ```
    eksctl create cluster -f o2-eks.yaml
    ```

    After this step, you have a working Kubernetes cluster. The platform does not need to be Amazon EKS. You can use Google Kubernetes Engine (GKE), Azure Kubernetes Service (AKS), or any other distribution.

???  "Step 2: Install Helm"
    > **Deployment Tool**: Helm is a tool that simplifies application deployment in Kubernetes by using reusable configuration templates called charts.

    For installation instructions, see the [Helm Installation Guide](https://helm.sh/docs/intro/install/).

???  "Step 3: Create an S3 Bucket and IAM Role"
    > **Object Storage and IAM Access**: This step configures a storage bucket and IAM role that OpenObserve will use to write log data to S3.

    1. Download and prepare the script:
    ```
    wget https://raw.githubusercontent.com/openobserve/eks-openobserve/main/bucket.sh
    chmod +x bucket.sh
    ```
    2. Open `bucket.sh` and update the `CLUSTER_NAME` variable to match your cluster ou created in **Step 1**.
    3. Run the script:
    ```
    ./bucket.sh
    ```

    **Make a note of the following:**

      - Bucket name
      - IAM role ARN
        
    These values are required for the Helm chart configuration in later steps.
      
    You can verify the bucket and IAM role in the AWS Console. You should see the S3 bucket and a role named OpenObserveRole.

???  "Step 4: Download the OpenObserve Helm Values File"
    > **Deployment Configuration**: This file contains the configurable parameters that control how OpenObserve will be deployed.

    Download the values file using:

    ```
    wget https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml
    ```

???  "Step 5: Update the `values.yaml` Configuration"
    > **Helm Chart Configurations**: This step configures access credentials, storage, and platform-specific settings before deploying OpenObserve.

    1. Add the IAM role for the service account
    Under the `serviceAccount` section, add the IAM role ARN:
    ```
    serviceAccount:
      create: true
      annotations:
        eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/OpenObserveRole
    ```
    2. Configure the object storage provider
    Under the config section, set the S3 provider, bucket name, and region:
    ```
    config:
      ZO_S3_PROVIDER: "s3"
      ZO_S3_BUCKET_NAME: "openobserve-29608"
      ZO_S3_REGION_NAME: "us-east-2"
    ```
    Valid values for `ZO_S3_PROVIDER` include `s3`, `azure`, `minio`, and `gcs`.
    Example configurations for Azure and MinIO are available in the same `values.yaml` file.
    3. Set up root user credentials
    Under the auth section, define login credentials for the root user:
    ```
    auth:
      ZO_ROOT_USER_EMAIL: "root@example.com"
      ZO_ROOT_USER_PASSWORD: "Complexpass#123"
    ```
    4. Enable RBAC and SSO 
    To enable role-based access control and single sign-on, add the following configuration:
    ```
    openfga:
      enabled: true
    ```
    ```
    dex:
      enabled: true
    ```
    For more inforamtion, refer to the [RBAC and SSO guides](../docs/user-guide/identity-and-access-management/).


    !!! Note
        The NATS coordinator service is deployed automatically by the OpenObserve Helm chart. You do not need to install or configure it separately.


???  "Step 6: Install PostgreSQL Using CloudNativePG"
    > **Metadata Storage**: OpenObserve uses PostgreSQL to store metadata such as dashboards, stream configurations, users, and the filelist table.

    If you are not using Amazon RDS, install the CloudNativePG operator using the following command:
    ```
    kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.24.0.yaml
    ```

???  "Step 7: Create a `gp3` Storage Class"
    > **Local Buffering**: This storage class enables local disk buffering before telemetry data is stored in S3.

    Create the `gp3` storage class using:
    ```
    kubectl apply -f https://raw.githubusercontent.com/openobserve/eks-openobserve/main/gp3_storage_class.yaml
    ```
    To verify the storage class (optional), run `kubectl get sc`.
    This command works with all Kubernetes environments. The `gp3` class is specific to **Amazon EBS**.

???  "Step 8: Add the OpenObserve Helm Repository"
    > **Chart Repository**: This repository contains the official Helm chart for deploying OpenObserve.

    ```
    helm repo add openobserve https://charts.openobserve.ai
    helm repo update
    ```
???  "Step 9: Deploy OpenObserve Using Helm"
    > **Deployment**: This step installs OpenObserve into your Kubernetes cluster using the Helm chart.

    1. Create the namespace: <br>
    ```
    kubectl create ns openobserve
    ```
    2. Deploy OpenObserve: <br>
    ```
    helm --namespace openobserve -f values.yaml install o2 openobserve/openobserve
    ```

    **After installation, Helm will output a kubectl port-forward command. Run the command and open http://localhost:<port>/ in your browser.**

    **Installation complete**
    OpenObserve is now running in your Kubernetes cluster. You can log in using the root user credentials and begin configuring data streams, dashboards, and alerting.



