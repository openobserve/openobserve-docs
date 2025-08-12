---
description: >-
  Get started with OpenObserve quickly—follow the quickstart guide or watch the
  intro video to explore its powerful observability features in action.
---
# OpenObserve Quickstart Guide

This guide will help you get started with OpenObserve. You can choose between [OpenObserve Cloud](https://cloud.openobserve.ai) (recommended) or a self-hosted installation.

## Choose Your Installation Method

=== "OpenObserve Cloud(Recommended)"

    [OpenObserve Cloud](https://cloud.openobserve.ai) is the fastest way to get started and is recommended for most users because:

    - **Zero maintenance:** No need to set up, operate, or upgrade infrastructure — we handle it all for you.
    - **Effortless scaling:** Easily handle growing data volumes without worrying about capacity planning or scaling issues.
    - **Always up-to-date:** Get the latest features, improvements, and security patches automatically.

=== "Self-Hosted Installation"

    Choose self-hosted if you need:

    - Full control over your data and infrastructure
    - Custom configurations or integrations
    - On-premises deployment requirements


## Option 1: OpenObserve Cloud Setup

??? "Step 1: Create Your Account"

    1. Navigate to [https://cloud.openobserve.ai](https://cloud.openobserve.ai)
    2. Sign up using social login or create a new account

        ![Sign in page](./images/quickstart/signin.png)

??? "Step 2: Get Your Ingestion Credentials"

    1. After logging in, navigate to the **Data Sources** section in the sidebar

        ![Ingestion](./images/quickstart/ingestion_credentials.png)

    2. Copy the provided cURL command - it contains your unique credentials
    3. Your endpoint will look like: `https://api.openobserve.ai/api/[YOUR_ORG]/default/_json`

    You are ready to ingest data. Now head over to [Load sample data](#load-sample-data) section.

## Option 2: Self-Hosted Installation

> **Important**: These instructions are for single-node installations. For production high-availability setups, see our [HA deployment guide](./ha_deployment.md).

You'll need to set root user credentials (ZO_ROOT_USER_EMAIL and ZO_ROOT_USER_PASSWORD) on first startup only. They are not required for subsequent runs.

=== "Windows"

    **Download and Install**
    
    1. Download Binaries from [downloads page](https://openobserve.ai/downloads)
    2. Open Command Prompt or PowerShell as Administrator
    3. Run the following commands:

    ```cmd
    #command prompt
    set ZO_ROOT_USER_EMAIL=root@example.com
    set ZO_ROOT_USER_PASSWORD=Complexpass#123
    openobserve.exe
    ```

    ```powershell
    #powershell
    $env:ZO_ROOT_USER_EMAIL="root@example.com"
    $env:ZO_ROOT_USER_PASSWORD="Complexpass#123"
    .\openobserve.exe
    ```
    
    !!! note
        You can set email and password based on your preference
    

=== "MacOS/Linux Binaries"


    1. Download the appropriate binary from our [downloads page](https://openobserve.ai/downloads)
    2. Make it executable: `chmod +x openobserve`
    3. Run with environment variables as shown:
    ```bash
    # Run OpenObserve
    ZO_ROOT_USER_EMAIL="root@example.com" ZO_ROOT_USER_PASSWORD="Complexpass#123" ./openobserve
    ```

    !!! note
        If you see an error like `version GLIBC_2.27 not found`, download the `musl` binary instead:
        
        - Look for files ending in `-linux-musl.tar.gz` on the releases page
        - musl binaries have slightly lower performance but no external dependencies

=== "Docker"

    **Prerequisites**: Ensure Docker is installed and running on your system.

    Docker images are available at:
    
    - Enterprise: [https://gallery.ecr.aws/zinclabs/openobserve-enterprise](https://gallery.ecr.aws/zinclabs/openobserve-enterprise)
    - OSS : [https://gallery.ecr.aws/zinclabs/openobserve](https://gallery.ecr.aws/zinclabs/openobserve)


    **Linux/macOS:**
    ```bash
    docker run -v $PWD/data:/data -e ZO_DATA_DIR="/data" -p 5080:5080 -e ZO_ROOT_USER_EMAIL="root@example.com" -e ZO_ROOT_USER_PASSWORD="Complexpass#123" o2cr.ai/openobserve/openobserve-enterprise:latest
    ```

    **Windows:**
    ```cmd
    # Windows Command Prompt
    docker run -d --name openobserve -v %cd%/openobserve-data:/data -e ZO_DATA_DIR="/data" -e ZO_ROOT_USER_EMAIL="root@example.com" -e ZO_ROOT_USER_PASSWORD="Complexpass#123" -p 5080:5080 o2cr.ai/openobserve/openobserve-enterprise:latest
    ```

    **Docker Image Options:**

    - `latest`: Compatible with most environments
    - `latest-simd`: Optimized for systems with AVX512 (Intel) or NEON (ARM) for better performance

    !!! Troubleshooting

        If you encounter AWS ECR login issues:
        ```bash
        aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
        ```

=== "Kubernetes - Manifest"

    **Prerequisites**: Ensure `kubectl` is configured and you have cluster access.

    1. **Create namespace:**
    ```bash
    kubectl create namespace openobserve
    ```

    2. **Deploy OpenObserve:**
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/zinclabs/openobserve/main/deploy/k8s/statefulset.yaml
    ```

    3. **Access the service:**
    ```bash
    kubectl -n openobserve port-forward svc/openobserve 5080:5080
    ```



## Verify Installation

After installation, verify OpenObserve is running:

1. Open your browser and navigate to:
    - **Self-hosted**: [http://localhost:5080](http://localhost:5080)
    - **Cloud**: [https://cloud.openobserve.ai](https://cloud.openobserve.ai)

2. Log in with your credentials:
    - **Self-hosted**: Use the email/password you set in environment variables
    - **Cloud**: Use your account credentials

3. You should see the OpenObserve dashboard


## Load Sample Data

Let's load some real-world log data to explore OpenObserve's features.

??? "Step 1: Download Sample Data"
      
    ```bash
    # Download and extract sample Kubernetes logs
    curl -L https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip -o k8slog_json.json.zip
    unzip k8slog_json.json.zip
    ```

    **What's in the sample data**: This file contains real Kubernetes application logs with various log levels (info, warning, error) and structured JSON fields.

??? "Step 2: Load Data into OpenObserve"

    **For OpenObserve Cloud**:
    ```bash
    # Use the cURL command from your Ingestion page
    curl -u your-email@domain.com:your-password \
    -H "Content-Type: application/json" \
    https://api.openobserve.ai/api/YOUR_ORG/default/_json \
    -d "@k8slog_json.json"
    ```

    **For Self-Hosted Installation**:
    ```bash
    curl -u "root@example.com:Complexpass#123" \
    -H "Content-Type: application/json" \
    http://localhost:5080/api/default/default/_json \
    -d "@k8slog_json.json"
    ```

??? "Step 3: Verify Data Upload"

    You should see output similar to:
    ```json
    {"code":200,"status":"ok","records":1000}
    ```

    If you see errors, check:

    - Your credentials are correct
    - The JSON file was downloaded completely
    - OpenObserve is running and accessible


## Search Your Data

Now let's explore the data you just loaded.

??? "Step 1: Access the Logs Interface"

    1. Navigate to your OpenObserve instance
    2. Click on **Logs** in the left sidebar
    3. Select **default** from the stream dropdown (top-left)

    ![Logs page](./images/quickstart/logs_page.png)


??? "Step 2: Try These Sample Searches"

    **Basic searches** (click the **Run Query** button after each):

    1. **View all logs**: Leave search box empty and click search
    2. **Find errors**: `level='error'` or `match_all('error')`

*Congratulations! You now have OpenObserve running with sample data.*


## Next Steps - Send Your Own Data

- **Application logs**: Use our [logging libraries](./ingestion/logs/otlp.md) for your applications
- **Metrics**: Set up [Prometheus integration](./ingestion/metrics/prometheus.md) 
- **Traces**: Configure [OpenTelemetry](./ingestion/traces/opentelemetry.md) for distributed tracing


## Troubleshooting Common Issues

??? "Can't access OpenObserve web interface"

    - Check if the process is running
    - Verify port 5080 is not blocked by firewall
    - For Docker: ensure port mapping is correct (`-p 5080:5080`)

??? "Authentication errors"

    - Verify your email/password combination
    - For self-hosted: ensure environment variables were set correctly
    - For cloud: check your account credentials

??? "Data not appearing"

    - Verify the curl command returned success (200 status)
    - Check the time range in the web interface
    - Ensure you selected the correct stream/index

??? "Performance issues"

    - Consider using the SIMD Docker image for better performance
    - Check available memory and CPU resources
    - For large datasets, consider the high-availability deployment

If you're still having issues, Join our [Slack Community](https://short.openobserve.ai/community) for help
