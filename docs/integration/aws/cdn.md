---
title: AWS CloudFront Logs Integration Guide
description: Stream CloudFront access logs to OpenObserve using Amazon Kinesis Streams and Firehose for real-time observability.
---

# Integration with Amazon CloudFront Logs

This guide explains how to stream Amazon CloudFront access logs into OpenObserve using Amazon Kinesis Data Streams and Firehose for near real-time analysis.

## Overview

Amazon CloudFront access logs capture details about every user request, such as request time, edge location, URL path, response code, and user agent. These logs are typically stored in S3, but by streaming them through Kinesis and Firehose, you can ingest them directly into OpenObserve for visualization, filtering, and alerting.

## Steps to Integrate

??? "Prerequisites"
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../quickstart/#self-hosted-installation))
    - Amazon CloudFront distribution
    - AWS account with access to Kinesis, Firehose, and S3
    - S3 bucket for CloudFront access logs
    - S3 bucket for failed Firehose deliveries (optional but recommended)

??? "Step 1: Enable Access Logging in CloudFront"

    1. Go to **CloudFront → Your Distribution → Edit**
    2. Under **Logging**, enable:
        - Logging: `Enabled`
        - Bucket: Choose your S3 bucket (e.g., `cloudfront-logs-bucket`)
        - Log prefix: (optional, e.g., `logs/`)

    3. Save changes

    ![Enable CloudFront Logs](../images/aws-integrations/cloudfront/enable-logging.png)

??? "Step 2: Create a Kinesis Data Stream"

    1. Go to **Kinesis → Data Streams → Create data stream**
    2. Set a name, e.g., `cloudfront-stream`
    3. Set the number of shards based on expected traffic (1 is usually fine for starters)
    4. Click **Create data stream**

    ![Create Kinesis Stream](../images/aws-integrations/cloudfront/kinesis-stream.png)

??? "Step 3: Set Up AWS Glue or Lambda to Parse and Push Logs"

    (Optional for advanced users) You may use AWS Glue or a custom parser if CloudFront logs need transformation before Firehose. However, if you emit logs in raw format, you can proceed without this step.

??? "Step 4: Create a Kinesis Firehose Delivery Stream"

    1. Go to **Kinesis → Delivery Streams → Create delivery stream**
    2. Source: `Kinesis Data Stream`
    3. Choose the stream created in Step 2 (`cloudfront-stream`)
    4. Destination: `HTTP Endpoint`
    5. Endpoint URL:

        ```
        https://<your-openobserve-domain>/aws/default/cloudfront_logs/_kinesis_firehose
        ```

    6. HTTP header:
        ```
        Authorization: Bearer <your-openobserve-access-key>
        ```

    7. (Recommended) Enable S3 backup and choose a bucket

    8. Name the stream, e.g., `cloudfront-firehose`, and create it

    ![Firehose Setup](../images/aws-integrations/cloudfront/firehose-setup.png){: style="height:800px"}

??? "Step 5: Stream Logs from S3 to Kinesis Stream"

    Use an ingestion mechanism (like an S3 Event Trigger or scheduled AWS Glue job) to push CloudFront logs from S3 into the Kinesis stream created in Step 2. Each log line should be streamed as a record to Kinesis.

    - Format: CloudFront logs are space-delimited text lines.
    - Ensure the parser preserves raw text or converts each line into JSON before sending to Firehose.

??? "Step 6: Verify Logs in OpenObserve"

    1. Go to **Logs** in OpenObserve
    2. Select stream: `aws.default.cloudfront_logs`
    3. Run a query:

        ```sql
        SELECT timestamp, message
        FROM "aws.default.cloudfront_logs"
        ORDER BY timestamp DESC
        LIMIT 100
        ```

    ![Logs in OpenObserve](../images/aws-integrations/cloudfront/logs.png)

??? "Troubleshooting"

    **Not seeing logs?**
    
    - Verify CloudFront is writing logs to the expected S3 bucket
    - Ensure your S3-to-Kinesis process is pushing data correctly
    - Check that Firehose is active and the delivery stream is connected
    - Confirm the OpenObserve URL and Access Key are valid
    - Review S3 backup bucket for failed deliveries
