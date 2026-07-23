---
description: "Cross-Linking creates drill-down links from log records, trace records, and dashboard panels to external URLs using templates that substitute field values."
---

# Cross-Linking

Cross-Linking lets you define drill-down links that take you from a log or trace record, or a dashboard panel, directly to an external URL. Use it to connect OpenObserve data with related systems such as APM tools, ticketing systems, runbooks, or internal dashboards.

## Overview

Cross-Linking turns field values in your records into actionable navigation. You define a link once with a URL template, and OpenObserve renders that link wherever the matching data appears. When you open the link, OpenObserve substitutes template variables with the actual field name, field value, time range, and query from the current context.

Cross-Linking is useful for teams that operate across multiple tools. For example, a link can carry a `trace_id` from a log record to an external tracing UI, or send a `host` value to an infrastructure dashboard, all without manual copy-paste.

You can define links at two levels: organization-level links that apply across the organization, and stream-level links that apply to a specific stream. Links appear in the drill-down menu on log and trace records, in the log detail view, and on dashboard panels.

## Key features

### Two configuration levels

Cross-Linking supports two scopes, so you can keep broad links central while still tailoring links per stream.

- **Organization-level links**: Apply across the organization. Configure them in **Organization Settings**.
- **Stream-level links**: Apply only to a specific stream. Configure them in **Stream Details**.
- **Priority**: When a stream-level link and an organization-level link overlap, the stream-level link takes priority.

### Conditional display with trigger fields

You can attach trigger **Fields** to a link to control when it appears. The link shows only when at least one of the listed fields is present in the record. If you leave **Fields** empty, the link always shows.

### Dynamic URL templates

Each link uses a URL template with variables that OpenObserve replaces at click time, so a single link works across many records and time ranges.

## Getting started

### Prerequisites

- Cross-Linking must be enabled on the server. Set the environment variable `ZO_ENABLE_CROSS_LINKING=true`. The default is `false`, which hides all Cross-Linking configuration and links.
- You need data ingested into the relevant stream so that field values are available for substitution.
- You need permission to edit **Organization Settings** (for org-level links) or **Stream Details** (for stream-level links).

### Enabling Cross-Linking

Set the following environment variable on your OpenObserve deployment and restart:

```
ZO_ENABLE_CROSS_LINKING=true
```

| Setting | Description | Default |
|---------|-------------|---------|
| `ZO_ENABLE_CROSS_LINKING` | Enables the Cross-Linking feature, including configuration UI and rendered links | `false` |

## How to create an organization-level link

Organization-level links apply across the whole organization.

### Step 1: Open organization settings

Go to **Organization Settings** and open the **Parameters** section.

### Step 2: Add a cross-link

In the **Cross-Linking** area, add a new link and fill in the fields:

- **Name**: A display name for the link. This field is required and accepts a maximum of 256 characters.
- **URL template**: The target URL with template variables. This field is required. See [URL template variables](#url-template-variables).
- **Fields**: Optional trigger fields. The link shows only when at least one of these fields is present in the record. Leave empty to always show the link.

### Step 3: Save

Save the settings. The link becomes available wherever its conditions match.

## How to create a stream-level link

Stream-level links apply only to the selected stream and take priority over organization-level links.

### Step 1: Open stream details

Navigate to the stream, open **Stream Details**, and select the **Cross-Linking** tab.

### Step 2: Add a cross-link

Add a new link and fill in the same fields as for an organization-level link:

- **Name**: Required, maximum 256 characters.
- **URL template**: Required URL with template variables.
- **Fields**: Optional trigger fields that control when the link appears.

### Step 3: Save

Save the stream settings. The link is now active for records and panels backed by this stream.

> **Note**: If a stream-level link and an organization-level link target the same context, OpenObserve uses the stream-level link.

## URL template variables

Use these variables in the **URL template**. OpenObserve replaces them with values from the current record and query when you open the link.

| Variable | Description |
|----------|-------------|
| `${field.__name}` | The name of the field the link is opened from |
| `${field.__value}` | The value of the field the link is opened from |
| `${start_time}` | Start of the selected time range, in epoch milliseconds |
| `${end_time}` | End of the selected time range, in epoch milliseconds |
| `${query}` | The current search query |
| `${query_encoded}` | The current search query, Base64-encoded |

Example URL template:

```
https://example.com/trace/${field.__value}?from=${start_time}&to=${end_time}
```

> **Tip**: Use `${query_encoded}` when passing the query as a URL parameter to a system that expects an encoded value, and `${query}` when the target accepts the raw query string.

## Where links appear

When Cross-Linking is enabled and a link's conditions match, links appear in these places:

- **Drill-down menu** on log and trace records.
- **Log detail view**, when you expand an individual record.
- **Dashboard panels**, for panels backed by streams that have matching links.

## API reference

Cross-Linking links are stored alongside organization and stream settings:

- Organization settings include a `cross_links` array.
- Stream settings include a `cross_links` array.

Each entry contains a `name`, a `url` template, and an optional `fields` list of trigger fields.

The `result_schema` API accepts `cross_linking=true`. When set, the response includes a `cross_links` object that returns the applicable `stream_links` and `org_links` for the query, with template variables resolved against the query context.

## Best practices

- Keep **Name** values short and descriptive so links are easy to recognize in the drill-down menu.
- Add trigger **Fields** to links that only make sense for specific records, such as a tracing link that requires `trace_id`. This keeps menus clean.
- Use stream-level links for stream-specific destinations and organization-level links for shared, cross-cutting destinations.
- Use `${query_encoded}` for targets that parse the query from a URL parameter to avoid breaking the link with unencoded characters.

> **Note**: All Cross-Linking configuration and rendered links are hidden unless `ZO_ENABLE_CROSS_LINKING=true` is set on the server.

## Next steps

- [Logs](logs/logs.md): Explore log records where Cross-Linking drill-down links appear.
- [Traces](traces/traces.md): View trace records and follow cross-links to external tracing tools.
- [Streams](../streams.md): Configure stream-level settings, including stream-scoped cross-links.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
