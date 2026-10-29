---
title: Syslog
metaTitle: "Send Syslog to OpenObserve | OpenObserve"
description: "The built-in syslog server was removed in v0.16.0. Send syslog to OpenObserve through syslog-ng, the OpenTelemetry Collector, Fluent Bit, or Vector."
---

# Syslog

:::warning[Built-in syslog server removed]
OpenObserve no longer runs its own syslog server. TCP/UDP syslog ingestion on port `5514` and the `ZO_TCP_*` and `ZO_UDP_PORT` settings were removed in v0.16.0 (September 2025).
:::

To collect syslog, run a syslog receiver next to your devices and forward the logs to OpenObserve over HTTP or OTLP. Any of these works:

| Tool | Receives syslog with | Sends to OpenObserve with |
| --- | --- | --- |
| [syslog-ng](https://www.syslog-ng.com/) / [AxoSyslog](https://axoflow.com/docs/axosyslog-core/chapter-destinations/openobserve/) | any syslog source | the built-in `openobserve-log()` destination |
| [OpenTelemetry Collector](otlp.md) (contrib) | `syslog` receiver | `otlphttp` exporter |
| [Fluent Bit](fluent-bit.md) | `syslog` input | `http` output |
| [Vector](vector.md) | `syslog` source | `http` or `elasticsearch` sink |

Use syslog-ng or AxoSyslog if you want protocol-native syslog support. **Data > Data sources > Custom > Logs > Syslog-ng** shows a ready-to-use syslog-ng configuration with your organization and credentials filled in.

## syslog-ng

```text
destination d_openobserve_http {
    openobserve-log(
        url("https://<your-openobserve-host>")
        organization("<your-org>")
        stream("syslog")
        user("<your-email>")
        password("<your-passcode>")
    );
};

log {
    source(s_src);
    destination(d_openobserve_http);
    flags(flow-control);
};
```

## OpenTelemetry Collector

Use the contrib distribution (`otelcol-contrib`), which includes the `syslog` receiver.

```yaml
receivers:
  syslog:
    tcp:
      listen_address: "0.0.0.0:5514"
    protocol: rfc5424

exporters:
  otlphttp/openobserve:
    endpoint: https://<your-openobserve-host>/api/<your-org>
    headers:
      Authorization: Basic <base64(email:passcode)>
      stream-name: syslog

service:
  pipelines:
    logs:
      receivers: [syslog]
      exporters: [otlphttp/openobserve]
```

Set `protocol` to `rfc3164` for BSD-style syslog messages. See [OTLP](otlp.md) for the endpoint and header details.

## Fluent Bit

```toml
[INPUT]
  Name   syslog
  Mode   udp
  Listen 0.0.0.0
  Port   5514
  Parser syslog-rfc5424

[OUTPUT]
  Name   http
  Match  *
  URI    /api/<your-org>/syslog/_json
  Host   <your-openobserve-host>
  Port   443
  tls    On
  Format json
  Json_date_key    _timestamp
  Json_date_format iso8601
  HTTP_User   <your-email>
  HTTP_Passwd <your-passcode>
```

The `syslog-rfc5424` and `syslog-rfc3164` parsers ship in Fluent Bit's default `parsers.conf`.

## Vector

```toml
[sources.syslog]
type    = "syslog"
address = "0.0.0.0:5514"
mode    = "tcp"

[sinks.openobserve]
type     = "http"
inputs   = ["syslog"]
uri      = "https://<your-openobserve-host>/api/<your-org>/syslog/_json"
method   = "post"
encoding.codec = "json"
encoding.timestamp_format = "rfc3339"
auth.strategy  = "basic"
auth.user      = "<your-email>"
auth.password  = "<your-passcode>"
```

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
