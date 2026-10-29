---
title: Metrics
metaTitle: Internal Metrics Endpoint in Prometheus Format
description: Expose OpenObserve's internal metrics in Prometheus format through the GET /metrics endpoint, controlled by ZO_PROMETHEUS_ENABLED (on by default).
---

# Metrics

Get metrics of OpenObserve in Prometheus text format.

Endpoint: `GET /metrics`

## Require

The endpoint is controlled by the environment variable `ZO_PROMETHEUS_ENABLED`, which is `true` by default. When it is set to `false`, the endpoint returns an empty body.

## Request

e.g.
`GET http://localhost:5080/metrics`
