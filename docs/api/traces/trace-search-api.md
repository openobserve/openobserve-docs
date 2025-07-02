## Get Latest Traces

Retrieve traces within a specified time range.

**Endpoint** <br>
```
GET /api/{org_id}/{stream_name}/traces/latest
```

**Parameters** <br>

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `org_id` | string | Yes | Your organization ID |
| `stream_name` | string | Yes | Name of the trace stream |
| `start_time` | integer | Yes | Start time in microseconds |
| `end_time` | integer | Yes | End time in microseconds |
| `from` | integer | Yes | Result start count (pagination offset) |
| `size` | integer | Yes | Number of traces to return |
| `filter` | string | No | Filter query for traces |

**Example Request** <br>
```bash
curl -X GET \
  "https://your-openobserve-instance/api/org_id/stream_name/traces/latest?&filter=&start_time=1751443100969000&end_time=1751444000969000&from=0&size=25 \
  -H "Authorization: Basic <your-auth-token>"
```

**Response Format**<br>
```json
{
  "total": 1,
  "trace_id": "b1eeb579ae863bdf9408e7d64c02d5d1",
  "hits": [
    {
      "duration": 9,
      "end_time": 1751444644327767600,
      "first_event": {
        "_timestamp": 1751444644327758,
        "duration": 9,
        "end_time": 1751444644327767600,
        "operation_name": "infra:schema:get_versions",
        "service_name": "compactor",
        "span_status": "UNSET",
        "start_time": 1751444644327758300,
        "trace_id": "b1eeb579ae863bdf9408e7d64c02d5d1"
      },
      "service_name": [
        {
          "count": 1,
          "service_name": "compactor"
        }
      ],
      "spans": [1, 0],
      "start_time": 1751444644327758300,
      "trace_id": "b1eeb579ae863bdf9408e7d64c02d5d1"
    }
  ]
}
```

**Response Fields** <br>

| Field | Description |
|-------|-------------|
| `total` | Total number of traces found |
| `trace_id` | Unique identifier for the trace |
| `hits` | Array of trace objects |
| `duration` | Total duration of the trace in microseconds |
| `start_time` | Trace start time in microseconds |
| `end_time` | Trace end time in microseconds |
| `first_event` | Details of the first span in the trace |
| `service_name` | Array of services involved in the trace |
| `spans` | Array indicating span counts |

## Get Spans Details 

Retrieve detailed span information for a specific trace using the traces `/latest` endpoint with a `trace_id` filter.

### Using Search API 

For complex queries, you can use the [search API](https://openobserve.ai/docs/api/search/search/) with SQL queries:
```sql
SELECT * FROM default WHERE trace_id = {trace_id} ORDER BY start_time
```

**Note:** Traces do not support full SQL queries in the traces interface, however, the search API supports SQL for trace data when needed for complex queries.

## Error Handling

Common HTTP Status Codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters or query format
- `401 Unauthorized`: Invalid or missing authentication
- `404 Not Found`: Stream or organization not found
- `500 Internal Server Error`: Server error

**Error Response Format** <br>
```json
{
  "error": {
    "type": "invalid_query",
    "message": "Invalid time range specified",
    "details": "start_time must be less than end_time"
  }
}
```

## Best Practices

**Performance Optimization**: 

1. **Use appropriate time ranges**: Avoid overly broad time ranges.
2. **Implement pagination**: Use `from` and `size` parameters for large result sets.
3. **Filter effectively**: Use specific filters to reduce result size.
4. **Cache results**: Cache trace metadata for frequently accessed traces.

**Query Optimization**:

1. **Start with trace metadata**: Use the `/latest` endpoint first to get trace overview.
2. **Fetch spans selectively**: Only fetch detailed spans when needed.
3. **Use specific trace IDs**: When possible, query for specific trace IDs.

**Limitations**:

1. **SQL Query Support**: Full SQL queries are not supported in traces; use filter queries instead.
2. **Time Range Requirement**: Start time and end time are mandatory for all queries.
3. **Result Size Limits**: Large result sets should be paginated using `from` and `size`.



