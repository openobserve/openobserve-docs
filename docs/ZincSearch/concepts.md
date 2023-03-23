# Concepts

ZincSearch is a search engine that allows you to search for your own data when uploaded in ZincSearch. Think of it as "Google" or "Bing" search, but just for your own data.

ZincSearch allows you to index your (json) documents and allows to do full text search.

E.g. You can insert:

```json
{
    "message":"Prabhat Sharma is a cool guy to hang with."
}
```

And many more documents like above and then search for: Prabhat, cool or any word or combination of words.


## ZincSearch Index

An index is where all of your data that you push into ZincSearch is indexed and stored  for fast access. ZincSearch maintains inverted indexes for the data you push in ZincSearch.

## Inverted Index

An inverted index is a database index storing a mapping from content, such as words or numbers, to its locations in a table, or in a document or a set of documents. The purpose of an inverted index is to allow fast full-text searches, at a cost of increased processing when a document is added to the database.

e.g.

An inverted index for a set of documents might look like

```json
{"id":1, "message: "Prabhat Sharma is a cool guy to hang with"}
```

```json
{"id":2, "message: "Prabhat Sharma is in San Francisco"}
```

| Message   | Document ID |
|-----------|-------------|
| Prabhat   | 1, 2        |
| Sharma    | 1, 2        |
| cool      | 1           |
| guy       | 1           |
| hang      | 1           |
| with      | 1           |
| San       | 2           |
| Francisco | 2           |

## Bluge

Bluge is the underlying indexing library used by ZincSearch on top of which it provides a lot of functionality.

## Index mapping

A document can have multiple fields. Each field can have a type. A mapping defines which fields have what type for an index. A mapping allows ZincSearch to index the document properly. If a mapping is not available for a field then ZincSearch uses reflection to find its type.

e.g.

For olympics index the mapping could look like

```json
{
    "mappings": {
        "properties": {
            "Athlete": {
                "type": "text"
            },
            "City": {
                "type": "keyword"
            },
            "Country": {
                "type": "keyword"
            },
            "Discipline": {
                "type": "text"
            },
            "Event": {
                "type": "text"
            },
            "Gender": {
                "type": "text"
            },
            "Medal": {
                "type": "keyword"
            },
            "Season": {
                "type": "keyword"
            },
            "Sport": {
                "type": "text"
            },
            "Year": {
                "type": "numeric"
            }
        }
    }
}
```
