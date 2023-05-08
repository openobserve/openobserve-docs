# Filebeat

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
