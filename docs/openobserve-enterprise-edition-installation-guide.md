---
description: >-
  Install OpenObserve Enterprise via Helm or Terraform on EKS, AKS, or GKE. Step-by-step
  guide for enabling RBAC, SSO, and deploying with full feature support.
---
### Deploy OpenObserve Enterprise Edition as a Highly Available (HA) installation using Helm.

This guide explains how to deploy [OpenObserve Enterprise Edition](https://openobserve.ai/downloads/)  in a **Kubernetes** environment using **Helm**. 

> For support, reach out in the [Slack channel](/marketing-opt-in/){:target="_blank" rel="noopener noreferrer"}.

!!! info "Architecture Overview" 
    OpenObserve Enterprise Edition depends on several components to support scalable ingestion, search, storage, and access control:

    - **Object Storage**, such as S3, Azure Blob, GCS, or MinIO, stores all telemetry data in Parquet format.
    - **PostgreSQL** stores metadata such as dashboards, stream configurations, users, and the filelist table.
    - **NATS** coordinates communication between ingestion and query nodes.
    - **Dex and OpenFGA** enable [Single Sign-On (SSO)](../user-guide/identity-and-access-management/sso/) and [Role-Based Access Control (RBAC)](../user-guide/identity-and-access-management/role-based-access-control/).


### Installation Steps


=== "Using Amazon EKS"
    Follow these steps to install OpenObserve Enterprise Edition on Amazon Elastic Kubernetes Service (EKS):


    ??? info "Prerequisites"
        Before you begin, ensure that the following are available:

        - An active AWS account with permissions to create EKS clusters, S3 buckets, IAM roles, and policies.
        - AWS CLI installed and configured using the `aws configure` command.


    ???  "Step 1: Create a Kubernetes Cluster Using `eksctl`"  
        > **Cluster Setup**: This step sets up the Kubernetes cluster using Amazon EKS. You can use any other Kubernetes service instead of EKS.

        1. Download the cluster configuration file:
        ```bash linenums="1"
        wget https://raw.githubusercontent.com/openobserve/eks-openobserve/main/o2-eks.yaml
        ```
        2. Open `o2-eks.yaml` and update the `CLUSTER_NAME`.
        3. Run the following command to create the cluster:
        ```bash linenums="1"
        eksctl create cluster -f o2-eks.yaml
        ```

        After this step, you have a working Kubernetes cluster. 

    ???  "Step 2: Install Helm"
        > **Deployment Tool**: Helm is a tool that simplifies application deployment in Kubernetes by using reusable configuration templates called charts.

        For installation instructions, see the [Helm Installation Guide](https://helm.sh/docs/intro/install/).

    ???  "Step 3: Create an S3 Bucket and IAM Role"
        > **Object Storage and IAM Access**: This step configures a storage bucket and IAM role that OpenObserve will use to write log data to S3.

        1. Download and prepare the script:
        ```bash linenums="1"
        wget https://raw.githubusercontent.com/openobserve/eks-openobserve/main/bucket.sh
        chmod +x bucket.sh
        ```
        2. Open `bucket.sh` and update the `CLUSTER_NAME` variable to match your cluster you created in **Step 1**.
        3. Run the script:
        ```bash linenums="1"
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

        ```bash linenums="1"
        wget https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml
        ```

    ???  "Step 5: Update the `values.yaml` Configuration"
        > **Helm Chart Configurations**: This step configures access credentials, storage, and platform-specific settings before deploying OpenObserve.

        1. Add the IAM role for the service account
        Under the `serviceAccount` section, add the IAM role ARN:
        ```yaml linenums="1"
        serviceAccount:
          create: true
          annotations:
            eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/OpenObserveRole
        ```
        2. Configure the object storage provider
        Under the config section, set the S3 provider, bucket name, and region:
        ```yaml linenums="1"
        config:
          ZO_S3_PROVIDER: "s3"
          ZO_S3_BUCKET_NAME: "openobserve-29608"
          ZO_S3_REGION_NAME: "us-east-2"
        ```
        Valid values for `ZO_S3_PROVIDER` include `s3`, `azure`, `minio`, and `gcs`.
        Example configurations for Azure and MinIO are available in the same `values.yaml` file.
        3. Set up root user credentials
        Under the auth section, define login credentials for the root user:
        ```yaml linenums="1"
        auth:
          ZO_ROOT_USER_EMAIL: "root@example.com"
          ZO_ROOT_USER_PASSWORD: "Complexpass#123"
        ```
        4. Enable RBAC and SSO 
        To enable role-based access control and single sign-on, add the following configuration:
        ```yaml linenums="1"
        openfga:
          enabled: true
        ```
        ```yaml linenums="1"
        dex:
          enabled: true
        ```
        For more information, refer to the [RBAC and SSO guides](../user-guide/identity-and-access-management/role-based-access-control/).


        !!! Note
            The NATS coordinator service is deployed automatically by the OpenObserve Helm chart. You do not need to install or configure it separately.


    ???  "Step 6: Install PostgreSQL Using CloudNativePG"
        > **Metadata Storage**: OpenObserve uses PostgreSQL to store metadata such as dashboards, stream configurations, users, and the filelist table.

        If you are not using Amazon RDS, install the CloudNativePG operator using the following command:
        ```bash linenums="1"
        kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/main/releases/cnpg-1.24.0.yaml
        ```

    ???  "Step 7: Create a `gp3` Storage Class"
        > **Local Buffering**: This storage class enables local disk buffering before telemetry data is stored in S3.

        Create the `gp3` storage class using:
        ```bash linenums="1"
        kubectl apply -f https://raw.githubusercontent.com/openobserve/eks-openobserve/main/gp3_storage_class.yaml
        ```
        To verify the storage class (optional), run `kubectl get sc`.
        This command works with all Kubernetes environments. The `gp3` class is specific to **Amazon EBS**.

    ???  "Step 8: Add the OpenObserve Helm Repository"
        > **Chart Repository**: This repository contains the official Helm chart for deploying OpenObserve.

        ```bash linenums="1"
        helm repo add openobserve https://charts.openobserve.ai
        helm repo update
        ```
    ???  "Step 9: Deploy OpenObserve Using Helm"
        > **Deployment**: This step installs OpenObserve into your Kubernetes cluster using the Helm chart.

        1. Create the namespace: <br>
        ```bash linenums="1" 
        kubectl create ns openobserve
        ```
        2. Deploy OpenObserve: <br>
        ```bash linenums="1"
        helm --namespace openobserve -f values.yaml install o2 openobserve/openobserve
        ```
        After installation, the output displays a `kubectl port-forward` command. Run that command and then open `http://localhost:<port>` in your browser, replacing `<port>` with the actual port number shown.

        OpenObserve is now running in your Kubernetes cluster. Log in using the root user credentials configured in Step 5 to start using OpenObserve.

    !!! info "Note"
        OpenObserve also provides an Infrastructure as Code (IAC) workflow using [Terraform](https://www.terraform.io/downloads.html) or [OpenTofu](https://opentofu.org/docs/intro/install/). This streamlines the deployment of Amazon Elastic Kubernetes Service (EKS) and OpenObserve in HA mode. It enables teams to quickly provision and manage OpenObserve infrastructure in Amazon EKS using prebuilt, flexible modules. To explore this option, visit the [openobserve-eks-iac repository](https://github.com/openobserve/openobserve-eks-iac).

=== "Using Azure AKS"

    Follow these steps to install OpenObserve Enterprise Edition on Azure Kubernetes Service (AKS):

    ??? info "Prerequisites"

        Before starting, install the required tools:

        1. **Azure Resources**:

            - An active Azure subscription
            - A Resource Group in your preferred region
            - An AKS Kubernetes Cluster deployed in the same resource group
            You can create these resources using the Azure Portal. Select your region and resource group carefully, as they will be referenced throughout the setup.

        
        2. **Tools Installed Locally**
            
            Ensure the following tools are installed and available in your terminal session:

            - Azure CLI (az) - [Installation Guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli).
            - kubectl - [Installation Guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/).
            - Helm - [Installation Guide](https://helm.sh/docs/intro/install/).
        
            **Verify tool installation:**
            ```bash linenums="1"
            az version
            kubectl version --client
            helm version
            ```

            **Configure authentication:**
            ```bash linenums="1"
            
            **Log in to Azure**
            az login
            ```
            **Connect kubectl to your AKS cluster**
            
            ```sh linenums="1"
            az aks get-credentials --resource-group openobserve-rg --name openobserve-aks
            ```

            **Verify cluster connection**
            ```sh linenums="1"
            kubectl get nodes
            ```
        
        3. **Install CloudNativePG Operator**

            PostgreSQL is used for storing openobserve metadata. <br>
            To install CloudNativePG:

            ```sh linenums="1"
            kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.22/releases/cnpg-1.22.1.yaml
            ```
            
            Verify the operator installation:

            ```sh linenums="1"
            kubectl get pods -n cnpg
            ```

            Ensure that the pods are running.


        4. **Azure Storage Setup**

            OpenObserve uses object storage to store telemetry data. Create a storage account and a container:

             **Create storage account with unique name:** <br>

            ```sh linenums="1"
            az storage account create \
              --name <your-unique-storage-name> \
              --resource-group <your-resource-group> \
              --location <your-region> \
              --sku Standard_LRS
            ```

            **Create blob container:**<br>

            ```sh linenums="1"
            az storage container create \
              --account-name <your-unique-storage-name> \
              --name openobserve-data \
              --auth-mode login
            Get the storage access key:
            ```

            **Retrieve storage access key:** <br>

            ```sh linenums="1"
            $SA_KEY = az storage account keys list \
              --resource-group <your-resource-group> \
              --account-name <your-unique-storage-name> \
              --query '[0].value' -o tsv
            ```

            ```sh linenums="1"
            echo "Storage Account Name: $STORAGE_ACCOUNT_NAME"
            echo "Storage Account Key: $SA_KEY"
            ```
            Store the storage account name and key securely. 



    ??? "Step 1: Add OpenObserve Helm Repository"

        Add the OpenObserve Helm chart repository and update your local repository cache:

        ```bash linenums="1"
        helm repo add openobserve https://charts.openobserve.ai
        helm repo update
        ```

        **Verify the repository was added successfully:**
        ```bash linenums="1"
        helm repo list
        ```

    ??? "Step 2: Download and Configure `values.yaml`"

        Download the default OpenObserve configuration file:

        ```bash linenums="1"
        # Using wget
        wget https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml

        # Alternative using curl
        curl -o values.yaml https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml
        ```

        **Edit the configuration file** with your preferred text editor:
        ```bash linenums="1"
        # Using VS Code
        code values.yaml

        # Using nano
        nano values.yaml

        # Using vim
        vim values.yaml
        ```

    ??? "Step 3: Configure Authentication and Storage Settings"

        **Update the `auth:` section** with your credentials and storage settings:

        ```yaml linenums="1"
        auth:
          ZO_ROOT_USER_EMAIL: "your-email@example.com"
          ZO_ROOT_USER_PASSWORD: "your-secure-password"
          ZO_ROOT_USER_TOKEN: ""

          # Azure Storage Configuration (use values from prerequisites)
          AZURE_STORAGE_ACCOUNT_KEY: "your-storage-account-key"
          AZURE_STORAGE_ACCOUNT_NAME: "your-storage-account-name"
          
          # Keep PostgreSQL DSN as placeholder - will be auto-configured
          ZO_META_POSTGRES_DSN: "postgres://userid:password@host:5432/dbname"
          
          # Keep these empty for Azure storage
          ZO_S3_ACCESS_KEY: ""
          ZO_S3_SECRET_KEY: ""
        ```

        **Update the `config:` section** with storage and database settings:
 
        ```yaml linenums="1"
        config:
          ZO_LOCAL_MODE: "false"
          ZO_S3_PROVIDER: "azure"
          ZO_S3_BUCKET_NAME: "openobserve-data"
          ZO_META_STORE: "postgres"
        ```

        **Configuration Notes:**

        - **Email**: Use any email format. This becomes your admin login for OpenObserve.
        - **Password**: Choose a secure password for the OpenObserve web interface.
        - **Storage Key**: Use the key retrieved from prerequisites step 4.
        - **Storage Name**: Use the storage account name from prerequisites step 4.
        - **PostgreSQL DSN**: Keep the placeholder. Helm will auto-configure this when using built-in PostgreSQL. 

        **Configure for Multi-Node Deployment**

        If you are using a 3+ node AKS cluster, keep the default settings:

        ```yaml linenums="1"
        nats:
          config:
            cluster:
              enabled: true   # Enable clustering for HA
              replicas: 3     # Default 3 replicas

        postgres:
          spec:
            instances: 2      # Primary + replica for HA
        ```
        
        **Enable RBAC and SSO**

        To enable role-based access control and single sign-on, add the following configuration:
        ```yaml linenums="1"
        openfga:
          enabled: true
        ```
        ```yaml linenums="1"
        dex:
          enabled: true
        ```
        For more information, refer to the [RBAC and SSO guides](../user-guide/identity-and-access-management/role-based-access-control/).


    ??? "Step 4: Create Namespace and Install OpenObserve"

        **Create the OpenObserve namespace:**
        ```bash linenums="1"
        kubectl create namespace openobserve
        ```

        **Install OpenObserve using Helm:**
        ```bash linenums="1"
        helm install openobserve openobserve/openobserve \
          -n openobserve \
          -f values.yaml
        ```

        **The installation should show:**
        ```sh  
        NAME: openobserve
        LAST DEPLOYED: [timestamp]
        NAMESPACE: openobserve
        STATUS: deployed
        REVISION: 1
        ```

    ??? "Step 5: Monitor Installation Progress"

        **Check pod status during startup:**
        ```bash linenums="1"
        kubectl get pods -n openobserve
        ```

        **Expected progression:**

        1. **Initial state**: Pods in `Pending` or `Init:0/1` status.
        2. **Startup phase**: Pods move to `ContainerCreating` or `Running`.
        3. **Final state**: All pods should show `Running` status.

        **Note**: If you are testing on single-node clusters, you may need to manually scale down NATS if multiple pods are created:**

        **Installation typically takes 3-5 minutes.** Wait for all pods to reach `Running` status before proceeding.

    ??? "Step 6: Access OpenObserve"

        **Set up port-forwarding to access OpenObserve:**
        ```bash linenums="1"
        kubectl -n openobserve port-forward svc/openobserve-router 5080:5080
        ```

        **Access the OpenObserve web interface:**

        1. Open your web browser
        2. Navigate to: http://localhost:5080
        3. Log in with the credentials configured in Step 3:
        
            - **Email**: The email you configured in `ZO_ROOT_USER_EMAIL`
            - **Password**: The password you configured in `ZO_ROOT_USER_PASSWORD`


    ??? "Troubleshooting"

        1. NATS Clustering Issues <br>
        Symptoms: Pods stuck in Init:0/1, "Waiting for NATS to be ready" messages. <br>
        Cause: NATS trying to form a cluster but unable to establish connections <br>
        Solution: Ensure all nodes are healthy and networking is properly configured. <br>
        2. Volume Attachment Limit Errors
        Symptoms: "exceed max volume count" errors, pods stuck in Pending
        Cause: Too many persistent volumes for the VM size or single-node setup
        Solution: Use larger VM sizes or disable persistence for non-critical components as shown in the single-node configuration. <br>
        3. Storage Authentication Failures
        Symptoms: "AuthenticationFailed" errors in pod logs. <br>
        Cause: Incorrect or expired storage account key. <br>
        Solution: Regenerate storage account key:
        ```bash
        SA_KEY=$(az storage account keys list \
          --resource-group openobserve-rg \
          --account-name $STORAGE_ACCOUNT_NAME \
          --query '[0].value' -o tsv)
        ```
        Then update the key in `values.yaml` and reinstall. <br>
        4. Pod Scheduling Issues <br>
        Symptoms: Pods stuck in Pending, insufficient resources. <br>
        Cause: Node resource constraints or anti-affinity rules. <br>
        Solution: Scale up your cluster or use larger VM sizes. <br>
        5. Port-Forward Connection Issues <br>
        Symptoms: "connection refused" when accessing [http://localhost:5080](http://localhost:5080). <br>
        Cause: Router pod not fully ready. <br>
        Solution: Wait for router pod to show 1/1 Running, then retry port-forward. <br>

=== "Using Google GKE"
    Follow these steps to install OpenObserve Enterprise Edition on Google Kubernetes Engine (GKE):
    ??? info "Prerequisites"
        **Google Cloud Setup**

        1. Create a Google Cloud project: 
    
            - In Google Cloud Console, open the project selector on the top bar.
            - Select New Project.
            - Enter a project name.
            - Create the project and note the Project ID.
        2. Enable billing for the project. In Billing, link the new project to an active billing account.
        3. Enable required APIs for the project:

            - In APIs and Services, select Enable APIs and Services.
            - Enable Kubernetes Engine API, Compute Engine API, and Cloud Storage API

        4. Create a GKE cluster in the Console:

            - Go to **Kubernetes Engine** > **Clusters** > **Create**.
            - Choose **Standard**.
            - Set **Cluster name**.
            - Set Region or Zone. The video used us-central1 region and us-central1-c zone.
            - Choose a node pool size and machine type appropriate for your need.
            - Create the cluster and wait until the status is Running.
            - Keep the region or zone handy. You will use the same location for your storage bucket.

        **Install tools locally**

        1. Install Google Cloud SDK
        For installation instructions, see the [installation guide](https://cloud.google.com/sdk/docs/install). 
        Verify:
        ```sh linenums="1"
        gcloud version
        ```
        2. Authenticate and select the project
        Log in:
        ```sh linenums="1"
        gcloud auth login
        ```
        Set the active project:
        ```sh linenums="1"
        gcloud config set project <PROJECT_ID>
        ```
        Set the default compute region and zone to match your cluster:
        ```sh linenums="1"
        gcloud config set compute/region us-central1
        gcloud config set compute/zone us-central1-c
        ```
        3. Install `kubectl` 
        For installation instructions, see the [installation guide](https://kubernetes.io/docs/tasks/tools/). 
        Verify:
        ```sh linenums="1"
        kubectl version --client
        ```
        4. Install Helm
        For installation instructions, see the [installation guide](https://helm.sh/docs/intro/install/). 
        Verify:
        ```sh linenums="1"
        helm version
        ```
        5. Configure kubectl context for your cluster
        Pull credentials for the cluster so kubectl can talk to it:
        ```sh linenums="1"
        gcloud container clusters get-credentials <CLUSTER_NAME> --zone us-central1-c
        ```
        Verify:
        ```sh linenums="1"
        kubectl get nodes
        ```


        **Create and Configure Google Cloud Storage Bucket**

        1. Create a bucket in the same region as the GKE cluster

              - In Cloud Storage, select Buckets, then Create.
              - Set a unique bucket name, for example `oo-123456`.
              - Set Location type to Region.
              - Set Region to us-central1 if your cluster is in us-central1.
              - Create the bucket.

        2. Generate interoperability access keys

              - In Cloud Storage, select Settings, then Interoperability.
              - Enable interoperability if it is not already enabled.
              - Create a new access key.
              - Note the Access key and Secret key.
              - Note the Server URL shown on this page. You will use these values in `values.yaml`.

        **Install CloudNativePG Operator**
        
        1. Install the operator into the cluster
        ```sh linenums="1"
        kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.22/releases/cnpg-1.22.1.yaml
        ```
        2. Confirm that the operator components are running
        ```sh linenums="1"
        kubectl get pods -A | grep cnpg 
        ```

    ??? "Step 1: Connect to the GKE cluster"
        ```sh linenums="1"
        gcloud container clusters get-credentials <CLUSTER_NAME> --zone us-central1-c
        kubectl get nodes
        ```
    ??? "Step 2: Add OpenObserve Helm Repository"
    
        ```bash linenums="1"
        helm repo add openobserve https://charts.openobserve.ai
        helm repo update
        helm repo list
        ```
    ??? "Step 3: Download the Helm chart configuration"
        ```sh linenums="1"
        wget https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml
        ```
    ??? "Step 4: Configure `values.yaml`"

        **Storage settings for Google Cloud Storage** <br>
        Use the bucket you created and the interoperability credentials.

        ```yaml linenums="1"
        ZO_S3_BUCKET_NAME: "<your-bucket-name>"
        ZO_S3_REGION_NAME: "auto"
        ZO_S3_SERVER_URL: "<server-url-from-interoperability>"
        ZO_S3_ACCESS_KEY: "<access-key>"
        ZO_S3_SECRET_KEY: "<secret-key>"
        ```

        **Initial login**
        ```yaml linenums="1"
        ZO_ROOT_USER_EMAIL: "your-email@example.com"
        ZO_ROOT_USER_PASSWORD: "supercomplexpass12"
        ```
        
        **Enable RBAC and SSO**
        
        To enable role-based access control and single sign-on, add the following configuration:
        ```yaml linenums="1"
        openfga:
          enabled: true
        ```
        ```yaml linenums="1"
        dex:
          enabled: true
        ```
        For more information, refer to the [RBAC and SSO guides](../user-guide/identity-and-access-management/role-based-access-control/).

    ??? "Step 5: Install OpenObserve with Helm"
        ```sh linenums="1"
        kubectl create namespace openobserve

        helm install oo openobserve/openobserve \
          --namespace openobserve \
          -f values.yaml
        ```
    ??? "Step 6: Verify pods"
        Wait until all pods are running.

        ```sh linenums="1"
        kubectl get pods -n openobserve
        ```
    ??? "Step 7: Port forward to access the UI locally"
        Forward the router service to your machine so you can open the UI at localhost.

        ```sh linenums="1"
        kubectl -n openobserve port-forward svc/openobserve-router 5080:5080
        ```
        **Open the UI:**

        ```
        http://localhost:5080
        ```
        Log in with the email and password you set in `values.yaml`.

### Enterprise License 

Enterprise Edition is free for up to 200 GB/day (~6 TB/month) of data ingestion

#### Pricing:

  - Free tier: Up to 200 GB/day of ingestion (roughly 6 TB/month), including full commercial use in accordance with the [license](https://openobserve.ai/enterprise-license/)

  - Registration required if ingesting greater than 50 GB/day to get a free license for up to 200 GB/Day

  - Volume discounts and multi-year contracts available, [contact our sales team](https://openobserve.ai/contact-sales/)

#### Enterprise Features

##### Security & Access Control

- **Single Sign-On (SSO)**: OIDC, OAuth, SAML 2.0, LDAP/AD, and integration with major identity providers (Okta, Azure Entra, Google, GitHub, GitLab, Keycloak)

- **Advanced RBAC**: Granular role-based access control with custom roles and permissions – [Learn more](https://openobserve.ai/docs/user-guide/identity-and-access-management/role-based-access-control/)

- **Audit trails**: Comprehensive immutable audit logs with configurable retention

- **Sensitive Data Redaction (SDR)**: Automatically redact PII and sensitive data during ingestion and queries

- **Advanced encryption**: AES-256 SIV cipher keys with Google Tink KeySet and Akeyless integration

- **Rate limit**: Control API request rates and protect against abuse

##### Performance & Scalability

- **Query performance**: 100x improvement for many queries

- **Federated search / Super Cluster**: Query across multiple clusters and regions

- **Query management**: Control query resource usage and priorities

- **Workload management (QoS)**: Quality of Service controls for multi-tenant environments

- **Query optimizer / Aggregation cache / TopK Aggregation**: Advanced query optimization for faster performance

- **Broadcast join**: Optimized join operations for distributed queries

- **Metrics auto downsampling**: Automatic downsampling for long-term metrics retention

##### AI & Intelligence

- **Incident management**: Automated incident creation and tracking from alerts

- **SRE Agent**: AI-powered root cause analysis with correlated logs, metrics, and traces

- **AI assistant**: Intelligent assistant for observability workflows

- **Log Patterns**: Automatic pattern extraction and anomaly identification

- **MCP server**: Model Context Protocol server for AI integrations

- **Logs, metrics, and traces correlation**: Automated detection and correlation across telemetry signals

#####  Data Processing & Integration

- **Actions**: Custom automation and response actions

- **Pipeline remote destinations**: Send processed data to external systems

- **Advanced pipelines**: Enhanced data transformation and routing capabilities

---

#### How Enterprise Licensing Works

Enterprise installations work without requesting a license key up to **50 GB/day** of data ingestion. If your ingestion volume goes beyond 50 GB/day, you need to request a license for your team.

##### License Types

1. **Free-Tier License** (≤ 200 GB/Day)
2. **Paid Subscription License** (> 200 GB/Day)

##### Usage Limits

To accommodate occasional traffic spikes, OpenObserve provides a buffer:

- You can exceed your license limit up to **3 times per month** without impact.
- After exceeding your limit 3 times in a calendar month, search queries will be blocked until you upgrade your license or your ingestion volume returns within limits.

This applies to both fresh installations (50 GB/day limit) and Free-Tier License users (200 GB/day limit).

For full terms and conditions, visit the [Enterprise License page](https://openobserve.ai/enterprise-license/).
