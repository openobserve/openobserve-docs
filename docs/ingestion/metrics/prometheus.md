---
description: >-
  Ingest metrics into OpenObserve via Prometheus remote write and explore them
  using SQL in dashboards.
---
# Prometheus 

You can ingest metrics using prometheus [remote write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) in OpenObserve.

You could use below configuration for collecting metrics

```yaml
url: https://api.openobserve.ai/api/org_name/prometheus/api/v1/write
queue_config:
  max_samples_per_send: 10000
basic_auth:
  username: root@example.com
  password: password
```

> Replace api.openobserve.ai with your self hosted OpenObserve instance if you are hosting it yourself.

You will then be able to explore the metrics in metrics explorer and build dashboards by querying using **SQL or PromQL**

<img alt="image" src="https://github.com/user-attachments/assets/ea26c61e-abeb-49a0-b594-542ee03be0fa" />


