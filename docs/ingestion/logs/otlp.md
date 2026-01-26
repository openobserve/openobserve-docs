---
title: OpenTelemetry Collector (OTEL) - OTLP Log, Metric, and Trace Ingestion | OpenObserve
description: Complete OpenTelemetry Collector guide for OTLP log ingestion, metrics collection, and trace ingestion via HTTP and gRPC protocols for unified observability.
---
## OpenTelemetry Collector (OTEL) / OTLP Ingestion

OpenObserve supports OpenTelemetry Protocol (OTLP) for `logs`, `metrics` and `traces` ingestion using the OpenTelemetry Collector. The following OTLP protocols are supported for OpenTelemetry data ingestion:

1. OTLP HTTP
1. OTLP GRPC (supported in single mode starting v0.6.4 and distributed mode starting v0.7.4)


### OTLP HTTP

```shell
HTTP Endpoint: https://monitor.dev.zinclabs.dev/api/<your-org>/v1/logs

Header:
  Authorization: Basic cm9v****************************************Ng==
  stream-name: your-stream
```

e.g. otel-collector configuration

```yaml
exporters:
  otlphttp/openobserve:
    endpoint: http://example.com/api/<your-org>  # Endpoint cannot have a trailing slash
    headers:
      Authorization: Basic cm9v****************************************Ng==
      stream-name: default
```

### OTLP GRPC

Default port for OTLP GRPC is 5081. You can change it using `ZO_GRPC_PORT` environment variable.

```yaml
endpoint: example.com
headers: 
  Authorization: "Basic cm9v****************************************Ng=="
  organization: your-org
  stream-name: your-stream
tls:
  insecure: false/true

```

e.g. otel-collector configuration

```yaml
exporters:
  otlp/openobserve:
      endpoint: localhost:5081
      headers:
        Authorization: "Basic cm9v****************************************Ng=="
        organization: myorg
        stream-name: myindex
      tls:
        insecure: true

```
