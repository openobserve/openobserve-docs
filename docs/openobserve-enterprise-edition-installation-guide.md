# OpenObserve Enterprise Edition Installation Guide

[OpenObserve Enterprise Edition](https://openobserve.ai/downloads/) is the recommended version for self-hosted deployments. This comprehensive guide provides two installation methods to deploy OpenObserve Enterprise Edition on Amazon EKS.

## Overview

Choose your installation method based on your current infrastructure:

| Method | Use Case | Prerequisites |
|--------|----------|---------------|
| **Helm Chart** | Existing EKS cluster | Running EKS cluster + Helm |
| **Terraform** | New infrastructure setup | AWS CLI + Terraform + Infracost |

---

## Method 1: Helm Chart Installation
*For existing Amazon EKS clusters*

### Prerequisites Checklist
- EKS cluster is running and accessible
- [OpenObserve Helm Chart](https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve/README.md) is installed
- `kubectl` configured for your cluster

### Step-by-Step Installation

#### 1. Configure Enterprise Settings
Edit your `values.yaml` file to enable Enterprise Edition:

```yaml
enterprise:
  enabled: true
```

#### 2. Enable RBAC and SSO Components
Add the following configurations to enable [RBAC](https://openobserve.ai/docs/user-guide/identity-and-access-management/role-based-access-control/) and [SSO](https://openobserve.ai/docs/SSO/) features:

```yaml
openfga:
  enabled: true

dex:
  enabled: true
```

#### 3. Deploy the Application
Update Helm repository and deploy:

```bash
# Update repository
helm repo update

# Check if namespace exists
kubectl get namespaces
```

**If `openobserve` namespace exists:**
```bash
helm upgrade --namespace openobserve -f values.yaml o2 openobserve/openobserve
```

**If `openobserve` namespace doesn't exist:**
```bash
kubectl create ns openobserve
helm upgrade --namespace openobserve -f values.yaml o2 openobserve/openobserve
```

#### 4. Verify Deployment
Confirm all pods are running:

```bash
kubectl get pods -n openobserve
```

**Expected Result:** All pods should show status `Running`

---

## Method 2: Terraform Infrastructure Setup
*For new EKS cluster deployment*

### Overview
This method uses the [openobserve-eks-iac repository](https://github.com/openobserve/openobserve-eks-iac/tree/main) to automate infrastructure setup. Only one manual step required: DNS configuration in Amazon Route 53.

### Prerequisites Installation
Ensure these tools are installed:

- [Terraform](https://www.terraform.io/downloads.html)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [Infracost](https://www.infracost.io/docs/)

### Environment Configuration
Set up required environment variables:

```bash
export ENV=dev                    # Environment: dev/staging/prod
export CUSTOMER_NAME=example      # Customer identifier
export AWS_PROFILE=my-aws-profile # AWS authentication profile
```

### Installation Process

#### Step 1: Configure Variables
Update `terraform.tfvars` with your settings:

```hcl
root_user_email    = "example@openobserve.ai"
root_user_password = "CustomSecurePassword123"
o2_domain         = "example.openobserve.ai"
O2_dex_domain     = "example-auth.openobserve.ai"
secret_name       = "example"
```

#### Step 2: Initialize Infrastructure
Download modules and initialize Terraform:

```bash
make init ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```

**Example:**
```bash
make init ENV=dev CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

#### Step 3: Review Changes
Preview infrastructure changes:

```bash
make plan ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```

**Example:**
```bash
make plan ENV=dev CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

#### Step 4: Apply Infrastructure
Execute the infrastructure deployment:

```bash
make apply ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```

**Example:**
```bash
make apply ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

#### Step 5: Install Dependencies
Run pre-setup to install required dependencies:

```bash
make o2_pre_setup ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```

**Example:**
```bash
make o2_pre_setup ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

#### Step 6: Deploy OpenObserve
Deploy the Enterprise Edition using Helm:

```bash
make o2_deployment ENV=<environment> CUSTOMER_NAME=<customer> AWS_PROFILE=<aws_profile>
```

**Example:**
```bash
make o2_deployment ENV=prod CUSTOMER_NAME=example AWS_PROFILE=my-aws-profile
```

### Verification
The [output.tf](https://github.com/openobserve/openobserve-eks-iac/tree/main?tab=readme-ov-file#5-output-and-state-management) file confirms successful deployment. Upon completion, you'll have access to OpenObserve Enterprise Edition with all features enabled.

---

## Alternative: OpenTofu Usage

To use **OpenTofu** instead of Terraform:

1. Install [OpenTofu](https://opentofu.org/docs/intro/install/)
2. Modify the **provider.tf** file
3. Use the **Makefile** from the [opentofu directory](https://github.com/openobserve/openobserve-eks-iac/tree/main/opentofu)

---

## Support & Community

For technical support and community discussions:

- **Slack Community:** [Join our Slack channel](https://short.openobserve.ai/community)
- **Documentation:** [OpenObserve Documentation](https://openobserve.ai/docs/)

---

## Additional Resources

- [RBAC Configuration Guide](../docs/user-guide/identity-and-access-management/enable-rbac-in-openobserve-enterprise.md)
- [Helm Chart Repository](https://github.com/openobserve/openobserve-helm-chart/blob/main/charts/openobserve/README.md)
- [Terraform Modules Overview](https://github.com/openobserve/openobserve-eks-iac/blob/main/README.md#terraform-overview)