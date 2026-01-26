---
title: Telegraf Metrics Collection for System and Infrastructure Monitoring | OpenObserve
description: Configure Telegraf agent for system metrics collection, server monitoring, and infrastructure metrics ingestion to OpenObserve using Prometheus remote write.
---
# Telegraf - System Metrics & Infrastructure Monitoring

Telegraf is a plugin-driven server agent for collecting and reporting metrics from systems, services, and IoT sensors. Configure Telegraf for system monitoring, infrastructure metrics collection, and application performance monitoring, sending metrics to OpenObserve via Prometheus remote write.


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
  url = "http://localhost:5080/api/default/prometheus/api/v1/write"
  ## Data format to output.
  data_format = "prometheusremotewrite"

  [outputs.http.headers]
     Content-Type = "application/x-protobuf"
     Content-Encoding = "snappy"
     X-Prometheus-Remote-Write-Version = "0.1.0"
     Authorization = "Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM="

```
