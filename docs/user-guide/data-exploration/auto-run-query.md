# Auto Run

Auto Run automatically re-executes your search whenever you change a query input, so you see updated results without clicking **Run query**. It is available on the **Logs** and **Traces** search bars.

## Overview

When you explore data, you often adjust the stream, time range, filters, or applied function and then click **Run query** to refresh the results. Auto Run removes that manual step: with it enabled, OpenObserve detects the change and runs the query for you (debounced to avoid firing on every keystroke).

Auto Run is intended for interactive exploration in the **Logs** and **Traces** views, where you iterate quickly on filters and time ranges. It is controlled by a per-deployment feature flag and a per-browser toggle, so administrators decide whether the feature is available and each user decides whether to keep it on.

When the feature flag is enabled, the **Run query** button shows an autorenew icon and an **Auto run enabled** tooltip while Auto Run is active.

## Enabling Auto Run

Auto Run is controlled by an environment variable. The toggle does not appear in the UI until the feature is enabled on the deployment.

| Setting | Description | Default |
|---------|-------------|---------|
| `ZO_AUTO_QUERY_ENABLED` | Enables the Auto Run toggle in the Logs and Traces search bars. When `false`, the toggle is hidden and the **Run query** button always requires a manual click. | `false` |

Set the variable to `true` and restart OpenObserve to make the toggle available:

```bash
ZO_AUTO_QUERY_ENABLED=true
```

The current value is exposed in the `/config` API response as `auto_query_enabled`, which the UI reads to decide whether to show the toggle.

## Using Auto Run

When `ZO_AUTO_QUERY_ENABLED` is `true`, the **Run query** button on the Logs and Traces search bars includes a dropdown with an **Auto Run** toggle.

1. Open the dropdown next to the **Run query** button.
2. Select **Turn on Auto Run** to enable it, or **Turn off Auto Run** to disable it.

While Auto Run is on, the **Run query** button displays the autorenew icon and the **Auto run enabled** tooltip.

### What triggers a run

With Auto Run on, OpenObserve re-executes the query (debounced) when you:

- Select or change the stream.
- Change the datetime selection, including committing an absolute time range.
- Add or remove a filter field.
- Select a saved function.

You do not need to click **Run query** after any of these changes. You can still click **Run query** at any time to run on demand, and the dropdown also keeps the **Refresh Cache & Run Query** option. For details on that option, see [Refresh Cache and Run Query](logs/refresh-cache-run-query.md).

## Notes

- **Per-browser persistence**: The toggle state is saved in a single shared browser local storage key (`oo_toggle_auto_run`) used by both the Logs and Traces views. The preference is therefore shared across both views (not independent per view), and it persists across page navigation and browser sessions.
- **Default state**: When the feature flag is enabled and no preference has been saved yet, Auto Run starts on.
- **Scope**: The setting is local to the browser. It does not sync across browsers, devices, or other users.

> **Note**: If the **Auto Run** toggle does not appear, confirm that `ZO_AUTO_QUERY_ENABLED` is set to `true` on the deployment.
