# Get index settings

Get an index settings

Endpoint - GET /es/:target/_settings

Get an index settings

## Request

e.g. 

GET http://localhost:4080/es/myindex/_settings


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
