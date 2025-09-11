---
title: Audit Trail in OpenObserve
description: >-
  Track all non-ingestion API activity in OpenObserve Enterprise using Audit
  Trail, with logs sent to a stream for dashboards and alerting.
---
# Audit Trail

> **Note:** This feature is applicable to the Enterprise Edition.

## What is Audit Trail
Audit Trail records user actions across all organizations in OpenObserve. It captures non-ingestion API calls and helps you monitor activity and improve security.

## Who can access it
All Enterprise Edition users with access to the `_meta` organization can use Audit Trail.

## Where to find it
Audit events are published into the `audit` stream under the `_meta` organization.

## Configuration
To enable and configure Audit Trail, set the following environment variables:

1. `O2_AUDIT_ENABLED`:

  - **Description:** Enables audit logging  
  - **Default:** `false`

2. `O2_AUDIT_BATCH_SIZE`:

  - **Description:** Number of audit records to batch before publishing  
  - **Default:** `500`

3. `O2_AUDIT_PUBLISH_INTERVAL`:

  - **Description:** Interval in seconds after which unpublished audits are published  
  - **Default:** `600`

## How it works
When Audit Trail is enabled, OpenObserve collects details of every non-ingestion API call made by users  across all organizations. These events are stored temporarily in memory. Once the number of events reaches the batch size or the publish interval is reached, they are sent to the `audit` stream in the `_meta` organization. From there, you can view, query, or use them in dashboards and alerts.

## Example
The following example shows a captured audit event from the `audit` stream:
![audit trail screenshot](../../images/audit.webp)

## Use case

Because audit events are stored in a log stream, you can:

- Build dashboards to track user activity
- Configure alerts to detect unusual trends