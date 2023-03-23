# Create update template

Create or update a template.

Create `POST /es/_index_template`

Update `PUT /es/_index_template/:target`


Template is a template of index match the `index_patterns`.

When create an index, we will check template by `index_patterns` match index name, if matched, we will use the settings and mappings predefined in template for the index.


## Request

POST /es/_index_template

```json
{
  "name": "t2",
  "index_patterns": ["game-*"],
  "priority": 100,
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

## Response

```json
{"message": "template t2 created"}
```
