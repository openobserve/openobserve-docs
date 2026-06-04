---
title: Azure Activity Logs Integration | OpenObserve
description: Stream Azure subscription Activity Logs to OpenObserve using the in-product Deploy to Azure flow. Deploy Event Hub infrastructure with an ARM template, then configure diagnostic settings via the Azure Portal or Azure CLI.
---

# Azure Activity Logs

Stream your Azure subscription Activity Logs to OpenObserve through an Azure Event Hub. OpenObserve deploys the required Event Hub infrastructure with an ARM template, then you configure Azure to export Activity Logs to it.

## Overview

Azure Activity Logs record subscription-level events such as administrative operations, service health notifications, security events, and policy changes. This integration delivers those logs to OpenObserve so you can store, search, and visualize them alongside your other observability data.

The integration uses a two-step, in-product flow:

1. **Deploy the Event Hub infrastructure** using an ARM template. This creates an Event Hub namespace, an Event Hub, and the supporting resources that receive your logs and forward them to OpenObserve.
2. **Configure diagnostic settings** so Azure streams Activity Logs to the Event Hub created in Step 1. You can do this through the Azure Portal or with a generated Azure CLI command.

Azure integration tiles in OpenObserve show a **Deploy** button for any service that exposes an ARM template. The Activity Logs tile uses this Deploy button to launch the flow described below.

## Prerequisites

- An Azure subscription with permission to create resources and configure diagnostic settings.
- Permission to deploy ARM templates into a resource group.
- An OpenObserve account. The flow uses your current organization, user email, and ingestion passcode to build the ingestion endpoint and access key.
- For the Azure CLI option, the Azure CLI installed and authenticated (`az login`).

## Step 1: Deploy the Event Hub infrastructure

This step deploys the ARM template that creates the Event Hub namespace, Event Hub, and all required resources in your Azure subscription.

1. In OpenObserve, open the Azure integrations section and locate the **Azure Activity Logs** tile or page.
2. Click **Deploy to Azure**.
3. OpenObserve opens the Azure Portal custom-deployment page in a new tab, with the template and your OpenObserve ingestion endpoint and access key pre-filled.
4. Select the subscription and resource group, review the parameters, and start the deployment.
5. Wait for the deployment to complete. The created resources use the `o2-activity` prefix, which helps you identify the Event Hub namespace and Event Hub in the next step.

> **Note**: The OpenObserve endpoint used by this integration is your Event Hub ingestion URL in the form `<endpoint>/azure/<organization>/default/_event_hub`. The access key is a Base64-encoded credential derived from your email and ingestion passcode.

## Step 2: Configure diagnostic settings

After the ARM deployment completes, route Activity Logs to the Event Hub that was created. Choose either the Azure Portal or the Azure CLI.

### Option A: Azure Portal

1. Go to **Azure Portal > Subscriptions > your subscription**.
2. Click **Activity log** in the left menu.
3. Click **Export Activity Logs** (or **Diagnostic settings > + Add diagnostic setting**).
4. Enter a name and check the log categories you want to enable.
5. Under **Destination details**, choose **Stream to an event hub**.
6. Select the Event Hub namespace and Event Hub created in Step 1 (prefix: `o2-activity`).
7. Click **Save**.

### Option B: Azure CLI

OpenObserve generates an Azure CLI command from your inputs:

1. Select the log categories to enable. Available categories are **Administrative**, **Security**, **Service Health**, **Alert**, **Recommendation**, **Policy**, **Autoscale**, and **Resource Health**. Use **Select all** or **Clear** to adjust. You must select at least one category.
2. Enter the **Resource Group** that holds the Event Hub infrastructure (for example, `rg-openobserve-activity-logs`).
3. Enter a **Deployment Name** (for example, `o2-activity-20260420`).
4. Copy the generated command and run it after the ARM deployment completes:

```bash
curl -s https://raw.githubusercontent.com/openobserve/o2-datasource/main/azure/azure_activity_logs/configure-diagnostic-settings.sh | bash -s -- \
  --resource-group "rg-openobserve-activity-logs" \
  --deployment-name "o2-activity-20260420" \
  --categories "Administrative,Security,ServiceHealth,Alert,Recommendation,Policy,Autoscale,ResourceHealth"
```

The command configures the diagnostic setting that streams the selected Activity Log categories to the Event Hub created in Step 1.

## Notes

> **Note**: Azure integration tiles show a **Deploy** button only for services that expose an ARM template. Services without an ARM template show a **Documentation** button instead.

> **Tip**: Complete Step 1 before Step 2. The diagnostic setting must reference the Event Hub namespace and Event Hub that the ARM deployment creates.

> **Note**: OpenObserve also shows a manual configuration reference containing the Event Hub ingestion endpoint and access-key placeholder, for setups configured outside the Portal or CLI flows.

> **Warning**: Deploying the ARM template and configuring diagnostic settings require sufficient Azure permissions on the subscription and resource group. If the deploy step reports missing credentials, refresh the OpenObserve page and try again.

## Next steps

- [Azure integrations overview](index.md): See all Azure services you can connect to OpenObserve.
- [AWS integrations](../aws/index.md): Explore equivalent integrations for Amazon Web Services.
- [Integrations overview](../../index.md): Browse all available OpenObserve integrations.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
