/**
 * One-time content fix: bring over-length meta descriptions under 165 chars.
 *
 * 87 pages had a `description` long enough that Google would truncate it
 * mid-sentence in results, so the snippet stopped short of the point. Each one
 * below was rewritten from that page's own description and heading, keeping the
 * product names and key terms that make the snippet useful.
 *
 * Run: node scripts/migration/fix-long-descriptions.mjs [--dry]
 */
import fs from 'node:fs';

const DRY = process.argv.includes('--dry');

const DESCRIPTIONS = {
  'docs/administration/configuration/o2-cli/o2-cli.md':
    'Manage OpenObserve alerts, pipelines, destinations, functions, and templates from the command line across environments, with CI/CD-ready workflows.',
  'docs/administration/configuration/o2-k8s-operator/o2-operator-overview.md':
    'Manage OpenObserve as code with the Kubernetes Operator. Define alerts, pipelines, functions, destinations, and templates declaratively, GitOps-ready.',
  'docs/administration/maintenance/storage-management/bring-your-own-bucket.md':
    'Bring Your Own Bucket lets OpenObserve Cloud write telemetry straight to your own S3, Azure Blob, or Google Cloud Storage, keeping data in your account.',
  'docs/architecture.md':
    'How OpenObserve is structured: single-node and HA deployment modes, the role of each component, how data flows through the system, and how durability works.',
  'docs/enterprise-setup/azure-aks.md':
    'Install OpenObserve Enterprise on Azure AKS with Azure Blob Storage and CloudNativePG. Step-by-step CLI and Portal paths, with verification and troubleshooting.',
  'docs/enterprise-setup/capacity-planning.md':
    'Capacity planning for OpenObserve: compute, memory, and storage sizing for production observability workloads and high availability clusters.',
  'docs/enterprise-setup/google-gke.md':
    'Install OpenObserve Enterprise on Google GKE with GCS object storage and CloudNativePG. Step-by-step CLI and Console paths, with verification and troubleshooting.',
  'docs/enterprise-setup/terraform.md':
    'Deploy OpenObserve on Kubernetes and manage streams, dashboards, users, and organizations as code with the official Terraform provider. OpenTofu supported.',
  'docs/features/enterprise.md':
    'OpenObserve Enterprise capabilities: extended retention, federated search, BYOB storage, SSO, RBAC, cipher keys, query and workload management, and audit trail.',
  'docs/features/logs.md':
    'Collect, store, search, and analyze logs at scale with OpenObserve: multiple ingestion protocols, full-text and SQL search, and configurable retention.',
  'docs/features/metrics.md':
    'Collect, query, and visualize metrics at scale with OpenObserve: Prometheus remote-write, OTLP, PromQL and SQL, dashboards, and downsampling.',
  'docs/ingestion/logs/syslog.md':
    'Configure syslog server integration to collect system, server, and network device logs over TCP or UDP with OpenObserve for centralized logging.',
  'docs/ingestion/metrics/index.md':
    'Ingest metrics into OpenObserve with Prometheus, the OpenTelemetry Collector, or Telegraf for infrastructure and application performance monitoring.',
  'docs/ingestion/metrics/prometheus.md':
    'Configure Prometheus remote write to ingest metrics into OpenObserve for Kubernetes, infrastructure, and application monitoring with SQL and PromQL.',
  'docs/ingestion/traces/index.md':
    'Configure OpenTelemetry distributed tracing over HTTP or gRPC with OpenObserve for application performance monitoring and microservices observability.',
  'docs/integration/ai/frameworks/index.md':
    'Instrument AI orchestration and agent frameworks with OpenObserve. Trace LangChain, CrewAI, LlamaIndex, AutoGen, and 30+ more via OpenTelemetry.',
  'docs/integration/ai/gateways/index.md':
    'Monitor AI gateway traffic with OpenObserve. Trace Portkey, LiteLLM Proxy, OpenRouter, Kong, and Vercel AI Gateway for token usage, latency, and routing.',
  'docs/integration/ai/index.md':
    'AI and LLM observability with OpenObserve: trace AI frameworks, LLM providers, AI gateways, no-code tools, and AI developer tools via OpenTelemetry.',
  'docs/integration/ai/mcp/index.md':
    'Connect AI agents and IDEs to OpenObserve over the Model Context Protocol. Query logs, metrics, and traces in natural language and create alerts.',
  'docs/integration/ai/no-code/index.md':
    'Monitor no-code AI platforms with OpenObserve. Trace n8n, Flowise, LangFlow, OpenWebUI, LobeChat, and Vapi voice AI via OpenTelemetry.',
  'docs/integration/ai/providers/index.md':
    'Trace LLM provider API calls with OpenObserve. Monitor token usage, latency, and model metadata for OpenAI, Anthropic, Gemini, Mistral, Ollama, and more.',
  'docs/integration/ai/tools/index.md':
    'Trace AI developer tools with OpenObserve: Promptfoo evaluations, Milvus vector search, Firecrawl scraping, Gradio, LibreChat, and MCP-Use agent calls.',
  'docs/integration/cloud/aws/alb.md':
    'Enable AWS Application Load Balancer access logs, store them in S3, and forward them to OpenObserve. Covers manual setup and automated deployment.',
  'docs/integration/cloud/aws/cloudwatch-logs.md':
    'Stream AWS CloudWatch application and infrastructure logs to OpenObserve using Kinesis Firehose for centralized AWS log management.',
  'docs/integration/cloud/aws/ec2.md':
    'Collect server metrics, system logs, and performance data from EC2 Linux instances using OpenTelemetry for AWS infrastructure monitoring.',
  'docs/integration/cloud/aws/ecs.md':
    'Collect container logs from AWS ECS on Fargate and EC2 using AWS FireLens with Fluent Bit for containerized application monitoring.',
  'docs/integration/cloud/aws/index.md':
    'AWS monitoring integrations for CloudWatch logs and metrics, EC2, Lambda, ECS, RDS, VPC Flow Logs, and more AWS services with OpenObserve.',
  'docs/integration/cloud/aws/lambda.md':
    'Collect AWS Lambda function logs, metrics, and performance data with the Lambda Extension, bypassing CloudWatch for cost-effective serverless monitoring.',
  'docs/integration/cloud/aws/quick-setup.md':
    'Deploy monitoring for all your AWS services from OpenObserve with the Quick Setup wizard, using CloudFormation or multi-region StackSets.',
  'docs/integration/cloud/aws/rds.md':
    'Collect MySQL and PostgreSQL logs, slow query logs, and error logs from AWS RDS via CloudWatch and Kinesis Firehose for database performance monitoring.',
  'docs/integration/cloud/aws/vpc-flow.md':
    'Send AWS VPC Flow Logs to OpenObserve with Kinesis Firehose for network traffic analysis, security monitoring, and cloud network visibility.',
  'docs/integration/cloud/azure/activity-logs.md':
    'Stream Azure subscription Activity Logs to OpenObserve with the Deploy to Azure flow, then configure diagnostic settings via the Portal or Azure CLI.',
  'docs/integration/cloud/gcp/index.md':
    'GCP monitoring integrations for Google Cloud logs, Cloud Run, and metrics collection, bringing Google Cloud observability into OpenObserve.',
  'docs/integration/data-pipeline/mulesoft.md':
    'Fetch logs from the MuleSoft Anypoint Monitoring Console and stream them into OpenObserve. Covers authentication, the AMC API, and automating the workflow.',
  'docs/integration/database/cassandra.md':
    'Monitor Apache Cassandra by collecting metrics with the OpenTelemetry JMX receiver and logs from files, then forwarding both to OpenObserve.',
  'docs/integration/database/index.md':
    'Database monitoring integrations for MySQL, PostgreSQL, MongoDB, Redis, and other SQL and NoSQL databases with OpenObserve.',
  'docs/integration/database/mongodb.md':
    'Collect MongoDB performance metrics and query statistics with OpenTelemetry for NoSQL database monitoring and observability in OpenObserve.',
  'docs/integration/database/mysql.md':
    'Collect MySQL performance metrics, query performance, and database health with OpenTelemetry for MySQL monitoring in OpenObserve.',
  'docs/integration/database/postgresql.md':
    'Collect PostgreSQL performance metrics, query analysis, and database health with OpenTelemetry for PostgreSQL monitoring in OpenObserve.',
  'docs/integration/database/redis.md':
    'Collect Redis cache performance metrics with OpenTelemetry for in-memory database monitoring and performance optimization in OpenObserve.',
  'docs/integration/database/snowflake.md':
    'Monitor Snowflake with OpenTelemetry: data warehouse performance metrics, query analytics, cost optimization, and storage observability.',
  'docs/integration/database/zookeeper.md':
    "Monitor Apache Zookeeper metrics using the OpenTelemetry Collector's Zookeeper receiver and forward them to OpenObserve for visualization.",
  'docs/integration/devops/index.md':
    'DevOps monitoring integrations for CI/CD pipelines, Jenkins, Terraform, GitHub Actions, and Ansible automation with OpenObserve.',
  'docs/integration/index.md':
    'Integration guides for Kubernetes, AWS, AI and LLM observability, databases, and infrastructure monitoring with OpenObserve logs, metrics, and traces.',
  'docs/integration/message-brokers/kafka.md':
    'Collect Apache Kafka metrics with OpenTelemetry for message broker, stream processing, and cluster monitoring in OpenObserve.',
  'docs/integration/servers/nginx.md':
    'Collect NGINX access logs, error logs, and web server performance metrics with Fluent Bit for NGINX log analysis in OpenObserve.',
  'docs/integration/system/k8s.md':
    'Kubernetes monitoring with OpenTelemetry and OpenObserve: cluster and container metrics, pod metrics, K8s logs, and microservices observability.',
  'docs/integration/system/linux.md':
    'Collect Linux system logs, server metrics, and performance data with the OpenObserve Collector for Linux server monitoring.',
  'docs/integration/system/windows.md':
    'Collect Windows event logs, server metrics, and performance data with the OpenObserve Collector for Windows server monitoring.',
  'docs/migration/migrate-from-datadog-to-openobserve/architecture.md':
    'How Datadog Agent, DogStatsD, and APM components map to OpenObserve: architecture comparison, terminology, and protocol compatibility.',
  'docs/migration/migrate-from-datadog-to-openobserve/dashboards-and-alerts.md':
    'Migrate Datadog dashboards and monitors to OpenObserve. Translate queries to PromQL and SQL, set up notification channels, and use the AI Assistant.',
  'docs/migration/migrate-from-datadog-to-openobserve/index.md':
    'Migrate metrics, traces, logs, dashboards, and monitors from Datadog to OpenObserve using the OpenTelemetry Collector, without rewriting applications.',
  'docs/migration/migrate-from-datadog-to-openobserve/logs.md':
    'Migrate logs from Datadog to OpenObserve: paths for the Datadog Agent, Fluent Bit, Vector, OTel Collector, Kubernetes, CloudWatch, and Azure Monitor.',
  'docs/migration/migrate-from-datadog-to-openobserve/metrics.md':
    'Migrate Datadog metrics to OpenObserve with the OpenTelemetry Collector. Covers DogStatsD, Agent forwarding, Kubernetes, CloudWatch, and Azure Monitor.',
  'docs/migration/migrate-from-datadog-to-openobserve/traces.md':
    "Migrate Datadog APM traces to OpenObserve using the OTel Collector's datadog receiver, or by switching application SDKs to OpenTelemetry.",
  'docs/migration/migrate-from-grafana-to-openobserve/architecture.md':
    'How Loki, Grafana, Tempo, and Mimir map to OpenObserve: architecture comparison, terminology reference, and protocol compatibility for LGTM migrations.',
  'docs/migration/migrate-from-grafana-to-openobserve/dashboards-and-alerts.md':
    'Migrate Grafana dashboards and Alertmanager rules to OpenObserve. Covers LogQL to SQL translation, PromQL compatibility, and notification channels.',
  'docs/migration/migrate-from-grafana-to-openobserve/index.md':
    'Migrate from the LGTM stack (Loki, Grafana, Tempo, Mimir) to OpenObserve. Replace four systems with one platform for metrics, traces, and logs.',
  'docs/migration/migrate-from-grafana-to-openobserve/logs.md':
    'Migrate logs from Grafana Loki to OpenObserve: paths for Promtail, OTel Collector, Fluent Bit, Vector, Grafana Alloy, Kubernetes, and CloudWatch.',
  'docs/migration/migrate-from-grafana-to-openobserve/metrics.md':
    'Migrate Prometheus and Mimir metrics to OpenObserve: remote write, OTel Collector, kube-prometheus-stack, Grafana Alloy, Telegraf, and CloudWatch.',
  'docs/migration/migrate-from-grafana-to-openobserve/traces.md':
    'Migrate distributed traces from Grafana Tempo to OpenObserve. Switch OTLP endpoints, update Collector and SDK configs, and move off Jaeger and Zipkin.',
  'docs/overview/comparison-with-alternatives/clickhouse-alternative.md':
    'How OpenObserve compares to a ClickHouse-based observability stack on assembly effort, operations, storage, and query languages: build versus buy.',
  'docs/overview/comparison-with-alternatives/datadog-alternative.md':
    'How OpenObserve compares to Datadog on pricing, custom metrics fees, vendor lock-in, OpenTelemetry support, and data ownership, with migration guidance.',
  'docs/overview/comparison-with-alternatives/newrelic-alternative.md':
    'How OpenObserve compares to New Relic on pricing, query language, OpenTelemetry support, deployment options, and data ownership, with migration guidance.',
  'docs/overview/comparison-with-alternatives/splunk-alternative.md':
    'How OpenObserve compares to Splunk on cost, query language, architecture, and operational complexity, with migration guidance for teams moving off Splunk.',
  'docs/reference/api/ingestion/logs/loki.md':
    'Ingest logs through the Grafana Loki-compatible push API. Supports Loki stream labels, nanosecond timestamps, and structured metadata.',
  'docs/reference/sql-functions/aggregate.md':
    'Use the histogram() function to group time-based log data into fixed intervals for trend analysis. Syntax, aggregate use, and a worked 30-second example.',
  'docs/reference/sql-functions/approximate-aggregate/approx-topk-distinct.md':
    'Use approx_topk_distinct() to find the top K values in one field by distinct count in another, with HyperLogLog and Space-Saving for high-cardinality data.',
  'docs/reference/sql-functions/approximate-aggregate/approx-topk.md':
    'Use approx_topk() to find the most frequent values in high-cardinality fields. Syntax, example, result structure, and comparison with GROUP BY.',
  'docs/reference/sql-functions/array.md':
    'Array functions for stringified JSON arrays in OpenObserve: sort, count, extract, join, and combine elements with arrsort, arrjoin, arrindex, and more.',
  'docs/reference/sql-functions/index.md':
    'Reference for OpenObserve SQL functions by category: full-text search, secondary index, array, aggregate, and approximate aggregate.',
  'docs/user-guide/account-administration/identity-and-access-management/keycloak-sso.md':
    'Configure Keycloak as an upstream identity provider for OpenObserve Enterprise SSO through Dex, covering the client, connector, and environment variables.',
  'docs/user-guide/account-administration/identity-and-access-management/service-accounts.md':
    'Create and manage service accounts in OpenObserve: non-human identities giving applications and automation scoped API access through a rotatable token.',
  'docs/user-guide/account-administration/identity-and-access-management/update-password.md':
    'Update usernames and passwords in OpenObserve via the UI or CLI, including root password reset and best practices for credential rotation.',
  'docs/user-guide/advanced/siem.md':
    'Build a SIEM platform on OpenObserve with threat detection, security monitoring, incident response, and SOC operations.',
  'docs/user-guide/analytics/alerts/alert-conditions.md':
    'Define alert conditions in OpenObserve with the natural language builder: count and measure modes, aggregation functions, group-by, and filters.',
  'docs/user-guide/analytics/alerts/index.md':
    'How alerting works in OpenObserve: scheduled, real-time, and anomaly detection alerts with a natural language condition builder, SQL mode, and live preview.',
  'docs/user-guide/analytics/alerts/scheduled-alerts.md':
    'Create scheduled and SQL alerts in OpenObserve. Covers the condition builder, SQL mode, Compare with Past, deduplication, and advanced configuration.',
  'docs/user-guide/analytics/dashboards/config/pivot-table.md':
    'Enable pivot mode on the dashboard Table chart to cross-tabulate data, turn breakdown values into column headers, and configure row and column totals.',
  'docs/user-guide/analytics/dashboards/config/trellis-layout.md':
    'Use Trellis Layout under the Config tab to split a chart into multiple panels by a breakdown field, making grouped values easy to compare.',
  'docs/user-guide/analytics/dashboards/panels/multi-query-support.md':
    'Configure multiple independent SQL queries in one dashboard panel to compare streams, overlay metrics, and toggle query visibility on the same chart.',
  'docs/user-guide/analytics/dashboards/variables/variable-dependencies.md':
    'Build interactive dashboards with variable dependencies, filtering data through parent-child relationships such as Namespace, Pod, and Container.',
  'docs/user-guide/data-exploration/logs/log-patterns.md':
    'How the Patterns tab groups logs into recurring templates, shows wildcard value distributions, and lets you filter logs by individual values.',
  'docs/user-guide/data-exploration/logs/logs.md':
    'Run your first log search in OpenObserve: filter by stream and time range, switch between non-SQL and SQL mode, transform with VRL, and save views.',
  'docs/user-guide/data-exploration/rum/source-map.md':
    'Upload JavaScript source maps to resolve minified error stack traces back to original files, function names, and line numbers in RUM Error Tracking.',
  'docs/user-guide/data-processing/workflows/incident-event-trigger.md':
    'Trigger automated workflows from incident lifecycle events such as created, alert added, status changed, and severity upgraded.',
  'docs/user-guide/data-processing/workflows/index.md':
    'Define automated workflows that run when alerts fire. Use the visual builder to transform data, call functions, evaluate conditions, and route results.',
};

// Matches `description:` plus any indented continuation lines.
const DESC_BLOCK = /^description:[^\n]*(?:\n[ \t]+[^\n]*)*/m;

const tooLong = [];
let updated = 0;

for (const [file, description] of Object.entries(DESCRIPTIONS)) {
  if (description.length > 165) tooLong.push([description.length, file]);

  const raw = fs.readFileSync(file, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) throw new Error(`no frontmatter: ${file}`);
  if (!DESC_BLOCK.test(m[1])) throw new Error(`no description: ${file}`);

  // JSON quoting is valid YAML and safe for colons, quotes and dashes.
  const fm = m[1].replace(DESC_BLOCK, `description: ${JSON.stringify(description)}`);
  const next = `---\n${fm}\n---\n` + raw.slice(m[0].length);
  if (next !== raw) {
    updated++;
    if (!DRY) fs.writeFileSync(file, next);
  }
}

if (tooLong.length) {
  console.error('Replacements still over 165 chars:', tooLong);
  process.exit(1);
}
console.log(`${updated}/${Object.keys(DESCRIPTIONS).length} descriptions rewritten${DRY ? ' (dry run)' : ''}`);
