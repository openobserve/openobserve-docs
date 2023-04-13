# Ingest Amazon Cloudwatch logs in ZincObserve

ZincObserve can be utilized to analyze and search Cloudwatch logs which are used by most AWS services. If you wish to send your log data to ZincObserve, employing Cloudwatch subscription filters is the recommended solution.

You will need a publicly available HTTPS endpoint of ZincObserve for this. 

Below are the steps that you can follow:

1. Configure Kinesis firehose
1. Set up IAM policy and role for Cloudwatch to send logs to Kinesis Firehose
1. Set up cloudwatch subscription filter to send logs to Kinesis Firehose
1. Monitor and Analyze CloudWatch Logs in ZincObserve

## Step 1: Configure Kinesis firehose

1. Log in to AWS console.
1. Go to Kinesis Firehose
1. Click "Create delivery stream"
1. Choose source - Direct PUT and Desitnation - HTTP Endpoint
1. Enter the HTTP endpoint URL
    1. `https://observe.zinc.dev/aws/orgname/streamname/_kinesis_firehose` if you are using managed cloud service by Zinc Labs. You need to replace the orgname and stream name to appropriate values. You can get these from ZincObserve UI under Ingestion menu. 
    1. `https://yourdomain.com/aws/orgname/streamname/_kinesis_firehose` if you have hosting a ZincObserve installation yourself. Remember that if you are self hosting ZincObserve then your endpoint must be a publicly accessible HTTPS endpoint in order for Kinesis Firehose to send the data, 
1. You will also need to enter the `access key`. You can find the access key in ZincObserve UI under the ingestion menu
1. Click "Create delivery stream" to complete the setup.

## Step 2: Create an IAM policy and role to be used by Cloudwatch to send logs to Kinesis Firehose

1. Create an IAM policy by going to IAM > Policies > Create policy

```json linenums="1"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "firehose:DescribeDeliveryStream",
                "firehose:PutRecordBatch"
            ],
            "Resource": "*"
        }
    ]
}
```


1. Give the policy a name “firehose1”
2. Create an IAM Role by going to IAM > Roles > Create role
3. Select Custom trust policy and paste the following:

```json linenums="1"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudwatch.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        },
        {
            "Sid": "Statement2",
            "Effect": "Allow",
            "Principal": {
                "Service": "delivery.logs.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        },
        {
            "Sid": "Statement3",
            "Effect": "Allow",
            "Principal": {
                "Service": "logs.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

4. Select the policy “firehose1” and click Next
5. Give the IAM role the name “cloudwatch-to-firehose”


## Step 3: Create a CloudWatch Logs Subscription Filter

Now let’s go ahead and configure cloudwatch to send logs to Kinesis firehose. Follow these steps:

1. Navigate to the CloudWatch dashboard in the AWS Management Console.
1. Select "Logs" from the left-hand menu and choose the log group you want to send to ZincObserve.
1. Click the "Actions" dropdown menu and select "Subscription filters > Create Kinesis Firehose Subscription Filter"
1. Under destination, choose “Current account” and then choose the name of the firehose stream “‘zincobserve”
1. Under Grant permission choose “cloudwatch-to-firehose”
1. Click Start streaming

## Step 4: Monitor and Analyze CloudWatch Logs in ZincObserve

With your CloudWatch logs now flowing into ZincObserve via Kinesis Firehose, you can start using the platform's powerful search, analysis, and visualization features to gain insights from your log data:

1. Navigate to the ZincObserve UI > Logs
1. Select the appropriate stream
1. Use query editor to search for logs as usual
1. Navigate to Dashboards and build a new dashboard for your log data.
1. Set up alerts and notifications for potential issues in your AWS environment that you may need.

## Conclusion

Sending Amazon CloudWatch logs to ZincObserve is a straightforward process, thanks to Cloudwatch filters and the HTTP Endpoint destination of Kinesis Firehose. By following the steps outlined in this guide, you can easily send your CloudWatch logs to ZincObserve and make the most of its advanced search, analysis, and visualization features.



