---
title: Overview
metaTitle: Install OpenObserve Enterprise | OpenObserve
description: Install OpenObserve Enterprise Edition. Choose HA on EKS / AKS / GKE, review licensing tiers, and explore enterprise features.
---

# Install OpenObserve — Enterprise

This guide explains how to deploy [OpenObserve Enterprise Edition](https://openobserve.ai/downloads/) in a **Kubernetes** environment using **Helm**.

> For support, reach out in the [Slack channel](/marketing-opt-in/).

:::info[Architecture Overview]
OpenObserve Enterprise Edition depends on several components to support scalable ingestion, search, storage, and access control:

- **Object Storage**, such as S3, Azure Blob, GCS, or MinIO, stores all telemetry data in Parquet format.
- **PostgreSQL** stores metadata such as dashboards, stream configurations, users, and the filelist table.
- **NATS** coordinates communication between ingestion and query nodes.
- **Dex and OpenFGA** enable [Single Sign-On (SSO)](../user-guide/account-administration/identity-and-access-management/sso.md) and [Role-Based Access Control (RBAC)](../user-guide/account-administration/identity-and-access-management/role-based-access-control.md).
:::

## Choose your cloud

- [Amazon EKS](amazon-eks.md)
- [Azure AKS](azure-aks.md)
- [Google GKE](google-gke.md)

## Infrastructure-as-Code

- [Terraform and OpenTofu](terraform.md): Manage streams, dashboards, alerts, SLOs, users, and roles with the official provider, and deploy the platform with the Kubernetes module. Alerts and SLOs export straight to Terraform from the UI.

## Other resources

- [SRE Agent Setup](sre-agent.md)
- [Enterprise Features](enterprise-features.md)
- [License and Pricing](license-and-pricing.md)
