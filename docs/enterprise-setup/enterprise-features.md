---
title: Enterprise Features
metaTitle: "Enterprise Edition Feature Overview | OpenObserve"
description: Overview of OpenObserve Enterprise Edition features — Security & Access Control, Performance & Scalability, AI & Intelligence, Data Processing & Integration.
---

## Enterprise Features

OpenObserve Enterprise Edition adds features on top of the open source version. They are grouped below by area: security, performance, AI, data processing, and storage.

### Security & Access Control

- **Single Sign-On (SSO)**: Sign in with OIDC, OAuth, SAML 2.0, or LDAP/AD. It works with major identity providers, such as Okta, Azure Entra, Google, GitHub, GitLab, and Keycloak.

- **Advanced RBAC**: Set fine-grained, role-based access with custom roles and permissions. [Learn more about role-based access control](../user-guide/account-administration/identity-and-access-management/role-based-access-control.md).

- **Audit trails**: Keep audit logs that cannot be changed. You can set how long to keep them.

- **Sensitive Data Redaction (SDR)**: Redact PII and other sensitive data during ingestion and queries.

- **Advanced encryption**: Use AES-256 SIV cipher keys with Google Tink KeySet and Akeyless.

- **Rate limit**: Control API request rates and guard against abuse.

### Performance & Scalability

- **Query performance**: Many queries run up to 100x faster.

- **Federated search / Super Cluster**: Query across many clusters and regions.

- **Query management**: Control how many resources each query uses and set priorities.

- **Workload management (QoS)**: Set Quality of Service controls for multi-tenant setups.

- **Query optimizer / Aggregation cache / TopK Aggregation**: Speed up queries with advanced tuning.

- **Broadcast join**: Run faster joins in distributed queries.

- **Metrics auto downsampling**: OpenObserve downsamples metrics for you, so you can keep them longer.

### AI & Intelligence

- **Incident management**: OpenObserve creates and tracks incidents from alerts for you.

- **SRE Agent**: Find root causes with AI, using linked logs, metrics, and traces.

- **AI assistant**: Get help from an AI assistant as you work.

- **Log Patterns**: OpenObserve finds log patterns and spots anomalies for you.

- **OAuth 2.0 sign-in for MCP**: Sign in to the [Model Context Protocol server](https://openobserve.ai/docs/integration/ai/mcp/) with OAuth. Dex acts as the identity provider.

- **Logs, metrics, and traces correlation**: OpenObserve finds and links related logs, metrics, and traces for you.

###  Data Processing & Integration

- **Pipeline remote destinations**: Send processed data to outside systems.

- **Advanced pipelines**: Transform and route data with more options.

### Storage & Data Residency

- **Bring Your Own Bucket (BYOB)**: Connect your own AWS S3 bucket, Azure Blob container, or Google Cloud Storage (GCS) bucket to OpenObserve Cloud. Your data stays in your account, region, and security perimeter. AWS supports two ways to sign in: access keys, or IAM Role ARN (STS assume-role with External ID). [Learn more about Bring Your Own Bucket](../administration/maintenance/storage-management/bring-your-own-bucket.md).
