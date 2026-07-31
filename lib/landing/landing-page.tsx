/**
 * The `/docs/` landing page — a React port of `overrides/partials/index.html`.
 *
 * `docs/index.md` sets `template: /partials/index.html` in its frontmatter, and
 * that template never renders `page.content`: the markdown body of
 * `docs/index.md` is dead on the live site. It still feeds llms.txt and the raw
 * markdown endpoint from the untouched source file, so nothing is lost by this
 * route rendering the template instead.
 *
 * The markup is a faithful transcription — hrefs stay relative, as they were, so
 * they resolve against `/docs/` exactly as before.
 */
import './landing-page.css';
import { RemoteIcon } from './remote-icon';

export function LandingPage() {
  return (
    <>
      <div className="landing-page">
        <div className="landing-container w-full mx-auto">
          {/* Main Content */}
          <main className="landing-main-content">
            {/* Hero: 2-column. Left = identity + tagline + CTAs. Right = Getting Started panel. */}
            <section className="landing-hero-grid">
              <div className="landing-hero-id">
                <h1 className="landing-hero-title">
                  OpenObserve Documentation
                </h1>
                <p className="landing-hero-lede">
                  <strong>
                    OpenObserve is an open-source, unified, petabyte-scale observability platform for logs, metrics, and traces, built in Rust, with SQL and PromQL.
                  </strong>
                </p>
                <p className="landing-hero-description">
                  Learn how to get up and running with OpenObserve through tutorials, integrations, and references. OpenObserve (O2) unifies logs, metrics, and traces into one cloud-native platform.
                </p>
                <div className="landing-hero-buttons">
                  <a href="quickstart/" className="primary-button-hero">
                    <span className="landing-btn-content">
                      <span className="landing-play-icon">
                        <img src="/docs/assets/view.svg" alt="" />
                      </span>
                      <span>
                        Quickstart
                      </span>
                    </span>
                  </a>
                  <a href="/downloads/" className="primary-button-hero">
                    <span className="landing-btn-content">
                      <span className="landing-play-icon">
                        <img src="/docs/assets/download.svg" alt="" />
                      </span>
                      <span>
                        Download
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <aside className="landing-getting-started-panel" aria-label="Getting Started">
                <p className="landing-gs-subtitle">
                  Start ingesting from your data source.
                </p>
                <div className="landing-source-grid">
                  <a
                    href="integration/system/k8s/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Kubernetes"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/kubernetes"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Kubernetes
                    </span>
                  </a>
                  <a
                    href="quickstart/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Docker"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/docker"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Docker
                    </span>
                  </a>
                  <a
                    href="ingestion/traces/opentelemetry/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="OpenTelemetry"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/opentelemetry"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      OpenTelemetry
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/fluent-bit/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Fluent Bit"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/fluentbit"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Fluent Bit
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/vector/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Vector"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="/docs/assets/source-logos/vector.svg"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Vector
                    </span>
                  </a>
                  <a
                    href="ingestion/metrics/prometheus/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Prometheus"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/prometheus"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Prometheus
                    </span>
                  </a>
                  <a
                    href="integration/servers/nginx/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="NGINX"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/nginx"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      NGINX
                    </span>
                  </a>
                  <a
                    href="integration/ai/claude-code-tracing/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Claude Code"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/claude"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Claude Code
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/python/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Python"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/python"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Python
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/fluentd/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Fluentd"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/fluentd"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Fluentd
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/filebeat/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Filebeat"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/elastic"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Filebeat
                    </span>
                  </a>
                  <a
                    href="ingestion/metrics/telegraf/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Telegraf"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/influxdb"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Telegraf
                    </span>
                  </a>
                  <a
                    href="ingestion/traces/nodejs/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Node.js"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="https://cdn.simpleicons.org/nodedotjs"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      Node.js
                    </span>
                  </a>
                  <a
                    href="ingestion/logs/kinesis-firehose/"
                    className="landing-source-tile"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="AWS Kinesis"
                  >
                    <span className="landing-source-icon">
                      <RemoteIcon
                        src="/docs/assets/source-logos/aws-kinesis.svg"
                        alt=""
                        loading="lazy"
                      />
                    </span>
                    <span className="landing-source-label">
                      AWS Kinesis
                    </span>
                  </a>
                </div>
                <a href="ingestion/" className="landing-source-viewall">
                  View all ingestion sources →
                </a>
              </aside>
            </section>
            {/* Canonical journey: Install → Ingest → Query → Visualize → Alert */}
            <section className="landing-section landing-journey" aria-label="Start here: the OpenObserve journey">
              <h2 className="landing-section-title">
                Start here
              </h2>
              <p className="landing-section-subtitle">
                Follow these 5 steps in order to go from zero to a working observability setup.
              </p>
              <ol className="landing-journey-steps">
                <li className="landing-journey-step">
                  <a href="quickstart/">
                    <span className="landing-journey-head">
                      <span className="landing-journey-num">
                        1
                      </span>
                      <span className="landing-journey-label">
                        Install
                      </span>
                    </span>
                    <span className="landing-journey-desc">
                      Run OpenObserve locally or deploy to Kubernetes
                    </span>
                  </a>
                </li>
                <li className="landing-journey-step">
                  <a href="ingestion/">
                    <span className="landing-journey-head">
                      <span className="landing-journey-num">
                        2
                      </span>
                      <span className="landing-journey-label">
                        Ingest
                      </span>
                    </span>
                    <span className="landing-journey-desc">
                      Send your first logs, metrics, or traces
                    </span>
                  </a>
                </li>
                <li className="landing-journey-step">
                  <a href="user-guide/data-exploration/logs/">
                    <span className="landing-journey-head">
                      <span className="landing-journey-num">
                        3
                      </span>
                      <span className="landing-journey-label">
                        Analyze
                      </span>
                    </span>
                    <span className="landing-journey-desc">
                      Search and filter with SQL and full-text
                    </span>
                  </a>
                </li>
                <li className="landing-journey-step">
                  <a href="user-guide/analytics/dashboards/dashboards-in-openobserve/">
                    <span className="landing-journey-head">
                      <span className="landing-journey-num">
                        4
                      </span>
                      <span className="landing-journey-label">
                        Visualize
                      </span>
                    </span>
                    <span className="landing-journey-desc">
                      Build your first dashboard
                    </span>
                  </a>
                </li>
                <li className="landing-journey-step">
                  <a href="user-guide/analytics/alerts/">
                    <span className="landing-journey-head">
                      <span className="landing-journey-num">
                        5
                      </span>
                      <span className="landing-journey-label">
                        Monitor
                      </span>
                    </span>
                    <span className="landing-journey-desc">
                      Set conditions and notification channels
                    </span>
                  </a>
                </li>
              </ol>
            </section>
            {/* Features catalog */}
            <section className="landing-section">
              <h2 className="landing-section-title">
                Explore by pillar
              </h2>
              <div className="landing-features-catalog">
                <a
                  href="features/logs/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Logs"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--green">
                    <img src="/docs/assets/user-guides/Log Search.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Logs
                  </h3>
                  <p className="landing-tutorial-description">
                    Search, filter, and analyze logs with SQL and full-text queries at petabyte scale.
                  </p>
                </a>
                <a
                  href="features/metrics/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Metrics"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--blue">
                    <img src="/docs/assets/user-guides/status-up.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Metrics
                  </h3>
                  <p className="landing-tutorial-description">
                    Collect, store, and visualize metrics from any Prometheus-compatible source.
                  </p>
                </a>
                <a
                  href="features/distributed-tracing/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Traces"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--purple">
                    <img src="/docs/assets/user-guides/ingestion.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Traces
                  </h3>
                  <p className="landing-tutorial-description">
                    Distributed tracing to understand request flow across services.
                  </p>
                </a>
                <a
                  href="integration/ai/llm-applications/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="LLM Monitoring"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--purple">
                    <img src="/docs/assets/nav-icons/llm-observability.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    LLM Monitoring
                  </h3>
                  <p className="landing-tutorial-description">
                    Track prompts, tokens, latency, and cost across LLM applications.
                  </p>
                </a>
                <a
                  href="user-guide/analytics/dashboards/dashboards-in-openobserve/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Dashboards"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--navy">
                    <img src="/docs/assets/user-guides/dashboard.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Dashboards
                  </h3>
                  <p className="landing-tutorial-description">
                    Build interactive dashboards on top of any data stream.
                  </p>
                </a>
                <a
                  href="user-guide/analytics/alerts/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Alerts"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--red">
                    <img src="/docs/assets/user-guides/alerts.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Alerts
                  </h3>
                  <p className="landing-tutorial-description">
                    Continuous monitoring with conditional alerts and notifications.
                  </p>
                </a>
                <a
                  href="user-guide/data-processing/pipelines/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Pipelines"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--pink">
                    <img src="/docs/assets/user-guides/pipeline.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    Pipelines
                  </h3>
                  <p className="landing-tutorial-description">
                    Transform and route data during ingestion with no-code pipelines.
                  </p>
                </a>
                <a
                  href="user-guide/data-exploration/rum/setup/"
                  className="landing-feature-catalog-card"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="RUM"
                >
                  <div className="landing-feature-catalog-icon landing-tutorial-icon--forest">
                    <img src="/docs/assets/user-guides/rum.svg" alt="" />
                  </div>
                  <h3 className="landing-tutorial-title">
                    RUM
                  </h3>
                  <p className="landing-tutorial-description">
                    Real user monitoring with session replay and error tracking.
                  </p>
                </a>
              </div>
            </section>
            {/* User Guides: task-oriented Tutorials + concept-oriented reference */}
            <section className="landing-section">
              <h2 className="landing-section-title">
                User Guides
              </h2>
              <h3 className="landing-subsection-title">
                Tutorials
              </h3>
              <div className="landing-tutorial-rows">
                <div className="landing-tutorial-row">
                  <a
                    href="user-guide/analytics/dashboards/dashboards-in-openobserve/"
                    className="landing-tutorial-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Create Your First Dashboard"
                  >
                    <div className="landing-tutorial-card-icon">
                      <img src="/docs/assets/user-guides/dashboard.svg" alt="" />
                    </div>
                    <h3 className="landing-tutorial-title">
                      Create Your First Dashboard
                    </h3>
                    <p className="landing-tutorial-description">
                      Build dashboards and visualizations easily
                    </p>
                  </a>
                  <a
                    href="features/logs/"
                    className="landing-tutorial-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Advanced Log Queries"
                  >
                    <div className="landing-tutorial-card-icon">
                      <img src="/docs/assets/user-guides/Log Search.svg" alt="" />
                    </div>
                    <h3 className="landing-tutorial-title">
                      Advanced Log Queries
                    </h3>
                    <p className="landing-tutorial-description">
                      Master SQL syntax to write powerful queries for in-depth log analysis
                    </p>
                  </a>
                </div>
                <div className="landing-tutorial-row">
                  <a
                    href="administration/deployment/ha-deployment/"
                    className="landing-tutorial-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Production Deployment"
                  >
                    <div className="landing-tutorial-card-icon">
                      <img src="/docs/assets/user-guides/storage-management.svg" alt="" />
                    </div>
                    <h3 className="landing-tutorial-title">
                      Production Deployment
                    </h3>
                    <p className="landing-tutorial-description">
                      Deploy OpenObserve with high availability
                    </p>
                  </a>
                  <a
                    href="user-guide/analytics/alerts/"
                    className="landing-tutorial-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Set Up Alerts"
                  >
                    <div className="landing-tutorial-card-icon">
                      <img src="/docs/assets/user-guides/alerts.svg" alt="" />
                    </div>
                    <h3 className="landing-tutorial-title">
                      Set Up Alerts
                    </h3>
                    <p className="landing-tutorial-description">
                      Configure alert conditions and notification channels for proactive monitoring
                    </p>
                  </a>
                  <a
                    href="ingestion/logs/curl/"
                    className="landing-tutorial-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Ingest Your First Logs"
                  >
                    <div className="landing-tutorial-card-icon">
                      <img src="/docs/assets/user-guides/ingestion.svg" alt="" />
                    </div>
                    <h3 className="landing-tutorial-title">
                      Ingest Your First Logs
                    </h3>
                    <p className="landing-tutorial-description">
                      Send your first logs to OpenObserve in minutes using a simple curl request
                    </p>
                  </a>
                </div>
              </div>
              <h3 className="landing-subsection-title">
                Concepts
              </h3>
              <div className="landing-features-list">
                <a
                  href="user-guide/data-exploration/logs/"
                  className="landing-feature-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Log Search"
                >
                  <div className="landing-feature-left">
                    <div className="landing-feature-icon landing-tutorial-icon--green">
                      <img src="/docs/assets/user-guides/Log Search.svg" alt="" />
                    </div>
                    <div className="landing-feature-text">
                      <h3 className="landing-tutorial-title">
                        Log Search
                      </h3>
                      <p className="landing-tutorial-description">
                        View and filter logs, run SQL queries, transform logs
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="user-guide/streams/"
                  className="landing-feature-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Streams"
                >
                  <div className="landing-feature-left">
                    <div className="landing-feature-icon landing-tutorial-icon--orange">
                      <img src="/docs/assets/user-guides/stream.svg" alt="" />
                    </div>
                    <div className="landing-feature-text">
                      <h3 className="landing-tutorial-title">
                        Streams
                      </h3>
                      <p className="landing-tutorial-description">
                        Define how data is ingested, stored, indexed, and queried
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="ingestion/"
                  className="landing-feature-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Ingestion"
                >
                  <div className="landing-feature-left">
                    <div className="landing-feature-icon landing-tutorial-icon--purple">
                      <img src="/docs/assets/user-guides/ingestion.svg" alt="" />
                    </div>
                    <div className="landing-feature-text">
                      <h3 className="landing-tutorial-title">
                        Ingestion
                      </h3>
                      <p className="landing-tutorial-description">
                        Ingest logs, metrics, and traces from various sources
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="user-guide/account-administration/identity-and-access-management/"
                  className="landing-feature-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="IAM"
                >
                  <div className="landing-feature-left">
                    <div className="landing-feature-icon landing-tutorial-icon--green">
                      <img src="/docs/assets/user-guides/iam.svg" alt="" />
                    </div>
                    <div className="landing-feature-text">
                      <h3 className="landing-tutorial-title">
                        IAM
                      </h3>
                      <p className="landing-tutorial-description">
                        Manage user identities and control access to resources
                      </p>
                    </div>
                  </div>
                </a>
                <a
                  href="administration/maintenance/storage-management/"
                  className="landing-feature-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Storage Management"
                >
                  <div className="landing-feature-left">
                    <div className="landing-feature-icon landing-tutorial-icon--purple">
                      <img src="/docs/assets/user-guides/storage-management.svg" alt="" />
                    </div>
                    <div className="landing-feature-text">
                      <h3 className="landing-tutorial-title">
                        Storage Management
                      </h3>
                      <p className="landing-tutorial-description">
                        Configure how ingested stream data and metadata are stored
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </section>
            {/* Migrate to OpenObserve (Supabase-style 2-col: description left, cards right) */}
            <section className="landing-section landing-section--two-col">
              <div className="landing-section-left">
                <h2 className="landing-section-title">
                  Migrate to OpenObserve
                </h2>
              </div>
              <div className="landing-section-right">
                <div className="landing-migrate-grid">
                  <a
                    href="migration/migrate-from-grafana-to-openobserve/"
                    className="landing-migrate-card"
                    data-clarity-event="docs_landing_page_card_click"
                    data-clarity-title="Migrate from Grafana LGTM"
                  >
                    <div className="landing-migrate-icon">
                      <img src="/docs/assets/grafana.svg" alt="" />
                    </div>
                    <div className="landing-migrate-text">
                      <h3 className="landing-tutorial-title">
                        From Grafana (LGTM)
                      </h3>
                      <p className="landing-tutorial-description">
                        Move your Loki, Mimir, and Tempo data into OpenObserve seamlessly
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </section>
            {/* Closing takeaway banner */}
            <section className="landing-section landing-closing-banner">
              <h2 className="landing-section-title">
                Ready to start?
              </h2>
              <p>
                Begin with the
                <a href="quickstart/">
                  Quickstart
                </a>
                , then
                <a href="ingestion/logs/curl/">
                  ingest your first data
                </a>
                and
                <a href="user-guide/data-exploration/logs/">
                  run your first query
                </a>
                .
              </p>
            </section>
            {/* Community Section */}
            <section className="landing-section">
              <h2 className="landing-section-title">
                Community & Support
              </h2>
              <div className="landing-community-support-grid">
                <a
                  href="https://short.openobserve.ai/community"
                  className="landing-community-support-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Community"
                  data-clarity-url="https://short.openobserve.ai/community"
                  target="_blank"
                >
                  <div className="landing-community-support-icon landing-tutorial-icon--pink">
                    <img src="/docs/assets/community-support/community.svg" alt="" />
                  </div>
                  <div className="landing-community-support-text">
                    <h3 className="landing-tutorial-title">
                      Community
                    </h3>
                    <p className="landing-tutorial-description">
                      Join discussions and connect with fellow observability practitioners
                    </p>
                  </div>
                </a>
                <a
                  href="/resources/"
                  className="landing-community-support-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Resources"
                  data-clarity-url="/resources/"
                >
                  <div className="landing-community-support-icon landing-tutorial-icon--blue">
                    <img src="/docs/assets/community-support/resources.svg" alt="" />
                  </div>
                  <div className="landing-community-support-text">
                    <h3 className="landing-tutorial-title">
                      Resources
                    </h3>
                    <p className="landing-tutorial-description">
                      Explore guides, videos, and content to learn and grow your expertise
                    </p>
                  </div>
                </a>
                <a
                  href="/contact-sales/"
                  className="landing-community-support-item"
                  data-clarity-event="docs_landing_page_card_click"
                  data-clarity-title="Contact Sales"
                  data-clarity-url="/contact-sales/"
                >
                  <div className="landing-community-support-icon landing-tutorial-icon--blue">
                    {/* Light theme Contact icon */}
                    <img
                      src="/docs/assets/community-support/contact-dark.svg"
                      alt=""
                      className="light-theme-icon"
                    />
                    {/* Dark theme Contact icon */}
                    <img
                      src="/docs/assets/community-support/contact-white.svg"
                      alt=""
                      className="dark-theme-icon"
                    />
                  </div>
                  <div className="landing-community-support-text">
                    <h3 className="landing-tutorial-title">
                      Contact Sales
                    </h3>
                    <p className="landing-tutorial-description">
                      Get in touch with our team for tailored enterprise solutions
                    </p>
                  </div>
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
