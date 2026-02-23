# OpenObserve Kubernetes Operator Features

## Overview

The OpenObserve Kubernetes Operator provides a comprehensive set of features for managing OpenObserve Enterprise resources through Kubernetes-native Custom Resources. This document outlines all available features organized by category, including alerts, pipelines, functions, and configurations.

## Core Features

### 🎯 Declarative Resource Management
- **Native Kubernetes Integration**: Manage OpenObserve resources as standard Kubernetes Custom Resource Definitions (CRDs)
- **GitOps Ready**: Full support for GitOps workflows with version control and automated deployments
- **Infrastructure as Code**: Define and manage observability configurations alongside application deployments
- **Multi-Instance Support**: Manage multiple OpenObserve instances from a single Kubernetes cluster
- **Comprehensive Resource Types**: Manage alerts, alert templates, destinations, pipelines, functions, and configurations as code

### 🔄 Automated Lifecycle Management
- **Resource Synchronization**: Automatic sync between Kubernetes resources and OpenObserve configurations
- **Status Tracking**: Real-time monitoring of resource sync status with detailed condition reporting
- **Generation Tracking**: Tracks resource generations to ensure consistency between desired and actual states
- **Finalizer Support**: Proper cleanup of OpenObserve resources when Kubernetes resources are deleted
- **Resource Types**: Full lifecycle management for alerts, alert templates, destinations, pipelines, functions, and configurations

## Custom Resource Definitions (CRDs)

### 1. OpenObserveConfig (o2config)

Manages connection configurations to OpenObserve instances.

**Key Features:**
- **Secure Credential Management**: Credentials stored as Kubernetes Secrets
- **Multiple Instance Support**: Configure connections to different OpenObserve environments (dev, test, prod)
- **TLS Configuration**: Optional TLS verification settings
- **Organization Scoping**: Organization-level configuration management
- **Connection Validation**: Automatic validation of endpoint connectivity

**Configuration Options:**
- `endpoint`: OpenObserve API endpoint URL
- `organization`: Target organization name
- `credentialsSecretRef`: Reference to Kubernetes Secret containing API tokens
- `tlsVerify`: Enable/disable TLS certificate verification

### 2. OpenObserveAlert (o2alert)

Manages alert definitions with comprehensive monitoring capabilities.

**Key Features:**

#### Query Capabilities
- **Multiple Query Types**:
  - Custom queries
  - SQL-based queries
  - PromQL queries for metrics
- **Stream Support**: Works with logs, metrics, and traces
- **Aggregation Functions**: Support for groupBy, having clauses, and various aggregation functions
- **VRL Functions**: Vector Remap Language function support
- **Multi-Time Range**: Compare data across different time windows

#### Trigger Conditions
- **Flexible Scheduling**:
  - Frequency-based triggers (minutes, hours, days)
  - Cron expression support
  - Time window configuration (period)
- **Threshold Management**:
  - Multiple comparison operators (=, !=, >=, <=, >, <)
  - Configurable thresholds
  - Silence periods to prevent alert fatigue
- **Advanced Options**:
  - Timezone support
  - Tolerance settings (toleranceInSecs)
  - Time alignment options

#### Alert Management
- **Real-time Alerts**: Support for real-time alert processing
- **Deduplication**:
  - Fingerprint-based deduplication
  - Configurable time windows
  - Custom fingerprint fields
- **Context Enrichment**:
  - Context attributes for additional metadata
  - Row templates (String or JSON format)
  - Custom template variables

#### Organization & Delivery
- **Folder Organization**: Support for organizing alerts in folders
- **Multiple Destinations**: Up to 10 destination channels per alert
- **Status Tracking**:
  - Alert enablement status
  - Last sync time
  - OpenObserve alert ID tracking

### 3. OpenObserveAlertTemplate (o2alerttemplate, alerttemplate)

Manages alert notification templates for formatting alert messages across different channels.

**Key Features:**

#### Template Management
- **Multiple Template Types**:
  - HTTP templates for webhooks (Slack, PagerDuty, etc.)
  - Email templates for email notifications
- **Template Variables**: Support for dynamic variables in templates
- **Default Templates**: Mark templates as default for automatic use
- **Organization Scoping**: Templates are created at the organization level

#### Template Formatting
- **Title Templates**: Dynamic titles with variable substitution
- **Body Templates**:
  - JSON format for HTTP webhooks
  - HTML/text format for emails
  - Support for complex nested structures
- **Variable Placeholders**:
  - `{alert_name}`: Name of the triggered alert
  - `{stream_name}`: Source stream name
  - `{severity}`: Alert severity level
  - `{triggered_at}`: Timestamp when alert was triggered
  - `{org_name}`: Organization name
  - `{threshold}`: Configured threshold value
  - Custom variables from alert context

#### Use Cases
- **Slack Notifications**: Formatted messages with blocks and markdown
- **PagerDuty Integration**: Structured incident creation
- **Email Alerts**: Rich HTML email notifications
- **Custom Webhooks**: Tailored JSON payloads for any HTTP endpoint
- **Microsoft Teams**: Adaptive cards and formatted messages
- **Generic HTTP**: Flexible templates for any webhook service

### 4. OpenObserveDestination (o2dest, o2destination)

Manages destinations for both alerts and pipelines, defining where data and notifications are sent.

**Key Features:**

#### Alert Destinations
- **Destination Types**:
  - HTTP webhooks (Slack, PagerDuty, custom endpoints)
  - Email (SMTP) destinations
  - SNS (Amazon Simple Notification Service)
- **Template Integration**: Reference alert templates for message formatting
- **Authentication Support**:
  - Bearer tokens
  - API keys in headers
  - Custom headers
- **TLS Configuration**: Optional TLS certificate verification

#### Pipeline Destinations
- **Destination Types**:
  - OpenObserve instances (for data replication)
  - Splunk
  - New Relic
  - Elasticsearch
  - Dynatrace
  - Datadog
  - Custom HTTP endpoints
- **Output Formats**:
  - JSON (standard or nested event format)
  - Elasticsearch bulk format
  - Custom formats per destination type
- **Metadata Support**: Additional metadata for destination configuration

#### Configuration Options
- **HTTP Configuration**:
  - URL endpoint
  - HTTP method (POST, PUT, GET)
  - Custom headers
  - Request timeout settings
- **Email Configuration**:
  - Multiple recipient emails
  - Template selection
- **SNS Configuration**:
  - AWS region
  - SNS Topic ARN
  - Action ID

#### Advanced Features
- **Skip TLS Verify**: Development/testing with self-signed certificates
- **Category Detection**: Automatic categorization as alert or pipeline destination
- **Error Handling**: Detailed error reporting and retry logic
- **Status Tracking**: Real-time sync status with destination services

### 5. OpenObserveFunction (o2function, o2func)

Manages VRL (Vector Remap Language) transformation functions for data processing.

**Key Features:**

#### Function Management
- **VRL Support**: Write functions in Vector Remap Language for powerful data transformations
- **Reusable Functions**: Create centralized functions that can be used across multiple pipelines
- **Organization Scoping**: Functions are created at the organization level
- **Name Validation**: Enforced naming patterns for consistency

#### Testing & Validation
- **Built-in Testing**: Define test cases with input and expected output
- **Test Execution**: Automatic validation of function logic during deployment
- **Error Reporting**: Detailed error messages for failed tests
- **Multiple Test Cases**: Support for multiple test scenarios per function

#### Use Cases
- **Data Transformation**: Modify, enrich, or restructure log data
- **Field Extraction**: Parse and extract fields from unstructured data
- **Data Enrichment**: Add contextual information to events
- **Format Conversion**: Convert between different data formats
- **Filtering**: Implement complex filtering logic
- **Aggregation**: Perform custom aggregations on data streams

#### Integration
- **Pipeline Integration**: Functions can be referenced in pipelines for data processing
- **Stream Compatibility**: Works with logs, metrics, and traces
- **Version Tracking**: Generation tracking for function updates
- **Status Monitoring**: Real-time sync status with OpenObserve

### 6. OpenObservePipeline (o2pipeline)

Manages data processing pipelines with advanced transformation capabilities.

**Key Features:**

#### Source Configuration
- **Multiple Source Types**:
  - Real-time data sources
  - Scheduled/batch sources
  - Query-based sources
- **Stream Types**: Logs, metrics, and traces
- **Flexible Scheduling**:
  - Cron expressions
  - Frequency-based schedules
  - Time-based triggers

#### Pipeline Processing
- **Node-Based Architecture**:
  - Modular node system for data processing
  - Configurable node parameters
  - Support for various transformation types
- **Edge Connections**:
  - Define data flow between nodes
  - Support for branching pipelines
  - Multiple processing paths

#### Advanced Features
- **Version Control**: Pipeline versioning support
- **Pause/Resume**: Ability to pause pipelines at specific points
- **Error Handling**: Detailed error tracking and reporting
- **Delay Configuration**: Configurable processing delays
- **Timezone Support**: Per-pipeline timezone configuration

## Deployment & Operations Features

### 🚀 Automated Deployment
- **One-Command Deployment**: Simple deployment script with customizable options
- **Image Configuration**: Support for custom container images and tags
- **Namespace Management**: Flexible namespace configuration
- **RBAC Setup**: Automatic creation of required roles and permissions
- **ConfigMap-Based Configuration**: Centralized configuration management for operator behavior

### 🔐 Security Features
- **Webhook Security**:
  - Auto-generated TLS certificates for webhooks
  - Certificate rotation support
  - Secure admission control
- **Secret Management**:
  - Kubernetes-native secret handling
  - Credential isolation per namespace
- **RBAC Controls**:
  - Granular permission management
  - Cluster and namespace-scoped roles
- **Container Security**:
  - Runs as non-root user (UID 65534)
  - Read-only root filesystem
  - No privilege escalation allowed
  - All capabilities dropped
  - Seccomp profile enabled
- **Pod Security**:
  - Security context properly configured
  - Resource limits enforced
  - Temporary directory size limits

### 📊 Monitoring & Observability
- **Status Reporting**:
  - Detailed condition tracking (Ready, Synced, Error states)
  - Last sync timestamps
  - Error messages and reasons
- **Custom Printer Columns**:
  - Quick status overview in kubectl output
  - Key field visibility (Stream, Enabled, Ready, Age)
- **Generation Tracking**: Version tracking for resource updates
- **Health Probes**:
  - Liveness probe at `/healthz` endpoint
  - Readiness probe at `/readyz` endpoint
  - Startup probe for graceful initialization
- **Metrics Endpoint**:
  - Prometheus-compatible metrics at `/metrics` on port 8080
  - Service annotations for automatic Prometheus discovery
  - Operational metrics and controller performance data

## Advanced Capabilities

### 🔄 Reconciliation Features
- **Continuous Reconciliation**: Ensures desired state matches actual state
- **Error Recovery**: Automatic retry with exponential backoff
- **Drift Detection**: Identifies and corrects configuration drift
- **Resource Validation**: Pre-flight validation before applying changes

### 🎛️ Operational Features
- **Production-Ready Deployment**:
  - Default high availability setup with 2 replicas
  - Automatic leader election for active-passive operation
  - Zero-downtime rolling updates
  - Priority class for critical infrastructure components
- **Dry Run Support**: Preview changes before applying
- **Uninstall Management**:
  - Complete cleanup with finalizer removal
  - Ordered resource deletion (alerts, alert templates, destinations, pipelines, functions, configurations)
  - Namespace cleanup
- **Multi-Environment Support**:
  - Development, test, and production configurations
  - Environment-specific templates
- **Resource Management**:
  - Configurable resource requests and limits
  - Default: 200m CPU / 256Mi memory (requests), 1 CPU / 1Gi memory (limits)
  - Horizontal scaling capabilities

### 🔧 Developer Features
- **Sample Templates**: Comprehensive examples for all resource types (alerts, alert templates, destinations, pipelines, functions)
- **Validation Webhooks**: Input validation at admission time
- **Status Subresources**: Proper status update mechanisms
- **Preserved Unknown Fields**: Future compatibility for API extensions

## Integration Capabilities

### GitOps Integration
- **Flux Compatibility**: Works with Flux CD for automated deployments
- **ArgoCD Support**: Compatible with ArgoCD for application management
- **Helm Integration**: Can be deployed via Helm charts

### CI/CD Integration
- **Pipeline Integration**: Integrates with CI/CD pipelines
- **Automated Testing**: Support for automated configuration testing
- **Version Control**: Full compatibility with Git workflows

## Resource Organization

### Namespace Support
- **Multi-tenancy**: Isolate resources by namespace
- **Cross-namespace References**: Support for referencing configs across namespaces
- **Default Namespace**: Configurable default namespace for resources

### Resource Relationships
- **Config References**: Resources reference OpenObserveConfig for connection details
- **Dependency Management**: Proper handling of resource dependencies
- **Cascading Updates**: Updates propagate through dependent resources

## Operational Excellence

### High Availability
- **Stateless Operation**: Operator maintains no local state
- **Horizontal Scaling**: Default deployment with 2 replicas for high availability
- **Leader Election**: Proper coordination for multiple instances
- **PodDisruptionBudget**: Ensures minimum availability during cluster maintenance
- **Anti-Affinity Rules**: Spreads replicas across different nodes for fault tolerance
- **Topology Spread Constraints**: Even distribution across availability zones

### Performance
- **Efficient Reconciliation**: Optimized reconciliation loops
- **Batch Processing**: Bulk operations where applicable
- **Resource Caching**: Minimizes API calls to OpenObserve
- **Configurable Concurrency**: Tune controller concurrency for each resource type
- **Rate Limiting**: Configurable API rate limits to prevent overwhelming OpenObserve
- **Connection Pooling**: Efficient HTTP connection management with configurable pools

### Performance Tuning Configuration

The operator provides extensive performance tuning options via ConfigMap (`manifests/02-configmap.yaml`):

#### Controller Concurrency Settings
- **ALERT_CONTROLLER_CONCURRENCY**: Controls parallel alert processing (default: 1, recommended: 1-20)
- **TEMPLATE_CONTROLLER_CONCURRENCY**: Controls alert template processing (default: 1, recommended: 1-10)
- **DESTINATION_CONTROLLER_CONCURRENCY**: Controls destination processing (default: 1, recommended: 1-20)
- **PIPELINE_CONTROLLER_CONCURRENCY**: Controls pipeline processing (default: 1, recommended: 1-10)
- **FUNCTION_CONTROLLER_CONCURRENCY**: Controls function processing (default: 1, recommended: 1-5)
- **CONFIG_CONTROLLER_CONCURRENCY**: Controls configuration processing (default: 1, recommended: 1-3)

#### API Rate Limiting
- **O2_RATE_LIMIT_RPS**: Requests per second to OpenObserve API (default: 10, max: 100)
- **O2_RATE_LIMIT_BURST**: Burst capacity for API requests (default: 20, max: 200)

#### HTTP Connection Pool Management
- **O2_MAX_CONNS_PER_HOST**: Maximum concurrent connections per host (default: 10)
- **O2_MAX_IDLE_CONNS**: Total maximum idle connections (default: 100)
- **O2_MAX_IDLE_CONNS_PER_HOST**: Maximum idle connections per host (default: 10)
- **O2_IDLE_CONN_TIMEOUT**: Idle connection timeout duration (default: 90s)
- **O2_HTTP_TIMEOUT**: HTTP request timeout (default: 30s)

#### Logging Configuration
- **O2OPERATOR_LOG_LEVEL**: Operator log verbosity (options: debug, info, error; default: info)

#### Optional Features
- **SKIP_STREAM_VALIDATION**: Skip stream validation in webhooks when needed

### Maintenance
- **Zero-Downtime Updates**: Rolling updates for operator upgrades
- **Backward Compatibility**: API version compatibility management
- **Migration Support**: Tools for migrating between versions

## Troubleshooting & Debugging

### Diagnostic Features
- **Detailed Logging**: Comprehensive operator logs
- **Event Recording**: Kubernetes events for important operations
- **Status Conditions**: Detailed condition reporting for debugging

### Documentation & Support
- **Comprehensive Documentation**:
  - API references
  - Troubleshooting guides
  - Deployment instructions
- **Sample Configurations**: Ready-to-use examples for common scenarios
- **Issue Tracking**: GitHub integration for bug reports and features

## Future-Ready Design

### Extensibility
- **CRD Versioning**: Support for multiple API versions
- **Custom Fields**: Preserved unknown fields for future extensions
- **Plugin Architecture**: Designed for future plugin support

### Scalability
- **Resource Limits**: Configurable limits (e.g., max 10 alert destinations)
- **Pagination Support**: Ready for large-scale deployments
- **Bulk Operations**: Designed for batch processing capabilities

## 🚧 Development In-Progress

The following features are currently under active development and will be available in upcoming releases:

### Enhanced Destination Features

While the OpenObserveDestination CRD is now available with support for basic alert and pipeline destinations, the following enhanced features are planned:

**Additional Destination Types (Coming Soon):**
- **Alert Destinations**:
  - OpsGenie
  - Discord
  - Telegram
  - Microsoft Teams (native integration)
  - Webhooks with custom authentication schemes

- **Advanced Features**:
  - Alert routing rules
  - Severity-based filtering
  - Time-based routing (business hours, on-call schedules)
  - Alert aggregation and batching
  - Escalation policies
  - Acknowledgment tracking
  - Two-way integrations
  - Rate limiting and throttling
  - Delivery confirmation tracking

### OpenObserveRemoteDestinations (o2remotedest)

An advanced Custom Resource for managing complex remote data destinations beyond the current OpenObserveDestination capabilities.

**Planned Features:**
- **Advanced Destination Types**:
  - Object storage (S3, GCS, Azure Blob Storage)
  - Message queues (Kafka, RabbitMQ, Amazon SQS, Azure Service Bus)
  - Time-series databases (InfluxDB, Prometheus, VictoriaMetrics)
  - Data warehouses (Snowflake, BigQuery, Redshift)
  - Grafana Cloud

- **Data Management**:
  - Batch and streaming modes
  - Data format conversion (JSON, Parquet, Avro, CSV)
  - Compression options (gzip, snappy, zstd)
  - Partitioning strategies
  - Schema management
  - Data retention policies

- **Reliability Features**:
  - Dead letter queue support
  - Circuit breaker patterns
  - Automatic retries with exponential backoff
  - Connection pooling
  - Health checks and monitoring
  - Automatic failover to backup destinations
  - Data buffering and queuing

- **Security & Compliance**:
  - End-to-end encryption
  - Authentication mechanisms (OAuth2, API keys, mTLS, IAM roles)
  - Data masking and PII redaction
  - Audit logging for data transfers
  - Compliance metadata tagging
  - Data residency controls

**Integration with Pipelines:**
- Reference remote destinations in pipeline outputs
- Share destinations across multiple pipelines
- Conditional routing based on data attributes
- Load balancing across multiple instances
- Data replication and fan-out patterns


### Community Feedback

We welcome community input on these upcoming features. Please share your use cases and requirements through:
- GitHub Issues for feature requests [open an issue](https://github.com/openobserve/o2-k8s-operator/issues)
- Community forums for discussions [Start the conversation →](https://short.openobserve.ai/community)

## Summary

The OpenObserve Kubernetes Operator provides a robust, enterprise-ready solution for managing observability configurations at scale. With its comprehensive feature set, it enables teams to:

- Implement GitOps workflows for observability
- Maintain consistency across environments
- Automate operational tasks with alerts, pipelines, and functions
- Manage alert templates and destinations as code
- Ensure security and compliance
- Scale observability management efficiently
- Transform and enrich data with VRL functions
- Configure flexible notification channels and data routing

Whether you're managing a single OpenObserve instance or orchestrating a complex multi-environment setup, the operator provides the tools and capabilities needed for success.