# Query Functions

** Query functions ** are evaluated during query execution, they don't need stream to be specified while defining function. These kind of functions can be used for all the streams belonging one's organization.

Query function is defined using [lua script](https://www.lua.org/) & act on specified input columns (fields) of stream being queried.

While defining query function, one has to :

1. make sure toggle 'Is Ingest Time Function?' is turned ** Off ** 
1. specify function name
1. provide script defining behaviour of function with appropriate number of parameters as input, as mentioned above during query time the columns/fields of stream should be used as input to the function being defined.


<kbd>
![Query Functions](../../images/Query_function.jpg)
</kbd>