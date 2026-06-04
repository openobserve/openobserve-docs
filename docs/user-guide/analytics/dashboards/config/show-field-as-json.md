---
title: Show Field as JSON Option in OpenObserve Dashboards
description: Learn how to use the Show Field as JSON option to render a field's value as structured, colored JSON in OpenObserve dashboard table panels.
---
This guide describes how to use the **Show Field as JSON** option in OpenObserve dashboards to render a field's value as structured, colored JSON in table panels. This setting improves readability when a field contains JSON data, such as logs-derived fields.

## Supported Panel Type
The **Show Field as JSON** setting is available only for the following panel type:

- Table

It applies to logs-derived fields added to a table panel.

---

## Configure the Show Field as JSON Option
To configure the **Show Field as JSON** option:

1. In the **Panel Editor**, select the **Table** panel type.
2. Add a field to the query using the query builder.
3. Locate the **Render Data as JSON / Array** toggle for that field. This per-field control is labeled **Render Data as JSON / Array** in the UI (internally referred to as the "show field as JSON" option).
4. Use the **Render Data as JSON / Array** toggle:

    - When enabled, the field's value is rendered as structured, colored JSON in the table panel. Values that are objects or arrays are formatted and color-coded for easier reading.
    - When disabled, the field's value is rendered as plain text.

---

## Default Behavior and Environment Variable
The default state of the **Render Data as JSON / Array** toggle is determined by the following environment variable:

```bash
ZO_DASHBOARD_SHOW_FIELD_AS_JSON_ENABLED=false  # default
```

- When set to `true`, the **Render Data as JSON / Array** toggle defaults to enabled for fields added in the **logs page** context (logs-derived table fields).
- When set to `false`, the **Render Data as JSON / Array** toggle defaults to disabled for those fields.

> This environment-variable-driven default applies only to fields added in the logs page context (logs-derived table fields). Fields added outside the logs context default to disabled regardless of the environment variable value. In all cases, you can manually change the setting for any field regardless of the environment variable value.

---

## Limitations
The **Show Field as JSON** option is supported only in **Table** panels and applies to logs-derived fields. Plain values that are not valid JSON objects or arrays are rendered as plain text even when the toggle is enabled.

## Next steps

- [Dashboard Configuration Overview](index.md): Browse all panel and chart configuration options for dashboards.
- [Pivot Table](pivot-table.md): Cross-tabulate data in Table panels using pivot mode.
- [Legend and Gridline](legend-and-gridline.md): Configure legend placement and gridlines on dashboard panels.
- [Dashboards in OpenObserve](../dashboards-in-openobserve.md): Learn how to create and manage dashboards.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
