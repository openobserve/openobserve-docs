---
description: >-
  Ingest logs in syslog format via TCP/UDP with OpenObserve. Enable in UI, set
  org, stream, and subnet. Default port 5514. Great for server log integration.
---
# Syslog server

!!! warning "Deprecation Notice"
    Built-in Syslog ingestion (via TCP/UDP on port 5514) has been **deprecated as of August 2025** and is no longer available in OpenObserve.  

    **Recommended alternatives:**  
    - [AxoSyslog](https://axoflow.com/docs/axosyslog-core/chapter-destinations/openobserve/)  
    - [syslog-ng](https://www.syslog-ng.com/community/b/blog/posts/sending-logs-to-openobserve-using-syslog-ng)  
    - [Vector](../logs/vector.md)  
    - [Fluent Bit](../logs/fluent-bit.md)  

    We suggest using **AxoSyslog or syslog-ng** if you want protocol-native support for Syslog.


OpenObserve can act as a syslog server. This means that you can send logs to OpenObserve using the syslog protocol. OpenObserve supports both UDP and TCP syslog.

## Enable syslog

Before you can send logs to OpenObserve, you need to enable OpenObserve to act as a syslog server. This is done by enabling syslog in the `Ingestion > Logs > Syslog` section of the OpenObserve UI.

[![Enable syslog](./images/syslog.png)](./images/syslog.png)

## Subnets to allow traffic from

OpenObserve will only accept syslog traffic from the subnets that you specify. You must specify a minimum of 3 things:

- Organization
- Stream name 
- Subnets

## Configuration

Default port: `5514`

You can change the default port number using the following environment variables:

* `ZO_TCP_PORT` - TCP port number to listen on. Default: `5514`
* `ZO_UDP_PORT` - UDP port number to listen on. Default: `5514`


## Testing

Select an organization and stream. Then set the subnet to `0.0.0.0/0`. This config allows accepting syslog data from any IP address.

You can then use the syslog generator script from [this repo](https://github.com/openobserve/syslog_log_generator) to test if you are able to accept syslog data in OpenObserve.

Steps:

### Clone the repo

``` shell
git clone https://github.com/openobserve/syslog_log_generator
cd syslog_log_generator
```
### Modify the script 

file `generate_logs.sh`

```shell
#!/bin/sh
python syslog_gen.py --host 127.0.0.1 --port 5514 --file sample_logs.txt --count 1000
```

Modify the file with the appropriate IP address.

### Start generating test syslog data

```shell
./generate_logs.sh
```

Watch a youtube demo here: 

<iframe width="560" height="315" src="https://www.youtube.com/embed/dF1IEEY-R54?si=tW8E-LFAqGkAP4ey" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
