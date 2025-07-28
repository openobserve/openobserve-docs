---
title: AWS EventBridge Logs Integration Guide
description: Stream AWS API activity logs to OpenObserve using CloudTrail, EventBridge, and Kinesis Firehose.
---

# Integration with AWS EventBridge

This guide explains how to *stream AWS management activity events* to OpenObserve using AWS CloudTrail, Amazon EventBridge, and Kinesis Firehose.

## Overview

Monitor and analyze AWS API activity (e.g., EC2 starts, IAM changes, S3 access) by routing events from **CloudTrail → EventBridge → Firehose → OpenObserve**.

- **CloudTrail** captures management-level API calls across AWS services
- **EventBridge** filters and routes specific CloudTrail events
- **Kinesis Firehose** delivers those events reliably to OpenObserve over HTTP

> **Note:** EventBridge *can* send events directly to OpenObserve using its HTTP target support.  
> However, we recommend using **Kinesis Firehose** in production for:
>
> - Built-in retry logic and failure handling
> - Optional S3 backup for undelivered events


## Steps to Integrate

??? "Prerequisites"
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../quickstart/#self-hosted-installation))
    - AWS account with:
        - CloudTrail enabled for management events
        - IAM permissions to create EventBridge rules and Firehose streams


??? "Step 1: Ensure CloudTrail Management Events Are Enabled"

    1. Go to **AWS Console → CloudTrail → Trails**
    2. Check if a trail exists that logs **management events**
    3. If not:
        - Click **Create trail**
        - Name the trail (e.g., `DefaultManagementTrail`)
        - Enable **Management events** (Read/Write or Write-only)
        - Choose an S3 bucket for storage (existing or new)
        - Complete the trail creation

    > CloudTrail acts as the *source* of API activity events across AWS.


??? "Step 2: Get OpenObserve Ingestion URL and Access Key"

    1. In OpenObserve: go to **Data Sources → Recommended → AWS**
    2. Copy the HTTP ingestion URL and Access Key

    ![Get OpenObserve Ingestion URL and Access Key](../images/aws-integrations/vpc-flow/fetch-url.png)

    > Example ingestion URL:
    > ```
    > https://<your-openobserve-domain>/aws/default/cloudtrail-events/_kinesis_firehose
    > ```


??? "Step 3: Create Firehose Delivery Stream to OpenObserve"

    1. In AWS Kinesis Firehose, Create delivery stream with Source: `Direct PUT` and Destination: `HTTP Endpoint`.
    2. Provide OpenObserve's HTTP Endpoint URL and Access Key, and set an S3 backup bucket.
    3. Give the stream a meaningful name and Create it.


??? "Step 4: Create EventBridge Rule to Forward CloudTrail Events"

    1. Go to **EventBridge > Rules** and click **Create rule**
    2. Name it (e.g., `ForwardCloudTrailEvents`)
    3. Choose:
        - **Event Source**: `AWS events or EventBridge partner events`
        - **Event Pattern**:
        ```json
        {
          "source": ["aws.cloudtrail"],
          "detail-type": ["AWS API Call via CloudTrail"]
        }
        ```
    4. Set the target to **Kinesis Firehose** and choose the delivery stream
    5. Click **Create rule**


??? "Step 5: Verify Logs in OpenObserve"

    1. Go to **Logs** → select your log stream → Set time range → Click **Run Query**
    2. You should see logs like:
    ```json
    {
      "eventSource": "ec2.amazonaws.com",
      "eventName": "StartInstances",
      "userIdentity": { ... },
      "awsRegion": "us-east-1",
      ...
    }
    ```


??? "Troubleshooting"

    **No logs appearing in OpenObserve?**

    - CloudTrail:
        - Ensure management events are enabled and recent API activity has occurred.  

    - EventBridge:
        -  Confirm the rule is matching events.  
        - Check the Monitoring tab for recent invocations or matched event counts.

    - Firehose:
        -  Verify the delivery stream is active and error-free.
        - Review the Monitoring tab and look for failed deliveries.  
    
    - OpenObserve:
        - Confirm the HTTP ingestion URL and access key are correct.
        - In the Logs view, select the correct stream and expand the time range to view recent data.


