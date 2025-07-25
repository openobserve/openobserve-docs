---
description: >-
  Ingest logs into OpenObserve using Filebeat by configuring input paths and
  output to OpenObserve's API with Elasticsearch-compatible settings.
---
# Filebeat

```toml
setup.ilm.enabled: false
setup.template.enabled: false

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/nginx/*.log

output.elasticsearch:
  hosts: ["http://localhost:5080"]
  timeout: 10
  path: "/api/default/"
  index: "default"
  username: "root@example.com"
  password: "password"
```
