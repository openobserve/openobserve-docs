---
title: Terraform Support — Infrastructure-as-Code for OpenObserve | OpenObserve
description: >-
  Deploy OpenObserve on Kubernetes and manage its resources (streams,
  dashboards, users, organizations) as code with the official Terraform
  provider and Kubernetes module. OpenTofu supported. Apache 2.0 licensed.
keywords: 'openobserve, terraform, iac, opentofu, helm, kubernetes, eks, provider, module'
---
# Terraform Support

Manage OpenObserve as code. OpenObserve ships **two complementary Terraform modules** that together cover the full lifecycle: deploying the platform itself, and managing the resources that run inside it.

> For support, reach out in the [Slack channel](/marketing-opt-in/){:target="_blank" rel="noopener noreferrer"}.

| Module | Purpose | Source |
|---|---|---|
| `terraform-provider-openobserve` | Manage OpenObserve resources (streams, dashboards, users, organizations) as code | [Terraform Registry](https://registry.terraform.io/providers/openobserve/openobserve/latest) · [GitHub](https://github.com/openobserve/terraform-provider-openobserve) |
| `terraform-kubernetes-openobserve` | Deploy OpenObserve on Kubernetes via the official Helm chart, optionally provisioning the underlying AWS infrastructure | [Terraform Registry](https://registry.terraform.io/modules/openobserve/openobserve/kubernetes) · [GitHub](https://github.com/openobserve/terraform-kubernetes-openobserve) |

Both are **Apache 2.0** licensed and work with **OpenTofu** as well as Terraform.
## Prerequisites

- **Terraform ≥ 1.9**. OpenTofu is also supported. Verify with `terraform version` or `tofu version`.
- For the **provider**: a reachable OpenObserve endpoint and credentials (root user or a user with sufficient permissions). See [Provider configuration](#provider-configuration) for environment-variable alternatives.
- For the **Kubernetes module**: a Kubernetes cluster (≥ 1.25) with a default StorageClass, plus `kubectl` configured for post-deploy verification. If you set `create_aws_infrastructure = true`, you also need AWS credentials with permissions to create VPCs, EKS clusters, S3 buckets, and IAM roles.

## Terraform Provider

The OpenObserve provider manages streams, dashboards, users, and other resources via the **OpenObserve REST API**. Define them in `.tf` files and apply them through the standard `plan` → `apply` → `review` cycle — the same way you manage the rest of your infrastructure.

### Supported resources

Managed (created and updated by the provider):

- **`openobserve_stream`** — stream settings: data retention, indexed fields, full-text search keys, bloom filter fields, and partition keys. Required: `name`, `org_id`, `stream_type` (`logs` / `metrics` / `traces`).
- **`openobserve_dashboard`** — dashboard definitions.
- **`openobserve_user`** — user accounts.

Data sources (read-only lookups against an existing OpenObserve):

- **`openobserve_organization`** — look up an existing organization.
- **`openobserve_stream`** — look up an existing stream's settings.

### Provider configuration

| Argument | Description | Environment variable |
|---|---|---|
| `endpoint` | Base URL of the OpenObserve instance (e.g. `https://openobserve.example.com`) | `OPENOBSERVE_ENDPOINT` |
| `username` | OpenObserve login email. Sensitive. | `OPENOBSERVE_USERNAME` |
| `password` | OpenObserve password. Sensitive. | `OPENOBSERVE_PASSWORD` |
| `org_id` | Default organization identifier used when a resource does not set `org_id` explicitly | `OPENOBSERVE_ORG_ID` |

All arguments are optional in the schema — each falls back to its environment variable if not set in HCL.

### Example: Configure the provider

```hcl
terraform {
  required_providers {
    openobserve = {
      source  = "openobserve/openobserve"
      version = "~> 0.1"
    }
  }
}

# Provider configuration using explicit values.
# Prefer environment variables for credentials in production:
#   OPENOBSERVE_ENDPOINT, OPENOBSERVE_USERNAME, OPENOBSERVE_PASSWORD, OPENOBSERVE_ORG_ID
provider "openobserve" {
  endpoint = "http://localhost:5080"
  username = "root@example.com"
  password = "Complexpass#123"
  org_id   = "default"
}
```

### Example: Define a stream

```hcl
resource "openobserve_stream" "app_logs" {
  org_id      = "default"
  name        = "app-logs"
  stream_type = "logs"

  settings {
    data_retention        = 30
    full_text_search_keys = ["message", "body"]
    index_fields          = ["level", "service"]
    bloom_filter_fields   = ["trace_id"]

    partition_keys {
      field = "service"
      types = ["value"]
    }
  }
}
```

### Apply

```bash
terraform init
terraform plan
terraform apply
```

The `app-logs` stream will appear in the OpenObserve UI under **Streams**, with the retention policy, full-text search keys, and index fields you declared.

!!! tip "Store credentials securely"
    Avoid committing `username` and `password` directly. Set `OPENOBSERVE_USERNAME` and `OPENOBSERVE_PASSWORD` as environment variables, use Terraform variables backed by a `.tfvars` file outside version control, or pull from a secrets backend such as AWS Secrets Manager or HashiCorp Vault.

## Kubernetes Module

The Kubernetes module deploys OpenObserve through the official Helm chart (`openobserve/openobserve-helm-chart`) and covers both ends of the spectrum: a minimal single-node SQLite setup you can run locally, and a full production HA configuration with PostgreSQL, NATS, S3, Ingress, and per-component replica counts and resource limits.

### Module prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Terraform | ≥ 1.9 | `optional()` with defaults requires 1.3+; mock provider tests require 1.7+ |
| `hashicorp/helm` provider | ~> 2.16 | |
| Kubernetes cluster | ≥ 1.25 | EKS, GKE, AKS, or self-managed |
| Default StorageClass | — | Required for persistent volumes |
| PostgreSQL | ≥ 14 | Required for `meta_store = "postgres"` (HA) |
| S3-compatible bucket | — | Required for production data persistence |

### Example: Minimal (development / single-node)

```hcl
module "openobserve" {
  source  = "openobserve/openobserve/kubernetes"
  version = "~> 1.0"

  auth = {
    root_user_email    = "admin@example.com"
    root_user_password = "ChangeMe123!"
  }

  # Single-node local mode: no PostgreSQL or NATS required
  meta_store          = "sqlite"
  cluster_coordinator = "local"
  queue_store         = "local"
  nats                = { enabled = false }
}
```

Access the UI:

```bash
kubectl port-forward -n openobserve svc/openobserve-router 5080:5080
# Open http://localhost:5080
```

### Example: Production HA (PostgreSQL + NATS + S3)

```hcl
module "openobserve" {
  source  = "openobserve/openobserve/kubernetes"
  version = "~> 1.0"

  auth = {
    root_user_email    = var.root_user_email
    root_user_password = var.root_user_password
    postgres_dsn       = var.postgres_dsn
    s3_access_key      = var.s3_access_key   # omit to use IRSA
    s3_secret_key      = var.s3_secret_key
  }

  replica_count = {
    ingester     = 3
    querier      = 2
    router       = 2
    compactor    = 1
    alertmanager = 1
  }

  meta_store          = "postgres"
  cluster_coordinator = "nats"
  queue_store         = "nats"

  s3 = {
    provider    = "s3"
    region      = "us-east-1"
    bucket_name = "my-openobserve-data"
  }

  ingress = {
    enabled         = true
    class_name      = "nginx"
    host            = "openobserve.example.com"
    tls_secret_name = "openobserve-tls"
    annotations = {
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
  }

  persistence = {
    ingester     = { size = "100Gi", storage_class = "gp3" }
    querier      = { size = "100Gi", storage_class = "gp3" }
    alertmanager = { size = "10Gi",  storage_class = "gp3" }
  }

  resources = {
    ingester = {
      requests = { memory = "2Gi", cpu = "500m" }
      limits   = { memory = "8Gi", cpu = "2000m" }
    }
    querier = {
      requests = { memory = "2Gi", cpu = "500m" }
      limits   = { memory = "8Gi", cpu = "2000m" }
    }
  }

  nats  = { enabled = true }
  minio = { enabled = false }
}
```

### Example: Enterprise Edition

Point the `image` block at the enterprise container repository:

```hcl
module "openobserve" {
  source  = "openobserve/openobserve/kubernetes"
  version = "~> 1.0"

  image = {
    repository = "o2cr.ai/openobserve/openobserve-enterprise"
    tag        = "v0.80.2"
  }

  # ... rest of your configuration
}
```

### Optional: Provision AWS Infrastructure

Set `create_aws_infrastructure = true` and the module also provisions the underlying:

- **VPC** with public and private subnets
- **EKS cluster** with managed node groups
- **S3 bucket** for telemetry data
- **IAM roles** for IRSA (IAM Roles for Service Accounts)

This is the fastest path from "empty AWS account" to "running OpenObserve cluster". For an alternative non-Terraform path, see [Amazon EKS](amazon-eks.md).

### Passing arbitrary Helm values

Any chart setting not exposed as a first-class variable can be passed through `extra_values` (merged last, highest precedence):

```hcl
module "openobserve" {
  source  = "openobserve/openobserve/kubernetes"
  version = "~> 1.0"

  # ... required variables

  extra_values = [<<-EOT
    enterprise:
      enabled: true
    config:
      ZO_SWAGGER_ENABLED: "true"
      ZO_PROMETHEUS_ENABLED: "true"
  EOT
  ]
}
```

### Capacity recommendations

Set `capacity.ingestion_gb_per_day` and the module exposes outputs with:

- Recommended deployment mode (single-node vs HA)
- Recommended replica counts per component
- Recommended EKS instance type and node count
- S3 storage estimate
- Estimated monthly cost

These are informational outputs only — set `replica_count` explicitly to override them. When `create_aws_infrastructure = true`, they're also used as defaults for `aws_config` unless overridden.

Reference data (256 GB/day):

- Single-node: 5 cores, ~$179/month
- HA: 25 cores, ~$927/month

### Architecture

```
                     ┌─────────────────────────────────────────────┐
                     │              Kubernetes Cluster              │
                     │                                              │
  Ingest / Query ───►│  router (stateless, horizontally scalable)  │
                     │      │              │                        │
                     │  ingester ◄────► querier                    │
                     │  (WAL + disk)   (disk cache)                 │
                     │      │              │                        │
                     │  compactor      alertmanager                 │
                     │      │                                        │
                     │  NATS (bundled or external)                  │
                     │      │                                        │
                     └──────┼─────────────────────────────────────-─┘
                            │
                ┌───────────┼──────────────┐
                │           │              │
           PostgreSQL       S3          Object Store
          (metadata)   (long-term data)
```

### Example configurations

| Example | Description |
|---|---|
| [`examples/minimal`](https://github.com/openobserve/terraform-kubernetes-openobserve/tree/main/examples/minimal) | Single-node SQLite deployment for development |
| [`examples/complete`](https://github.com/openobserve/terraform-kubernetes-openobserve/tree/main/examples/complete) | Production HA: PostgreSQL + NATS + S3 + Ingress + TLS |

### Upgrading the chart version

1. Check the [OpenObserve Helm chart releases](https://github.com/openobserve/openobserve-helm-chart/releases) for breaking changes.
2. Update `chart_version` in your module call.
3. Run `terraform plan` and review the diff before applying.
4. For major chart version bumps, run `terraform apply` during a maintenance window.

### Full input and output reference

For the complete list of inputs (`auth`, `replica_count`, `persistence`, `resources`, `ingress`, `s3`, `aws_config`, `affinity`, `tolerations`, `node_selector`, `image_pull_secrets`, etc.) and outputs (`http_endpoint`, `grpc_endpoint`, `ingress_host`, `aws_infrastructure`, `capacity_recommendations`, etc.), see the [module README on GitHub](https://github.com/openobserve/terraform-kubernetes-openobserve#inputs).

## Using the two modules together

A common production pattern:

1. Use the **Kubernetes module** in one Terraform configuration to stand up the cluster.
2. Use the **provider** in a separate configuration (with the deployment's endpoint as input) to declare the streams, dashboards, users, and organizations that should exist on it.

Keeping the two layers in separate state files makes it safe to iterate on resources (streams, dashboards) without risking the underlying cluster, and vice versa.

## OpenTofu

Both modules are compatible with [OpenTofu](https://opentofu.org/). Replace `terraform` with `tofu` in any command above:

```bash
tofu init
tofu plan
tofu apply
```

No additional configuration is required.

## License

Both modules are released under the **Apache 2.0** license.

**Need help:**

  [Community Slack](https://short.openobserve.ai/community)

  [GitHub issues — provider](https://github.com/openobserve/terraform-provider-openobserve/issues)

  [GitHub issues — Kubernetes module](https://github.com/openobserve/terraform-kubernetes-openobserve/issues)
