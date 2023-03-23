# Update index mapping

Update an index mapping

Endpoint - PUT /api/:target/_mapping

Update an index mapping

## Request

e.g.

PUT http://localhost:4080/api/myindex/_mapping

Request Body: 

```json
{
	"properties": {
		"name": {
			"type": "text",
			"index": true,
			"store": true,
			"sortable": false,
			"aggregatable": false,
			"highlightable": true
		},
		"author": {
			"type": "keyword",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"price": {
			"type": "numeric",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"published": {
			"type": "bool",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		},
		"create_at": {
			"type": "date",
			"format": "2006-01-02T15:04:05Z07:00",
			"time_zone": "",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		}
	}
}
```

> Mapping also can defines when create index.

## Field types

| type    | alias   | description |
|---------|---------|-------------|
| text    | -       | default type, this type will analyze string to some tokens. |
| keyword | -       | use entire string as one token, when query it's just a term. |
| bool    | boolean | like keyword, but the value just `true` or `false` |
| numeric | integer, double, long, short, int, float | numberic type, it supports range query. |
| date    | time, datetime | date type, it supports range query, and date aggregations. |

## Field type parse rule

### text

By default, all string value parse to `text` type, it can supports `match` and many queries.

And text type supports two params `analyzer` and `search_analyzer`.

`analyzer` and `search_analyzer` you should reference to [https://docs.zincsearch.com/api/index/analyze/](https://docs.zincsearch.com/api/index/analyze/)

### keyword

You should predeined this type. 

Usually it use for some special values, it should has limit values, usually it not contians whitespace. like: the days of week, the seasons of year, a tag of something.

it can supports `match` query, `term` query, and `terms` aggregation.

### bool

It's very simple, just use for boolean type. it will detected `boolean` value and set type to `bool`.

it can supports `term` query, and `terms` aggregation.

### numeric

All numeric values of `integer`, `double`, `long`, `short`, `int`, `float` will detected and set type to `numeric`.

it can support `term` query, `terms` aggregation, `range` aggregation and all `metrics` aggregation, like `min`, `max`, `avg`, `sum`, `count`.

### date

You should predeined this type. and date type supports param `format` and `time_zone`.

#### format:

date format you can reference to [https://pkg.go.dev/time#pkg-constants](https://pkg.go.dev/time#pkg-constants)

Default date format is: `2006-01-02T15:04:05Z07:00`, refers to `time.RFC3339`.

You can set other format what golang support.

Also you can use `timestamp` for date field, set format to: `epoch_millis`.

#### time_zone:

Default value is `UTC`, you can set it like: `+08:00` or `-01:00`. 

## Field attributes

All field support 5 attributes:

### index

Enable index for the field, default is `true`, it will can't be query if it disabled.

### store

Store value for the field, default is `false`, it can returns the origin value when query, it used for like highlight.

### sortable

Enable sort support for the field, default is `false`, but it default enabled for `numeric` and `date` type.

### aggregatable

Enable aggregation for the field, default is `false`, but it default enabled for `numeric` and `date` type.

### highlightable

Enable highlight for the field, default is `false`, if you want use `highlight` for the field, you should enable it.


## Custom @Timestamp field

You can custom `@timestamp`` field in mapping, this allow use your own timestamp.

Default:

```json
{
	"properties": {
		"@timestamp": {
			"type": "date",
			"format": "2006-01-02T15:04:05Z07:00",
			"time_zone": "00:00",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		}
	}
}
```

Or use custom format and time_zone:

```json
{
	"properties": {
		"@timestamp": {
			"type": "date",
			"format": "2006-01-02 15:04:05",
			"time_zone": "+08:00",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		}
	}
}
```

Or use epoch_millis:

```json
{
	"properties": {
		"@timestamp": {
			"type": "date",
			"format": "epoch_millis",
			"time_zone": "+08:00",
			"index": true,
			"store": false,
			"sortable": true,
			"aggregatable": true,
			"highlightable": false
		}
	}
}
```

> If use `epoch_millis` the value of `@timestamp` should be a numeric of timestamp.


Actually `@timestamp` is a [date](#date) field, just named `@timestamp`.

After defined with mapping, you can use your own time format value for `@timestamp` field.

Just add the field in you document, like this:

e.g. 
POST http://localhost:4080/api/myindex/_doc

Request Body: 

```json
{
    "name": "Prabhat Sharma",
	"@timestamp": 1656155409850
}
```

Or use bulk API:

e.g. 
POST /api/_bulk

```json
{ "index" : { "_index" : "myindex" } } 
{ "name": "Prabhat Sharma", "@timestamp": 1656155409850 }
```
