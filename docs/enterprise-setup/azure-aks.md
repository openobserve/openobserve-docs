---
description: >-
  Install OpenObserve Enterprise on Azure Kubernetes Service (AKS) using Azure
  Blob Storage and CloudNativePG. Step-by-step guide with CLI and Azure Portal
  paths, per-step troubleshooting, verification, and a consolidated
  troubleshooting reference.
---
# Install OpenObserve Enterprise on Azure AKS

Install OpenObserve Enterprise on a 3-node AKS cluster with Azure Blob Storage, CloudNativePG for Postgres, and HA NATS.

> For support, reach out in the [Slack channel](/marketing-opt-in/){:target="_blank" rel="noopener noreferrer"}.

!!! info "Architecture overview"
    OpenObserve Enterprise Edition depends on these components:

    - **Object Storage** (Azure Blob): Holds all telemetry data in Parquet format.
    - **PostgreSQL** (CloudNativePG): Tracks metadata such as dashboards, stream configurations, users, and the filelist table.
    - **NATS**: Coordinates communication between ingestion and query nodes.
    - **Dex and OpenFGA**: Power [Single Sign-On (SSO)](../user-guide/account-administration/identity-and-access-management/sso.md) and [Role-Based Access Control (RBAC)](../user-guide/account-administration/identity-and-access-management/role-based-access-control.md).

This page covers the **Azure AKS** install. For other Kubernetes platforms, see [Amazon EKS](amazon-eks.md) or [Google GKE](google-gke.md).

**Time required:** ~30 minutes (most of it waiting for AKS to provision).

??? info "Prerequisites"

    Complete every item in this section before starting Step 1.

    ### Required CLI tools

    All commands in this guide assume these are on your `PATH`:

    | Tool | macOS | Linux | Verify |
    |---|---|---|---|
    | Azure CLI | `brew install azure-cli` | [install guide](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) | `az version` |
    | kubectl | `brew install kubectl` | [install guide](https://kubernetes.io/docs/tasks/tools/) | `kubectl version --client` |
    | Helm v3 | `brew install helm` | [install guide](https://helm.sh/docs/intro/install/) | `helm version` |

    ### Azure subscription

    You need a **Pay-As-You-Go** subscription. Free Trial, Student, and MSDN subscriptions can't self-serve a vCPU quota increase from the Quotas page; they can only request one via a support ticket.

    ### vCPU quota

    A 3-node `Standard_B4s_v2` cluster needs **12 vCPUs** each of `Total Regional vCPUs` and `Standard Bsv2 Family vCPUs`, in your target region. Request both at [Quotas → Compute](https://portal.azure.com/#view/Microsoft_Azure_Capacity/QuotaMenuBlade/~/myQuotas) (filter by Compute and your region), then confirm:

    ```bash
    az vm list-usage --location <region> \
      --query "[?contains(name.value, 'cores') || contains(name.value, 'Bsv2')]" -o table
    ```

    ### Login and resource provider

    ```bash
    az login
    az account show --query state -o tsv                 # expect: Enabled
    az provider register --namespace Microsoft.Storage   # required for Step 5; one-time per subscription
    ```

    If you have multiple subscriptions: `az account set --subscription "<id-or-name>"`.

    ### Environment variables

    ```bash
    export RESOURCE_GROUP=openobserve-rg
    export CLUSTER_NAME=openobserve-aks
    export LOCATION=centralindia
    export NAMESPACE=openobserve
    ```

??? "Step 1. Create the Resource Group"

    === "CLI (recommended)"

        ```bash
        az group create --name $RESOURCE_GROUP --location $LOCATION
        ```

    === "Azure Portal"

        1. Open **Resource groups** → **+ Create**.
        2. Name: `openobserve-rg`. Region: your choice.
        3. **Review + Create** → **Create**.

    ??? note "Verify"

        **Verification step**

        ```bash
        az group show --name $RESOURCE_GROUP
        ```

        **Expected output**

        JSON for the resource group. Look for `"provisioningState": "Succeeded"`.

??? "Step 2. Create the AKS cluster"

    This provisions a managed AKS control plane and 3 nodes. Takes about 5 to 10 minutes.

    === "CLI (recommended)"

        ```bash
        az aks create \
          --resource-group $RESOURCE_GROUP \
          --name $CLUSTER_NAME \
          --location $LOCATION \
          --node-count 3 \
          --node-vm-size Standard_B4s_v2 \
          --enable-managed-identity \
          --generate-ssh-keys \
          --tier free
        ```

    === "Azure Portal"

        1. Open **Kubernetes services** → **+ Create** → **Kubernetes cluster**.
        2. Configure cluster:

            - **Resource group:** `openobserve-rg`
            - **Cluster name:** `openobserve-aks`
            - **Region:** your region
            - **Preset configuration:** Dev/Test (Standard)
            - **Node size:** `Standard_B4s_v2`
            - **Node count:** 3
            - **Pricing tier:** Free
        3. **Review + Create** → wait for `Succeeded`.

    ??? note "Verify"

        **Verification step**

        ```bash
        az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME
        ```

        **Expected output**

        JSON for the AKS cluster. Look for `"provisioningState": "Succeeded"` and a non-empty `"fqdn"`.

??? "Step 3. Connect kubectl to the cluster"

    ### Command

    ```bash
    az aks get-credentials \
      --resource-group $RESOURCE_GROUP \
      --name $CLUSTER_NAME \
      --overwrite-existing
    ```

    ??? note "Verify"

        **Verification step**

        ```bash
        kubectl get nodes
        ```

        **Expected output**

        ```
        NAME                          STATUS   ROLES    AGE   VERSION
        aks-nodepool1-...-vmss000000  Ready    <none>   3m    v1.34.X
        aks-nodepool1-...-vmss000001  Ready    <none>   3m    v1.34.X
        aks-nodepool1-...-vmss000002  Ready    <none>   3m    v1.34.X
        ```

??? "Step 4. Install CloudNativePG"

    The chart provisions Postgres via CNPG, which must be installed cluster-wide first.

    ### Command

    ```bash
    kubectl apply --server-side -f \
      https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.22/releases/cnpg-1.22.1.yaml
    ```

    ??? note "Verify"

        **Verification step**

        Wait about 30 seconds, then:

        ```bash
        kubectl get pods -n cnpg-system
        ```

        **Expected output**

        ```
        NAME                                       READY   STATUS    RESTARTS   AGE
        cnpg-controller-manager-XXXXXXXXXX-XXXXX   1/1     Running   0          1m
        ```

??? "Step 5. Create the storage account and container"

    OpenObserve writes telemetry data to Azure Blob via the S3-compatible API.

    ### Command

    Pick a globally unique storage account name (3 to 24 chars, lowercase letters and digits only, no hyphens):

    ```bash
    export STORAGE_ACCOUNT_NAME=ooblob$(date +%s | tail -c 5)
    echo "Storage account: $STORAGE_ACCOUNT_NAME"
    ```

    Create the storage account, container, and capture the access key:

    ```bash
    az storage account create \
      --name $STORAGE_ACCOUNT_NAME \
      --resource-group $RESOURCE_GROUP \
      --location $LOCATION \
      --sku Standard_LRS

    az storage container create \
      --account-name $STORAGE_ACCOUNT_NAME \
      --name openobserve-data \
      --auth-mode login

    SA_KEY=$(az storage account keys list \
      --resource-group $RESOURCE_GROUP \
      --account-name $STORAGE_ACCOUNT_NAME \
      --query '[0].value' -o tsv)
    ```

    ??? note "Verify"

        **Verification step**

        ```bash
        az storage account show --name $STORAGE_ACCOUNT_NAME
        az storage container show --name openobserve-data \
          --account-name $STORAGE_ACCOUNT_NAME --auth-mode login
        echo "Key length: ${#SA_KEY}"
        ```

        **Expected output**

        - Storage account JSON with your name and region.
        - Container JSON for `openobserve-data`.
        - `Key length: 88` (non-zero).

??? "Step 6. Add the Helm repo and fetch `values.yaml`"

    ### Command

    ```bash
    helm repo add openobserve https://charts.openobserve.ai
    helm repo update
    curl -o values.yaml \
      https://raw.githubusercontent.com/openobserve/openobserve-helm-chart/main/charts/openobserve/values.yaml
    ```

    ??? note "Verify"

        **Verification step**

        ```bash
        helm repo list | grep openobserve
        ls -lh values.yaml
        ```

        **Expected output**

        - `openobserve` repo is listed.
        - `values.yaml` is present (around 43 KB).

??? "Step 7. Configure `values.yaml`"

    Open `values.yaml` in your editor. The fields to set are in the active (uncommented) sections. Be careful not to edit the commented `# AZURE_STORAGE_*` example block at the top of the file (around lines 163 to 167).

    ### 7a. Auth section (~line 186 to 187)

    ```yaml
    auth:
      AZURE_STORAGE_ACCOUNT_KEY: "<your storage key from Step 5>"
      AZURE_STORAGE_ACCOUNT_NAME: "<your storage account name>"
    ```

    Keep the default email/password for testing (`root@example.com` / `Complexpass#123`), or change them.

    ### 7b. Config section (~line 378 to 381)

    ```yaml
    config:
      ZO_S3_PROVIDER: "azure"
      ZO_S3_BUCKET_NAME: "openobserve-data"
    ```

    ### 7c. Multi-node defaults (verify they remain set)

    ```yaml
    nats:
      config:
        cluster:
          enabled: true
          replicas: 3

    postgres:
      spec:
        instances: 2

    config:
      ZO_NATS_REPLICAS: "3"
    ```

    ### 7d. (Optional) Enable RBAC and SSO

    ```yaml
    enterprise:
      openfga:
        enabled: true
      dex:
        enabled: true
    ```

    ??? note "Verify"

        **Verification step**

        ```bash
        grep -nE "AZURE_STORAGE_ACCOUNT_(NAME|KEY):|ZO_S3_PROVIDER:|ZO_S3_BUCKET_NAME:|ZO_NATS_REPLICAS:|instances: 2|enabled: true" values.yaml
        ```

        **Expected output**

        Your storage account name is set, `ZO_S3_PROVIDER: "azure"`, `ZO_S3_BUCKET_NAME: "openobserve-data"`, `ZO_NATS_REPLICAS: "3"`, `instances: 2`, and `cluster.enabled: true`.

??? "Step 8. Install OpenObserve"

    ### Command

    ```bash
    kubectl create namespace $NAMESPACE
    helm install openobserve openobserve/openobserve -n $NAMESPACE -f values.yaml
    ```

    ??? note "Verify"

        **Verification step**

        ```bash
        helm status openobserve -n $NAMESPACE
        kubectl get pods -n $NAMESPACE
        ```

        Re-run `kubectl get pods` every minute or so for about 5 minutes. Progression:

        1. Pods start in `Init:0/1` or `Pending`.
        2. NATS, OpenFGA, and Postgres come up first.
        3. Ingester, querier, alertmanager, compactor, and router follow once Postgres is ready.
        4. Final state: every pod `1/1 Running` (or `2/2` for NATS) with stable `RESTARTS`.

        **Expected output**

        ```
        NAME                                     READY   STATUS    RESTARTS   AGE
        openobserve-alertmanager-0               1/1     Running   0          5m
        openobserve-compactor-XXXXXXXXX-XXXXX    1/1     Running   0          5m
        openobserve-ingester-0                   1/1     Running   0          5m
        openobserve-nats-0                       2/2     Running   0          5m
        openobserve-nats-1                       2/2     Running   0          5m
        openobserve-nats-2                       2/2     Running   0          5m
        openobserve-nats-box-XXXXXXXXX-XXXXX     1/1     Running   0          5m
        openobserve-openfga-XXXXXXXXX-XXXXX      1/1     Running   0          5m
        openobserve-postgres-1                   1/1     Running   0          5m
        openobserve-postgres-2                   1/1     Running   0          4m
        openobserve-querier-0                    1/1     Running   0          5m
        openobserve-router-XXXXXXXXX-XXXXX       1/1     Running   0          5m
        ```

??? "Step 9. Open the OpenObserve UI"

    ### Command

    ```bash
    kubectl --namespace $NAMESPACE port-forward svc/openobserve-router 5080:5080
    ```

    Leave the terminal running, then open <http://localhost:5080>. Log in with the credentials from Step 7a (default: `root@example.com` / `Complexpass#123`).

    ??? note "Verify"

        **Verification step**

        From a second terminal, send a synthetic record:

        ```bash
        curl -u 'root@example.com:Complexpass#123' \
          -X POST 'http://localhost:5080/api/default/default/_json' \
          -H 'Content-Type: application/json' \
          -d '[{"level":"info","message":"hello from azure","timestamp":"2026-01-01T00:00:00Z"}]'
        ```

        **Expected output**

        ```json
        {"code":200,"status":[{"name":"default","successful":1,"failed":0}]}
        ```

        In the UI: **Logs** → org `default` → stream `default`. The record appears.

## Load Sample Data

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
    {"code":200,"status":[{"name":"default","successful":1000,"failed":0}]}
    ```

    If you see errors, check:

    - Your credentials are correct
    - The JSON file was downloaded completely
    - OpenObserve is running and accessible

## Search Your Data

??? "Step 1: Access the Logs Interface"

    1. Navigate to your OpenObserve instance
    2. Click on **Logs** in the left sidebar
    3. Select **default** from the stream dropdown (top-left)

    ![Logs page](../images/quickstart/logs_page.png)

??? "Step 2: Try These Sample Searches"

    **Basic searches** (click the **Run Query** button after each):

    1. **View all logs**: Leave search box empty and click search
    2. **Find errors**: `level='error'` or `match_all('error')`

## Next Steps - Send Your Own Data

- **Application logs**: Use our [logging libraries](../ingestion/logs/otlp.md) for your applications
- **Metrics**: Set up [Prometheus integration](../ingestion/metrics/prometheus.md)
- **Traces**: Configure [OpenTelemetry](../ingestion/traces/opentelemetry.md) for distributed tracing

??? "Teardown"

    Run these commands in order. **Order matters**. Skipping `helm uninstall` before deleting the cluster leaves orphaned disks that quietly accumulate cost.

    ```bash
    # 1. Release Kubernetes resources (frees PVCs → releases Azure disks)
    helm uninstall openobserve -n $NAMESPACE
    kubectl delete pvc -n $NAMESPACE --all
    kubectl delete namespace $NAMESPACE

    # 2. Delete the AKS cluster (~5-10 min)
    az aks delete --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --yes --no-wait

    # 3. Delete the storage account (and its blob container)
    az storage account delete --name $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP --yes

    # 4. Delete the resource group (full wipe. Removes everything above plus any other resources in it)
    az group delete --name $RESOURCE_GROUP --yes
    ```

    If you only want to remove OpenObserve and keep the cluster, run step 1 only. If you want to keep the resource group (for example, other workloads share it), stop after step 3.

??? note "Troubleshooting reference"

    Issues are grouped by theme. Each entry notes the step where it tends to surface.

    **Subscription and IAM**

    - **`AuthorizationFailed` creating the resource group** (Step 1). Your account lacks `Microsoft.Resources/subscriptions/resourceGroups/write` on the subscription. **Fix:** have a subscription owner grant you `Contributor` at the subscription scope, or use a different subscription.

    - **Quota request says `Ineligible for adjustment`** (Prerequisites). Subscription is not Pay-As-You-Go. **Fix:** upgrade the subscription per the Azure subscription prerequisite.

    **Quotas and SKUs**

    - **`N vCPUs needed, only M remain` when creating the cluster** (Step 2). Quota too low. **Fix:** revisit the vCPU quota prerequisite and request both `Total Regional vCPUs` and `Standard Bsv2 Family vCPUs` to at least 12 each.

    - **`The VM size X is not allowed in your subscription in location`** (Step 2). That SKU is gated for your subscription in the chosen region. **Fix:** the error message includes an `available VM sizes` list. Pick one of `B4s_v2`, `D4s_v5`, or `D4as_v5` from that list.

    - **`The zone(s) 'N' for resource 'agentpool' is not supported`** (Step 2). The region or SKU does not support that availability zone. **Fix:** omit the zone setting, or pick zones that are supported (try 2 and 3 if 1 fails).

    **Cluster connectivity**

    - **`no such host: <fqdn>` from kubectl on macOS** (Step 3). Local DNS cache or kubeconfig is stale. **Fix:**

        ```bash
        nslookup <fqdn> 8.8.8.8
        sudo dscacheutil -flushcache
        sudo killall -HUP mDNSResponder
        az aks get-credentials \
          --resource-group $RESOURCE_GROUP \
          --name $CLUSTER_NAME \
          --overwrite-existing
        ```

        If `nslookup` via 8.8.8.8 resolves but local doesn't, the problem is your DNS resolver, not Azure. If the FQDN in the error is from a *previous* cluster (recreated with the same name), `--overwrite-existing` fixes the stale kubeconfig entry.

    - **Authentication errors from kubectl** (Step 3). **Fix:** re-run `az login`, then `az aks get-credentials --overwrite-existing`.

    - **API hangs or is very slow.** Cluster is still provisioning. **Fix:** `az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --query provisioningState -o tsv`. Wait for `Succeeded`.

    **Storage account**

    - **`is not a valid storage account name`** (Step 5). Names cannot have hyphens, uppercase letters, or special characters. **Fix:** use 3 to 24 lowercase letters and digits only.

    - **`is already taken`** (Step 5). Storage account names are globally unique across Azure. **Fix:** append more digits to your name and retry.

    - **`SubscriptionNotFound` on a working subscription** (Step 5). `Microsoft.Storage` resource provider is not registered. **Fix:** `az provider register --namespace Microsoft.Storage`, then poll until `registrationState` is `Registered`.

    - **Shell complains about `$SA_KEY = ...` syntax** (Step 5). That `$VAR = ...` form is PowerShell. **Fix:** use `SA_KEY=$(...)` on bash or zsh as shown in Step 5.

    **Postgres and CNPG**

    - **`ImagePullBackOff` on the CNPG operator pod** (Step 4). Egress or registry issue. **Fix:** `kubectl describe pod -n cnpg-system <pod>` for details; check outbound internet from the cluster.

    - **Manifest deploys to `cnpg-system`, not `cnpg`.** The 1.22 manifest uses the `cnpg-system` namespace. If older docs reference `cnpg`, check both.

    **Helm and `values.yaml`**

    - **`wget: command not found` on macOS** (Step 6). **Fix:** use `curl -O <url>` instead, or `brew install wget`.

    - **`helm repo add` reports the repo already exists** (Step 6). **Fix:** run `helm repo update` and continue.

    - **Storage key set in the commented `# AZURE_STORAGE_*` block but pods can't find it** (Step 7). The file has the same field names in both the commented example and the active `auth:` section. Only the active one is applied at install time. **Fix:** edit the active `auth:` block (around line 186 to 187), not the comment example (around line 163 to 164).

    - **Changes to `config:` values don't appear in pod env** (Step 7). Some keys are skipped from the rendered ConfigMap. **Fix:** set them via `<component>.extraEnv:` instead. That path is always passed through.

    - **`helm upgrade` succeeds but pods don't restart.** StatefulSet pods take time to roll. **Fix:** force with `kubectl rollout restart statefulset -n openobserve`.

    - **`helm uninstall` leaves PVCs behind.** Helm doesn't manage PVCs created by StatefulSets. **Fix:** `kubectl delete pvc -n openobserve --all` before reinstall.

    **Pod runtime**

    - **`replicas > 1 not supported in non-clustered mode` in pod logs** (Step 8). `nats.config.cluster.enabled` and `ZO_NATS_REPLICAS` disagree. **Fix:** set `cluster.enabled: true`, `replicas: 3`, and `ZO_NATS_REPLICAS: "3"`, then `helm upgrade`.

    - **Pods crash with `pool timed out while waiting for an open connection`** (Step 8). Postgres connection pool starved. Rare on a 3-node cluster. **Fix:** check Postgres health with `kubectl logs -n $NAMESPACE openobserve-postgres-1`. If storage is slow, switch to Premium SSD (see **Resource pressure** below).

    - **Router pod stuck `0/1` for more than 5 minutes** (Step 8). Startup probe is failing before app deps are ready. **Fix:** bump `probes.router.config.startupProbe.failureThreshold` in `values.yaml` from `3` to `30`, then `helm upgrade`.

    - **Pod stuck `Pending` with `volume node affinity conflict`** (Step 8). The PVC's storage class is locked to a zone with no schedulable node. **Fix:** use a `WaitForFirstConsumer` storage class. The default `managed-csi` already is.

    **UI and access**

    - **Port-forward says `connection refused`** (Step 9). The router pod is not Ready. **Fix:** confirm with `kubectl get pod -n $NAMESPACE -l app=openobserve-router`, then retry.

    - **Browser shows a spinner forever** (Step 9). The router was killed and restarted. **Fix:** inspect `kubectl logs -n $NAMESPACE <router-pod>` and address the underlying error.

    - **`curl` returns `401 Unauthorized`** (Step 9). Credentials don't match the active `auth.ZO_ROOT_USER_EMAIL` / `ZO_ROOT_USER_PASSWORD` in `values.yaml`. **Fix:** update `values.yaml`, `helm upgrade`, and retry.

    **Resource pressure**

    - **Pods stuck in `Pending`.** Node out of CPU or RAM. **Fix:** `kubectl describe node`. If under pressure, scale up VM size or add nodes.

    - **`exceed max volume count`.** Too many PVCs on a single node. **Fix:** spread across nodes (multi-node helps), or shrink volume sizes / disable persistence on non-critical components (`compactor.persistence.enabled: false`).

    - **Postgres is slow on small disks.** Standard HDD with throttled IOPS. **Fix:** set `postgres.spec.storage.storageClass: managed-csi-premium` and `size: 32Gi`.

**Need help:**

  [Community Slack](https://short.openobserve.ai/community)
  
  [GitHub issues](https://github.com/openobserve/openobserve/issues)
