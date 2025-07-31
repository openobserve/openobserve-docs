---
description: >-
  Ingest logs into OpenObserve using Fluent-bit via HTTP or Elasticsearch output
  plugins with custom URI, authentication, and JSON formatting options.
---
# Fluent-bit

## HTTP output

```toml
[OUTPUT]
  Name http
  Match *
  URI  /api/{organization}/{stream}/_json
  Host localhost
  Port 5080
  tls  Off
  Format json
  Json_date_key    _timestamp
  Json_date_format iso8601
  HTTP_User root@example.com
  HTTP_Passwd password
```

## Elasticsearch output

```toml
[OUTPUT]
  Name es
  Match *
  Path /api/{organization}
  Host localhost
  index {stream}
  Port 5080
  tls Off
  Suppress_Type_Name On
  Generate_ID Off
  HTTP_User root@example.com
  HTTP_Passwd password
```
