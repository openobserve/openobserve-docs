# Get index settings

Get an index settings

Endpoint - GET /api/:target/_settings

Get an index settings

## Request

e.g. 

GET http://localhost:4080/api/myindex/_settings


## Response

```json
{
	"myindex": {
		"settings": {
			"analysis": {
				"analyzer": {
					"default": {
						"type": "standard"
					}
				}
			}
		}
	}
}
```
