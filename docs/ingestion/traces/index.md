---
description: >-
  Send OpenTelemetry-compatible traces to OpenObserve via HTTP or gRPC using
  SDKs or auto-instrumentation. Supports both cloud and self-hosted.
---
# Index

OpenObserve follows opentelemtry standards for traces. You can send traces to OpenObserve using code instrumented via opentelemtry SDKs or via auto-instrumentation to send traces to OpenObserve.


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


