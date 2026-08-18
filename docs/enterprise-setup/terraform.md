---
title: Terraform
metaTitle: "Terraform and OpenTofu for OpenObserve"
description: "Manage OpenObserve alerts, SLOs, streams, dashboards, users as code with the official Terraform provider, and deploy the platform with the Kubernetes module."
keywords: openobserve, terraform, opentofu, iac, provider, module, helm, kubernetes, eks, alerts, slo, export
---

# Terraform and OpenTofu

OpenObserve ships **two separate Terraform artifacts**. They are not variants of each other and they are not usually used in the same configuration. One builds the platform, the other configures what runs inside it.

Both are **Apache 2.0** licensed, and both work identically under [OpenTofu](https://opentofu.org/): substitute `tofu` for `terraform` in every command on this page and nothing else changes.

> For support, reach out in the [Slack channel](/marketing-opt-in/).

## Which one do you need?

| | **Provider** (`terraform-provider-openobserve`) | **Kubernetes module** (`terraform-kubernetes-openobserve`) |
|---|---|---|
| **Terraform kind** | A provider (`openobserve_*` resources and data sources) | A module (a `module {}` block you call) |
| **Manages** | The objects *inside* OpenObserve: streams, folders, dashboards, alerts, SLOs, users, roles, service accounts | The infrastructure OpenObserve *runs on*: a Helm release, and optionally the AWS substrate beneath it |
| **Talks to** | The OpenObserve REST API | The Kubernetes API, Helm, and the AWS APIs |
| **Credentials** | An OpenObserve endpoint plus a login | A kubeconfig, plus AWS credentials if provisioning infrastructure |
| **Needs a running OpenObserve?** | Yes, it configures one that already exists | No, it creates one |
| **Typical cadence** | Every day, as alerts and dashboards evolve | Once per environment, then occasional upgrades |
| **Blast radius of a bad apply** | One organization's configuration | The cluster |
| **Registry** | [Terraform](https://registry.terraform.io/providers/openobserve/openobserve/latest) · [OpenTofu](https://search.opentofu.org/provider/openobserve/openobserve/latest) · [GitHub](https://github.com/openobserve/terraform-provider-openobserve) | [Terraform](https://registry.terraform.io/modules/openobserve/openobserve/kubernetes) · [GitHub](https://github.com/openobserve/terraform-kubernetes-openobserve) |

In short:

- **On OpenObserve Cloud, or already self-hosting?** You only need the **provider**. The Kubernetes module has nothing to do, because the platform is already running.
- **Standing up a new self-hosted deployment?** Use the **Kubernetes module** for that, once, then point the **provider** at the endpoint it outputs.
- **Prefer a non-Terraform path to a cluster?** See [Amazon EKS](amazon-eks.md), [Azure AKS](azure-aks.md), or [Google GKE](google-gke.md).

## Prerequisites

- **Terraform ≥ 1.9**, or OpenTofu. Verify with `terraform version` or `tofu version`.
- For the **provider**: a reachable OpenObserve endpoint and credentials: the root user, or any user with permissions on the objects you intend to manage.
- For the **Kubernetes module**: a Kubernetes cluster (≥ 1.25) with a default StorageClass, and `kubectl` configured for post-deploy verification. If you set `create_aws_infrastructure = true`, you also need AWS credentials that can create VPCs, EKS clusters, S3 buckets, and IAM roles.

---

## The provider: manage what runs inside OpenObserve

The provider manages OpenObserve resources through the REST API, so an alert threshold, a retention policy, or a service level objective becomes a file in a repository rather than a setting somebody changed in a browser tab six months ago. A change arrives as a pull request with a diff and an approver, `terraform plan` in CI reports anything edited by hand, and staging and production render from the same module with different variables instead of drifting apart.

Every resource takes an optional `org_id`. Leave it out and the provider default applies, so a single-organization setup never repeats it.

### Resources

| Resource | What it manages |
|---|---|
| `openobserve_organization` | Organizations, created and renamed |
| `openobserve_stream` | Retention, partitioning, indexing, and schema options |
| `openobserve_folder` | Folders for dashboards, alerts, reports, and synthetics |
| `openobserve_dashboard` | Dashboards from a JSON document, any schema version |
| `openobserve_user` | Users and their organization membership |
| `openobserve_service_account` | Service accounts with API tokens, including rotation |
| `openobserve_role` † | Custom roles and their permissions |
| `openobserve_group` † | Groups and the roles they grant |
| `openobserve_alert_template` | Notification message templates |
| `openobserve_alert_destination` | Webhook, email, and SNS destinations |
| `openobserve_alert` | Scheduled and real-time alerts: SQL, PromQL, aggregation, and SLO |
| `openobserve_slo` | Service level objectives, with error budgets and burn-rate alerting |

### Data sources

Each has a singular and a plural form, for reading what already exists. A configuration can reference objects it does not own. One team's alert can point at another team's destination without taking ownership of it.

| Data source | What it reads |
|---|---|
| `openobserve_organization`, `openobserve_organizations` | One organization, or all visible ones |
| `openobserve_stream`, `openobserve_streams` | Schema and statistics, or a listing |
| `openobserve_user`, `openobserve_users` | One member with roles and groups, or a listing |
| `openobserve_user_roles` | Built-in role names this deployment accepts |
| `openobserve_service_accounts` | Service accounts in an organization |
| `openobserve_role`, `openobserve_roles` † | Permissions on a custom role, or a listing |
| `openobserve_group`, `openobserve_groups` † | Members of a group, or a listing |
| `openobserve_resources` † | Resource types a permission can name |
| `openobserve_folder`, `openobserve_folders` | By id or by name, or a listing |
| `openobserve_dashboard`, `openobserve_dashboards` | A dashboard with its JSON, or a listing |
| `openobserve_alert_template`, `openobserve_alert_templates` | Custom and prebuilt templates |
| `openobserve_alert_destination`, `openobserve_alert_destinations` | One destination, or a listing |
| `openobserve_alert`, `openobserve_alerts` | By id or by name, or a listing |
| `openobserve_slo`, `openobserve_slos` | An objective with its current measurement |

:::note[† Requires Enterprise]
Roles, groups, and the resource catalog need OpenObserve Enterprise with OpenFGA enabled. Against an open source deployment they return a clear diagnostic saying so, rather than an opaque HTTP 403. Everything else, service level objectives included, works on both editions.
:::

### Provider configuration

| Argument | Description | Environment variable |
|---|---|---|
| `endpoint` | Base URL of the OpenObserve instance, for example `https://openobserve.example.com` | `OPENOBSERVE_ENDPOINT` |
| `username` | OpenObserve login email. Sensitive. | `OPENOBSERVE_USERNAME` |
| `password` | OpenObserve password. Sensitive. | `OPENOBSERVE_PASSWORD` |
| `org_id` | Default organization used when a resource does not set `org_id` itself | `OPENOBSERVE_ORG_ID` |

Every argument is optional in the schema, and each falls back to its environment variable when it is not set in HCL. Reading credentials from the environment keeps them out of the configuration and out of version control:

```bash
export OPENOBSERVE_ENDPOINT="https://openobserve.example.com"
export OPENOBSERVE_USERNAME="admin@example.com"
export OPENOBSERVE_PASSWORD="your-password"
export OPENOBSERVE_ORG_ID="default"
```

:::tip[Store credentials securely]
Avoid committing `username` and `password`. Use the environment variables above, Terraform variables backed by a `.tfvars` file kept outside version control, or a secrets backend such as AWS Secrets Manager or HashiCorp Vault.
:::

### Getting started

A stream, an objective measured against it, and the burn-rate alert that pages when the error budget is being spent too fast:

```hcl
terraform {
  required_providers {
    openobserve = {
      source  = "openobserve/openobserve"
      version = "~> 1.0"
    }
  }
}

# The same file applies under OpenTofu, unchanged.
provider "openobserve" {
  org_id = "default"
}

resource "openobserve_stream" "app_logs" {
  name        = "app_logs"
  stream_type = "logs"

  data_retention        = 30
  full_text_search_keys = ["message"]
  index_fields          = ["level"]

  partition_keys = [
    { field = "service", type = "value" },
  ]
}

resource "openobserve_slo" "checkout_availability" {
  name        = "checkout_availability"
  description = "Successful checkout requests over 30 days"

  target              = 99.9
  window_secs         = 2592000
  slice_interval_secs = 300

  count_sli {
    single_query {
      stream      = openobserve_stream.app_logs.name
      stream_type = "logs"
      scope       = "service = 'checkout'"
      good_expr   = "status < 500"
    }
  }
}

# Burn-rate alerting on the objective above, evaluated in two windows.
resource "openobserve_alert" "checkout_budget_burn" {
  name         = "checkout-budget-burn"
  stream_type  = "logs"
  stream_name  = openobserve_stream.app_logs.name
  destinations = ["pagerduty"]

  query_condition {
    type = "slo"

    slo_condition {
      slo_id            = openobserve_slo.checkout_availability.slo_id
      kind              = "burn_rate"
      operator          = ">"
      critical          = 14.4
      long_window_secs  = 3600
      short_window_secs = 300
    }
  }

  trigger_condition {
    period    = 5
    frequency = 5
  }
}
```

Then the commands you already know:

```bash
terraform init
terraform plan
terraform apply
```

The `app_logs` stream appears in the UI under **Streams** with the retention, full-text search keys, and index fields you declared; the objective appears under **SLOs**; the alert appears under **Alerts**, indistinguishable from one built by hand.

For what each field means, see [Alerts](../user-guide/analytics/alerts/index.md) and [SLOs](../user-guide/analytics/slos/index.md).

### Export an alert or SLO as Terraform

Adopting infrastructure as code usually stalls at the same step: somebody has to hand-write configuration for the hundred alerts that already exist. The UI writes it for you.

**Export** on an alert row, an SLO row, or a multiple selection opens a dialog with two tabs:

- **JSON**: the definition the import screens read back. See [Import and export alerts](../user-guide/analytics/alerts/import-export-alerts.md).
- **Terraform**: a ready-to-apply `openobserve_alert` or `openobserve_slo` resource. Copy it, or download it as a `.tf` file named after the object.

```hcl
# Generated by OpenObserve. Attributes left at their provider default are omitted.
#
# Provider setup, skip if your configuration already declares it:
#
#   terraform {
#     required_providers {
#       openobserve = {
#         source  = "openobserve/openobserve"
#         version = "~> 1.0"
#       }
#     }
#   }

resource "openobserve_alert" "high_error_rate" {
  name         = "high error rate"
  stream_type  = "logs"
  stream_name  = "app_logs"
  description  = "Error volume above baseline"
  enabled      = true
  destinations = ["slack-alerts"]

  query_condition {
    type = "sql"
    sql  = "SELECT count(*) AS total FROM \"app_logs\" WHERE level = 'error'"
  }

  trigger_condition {
    period    = 15
    operator  = ">="
    threshold = 100
    frequency = 5
    silence   = 60
  }
}
```

#### What the export guarantees

The output is not a state dump with the field names changed. It is checked against the real provider schema, and it is deliberate about the difference between what the API stores and what a configuration file should say.

| Behaviour | Why it matters |
|---|---|
| `terraform fmt` canonical | Alignment and spacing already match what `fmt` would produce, so the file lands in a repository without a formatting commit behind it. |
| Read-only fields removed | Server-assigned ids, last-triggered timestamps, and the last editor have no place in a configuration file. |
| Provider defaults omitted | The file says what is distinctive about this alert, so a reviewer reads intent rather than noise. |
| Vocabulary translated | Where the API and the schema differ, the export bridges it: the historical comparison offset, the two-word comparison operators, and thresholds that travel as numbers but belong in the schema as strings. |
| Invalid combinations dropped | The API sends a few fields the provider rejects, such as a count threshold on an SLO alert. The export removes them, so the first apply is not an error. |
| Losses reported, never silent | Anything with no provider equivalent is named in the dialog rather than quietly skipped, and so is any field the schema cannot carry. |

The generated file works with either tool. The same configuration applies under `terraform apply` and `tofu apply`, which is why both marks sit next to the export in the product and link to the provider on each registry.

### Adopting objects you already have

Teams do not move to code in one step. The provider is built for the middle, where some objects are managed and some are not yet.

| Direction | Step | What happens |
|---|---|---|
| UI to code | Export what exists | Build and tune an alert or an objective on screen, where the query editor and the preview are. Export it as Terraform and commit the file. |
| Code to UI | Apply and see it | Everything the provider creates is an ordinary object in the product: visible, editable, identical to one made by hand. |
| Adopt in place | Import without recreating | `terraform import` brings an existing object under management by id, so nothing is destroyed and recreated to get it into state. |
| Read only | Reference what you do not own | Data sources let one configuration point at another team's folder, destination, or objective without taking ownership of it. |

```bash
# Alerts and SLOs are imported as {org_id}/{id}. Find the id with the
# openobserve_alerts data source, or read it out of the UI URL.
terraform import openobserve_alert.high_error_rate default/2fXkZ8QlmNbYcV1pR3sT
terraform import openobserve_slo.checkout_availability default/2aBcD3FgHiJkLmNoP4
```

### Provider reference

Every resource and data source has generated reference documentation on the registry. Five guides cover the parts where the right answer depends on what you are trying to measure.

| Guide | What it settles |
|---|---|
| Getting started | Provider configuration, a first stream, and the alert that watches it |
| Alerting | Every query type, warning thresholds, and when an alert should page once against once per group |
| Service level objectives | Choosing an indicator, sizing windows and slices, error budgets, and burn-rate alerting |
| Dashboards | Panel JSON without the guesswork |
| Roles and groups | Permissions, group membership, and what needs Enterprise |

- Provider documentation: <https://registry.terraform.io/providers/openobserve/openobserve/latest/docs>
- Terraform Registry: <https://registry.terraform.io/providers/openobserve/openobserve/latest>
- OpenTofu Registry: <https://search.opentofu.org/provider/openobserve/openobserve/latest>

---

## The Kubernetes module: deploy the platform

Where the provider configures a running OpenObserve, the Kubernetes module *creates* one. It deploys the official Helm chart (`openobserve/openobserve-helm-chart`) and covers both ends of the spectrum: a minimal single-node SQLite setup you can run locally, and a full production HA configuration with PostgreSQL, NATS, S3, Ingress, and per-component replica counts and resource limits. Optionally, it also provisions the AWS infrastructure underneath.

This module never touches streams, alerts, or dashboards. That is the provider's job, and the two are best kept in separate state files. See [Using the two together](#using-the-two-together).

### Module prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Terraform | ≥ 1.9 | `optional()` with defaults requires 1.3+; mock provider tests require 1.7+ |
| `hashicorp/helm` provider | ~> 2.16 | |
| Kubernetes cluster | ≥ 1.25 | EKS, GKE, AKS, or self-managed |
| Default StorageClass | Any | Required for persistent volumes |
| PostgreSQL | ≥ 14 | Required for `meta_store = "postgres"` (HA) |
| S3-compatible bucket | Any | Required for production data persistence |

### Example: minimal (development, single node)

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

### Example: production HA (PostgreSQL, NATS, S3)

```hcl
module "openobserve" {
  source  = "openobserve/openobserve/kubernetes"
  version = "~> 1.0"

  auth = {
    root_user_email    = var.root_user_email
    root_user_password = var.root_user_password
    postgres_dsn       = var.postgres_dsn
    s3_access_key      = var.s3_access_key # omit to use IRSA
    s3_secret_key      = var.s3_secret_key
  }

  replica_count = {
    ingester  = 3
    querier   = 2
    router    = 2
    compactor = 1
    scheduler = 1
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
    ingester  = { size = "100Gi", storage_class = "gp3" }
    querier   = { size = "100Gi", storage_class = "gp3" }
    scheduler = { size = "10Gi", storage_class = "gp3" }
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

### Optional: provision AWS infrastructure

Set `create_aws_infrastructure = true` and the module also provisions:

- a **VPC** with public and private subnets,
- an **EKS cluster** with managed node groups,
- an **S3 bucket** for telemetry data,
- **IAM roles** for IRSA (IAM Roles for Service Accounts).

This is the fastest path from an empty AWS account to a running OpenObserve cluster. For a non-Terraform path to the same place, see [Amazon EKS](amazon-eks.md).

:::warning[This is the expensive half of the configuration]
`create_aws_infrastructure = true` creates a VPC and an EKS cluster that this state file then owns. Keep it in its own configuration and its own state, away from anything you iterate on daily. A destroy aimed at a stream should never be able to reach a cluster.
:::

### Passing arbitrary Helm values

Any chart setting not exposed as a first-class variable can be passed through `extra_values`, which is merged last and therefore wins:

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

- the recommended deployment mode, single-node or HA,
- recommended replica counts per component,
- a recommended EKS instance type and node count,
- an S3 storage estimate,
- an estimated monthly cost.

These are informational outputs only. Set `replica_count` explicitly to override them. When `create_aws_infrastructure = true`, they are also used as defaults for `aws_config` unless you override those. For the reasoning behind the numbers, see [Capacity planning](capacity-planning.md).

Reference data at 256 GB/day:

| Mode | Cores | Estimated cost |
|---|---|---|
| Single node | 5 | ~$179/month |
| HA | 25 | ~$927/month |

### Architecture

```
                   ┌────────────────────────────────────────────┐
                   │             Kubernetes Cluster             │
                   │                                            │
  Ingest / Query ─►│  router      (stateless, scales out)       │
                   │    │                                       │
                   │    ├── ingester   (WAL + disk)             │
                   │    ├── querier    (disk cache)             │
                   │    ├── compactor                           │
                   │    └── scheduler                           │
                   │                                            │
                   │  NATS (bundled or external)                │
                   └──────────────────┬─────────────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      │                               │
                 PostgreSQL                     S3 object store
                 (metadata)                   (long-term data)
```

### Example configurations

| Example | Description |
|---|---|
| [`examples/minimal`](https://github.com/openobserve/terraform-kubernetes-openobserve/tree/main/examples/minimal) | Single-node SQLite deployment for development |
| [`examples/complete`](https://github.com/openobserve/terraform-kubernetes-openobserve/tree/main/examples/complete) | Production HA: PostgreSQL, NATS, S3, Ingress, TLS |

### Upgrading the chart version

1. Check the [OpenObserve Helm chart releases](https://github.com/openobserve/openobserve-helm-chart/releases) for breaking changes.
2. Update `chart_version` in your module call.
3. Run `terraform plan` and review the diff before applying.
4. For major chart version bumps, run `terraform apply` during a maintenance window.

### Full input and output reference

For the complete list of inputs (`auth`, `replica_count`, `persistence`, `resources`, `ingress`, `s3`, `aws_config`, `affinity`, `tolerations`, `node_selector`, `image_pull_secrets`, and the rest) and outputs (`http_endpoint`, `grpc_endpoint`, `ingress_host`, `aws_infrastructure`, `capacity_recommendations`), see the [module README on GitHub](https://github.com/openobserve/terraform-kubernetes-openobserve#inputs).

---

## Using the two together

The common production pattern keeps them in **separate configurations with separate state files**:

1. One configuration calls the **Kubernetes module** to stand up the cluster. It runs rarely, from a pipeline with cloud credentials, and its output includes the deployment's endpoint.
2. A second configuration uses the **provider**, taking that endpoint as an input, to declare the organizations, streams, folders, dashboards, alerts, SLOs, and roles that should exist on it.

Splitting them is what makes it safe for a service team to iterate on alerts many times a day: their plan can only ever touch OpenObserve objects, and no mistake in it can reach the VPC or the EKS cluster. The reverse holds too: a chart upgrade does not re-plan every dashboard in the estate.

## OpenTofu

Everything on this page is compatible with [OpenTofu](https://opentofu.org/). Replace `terraform` with `tofu`:

```bash
tofu init
tofu plan
tofu apply
```

No additional configuration is required. The provider is published on both registries, and the UI's Terraform export produces files that apply under either tool.

## License

Both the provider and the module are released under the **Apache 2.0** license.

**Need help:**

  [Community Slack](https://short.openobserve.ai/community)

  [GitHub issues (provider)](https://github.com/openobserve/terraform-provider-openobserve/issues)

  [GitHub issues (Kubernetes module)](https://github.com/openobserve/terraform-kubernetes-openobserve/issues)
