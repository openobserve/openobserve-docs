# Create index

Create a new index

Endpoint - POST /api/index

While you do not need to create indexes manually as they are created automatically when you start ingesting the data, you could create them in advance using this API. S3 backed indexes must be created before they can be used.

## Request

e.g. 
POST http://localhost:4080/api/index

Request Body: 

```json
{
	"name": "article",
	"storage_type": "disk",
	"shard_num": 1,
	"mappings": {
		"properties": {
			"title": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"content": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"status": {
				"type": "keyword",
				"index": true,
				"sortable": true,
				"aggregatable": true
			},
			"publish_date": {
				"type": "date",
				"format": "2006-01-02T15:04:05Z07:00",
				"index": true,
				"sortable": true,
				"aggregatable": true
			}
		}
	}
}
```

OR use `s3` to storage data (deprecated):

```json
{
	"name": "article",
	"storage_type": "s3",
	"shard_num": 3,
	"mappings": {
		"properties": {
			"title": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"content": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"status": {
				"type": "keyword",
				"index": true,
				"sortable": true,
				"aggregatable": true
			},
			"publish_date": {
				"type": "date",
				"format": "2006-01-02T15:04:05Z07:00",
				"index": true,
				"sortable": true,
				"aggregatable": true
			}
		}
	}
}
```

OR use `minIO` to storage data (deprecated):

```json
{
	"name": "article",
	"storage_type": "minio",
	"shard_num": 3,
	"mappings": {
		"properties": {
			"title": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"content": {
				"type": "text",
				"index": true,
				"store": true,
				"highlightable": true
			},
			"status": {
				"type": "keyword",
				"index": true,
				"sortable": true,
				"aggregatable": true
			},
			"publish_date": {
				"type": "date",
				"format": "2006-01-02T15:04:05Z07:00",
				"index": true,
				"sortable": true,
				"aggregatable": true
			}
		}
	}
}
```

Default `storage_type` is `disk`

## Use S3 (deprecated)

When create index you can set `storage_type` to `s3` to enable s3 storage.

Before use s3, you should config aws first.

1. Config your ~/.aws/credentials
1. Create bucket for ZincSearch in s3
1. Set environment `ZINC_S3_BUCKET=bucketName`, the bucket name is just you created
1. Create index set `storage_type` to `s3`, you will see the index data in s3 bucket


## Use MinIO (deprecated)

When create index you can set `storage_type` to `minio` to enable minIO storage.

You can set the environments to config minIO.

| Environment Variable          | Default Value | Mandatory     | Description                                                               |
| ----------------------------- | ------------- |-------------- | ------------------------------------------------------------------------- |
| ZINC_MINIO_ENDPOINT           | None          | No            | MinIO server endpoint. e.g localhost:9000 . See no http                   |
| ZINC_MINIO_ACCESS_KEY_ID      | None          | No            | MinIO ACCESS_KEY_ID                                                       |
| ZINC_MINIO_SECRET_ACCESS_KEY  | None          | No            | MinIO SECRET_ACCESS_KEY                                                   |
| ZINC_MINIO_BUCKET             | None          | No            | MinIO bucket for index storage                                            |

## Use Shards

We added `shard_num` option when create index, if you not set this field, it has default value. Default shards num is `3`.

You can change the default value by environment `ZINC_SHARD_NUM`

You can set `shard_num` to `1` to keep it simply, if you don't have very much documents or performance issue.

### What is shards?

Shards is a solution to improve performance, it let us can concurrent writes and reads.

When create index we will set a shardsNum, default is 3.

When write documents, we will use docID do HASHING then distribute documents to different shard.

A shard is a real backend index, it will accept data and write to storage.

With shards, it also give us the ability to concurrently reads, as result we also improve query speed.
