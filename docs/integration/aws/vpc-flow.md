---
title: AWS VPC Flow Logs Integration Guide
description: Stream AWS VPC Flow Logs to OpenObserve using Kinesis Firehose (no CloudWatch required). Direct setup for basic ingestion.
---

# Integration with AWS VPC Flow Logs
This guide explains how to stream VPC Flow Logs directly to OpenObserve using Amazon Kinesis Firehose.

## Overview
Capture and forward VPC Flow Logs to OpenObserve via Firehose for real-time network visibility.

## Steps to Integrate

??? "Prerequisites"
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../getting-started/#self-hosted-installation))
    - AWS account with access to VPC and Firehose
    - S3 bucket for failed log backup (recommended)

??? "Step 1: Get OpenObserve Ingestion URL and Access Key"

    1. In OpenObserve: go to **Data Sources → Recommended → AWS**
    2. Copy the ingestion URL and Access Key

    ![Get OpenObserve Ingestion URL and Access Key](../images/aws-integrations/vpc-flow/fetch-url.png)
    
    > Update the URL to have the stream name of your choice:
        ```
        https://<your-openobserve-domain>/aws/default/<stream_name>/_kinesis_firehose
        ```

??? "Step 2: Create Firehose Delivery Stream"
    
    1. In AWS Kinesis Firehose, Create delivery stream with Source: `Direct PUT` and Destination: `HTTP Endpoint`.
    2. Provide OpenObserve's HTTP Endpoint URL and Access Key, and set an S3 backup bucket.
    3. Give the stream a meaningful name and Create it.

    ![Create Firehose Delivery Stream](../images/aws-integrations/vpc-flow/firehose-stream.png){: style="height:800px"}
   
??? "Step 3: Enable VPC Flow Logs"

    1. Go to **VPC → Your VPC → Flow Logs → Create Flow Log**
    2. Set:
        - Filter: `All`
        - Destination: `Kinesis Data Firehose`
        - Delivery stream: Select the stream you created in step 2
        - Log format: `All fields`
    3. Create the flow log

        ![Create Flow Log](../images/aws-integrations/vpc-flow/vpc-flowlog.png){: style="height:800px"}

??? "Step 4: Verify Logs in OpenObserve"

    1. Go to **Logs** → select your log stream → Set time range → Click **Run Query**

        ![Verify Logs in OpenObserve](../images/aws-integrations/vpc-flow/logs-stream.png)


??? "Troubleshooting"

    **No logs?**

    - Ensure Firehose is `ACTIVE` and logs are reaching it
    - Check S3 bucket for failed deliveries
    - Confirm URL and Access Key are correct


