# Welcome to ZincSearch


## Why ZincSearch

ZincSearch was started since there was no search engine that was available that could serve my needs.

While Elasticsearch is a very good product, it is complex and requires lots of resources and is more than a decade old. I built ZincSearch so it becomes easier for folks to use full text search indexing without doing a lot of work.

You may also want to read the initial blog regarding launch of [ZincSearch](https://prabhatsharma.in/blog/in-search-of-a-search-engine-beyond-elasticsearch-introducing-zinc/)


## Features:
1. Provides full text indexing capability
1. Single binary for installation and running. Binaries available under [releases](https://github.com/zinclabs/zincsearch/releases) for multiple platforms.
1. Embedded Web UI for querying data written in Vue
1. Full Compatibility with Elasticsearch APIs for ingestion of data (single record and bulk API)
1. Compatibility with Elasticsearch DSL for querying data. Check /es endpoints (This is work in progress. If somerthing does not work, let us know by raising a github issue)
1. Out of the box authentication
1. Schema less - No need to define schema upfront and different documents in the same index can have different fields.
1. Index storage in s3 and MinIO (deprecated)
1. Aggregation support
1. Highlight support

## Project Status:

ZincSearch is in Pre GA (General Availability)  and will be marked as production ready at v1.0.0 . 
