---
title: Distributed Tracing
description: "Track requests across microservices: OpenTelemetry-native ingestion, waterfall and flame graph views, a service graph, and fast trace search."
---

# Distributed Tracing

OpenObserve distributed tracing tracks requests as they flow through your microservices architecture, so you can identify performance bottlenecks and troubleshoot distributed systems.

## Overview

Distributed tracing in OpenObserve allows you to visualize the complete journey of requests across multiple services, understand service dependencies, and pinpoint the root cause of performance issues. Built for modern cloud-native applications, OpenObserve efficiently handles trace ingestion, correlation, and analysis at enterprise scale while maintaining exceptional query performance.

![Traces page](../images/features/traces-hero-v2.png)
*Distributed Tracing overview page*

## Key Features

### Trace Ingestion

- **OpenTelemetry Native**: Full support for OpenTelemetry protocol with automatic trace collection

![OpenTelemetry Native](../images/features/traces-otel-support-v2.png)

- **High Throughput**: Process millions of spans per second

### Trace Structure & Data

- **Hierarchical Spans**: Complete trace trees showing parent-child relationships between operations

![Hierarchical Spans](../images/features/trace-spans-v2.png)

- **Rich Metadata**: Capture detailed span attributes, tags, and contextual information

![Rich Metadata](../images/features/traces-metadata-v2.png)

- **Custom Instrumentation**: Support for manual and automatic instrumentation

### Trace Analysis & Search

- **Advanced Filtering**: Search traces by service, operation, duration, errors, and custom attributes

![Trace Search](../images/features/trace-search-v2.png)

- **Performance Profiling**: Identify slow operations and bottlenecks across your distributed system

- **Error Investigation**: Quickly locate and analyze failed requests and exceptions

![Error Investigation](../images/features/trace-error-v2.png)


### Visualization & Insights

- **Waterfall Views**: Interactive visualization showing span relationships and durations

![Traces waterfall view](../images/features/trace-timeline-v2.png)

- **Flame Graph**, **Trace Graph** and **DAG**: Other views of a single trace (**DAG** appears for traces with LLM spans)

- **Spans**: Search and list individual spans across all traces

- **Service Graph** (Enterprise): See how your services call each other, with dependencies, throughput and error rates

![Service Graph in Graph View with edges between the shop services and a tooltip showing requests, errors and error rate for checkout](../images/features/traces-service-map-v2.png)

- **Service Catalog**: Every service sending traces, with latency, throughput and error rate

### Storage & Performance

- **Indexing**: Choose an **Index Type** per field (for example **Full text search** or **Secondary index**) in the stream's **Schema Settings**

![Index Type in the stream Schema Settings](../images/features/trace-settings-v2.png)

- **Retention Management**: [Flexible retention policies](../user-guide/data-processing/streams/extended-retention.md) for cost-effective long-term storage

### Integration & Standards
- **OpenTelemetry Ecosystem**: Full compatibility with OpenTelemetry collectors and instrumentation libraries
- **Jaeger and Zipkin Compatibility**: Supports ingestion from Jaeger and Zipkin via OpenTelemetry Collector
- **Kubernetes-Friendly:** Integrates into Kubernetes environments via OpenTelemetry Collector with support for service metadata enrichment.
- **API Access**: REST APIs for programmatic trace access and analysis