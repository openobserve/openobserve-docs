---
title: Cloud Usage
description: Monitor and control your OpenObserve Cloud spend with the Usage page, which breaks down costs by meter, trends, budgets, and cost estimation.
---

# Cloud Usage

The **Usage** page in OpenObserve Cloud shows how much your organization is spending in the current billing cycle, which meters drive that cost, and how your spend is trending. It also lets you set budgets with email alerts and estimate what a future workload would cost.

:::note[Availability]
The Usage page is available in OpenObserve Cloud. Cost figures come from Stripe, so an organization billed through Stripe sees the full page; an organization without a bill sees a volume-only view based on its own usage stream. The page is currently in beta.
:::

## Access the Usage page

To open it, select **Billing** from the left navigation and then the **Usage** tab. The page has four tabs, which appear when your organization is billed through Stripe:

- **Overview** — the current cycle's cost, per-meter breakdown, and daily chart.
- **Trends** — cost and volume over any time range the metering data covers.
- **Budget** — set a budget and warning threshold, with optional email alerts.
- **Estimation** — model a future workload and estimate its monthly cost.

![TODO: screenshot of the Usage page Overview tab](images/placeholder.png)

An organization with no bill shows **Overview** only, in a volume-only view. A member of a billing group sees a banner naming the organization that pays its bill, and the same volume-only view.

## Overview tab

The **Overview** tab is the landing view. It shows the current billing cycle, a set of key figures, and a cost breakdown you can drill into.

### Cycle header and key figures

The header shows the billing cycle date range and the current day within the cycle, plus a **Refresh** button that reloads the bill without discarding the numbers already on screen. Below it, KPI cards summarize the cycle:

- **Cost so far** — the billed cost for the current cycle (with the gross cost shown struck through when a discount applies).
- **Projected total** — the cycle's projected cost at the current run rate, once enough of the cycle has passed.
- **Top meter** — the meter with the highest cost and its share of the total.
- **Discount** — the discount applied this cycle, shown only when one applies.

If any meter could not be priced, a warning banner lists the affected meters.

### Cost breakdown

The **Cost breakdown** section shows how the cycle's cost is distributed. A colored bill strip summarizes the share of each meter, and a table lists each meter with its gross cost, discount, and net (billed) cost, sorted from most to least expensive. Unused meters are folded away.

Select a meter to open its breakdown, which shows the streams, alerts, users, or other entities that drove its cost, with a **Group by** toggle to change the grouping and a daily chart alongside.

![TODO: screenshot of a meter breakdown drilldown on the Usage page](images/placeholder.png)

For an organization that bills a group, the same section instead shows each member organization's spend, and you can drill into an organization and then into its meters.

## Trends tab

The **Trends** tab plots cost and volume over time and ranks each meter's contribution over the selected range.

Use the range presets (**Current cycle**, **Last cycle**, **Last 90 days**) or the date picker for a custom range; the picker is limited to the period the metering data covers. For a group-billing organization, an organization selector narrows every figure to a single member.

In the chart pane, toggle between **Cost** and **Volume**, and enable **Forecast** to project the current cycle's cost. The right side lists each meter's cost for the range with a progress bar showing its share.

![TODO: screenshot of the Usage page Trends tab](images/placeholder.png)

## Budget tab

The **Budget** tab compares spend against a budget you set, and emails administrators as the budget approaches its warning threshold.

Set a **Budget amount**, a warning level (a dollar amount or percent of the budget), and whether **Email alerts** are enabled. The **Spend against budget** panel shows how much has been spent, how much remains, and each meter's share of the budget.

For an organization that bills a group, the tab shows a table of every member organization with its spend and an editable budget, warning level, and alerts toggle for each, plus a group-wide budget on the right. One **Save changes** bar commits all pending edits.

![TODO: screenshot of the Usage page Budget tab](images/placeholder.png)

Budget settings are stored per organization and apply only to organizations billed through Stripe. A budget amount or warning level must be greater than zero.

## Estimation tab

The **Estimation** tab estimates what a workload would cost per month, using the prices from your bill.

Start from a preset scenario (**Current**, **Twice current**, **Five times current**) or enter your own figures, then adjust fields such as ingestion per month, searches per month, data scanned per search, pipeline count, retention days, AI credits, and synthetics browser and API checks. Each field has a slider, and the **Assumptions** menu holds inputs such as the average stream size. The estimate panel shows a line per meter and the estimated monthly total.

![TODO: screenshot of the Usage page Estimation tab](images/placeholder.png)

## Meters

Cost is metered across the following meters, each with its own unit and rate:

| Meter | What it measures | Unit |
|-------|------------------|------|
| **Ingestion** | Data ingested into OpenObserve | GB |
| **Search** | Data scanned by search queries | GB |
| **Pipeline** | Data processed through pipelines | GB |
| **Remote pipeline** | Data sent to remote pipeline destinations | GB |
| **Retention** | Stored data over time | GB-hours |
| **AI credits** | AI chat and incident analysis usage | credits |
| **Synthetics browser** | Synthetics browser check steps | steps |
| **Synthetics protocol** | Synthetics API check steps | steps |

## Budget email notifications

When a budget is set, OpenObserve emails the organization's administrators as spend crosses the warning threshold, and continues to notify them until the end of the billing cycle. The email states the budget, warning level, current estimated cost, and the percentage of budget consumed, for the current billing cycle.

For a group-billing organization, a warning can be configured for the group total and for each member organization. You can pause notifications for any budget from the **Budget** tab.
