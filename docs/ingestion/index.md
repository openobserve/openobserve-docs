---
description: >-
  Ingest logs, metrics, and traces into OpenObserve via OTEL, Fluentbit, APIs,
  syslog, Prometheus, or programmatically using Go, Python, or curl.
---

Logs metrics and traces can be ingested into OpenObserve from a variety of sources. This section describes how to ingest data from the following sources:

## Logs

### Log forwarders

1. [OTEL Collector](logs/otlp)
1. [Vector](logs/vector)
1. [Filebeat](logs/filebeat)
1. [Fluent-bit](logs/fluent-bit)
1. [Fluentd](logs/fluentd)
1. [Amazon Kinesis Firehose](logs/kinesis_firehose)
1. [Syslog](logs/syslog)
1. [Python](logs/python)
1. [Go](logs/go)
1. [Curl](logs/curl)


### APIs

Logs can also be ingested into OpenObserve Cloud / OpenObserve through one of the 3 HTTP APIs.

1. [_json](../api/ingestion/logs/json)
1. [_multi](../api/ingestion/logs/multi)
1. [_bulk](../api/ingestion/logs/bulk)
1. [syslog](./logs/syslog)

You can call the above APIs directly in your code to ingest data. 

### From Code

Here are 2 examples on how you can do it programmatically:

1. [Go](logs/go)
1. [Python](logs/python)

### Curl

You can also use curl command to ingest logs:

1. [curl](logs/curl)

## Metrics

1. [OTEL Collector](logs/otlp)
1. [Prometheus](metrics/prometheus)
1. [Telegraf](metrics/telegraf)


## Traces

1. [OTEL Collector](logs/otlp)
1. [OpenTelemetry](traces/opentelemetry)
1. [Typescript](traces/typescript)
1. [Node.js](traces/nodejs)
1. [Python](traces/python)
1. [Go](traces/go)





