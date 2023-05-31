# Kinesis Firehose

Amazon Cloudwatch and [many other AWS services](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html) can send logs to kinesis firehose which can be used for sending data to OpenObserve. You can find the complete list [here](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html).

Some of the AWS logs that can be sent to Kinesis firehose are: Amazon Cloudwatch, Amazon Virtual Private Cloud flow logs, AWS Network Firewall logs, AWS WAF logs.

You can configure Kinesis firehose to send logs to OpenObserve Cloud / OpenObserve using below details.

```yaml
HTTP endpoint: https://api.openobserve.ai/aws/org_name/stream_name/_kinesis_firehose
Access key: vhgjleGFtcGxlLmNvbTo2eUNsSW1HZXV4S3hZanJi
```

Access key is base64 encoded value of `userid:password`. e.g. If your user id is root@example.com and password is Complexpass#123 then the base64 encoded value is 

```bash
echo -n root@example.com:Complexpass#123 | base64
```
 which will give you

 `cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=`

 