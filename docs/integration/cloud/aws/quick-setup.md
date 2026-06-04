---
title: Complete AWS Integration (Quick Setup) | OpenObserve
description: Deploy monitoring for all your AWS services from OpenObserve using the Quick Setup wizard. Supports single-region CloudFormation deployments and multi-region CloudFormation StackSets.
---

# Complete AWS Integration (Quick Setup)

The Complete AWS Integration wizard lets you deploy monitoring for all your selected AWS services from within OpenObserve, without hand-editing CloudFormation parameters.

## Overview

The Quick Setup wizard collects your service selections and OpenObserve credentials, then opens the AWS Console with the correct CloudFormation template and parameters in place. It supports two deployment modes:

- **Single Region**: Deploys one CloudFormation stack in a region you choose. All parameters, including your OpenObserve endpoint and access key, are pre-filled automatically. This is the fastest path for most accounts.
- **Multi-Region (StackSets)**: Deploys the same configuration across many regions at once using AWS CloudFormation StackSets. Because the StackSets console does not support URL pre-fill, the wizard shows a copy-paste parameter helper to complete the AWS console steps.

In both modes, you choose which AWS services to monitor (CloudTrail, CloudWatch Logs, CloudWatch Metrics, VPC Flow Logs, WAF, ALB, API Gateway, RDS, S3 Access Logs, CloudFront, Route 53, DynamoDB, EC2, EventBridge, Kinesis, and Cognito). Each selected service maps to an `Enable...` parameter in the underlying template.

The deployment region is now selectable across 31 AWS regions, including both AWS GovCloud (US) regions. Earlier versions hardcoded `us-east-1`.

### When to use each mode

| Mode | Use when |
|------|----------|
| **Single Region** | You collect logs and metrics from resources in a single region, or you want the quickest setup with parameters pre-filled. |
| **Multi-Region (StackSets)** | You operate in multiple regions and want to roll out the same monitoring configuration to all of them in one operation. |

## Single Region setup

Use this mode to deploy a single CloudFormation stack in one region.

### Step 1: Open the Quick Setup wizard

In OpenObserve, navigate to the AWS integrations section and open **Complete AWS Integration**.

### Step 2: Select Single Region mode

Under **Deployment mode**, select **Single Region**. The wizard shows a single region picker and pre-fills all CloudFormation parameters automatically.

### Step 3: Select services to monitor

Expand **Select services to monitor** and check the services you want to collect data from. Use **Select all** or **Deselect all** to adjust quickly. You must select at least one service.

### Step 4: Choose the deployment region

Under **Deployment region**, select the AWS region where the stack will be created. All 31 supported regions are available, including AWS GovCloud (US-East) and AWS GovCloud (US-West).

### Step 5: Launch the stack

Click **Launch CloudFormation Stack**. OpenObserve opens the AWS Console in a new tab on the CloudFormation **Create stack** review page, with the template URL, your OpenObserve endpoint, access key, and the per-service enable flags pre-filled.

Review the parameters in the AWS Console, acknowledge the IAM capabilities, and create the stack.

## Multi-Region (StackSets) setup

Use this mode to deploy the same configuration across multiple regions using CloudFormation StackSets.

### Step 1: Select Multi-Region (StackSets) mode

Under **Deployment mode**, select **Multi-Region (StackSets)**. The wizard reveals the admin region, target regions, and deployment model controls.

### Step 2: Select services to monitor

Expand **Select services to monitor** and check the services you want to collect data from. You must select at least one service.

### Step 3: Choose the admin region

Under **Admin region**, select the region where the StackSet itself is managed. This is the region from which AWS coordinates the deployment, not necessarily a region where data is collected.

### Step 4: Select target regions

Expand **Target regions** and check every region where you want stacks deployed. Use **Select all** to target all supported regions or **Clear** to reset. You must select at least one target region.

### Step 5: Choose the deployment model

Under **Deployment model**, choose how StackSets manages permissions:

- **Self-managed**: Requires the `AWSCloudFormationStackSetAdministrationRole` and `AWSCloudFormationStackSetExecutionRole` IAM roles to exist in your account.
- **Service-managed (AWS Organizations)**: Uses AWS Organizations. Your account must be the management account or a delegated administrator account.

### Step 6: Open the StackSets console

Click **Open StackSets Console**. OpenObserve opens the AWS CloudFormation StackSets **Create StackSet** wizard in a new tab and displays a parameter helper.

### Step 7: Copy parameters into the AWS wizard

The StackSets console does not support pre-filled URLs, so the wizard shows a **Parameters to enter in the AWS wizard** panel. Each row has a **Copy** button. Copy these values into the matching fields as you proceed through the AWS console:

| Parameter | Description |
|-----------|-------------|
| **Amazon S3 URL (template)** | URL of the Complete AWS Integration CloudFormation template. |
| **TemplateS3Bucket** | S3 bucket that hosts the nested templates. |
| **TemplateS3Prefix** | Key prefix for the nested templates. |
| **OpenObserveEndpoint** | Your OpenObserve Kinesis Firehose ingestion endpoint. |
| **OpenObserveAccessKey** | Base64-encoded credential for ingestion. |
| **Enable...** flags | One value (`true` or `false`) per service, reflecting your selections. |

Complete the StackSets wizard in the AWS Console using the deployment model and target regions you selected, then create the StackSet.

## Notes

> **Note**: The wizard uses your current OpenObserve organization, user email, and ingestion passcode to build the endpoint and access key. If the launch button reports missing credentials, refresh the page and try again.

> **Tip**: Use **Single Region** for the fastest setup. Switch to **Multi-Region (StackSets)** only when you need the same configuration replicated across several regions.

> **Note**: Each selected service maps to an `Enable...` parameter (for example, **CloudTrail** maps to `EnableCloudTrail`). Services you leave unchecked are sent as `false`.

> **Warning**: CloudFormation StackSets and the related IAM roles require elevated permissions. For **Self-managed** deployments, create the `AWSCloudFormationStackSetAdministrationRole` and `AWSCloudFormationStackSetExecutionRole` roles before launching. For **Service-managed** deployments, run the wizard from your AWS Organizations management or delegated administrator account.

## Next steps

- [AWS integrations overview](index.md): Browse all AWS service integrations available in OpenObserve.
- [Amazon ALB logs](alb.md): Ingest Application Load Balancer access logs into OpenObserve.
- [Amazon CloudWatch Logs](cloudwatch-logs.md): Forward CloudWatch log groups to OpenObserve.
- [Log ingestion](../../../ingestion/index.md): Learn about the different ways to send data into OpenObserve.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
