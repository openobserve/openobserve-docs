---
title: OTLP
description: Ingest profiles via OTLP JSON or binary Protobuf using POST /api/{org}/v1/profiles. Compatible with OpenTelemetry exporters and the Collector profiles pipeline.
---

# Profiles Ingestion - OTLP

Endpoint: `POST /api/{organization}/v1/profiles`

This implements OTLP [JSON Protobuf Encoding](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding) and binary Protobuf (`Content-Type: application/x-protobuf`) for the Profiles signal.

Send `Authorization: Basic <base64(email:password)>`. Optionally set `stream-name` to choose the profiles stream (default `default`).

Set the OTLP resource attribute `service.name` so OpenObserve can filter by **Service**. For eBPF, set `OTEL_SERVICE_NAME` on the process. For async-profiler and pprof, use the Collector `resource` processor.

How-to guides:

- [OTLP Profiles](../../../../ingestion/profiles/otlp.md)
- [Java / async-profiler](../../../../ingestion/profiles/java.md)
- [Go / pprof](../../../../ingestion/profiles/go.md)
- [Rust / eBPF](../../../../ingestion/profiles/rust.md)
- [eBPF profiler](../../../../ingestion/profiles/ebpf.md)
