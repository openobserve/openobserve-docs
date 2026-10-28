---
title: Cloud Usage
description: Monitor and control your OpenObserve Cloud spend with the Usage page, which breaks down costs by meter, trends, budgets, and price estimation.
---

# Cloud Usage

The **Usage** page in OpenObserve Cloud shows how much your organization is spending in the current billing cycle, which meters drive that cost, and how your spend is trending. It also lets you set budgets with email alerts and estimate what a future workload would cost.

:::info[Availability]
The Usage page is available only in OpenObserve Cloud, and is currently in beta. Cost figures come from Stripe, so an organization billed through Stripe sees the full page; an organization without a bill sees a volume-only view.
:::

## Access the Usage page

Select **Billing** in the left navigation, then select the **Usage** tab. An organization billed through Stripe sees four tabs:

- **Overview**: the current cycle's cost, per-meter breakdown, and daily chart.
- **Trends**: cost and volume over a time range of your choice.
- **Budget**: a budget and warning level for the cycle, with optional email alerts.
- **Price Estimation**: the estimated monthly cost of a workload you describe.

An organization with no bill sees only **Overview**, as a volume-only view of the last 30 days. A member of a billing group sees a banner naming the organization that pays its bill, and the same volume-only view; costs and budgets are on the paying organization's Usage page.

## Overview tab

The **Overview** tab is the landing view. It shows the current billing cycle, a set of key figures, and a cost breakdown you can drill into.

### Cycle header and key figures

The header shows the billing cycle date range and the current day within the cycle (for example, **Day 12 of 30**), plus a refresh button. If a refresh fails, the numbers already on screen stay in place and a banner says they are from the last load. Below the header, KPI cards summarize the cycle:

- **Cost So Far**: the billed cost for the current cycle. When a discount applies, the gross cost is shown struck through.
- **Projected Total**: the cycle's projected cost at the current pace. Early in the cycle it reads **Too early in the cycle to project**.
- **Top Meter**: the meter with the highest cost and its share of the bill.
- **Discount**: the discount applied this cycle, shown only when one applies.

If any meter could not be priced, a warning banner lists the affected meters, and their rows show a dash instead of a cost.

### Cost breakdown

The **Cost Breakdown** section shows how the cycle's cost is distributed. A colored bill strip shows each meter's share of the bill, and a table lists every meter, most expensive first, with its volume and rate, any discount, its billed cost, and its share of the bill. Meters with no usage this cycle read $0.00.

Select a meter to see what drives its cost: the streams, users, alerts, dashboards, pipelines, destinations, incidents, or synthetic checks behind it, with a **Group by** selector where more than one grouping applies, and a daily chart alongside.

For an organization that pays for a billing group, the section also shows each member organization's cost. Select an organization to see its meters, then select a meter to drill further.

## Trends tab

The **Trends** tab plots cost and volume over time and ranks each meter's contribution over the selected range. Daily charts need usage reporting; if it is off, the tab offers an **Enable usage reporting** button, which starts recording your organization's usage to its own stream.

Use the range presets (**Current Cycle**, **Last Cycle**, **Last 90 Days**) or the date picker for a custom range. The picker starts at the oldest billing cycle that has usage data. For an organization that pays for a billing group, an **Organization** selector narrows every figure to a single member.

In the chart pane, switch between **Cost** and **Volume**. In the cost view, turn on **Forecast** to project the rest of the current cycle. The **Usage by Meter** list shows each meter's cost for the range and its share of the total; select a meter to show only that meter in the chart.

## Budget tab

The **Budget** tab compares spend against a budget you set for the billing cycle, and emails administrators once spend passes the warning level.

Under **Budget Settings**, set the **Budget for this billing cycle**, a **Warn at** level (a dollar amount or a percent of the budget), and whether **Email alerts** are on, then select **Save Settings**. The **Spend Against Budget** panel shows how much has been spent, how much is left, and each meter's share of the budget.

For an organization that pays for a billing group, the tab lists every member organization with its spend this cycle, status, and its own budget, warning level, and email alerts switch, plus an **Overall Budget** for the whole group's bill. Select **Save Changes** to commit all pending edits at once.

Budgets can be set only for organizations billed through Stripe. The budget amount and warning level must be greater than zero, and the warning level cannot exceed the budget.

## Price Estimation tab

The **Price Estimation** tab estimates what a workload would cost per month, at list price. The estimate does not include any discount on your account.

Under **Start From**, pick **My Current Usage**, **2× Growth**, or **5× Growth**, or enter your own figures. The **Expected Monthly Usage** fields include data ingested per month, searches per month, data scanned per search, pipelines running on streams, how long data is kept, AI credits per month, and synthetics browser and API checks. Most fields have a slider. The **Assumptions** menu holds inputs such as the average data per stream. The **Your Estimate** panel shows a line per meter and the **Estimated total** per month. Select **Reset** to return to the starting figures.

## Meters

Cost is metered across the following meters, each with its own unit and rate:

| Meter | What it measures | Unit |
|-------|------------------|------|
| **Ingestion** | Data ingested | GB |
| **Search** | Data scanned by searches | GB |
| **Pipelines** | Data processed by pipelines | GB |
| **Remote Pipelines** | Data sent to remote destinations | GB |
| **Data Retention** | Data stored over time | GB-hour |
| **AI credits** | AI chat and incident analysis usage | Credit |
| **Synthetics (Browser)** | Browser synthetic check step runs | Run |
| **Synthetics (Protocol)** | API synthetic check runs | Run |

For more on AI credits, see [AI Credits (Cloud)](cloud-ai-credits.md).

## Budget email notifications

OpenObserve checks budgets every hour. Once the cycle's estimated cost reaches the warning level, it emails every user with the Admin role in the organization, and keeps sending notifications for the rest of the billing cycle while spend stays above the warning level. Turn off **Email alerts** on the **Budget** tab to pause them.

The email states the budget, the warning level as an amount and a percentage of the budget, the current estimated cost and the percentage of budget it represents, and the billing cycle dates in UTC.
