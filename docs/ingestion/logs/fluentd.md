---
title: Fluentd Log Aggregation for Unified Logging Layer | OpenObserve
description: Configure Fluentd unified logging layer for log aggregation, log collection, and centralized log management with OpenObserve using HTTP output and JSON formatting.
---
# Fluentd - Unified Logging Layer & Log Aggregation

Fluentd is an open-source data collector for unified logging layer, enabling log aggregation from multiple sources. Configure Fluentd to collect, transform, and forward logs to OpenObserve for centralized log management and analysis.

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
