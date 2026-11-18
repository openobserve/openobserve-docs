---
title: Logs
metaTitle: Log Ingestion Methods for Centralized Logging | OpenObserve
description: "Ingest logs into OpenObserve using OpenTelemetry, Vector, Filebeat, Fluent Bit, Fluentd, Kinesis Firehose, Syslog, and more for central log management."
---

# Log Ingestion - Centralized Logging & Log Management

OpenObserve can collect logs from many sources and keep them in one place. You can use cloud-native log shippers, syslog forwarders, or your own app logging. Pick the method that fits your setup.

## Supported Log Ingestion Methods

Each guide below shows how to send logs with one tool.

1. [otel-collector](otlp.md): Use the OpenTelemetry Collector to send logs, metrics, and traces.
1. [Vector](vector.md): Collect and route logs at high speed.
1. [Filebeat](filebeat.md): Ship logs from files with a light agent.
1. [Fluent-bit](fluent-bit.md): Process logs with a fast, light agent built for cloud-native setups.
1. [Fluentd](fluentd.md): Use one logging layer to gather logs.
1. [Kinesis Firehose](kinesis-firehose.md): Stream logs from AWS.
1. [Splunk HEC](splunk-hec.md): Use the Splunk HTTP Event Collector endpoint with Splunk forwarders and HEC clients.
1. [Syslog](syslog.md): See other ways to send syslog. The built-in syslog server was removed in v0.16.0.
1. [Python](python.md): Send app logs with the Python SDK.
1. [Go](go.md): Send structured logs with the Go SDK.
1. [Curl](curl.md): Send logs straight over HTTP.
