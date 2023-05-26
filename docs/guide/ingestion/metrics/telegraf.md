# Telegraf


You can enable some inputs first

```toml
# Read metrics about cpu usage. e.g. input
[[inputs.cpu]]
  ## Whether to report per-cpu stats or not
  percpu = true
  ## Whether to report total system cpu stats or not
  totalcpu = true
  ## If true, collect raw CPU time metrics
  collect_cpu_time = false
  ## If true, compute and report the sum of all non-idle CPU states
  report_active = false
```

Output to OpenObserve using prometheus remote write

```toml
[[outputs.http]]
  ## URL is the address to send metrics to
  url = "http://localhost:5080/api/default/prometheus/write"
  ## Data format to output.
  data_format = "prometheusremotewrite"

  [outputs.http.headers]
     Content-Type = "application/x-protobuf"
     Content-Encoding = "snappy"
     X-Prometheus-Remote-Write-Version = "0.1.0"
     Authorization = "Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM="

```
