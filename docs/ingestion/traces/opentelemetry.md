---
title: OpenTelemetry Tracing SDKs - Distributed Tracing for Applications | OpenObserve
description: OpenTelemetry tracing guide for instrumenting applications with OpenTelemetry SDKs in Node.js, TypeScript, Python, and Go for distributed tracing and APM.
---
# OpenTelemetry Distributed Tracing - APM Instrumentation

Instrument your applications with OpenTelemetry SDKs for distributed tracing and application performance monitoring (APM).

## Prerequisites

- An OpenObserve instance (Cloud or self-hosted) and your login credentials.

## Trace ingestion endpoint

Configure your OpenTelemetry SDK or Collector to send traces to:

```
https://<your-openobserve-host>/api/<your-org>/v1/traces
```

For self-hosted instances on the default port, this is `http://localhost:5080/api/<your-org>/v1/traces`. Send the `Authorization: Basic <base64(email:password)>` header on each request.

## SDK examples

You can find examples of how to instrument your code to send traces to OpenObserve using OpenTelemetry SDKs below:

1. [JavaScript (Node.js)](./nodejs.md)
1. [TypeScript](./typescript.md)
1. [Python](./python.md)
1. [Go](./go.md)

Prefer not to change code? Use [OBI (eBPF zero-code instrumentation)](./obi.md) to capture traces and metrics automatically, with no SDK.

You can also follow the [OpenTelemetry documentation](https://opentelemetry.io/docs/instrumentation/) for more info.

## Next steps

- [OpenTelemetry Collector / OTLP](../logs/otlp.md): unified ingestion for logs, metrics, and traces.
- [Ingestion overview](../index.md): all ingestion paths for logs, metrics, and traces.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
