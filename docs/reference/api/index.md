---
title: Overview
metaTitle: API Reference | OpenObserve
description: Programmatic access to OpenObserve. HTTP basic-auth endpoints for streams, ingestion, search, functions, users, and metrics.
---

# API Index

These APIs can be used to programmatically interact with OpenObserve.

All APIs must have an authorization header. Authorization header can be created using base64 encoded values of user id and password. For the sake of simplicity it is HTTP basic authentication mechanism.

Header creation mechanism:

```
Authorization: Basic base64("username:password")
```

For example:

```
Authorization: Basic YWRtaW46Q29tcGxleHBhc3MjMTIz
```

Make sure that you are sending the requests over HTTPS.

## API List

1. [Stream](stream/index.md)
    1. [List](stream/list.md)
    1. [Schema](stream/schema.md)
    1. [Setting](stream/setting.md)
    1. [Delete](stream/delete.md)
1. [Ingestion](ingestion/index.md)
    1. [Bulk](ingestion/logs/bulk.md)
    1. [JSON](ingestion/logs/json.md)
    1. [Multi](ingestion/logs/multi.md)
    1. [Loki](ingestion/logs/loki.md)
    1. [OTLP logs](ingestion/logs/otlp.md)
    1. [Metrics](ingestion/metrics/index.md)
    1. [Traces](ingestion/traces/index.md)
    1. [Profiles](ingestion/profiles/otlp.md)
1. [Search](search/index.md)
1. [Traces](traces/index.md)
1. [Function](function/index.md)
1. [User](user/index.md)
    1. [Create](user/create.md)
    1. [Update](user/update.md)
    1. [Add to organization](user/add-user.md)
    1. [Remove from organization](user/delete.md)
    1. [List](user/list.md)
1. [Dashboards](dashboard/index.md)
1. [Reports](report/index.md)
1. [Metrics](metrics.md)
1. [Cluster](cluster/cluster-info.md)

Every running instance also serves its OpenAPI specification as Swagger UI at `/swagger/` (`/docs` redirects there; on by default, controlled by `ZO_SWAGGER_ENABLED`). It covers many routes that are not described on these pages.

## Next steps

- [Quickstart](../../getting-started.md): get OpenObserve running and grab your credentials.
- [Ingestion](../../ingestion/index.md): start sending logs, metrics, traces, and profiles.
- [OpenTelemetry / OTLP](../../ingestion/logs/otlp.md): the recommended modern ingestion path.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
