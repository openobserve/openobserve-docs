
This documentation provides comprehensive guidance on using the OpenObserve API to search and retrieve traces from your application. Traces in OpenObserve represent the complete operational flow of requests through your system, showing the full tree of operations and their sub-operations (spans).

??? "What are Traces?"
    - **Traces** describe complete operations in your system.
    - Each trace represents the full execution path of a request.
    - Traces contain multiple **spans** that represent sub-operations or functions.
    - Each trace has a unique trace ID.

??? "What are Spans?"
    - **Spans** are individual operations within a trace.
    - They represent specific functions, service calls, or operations.
    - Each span has its own unique span ID.
    - Spans are organized in a tree structure within a trace.

??? "Example: OpenObserve Search Operation"
    When a user performs a search query in OpenObserve:

    - The **trace** represents the entire search operation from query initiation to result return.
    - **Spans** might include: alert manager evaluation, query processing, gRPC search execution, cache operations, database interactions.
    - You can see the complete flow showing how the operation moves through different OpenObserve services (alert manager → querier → search services).
    - Each span shows the duration and status of individual OpenObserve components involved in processing the search request.

## API Endpoints

- [Get latest traces using `/api/{org_id}/{stream_name}/traces/latest`](trace-search-api.md)