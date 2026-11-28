---
title: Curl
metaTitle: Curl Command Log Ingestion - HTTP API for Quick Log Testing
description: Simple curl command guide for log ingestion, HTTP API testing, and bulk log upload to OpenObserve for quick log data testing and debugging.
---

## Curl Log Ingestion - HTTP API Testing

### Single record

```shell
curl http://localhost:5080/api/default/quickstart1/_json -i -u 'root@example.com:<YOUR_PASSWORD>' -d '[{"level":"info","job":"test","log":"test message for openobserve"}]'
```

### Large number of records from a file

For the [sample file](https://zinc-public-data.s3.us-west-2.amazonaws.com/zinc-enl/sample-k8s-logs/k8slog_json.json.zip). You can use the below command.

```shell
curl http://localhost:5080/api/default/quickstart1/_json -i -u 'root@example.com:<YOUR_PASSWORD>' --data-binary "@k8slog_json.json"
```
