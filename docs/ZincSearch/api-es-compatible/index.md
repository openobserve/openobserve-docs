# API Index Compatible Elasticsearch

These APIs can be used to programatically interact with ZincSearch.

All APIs must have an authorization header. Authorization header can be created using base64 encoded values of user id and password. For the sake of simplicity it is HTTP basic authentication mechanism.


Header creation mechanism:

> Authorization: Basic base64 userId:password")

e.g. Header:

> Authorization: Basic YWRtaW46Q29tcGxleHBhc3MjMTIz

Make sure that you are sending the requests over HTTPS.

## API List

1. [_info](_info)
1. [_license](_license)
1. [_xpack](_xpack)
1. [Index](index/index)
    1. [Get Mapping](index/get-mapping)
    1. [Update Mapping](index/update-mapping)
    1. [Get Settings](index/get-settings)
    1. [Update Settings](index/update-settings)
    1. [Create Template](index/create-template)
    1. [Update Template](index/create-template)
    1. [Delete Template](index/delete-template)
    1. [Get Template](index/get-template)
    1. [List Template](index/list-template)
    1. [Analyze](index/analyze)
1. [Document](document/index)
    1. [Create](document/create)
    1. [Update](document/update)
    1. [Delete](document/delete)
    1. [Bulk](document/bulk)
1. [Search](search/index)
    1. [Search](search/search)
    1. [Search Types](search/types)
    1. [Multiple Search](search/msearch)
    1. [Aggregations](search/aggregation)
    1. [Highlight](search/highlight)
