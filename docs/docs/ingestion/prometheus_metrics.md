# Prometheus Metrics

You can ingest prometheus metrics using prometheus [remote write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) to ZincObserve.

You will then be able to explore the metrics in metrics explorer and build dashboards by querying using SQL. PromQL support for querying metrics is under development.

You could use below configuration for collecting metrics

# Prometheus 

```yaml
url: https://domain.com/api/org_name/prometheus/write
basic_auth:
  username: root@example.com
  password: password
```

## OTEL collector

```yaml
exporters:
  prometheusremotewrite:
    endpoint: "https://domain.com/api/org_name/prometheus/write"
    headers:
      Authorization: Basic base64_encoded_data_of(userid:password).e.g. Basic cm9vdEBleGFtcGxlLmNvbTo2eUNsSW1HZXV4S3hZanJiCg==
```


