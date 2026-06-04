---
title: Vector Log Aggregation and Routing for High-Performance Logging | OpenObserve
description: Configure Vector for high-performance log aggregation, transformation, and routing to OpenObserve with HTTP and Elasticsearch sinks for scalable log management.
---
# Vector - High-Performance Log Aggregation & Routing

Vector is a high-performance observability data pipeline for log aggregation, transformation, and routing. Use Vector to collect logs from multiple sources, transform log data, and route logs to OpenObserve for centralized log management and analysis.

Configuration below is in `.toml` format. Replace `{organization}` and `{stream}` with your OpenObserve organization and stream names.

OpenObserve supports two Vector sink types:

- **HTTP sink**: simpler, recommended for most setups.
- **Elasticsearch sink**: useful if you're migrating from an existing Elasticsearch-shaped pipeline.

## HTTP output

!!! note
    To ensure Vector checks the health of the OpenObserve service, set both `healthcheck.enabled = true` and provide a `healthcheck.uri` that points to the OpenObserve health-check endpoint.

```toml
[sinks.openobserve]
type = "http"
inputs = [ source or transform id ]
uri = "http://localhost:5080/api/{organization}/{stream}/_json"
method = "post"
auth.strategy = "basic"
auth.user = "root@example.com"
auth.password = "password"
compression = "gzip"
encoding.codec = "json"
encoding.timestamp_format = "rfc3339"

# Enable healthcheck
healthcheck.enabled = true
healthcheck.uri = "http://localhost:5080/healthz"
```

## Elasticsearch output

```toml
[sinks.openobserve]
type = "elasticsearch"
inputs = [ source or transform id ]
endpoints = ["http://localhost:5080/api/{organization}/"]
bulk.index = "default"
auth.strategy = "basic"
auth.user = "root@example.com"
auth.password = "password"
compression = "gzip"
healthcheck.enabled = false
```

## Verify ingestion

Once Vector starts shipping data, open the OpenObserve UI, click **Logs** in the sidebar, and select your stream. New log entries should appear within a few seconds.

## Next steps

- [OpenTelemetry / OTLP](./otlp.md): the recommended modern ingestion path.
- [Other log ingestion options](./index.md): Fluent Bit, Fluentd, syslog, language SDKs.
- [Logs UI](../../user-guide/data-exploration/logs/logs.md): search and explore ingested logs.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
