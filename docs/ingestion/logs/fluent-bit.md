---
title: Fluent Bit Log Ingestion for Kubernetes and Cloud-Native Logs | OpenObserve
description: Configure Fluent Bit log forwarding to OpenObserve using HTTP or Elasticsearch output for Kubernetes logging, container logs, and cloud-native log collection.
---
# Fluent Bit Log Ingestion - Kubernetes & Container Logging

Fluent Bit is a fast and lightweight log processor and forwarder designed for cloud-native environments, Kubernetes clusters, and containerized applications. This guide shows you how to configure Fluent Bit for log forwarding and centralized log management with OpenObserve.

## HTTP output

```toml
[OUTPUT]
  Name http
  Match *
  URI  /api/{organization}/{stream}/_json
  Host localhost
  Port 5080
  tls  Off
  Format json
  Json_date_key    _timestamp
  Json_date_format iso8601
  HTTP_User root@example.com
  HTTP_Passwd password
```

## Elasticsearch output

```toml
[OUTPUT]
  Name es
  Match *
  Path /api/{organization}
  Host localhost
  index {stream}
  Port 5080
  tls Off
  Suppress_Type_Name On
  Generate_ID Off
  HTTP_User root@example.com
  HTTP_Passwd password
```
