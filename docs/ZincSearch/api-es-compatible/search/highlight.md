# Highlight

Endpoint - POST /es/:target/_search

Search for documents with highlight.

You need steps for highlight query:

1. Enable `highlightable` in index
1. Create documents after enable `highlightable`
1. Query data with `highlight`


## Enable Highlight

First you need enable `highlightable` in mapping of index.

update mappping:

PUT /es/myindex/_mapping

```json
{
    "properties": {
        "content": {
            "type": "text",
            "index": true,
            "store": true,
            "highlightable": true
        }
    }
}
```

OR

set mapping when create index:

POST /api/index

```json
{
	"name": "article",
	"storage_type": "disk",
	"mappings": {
		"properties": {
			"content": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			}
		}
	}
}
```

## Request

e.g. 
POST http://localhost:4080/api/stackoverflow-6/_search

Request Body: 
```json
{
    "query": {
        "match": {
            "content": "shell window",
        }
    },
    "from": 0,
    "size": 20,
    "highlight": {
        "pre_tags": ["<pre>"],
        "post_tags": ["</pre>"],
        "fields": {
            "title": {
                "pre_tags": [],
                "post_tags": []
            },
            "content": {
                "pre_tags": [],
                "post_tags": []
            },
        }
    }
}
```

> `pre_tags` and `post_tags` can be empty, default is `<mark>` and `</mark>`
>
> fields is a map contains many fields, at least one field.

```json
{
    "query": {
        "match": {
            "content": "shell window"
        }
    },
    "from": 0,
    "max_results": 20,
    "highlight": {
        "fields": {
            "content": {},
        }
    }
}
```
