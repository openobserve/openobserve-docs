> Applicable to enterprise version 

# Enterprise features

There are certain features of ZincObserve that are available only in the enterprise version. All these additional features are provided using zPlane.

Currently following features are part of enterprise offering through zPlane:

1. Elasticsearch API compatibility
1. SSO (on Roadmap)
1. Cross cluster search (on Roadmap)
1. Priority support with SLAs

# zPlane

⚠️ zPlane is commercial software that needs to be licensed before you can use it in production. You can get zPlane from <https://gallery.ecr.aws/zinclabs/zplane> for evaluation purposes. Please contact us at [hello@zinclabs.io](mailto:hello@zinclabs.io) for enquiries or enterprise license.

zPlane is collection of adapters & utilities to be used with ZincObserve, augmenting functionalities of ZincObserve.

## Installation
zPlane needs to be run as a container. To set up zPlane, please make sure below environment variables are set:

| Environment Variable          | Value                     | Description                               |
| ----------------------------- | ------------------------- |------------------------------------------ | 
| ZPLANE_SERVER_PORT            | 9200                      | zPlane server listen http port            | 
| ZPLANE_ZO_ENDPOINT            | http://localhost:5080     | ZincObserve url                           |
| ZPLANE_ZO_ORGANIZATION        | default                   | ZincObserve default organization          |


## Elasticsearch compatible query support
Query DSL will translate to Where in SQL, please refer below table for same:

| ES DSL                    | SQL                                      |
| ------------------------- | ---------------------------------------- |
| bool                      | where                                    |
| bool.should               | where AND                                |
| bool.must                 | where AND                                |
| bool.must_not             | --                                       |
| bool.filter               | where AND                                |
| bool.minimum_should_match | --                                       |
| boosting                  | --                                       |
| combined_fields           | where CONTACT(field1, field2) LIKE value |
| exists                    | --                                       |
| fuzzy                     | --                                       |
| geo                       | --                                       |
| ids                       | id IN (id1, id2)                         |
| match_all                 | where is empty                           |
| match_bool_prefix         | match_all / match_str(field) value       |
| match_none                | --                                       |
| match_phrase_prefix       | match_all / match_str(field) value       |
| match_phrase              | match_all / match_str(field) value       |
| match                     | match_all / match_str(field) value       |
| multi_match               | AND (match_all / match_str(field) value) |
| prefix                    | match_all / match_str(field) value       |
| query_string              | will parse AST and convert to SQL        |
| range                     | field >= a AND field < b                 |
| regexp                    | re_match(field, value)                   |
| simple_query_string       | match_all / match_str(field) value       |
| term                      | match_all / match_str(field) value       |
| terms_set                 | --                                       |
| terms                     | AND (match_all / match_str(field) value) |
| wildcard                  | AND (match_all / match_str(field) value) |

## Aggregation DSL will translate to Agg in Query

| Agg DSL             | SQL (key, count)                    |
| ------------------- | ----------------------------------- |
| avg                 | select avg(field)                   |
| max                 | select max(field)                   |
| min                 | select min(field)                   |
| sum                 | select sum(field)                   |
| count               | select count(field)                 |
| terms               | GROUP BY field                      |
| range               | select case                         |
| date_range          | select case                         |
| histogram           | Not supported                       |
| date_histogram      | select histogram(field, interval)   |
| auto_date_histogram | select histogram(field, bucket_num) |
| agg->children       | Work in progress                    |


## Limitations 

1. No support for analyze, fuzzy, wildcard search, all of those are treated as string match.

## APIs

You can configure zPlane as an Elasticsearch server: `http://localhost:9200`

| Method     | API                      |  Description   |
|------------|--------------------------|----------------|
| HEAD, GET  | /                        | --             |
| GET        | /_license                | --             |
| GET        | /_xpack                  | --             |
| GET        | /_nodes                  | --             |
| POST       | /:index/_search          | --             |
| POST       | /_msearch                | --             |
| POST       | /_bulk                   | --             |
| POST       | /:index/_doc             | --             |
| PUT        | /:index/_doc/:id         | --             |
| PUT        | /:index/_create/:id      | --             |
| GET        | /:index/_mapping         | --             |
| PUT        | /:index/_mapping         | empty API      |
| GET        | /_index_template         | empty API      |
| POST       | /_index_template         | empty API      |
| GET        | /_index_template/:index  | empty API      |
| HEAD       | /_index_template/:index  | empty API      |
| POST       | /_index_template/:index  | empty API      |
| DELETE     | /_index_template/:index  | empty API      |
| HEAD       | /_data_stream/:stream    | empty API      |
| GET        | /_data_stream/:stream    | empty API      |
| PUT        | /_data_stream/:stream    | empty API      |
