## Search Inspector
The Search Inspector in OpenObserve helps you identify what happens during a search operation. 

## How to Use It
Make a request to the following endpoint to get profiling information for your search operations:
```
GET /api/{org_id}/search/profile
```
This returns structured metadata about recent search executions for your organization.

## Why Use the Search Inspector
- To find out why a search is slow and which part is causing the delay
- To see how a search is processed step by step, including WAL, storage, and execution phases
- To trace how the query moved across nodes, using OpenTelemetry for distributed tracking
- To view all search metadata in one place, including role, timing, and component context
- To debug reliably using logs that show durations in human-readable format and clear size metrics

## No Setup Required
You do not need to configure anything. The Search Inspector works automatically in the background and shows real-time details when you query the endpoint.
