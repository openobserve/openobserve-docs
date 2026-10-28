---
title: Log Management
metaTitle: Log Management Features - Collect, Search, and Analyze Logs
description: "Collect, store, search, and analyze logs at scale with OpenObserve: multiple ingestion protocols, full-text and SQL search, and configurable retention."
---

# Logs

OpenObserve provides powerful log management capabilities for collecting, storing, and analyzing log data from your applications and infrastructure.

## Overview

Logs in OpenObserve offer comprehensive observability into your system's behavior, allowing you to track events, debug issues, and monitor application performance. Built with high performance and cost efficiency in mind, OpenObserve handles log ingestion and querying at scale.

![Logs Page view](../images/features/logs-hero-v2.png)

## Key Features

### Log Ingestion
- **Multiple Protocols**: Support for multiple ingestion methods including HTTP and integration with popular log shippers like Fluent Bit, Vector, etc.
- **Structured & Unstructured**: Handle both JSON structured logs and plain text logs
- **Real-time Processing**: Immediate indexing and availability for search and analysis

### Search & Query

- **Field Extraction**: Automatic field detection and parsing for structured data. The [Schema Settings](../user-guide/data-processing/streams/schema-settings.md) tab in the **Stream Detail** panel lets you inspect and manage the schema used to store and query ingested data.

![Field Extraction](../images/features/log-fields-detection-v2.png)

- **Full-text Search**: Powerful search capabilities across all log fields

![Full-text Search](../images/features/full-text-search-v2.png)

- **SQL Queries**: Use familiar SQL syntax for complex filtering and aggregation.

![SQL Queries](../images/features/sql-based-log-search-v2.png)

- **Time-based Filtering**: Query logs within specific time windows using absolute or relative ranges.

![Time-based Filtering](../images/features/time-selection-v2.png)

### Storage & Performance
- **Compressed Storage**: Efficient compression reduces storage costs significantly

![Compressed Storage](../images/features/data-compression-v2.png)

- **Fast Retrieval**: Optimized indexing for quick log searches and aggregations. Learn more about [Streams](../user-guide/data-processing/streams/streams-in-openobserve.md) and their [stream details](../user-guide/data-processing/streams/stream-details.md#stream-details).

![Indexing](../images/features/index-v2.png)

- **Retention Policies**: Set [data retention per stream](../user-guide/data-processing/streams/stream-details.md#data-retention-in-days) in the **Configuration** tab of the **Stream Detail** panel to manage storage costs, and use [Extended Retention](../user-guide/data-processing/streams/extended-retention.md) to keep selected data longer

![Retention Policies](../images/features/data-retention-v2.png)

## Get started with logs

Ready to send your first logs to OpenObserve?

- [Quickstart](../getting-started.md): get OpenObserve running in 5 minutes.
- [Log ingestion overview](../ingestion/logs/index.md): pick the right ingestion path for your stack.
- [Example queries](../user-guide/data-exploration/example-queries.md): copy-paste filters and SQL to try right away.

## Next steps

- [OpenTelemetry / OTLP](../ingestion/logs/otlp.md): the recommended modern ingestion path.
- [Vector](../ingestion/logs/vector.md), [Fluent Bit](../ingestion/logs/fluent-bit.md), [syslog](../ingestion/logs/syslog.md): popular agent-based options.
- [Schema settings](../user-guide/data-processing/streams/schema-settings.md): manage how your fields are stored and indexed.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community) 
- Or [Contact support](https://openobserve.ai/contactus/)
