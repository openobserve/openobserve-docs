# Vector

( .toml format)

## HTTP output

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
healthcheck.enabled = false
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
