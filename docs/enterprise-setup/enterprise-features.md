---
description: Overview of OpenObserve Enterprise Edition features — Security & Access Control, Performance & Scalability, AI & Intelligence, Data Processing & Integration.
---
#### Enterprise Features

##### Security & Access Control

- **Single Sign-On (SSO)**: OIDC, OAuth, SAML 2.0, LDAP/AD, and integration with major identity providers (Okta, Azure Entra, Google, GitHub, GitLab, Keycloak)

- **Advanced RBAC**: Granular role-based access control with custom roles and permissions – [Learn more](https://openobserve.ai/docs/user-guide/identity-and-access-management/role-based-access-control/)

- **Audit trails**: Comprehensive immutable audit logs with configurable retention

- **Sensitive Data Redaction (SDR)**: Automatically redact PII and sensitive data during ingestion and queries

- **Advanced encryption**: AES-256 SIV cipher keys with Google Tink KeySet and Akeyless integration

- **Rate limit**: Control API request rates and protect against abuse

##### Performance & Scalability

- **Query performance**: 100x improvement for many queries

- **Federated search / Super Cluster**: Query across multiple clusters and regions

- **Query management**: Control query resource usage and priorities

- **Workload management (QoS)**: Quality of Service controls for multi-tenant environments

- **Query optimizer / Aggregation cache / TopK Aggregation**: Advanced query optimization for faster performance

- **Broadcast join**: Optimized join operations for distributed queries

- **Metrics auto downsampling**: Automatic downsampling for long-term metrics retention

##### AI & Intelligence

- **Incident management**: Automated incident creation and tracking from alerts

- **SRE Agent**: AI-powered root cause analysis with correlated logs, metrics, and traces

- **AI assistant**: Intelligent assistant for observability workflows

- **Log Patterns**: Automatic pattern extraction and anomaly identification

- **MCP server**: Model Context Protocol server for AI integrations

- **Logs, metrics, and traces correlation**: Automated detection and correlation across telemetry signals

#####  Data Processing & Integration

- **Actions**: Custom automation and response actions

- **Pipeline remote destinations**: Send processed data to external systems

- **Advanced pipelines**: Enhanced data transformation and routing capabilities
