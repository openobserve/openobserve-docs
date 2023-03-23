
### Bulk ingestion

Bulk ingestion API follows same interface as Elasticsearch API defined in [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html).


Here is a sample of how to use it:

```shell
curl -L https://github.com/zinclabs/zincsearch/releases/download/v0.1.1/olympics.ndjson.gz -o olympics.ndjson.gz
gzip -d  olympics.ndjson.gz 
curl http://localhost:4080/api/_bulk -i -u admin:Complexpass#123  --data-binary "@olympics.ndjson"
```
