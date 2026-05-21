---
title: Data Ingestion Guide - Logs, Metrics, and Traces Collection | OpenObserve
description: Comprehensive data ingestion guide for collecting logs, metrics, and traces using OpenTelemetry, Prometheus, log forwarders, and APIs for complete observability.
---

# Data Ingestion - Logs, Metrics & Traces Collection

Collect logs, metrics, and traces into OpenObserve from a variety of data sources for unified observability. This data ingestion guide describes how to ingest observability data from log forwarders, monitoring agents, OpenTelemetry Collector, APIs, and programmatic methods.

## Logs

Ship application and infrastructure logs to OpenObserve through agents, HTTP APIs, or your own code.

### Log forwarders

1. [OTEL Collector](logs/otlp.md)
1. [Vector](logs/vector.md)
1. [Filebeat](logs/filebeat.md)
1. [Fluent Bit](logs/fluent-bit.md)
1. [Fluentd](logs/fluentd.md)
1. [Amazon Kinesis Firehose](logs/kinesis_firehose.md)
1. [Syslog](logs/syslog.md)
1. [Python](logs/python.md)
1. [Go](logs/go.md)
1. [Curl](logs/curl.md)


### APIs

Logs can also be ingested into OpenObserve Cloud / OpenObserve through one of the 3 HTTP APIs.

1. [_json](../reference/api/ingestion/logs/json.md)
1. [_multi](../reference/api/ingestion/logs/multi.md)
1. [_bulk](../reference/api/ingestion/logs/bulk.md)
1. [syslog](./logs/syslog.md)

You can call the above APIs directly in your code to ingest data.

### From Code

Here are 2 examples on how you can do it programmatically:

1. [Go](logs/go.md)
1. [Python](logs/python.md)

### Curl

You can also use curl command to ingest logs:

1. [curl](logs/curl.md)

## Metrics

Send time-series metrics from Prometheus, Telegraf, or the OpenTelemetry Collector.

1. [OTEL Collector](logs/otlp.md)
1. [Prometheus](metrics/prometheus.md)
1. [Telegraf](metrics/telegraf.md)


## Traces

Send distributed traces using OpenTelemetry SDKs or the Collector.

1. [OTEL Collector](traces/opentelemetry.md)
1. [OpenTelemetry](traces/opentelemetry.md)
1. [TypeScript](traces/typescript.md)
1. [Node.js](traces/nodejs.md)
1. [Python](traces/python.md)
1. [Go](traces/go.md)

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
