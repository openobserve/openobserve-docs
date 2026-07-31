---
title: Amazon Virtual Private Cloud
metaTitle: AWS VPC Flow Logs Monitoring - Network Traffic and Security Analysis | OpenObserve
description: "Send AWS VPC Flow Logs to OpenObserve with Kinesis Firehose for network traffic analysis, security monitoring, and cloud network visibility."
---

# AWS VPC Flow Logs Monitoring - Network Traffic & Security Analysis

Monitor AWS VPC network traffic with comprehensive VPC Flow Logs monitoring for network traffic analysis, security monitoring, and network visibility. This guide explains how to stream AWS VPC Flow Logs directly to OpenObserve using Amazon Kinesis Firehose for AWS network monitoring, cloud security, and network performance analysis.

## Overview
Capture and forward AWS VPC Flow Logs to OpenObserve via Kinesis Firehose for real-time network visibility, network traffic monitoring, and security analysis.

## Steps to Integrate

:::accordion[Prerequisites]
- OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../getting-started.md#self-hosted-installation))
- AWS account with access to VPC and Firehose
- S3 bucket for failed log backup (recommended)
:::

:::accordion[Step 1: Get OpenObserve Ingestion URL and Access Key]

1. In OpenObserve: go to **Data Sources → Recommended → AWS**
2. Copy the ingestion URL and Access Key

![Get OpenObserve Ingestion URL and Access Key](../../images/aws-integrations/vpc-flow/fetch-url.png)

> Update the URL to have the stream name of your choice:
    ```
    https://<your-openobserve-domain>/aws/default/<stream_name>/_kinesis_firehose
    ```
:::

:::accordion[Step 2: Create Firehose Delivery Stream]

1. In AWS Kinesis Firehose, Create delivery stream with Source: `Direct PUT` and Destination: `HTTP Endpoint`.
2. Provide OpenObserve's HTTP Endpoint URL and Access Key, and set an S3 backup bucket.
3. Give the stream a meaningful name and Create it.

<img src="../../images/databases/firehose-stream.png" alt="Create Firehose Delivery Stream" style="height:800px">
:::
   
:::accordion[Step 3: Enable VPC Flow Logs]

1. Go to **VPC → Your VPC → Flow Logs → Create Flow Log**
2. Set:
    - Filter: `All`
    - Destination: `Kinesis Data Firehose`
    - Delivery stream: Select the stream you created in step 2
    - Log format: `All fields`
3. Create the flow log

    <img src="../../images/aws-integrations/vpc-flow/vpc-flowlog.png" alt="Create Flow Log" style="height:800px">
:::

:::accordion[Step 4: Verify Logs in OpenObserve]

1. Go to **Logs** → select your log stream → Set time range → Click **Run Query**

    ![Verify Logs in OpenObserve](../../images/aws-integrations/vpc-flow/logs-stream.png)
:::


:::accordion[Troubleshooting]

**No logs?**

- Ensure Firehose is `ACTIVE` and logs are reaching it
- Check S3 bucket for failed deliveries
- Confirm URL and Access Key are correct
:::


