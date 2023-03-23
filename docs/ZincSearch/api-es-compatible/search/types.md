# Search types

## Match All

```json
{
    "query": {
        "match_all": {}
    }
}
```

Return all documents of the index.

## Match

```json
{
    "query": {
        "match": {
            "field": "query string"
        }
    }
}
```

A match query is like a term query, but the input text is analyzed first. An attempt is made to use the same analyzer that was used when the field was indexed.

The match query can optionally perform fuzzy matching. If the fuzziness parameter is set to a non-zero integer the analyzed text will be matched with the specified level of fuzziness. Also, the prefix_length parameter can be used to require that the term also have the same prefix of the specified length.

## Match Phrase

```json
{
    "query": {
        "match_phrase": {
            "field": "query string"
        }
    }
}
```

The match phrase query is like the phrase query, but the input text is analyzed and a phrase query is built with the terms resulting from the analysis.

## Term

```json
{
    "query": {
        "term": {
            "field": "word"
        }
    }
}
```

A term query searches for an exact term.

e.g. Search for 
A term query is the simplest possible query. It performs an exact match in the index for the provided term.

Most of the time users should use a Match Query instead.

## Query String

```json
{
    "query": {
        "query_string": {
            "query": "query string +other word +content:test"
        }
    }
}
```

The query language query allows humans to describe complex queries using a simple syntax. 

## Prefix

```json
{
    "query": {
        "prefix": {
            "field": "qu"
        }
    }
}
```

The prefix query finds documents containing terms that start with the provided prefix.

## Wildcard

```json
{
    "query": {
        "wildcard": {
            "field": "qu*"
        }
    }
}
```

The wildcard query finds documents containing term that start with the provided wildcard.

## Fuzzy

```json
{
    "query": {
        "fuzzy": {
            "field": "qurey"
        }
    }
}
```

A fuzzy query is a term query that matches terms within a specified edit distance (Levenshtein distance). Also, you can optionally specify that the term must have a matching prefix of the specified length.

## Range

```json
{
    "query": {
        "range": {
            "field": {
                "gt": 111,
                "gte": 111,
                "lt": "2015-01-01",
                "lte": "2022-01-01",
                "format": "2006-01-02T15:04:05Z07:00",
                "time_zone": "UTC",
                "boost": 1.0
            }
        }
    }
}
```

The range query supported field type `numeric` and `date`, finds documents containing a value in the specified field within the specified range. You can omit one endpoint, but not both. The inclusiveStart and inclusiveEnd properties control whether or not the end points are included or excluded.
