## OTEL collector / OTLP

OpenObserve supports OTLP for `logs`, `metrics` and `traces` ingestion. following protocols are supported:

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
    endpoint: http://example.com/api/your-org/
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
