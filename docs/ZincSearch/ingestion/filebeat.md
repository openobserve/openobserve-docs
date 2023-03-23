# filebeat

Here is a sample filebeat.yml config:


```yaml

setup.ilm.enabled: false
setup.template.name: "nginx-log"
setup.template.pattern: "nginx-log-*"

filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/nginx/*.log

output.elasticsearch:
  hosts: ["http://127.0.0.1:4080"]
  path: "/es/"
  index: "nginx-log-%{+yyyy.MM.dd}"
  username: "admin"
  password: "Complexpass#123"

```