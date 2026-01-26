---
title: Distributed Tracing with OpenTelemetry for APM | OpenObserve
description: Configure OpenTelemetry distributed tracing for application performance monitoring, microservices tracing, and observability using HTTP or gRPC protocols with OpenObserve.
---
# Distributed Tracing - Application Performance Monitoring

OpenObserve supports OpenTelemetry-compatible distributed tracing for application performance monitoring (APM) and microservices observability. Instrument your applications using OpenTelemetry SDKs or auto-instrumentation to send traces to OpenObserve for end-to-end transaction tracking and performance analysis.


## HTTP

The HTTP Endpoint for sending traces to OpenObserve is 

### OpenObserve Cloud

> `https://api.openobserve.ai/api/<org_name>/v1/traces`

e.g. `https://api.openobserve.ai/api/default/v1/traces`

### Self hosted OpenObserve
> `https://url:5080/api/<org_name>/v1/traces`

### Credentials
You must send credentials via Authorization Header.

e.g. 

for credentials:

```
userid: root@example.com
password: Complexpass#123
```

```shell
echo -n 'root@example.com:Complexpass#123' | base64
```

`cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=`

Header should be:

```
Authorization: Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=
```

## GRPC

OpenObserve also supports sending traces with gRPC as explained [here](../logs/otlp.md).


