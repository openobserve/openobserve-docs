---
title: Log Ingestion Methods for Centralized Logging | OpenObserve
description: Comprehensive guide to log ingestion using OpenTelemetry, Vector, Filebeat, Fluent-bit, Fluentd, Kinesis Firehose, Syslog, and more for centralized log management.
---

# Log Ingestion - Centralized Logging & Log Management

OpenObserve supports multiple log ingestion methods to collect, aggregate, and centralize logs from various sources. Whether you're using cloud-native log shippers, traditional syslog, or custom application logging, OpenObserve provides flexible options for centralized log management and log aggregation.

## Supported Log Ingestion Methods

1. [otel-collector](otlp) - OpenTelemetry Collector for unified observability
1. [Vector](vector) - High-performance log aggregation and routing
1. [Filebeat](filebeat) - Lightweight log shipper for file-based log collection
1. [Fluent-bit](fluent-bit) - Fast and lightweight log processor for cloud-native environments
1. [Fluentd](fluentd) - Unified logging layer for log aggregation
1. [Kinesis Firehose](kinesis_firehose) - AWS log streaming for cloud log ingestion
1. [Syslog](syslog) - Traditional syslog protocol for system logs
1. [Python](python) - Python SDK for application log ingestion
1. [Go](go) - Go SDK for structured logging
1. [Curl](curl) - Direct HTTP log ingestion
