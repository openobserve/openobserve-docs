---
title: AutoObserve
description: "Use OpenObserve's autonomous SRE agent to watch every service, learn what normal looks like, and raise issues with its best read on the cause — what it checked and what it cannot see."
---

# AutoObserve

AutoObserve is OpenObserve's autonomous SRE agent. Point your data at it and it watches every service, learns a baseline for each signal, and raises an issue whenever something drifts — then tells you about it with its best read on the cause, the evidence it checked, and the coverage gaps it cannot see.

![TODO: screenshot of the AutoObserve Standard view showing this week's problems and the suggestions rail](images/placeholder.png)

!!! note
    AutoObserve is available in **OpenObserve Enterprise builds only**, and it is hidden behind an experimental flag. It currently runs on **demo data with no backend** — every problem, chart, and interaction stays within the page so you can explore the concept before the real ingestion and automation land.

## Enable AutoObserve

AutoObserve is gated by the `ZO_EXPERIMENTAL` environment variable (boolean, default `false`). Set it to `true` on the OpenObserve server:

```sh
ZO_EXPERIMENTAL=true
```

The value is exposed to the UI through the organization config endpoint (`/api/{org}/config`) as `experimental`. While it is `false`, the **AutoObserve** entry is hidden from the left navigation. Once it is `true`, the entry appears just above **Alerts** in the sidebar, linking to `/autoobserve`. The page and its route exist only in enterprise builds; the legacy `/auto-observe-2` path redirects to it.

## Standard and Nerd views

AutoObserve has two interchangeable views, switched with the **Standard** / **Nerd** toggle in the top bar. Your choice is remembered in the browser (`localStorage`), and a shared link can force a view with `?view=nerd`.

- **Standard** is the default landing view: a focused summary of this week's problems plus a rail of open suggestions, with full pages for coverage, activity, and issues reached by link.
- **Nerd** is the tabbed workspace: **Issues**, **Coverage**, **Activity**, and **Policy** tabs laid out like the rest of OpenObserve.

Both views read from the same shared state, so a fix you approve in one view shows up immediately in the other.

## Scenarios

Because AutoObserve runs on demo data, a scenario selector lets you preview different states. The Standard view shows a **Demo** selector; you can also set the `?scenario=` query parameter. Available scenarios are:

| Scenario | What it shows |
|----------|---------------|
| **Demo** | A busy, mixed week with active incidents, a known recurring bug, and coverage gaps |
| **All clear** | A quiet system with nothing wrong |
| **Incident** | A single active incident in progress |
| **Can't see** | Services AutoObserve cannot watch (coverage gaps) |
| **No baseline** | Services still learning their baseline before anomalies are detected |

## Issues

The **Issues** tab lists every incident AutoObserve has raised, newest first and grouped by day. Each row shows the incident ID, title, severity (`P1`–`P4`), a signal sparkline, affected services, start time, status, and a one-line cause.

![TODO: screenshot of the AutoObserve Nerd view Issues tab with the incident table](images/placeholder.png)

Use the toolbar to narrow the list:

- **Search** filters by title, ID, cause, or service name (written to `?q=`).
- **Priority** toggles (**all**, **P1**–**P4**) show counts per severity.
- **Status** toggles between **open**, **resolved**, and **all**.

Click any row to open the issue drawer.

### Issue details

The issue drawer opens at 85% width with four tabs: **Overview**, **Analysis**, **How it unfolded**, and **Alert triggers**.

The **Overview** tab summarizes the incident:

- Severity, status, and affected-service tags, plus a **Proposal** card when AutoObserve suggests a fix or detection change. If the proposal is awaiting approval, click **Approve** right here.
- An **RCA** card with the issue summary, the likely cause, a confidence tag (**high** / **medium** / **low**), and a sparkline of the offending signal. Click **See evidence** to jump to the evidence trail.
- A **Notification** card showing the Slack or email message AutoObserve sent (or *held*, for items deferred to the weekly digest), including the thread it would reply in.
- A **Timeline** of what happened, and a **Blast radius** showing upstream, affected, and downstream services.

![TODO: screenshot of the AutoObserve issue drawer Overview tab](images/placeholder.png)

The **Analysis** tab is AutoObserve's reasoning in full: a verdict, the impact, how long the problem lasted, and the hypotheses it considered — each marked **confirmed**, **ruled out**, or **open**, with a reason — plus a comparison table (for example, heap usage by node) and the full RCA report.

![TODO: screenshot of the AutoObserve issue drawer Analysis tab](images/placeholder.png)

The **How it unfolded** tab renders the incident as a chain of cards ordered by time: the triggering change, each detector firing, any links in the chain it could not see (unwatched services or forecast harm), and the outcome.

![TODO: screenshot of the AutoObserve issue drawer How it unfolded graph](images/placeholder.png)

The **Alert triggers** tab lists the correlated alert firings behind the incident.

## Coverage

The **Coverage** tab shows how completely AutoObserve watches each service, across six signals: **requests**, **errors**, **latency**, **saturation**, **log patterns**, and **dependencies**. A summary bar shows the fully-watched count, the percentage, services added this week, and the total detector count.

Each service-signal cell is in one of four states:

| State | Meaning |
|-------|---------|
| **Watched** | A detector is active. A filled dot marks **anomaly** detection; an outlined ring marks a fixed **threshold**. |
| **Learning** | The service is new; AutoObserve is building its 7-day baseline. A progress bar shows days remaining. |
| **Gap** | AutoObserve cannot watch this yet — typically metrics without `service.name`, or no data at all. |
| **N/A** | The signal does not apply to the service (for example, a database has no downstream calls). |

### Hex map

The default view is a hexagonal **Map**. Each hexagon is a service, colored by state. Click **Fill by** to recolor by state, learning progress, detector count, or how recently the service was scanned. The legend chips double as filters.

![TODO: screenshot of the AutoObserve Coverage tab hex map](images/placeholder.png)

### Table view

Switch to **Table** for a matrix: one row per service with a colored cell per signal. Filter with the **all** / **watched** / **learning** / **gaps** / **can't watch** toggles, and click any cell to open the service drawer.

![TODO: screenshot of the AutoObserve Coverage tab table matrix view](images/placeholder.png)

### Service drawer

Clicking a service opens a drawer listing each signal it watches, with a chart per detector. Services with a coverage gap show the reason and a suggested fix, and link out to **Traces** and the **Service Catalog**.

![TODO: screenshot of the AutoObserve per-service coverage drawer with signal charts](images/placeholder.png)

## Activity

The **Activity** tab is AutoObserve's change ledger: every detector it created, threshold it retuned, and fix it applied or proposed, organized by loop (**coverage**, **calibration**, **investigation**, **action**). Pending proposals that need your approval lead the list.

![TODO: screenshot of the AutoObserve Activity tab change ledger](images/placeholder.png)

Each row shows when the change happened, its action class, the target, a `before → after` diff, a confidence tag, the decision (auto or approved), and the outcome. Expand a row to see the full evidence, the side-by-side diff, any review-window timer for auto-applied changes, and an **Undo** button.

For entries awaiting approval, click **Approve**, **Reject**, or **Edit** to adjust the proposed change before saving it.

## Policy

The **Policy** tab shows how AutoObserve is configured to behave, in five vertical sections:

- **Coverage** — action classes that close coverage gaps (creating detectors, adding library alerts), each set to **auto**, **suggest**, or **off**.
- **Alerts** — calibration classes (raise/lower threshold, extend evaluation windows, fix alert queries, attach destinations), gated by your approval.
- **Fixes** — the fix classes (rollback, revert config, restart pods, scale services). Marked *Phase 2* and read-only in this preview.
- **Investigation** — triage behavior: `P1` is investigated in parallel while `P2`–`P4` wait behind a gate, and paging routing (`P1`–`P2` page, `P3` message, `P4` weekly summary).
- **Channels** — the connected notification channels (inbox, admin email, Slack, and email destinations).

![TODO: screenshot of the AutoObserve Policy tab](images/placeholder.png)

## Settings, History, and How it works

The Standard view top bar opens three drawers:

- **Settings** — choose where AutoObserve can reach you (destinations), the default autonomy mode (**Tell** / **Ask** / **Fix**), and, under **Advanced**, per-fix-kind autonomy, the weekly digest day, and excluded services.

![TODO: screenshot of the AutoObserve Settings drawer](images/placeholder.png)

- **History** — a filterable timeline of problems, changes, fixes, and decisions, with links back to the change they correspond to.
- **How it works** — a five-step walkthrough of the loop (watch, detect, investigate, tell you, learn), shown automatically on first visit.
