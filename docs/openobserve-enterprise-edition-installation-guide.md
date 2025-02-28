[OpenObserve Enterprise Edition](https://openobserve.ai/downloads/) is the recommended version for self-hosted deployments. This guide provides step-by-step instructions to install OpenObserve Enterprise Edition.

## Installation Methods

- [Helm Chart](#option-1-helm-chart): Use this method if you have an existing Amazon Elastic Kubernetes Service (EKS) cluster.
- [Terraform](#option-2-terraform): Use this method if you do not have an existing EKS cluster.

## Option 1: Helm Chart
This workflow shows how to Install OpenObserve Enterprise Edition in an Existing Amazon Elastic Kubernetes Service (EKS) Cluster using Helm Chart

### Prerequisites

Before you begin, verify that:

- Your Kubernetes cluster is running.
- The OpenObserve Helm Chart is installed. Refer to the [OpenObserve Helm Chart Installation Guide](https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve/README.md).

### Step 1: Configure the `values.yaml` File

Navigate to the enterprise section in the `values.yaml` file and set the `enterprise.enabled` parameter to `true` as shown below:

```yaml
enterprise:
  enabled: true
```
### Step 2: Enable Role-Based Access Control (RBAC) and Single Sign-On (SSO)
This configuration is necessary to enable [RBAC](https://openobserve.ai/docs/user-guide/identity-and-access-management/role-based-access-control/) and [SSO](https://openobserve.ai/docs/SSO/) features in the OpenObserve Enterprise Edition. In the `values.yaml` file, enable OpenFGA and Dex by setting their values to `true`:

```yaml
openfga:
  enabled: true
```
```yaml
dex:
  enabled: true
```
### Step 3: Deploy the Helm Chart
Update the Helm repository:

```yaml
helm repo update
```

Verify if the openobserve namespace exists:

```yaml
kubectl get namespaces
```

If the output shows the `openobserve` namespace, run the following command:

```yaml
helm upgrade --namespace openobserve -f values.yaml o2 openobserve/openobserve
```

If the output does not show the openobserve namespace, create the namespace first and then run the helm upgrade command:

```yaml
kubectl create ns openobserve 
```
```yaml
helm upgrade --namespace openobserve -f values.yaml o2 openobserve/openobserve
```

### Step 4: Verify Deployment Status
After deployment, verify that all pods are running:

```yaml 
kubectl get pods -n openobserve
```

**Expected Output**: All pods should be listed with a status of `Running`. 

**For support, reach out in the [Slack channel](https://short.openobserve.ai/community).** 

## Option 2: Terraform 

Use this method if you do not have an existing Amazon EKS cluster. This workflow sets up the infrastructure required to deploy OpenObserve Enterprise Edition on an EKS cluster. <br>
**Note:** The [openobserve-eks-iac repository](https://github.com/openobserve/openobserve-eks-iac/tree/main) includes Terraform configuration files and other resources that automate the setup. The following setup process handles nearly all tasks automatically, with only one manual step required: Configuring your DNS in Amazon Route 53 using the Network Load Balancer (NLB).

### Prerequisites
Verify that the following tools are installed:

- [Terraform](https://www.terraform.io/downloads.html) 
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [Infracost](https://www.infracost.io/docs/)

### Configure Environment Variables
Set up the following environment variables:
- `ENV`: The environment you are targeting (e.g., `dev`, `staging`, or `prod`).
- `CUSTOMER_NAME`: The name of the customer for whom the infrastructure is managed.
- `AWS_PROFILE`: The AWS profile to use for authentication.

### Step 1. Configure Variables in `terraform.tfvars` (init)
Navigate to the terraform.tfvars file and update as required:
- `root_user_email`    = "`example@openobserve.ai`" 
- `root_user_password` = "`CustomSecurePassword123`" 
- `o2_domain` = "`example.openobserve.ai`" 
- `O2_dex_domain` = "`example-auth.openobserve.ai`" 
- `secret_name`  = "`example`" 

### Step 2: Initialize Terraform (init)
Run the following command to download all necessary Terraform modules and providers, and initialize the working directory containing your configuration files:
```yaml
make init ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```
**Example:**
```yaml
make init ENV=dev CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

### Step 3: Plan Terraform Changes (plan)
The following command shows the proposed changes Terraform will apply to the infrastructure without making any actual changes. 
```yaml
make plan ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```
**Example:**
```yaml
make plan ENV=dev CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

### Step 4: Apply Terraform Changes (apply)
Execute the following command to apply the changes:
```yaml
make apply ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```
**Example:**
```yaml
make apply ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

### Step 5: Run the Pre-Setup to Install Dependencies (`o2_pre_setup`)
After applying, run the following command:
```yaml
make o2_pre_setup ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```
**Example:**
```yaml
make o2_pre_setup ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

### Step 6: Deploy OpenObserve Enterprise Edition on EKS (`o2_deployment`)
The following command deploys the OpenObserve Helm Chart using `o2_deployment`:

```yaml
make o2_deployment ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```
**Example:**
```yaml
make o2_deployment ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

**Note**: To use **OpenTofu** instead of Terraform, you need to modify the **provider.tf** and then use the **Makefile** that is placed under the [opentofu directory](https://github.com/openobserve/openobserve-eks-iac/tree/main/opentofu). 
<br>Ensure that you have [OpenTofu](https://opentofu.org/docs/intro/install/) installed. 


