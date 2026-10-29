---
title: Cluster Info API
description: Get OpenObserve cluster info via GET /api/_meta/cluster/info. View pending compaction jobs per cluster and region, including super-cluster setups.
---

Retrieves operational information about the OpenObserve cluster, currently reporting the number of pending compaction jobs per cluster. The response is organized by region and cluster, supporting multi-region (super-cluster) environments.

## Request
```
GET /api/{org_id}/cluster/info
```
**Path Parameter**: `{org_id}` must be `_meta`. Any other organization gets `403 Forbidden` ("This API is only available for the _meta organization").

**Query Parameter** (optional): `regions`, a comma-separated list of regions to include. It applies only when a super cluster is enabled (Enterprise).

## Response
Returns a JSON object with the pending compaction job count for each cluster, grouped by region. The count is the sum across all organizations and stream types.

## Example Response
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
:::note[Note]
Without a super cluster, the response contains the local cluster only, under the region `openobserve`.
:::
