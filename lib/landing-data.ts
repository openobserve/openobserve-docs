import { BASE_PATH, SITE_URL } from '@/lib/constants';

/**
 * Content for the documentation landing page, recovered from the Material for
 * MkDocs theme override at `overrides/partials/index.html` (git d518a32), which
 * replaced the page body entirely and had no equivalent after the migration.
 *
 * `href` values are site-root paths: `next/link` prepends `basePath`. Marketing
 * pages live at the domain root, so they are stored with a SITE marker and
 * resolved to absolute URLs below. Icon paths are relative to `basePath`
 * because they render as plain <img>.
 */
export interface LandingLink {
  href: string;
  title: string;
  desc?: string;
  icon?: string;
  tone?: string;
  num?: string;
}

const resolve = (href: string) =>
  href.startsWith('SITE/') ? `${SITE_URL}${href.slice(4)}` : href;

export const iconUrl = (icon?: string) =>
  !icon ? undefined : icon.startsWith('http') ? icon : `${BASE_PATH}/${icon}`;

const withResolved = (items: LandingLink[]) =>
  items.map((i) => ({ ...i, href: resolve(i.href) }));

export const hero = {
  title: "OpenObserve Documentation",
  lede: "OpenObserve is an open-source, unified, petabyte-scale observability platform for logs, metrics, and traces, built in Rust, with SQL and PromQL.",
  primary: { label: 'Quickstart', href: '/getting-started' },
  secondary: { label: 'Download', href: `${SITE_URL}/downloads/` },
};

/** Popular ingestion sources shown in the hero panel. */
export const sources = withResolved([
  { href: "/integration/system/k8s", title: "Kubernetes", icon: "https://cdn.simpleicons.org/kubernetes" },
  { href: "/getting-started", title: "Docker", icon: "https://cdn.simpleicons.org/docker" },
  { href: "/ingestion/traces/opentelemetry", title: "OpenTelemetry", icon: "https://cdn.simpleicons.org/opentelemetry" },
  { href: "/ingestion/logs/fluent-bit", title: "Fluent Bit", icon: "https://cdn.simpleicons.org/fluentbit" },
  { href: "/ingestion/logs/vector", title: "Vector", icon: "assets/source-logos/vector.svg" },
  { href: "/ingestion/metrics/prometheus", title: "Prometheus", icon: "https://cdn.simpleicons.org/prometheus" },
  { href: "/integration/servers/nginx", title: "NGINX", icon: "https://cdn.simpleicons.org/nginx" },
  { href: "/integration/ai/claude-code-tracing", title: "Claude Code", icon: "https://cdn.simpleicons.org/claude" },
  { href: "/ingestion/logs/python", title: "Python", icon: "https://cdn.simpleicons.org/python" },
  { href: "/ingestion/logs/fluentd", title: "Fluentd", icon: "https://cdn.simpleicons.org/fluentd" },
  { href: "/ingestion/logs/filebeat", title: "Filebeat", icon: "https://cdn.simpleicons.org/elastic" },
  { href: "/ingestion/metrics/telegraf", title: "Telegraf", icon: "https://cdn.simpleicons.org/influxdb" },
  { href: "/ingestion/traces/nodejs", title: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs" },
  { href: "/ingestion/logs/kinesis-firehose", title: "AWS Kinesis", icon: "assets/source-logos/aws-kinesis.svg" },
]);

/** The five-step "Start here" journey. */
export const steps = withResolved([
  { href: "/getting-started", num: "1", title: "Install", desc: "Run OpenObserve locally or deploy to Kubernetes" },
  { href: "/ingestion", num: "2", title: "Ingest", desc: "Send your first logs, metrics, or traces" },
  { href: "/user-guide/data-exploration/logs", num: "3", title: "Analyze", desc: "Search and filter with SQL and full-text" },
  { href: "/user-guide/analytics/dashboards/dashboards-in-openobserve", num: "4", title: "Visualize", desc: "Build your first dashboard" },
  { href: "/user-guide/analytics/alerts", num: "5", title: "Monitor", desc: "Set conditions and notification channels" },
]);

/** "Explore by pillar" cards. */
export const pillars = withResolved([
  { href: "/features/logs", title: "Logs", desc: "Search, filter, and analyze logs with SQL and full-text queries at petabyte scale.", icon: "assets/user-guides/Log Search.svg", tone: "green" },
  { href: "/features/metrics", title: "Metrics", desc: "Collect, store, and visualize metrics from any Prometheus-compatible source.", icon: "assets/user-guides/status-up.svg", tone: "blue" },
  { href: "/features/distributed-tracing", title: "Traces", desc: "Distributed tracing to understand request flow across services.", icon: "assets/user-guides/ingestion.svg", tone: "purple" },
  { href: "/integration/ai/llm-applications", title: "LLM Monitoring", desc: "Track prompts, tokens, latency, and cost across LLM applications.", icon: "assets/nav-icons/llm-observability.svg", tone: "purple" },
  { href: "/user-guide/analytics/dashboards/dashboards-in-openobserve", title: "Dashboards", desc: "Build interactive dashboards on top of any data stream.", icon: "assets/user-guides/dashboard.svg", tone: "navy" },
  { href: "/user-guide/analytics/alerts", title: "Alerts", desc: "Continuous monitoring with conditional alerts and notifications.", icon: "assets/user-guides/alerts.svg", tone: "red" },
  { href: "/user-guide/data-processing/pipelines", title: "Pipelines", desc: "Transform and route data during ingestion with no-code pipelines.", icon: "assets/user-guides/pipeline.svg", tone: "pink" },
  { href: "/user-guide/data-exploration/rum/setup", title: "RUM", desc: "Real user monitoring with session replay and error tracking.", icon: "assets/user-guides/rum.svg", tone: "forest" },
]);

/** Tutorial cards under "User Guides". */
export const tutorials = withResolved([
  { href: "/user-guide/analytics/dashboards/dashboards-in-openobserve", title: "Create Your First Dashboard", desc: "Build dashboards and visualizations easily", icon: "assets/user-guides/dashboard.svg" },
  { href: "/features/logs", title: "Advanced Log Queries", desc: "Master SQL syntax to write powerful queries for in-depth log analysis", icon: "assets/user-guides/Log Search.svg" },
  { href: "/administration/deployment/ha-deployment", title: "Production Deployment", desc: "Deploy OpenObserve with high availability", icon: "assets/user-guides/storage-management.svg" },
  { href: "/user-guide/analytics/alerts", title: "Set Up Alerts", desc: "Configure alert conditions and notification channels for proactive monitoring", icon: "assets/user-guides/alerts.svg" },
  { href: "/ingestion/logs/curl", title: "Ingest Your First Logs", desc: "Send your first logs to OpenObserve in minutes using a simple curl request", icon: "assets/user-guides/ingestion.svg" },
]);

/** Concept rows under "User Guides". */
export const concepts = withResolved([
  { href: "/user-guide/data-exploration/logs", title: "Log Search", desc: "View and filter logs, run SQL queries, transform logs", icon: "assets/user-guides/Log Search.svg" },
  { href: "/user-guide/streams", title: "Streams", desc: "Define how data is ingested, stored, indexed, and queried", icon: "assets/user-guides/stream.svg" },
  { href: "/ingestion", title: "Ingestion", desc: "Ingest logs, metrics, and traces from various sources", icon: "assets/user-guides/ingestion.svg" },
  { href: "/user-guide/account-administration/identity-and-access-management", title: "IAM", desc: "Manage user identities and control access to resources", icon: "assets/user-guides/iam.svg" },
  { href: "/administration/maintenance/storage-management", title: "Storage Management", desc: "Configure how ingested stream data and metadata are stored", icon: "assets/user-guides/storage-management.svg" },
]);

/** "Community & Support" cards. */
export const community = withResolved([
  { href: "https://short.openobserve.ai/community", title: "Community", desc: "Join discussions and connect with fellow observability practitioners", icon: "assets/community-support/community.svg" },
  { href: "SITE/resources/", title: "Resources", desc: "Explore guides, videos, and content to learn and grow your expertise", icon: "assets/community-support/resources.svg" },
  { href: "SITE/contact-sales/", title: "Contact Sales", desc: "Get in touch with our team for tailored enterprise solutions", icon: "assets/community-support/contact-dark.svg" },
]);
