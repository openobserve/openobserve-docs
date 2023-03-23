# Fluent-bit

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
