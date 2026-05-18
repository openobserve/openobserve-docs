---
title: Bring Your Own Bucket (BYOB) — Use Your Own S3 or Azure Blob Storage | OpenObserve
description: >-
  Bring Your Own Bucket (BYOB) lets OpenObserve Cloud write telemetry data
  directly to an AWS S3 bucket or Azure Blob container in your account, so
  your data stays in your region and under your security policies.
keywords: 'openobserve, byob, bring your own bucket, s3, azure blob, data residency, compliance, cloud'
---
# Bring Your Own Bucket (BYOB)

OpenObserve is built around object storage. **Bring Your Own Bucket (BYOB)** lets you decide exactly where that data lives.

Instead of using OpenObserve-managed storage, you can connect your own **AWS S3 bucket** or **Azure Blob container** directly. Your data stays in your account, in your region, and under your own security policies and access controls. OpenObserve handles ingestion, compaction, and queries against it.

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

Your storage bucket **must reside in the same region and use the same cloud provider** as the OpenObserve Cloud it's connected to.

**Cross-region and cross-provider configurations are not supported.** For example, an OpenObserve Cloud tier running on AWS `us-west-1` cannot use an S3 bucket in `us-east-1`, and cannot use an Azure Blob container at all.

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

    Yes. Update the credentials in the OpenObserve Cloud settings whenever you rotate the underlying IAM role, access key, or SAS token. Revoking access at the cloud-provider level stops OpenObserve from being able to write or read new data.

??? question "What happens to my data if I leave OpenObserve?"

    The data remains in your bucket. OpenObserve writes telemetry as Parquet files using the same format documented in [Storage Configuration](storage.md), so you retain access to the raw data independent of the platform.

??? question "Is BYOB available on self-hosted OpenObserve?"

    Self-hosted OpenObserve has always supported pointing at any S3-compatible or Azure Blob storage you control — see [Storage Configuration](storage.md). BYOB is the equivalent capability for **OpenObserve Cloud** customers who don't manage their own deployment.



**Need help:**

  [Community Slack](https://short.openobserve.ai/community)

  [Contact Sales](https://openobserve.ai/contactus/)
