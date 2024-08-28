# Alerts - templates

Templates are used when notification is sent for an alert, templates forms body of request being sent to destination, for eg. for slack one can create template like:

```json
{
  	"text": "For stream {stream_name} alert {alert_name} of type {alert_type} is active"	
}

```

When a notification is being sent, OpenObserve will replace placeholders like {stream_name}, {alert_name} etc with actual values of stream name, alert name.

Variables which can be used in templates are:

| Variable                      | Value                     | Description                               |
| ------------------------ | ------------------------- |------------------------------------------ | 
| org_name                 | Organization name         | Name of the organization                  |
| stream_type              | Stream type               | Type of the stream                        | 
| stream_name              | Stream name               | Name of the stream for alert is created   | 
| alert_name               | Alert name                | Name of the alert                         |
| alert_type               | Alert type                | Possible values are : real time or scheduled |
| alert_period             | Alert period              | Limited 5 minutes, 10 minutes, set for alert |
| alert_operator           | Alert trigger operator    | Like `>`, `>=`, set for alert trigger |
| alert_threshold          | Alert trigger threshold   | Like, `5`, the threshold for trigger alert, it will compare to `alert_count` or `alert_agg_value`. |
| alert_count              | Alert records number      | The records number when we query the alert condition. |
| alert_agg_value          | Alert aggregation value   | The value of the aggregation function if you enable it. and will use this value to compare with `alert_threshold` |
| alert_start_time         | _timestamp                | Alert matched the min _timestamp of the rows and formatted by `%Y-%m-%dT%H:%M:%S` |
| alert_end_time           | _timestamp                | Alert matched the max _timestamp of the rows and formatted by `%Y-%m-%dT%H:%M:%S` |
| alert_url                | URL                       | A link can back to the UI and check the detail data. need configure `ZO_WEB_URL` |
| rows                     | mutiple lines of row template values | based on `row template` in alert page |
| all of the stream fields | the field value                      | Default we `select * from stream` if you custom sql then it will be only the fields that you selected. |

## Variable length

You can use `{rows:N}` to limit only top N matched records will be in the actual value.

You also can use `{log:N}` to limit the length of a actual value.

## Row templates

When your alert notification data have multiple objects you will want the notification has multiple line and each line is the data of one object. for example:

```sql
select k8s_pod_name, count(*) AS cnt FROM stram WHERE str_match(log, 'panic') GROUP BY k8s_pod_name ORDER BY cnt LIMIT 10
```

This sql for Alert will trigger when we find `panic` in logs, and we want to known which `pod` generate the panic log with the error count.

without `row template` we can define the alert template like this:

```json
{
  	"text": "{k8s_pod_name} got {cnt} panic logs"	
}
```

I need to join the multiple values of `k8s_pod_name` with a `,` if there are multiple pods. then the notification message like this:

```json
{
  	"text": "pod1,pod2,pod3 got 1,2,3 panic logs"	
}
```

Actually we want it to show line by line like this:


```
pod1 got 1 panic log
pod2 got 2 panic log
pod3 got 1 panic log
```

That is the `row template`, with `row template` we can define the alert template like this:

```json
{
  	"text": "alert for {alert_name}\n{rows}"	
}
```

Just define the template with `rows`, it will replace by actual values of all rows.

And we define the `row template` in alert page:

```
{k8s_pod_name} got {cnt} panic logs
```

After these, the notification message will be what we expect.


## Slack

Official slack docs at: [https://api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)


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

```shell
URL: https://[your matrix domain]/_matrix/client/r0/rooms/[roomID]/send/m.room.message
Method: POST
Headers: Authorization
Value: Bearer [Your token]
```

```json
{
    "msgtype": "m.text",
    "format": "org.matrix.custom.html",
    "body": "{org_name}/{stream_name}: {alert_name}<br><a href=https://yourOpenObserveURL.example.com/web/logs?org_identifier={org_name}>Recent logs</a>",
    "formatted_body": "{org_name}/{stream_name}: {alert_name}<br><a href=https://yourOpenObserveURL.example.com/web/logs?org_identifier={org_name}>Recent logs</a>"

}
```

## Opsgenie

Official docs at: [https://docs.opsgenie.com/docs/alert-api#create-alert](https://docs.opsgenie.com/docs/alert-api#create-alert)

```shell
URL: https://api.opsgenie.com/v2/alerts
Method: POST
Headers:

Authorization: GenieKey __YOUR_API_KEY__
```

```json
{
    "message": "{alert_name} is active",
    "alias": "{alert_name}",
    "description":"{stream_name}",
    "priority":"P3"
}
```

## Pagerduty

OpenObserve alert will create an incident in pagerduty

Official docs at: [https://developer.pagerduty.com/api-reference/a7d81b0e9200f-create-an-incident](https://developer.pagerduty.com/api-reference/a7d81b0e9200f-create-an-incident)

```shell
URL: https://api.pagerduty.com/incidents
Method: POST
Headers:

Authorization: Token token=y_NbAkKc66ryYTWUXYEu
Content-Type: application/json
From: <The email address of a valid user associated with the account making the request >
```

```json
{
  "incident": {
    "type": "incident",
    "title": "The server is on fire.",
    "service": {
      "id": "PWIXJZS",
      "type": "service_reference"
    },
    "priority": {
      "id": "P53ZZH5",
      "type": "priority_reference"
    },
    "urgency": "high",
    "body": {
      "type": "incident_body",
      "details": "A disk is getting full on this machine. You should investigate what is causing the disk to fill, and ensure that there is an automated process in place for ensuring data is rotated (eg. logs should have logrotate around them). If data is expected to stay on this disk forever, you should start planning to scale up to a larger disk."
    },
    "escalation_policy": {
      "id": "PT20YPA",
      "type": "escalation_policy_reference"
    }
  }
}

```

## Microsoft Teams

Official docs at: [https://learn.microsoft.com/en-us/graph/api/chatmessage-post](https://learn.microsoft.com/en-us/graph/api/chatmessage-post)

```shell

URL: /teams/{team-id}/channels/{channel-id}/messages
Method: POST

Headers:
  Authorization: Bearer {code}
```

```json


{
  "body": {
    "content": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"	
  }
}
```

e.g.

```shell
POST https://graph.microsoft.com/v1.0/teams/fbe2bf47-16c8-47cf-b4a5-4b9b187c508b/channels/19:4a95f7d8db4c4e7fae857bcebe0623e6@thread.tacv2/messages

Headers:
  Content-type: application/json
  Authorization: Bearer {code}

Body:
{
  "body": {
    "content": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"	
  }
}
```
