---
title: AWS RDS Database Monitoring - MySQL, PostgreSQL Database Logs | OpenObserve
description: Complete AWS RDS database monitoring guide for collecting MySQL and PostgreSQL database logs, slow query logs, and error logs via CloudWatch and Kinesis Firehose for database performance monitoring.
---

# AWS RDS Database Monitoring - MySQL & PostgreSQL Log Collection

Monitor AWS RDS databases with comprehensive database monitoring for Amazon RDS MySQL and PostgreSQL. This guide explains how to stream Amazon RDS database logs (slow query logs, general logs, and error logs) into OpenObserve using CloudWatch Logs and Kinesis Firehose for database performance monitoring and database observability.

## Overview

Amazon RDS database logs can be exported to CloudWatch Logs for database monitoring. Stream RDS logs to OpenObserve using Kinesis Firehose with an HTTP endpoint for real-time database log monitoring, database performance analysis, and alerting based on RDS database behavior.

![Amazon RDS Logs to Openobserve via CloudWatch](../images/aws-integrations/rds/architecture.png)

## Steps to Integrate

??? "Prerequisites"
    - OpenObserve account ([Cloud](https://cloud.openobserve.ai/web/) or [Self-Hosted](../../../getting-started/#self-hosted-installation))
    - Amazon RDS instance with log exports enabled
    - AWS permissions for RDS, CloudWatch Logs, IAM, and Kinesis Firehose
    - S3 bucket for Firehose backup (recommended)

??? "Step 1: Get OpenObserve Ingestion URL and Access Key"

    1. In OpenObserve: go to **Data Sources → Recommended → AWS**
    2. Copy the ingestion URL and Access Key

    ![Get OpenObserve Ingestion URL and Access Key](../images/aws-integrations/vpc-flow/fetch-url.png)
    
    > Update the URL to have the stream name of your choice:
        ```
        https://<your-openobserve-domain>/aws/default/<stream_name>/_kinesis_firehose
        ```

??? "Step 2: Enable RDS Log Exports"

    1. Go to **RDS → Databases → Your DB Instance → Modify**
    2. Scroll to **Log exports**, and enable:
        - `error/mysql`
        - `general/mysql`
        - `slowquery/mysql`
        > Different database engines in Amazon RDS support different log export options. When enabling log exports, you’ll only see options supported by your selected engine.
    3. Save and apply changes (immediately or during the next maintenance window)

    ![Enable RDS Log Exports](../images/aws-integrations/rds/schedule-modification.png)

??? "Step 3: Locate RDS Log Groups in CloudWatch"

    1. Go to **CloudWatch → Logs → Log groups**
    2. Find log group like: `/aws/rds/instance/<db-name>/<log_group_name>`

??? "Step 4: Create a Firehose Delivery Stream"

    1. In AWS Kinesis Firehose, Create delivery stream with Source: `Direct PUT` and Destination: `HTTP Endpoint`.
    2. Provide OpenObserve's HTTP Endpoint URL and Access Key, and set an S3 backup bucket.
    3. Give the stream a meaningful name and Create it.

    ![Create Firehose Stream](../images/aws-integrations/rds/firehose-stream.png){: style="height:800px"}

??? "Step 5: Create Log Subscription Filter"

    1. In **CloudWatch Logs → Log Groups**, select the RDS log group
    2. Click **Actions → Create subscription filter**
        ![Subscription Filter](../images/aws-integrations/rds/subscription-filter.png)
    3. Choose:
        - Destination: `Kinesis Firehose`
        - Delivery stream: select the one you created
    4. Leave filter pattern blank to capture all logs
    5. Click **Start streaming**

    ![Subscription Filter](../images/aws-integrations/rds/filter.png){: style="height:800px"}

??? "Step 6: Verify Logs in OpenObserve"

    1. Go to **Logs** → select your log stream → Set time range → Click **Run Query**

    ![Verify Logs in OpenObserve](../images/aws-integrations/rds/verify-logs.png)

??? "Troubleshooting"

    **No logs?**
    
    - Check if RDS logs are correctly configured and reaching CloudWatch
    - Confirm the subscription filter is active and pointing to the correct Firehose stream
    - Ensure the Firehose stream is delivering logs successfully
    - Verify the OpenObserve ingestion URL and access key
    - Review your S3 backup bucket for failed logs
