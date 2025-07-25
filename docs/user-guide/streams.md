---
description: >-
  Learn how streams in OpenObserve handle data ingestion, storage, and querying.
  Get started with setup, schema settings, and extended retention options.
---
# Streams

A stream in OpenObserve is sequence of events(logs/metrics/traces), sharing the same source for eg: logs from a specific application or from an enterprise.

To navigate to streams in OpenObserve , select preferred organization using organization selection control, then click on ![Streams](../images/streams_menu.jpg) menu , which will take one to stream list screen. The screen lists all streams for selected organization.  

<kbd>
![Streams](../images/streams_list.jpg)
</kbd>

Streams screen details :

1. Search in listed streams
1. Refresh stats for listed streams , stats associated with streams include number of documents , ingested data size etc.
1. Name of the stream
1. Type of stream: metrics, logs or traces
1. Number of documents/row belonging to the stream
1. Ingested data size for the stream in MB
1. Stream details control to open stream details page


To view details or to update stream settings click on stream details control on streams page

<kbd> 
![Stream Details](../images/stream_details.jpg)
</kbd>

Streams details screen:

1. Name of the stream
1. Start & end time for steam, these are based timestamps on log records in stream
1. Name of property/field belonging to the stream
1. Inferred type of the property, openobserve infers schema for data being ingested
1. Checkbox to select/deselect a property of the stream as full text search keys, full text search keys are used to search a term when using `match_all`
1. Checkbox to select/deselect a property of the stream as partitioning key, data ingested after updating the setting will be partitioned using updated keys
