# Functions - Stream Association

** Functions associated with steams ** are evaluated on a stream during ingestion & can be used for data enrichment, redaction, log reduction, compliance etc. 

These functions act on an individual record (row), hence by default row has to be the input to function being defined.

To associate a function with a stream navigate to Stream Association tab, select the stream for associating function.

One can see list of existing associated functions and order of same, one can additionally remove stream association(this does not delete the function)

If there are more than one functions associated with stream,the functions are applied in order starting with lowest order to highest order.For eg: for a stream lets assume there are two functions associated: 
    - function 1 with order as 1
    - function 2 with order as 2

During ingestion function 1 will be applied to stream as it has lower order 1, as compared to function 2 with order 2

<kbd>
![Ingest Functions](../../images/Stream_functions.jpg)
</kbd>
