<<<<<<< HEAD
# Quickstart

You can get started with [OpenObserve Cloud](https://cloud.openobserve.ai) or a self hosted installation. 

OpenObserve Cloud is recommended for most users due to following benefits:

1. No effort in setting up a `Highly Available` installation and maintaining it.
1. OpenObserve Cloud with its generous free tier is quite a lot for most hobby users / smaller companies / startups.
1. Newer features and bug fixes are available earlier in OpenObserve Cloud. 
1. And more...

## OpenObserve Cloud

OpenObserve Cloud is offered as a hosted service backed by open source OpenObserve. It has the same features as that of OpenObserve with generous free tier with no effort on maintaining infrastructure for your own cluster.

Let's go through it.

1. Navigate to [https://cloud.openobserve.ai](https://cloud.openobserve.ai)
2. Use a social login to create an account or login
    
    ![Sign in page](./images/quickstart/signin.png)

3. Now head over to `Ingestion` section and grab `CURL` command

![Ingestion](./images/quickstart/ingestion_credentials.png)

Now head over to [Load sample data](#load-sample-data) section


## Self hosted Installation

**Note**: Installation directions on this page is for single node installations. If you are looking for a `Highly Available` installation then head over to [HA deployment](./ha_deployment.md) section.

You would need ZO_ROOT_USER_EMAIL and ZO_ROOT_USER_PASSWORD environment variables when you start OpenObserve for the first time. You don't need them on subsequent runs of OpenObserve.

=== "Windows"

    Binaries can be downloaded from [releases](https://github.com/openobserve/openobserve/releases) page for appropriate platform.


        set ZO_ROOT_USER_EMAIL=root@example.com
        set ZO_ROOT_USER_PASSWORD=Complexpass#123
        openobserve.exe


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

=== "MacOS/Linux Binaries"
    You could run the below command to download latest version of OpenObserve for your platform. Alternatively you could download the binary from [releases](https://github.com/openobserve/openobserve/releases) page manually:

        curl -L https://raw.githubusercontent.com/openobserve/openobserve/main/download.sh | sh
    
    Once downloaded run it using below command:

        ZO_ROOT_USER_EMAIL="root@example.com" ZO_ROOT_USER_PASSWORD="Complexpass#123" ./openobserve


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

    **Getting glibc error running binary**

    ```shell
    ./openobserve: `/lib/libm.so.6`: version `GLIBC_2.27` not found (required by ./openobserve)
    ```

    > Download the `musl` binary instead of regular binary from [releases](https://github.com/openobserve/openobserve/releases) page that has no external dependencies. This binary is not as performant as other binaries though. We recommend running the containerized version if performance is a concern for you and are unable to make the dependencies work.

=== "Docker"

    Docker images are available at [https://gallery.ecr.aws/zinclabs/openobserve](https://gallery.ecr.aws/zinclabs/openobserve)

        docker run -v $PWD/data:/data -e ZO_DATA_DIR="/data" -p 5080:5080 \
            -e ZO_ROOT_USER_EMAIL="root@example.com" -e ZO_ROOT_USER_PASSWORD="Complexpass#123" \
            public.ecr.aws/zinclabs/openobserve:latest


    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

    **Error pulling image if you have AWS CLI installed?**

    If you have AWS CLI installed and get login error then run below command:

        aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

    
    *** Docker tags ***

    - `public.ecr.aws/zinclabs/openobserve:latest`

        Compatible with environments of most users

    - `public.ecr.aws/zinclabs/openobserve:latest-simd`

        If you want to leverage OpenObserve's support for vectorization then you should use this image. OpenObserve supports `AVX512` on intel CPUs, or `NEON` on ARM CPUs. This will help you get higher performance.

=== "Kubernetes - Manifest"

    Create a namespace:

        kubectl create ns openobserve

    Create the deployment and port forward:

        kubectl apply -f https://raw.githubusercontent.com/zinclabs/openobserve/main/deploy/k8s/statefulset.yaml

    Expose the openobserve service by port-forwarding:

        kubectl -n openobserve port-forward svc/openobserve 5080:5080

    Now point your browser to [http://localhost:5080](http://localhost:5080) and login

## Load sample data

We will use JSON API to load sample log data.

Below commands will download a sample file of real life log data, unzip it and load it in OpenObserve using the JSON ingestion API.

**Download sample data**

```shell
curl -L https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip -o k8slog_json.json.zip
unzip k8slog_json.json.zip
```

**Load sample data**

*Note*: Replace the URL you got from OpenObserve Cloud and append it with `@k8slog_json.json`

```shell title="For OpenObserve Cloud"
curl -u user@domain.com:abqlg4b673465w46hR2905 -k https://api.openobserve.ai/api/User_organization_435345/default/_json -d "@k8slog_json.json"
```

```shell title="For self hosted installation"
curl http://localhost:5080/api/default/default/_json -i -u "root@example.com:Complexpass#123"  -d "@k8slog_json.json"
```


## Search for data

Point your browser to [http://cloud.openobserve.ai](http://cloud.openobserve.ai) (for OpenObserve Cloud) / [http://localhost:5080](http://localhost:5080) (for self hosted) and login

1. Visit `logs` page
1. Select the index `default` from drop down in the left
![Logs page](./images/quickstart/logs_page.png)
1. Type `match_all('error')` in search bar and click the search button on right.

Click on the "syntax guide" button next to the search bar to see examples on how to search.

=======
# OpenObserve Quickstart Guide

This guide will help you get started with OpenObserve in under 10 minutes. You can choose between [OpenObserve Cloud](https://cloud.openobserve.ai) (recommended) or a self-hosted installation.

## Choose Your Installation Method

### [OpenObserve Cloud](https://cloud.openobserve.ai) (Recommended)

OpenObserve Cloud is the fastest way to get started and is recommended for most users because:

- **Zero maintenance**: No infrastructure setup or maintenance required
- **Generous free tier**: Suitable for hobby projects, small companies, and startups
- **Latest features**: Access to newest features and bug fixes first
- **High availability**: Built-in redundancy and reliability

### Self-Hosted Installation

Choose self-hosted if you need:

- Full control over your data and infrastructure
- Custom configurations or integrations
- On-premises deployment requirements


## Option 1: OpenObserve Cloud Setup

### Step 1: Create Your Account

1. Navigate to [https://cloud.openobserve.ai](https://cloud.openobserve.ai)
2. Sign up using social login or create a new account

    ![Sign in page](./images/quickstart/signin.png)

### Step 2: Get Your Ingestion Credentials

1. After logging in, navigate to the **Data Sources** section in the sidebar

    ![Ingestion](./images/quickstart/ingestion_credentials.png)

2. Copy the provided cURL command - it contains your unique credentials
3. Your endpoint will look like: `https://api.openobserve.ai/api/[YOUR_ORG]/default/_json`

You are ready to ingest data. Now head over to [Load sample data](#load-sample-data) section.

## Option 2: Self-Hosted Installation

**Important**: These instructions are for single-node installations. For production high-availability setups, see our [HA deployment guide](./ha_deployment.md).

You'll need to set root user credentials (ZO_ROOT_USER_EMAIL and ZO_ROOT_USER_PASSWORD) on first startup only. They are not required for subsequent runs.

### Windows Installation

1. Download the Windows binary from our [releases page](https://github.com/openobserve/openobserve/releases)
2. Open Command Prompt or PowerShell as Administrator
3. Run the following commands:

```cmd
# Command Prompt
set ZO_ROOT_USER_EMAIL=root@example.com
set ZO_ROOT_USER_PASSWORD=Complexpass#123
openobserve.exe
```

```powershell
# PowerShell
$env:ZO_ROOT_USER_EMAIL="root@example.com"
$env:ZO_ROOT_USER_PASSWORD="Complexpass#123"
.\openobserve.exe
```
> **Note:** You can set email and password based on your preference

### macOS/Linux Installation

**Option A: Quick Install Script**
```bash
# Download and install latest version automatically
curl -L https://raw.githubusercontent.com/openobserve/openobserve/main/download.sh | sh

# Run OpenObserve
ZO_ROOT_USER_EMAIL="root@example.com" ZO_ROOT_USER_PASSWORD="Complexpass#123" ./openobserve
```

**Option B: Manual Download**

1. Download the appropriate binary from our [releases page](https://github.com/openobserve/openobserve/releases)
2. Make it executable: `chmod +x openobserve`
3. Run with environment variables as shown:
```bash
# Run OpenObserve
ZO_ROOT_USER_EMAIL="root@example.com" ZO_ROOT_USER_PASSWORD="Complexpass#123" ./openobserve
```

**Troubleshooting glibc Errors**

If you see an error like `version GLIBC_2.27 not found`, download the `musl` binary instead:
- Look for files ending in `-linux-musl.tar.gz` on the releases page

> Note: musl binaries have slightly lower performance but no external dependencies

### Docker Installation

**Prerequisites**: Ensure Docker is installed and running on your system.

Docker images are available at [https://gallery.ecr.aws/zinclabs/openobserve](https://gallery.ecr.aws/zinclabs/openobserve)

```bash
# Create a data directory
mkdir -p ./openobserve-data

# Run OpenObserve container
docker run -d \
  --name openobserve \
  -v ./openobserve-data:/data \
  -e ZO_DATA_DIR="/data" \
  -e ZO_ROOT_USER_EMAIL="root@example.com" \
  -e ZO_ROOT_USER_PASSWORD="Complexpass#123" \
  -p 5080:5080 \
  public.ecr.aws/zinclabs/openobserve:latest
```

**Windows Docker Command**:
```cmd
# Windows Command Prompt
docker run -d --name openobserve -v %cd%/openobserve-data:/data -e ZO_DATA_DIR="/data" -e ZO_ROOT_USER_EMAIL="root@example.com" -e ZO_ROOT_USER_PASSWORD="Complexpass#123" -p 5080:5080 public.ecr.aws/zinclabs/openobserve:latest
```

**Docker Image Options**:

- `latest`: Compatible with most environments
- `latest-simd`: Optimized for systems with AVX512 (Intel) or NEON (ARM) for better performance

**Troubleshooting Docker Issues**:

If you encounter AWS ECR login issues:
```bash
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

### Kubernetes Installation

**Prerequisites**: Ensure `kubectl` is configured and you have cluster access.

1. Create namespace:
```bash
kubectl create namespace openobserve
```

2. Deploy OpenObserve:
```bash
kubectl apply -f https://raw.githubusercontent.com/zinclabs/openobserve/main/deploy/k8s/statefulset.yaml
```

3. Access the service:
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

### Step 1: Download Sample Data

```bash
# Download and extract sample Kubernetes logs
curl -L https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip -o k8slog_json.json.zip
unzip k8slog_json.json.zip
```

**What's in the sample data**: This file contains real Kubernetes application logs with various log levels (info, warning, error) and structured JSON fields.

### Step 2: Load Data into OpenObserve

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

### Step 3: Verify Data Upload

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

**Step 1: Access the Logs Interface**

1. Navigate to your OpenObserve instance
2. Click on **Logs** in the left sidebar
3. Select **default** from the stream dropdown (top-left)

![Logs page](./images/quickstart/logs_page.png)


**Step 2: Try These Sample Searches**

**Basic searches** (click the **Run Query** button after each):

1. **View all logs**: Leave search box empty and click search
2. **Find errors**: `level='error'` or `match_all('error')`

*Congratulations! You now have OpenObserve running with sample data.*


## Next Steps - Send Your Own Data

- **Application logs**: Use our [logging libraries](./ingestion/logs/otlp.md) for your applications
- **Metrics**: Set up [Prometheus integration](./ingestion/metrics/prometheus.md) 
- **Traces**: Configure [OpenTelemetry](./ingestion/traces/opentelemetry.md) for distributed tracing


## Troubleshooting Common Issues

**Can't access OpenObserve web interface**:

- Check if the process is running
- Verify port 5080 is not blocked by firewall
- For Docker: ensure port mapping is correct (`-p 5080:5080`)

**Authentication errors**:

- Verify your email/password combination
- For self-hosted: ensure environment variables were set correctly
- For cloud: check your account credentials

**Data not appearing**:

- Verify the curl command returned success (200 status)
- Check the time range in the web interface
- Ensure you selected the correct stream/index

**Performance issues**:

- Consider using the SIMD Docker image for better performance
- Check available memory and CPU resources
- For large datasets, consider the high-availability deployment

### Getting Support

If you're still having issues, Join our [Slack Community](https://short.openobserve.ai/community) for help
>>>>>>> 5ff082c (modified getting started page)
