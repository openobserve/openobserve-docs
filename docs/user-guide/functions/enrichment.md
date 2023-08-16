# Enrichment

## Introduction 
Enrichment refers to the process of adding mre context to the data. This can be done by adding new fields to the data or by modifying existing fields.

You can create a VRL function that can do enrichment at the time of ingestion or at the time of query.

Some of the examples of enrichment are:

- Add a new field to the data. e.g.
    - You have a country code field and you wnat the full country name.
    - You have a status code 1, 2, 3 and you want to add a new field that says if the status is success or failure or unknown.
    - You have an IP address and you want to add a new field that says if the IP address is internal or external.
    - You have an IP address and you want to get the geolocation of the IP address.
    - protocol number to protocol name
  
In order to do enrichment you will need to create a enrichment table. A enrichment table is a CSV file that has the reference data that you want to use to enrich the actual data. 


## Example

### Source data (Log stream)
For example, you have AWS VPC flow logs. You can find more details about VPC flow logs on [AWS docs page](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html).

It might look like (I have removed many fields here to simplify things):

```json
[ 
{ "_timestamp": 1685264705559653, "dstaddr": "10.3.150.41", "packets": 5, "protocol": 6, "srcaddr": "10.3.76.90" }, 
{ "_timestamp": 1685264705559618, "dstaddr": "173.72.40.32", "packets": 1, "protocol": 17, "srcaddr": "10.3.150.41" }, 
{ "_timestamp": 1685264705559581, "dstaddr": "10.3.150.41", "packets": 1, "protocol": 17, "srcaddr": "173.72.40.32" }, 
{ "_timestamp": 1685264705559551, "dstaddr": "10.3.57.95", "packets": 5, "protocol": 6, "srcaddr": "10.3.150.41" }
]
```

You will notice that protocol number. Looking at it immediately does not tell you what the protocol is. You will need to look up the protocol number in a enrichment table to get the protocol name. 

### Enrichment table

The enrichment table will look like this:

```csv linenums="1" title="protocols.csv"
protocol_number,keyword,protocol_description
0,HOPOPT,IPv6 Hop-by-Hop Option
1,ICMP,Internet Control Message
2,IGMP,Internet Group Management
3,GGP,Gateway-to-Gateway
4,IPv4,IPv4 encapsulation
5,ST,Stream
6,TCP,Transmission Control
7,CBT,CBT
8,EGP,Exterior Gateway Protocol
9,IGP,any private interior gateway (used by Cisco for their IGRP)
10,BBN-RCC-MON,BBN RCC Monitoring
11,NVP-II,Network Voice Protocol
12,PUP,PUP
.
.
.

```

### Desired output
Our goal would be be to get the logs to look like:

```json
[ 
{ "_timestamp": 1685264705559653, "dstaddr": "10.3.150.41", "packets": 5, "protocol": "TCP", "srcaddr": "10.3.76.90" }, 
{ "_timestamp": 1685264705559618, "dstaddr": "173.72.40.32", "packets": 1, "protocol": "UDP", "srcaddr": "10.3.150.41" }, 
{ "_timestamp": 1685264705559581, "dstaddr": "10.3.150.41", "packets": 1, "protocol": "UDP", "srcaddr": "173.72.40.32" }, 
{ "_timestamp": 1685264705559551, "dstaddr": "10.3.57.95", "packets": 5, "protocol": "TCP", "srcaddr": "10.3.150.41" }
]
```
protocol `6` and `17` have been replaced with `TCP` and `UDP` respectively.


## Hands on exercise

Let's do a hands on exercise in order to understand how to do enrichment.

### Upload sample data

Download sample data for VPC flow log and ingest it into your OpenObserve instance.

```shell
curl -L https://github.com/openobserve/openobserve/releases/download/v0.4.4/vpc_flow_log.json.gz -o vpc_flow_log.json.gz
curl -L https://github.com/openobserve/openobserve/releases/download/v0.4.4/protocols.csv -o protocols.csv
gunzip vpc_flow_log.json.gz
```

The above commands will download the sample data and unzip it. It will also download teh enrichment table. Now, let's ingest the data into OpenObserve.


```shell title="For OpenObserve Cloud"
curl -u user@domain.com:abqlg4b673465w46hR2905 -k https://api.openobserve.ai/api/User_organization_435345/vpc_flow_log/_json -d "@vpc_flow_log.json"
```

For self hosted, you can use the following command:

```shell title="For self hosted installation"
curl http://localhost:5080/api/default/vpc_flow_log/_json -i -u "root@example.com:Complexpass#123"  -d "@vpc_flow_log.json"
```

Output
```
HTTP/2 200 
date: Sun, 28 May 2023 11:56:42 GMT
content-type: application/json
content-length: 76
vary: accept-encoding
strict-transport-security: max-age=15724800; includeSubDomains
access-control-allow-origin: *
access-control-allow-credentials: true
access-control-allow-methods: GET, PUT, POST, DELETE, PATCH, OPTIONS
access-control-allow-headers: DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization
access-control-max-age: 1728000

{"code":200,"status":[{"name":"vpc_flow_log","successful":9071,"failed":0}]}%      
```

### Upload enrichment table

Now let's setup our enrichment table. Go to the OpenObserve UI and click on the `Functions > enrichment tables`. Click on `Add enrichment table` button. Give it a name `protocols`, upload the CSV file and click on `Save`. You should see the following screen:

![Add enrichment table](./images/add_lookup_table.png)

You could see the contents in logs page.

![Enrichment table details](./images/enrichment_table.webp)

### Enrich the log stream

Now that you have the data and the enrichment table set, lets head  over to logs page.

Adde the below VRL function in the VRL function box and click on `Run query` button.

```javascript linenums="1" title="VRL function"
protocol, err = get_enrichment_table_record("protocols",
{
  "protocol_number": to_string!(.protocol)
})
.protocol_keyword = protocol.keyword
.
```

You should see an additional field `protocol_keyword` in the field list. This field is added by the VRL function. The VRL function is doing a lookup in the enrichment table and adding the `protocol_keyword` field to the output.

![VRL function](./images/enriched_output.webp)

Let's break down each line in the VRL function:

1. `protocol, err = get_enrichment_table_record("protocols", {"protocol_number": to_string!(.protocol)})`: This is retrieving a record from the enrichment table named `protocols`. The specific record to retrieve is determined by the `protocol_number` key, which is set to the string conversion of the `.protocol` field from the event record currently being processed. `.protocol` is of type int64 in the log data whereas `protocol_number` in enrichment table is of type string. The function get_enrichment_table_record returns two values: the record (if found) and an error object (if there was an issue). The record is being stored in protocol and the error is being stored in err.

1. `.protocol_keyword = protocol.keyword`: This line is adding or updating a field named protocol_keyword in the current event record, setting its value to the keyword field from the protocol record retrieved in the previous step.

1. `.`: This line is a placeholder, indicating that the current event record should be returned as the output of the VRL function.

So, the overall purpose of this script is to enrich event data by adding a `protocol_keyword` field, which is retrieved from an enrichment table named "protocols". The table lookup key is derived from the protocol field of the event data. If the protocol field is not present, or if the lookup fails, an error will be generated.

## Conclusion

You can add enrichment tables to your OpenObserve instance and you can use the VRL functions to enrich your data with the data from the enrichment tables.

