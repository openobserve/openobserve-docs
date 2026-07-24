---
description: "Service Catalog is a sortable per-service table built from distributed traces, summarizing request volume, error rate, and latency percentiles to rank health."
---

=== "Overview"
    Service Catalog provides a per-service metrics table built from your distributed traces. It summarizes request volume, error behaviour, and latency for every service in the selected trace stream so that you can compare services side by side and decide where to investigate next.

    **Key points**:

    - It gives you a tabular, sortable view of service health across one trace stream.
    - It highlights services with elevated error rates and slow latency so you can spot problems quickly.
    - It complements [Service Graph](service-graph.md), which shows the same kind of health information as a visual topology.
    - From any row you can jump straight into [Traces](traces.md) filtered to that service for detailed debugging.

    Service Catalog reads recent trace activity for the selected stream and time range. If there is no trace data, the view displays a message indicating that no services were found.


    !!! note "Where to find this"

        1. Sign in to OpenObserve.
        2. Select **Traces** in the left navigation panel, then choose **Service Catalog** from the **Spans | Traces | Service Graph | Service Catalog** toggle in the search bar.

        The catalog loads automatically for the selected trace stream and time range. The **Service Graph** option in the same toggle is Enterprise-only, but **Service Catalog** is available in all editions.


    ## What service catalog displays
    Service Catalog displays one row per service discovered in the selected trace stream. Each row shows a health status, request and error counts, error rate, and latency percentiles and durations.

    ### Columns
    The table includes the following columns.

    | Column | Description |
    |--------|-------------|
    | **Service** | The service name discovered from the trace stream. |
    | **Status** | A health status pill derived from the error rate. See [Health status](#health-status). |
    | **Requests** | Total number of spans (requests) recorded for the service in the selected range. |
    | **Errors** | Number of spans with an error status. |
    | **Error Rate** | Percentage of requests that ended in error. The value is color-coded as the rate increases. |
    | **P50** | Median (50th percentile) span duration. |
    | **P95** | 95th percentile span duration. |
    | **P99** | 99th percentile span duration. Highlighted in orange when it exceeds 1 second. |
    | **Avg Duration** | Average span duration for the service. |
    | **Max Duration** | Longest span duration recorded for the service. |

    You can sort the table by any column. By default, services are sorted by health status, with the least healthy services first.

    !!! note "Operations"
        Per-operation metrics are not shown as a column in the table. To see operations for a service, open the service detail side panel by clicking a row, then use the **Operations** tab.


    ## Health status
    Each service is assigned a health status based on its error rate. The status appears as a colored pill in the **Status** column and is summarized in pills above the table.

    | Status | Error rate |
    |--------|------------|
    | **Healthy** | Less than 1% |
    | **Degraded** | 1–5% |
    | **Warning** | 5–10% |
    | **Critical** | Greater than 10% |

    In addition to the status pill, latency is flagged independently: a **P99** value greater than 1 second is highlighted in orange to draw attention to slow services even when their error rate is low.


    ## Data source
    Service Catalog uses distributed traces as its single data source. For the selected trace stream, OpenObserve aggregates spans by service to compute request counts, error counts, error rate, average and maximum duration, and the P50, P95, and P99 latency percentiles.

    Service Catalog does not use logs or metrics directly.


    ## Controls

    ??? "Stream selector"
    ### Stream selector
    Select the trace stream to build the catalog from. The catalog is computed for a single stream at a time. Your selection is remembered for future visits.

    ??? "Service-name filter"
    ### Service-name filter
    Enter text in the filter field to narrow the table to services whose name contains your input. The match is case-insensitive, and a counter shows how many of the total services match.

    ??? "Date-time picker"
    ### Date-time picker
    Use the date-time picker to set the time range for the metrics. You can choose a relative range or an absolute start and end time. Changing the range reloads the catalog.

    ??? "Refresh"
    ### Refresh
    Use the refresh control to reload the catalog on demand with the current stream and time range.


    ## Drill-down
    Service Catalog is a starting point for investigation. From a service row you can move directly into detailed trace analysis.

    - Click a service row to open the service detail side panel, which includes **Operations** and related tabs for that service.
    - Select **View Traces** to open the [Traces](traces.md) view filtered to that service. OpenObserve sets the query to `service_name = '<name>'` and switches the search mode to Traces, so you immediately see the matching traces.

=== "How-to"
    ## Review service health

    1. Select **Traces** in the left navigation panel.
    2. Choose **Service Catalog** from the search-bar toggle.
    3. Select the trace stream and time range you want to inspect.
    4. Review the **Status** and **Error Rate** columns to identify services that are degraded, warning, or critical.

    ## Find a specific service

    1. Enter the service name in the filter field.
    2. Review the filtered rows and the match counter above the table.

    ## Investigate a problem service

    1. Identify a service with a warning or critical status, a high error rate, or a P99 highlighted in orange.
    2. Click the service row to open the detail side panel and review its operations.
    3. Select **View Traces** to open Traces filtered by `service_name` for that service.
    4. Inspect the matching traces to find the root cause.

## Next steps

- [Service Graph](service-graph.md): Visualize the same service health information as an interactive topology.
- [Traces](traces.md): Drill into individual traces and spans for detailed debugging.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
