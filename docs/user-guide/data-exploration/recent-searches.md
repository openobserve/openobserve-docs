---
title: Recent Searches
description: "Browse and re-run your past Logs, Traces, and Metrics queries from the search bar, star the ones you reuse, and clear the rest."
---

# Recent Searches

OpenObserve records the queries you run on the **Logs**, **Traces**, and **Metrics** pages, so you can re-run a past search instead of typing it again. Each entry remembers the query, the streams it ran on, the time range, and whether it succeeded. Searches are private to you and scoped to your organization.

## Open recent searches

Click the history icon in the search bar of the **Logs**, **Traces**, or **Metrics** page to open a popover of your recent searches, newest first. Starred searches show a star icon; a row with a warning dot finished with a timeout or partial results, and a failed search is pinned at the top with its error.

Hover a row to open a details pane with the full query and, for Logs, its VRL function, plus the line count, streams, and time window. Use the keyboard to navigate: ↑↓ to move, PgUp/PgDn to scroll the query, Enter to run, Shift+Enter to load without running, and Esc to close.

## Run, load, or fix a search

- Click a row, or press Enter, to re-run it now.
- Press Shift+Enter, or pick **Load without running** in a row's menu, to put the query back in the editor without executing it.
- A failed search shows **Load to fix** so you can load and correct it.
- **View all** opens the full drawer; a failed-count link opens it filtered to the failed searches.

## Manage searches in the drawer

The **Recent searches** drawer lists every search, grouped by **Today**, **Yesterday**, then by date. Narrow the list with a **Search queries and streams** box, an **All pages** scope toggle, **All streams**, **Any status** (Succeeded or Failed), a **Filter by date run** day picker, and **Starred only**; click **Reset all** to clear the filters.

Each row shows the source (in **All pages** view), stream tags, a **Failed** tag or warning dot, and the query. Row actions let you:

- **Star**/**Unstar** an entry to keep it past the retention period.
- **Re-run now** with the current time, or **At original time** with the entry's original window.
- **Copy link** to share a URL that reopens the search, **Copy query** to copy the query, or **Copy function** to copy its VRL function (Logs).
- **Delete** a row; the toast offers **Undo** for a few seconds.

Click **Load more** at the end of the list to page through older searches.

## Clear your history

To remove many entries at once, click **Clear my history** at the bottom of the drawer. The dialog shows how many searches will be removed for the current page or **All pages**, with a checkbox to also remove your starred searches. Click **Clear history** to delete them. Saved views are never affected.

## Retention and settings

Unstarred searches are pruned after a number of days; starred searches stay until you delete them. Configure both with environment variables:

| Setting | Description | Default |
|---------|-------------|---------|
| `ZO_QUERY_HISTORY_ENABLED` | When `false`, OpenObserve records nothing and the recent searches UI is hidden. | `true` |
| `ZO_QUERY_HISTORY_RETENTION_DAYS` | Days unstarred entries are kept. `0` or less keeps them until the per-source cap. | `14` |

You can star up to 200 entries per organization across all pages, and each page keeps at most 500 unstarred entries, the oldest pruned first.
