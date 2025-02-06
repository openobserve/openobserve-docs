# Vector

( .toml format)

## HTTP output

### NOTE: To ensure that Vector checks the health of the OpenObserve service specifically, set both `healthcheck.enabled = true` and provide a `healthcheck.uri` that points to the OpenObserve health check endpoint.

```toml
[sinks.openobserve]
type = "http"
inputs = [ source or transform id ]
uri = "http://localhost:5080/api/{organization}/{stream}/_json"
method = "post"
auth.strategy = "basic"
auth.user = "root@example.com"
auth.password = "password"
compression = "gzip"
encoding.codec = "json"
encoding.timestamp_format = "rfc3339"
# healthcheck.enabled = false

# Enable healthcheck
healthcheck.enabled = true
healthcheck.uri = "http://localhost:5080/healthz"
```

## Elasticsearch output

```toml
[sinks.openobserve]
type = "elasticsearch"
inputs = [ source or transform id ]
endpoints = ["http://localhost:5080/api/{organization}/"]
bulk.index = "default"
auth.strategy = "basic"
auth.user = "root@example.com"
auth.password = "password"
compression = "gzip"
healthcheck.enabled = false
```
