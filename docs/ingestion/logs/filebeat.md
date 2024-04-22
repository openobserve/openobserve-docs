# Filebeat

## Collect individual pieces of data

```toml
setup.ilm.enabled: false
setup.template.enabled: true
setup.template.name: "nginx-log"
setup.template.pattern: "nginx-log-*"
setup.template.overwrite: true

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

## Collect multiple log paths and indexes of data

```toml
setup.ilm.enabled: false
setup.template.enabled: true
setup.template.name: "nginx-log"
setup.template.pattern: "nginx-log-*"
setup.template.overwrite: true

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/devops/logs/haxi-gateway/*.log
  fields:
    log_type: gateway
  fields_under_root: true
  processors:
    - add_tags:
        tags: ["gateway_logs"]

- type: log
  enabled: true
  paths:
    - /opt/devops/logs/haxi-auto/*.log
  fields:
    log_type: auto
  fields_under_root: true
  processors:
    - add_tags:
        tags: ["auto_logs"]

output.elasticsearch:
  hosts: ["http://localhost:5080"]
  timeout: 10
  path: "/api/default/"
  username: "root@example.com"
  password: "password"
  index: "nginx-log-%{+yyyy.MM.dd}"
```