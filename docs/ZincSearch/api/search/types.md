# Search types

## Match All

```json
"search_type": "matchall"
```

OR 

```json
"search_type": "alldocuments"
```

Return all documents of the index.

## Match

```json
"search_type": "match"
```

A match query is like a term query, but the input text is analyzed first. An attempt is made to use the same analyzer that was used when the field was indexed.

The match query can optionally perform fuzzy matching. If the fuzziness parameter is set to a non-zero integer the analyzed text will be matched with the specified level of fuzziness. Also, the prefix_length parameter can be used to require that the term also have the same prefix of the specified length.

## Match Phrase

```json
"search_type": "matchphrase"
```

The match phrase query is like the phrase query, but the input text is analyzed and a phrase query is built with the terms resulting from the analysis.

## Term

```json
"search_type": "term"
```

A term query searches for an exact term.

e.g. Search for 
A term query is the simplest possible query. It performs an exact match in the index for the provided term.

Most of the time users should use a Match Query instead.

## Query String

```json
"search_type": "querystring"
```

The query language query allows humans to describe complex queries using a simple syntax. 

## Prefix

```json
"search_type": "prefix"
```

The prefix query finds documents containing terms that start with the provided prefix.

## Wildcard

```json
"search_type": "wildcard"
```

The wildcard query finds documents containing term that start with the provided wildcard.

## Fuzzy

```json
"search_type": "fuzzy"
```

A fuzzy query is a term query that matches terms within a specified edit distance (Levenshtein distance). Also, you can optionally specify that the term must have a matching prefix of the specified length.

## Date Range

```json
"search_type": "daterange"
```

The date range query finds documents containing a date value in the specified field within the specified range. You can omit one endpoint, but not both. The inclusiveStart and inclusiveEnd properties control whether or not the end points are included or excluded.
