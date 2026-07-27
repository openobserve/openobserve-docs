---
description: "Expose OpenObserve's internal metrics in Prometheus format through the GET /metrics endpoint, enabled by setting ZO_PROMETHEUS_ENABLE=true for scraping."
---

# Metrics

Get metrics of OpenObserve in prometheus format

Endpoint - GET /metrics

## Require

You should set environment `ZO_PROMETHEUS_ENABLE=true` enable prometheus metrics.

## Request

e.g. 
PUT http://localhost:5080/metrics

