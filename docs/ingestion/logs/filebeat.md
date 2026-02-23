---
title: Filebeat Log Shipper Integration for Log Collection | OpenObserve
description: Set up Filebeat log shipper to collect and forward logs from files, servers, and applications to OpenObserve for centralized log management and analysis.
---
# Filebeat Log Collection - File-Based Log Shipping

Filebeat is a lightweight log shipper that monitors log files and forwards log data to centralized logging platforms. Configure Filebeat to collect logs from servers, applications, and services, and send them to OpenObserve for log aggregation and analysis.

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
