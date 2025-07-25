---
description: >-
  Ingest logs into OpenObserve using Fluentd with HTTP output, JSON formatting,
  and basic auth for flexible and secure data forwarding.
---
# Fluentd

```toml
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match **>
  @type http
  endpoint http://localhost:5080/api/{organization}/{stream}/_json
  content_type json
  json_array true
  <auth>
    method basic
    username root@example.com
    password password
  </auth>
</match>
```
