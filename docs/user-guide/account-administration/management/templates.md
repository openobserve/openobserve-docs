---
description: >-
  Create alert notification templates in OpenObserve with variable placeholders, content templates, markdown rendering, chart images, and row templates for Slack, email, webhooks, and more.
---
# Alert Templates

Templates are used when notification is sent for an alert, templates forms body of request being sent to destination, for eg. for slack one can create template like:

```json
{
  	"text": "For stream {stream_name} alert {alert_name} of type {alert_type} is active"	
}

```

When a notification is being sent, OpenObserve will replace placeholders like {stream_name}, {alert_name} etc with actual values of stream name, alert name.

## Template kinds

Templates have two kinds:

- **Custom** (default): A free-form JSON or string body with `{var}` placeholders. This is the classic template format — write whatever payload your destination expects.
- **Content**: A structured template using a `ContentSpec` that OpenObserve renders into the right format for each destination automatically. Content templates give you a richer editing experience with title, Markdown body, fields, links, and optional chart images — and the same template works across Slack, Email, Teams, Discord, and webhooks without rewriting per-channel payloads.

When you create a template from **Management > Templates**, select the kind that matches your needs.

## Content templates

Content templates let you design notifications using a structured specification instead of writing raw JSON for each channel. Define your content once, and OpenObserve renders it correctly for every destination.

![TODO: screenshot of creating a content template with title, body, fields, links, and chart toggle](images/placeholder.png)

A content template includes:

- **Title**: A templated one-liner used as the Slack headline, email subject, or PagerDuty summary. You can set per-channel overrides for specific destinations.
- **Body**: Markdown with `{var}` placeholders. The body is rendered to HTML for rich channels and converted to plain text for channels that require it.
- **Fields**: Key-value pairs displayed as a structured field list (like Slack block fields). Each field can include a severity filter so it only appears when the alert is at a specific level (e.g., critical).
- **Links**: Custom action links with labels and URLs. Links also support severity-based visibility.
- **Rows**: Configurable row rendering — enable or disable rows, set a maximum count, select specific columns, and define a per-row format template. When disabled, the notification omits the row table entirely.
- **Chart**: Toggle to include a chart image of the alert data in the notification. See [Alert chart images](#alert-chart-images).

Content templates are stored as a JSON `ContentSpec`. For example:

```json
{
  "title": "{alert_name} fired",
  "body": "**{alert_name}** exceeded threshold\nStream: {stream_name}\nValue: {alert_agg_value}",
  "fields": [
    { "label": "Stream", "value": "{stream_name}" },
    { "label": "Runbook", "value": "https://wiki.example.com/runbooks/cpu", "show_when": { "levels": ["critical"] } }
  ],
  "links": [
    { "label": "View in OpenObserve", "url": "{alert_url}" }
  ],
  "rows": { "enabled": true, "max": 10 },
  "chart": { "enabled": false }
}
```

## Preview a template

You can preview how a content template renders for any channel and severity before saving it. The preview uses the exact same rendering code path as sending a live notification, so the output matches production exactly.

![TODO: screenshot of template preview showing rendered card for Slack at critical severity](images/placeholder.png)

To preview a template:

1. Navigate to **Management > Templates**.
2. Create or edit a content template.
3. Use the **Preview** panel to select a channel (Slack, Email, Teams, Discord, Webhook, PagerDuty, Opsgenie, ServiceNow, or SNS) and a severity level.
4. The preview shows:
   - **Preview model**: A rendered card with title, body HTML, fields, links, and severity color. This is how the notification looks in rich clients.
   - **Raw payload**: The exact JSON or email content that the send path produces.
   - **Unknown variables**: Any `{variable}` in your template that isn't recognized, so you can fix typos before alert fires go out with broken placeholders.

The preview uses deterministic sample data (e.g., "Sample CPU alert" with synthetic rows) so the same template always previews identically.

## Alert chart images

Content templates can include a chart image of the alert data. When you enable the **Chart** toggle in a content template, OpenObserve renders a chart of the alert query results using `plotters` and embeds it in the notification.

![TODO: screenshot of Slack notification with embedded alert chart image](images/placeholder.png)

Chart rendering:

- The chart is generated on-demand at notification time using the same query results that triggered the alert.
- Charts are served via an HMAC-signed URL (`GET /api/v2/{org}/alerts/charts/render`) for security — only the notification recipient can access the chart image.
- Chart images are rendered as PNG on the node processing the notification.
- Charts are reused across multiple destinations on the same alert firing, and across retries.

## Test a destination

Before relying on a destination for live alerts, use the test send feature to verify it works correctly.

1. Navigate to **Management > Alert Destinations**.
2. Select a destination from the list.
3. Click **Test Send** to dispatch a test notification through that destination.

![TODO: screenshot of destination detail page with Test Send button](images/placeholder.png)

The test notification is marked with `[TEST]` so recipients can distinguish it from a real alert. A test send uses the destination's configured template with synthetic sample data, verifying the full pipeline: template rendering, credential substitution, and delivery.

## Variable reference

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
| alert_trigger_time       | _timestamp                | Represents the timestamp in microseconds when the alert was evaluated |
| alert_trigger_time_str   | _timestamp                | Formatted `alert_trigger_time`. E.g. - `2024-12-02T11:27:40` |
| alert_level              | Severity level            | The alert severity level: `critical`, `warning`, `ok`, `no_data`, or empty for single-level alerts |
| alert_priority           | Priority string           | The alert priority label, e.g. `P1`, `P2` |
| alert_tags               | Tags                      | Comma-separated alert tags, e.g. `infra, prod` |
| alert_threshold_crit     | Critical threshold        | Threshold value for critical severity |
| alert_threshold_warn     | Warning threshold         | Threshold value for warning severity |
| alert_description        | Description               | The alert's description text |
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

Check this video to understand more

<iframe width="760" height="315" src="https://www.youtube.com/embed/tW8VnNnfZBg?si=9bXSzGXgPER2Gbaw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Slack

Official slack docs at: [https://api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)


```json
{
  "text": "For stream {stream_name} of organization {org_name} alert {alert_name} of type {alert_type} is active"
}

```

Check the video to understand more.

<iframe width="760" height="315" src="https://www.youtube.com/embed/EVHgLUTImC4?si=Qsy9N-Uxis7qFDAx" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

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
## Email 
**Subject**
```shell
[Alert: {alert_name}] - Severity: {alert_type}
```
**Body**
```shell
An alert has been triggered:

- Alert Name: {alert_name}
- Severity: {alert_type}
- Stream Name: {stream_name}
- Condition: {alert_operator} {alert_threshold}
- Triggered Count: {alert_count}
- Start Time: {alert_start_time}
- End Time: {alert_end_time}
For more details, visit: {alert_url}
```
