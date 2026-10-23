---
title: TV Playlist
description: "Rotate multiple dashboards on a TV using OpenObserve TV playlists: pick dashboards, set the rotation interval and time range, and control playback."
---

# TV Playlist

A TV playlist rotates a set of dashboards on a wall-mounted TV, each for a configurable duration, with a compact header for pausing, stepping, and exiting. Playlists are built on the fly and opened in a new tab, so they require no setup beyond selecting dashboards.

## Create a TV playlist

1. Go to **Dashboards** from the left menu.
2. Use the checkboxes to select the dashboards to rotate. The playlist follows the order in which you tick them.
3. Click **TV playlist** in the bulk action bar.

![TODO: screenshot of the TV playlist dialog showing dashboard search, playlist order, and rotation settings](images/placeholder.png)

The **TV playlist** dialog lets you build and configure the playlist.

### Add and reorder dashboards

- Use the **search** to find dashboards across all folders and click **Add** next to a result.
- The selected dashboards appear as an ordered list. Drag the grip icon, or use the **up/down** arrows, to change the order.
- Click **x** to remove a dashboard. A playlist can hold up to 50 dashboards.

### Rotation settings

| Setting | Options |
|---------|---------|
| **Show each for** | `10s` to `1h` (default `1m`) |
| **Time range** | Use each dashboard's own default, or force `15m`, `1h`, `6h`, `24h`, or `7d` |
| **Theme** | **Current**, **Light**, or **Dark** |
| **Fit** | Off by default; scales panels to fill the screen |

Click **Open** to launch the player in a new tab, or **Copy link** to share the playlist URL. The link encodes the dashboards, order, interval, time range, theme, and fit, so anyone with access can open it directly.

## Use the player

The player opens at `/web/dashboards/tv?playlist=<dashboard>:<folder>,…&interval=1m&slide=N`. Reloading it resumes on the same slide, so a rebooted TV returns to where it left off.

![TODO: screenshot of the TV playlist player header showing the countdown ring and playback controls](images/placeholder.png)

The 44px header shows the current dashboard name, a countdown ring with the position ("2 of 5"), the time range, and **Updated Xm ago**. The controls are always visible:

- **Previous / Next** step between slides (or use the **Left/Right arrow** keys).
- **Pause / Resume** freezes rotation (or press **Space**).
- **Exit** returns to the Dashboards list (or press **Esc**).

Each slide shows its own tabs and variables read-only above the panels, so every dashboard keeps its defaults.

## Behavior

- Each slide runs in its own iframe; the next slide is preloaded so switches are instant.
- Slides refresh themselves while shown, reloading quietly only after five minutes.
- If the backend goes down, the player holds the current slide, shows **Backend unreachable**, and resumes automatically.
- Deleted or forbidden dashboards are skipped; a failing panel turns red inside the panel only.
- If a proxy blocks framing, the player falls back to loading one dashboard page per slide.
