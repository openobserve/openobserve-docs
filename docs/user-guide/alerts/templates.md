# Alerts - templates

Templates are used when notification is sent for an alert , templates forms body of request being sent to destination , for eg. for slack one can create template like :

```json
{
  	"text": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"	
}

```
When a notification is being sent , OpenObserve will replace placeholders like {stream_name} ,{org_name} etc with actual values of stream , alert , organization.

Variables which can be used in templates are:

| Variable                      | Value                     | Description                               |
| ----------------------------- | ------------------------- |------------------------------------------ | 
| stream_name                   |   Stream name             | Name of the stream for alert is created   | 
| org_name                      | Organization name         | Name of the organization                  |
| alert_name                    | Alert name                | Name of the alert                         |
| alert_type                    | Alert type                | Possible values are : real time or scheduled           |


## Slack

```json
{
  "text": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"
}

```

## Prometheus Alert Manager
```json
[
    {
        "labels": {
            "alertname": "{alert_name}",
            "stream": "{stream_name}",
            "organization": "{org_name}",
            "alerttype": "{alert_type}",
            "severity": "critical"
        },
        "annotations": {
            "timestamp": "{timestamp}"
        }
    }
]
```


## WeCom

```json
{
  "msgtype": "text",
  "text": {
    "content": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"
  }
}
```

Message usage:

https://developer.work.weixin.qq.com/document/path/91770

Webhook URL, eg:

`POST https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=9a39c951-1234-4382-8a6e-12345678`


## Feishu

```json
{
  "msg_type": "text",
  "content": {
    "text": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"
  }
}
```

Message usage:

https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN?lang=zh-CN#383d6e48

Webhook URL, eg:

`POST https://open.feishu.cn/open-apis/bot/v2/hook/d91b7e97-1234-1234-1234-dfb0b9cc54d0`


## Matrix

```json
{
    "msgtype": "m.text",
    "format": "org.matrix.custom.html",
    "body": "{org_name}/{stream_name}: {alert_name}<br><a href=https://yourOpenObserveURL.example.com/web/logs?org_identifier={org_name}>Recent logs</a>",
    "formatted_body": "{org_name}/{stream_name}: {alert_name}<br><a href=https://yourOpenObserveURL.example.com/web/logs?org_identifier={org_name}>Recent logs</a>"

}
```

