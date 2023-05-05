# Prometheus 

You can ingest metrics using prometheus [remote write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) in ZincObserve.

You will then be able to explore the metrics in metrics explorer and build dashboards by querying using SQL. PromQL support for querying metrics is under development.

You could use below configuration for collecting metrics

```yaml
url: https://api.zinc.dev/api/org_name/prometheus/write
basic_auth:
  username: root@example.com
  password: password
```

Replace api.zinc.dev with your self hosted ZincObserve instance if you are hosting it yourself.


