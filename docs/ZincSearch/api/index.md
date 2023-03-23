# API Index

These APIs can be used to programatically interact with ZincSearch.

All APIs must have an authorization header. Authorization header can be created using base64 encoded values of user id and password. For the sake of simplicity it is HTTP basic authentication mechanism.


Header creation mechanism:

> Authorization: Basic base64("userId:password")

e.g. Header:

> Authorization: Basic YWRtaW46Q29tcGxleHBhc3MjMTIz

Make sure that you are sending the requests over HTTPS.

## API List

1. [Index](index/index)
    1. [Create / Update](index/create)
    1. [Delete](index/delete)
    1. [List](index/list)
    1. [Get Mapping](index/get-mapping)
    1. [Update Mapping](index/update-mapping)
    1. [Get Settings](index/get-settings)
    1. [Update Settings](index/update-settings)
    1. [Analyze](index/analyze)
    1. [Refresh Data](refresh-data)
    1. [Check Exists](exists)
1. [Document](document/index)
    1. [Create](document/create)
    1. [Create with id](document/create-with-id)
    1. [Update](document/update)
    1. [Delete](document/delete)
    1. [Bulk](document/bulk)
    1. [Bulk V2](document/bulkv2)
    1. [Multi](document/multi)
1. [Search](search/index)
    1. [Search](search/search)
    1. [Search Types](search/types)
    1. [Aggregations](search/aggregation)
    1. [Highlight](search/highlight)
1. [User](user/index)
    1. [Create / Update](user/create)
    1. [Delete](user/delete)
    1. [List](user/list)
1. [Version](version)
1. [Metrics](metrics)
