---
title: Enterprise Features | OpenObserve
description: Capabilities included in the OpenObserve Enterprise tier - extended retention, federated search, BYOB storage, SSO, RBAC, cipher keys, query management, workload management, and audit trail. Free for up to 50 GB of ingestion per day.
---
# Enterprise Features

## Overview
Enterprise tier includes all standard features plus the following enterprise-specific capabilities. Available free for up to 50 GB of ingestion per day.

## Enterprise-Only Features

### Data Management
- [Extended Data Retention](../user-guide/data-processing/streams/extended-retention.md): keep data longer than standard retention periods.
- [Federated Search / Super Cluster](../user-guide/data-exploration/federated-search/index.md): search across multiple OpenObserve clusters from a single interface.
- [Bring Your Own Bucket (BYOB)](../administration/maintenance/storage-management/bring-your-own-bucket.md): connect your own AWS S3 or Azure Blob storage to OpenObserve Cloud.

### Security & Access
- [SSO (Single Sign On)](../user-guide/account-administration/identity-and-access-management/sso.md): integrate with existing identity providers.
- [Role-Based Access Control (RBAC)](../user-guide/account-administration/identity-and-access-management/role-based-access-control.md): manage user permissions by role.
- [Cipher Keys](../user-guide/account-administration/management/cipher-keys.md): encryption and compliance support for HIPAA and PCI.

### Operations
- [Query Management](../user-guide/account-administration/management/query-management.md): optimize and manage query performance.
- [Workload Management (QoS)](../user-guide/account-administration/work-group.md): prioritize and allocate resources.
- [Audit Trail](../user-guide/account-administration/management/audit-trail.md): track all system activities and changes.

## Get started

Ready to deploy OpenObserve Enterprise?

- [Enterprise installation](../enterprise-setup/index.md): pick the install path for your cloud.
- [HA deployment](../administration/deployment/ha-deployment.md): production-grade cluster setup with object storage.
- [SRE Agent setup](../enterprise-setup/sre-agent.md): enable AI-driven features and Incidents/RCA.

## Next steps

- [Capacity planning](../enterprise-setup/capacity-planning.md): sizing CPU, memory, and storage.
- [Architecture](../architecture.md): how the components fit together.
- [Performance tuning](../enterprise-setup/performance.md): squeeze more out of large deployments.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
