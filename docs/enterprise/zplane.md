> Applicable to enterprise version 

⚠️ zPlane being enterprise feature is licensed software , please contact us at [hello@zinclabs.io](mailto:hello@zinclabs.io) for trial or enterprise license.

# zPlane

zPlane is collection of adapters & utilities to be used with ZincObserve ,augmenting functionalities of ZincObserve.

zPlane in current release provides following features:

1. Bridge to elasticsearch for compatibility with elasticsearch

## Installation
zPlane needs to be run separately , to set up zPlane, please make sure below env variables are set:

| Environment Variable          | Value                     | Description                               |
| ----------------------------- | ------------------------- |------------------------------------------ | 
| ZPLANE_SERVER_PORT            | 4080                      | zPlane server listen http port            | 
| ZPLANE_ZO_ENDPOINT            | http://localhost:5080     | ZincObserve url                           |
| ZPLANE_ZO_USERNAME            | root@example.com          | ZincObserve username                      |
| ZPLANE_ZO_PASSWORD            | Complexpass#123           | ZincObserve password                      |

## ES compatible query support
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
| combined_fields           | where CONTACT(feild1, field2) LIKE value |
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
| query_string              | match_all / match_str(field) value       |
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

1. Must provider organization & stream name in URL
2. No support for analyze, fuzzy,  widlcard search , all of those are string match.