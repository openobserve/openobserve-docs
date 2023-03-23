# _analyze

Analyze the text and generate tokens.

## Request

POST /es/_analyze

```json
{
  "analyzer" : "standard",
  "text" : "50 first dates"
}
```

## Response

```json
{
    "tokens": [
        {
            "end_offset": 2,
            "keyword": false,
            "position": 1,
            "start_offset": 0,
            "token": "50",
            "type": "Numeric"
        },
        {
            "end_offset": 8,
            "keyword": false,
            "position": 1,
            "start_offset": 3,
            "token": "first",
            "type": "AlphaNumeric"
        },
        {
            "end_offset": 14,
            "keyword": false,
            "position": 1,
            "start_offset": 9,
            "token": "dates",
            "type": "AlphaNumeric"
        }
    ]
}
```

### Use a special analyzer

```json
{
  "analyzer" : "standard",
  "text" : "50 first dates"
}
```

### Use a special tokenizer

```json
{
  "tokenizer" : "standard",
  "text" : "50 first dates"
}
```

### Use a special tokenizer and filter

```json
{
  "tokenizer" : "standard",
  "char_filter" : ["html"],
  "token_filter" : ["camel_case"],
  "text" : "50 first dates"
}
```

## Support Analyzers

- standard
- simple
- keyword
- web
- regexp
- stop
- whitespace

### Luanguages analyzers

| Country   | Shortened form |
|-----------|----------------|
| arabic    | ar             |
| Asia Countries | cjk       |
| sorani    | ckb            |
| danish    | da  |
| german    | de  |
| english   | en  |
| spanish   | es  |
| persian   | fa  |
| finnish   | fi  |
| french    | fr  |
| hindi     | hi  |
| hungarian | hu  |
| italian   | it  |
| dutch     | nl  |
| norwegian | no  |
| portuguese | pt |
| romanian  | ro  |
| russian   | ru  |
| swedish   | sv  |
| turkish   | tr  |


```json
{
  "analyzer" : "english",
  "text" : "Hello World"
}
```

OR

```json
{
  "analyzer" : "en",
  "text" : "Hello World"
}
```

### Chinese analyzers

- gse_standard
- gse_search


```json
{
  "analyzer" : "gse_search",
  "text" : "你好世界"
}
```

OR

```json
{
  "analyzer" : "gse_standard",
  "text" : "你好世界"
}
```

## Support Tokenizers

- character
- char_group
- ngram
- edge_ngram
- exception
- letter
- simple
- lower_case
- path_hierarchy
- regexp
- single
- keyword
- standard
- web
- whitespace
- gse_standard
- gse_search

## Support TokenFilters

- apostrophe
- camel_case
- lower_case
- upper_case
- dict
- ngram
- edge_ngram
- elision
- keyword
- length
- porter
- reverse
- regexp
- shingle
- trim
- stop
- truncate
- unicodenorm
- unique
- gse_stop

### Luanguages tokenFilters

| Country   | token_filter   |
|-----------|----------------|
| arabic    | arabic_normalization / ar_normalization / arabic_stemmer / ar_stemmer   |
| cjk       | cjk_bigram / cjk_width                                                  |
| sorani    | sorani_normalization / ckb_normalization / sorani_stemmer / ckb_stemmer |
| danish    | danish_stemmer / da_stemmer                                             |
| german    | german_normalization / de_normalization / german_stemmer / de_stemmer / german_light_stemmer / de_light_stemmer  |
| english   | english_possessive_stemmer / en_possessive_stemmer / english_stemmer / en_stemmer  |
| spanish   | spanish_stemmer / es_stemmer / spanish_light_stemmer / es_light_stemmer |
| persian   | persian_normalization / fa_normalization                                |
| finnish   | finnish_stemmer / fi_stemmer                                            |
| french    | french_elision / fr_elision / french_stemmer / fr_stemmer / french_light_stemmer / fr_light_stemmer / french_minimal_stemmer / fr_minimal_stemmer  |
| irish     | irish_elision / ga_elision                                              |
| hindi     | hindi_normalization / hi_normalization / hindi_stemmer / hi_stemmer     |
| hungarian | hungarian_stemmer / hu_stemmer                                          |
| indic     | indic_normalization / in_normalization                                  |
| italian   | italian_elision / it_elision / italian_stemmer / it_stemmer / italian_light_stemmer / it_light_stemmer  |
| dutch     | dutch_stemmer / nl_stemmer                                              |
| norwegian | norwegian_stemmer / no_stemmer                                          |
| portuguese | portuguese_light_stemmer / portuguese_stemmer / pt_light_stemmer       |
| romanian  | romanian_stemmer / ro_stemmer                                           |
| russian   | russian_stemmer / ru_stemmer                                            |
| swedish   | swedish_stemmer / sv_stemmer                                            |
| turkish   | turkish_stemmer / tr_stemmer                                            |

## Support CharFilters

- ascii_folding
- html
- zero_width_non_joiner
- regexp
- mapping
