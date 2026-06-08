---
title: Bring Your Own Bucket (BYOB) - Use Your Own S3, Azure Blob, or GCS Storage | OpenObserve
description: >-
  Bring Your Own Bucket (BYOB) lets OpenObserve Cloud write telemetry data
  directly to an AWS S3 bucket, Azure Blob container, or Google Cloud Storage
  bucket in your account, so your data stays in your region and under your
  security policies.
keywords: 'openobserve, byob, bring your own bucket, s3, azure blob, gcp, gcs, google cloud storage, role arn, sts, external id, data residency, compliance, cloud'
---
# Bring Your Own Bucket (BYOB)

OpenObserve is built around object storage. **Bring Your Own Bucket (BYOB)** lets you decide exactly where that data lives.

Instead of using OpenObserve-managed storage, you can connect your own **AWS S3 bucket**, **Azure Blob container**, or **Google Cloud Storage (GCS) bucket** directly. Your data stays in your account, in your region, and under your own security policies and access controls. OpenObserve handles ingestion, compaction, and queries against it.

For AWS, you can authenticate using either **access keys** (access key ID and secret access key) or an **IAM Role ARN** (STS assume-role with an External ID). Azure and GCS use their respective account credentials.

!!! tip "Get it enabled!"
    If you're interested in enabling this capability for your organization, please contact us through [OpenObserve Contact Us](https://openobserve.ai/contact).

## Use Cases

- **Data residency and compliance** — Keep telemetry in a specific region or jurisdiction without any workarounds.
- **Cost control** — Use reserved capacity, existing storage commitments, or negotiated cloud rates you already have.
- **Data ownership** — Your raw telemetry data is yours, independent of the observability platform.
- **Portability** — No vendor lock-in on storage. Migrate or switch without a data migration project.

## At a Glance

- **What it is**: OpenObserve Cloud writes your telemetry data to a bucket you own, instead of an OpenObserve-managed bucket.
- **Who it's for**: Commercial OpenObserve Cloud customers with data residency, compliance, or cost-control requirements.
- **What stays the same**: Ingestion, compaction, and query experience are identical to managed storage.
- **What changes**: You own the bucket, the bill for storage, and the IAM/RBAC policies that protect it.

## How It Compares

| Aspect | OpenObserve-managed storage | Bring Your Own Bucket |
|---|---|---|
| Bucket owner | OpenObserve | You |
| Storage bill | Included in OpenObserve Cloud plan | Billed by your cloud provider |
| Region control | Region of your OpenObserve Cloud tier | Same region as your OpenObserve Cloud tier (see [Regional and provider constraints](#regional-and-provider-constraints)) |
| Access policies | Managed by OpenObserve | Managed by you (IAM, bucket policy, KMS, etc.) |
| Data on cancellation | Subject to OpenObserve retention policy | Remains in your account |



## Regional and Provider Constraints

Your storage bucket **must reside in the same region and use the same cloud provider** as the OpenObserve Cloud it's connected to. The region you enter must match the installation's configured region.

**Cross-region and cross-provider configurations are not supported.** For example, an OpenObserve Cloud tier running on AWS `us-west-1` cannot use an S3 bucket in `us-east-1`, and cannot use an Azure Blob container or a GCS bucket at all.

**The provider type cannot be changed after initial setup.** Choose your provider (AWS S3, Azure Blob, or GCS) carefully during the first configuration. You can update the bucket name and credentials later, but switching providers requires reconfiguration with assistance from OpenObserve support.

## Configure Storage (Self-Service)

You can configure your own bucket directly from the OpenObserve UI under **Settings → Storage Settings**, without contacting support.

In the **Storage Settings** tab:

1. **Pick a provider**: choose **AWS S3**, **Azure Blob**, or **Google Cloud Storage (GCS)**.
2. **Enter the bucket name**: the name of the bucket or container in your account.
3. **Enter the region**: must match the installation's configured region. See [Regional and provider constraints](#regional-and-provider-constraints).
4. **Enter credentials**:
    - **AWS S3**: either an **access key ID** and **secret access key**, or a **Role ARN** plus **External ID** for STS assume-role authentication.
    - **Azure Blob**: your Azure storage account credentials.
    - **Google Cloud Storage**: your GCS account credentials.

Remember that the provider type is fixed after the initial setup; only the bucket name, region, and credentials can be updated afterward.

### REST API

Org-level storage configuration is also available through the REST API:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/{org_id}/storage` | Retrieve the current storage configuration for the organization. |
| `POST` | `/api/{org_id}/storage` | Create the initial storage configuration. |
| `PUT` | `/api/{org_id}/storage` | Update the bucket name, region, or credentials. |

## Availability

BYOB is available for commercial **OpenObserve Cloud** customers.

Please reach out through the [OpenObserve Contact Us](https://openobserve.ai/contactus/) page to get it enabled.

## Related

- [Storage Configuration](storage.md) — how OpenObserve stores data on self-hosted deployments.
- [Configure Multiple Object Storage Accounts](configure-multiple-storage-accounts.md) — split data across multiple buckets or accounts on self-hosted.

## Frequently Asked Questions

??? question "Does enabling BYOB migrate my existing data?"

    BYOB applies to data written *after* the bucket is connected. If you need historical data moved into your bucket, contact OpenObserve support to discuss a one-time migration.

??? question "Can I rotate or revoke the credentials?"

    Yes. Update the credentials under **Settings → Storage Settings** (or via the `PUT /api/{org_id}/storage` endpoint) whenever you rotate the underlying IAM role, access key, Role ARN/External ID, SAS token, or GCS credentials. Revoking access at the cloud-provider level stops OpenObserve from being able to write or read new data.

??? question "What happens to my data if I leave OpenObserve?"

    The data remains in your bucket. OpenObserve writes telemetry as Parquet files using the same format documented in [Storage Configuration](storage.md), so you retain access to the raw data independent of the platform.

??? question "Is BYOB available on self-hosted OpenObserve?"

    Self-hosted OpenObserve has always supported pointing at any S3-compatible, Azure Blob, or Google Cloud Storage you control. See [Storage Configuration](storage.md). BYOB is the equivalent capability for **OpenObserve Cloud** customers who don't manage their own deployment.



**Need help:**

  [Community Slack](https://short.openobserve.ai/community)

  [Contact Sales](https://openobserve.ai/contactus/)
