---
title: OTLP
metaTitle: Traces Ingestion API - OTLP
description: Ingest traces via OTLP JSON or Protobuf using POST /api/{org}/v1/traces. Compatible with OpenTelemetry exporters for easy trace collection.
---

# Traces Ingestion - OTLP

Endpoint: `POST /api/{organization}/v1/traces`

The same handler is also served at `POST /api/{organization}/traces` and `POST /api/{organization}/otel/v1/traces`. Point an OTLP/HTTP exporter at `https://<host>/api/{organization}` and it appends `/v1/traces`.

This implements OTLP over HTTP with [JSON Protobuf Encoding](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding) and binary Protobuf (`Content-Type: application/x-protobuf`). Set the `stream-name` header to choose the traces stream (default `default`).

You can follow the documentation to play with OpenTelemetry: [How to use OpenTelemetry ingest traces?](../../../../ingestion/traces/opentelemetry.md)
