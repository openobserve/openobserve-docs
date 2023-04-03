# Telegraf


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

[[outputs.elasticsearch]]
health_check_interval = 0
index_name = "telegraf1"
password = "Complexpass#123"
urls = ["http://localhost:5080/api/default"]
username = "root@example.com"

```
