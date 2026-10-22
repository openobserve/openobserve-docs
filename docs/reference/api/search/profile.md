---
description: >-
  Use OpenObserve's Search Inspector to profile slow queries, trace execution
  steps, and debug with real-time, structured search metadata.
---
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

## Access Control

The Search Inspector requires a dedicated `search_inspector` permission. Access depends on your role:

- The **Root User** and organization **Admins** can use the Search Inspector automatically. No extra grant is needed.
- **Editors**, **Viewers**, and users with only **custom roles** must be granted the `search_inspector` permission explicitly. Without it, requests to the profile endpoint are denied.

To grant the permission:

1. From the **IAM** panel, select the **Roles** section.
2. Click the edit icon on the role you want to grant access to.
3. Enable the **Search Inspector** toggle under the module-level permissions.
4. Click **Save**.

![TODO: screenshot of the Search Inspector toggle in the role editor](images/placeholder.png)

The **Search Inspector** toggle is a module-level permission. Granting it authorizes the profile endpoint for the entire organization; it cannot be scoped to individual streams.

## Org Scoping and Security

The Search Inspector is scoped to the organization in the request path:

- It returns only traces owned by that organization. A trace belonging to another organization is answered as if it does not exist, so trace IDs cannot be probed across organizations.
- The `trace_id` query parameter accepts only letters, numbers, and dashes; invalid values are rejected with a bad-request error.

In the OpenObserve UI, Search Inspector entry points hide automatically for users without the `search_inspector` permission.

## No Setup Required

Beyond granting the `search_inspector` permission, no additional configuration is required. The Search Inspector works automatically in the background and returns real-time details when you query the endpoint.
