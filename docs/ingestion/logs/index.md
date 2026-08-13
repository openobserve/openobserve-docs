---
title: Logs
metaTitle: Log Ingestion Methods for Centralized Logging | OpenObserve
description: "Ingest logs into OpenObserve using OpenTelemetry, Vector, Filebeat, Fluent Bit, Fluentd, Kinesis Firehose, Syslog, and more for central log management."
---

# Log Ingestion - Centralized Logging & Log Management

OpenObserve supports multiple log ingestion methods to collect, aggregate, and centralize logs from various sources. Whether you're using cloud-native log shippers, traditional syslog, or custom application logging, OpenObserve provides flexible options for centralized log management and log aggregation.

## Supported Log Ingestion Methods

1. [otel-collector](otlp.md) - OpenTelemetry Collector for unified observability
1. [Vector](vector.md) - High-performance log aggregation and routing
1. [Filebeat](filebeat.md) - Lightweight log shipper for file-based log collection
1. [Fluent-bit](fluent-bit.md) - Fast and lightweight log processor for cloud-native environments
1. [Fluentd](fluentd.md) - Unified logging layer for log aggregation
1. [Kinesis Firehose](kinesis-firehose.md) - AWS log streaming for cloud log ingestion
1. [Syslog](syslog.md) - Traditional syslog protocol for system logs
1. [Python](python.md) - Python SDK for application log ingestion
1. [Go SDK](go.md) - Structured logging for Go applications
1. [Curl](curl.md) - Direct HTTP log ingestion
