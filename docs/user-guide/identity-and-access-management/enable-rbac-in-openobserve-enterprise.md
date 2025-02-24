This guide provides instructions for enabling Role-Based Access Control (RBAC) in OpenObserve Enterprise Edition. OpenObserve uses OpenFGA to manage RBAC.

#### Before You Begin

- Review the [Role-Based Access Control (RBAC) User Guide](role-based-access-control.md) to understand how RBAC works in OpenObserve.
- Ensure you meet all prerequisites before starting the installation.

## Prerequisites

Before enabling RBAC, ensure the following:

- You must have **OpenObserve Enterprise Edition** installed and running. Refer to the [OpenObserve Enterprise Edition Installation Guide](openObserve-enterprise-edition-installation-guide.md).
- You must have **administrator access** to the system where OpenObserve is deployed.

## Step 1: Install OpenFGA

OpenFGA must be installed before using RBAC. It can be installed using:

- **Helm Chart (Recommended Method)**
- **Alternative Methods** (Docker, Docker Compose, Package Manager, Pre-compiled Binaries, or Building from Scratch)

### Option 1: Install OpenFGA Using Helm Chart

Helm Chart is a package manager for Kubernetes, and its configuration is stored in a file called `values.yaml`.

#### Prerequisite

Ensure you have **Kubernetes** and the **OpenObserve Helm Chart** installed.

#### To enable RBAC using Helm Chart:

1. Set `openfga.enabled: true` in `values.yaml` file.

   Navigate to the `values.yaml` file in the OpenObserve Helm chart repository and update this configuration as follows:

   ```yaml
   openfga:
       enabled: true
       parameters:
         O2_OPENFGA_LIST_ONLY_PERMITTED: "false"
         O2_MAP_GROUP_TO_ROLE: "true"
         O2_MAP_GROUP_TO_ROLE_SKIP_CREATION: "false"
         O2_OPENFGA_PAGE_SIZE: "100"
       image:
         repository: openfga/openfga
         tag: latest
         pullPolicy: IfNotPresent
    ```
2. Run the following commands to update Helm:

```sh
helm repo update
kubectl get namespaces
```
- If the output shows **openobserve**, run the `helm upgrade` command.

- If the output does not show **openobserve**, run the `kubectl create` command before executing the `helm upgrade` command: 
    ```sh 
    kubectl create ns openobserve
    ```
```sh
helm upgrade --namespace openobserve -f values.yaml o2 openobserve/openobserve
```

3. After deployment, verify if all the pods are in a running state:

```sh
kubectl get pods -n openobserve
```
**Expected output:** All pods should be in the `Running` state.


### Option 2: Install OpenFGA Without Helm

If you prefer not to use Helm, OpenFGA can be installed and run using other methods:

1. [Docker](https://openfga.dev/docs/getting-started/setup-openfga/docker)
2. [Docker Compose](https://github.com/openfga/openfga?tab=readme-ov-file#docker-compose)  
3. [Package Manager](https://github.com/openfga/openfga?tab=readme-ov-file#package-managers)
4. [Pre-compiled Binaries](https://github.com/openfga/openfga?tab=readme-ov-file#pre-compiled-binaries)
5. [Building from Scratch](https://github.com/openfga/openfga?tab=readme-ov-file#building-from-source)

**Impportant Note:** 
- When installing OpenFGA, you must run the OpenFGA and OpenObserve servers separately.

    - Refer to the respective installation links for instructions on running the OpenFGA server. Ensure that you run the `openfga migrate` command before running the `openfga run` command.
    - Check the [Quickstart guide](https://openobserve.ai/docs/quickstart/#openobserve-cloud) for steps to run the OpenObserve server.

- For Helm chart installations, deploying the Helm chart is sufficient.

## Step 2: Configure OpenFGA Environment Variables

After the OpenFGA server is up and running, update the following environment variables:

**Note:** If you enabled OpenFGA using Kubernetes with OpenObserve Helm charts, you do not need to set the `O2_OPENFGA_ENABLED` and `O2_OPENFGA_BASE_URL` environment variables manually. Setting OpenFGA in the `values.yaml` file is sufficient.

### Required Environment Variables

- **`O2_OPENFGA_ENABLED` (Required)**
  - **Default:** `false`
  - Determines whether OpenFGA is enabled. Set this value to `true` to enable OpenFGA.

- **`O2_OPENFGA_BASE_URL` (Required)**
  - Enter the URL of the OpenFGA server.  
    **Example:** If the OpenFGA server is running locally on port `8080`, set this to:
    ```
    http://localhost:8080
    ```

### Optional Environment Variables

- **`O2_OPENFGA_STORE_NAME`**
  - **Default:** `openobserve`
  - Specifies the name of the OpenFGA store. Default value is sufficient.

- **`O2_OPENFGA_PAGE_SIZE`**
  - **Default:** `100`
  - Defines the number of records inserted into the OpenFGA database at a time.

- **`O2_OPENFGA_LIST_ONLY_PERMITTED`**
  - **Default:** `false`
  - If `O2_OPENFGA_LIST_ONLY_PERMITTED` is set to `true`, assigning only the `List` permission to a resource (such as Alerts) will not allow users to see its contents.  
    **Example**: If a user has the `List` permission for alerts, the **Alerts** page will appear empty, but no error will be shown. To allow users to see alerts, you must also assign them the `Get` permission.


