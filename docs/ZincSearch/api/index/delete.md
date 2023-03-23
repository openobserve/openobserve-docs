# Delete index

Delete an index

Endpoint - DELETE /api/index/:indexName

This will delete the index and its associated metadata. Be careful using this as data is deleted unrecoverably.

## Request

e.g. 
DELETE http://localhost:4080/api/index/indextodelete

### Multiple delete

Delete API suports use wildcard to delete multiple indexes at one time.

e.g.
DELETE http://localhost:4080/api/index/index-to-delete-*
