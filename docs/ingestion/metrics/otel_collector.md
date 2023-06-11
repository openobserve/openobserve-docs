# OTEL collector

You can ingest metrics using prometheus [remote write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) in OpenObserve.

You will then be able to explore the metrics in metrics explorer and build dashboards by querying using SQL. PromQL support for querying metrics is under development.

You could use below configuration for collecting metrics

## OTEL collector

```yaml
exporters:
  prometheusremotewrite:
    endpoint: "https://api.openobserve.ai/api/org_name/prometheus/api/v1/write"
    headers:
      Authorization: Basic base64_encoded_data_of(userid:password).e.g. Basic cm9vdEBleGFtcGxlLmNvbTo2eUNsSW1HZXV4S3hZanJiCg==
```

Replace api.openobserve.ai with your self hosted OpenObserve instance if you are hosting it yourself.


