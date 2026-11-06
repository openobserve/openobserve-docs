---
title: Reports Overview
description: Reports schedule recurring PDF, PNG, or CSV exports of OpenObserve dashboards, delivered by email with folders, inline or file attachments, and custom sizes.
---

The Reports section allows users to create and manage recurring reports from dashboard visualizations. Reports can be configured as either Scheduled or Cached.

To open reports, go to **Dashboards > Reports** in the left navigation. The **Reports** page has three tabs: **Scheduled**, **Cached**, and **History**. Click **New report** to create one.

## Organize reports into folders

Reports can be organized into folders. Every report belongs to a folder, and a report that is not assigned to a specific folder lives in the **default** folder.

To create a folder:

1. Open the **Reports** page.
2. In the **Folders** panel, select the **+** (plus) icon.
3. Enter a name for the folder and save it.

To work with reports across folders:

- In the search field, choose **This folder** or **All folders** to search the current folder or every folder.
- To move a report to a different folder, select the report and use **Move to Folder**.

:::note[Note]
A report's folder is set when the report is created. You cannot change a report's folder while editing the report; use the move option instead.
:::

## Configure the report format

When you create or edit a report, you can control how the report is generated and delivered.

**Report Type**

- **PDF (default)**: generates a multi-page PDF of the dashboard.
- **PNG (Image)**: captures an image of the dashboard. PNG captures only the first visible page. To include multiple pages, use PDF.
- **CSV (Data)**: exports the underlying panel data as CSV rather than a rendered image of the dashboard.

**Attachment Style**

- **Standard — downloadable attachment (default)**: the report is delivered as a file attached to the email.
- **Inline — embedded in email body**: the report image is embedded inline in the email body.

**Custom Dimensions (Advanced)**

You can optionally set **Width (px)** and **Height (px)** for the generated output. If these fields are left blank, the server default dimensions are used.

:::note[Note]
**Attachment Style** and **Custom Dimensions (Advanced)** apply only to **PDF** and **PNG** reports. They are hidden for **CSV (Data)** reports.
:::

**Dashboard preview**

When every dashboard in the report is a PDF, you can select **Include inline dashboard preview image**. The email body then embeds a PNG screenshot of the dashboard alongside the PDF attachment.

:::note[Note]
The **Inline** attachment style is only available for **PNG** reports. It is disabled for **PDF** reports, which use the **Standard** style.
:::

## Report frequency

Reports can run on a recurring schedule (**Hourly**, **Daily**, **Weekly**, **Monthly**, **Custom**, or a **Cron Job** expression), or run a single time. A report configured with the **Once** frequency runs a single time and is then automatically paused (disabled). Re-enable it, or use a recurring frequency, to run it again.

## Run history

Click a report in the list to open its page, which has a **History** tab with its runs and a **Configuration** tab with its settings. The **History** tab on the Reports page lists runs across all reports. Each run shows its status (**Sent**, **Cached**, **Failed**, or **Skipped**), trigger, recipients, and timing; open a run for its delivery and timing details.

Click **Run now** to send a report immediately with the current data. A cached report warms the dashboard cache and sends no email.