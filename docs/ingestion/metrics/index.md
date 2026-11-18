---
title: Index
metaTitle: "Metrics Ingestion for Observability | OpenObserve"
description: "Ingest metrics into OpenObserve with Prometheus, the OpenTelemetry Collector, or Telegraf for infrastructure and application performance monitoring."
---

# Metrics Ingestion - Infrastructure & Application Monitoring

You can send metrics to OpenObserve in several ways. Use them to watch your servers, apps, and Kubernetes clusters. Each method uses a standard protocol, so you can keep the tools you already run.

## Supported Metrics Ingestion Methods

Pick the method that fits your setup.

1. [Prometheus](prometheus.md): Send time-series metrics with Prometheus remote write. This suits Kubernetes monitoring.
1. [Vector](vector.md): Send host metrics through Prometheus remote write.
1. [OTLP / OTEL collector](../logs/otlp.md): Use the OpenTelemetry Collector to collect all your metrics in one place.
1. [OBI (eBPF zero-code)](../traces/obi.md): Get app RED metrics from eBPF. No code changes are needed.
1. [Telegraf](telegraf.md): Run this agent to collect system and host metrics.
    
