# List templates

List existing templates

## Request

GET /es/_index_template

## Response

```json
[
	{
		"name": "t2",
		"@timestamp": "2022-05-23T17:52:35.47224198Z",
		"index_template": {
			"index_patterns": ["game-*"],
			"priority": 199,
			"template": {
				"mappings": {
					"properties": {
						"content": {
							"type": "text",
							"index": true,
							"store": false,
							"sortable": false,
							"aggregatable": false,
							"highlightable": false,
							"term_positions": true
						}
					}
				}
			}
		}
	}
]
```
