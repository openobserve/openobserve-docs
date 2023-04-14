# Kinesis Firehose

Amazon Cloudwatch and [many other AWS services](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html) can send logs to kinesis firehose which can be used for sending data to ZincObserve. You can find the complete list [here]((https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html)).

Some of the AWS logs that can be sent to Kinesis firehose are: Amazon Cloudwatch, Amazon Virtual Private Cloud flow logs, AWS Network Firewall logs, AWS WAF logs.

You can configure Kinesis firehose to send logs to Zinc Cloud / Zinc Observe using below details.

```yaml
HTTP endpoint: https://api.zinc.dev/aws/org_name/stream_name/_kinesis_firehose
Access key: vhgjleGFtcGxlLmNvbTo2eUNsSW1HZXV4S3hZanJi
```

