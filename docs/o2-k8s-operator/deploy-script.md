
## Main Deployment Script (deploy.sh)

The `deploy.sh` script handles the complete lifecycle of operator management.

### Usage
```bash
./deploy.sh [OPTIONS]
```

### Options
- `--uninstall` - Uninstall the operator and all resources
- `--namespace <name>` - Target namespace (default: o2operator)
- `--image <repo>` - Custom image repository
- `--tag <tag>` - Custom image tag (default: latest)
- `--skip-certs` - Skip certificate generation (use existing)
- `--dry-run` - Preview changes without applying them
- `-h, --help` - Show help message

### Examples
```bash
# Basic installation
./deploy.sh

# Preview changes without applying (dry-run)
./deploy.sh --dry-run

# Install with custom image
./deploy.sh --image public.ecr.aws/zinclabs/o2operator --tag v1.0.0

# Uninstall operator (handles finalizers automatically)
./deploy.sh --uninstall

# Skip certificate generation (use existing certificates)
./deploy.sh --skip-certs
```

## Kubernetes Manifests

### Core Manifests (`manifests/`)

1. **00-namespace.yaml** - Creates the `o2operator` namespace
2. **CRD Files** - Custom Resource Definitions:
   - `01-o2configs.crd.yaml` - OpenObserveConfig for connection settings
   - `01-o2alerts.crd.yaml` - OpenObserveAlert for alert definitions
   - `01-o2alerttemplates.crd.yaml` - OpenObserveAlertTemplate for notification templates
   - `01-o2destinations.crd.yaml` - OpenObserveDestination for alert and pipeline destinations
   - `01-o2pipelines.crd.yaml` - OpenObservePipeline for data pipeline configurations
   - `01-o2functions.crd.yaml` - OpenObserveFunction for VRL transformation functions
3. **02-configmap.yaml** - ConfigMap for operator configuration:
   - Controller concurrency settings for each resource type
   - API rate limiting configuration (RPS and burst)
   - HTTP connection pool settings
   - Logging level configuration
   - Optional stream validation settings
4. **02-rbac.yaml** - Sets up RBAC:
   - ServiceAccount for the operator
   - ClusterRole with required permissions
   - ClusterRoleBinding
   - Leader election Role and RoleBinding
5. **03-deployment.yaml** - Contains:
   - Operator Deployment (with HA configuration, 2 replicas)
   - PodDisruptionBudget for high availability
   - Metrics Service (port 8080)
   - Webhook Service (port 443)
6. **04-webhook.yaml** - ValidatingWebhookConfiguration for resource validation

## Operator Configuration

The operator behavior can be tuned via the ConfigMap in `manifests/02-configmap.yaml`:

### Performance Tuning Options

- **Controller Concurrency**: Control parallel processing for each resource type
  - `ALERT_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-20
  - `TEMPLATE_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-10
  - `DESTINATION_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-20
  - `PIPELINE_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-10
  - `FUNCTION_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-5
  - `CONFIG_CONTROLLER_CONCURRENCY`: Default 1, recommended 1-3

- **API Rate Limiting**: Control API request rates to OpenObserve
  - `O2_RATE_LIMIT_RPS`: Requests per second (default: 10, max: 100)
  - `O2_RATE_LIMIT_BURST`: Burst capacity (default: 20, max: 200)

- **HTTP Connection Pool**: Manage HTTP connections
  - `O2_MAX_CONNS_PER_HOST`: Max concurrent connections (default: 10)
  - `O2_MAX_IDLE_CONNS`: Total idle connections (default: 100)
  - `O2_MAX_IDLE_CONNS_PER_HOST`: Idle connections per host (default: 10)
  - `O2_IDLE_CONN_TIMEOUT`: Idle connection timeout (default: 90s)
  - `O2_HTTP_TIMEOUT`: HTTP request timeout (default: 30s)

- **Logging**: Control operator log verbosity
  - `O2OPERATOR_LOG_LEVEL`: Log level (debug, info, error)

## Environment Configuration

### OpenObserve Configuration (`configs/`)

The `configs/` directory contains environment-specific configurations:

- **dev/o2dev-config.yaml** - Development environment configuration
- **test/o2test-config.yaml** - Test environment configuration
- **prod/o2prod-config.yaml** - Production environment configuration

Each configuration file contains:
- Secret definition for OpenObserve credentials
- OpenObserveConfig resource definition

**Important**: Edit the appropriate configuration file before applying to add your actual:
- OpenObserve endpoint URL
- Username and password
- Organization name

## Sample Resources

### Alert Samples (`samples/alerts/`)

11 example alert configurations demonstrating various use cases:
- **alert9-minimal.template.yaml** - Minimal configuration example
- **alert1-full.template.yaml** - Full-featured alert with all options
- **alert2-simple-log.template.yaml** - Basic log monitoring
- **alert3-sql.template.yaml** - SQL query-based alerts
- **alert4-promql.template.yaml** - PromQL metrics alerts
- **alert5-realtime.template.yaml** - Real-time alerting
- **alert6-deduplication.template.yaml** - Alert deduplication
- **alert7-multi-time-range.template.yaml** - Multiple time ranges
- **alert8-traces.template.yaml** - Distributed tracing alerts
- **alert-aggregation-example.yaml** - Aggregation examples
- **alert.sample.yaml** - General sample alert

### Alert Template Samples (`samples/alerttemplates/`)

5 alert template examples for different notification formats:
- **alerttemplate.template.yaml** - Complete template with all available options
- **email-alert-template.yaml** - Email notification template
- **http-alert-template.yaml** - Generic HTTP webhook template
- **http-pagerduty-webhook-template.yaml** - PagerDuty integration template
- **http-slack-webhook-template.yaml** - Slack notification template

### Destination Samples (`samples/destinations/`)

Multiple destination configurations for alerts and pipelines:
- **destination.template.yaml** - Complete destination with all available options
- **email-alert-destination.yaml** - Email destination for alerts
- **http-alert-destination.yaml** - HTTP webhook destination for alerts
- **pipeline-custom-destination.yaml** - Custom HTTP destination for pipelines
- **pipeline-datadog-destination.yaml** - Datadog integration for pipelines
- **pipeline-dynatrace-destination.yaml** - Dynatrace integration for pipelines
- **pipeline-elasticsearch-destination.yaml** - Elasticsearch destination
- **pipeline-newrelic-destination.yaml** - New Relic integration
- **pipeline-openobserve-desntination.yaml** - OpenObserve to OpenObserve replication
- **pipeline-splunk-destination.yaml** - Splunk integration

### Pipeline Samples (`samples/pipelines/`)

5 pipeline configuration examples:
- **pipeline.sample.yaml** - General sample pipeline configuration
- **srctodest.yaml** - Simple source to destination pipeline
- **srctodest-two-branches.yaml** - Multi-branch pipeline with conditions
- **querysrctodest-sql.yaml** - SQL query-based data transformation
- **querysrctodest-promql.yaml** - PromQL query-based pipeline

### Function Samples (`samples/functions/`)

VRL transformation function examples:
- **basic-function.yaml** - Basic VRL function example
- **functions.template** - Template reference for function configuration
