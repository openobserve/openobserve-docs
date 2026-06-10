The Reports section allows users to create and manage recurring reports from dashboard visualizations. Reports can be configured as either Scheduled or Cached.

## Organize reports into folders

Reports can be organized into folders. Every report belongs to a folder, and a report that is not assigned to a specific folder lives in the **default** folder.

To create a folder:

1. Open the **Reports** page.
2. In the **Folders** panel, select the **+** (plus) icon.
3. Enter a name for the folder and save it.

To work with reports across folders:

- Use the search field together with the **All Folders** toggle to search for reports across all folders instead of only the currently selected folder.
- To move a report to a different folder, select the report and use the move option to assign it to the target folder.

!!! note
    A report's folder is set when the report is created. You cannot change a report's folder while editing the report; use the move option instead.

## Configure the report format

When you create or edit a report, you can control how the report is generated and delivered.

**Report Type**

- **PDF** (default): generates a multi-page PDF of the dashboard.
- **PNG image**: captures an image of the dashboard. PNG captures only the first visible page. To include multiple pages, use PDF.
- **CSV (Data)**: exports the underlying panel data as CSV rather than a rendered image of the dashboard.

**Email Attachment Style**

- **Inline**: the report image is embedded inline in the email body.
- **File attachment**: the report is delivered as a file attached to the email.

**Custom dimensions**

You can optionally set custom **width** and **height** values (in pixels) for the generated output. If these fields are left blank, the system default dimensions are used.

!!! note
    **Email Attachment Style** and **Custom dimensions** apply only to **PDF** and **PNG** reports. They are hidden and not available for **CSV (Data)** reports.

**Dashboard preview**

You can optionally include an inline preview image of the dashboard in the email body.

!!! note
    The **Inline** attachment style is only valid for **PNG** reports. Selecting **Inline** for a **PDF** report returns a save error. For PDF reports, use the **File attachment** style.

## Report frequency

Reports can run on a recurring schedule, or run a single time. A report configured with the **Once** frequency runs a single time and is then automatically paused (disabled). Re-enable it, or use a recurring frequency, to run it again.