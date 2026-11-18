---
title: Features
description: Manage OpenObserve Enterprise alerts, pipelines, functions, destinations, templates, and configs as Kubernetes CRDs with GitOps, HA, and VRL function support.
---

# OpenObserve Kubernetes Operator Features

## Overview

The OpenObserve Kubernetes Operator lets you manage OpenObserve Enterprise resources as Kubernetes Custom Resources. You define alerts, pipelines, functions, and configs in YAML, and the operator keeps OpenObserve in sync. This page lists every feature, grouped by category.

## Core Features

### 🎯 Declarative Resource Management
- **Native Kubernetes Integration**: Manage OpenObserve resources as standard Kubernetes Custom Resource Definitions (CRDs).
- **GitOps Ready**: Use GitOps workflows with version control and automated deployments.
- **Infrastructure as Code**: Define observability configs next to your app deployments.
- **Multi-Instance Support**: Manage many OpenObserve instances from one Kubernetes cluster.
- **Comprehensive Resource Types**: Manage alerts, alert templates, destinations, pipelines, functions, and configurations as code.

### 🔄 Automated Lifecycle Management
- **Resource Synchronization**: Kubernetes resources and OpenObserve configs stay in sync automatically.
- **Status Tracking**: See the sync status of each resource in real time, with detailed conditions.
- **Generation Tracking**: Tracks resource generations so the actual state matches the desired state.
- **Finalizer Support**: Cleans up OpenObserve resources when you delete the Kubernetes resources.
- **Resource Types**: Manages the full lifecycle of alerts, alert templates, destinations, pipelines, functions, and configs.

## Custom Resource Definitions (CRDs)

The operator adds six CRDs. Each one maps to a type of OpenObserve resource.

### 1. Config (o2config)

Stores the connection details for an OpenObserve instance.

**Key Features:**
- **Secure Credential Management**: Credentials are stored as Kubernetes Secrets.
- **Multiple Instance Support**: Connect to different OpenObserve environments, such as dev, test, and prod.
- **TLS Configuration**: Turn TLS verification on or off.
- **Organization Scoping**: Each config applies to one organization.
- **Connection Validation**: Checks that the endpoint is reachable.

**Configuration Options:**
- `endpoint`: OpenObserve API endpoint URL.
- `organization`: Target organization name.
- `credentialsSecretRef`: Reference to Kubernetes Secret containing API tokens.
- `tlsVerify`: Enable/disable TLS certificate verification.

### 2. Alert (o2alert)

Defines alerts that watch your data.

**Key Features:**

#### Query Capabilities
- **Multiple Query Types**:
  - Custom queries.
  - SQL-based queries.
  - PromQL queries for metrics.
- **Stream Support**: Works with logs, metrics, and traces.
- **Aggregation Functions**: Use groupBy, having clauses, and many aggregation functions.
- **VRL Functions**: Use Vector Remap Language (VRL) functions.
- **Multi-Time Range**: Compare data across time windows.

#### Trigger Conditions
- **Flexible Scheduling**:
  - Frequency-based triggers (minutes, hours, days).
  - Cron expression support.
  - Time window configuration (period).
- **Threshold Management**:
  - Multiple comparison operators (=, !=, >=, <=, >, <).
  - Set your own thresholds.
  - Silence periods to cut down on alert noise.
- **Advanced Options**:
  - Timezone support.
  - Tolerance settings (toleranceInSecs).
  - Time alignment options.

#### Alert Management
- **Real-time Alerts**: Process alerts in real time.
- **Deduplication**:
  - Fingerprint-based deduplication.
  - Configurable time windows.
  - Custom fingerprint fields.
- **Context Enrichment**:
  - Context attributes for extra metadata.
  - Row templates (String or JSON format).
  - Custom template variables.

#### Organization & Delivery
- **Folder Organization**: Group alerts in folders.
- **Multiple Destinations**: Send each alert to up to 10 destination channels.
- **Status Tracking**:
  - Alert enablement status.
  - Last sync time.
  - OpenObserve alert ID tracking.

### 3. AlertTemplate (o2alerttemplate, alerttemplate)

Defines templates that format alert messages for each channel.

**Key Features:**

#### Template Management
- **Multiple Template Types**:
  - HTTP templates for webhooks (Slack, PagerDuty, etc.).
  - Email templates for email notifications.
- **Template Variables**: Use dynamic variables in templates.
- **Default Templates**: Mark a template as the default so it is used automatically.
- **Organization Scoping**: Templates belong to an organization.

#### Template Formatting
- **Title Templates**: Build titles from variables.
- **Body Templates**:
  - JSON format for HTTP webhooks.
  - HTML/text format for emails.
  - Nested structures are supported.
- **Variable Placeholders**:
  - `{alert_name}`: Name of the triggered alert.
  - `{stream_name}`: Source stream name.
  - `{severity}`: Alert severity level.
  - `{triggered_at}`: Timestamp when alert was triggered.
  - `{org_name}`: Organization name.
  - `{threshold}`: Configured threshold value.
  - Custom variables from alert context.

#### Use Cases
- **Slack Notifications**: Send formatted messages with blocks and markdown.
- **PagerDuty Integration**: Create structured incidents.
- **Email Alerts**: Send rich HTML emails.
- **Custom Webhooks**: Send custom JSON payloads to any HTTP endpoint.
- **Microsoft Teams**: Send adaptive cards and formatted messages.
- **Generic HTTP**: Use flexible templates with any webhook service.

### 4. Destination (o2dest, o2destination)

Defines where alerts and pipelines send notifications and data.

**Key Features:**

#### Alert Destinations
- **Destination Types**:
  - HTTP webhooks (Slack, PagerDuty, custom endpoints).
  - Email (SMTP) destinations.
  - SNS (Amazon Simple Notification Service).
- **Template Integration**: Point to an alert template to format messages.
- **Authentication Support**:
  - Bearer tokens.
  - API keys in headers.
  - Custom headers.
- **TLS Configuration**: Optional TLS certificate verification.

#### Pipeline Destinations
- **Destination Types**:
  - OpenObserve instances (for data replication).
  - Splunk
  - New Relic
  - Elasticsearch
  - Dynatrace
  - Datadog
  - Custom HTTP endpoints.
- **Output Formats**:
  - JSON (standard or nested event format).
  - Elasticsearch bulk format.
  - Custom formats per destination type.
- **Metadata Support**: Add extra metadata to a destination.

#### Configuration Options
- **HTTP Configuration**:
  - URL endpoint.
  - HTTP method (POST, PUT, GET).
  - Custom headers.
  - Request timeout settings.
- **Email Configuration**:
  - Multiple recipient emails.
  - Template selection.
- **SNS Configuration**:
  - AWS region.
  - SNS Topic ARN
  - Action ID

#### Advanced Features
- **Skip TLS Verify**: Use self-signed certificates for development and testing.
- **Category Detection**: Each destination is marked as an alert or pipeline destination automatically.
- **Error Handling**: Reports errors in detail and retries.
- **Status Tracking**: Shows sync status with destination services in real time.

### 5. Function (o2function, o2func)

Defines VRL (Vector Remap Language) functions that transform data.

**Key Features:**

#### Function Management
- **VRL Support**: Write functions in Vector Remap Language to transform data.
- **Reusable Functions**: Write a function once and use it in many pipelines.
- **Organization Scoping**: Functions belong to an organization.
- **Name Validation**: Names must follow a set pattern.

#### Testing & Validation
- **Built-in Testing**: Define test cases with input and expected output.
- **Test Execution**: Function logic is tested automatically when you deploy.
- **Error Reporting**: Failed tests show detailed error messages.
- **Multiple Test Cases**: Add many test cases to each function.

#### Use Cases
- **Data Transformation**: Change, enrich, or reshape log data.
- **Field Extraction**: Parse and pull fields out of unstructured data.
- **Data Enrichment**: Add context to events.
- **Format Conversion**: Convert between data formats.
- **Filtering**: Write complex filter logic.
- **Aggregation**: Run custom aggregations on data streams.

#### Integration
- **Pipeline Integration**: Pipelines can call functions to process data.
- **Stream Compatibility**: Works with logs, metrics, and traces.
- **Version Tracking**: Tracks generations as functions change.
- **Status Monitoring**: Shows sync status with OpenObserve in real time.

### 6. Pipeline (o2pipeline)

Defines pipelines that process and transform data.

**Key Features:**

#### Source Configuration
- **Multiple Source Types**:
  - Real-time data sources.
  - Scheduled/batch sources.
  - Query-based sources.
- **Stream Types**: Logs, metrics, and traces.
- **Flexible Scheduling**:
  - Cron expressions.
  - Frequency-based schedules.
  - Time-based triggers.

#### Pipeline Processing
- **Node-Based Architecture**:
  - Build pipelines from modular nodes.
  - Set parameters on each node.
  - Use many types of transforms.
- **Edge Connections**:
  - Define how data flows between nodes.
  - Branch pipelines into more than one path.
  - Multiple processing paths.

#### Advanced Features
- **Version Control**: Pipelines have versions.
- **Pause/Resume**: Pause pipelines at set points.
- **Error Handling**: Tracks and reports errors in detail.
- **Delay Configuration**: Set processing delays.
- **Timezone Support**: Set a timezone for each pipeline.

## Deployment & Operations Features

### 🚀 Automated Deployment
- **One-Command Deployment**: A simple deployment script with options you can change.
- **Image Configuration**: Use your own container images and tags.
- **Namespace Management**: Choose any namespace.
- **RBAC Setup**: Creates the required roles and permissions for you.
- **ConfigMap-Based Configuration**: One ConfigMap controls how the operator behaves.

### 🔐 Security Features
- **Webhook Security**:
  - Auto-generated TLS certificates for webhooks.
  - Certificates can be rotated.
  - Secure admission control.
- **Secret Management**:
  - Kubernetes-native secret handling.
  - Credential isolation per namespace.
- **RBAC Controls**:
  - Fine-grained permissions.
  - Cluster and namespace-scoped roles.
- **Container Security**:
  - Runs as non-root user (UID 65534).
  - Read-only root filesystem.
  - No privilege escalation allowed.
  - All capabilities dropped.
  - Seccomp profile enabled.
- **Pod Security**:
  - The security context is set up correctly.
  - Resource limits enforced.
  - Temporary directory size limits.

### 📊 Monitoring & Observability
- **Status Reporting**:
  - Detailed condition tracking (Ready, Synced, Error states).
  - Last sync timestamps.
  - Error messages and reasons.
- **Custom Printer Columns**:
  - See status at a glance in kubectl output.
  - Key field visibility (Stream, Enabled, Ready, Age).
- **Generation Tracking**: Tracks versions as resources change.
- **Health Probes**:
  - Liveness probe at `/healthz` endpoint.
  - Readiness probe at `/readyz` endpoint.
  - Startup probe for a clean start.
- **Metrics Endpoint**:
  - Prometheus-compatible metrics at `/metrics` on port 8080.
  - Service annotations for automatic Prometheus discovery.
  - Operational metrics and controller performance data.

## Advanced Capabilities

### 🔄 Reconciliation Features
- **Continuous Reconciliation**: Keeps the actual state in line with the desired state.
- **Error Recovery**: Retries automatically with exponential backoff.
- **Drift Detection**: Finds and fixes config drift.
- **Resource Validation**: Checks changes before applying them.

### 🎛️ Operational Features
- **Production-Ready Deployment**:
  - High availability by default, with 2 replicas.
  - Leader election runs automatically for active-passive mode.
  - Zero-downtime rolling updates.
  - A priority class for critical infrastructure parts.
- **Dry Run Support**: Preview changes before applying them.
- **Uninstall Management**:
  - Full cleanup, including finalizer removal.
  - Ordered resource deletion (alerts, alert templates, destinations, pipelines, functions, configurations).
  - Namespace cleanup.
- **Multi-Environment Support**:
  - Separate configs for development, test, and production.
  - Environment-specific templates.
- **Resource Management**:
  - Set your own resource requests and limits.
  - Default: 200m CPU / 256Mi memory (requests), 1 CPU / 1Gi memory (limits).
  - Scale out by adding replicas.

### 🔧 Developer Features
- **Sample Templates**: Full examples for all resource types (alerts, alert templates, destinations, pipelines, functions).
- **Validation Webhooks**: Checks input at admission time.
- **Status Subresources**: Status updates use the status subresource.
- **Preserved Unknown Fields**: Keeps unknown fields so future API changes still work.

## Integration Capabilities

### GitOps Integration
- **Flux Compatibility**: Works with Flux CD for automated deployments.
- **ArgoCD Support**: Works with ArgoCD to manage apps.
- **Helm Integration**: Deploy with Helm charts.

### CI/CD Integration
- **Pipeline Integration**: Works with CI/CD pipelines.
- **Automated Testing**: Test configs automatically.
- **Version Control**: Works with Git workflows.

## Resource Organization

### Namespace Support
- **Multi-tenancy**: Isolate resources by namespace.
- **Cross-namespace References**: Resources can point to configs in other namespaces.
- **Default Namespace**: Set the default namespace for resources.

### Resource Relationships
- **Config References**: Resources reference Config for connection details.
- **Dependency Management**: Handles dependencies between resources.
- **Cascading Updates**: Updates flow through to dependent resources.

## Operational Excellence

### High Availability
- **Stateless Operation**: The operator keeps no local state.
- **Horizontal Scaling**: Runs 2 replicas by default for high availability.
- **Leader Election**: Coordinates multiple instances.
- **PodDisruptionBudget**: Keeps a minimum number of pods up during cluster maintenance.
- **Anti-Affinity Rules**: Spreads replicas across nodes so one node failure does not stop the operator.
- **Topology Spread Constraints**: Spreads pods evenly across availability zones.

### Performance
- **Efficient Reconciliation**: Reconciliation loops are tuned for speed.
- **Batch Processing**: Uses bulk operations where it can.
- **Resource Caching**: Cuts down on API calls to OpenObserve.
- **Configurable Concurrency**: Tune controller concurrency for each resource type.
- **Rate Limiting**: Set API rate limits so the operator does not overload OpenObserve.
- **Connection Pooling**: Manages HTTP connections with pools you can tune.

### Performance Tuning Configuration

You can tune the operator's performance in the ConfigMap (`manifests/02-configmap.yaml`). The settings are listed below:

#### Controller Concurrency Settings
- **ALERT_CONTROLLER_CONCURRENCY**: Controls parallel alert processing (default: 1, recommended: 1-20).
- **TEMPLATE_CONTROLLER_CONCURRENCY**: Controls alert template processing (default: 1, recommended: 1-10).
- **DESTINATION_CONTROLLER_CONCURRENCY**: Controls destination processing (default: 1, recommended: 1-20).
- **PIPELINE_CONTROLLER_CONCURRENCY**: Controls pipeline processing (default: 1, recommended: 1-10).
- **FUNCTION_CONTROLLER_CONCURRENCY**: Controls function processing (default: 1, recommended: 1-5).
- **CONFIG_CONTROLLER_CONCURRENCY**: Controls configuration processing (default: 1, recommended: 1-3).
- **DASHBOARD_CONTROLLER_CONCURRENCY**: Controls dashboard processing (default: 1, recommended: 1-10).

#### API Rate Limiting
- **O2_RATE_LIMIT_RPS**: Requests per second to OpenObserve API (default: 10, max: 100).
- **O2_RATE_LIMIT_BURST**: Burst capacity for API requests (default: 20, max: 200).

#### HTTP Connection Pool Management
- **O2_MAX_CONNS_PER_HOST**: Maximum concurrent connections per host (default: 10).
- **O2_MAX_IDLE_CONNS**: Total maximum idle connections (default: 100).
- **O2_MAX_IDLE_CONNS_PER_HOST**: Maximum idle connections per host (default: 10).
- **O2_IDLE_CONN_TIMEOUT**: Idle connection timeout duration (default: 90s).
- **O2_HTTP_TIMEOUT**: HTTP request timeout (default: 30s).

#### Logging Configuration
- **O2OPERATOR_LOG_LEVEL**: Operator log verbosity (options: debug, info, error; default: info).

#### Optional Features
- **SKIP_STREAM_VALIDATION**: Skip stream validation in webhooks when needed.

### Maintenance
- **Zero-Downtime Updates**: Upgrade the operator with rolling updates.
- **Backward Compatibility**: Manages compatibility between API versions.
- **Migration Support**: Tools to move between versions.

## Troubleshooting & Debugging

### Diagnostic Features
- **Detailed Logging**: Full operator logs.
- **Event Recording**: Records Kubernetes events for key operations.
- **Status Conditions**: Detailed conditions help you debug.

### Documentation & Support
- **Comprehensive Documentation**:
  - API references.
  - Troubleshooting guides.
  - Deployment instructions.
- **Sample Configurations**: Ready-to-use examples for common cases.
- **Issue Tracking**: Use GitHub to report bugs and request features.

## Future-Ready Design

### Extensibility
- **CRD Versioning**: Supports more than one API version.
- **Custom Fields**: Unknown fields are kept for future extensions.
- **Plugin Architecture**: Built to support plugins later.

### Scalability
- **Resource Limits**: Set limits, for example a max of 10 alert destinations.
- **Pagination Support**: Ready for large deployments.
- **Bulk Operations**: Built for batch processing.

## 🚧 Development In-Progress

The features below are in active development. They will ship in upcoming releases.

### Enhanced Destination Features

The Destination CRD is available now. It supports basic alert and pipeline destinations. We plan to add the features below.

**Additional Destination Types (Coming Soon):**
- **Alert Destinations**:
  - OpsGenie
  - Discord
  - Telegram
  - Microsoft Teams (native integration).
  - Webhooks with custom authentication schemes.

- **Advanced Features**:
  - Alert routing rules.
  - Severity-based filtering.
  - Time-based routing (business hours, on-call schedules).
  - Alert aggregation and batching.
  - Escalation policies.
  - Acknowledgment tracking.
  - Two-way integrations.
  - Rate limiting and throttling.
  - Delivery confirmation tracking.

### OpenObserveRemoteDestinations (o2remotedest)

A planned Custom Resource for complex remote data destinations. It goes beyond what the current Destination CRD can do.

**Planned Features:**
- **Advanced Destination Types**:
  - Object storage (S3, GCS, Azure Blob Storage).
  - Message queues (Kafka, RabbitMQ, Amazon SQS, Azure Service Bus).
  - Time-series databases (InfluxDB, Prometheus, VictoriaMetrics).
  - Data warehouses (Snowflake, BigQuery, Redshift).
  - Grafana Cloud

- **Data Management**:
  - Batch and streaming modes.
  - Data format conversion (JSON, Parquet, Avro, CSV).
  - Compression options (gzip, snappy, zstd).
  - Partitioning strategies.
  - Schema management.
  - Data retention policies.

- **Reliability Features**:
  - Dead letter queue support.
  - Circuit breaker patterns.
  - Automatic retries with exponential backoff.
  - Connection pooling.
  - Health checks and monitoring.
  - Automatic failover to backup destinations.
  - Data buffering and queuing.

- **Security & Compliance**:
  - End-to-end encryption.
  - Authentication mechanisms (OAuth2, API keys, mTLS, IAM roles).
  - Data masking and PII redaction.
  - Audit logging for data transfers.
  - Compliance metadata tagging.
  - Data residency controls.

**Integration with Pipelines:**
- Reference remote destinations in pipeline outputs.
- Share destinations across multiple pipelines.
- Conditional routing based on data attributes.
- Load balancing across multiple instances.
- Data replication and fan-out patterns.


### Community Feedback

We welcome your input on these upcoming features. Share your use cases and needs through:
- GitHub Issues for feature requests [open an issue](https://github.com/openobserve/o2-k8s-operator/issues).
- Community forums for discussions [Start the conversation →](https://short.openobserve.ai/community).

## Summary

The OpenObserve Kubernetes Operator helps you manage observability configs at scale. It is built for enterprise use. With it, teams can:

- Use GitOps workflows for observability.
- Keep environments consistent.
- Automate operational tasks with alerts, pipelines, and functions.
- Manage alert templates and destinations as code.
- Meet security and compliance needs.
- Scale observability management with less effort.
- Transform and enrich data with VRL functions.
- Configure flexible notification channels and data routing.

The operator works for a single OpenObserve instance. It also works for a complex setup across many environments.