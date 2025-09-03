---
description: >-
  Get OpenObserve cluster info via GET /api/{org}/cluster_info. View pending
  compaction jobs by region and node in multi-region environments.
---
Retrieves operational information about the OpenObserve cluster, currently reporting the number of pending compaction jobs per node. The response is organized by region and node, supporting multi-region environments.

### Request
```
GET /api/{org_id}/cluster_info
```
**Path Parameter**: {org_id} is the unique identifier of the organization. 

### Response
Returns a JSON object containing region-wise pending compaction job counts for each node. 

### Example Response
```json
{
  "regions": {
    "openobserve": {
      "zo1": {
        "pending_jobs": 0
      }
    }
  }
}
```
!!! Note
    The response can be extended to include additional cluster-level metrics.
    The endpoint supports region-based filtering.
