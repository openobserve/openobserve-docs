# Telemetry

## Why do you collect telemetry data?
We collects anonymized data from users in order to understand ZincSearch's usage and improve ZincSearch. This can be deactivated at any time, and any data that has already been collected can be deleted on request. Please send an email to admin+privacy@zinclabs.io to request deletion of the anonymized data. 

## What tools do ZincSearch uses to collect and visualize data?
We use Segment, a platform for data collection and management, to collect usage data. We then feed that data into Amplitude, a tool for graphing and highlighting data, so that we can build visualizations according to our needs.

## What Telemetry data is being collected?

| Metric                    |   Description                         | Example               |
|---------------------------|---------------------------------------|-----------------------|
| index_count               | Total count of indexes                | 2                     |
| total_index_size_mb       | Total size of all indexes             | 600                   |
| os                        | Running operating system              | linux                 |
| arch                      | Architecture of the machine           | amd64                 |
| zinc_version              | version of ZincSearch being used            | 0.1.7                 |
| cpu_count                 | Total count of CPUs                   | 8                     |
| total_memory              | Total memory                          | 2                     |
| memory_used_percent       | Total memory used percentage          | 40                    |
| search_type               | Kind of search queries                | querystring, match    |
| search_index_storage      | Where are indexes being stored        | disk, minio (deprecated), s3 (deprecated) |
| search_index_size_in_mb   | Size of the index that was queried    | 2                     |
| time_taken_to_search_in_ms| Time taken for search                 | 340                   |
| aggregations_count        | Total aggregations in search query    | 1                     |


Note: This list may change upon new releases as new features are added.

## How do I disable telemetry collection

You can set environment variable ZINC_TELEMETRY=disabled to disable telemetry collection

## Do I need to know anything else?

We have implemented [sentry](https://sentry.io) in order to capture any errors happening and be able to fix them. It captures errors as and when they happen and sends them to sentry in order for us to analyze and fix them.

