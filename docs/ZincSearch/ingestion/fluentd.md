# fluentd

Here is a sample fluentd config( fluentd need fluent-plugin-elasticsearch):

## fluentd.conf

```shell
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match **>
  @type copy
  <store>
    @type elasticsearch
    host 192.168.3.22
    port 4080
    path /es
    user admin
    password "Complexpass#123"
    logstash_format true
    logstash_prefix ${tag}
    logstash_dateformat %Y%m%d
    include_tag_key true
    type_name access_log
    tag_key @log_name
  </store>
  <store>
    @type stdout
  </store>
</match>


```


