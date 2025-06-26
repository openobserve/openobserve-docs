# Logs

OpenObserve provides powerful log management capabilities for collecting, storing, and analyzing log data from your applications and infrastructure.

## Overview

Logs in OpenObserve offer comprehensive observability into your system's behavior, allowing you to track events, debug issues, and monitor application performance. Built with high performance and cost efficiency in mind, OpenObserve handles log ingestion and querying at scale.

![Logs Page](../images/features/logs-page.png)
*Logs Page view*

## Key Features

### Log Ingestion
- **Multiple Protocols**: Support for multiple ingestion methods including HTTP and integration with popular log shippers like FluentBit, Vector, etc.
- **Structured & Unstructured**: Handle both JSON structured logs and plain text logs
- **Real-time Processing**: Immediate indexing and availability for search and analysis

### Search & Query

- **Field Extraction**: Automatic field detection and parsing for structured data.

![Field Extraction](../images/features/log-feilds-detection.png)

The [Schema Settings](../user-guide/streams/schema-settings.md) tab in the Stream Details panel allows you to inspect and manage the schema used to store and query ingested data. 

- **Full-text Search**: Powerful search capabilities across all log fields

![Full-text Search](../images/features/log-settings.png)

- **SQL Queries**: Use familiar SQL syntax for complex filtering and aggregation.

![SQL Queries](../images/features/sql-based-log-search.png)

- **Time-based Filtering**: Query logs within specific time windows using absolute or relative ranges.

![Time-based Filtering](../images/features/time-selection.png)

### Storage & Performance
- **Compressed Storage**: Efficient compression reduces storage costs significantly

![Compressed Storage](../images/features/data-compression.png)

- **Fast Retrieval**: Optimized indexing for quick log searches and aggregations

![Indexing](../images/features/log-settings.png)

Know more about [Streams](../user-guide/streams/streams-in-openobserve.md) and its [details](../user-guide/streams/stream-details.md#stream-details)

- **Retention Policies**: [Configurable data retention](../user-guide/streams/extended-retention.md) to manage storage costs

![Retention Policies](../images/features/data-retention.png)