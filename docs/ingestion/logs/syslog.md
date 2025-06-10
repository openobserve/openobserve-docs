# Syslog server

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

- `ZO_TCP_PORT` - TCP port number to listen on. Default: `5514`
- `ZO_UDP_PORT` - UDP port number to listen on. Default: `5514`

You can also configure the TLS settings for syslog TCP server using the following environment variables:

- `ZO_TCP_TLS_ENABLED` - Enable TLS for TCP syslog server. If enabled, `ZO_TCP_PORT` will be used for the TLS connection over TCP. Default: `false`

If `ZO_TCP_TLS_ENABLED` is set to `true`, then ensure all the below variables are set:

- `ZO_TCP_TLS_CERT_PATH` - Path to the TLS certificate file to be used on the server.
- `ZO_TCP_TLS_KEY_PATH` - Path to the TLS key file to be used on the server.
- `ZO_TCP_TLS_CA_CERT_PATH` - Path to the TLS CA certificate file to be used on the server.

## Testing

Select an organization and stream. Then set the subnet to `0.0.0.0/0`. This config allows accepting syslog data from any IP address.

You can then use the syslog generator script from [this repo](https://github.com/openobserve/syslog_log_generator) to test if you are able to accept syslog data in OpenObserve.

Steps:

### Clone the repo

```shell
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
