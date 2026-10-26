---
title: TV Mode and Playlists
description: "Put dashboards on an office TV: hide the app chrome, auto-refresh on a schedule, and rotate multiple dashboards as a playlist."
---

# TV Mode and Playlists

TV mode turns a dashboard into a wall-screen view: the app header, sidebar, and toolbar disappear, panels become view-only, and the dashboard refreshes itself on a schedule. A TV playlist rotates several dashboards on the same screen.

## Single dashboard TV mode

Open a dashboard and click the **TV** icon in the toolbar.

![TODO: screenshot of the TV mode setup popover](images/placeholder.png)

The setup popover offers:

- **Refresh every** — how often the TV reloads data (Off, 30s, 1m, 5m, 15m, 30m, 1h). Defaults to the dashboard's current refresh, or 5 minutes when that is off.
- **Theme** — Current, Light, or Dark, applied to this screen only.
- **Fit all panels on one screen** — shrinks the grid to the screen height so nothing scrolls (off by default).

Click **Open TV mode**. OpenObserve opens the same dashboard with `kiosk=true` in the URL, keeping the current relative time range. A compact header replaces the app chrome.

![TODO: screenshot of a dashboard in TV mode showing the compact header](images/placeholder.png)

The header shows the dashboard name, the time range, a countdown ring until the next refresh (which spins while loading), an "Updated 2m ago" label with the exact time on hover, and a status chip only when something needs attention — failing panels, backend unreachable, or auto-refresh off. An **Exit** button is always visible; **Esc** also leaves TV mode. Tabs and variables stay in one compact row under the header and remain usable, and a variable change applies immediately.

## URL parameters

Link straight into TV mode by adding query parameters to a dashboard URL:

| Parameter | Values | Effect |
|-----------|--------|--------|
| `kiosk` | `true` or `1` | Hides the app chrome and makes panels view-only |
| `refresh` | duration such as `5m` | How often the dashboard reloads |
| `theme` | `light` / `dark` | Forces a theme on this screen only |
| `fit` | `true` | Scales the grid to one screen |

For example: `?kiosk=true&refresh=5m&theme=dark`.

While in TV mode the dashboard is self-healing:

- A hung query is cancelled and the refresh is forced.
- If the backend is down, OpenObserve retries with backoff and recovers on its own.
- Refresh pauses while the browser tab is hidden and resumes when it becomes visible.
- Failed panels show their error inside the panel.

Leaving TV mode restores the refresh the dashboard had before.

## TV playlist

To rotate several dashboards on one screen, select them in the **Dashboards** list and click the **TV playlist** button in the toolbar.

![TODO: screenshot of the TV playlist dialog](images/placeholder.png)

In the dialog, search across all folders to add dashboards, drag or use the arrows to reorder them, and set:

- **Show each for** — how long each dashboard stays on screen (10s to 1h).
- **Time range** — one range for all dashboards, or each dashboard's own default.
- **Theme** and **Fit all panels on one screen**.

Click **Open TV playlist** to open the rotation in a new tab, or **Copy link** to get a link to paste into the TV's browser.

![TODO: screenshot of a running TV playlist](images/placeholder.png)

The playlist header shows the current dashboard and its position (for example, "2 of 3"), the shared time range, and the time until the next dashboard. Controls let you jump to the previous or next dashboard, pause rotation, and exit. Missing dashboards are skipped; if the backend is unreachable the rotation holds until it recovers.
