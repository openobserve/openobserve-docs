# Get template

Analyze the text and generate tokens.

## Request

GET /es/_index_template/:target

## Response

```json
{
	"index_patterns": ["game-*"],
	"priority": 199,
	"template": {
    "settings": {
      "analysis": {
        "analyzer": {
          "default": {
            "type": "standard"
          }
        }
      }
    },
    "mappings": {
      "properties": {
        "content": {
          "type": "text",
          "index": true,
          "store": true,
          "sortable": false,
          "aggregatable": false,
          "highlightable": true
        }
      }
    }
  }
}
```
