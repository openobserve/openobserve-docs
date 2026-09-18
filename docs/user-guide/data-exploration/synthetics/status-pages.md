---
title: Status Pages
description: Publish a public or password-protected status page built from your Synthetics checks, with automatic incidents, uptime history, and optional custom domains.
---

# Status pages

A status page turns your Synthetics checks into a public-facing page that reports whether your services are up, tracks incidents automatically, and shows 90 days of uptime history. Visitors see a page, not your check configuration: names, targets, and other internal detail never reach the public plane.

## Overview

A status page is built from **components** — named groups such as "API" or "Dashboard" — each mapped to one or more Synthetics checks. A component's status is the worst status of any check mapped to it, and the page's overall status is the worst status of any component.

When a mapped check fails enough consecutive times, the page opens an **incident** automatically, without anyone touching the page. When the check recovers, the incident resolves the same way. You can also post updates, schedule maintenance, and share informational notices by hand.

> **Note**: Status Pages requires Synthetics to be enabled (see [Accessing Synthetics](index.md#accessing-synthetics)). **Posting updates, custom domains, and a custom logo are Enterprise features** — draft/publish, components, automatic incidents, and the public page itself are not.

## Creating a status page

1. Open **Experience > Synthetics** and select the **Status Pages** tab.
2. Click **New status page** and give it a name.

A new page starts in **Draft**, which is never publicly reachable regardless of its slug.

### Details, display, and confirmation

The page editor has these sections:

| Section | Controls |
|---|---|
| **Details** | Name, description |
| **Visibility** | Draft, Public, or Password (see [Visibility](#visibility)) |
| **Display** | Brand name, accent color, logo, whether to show the uptime percentage and timeline bars, and whether to add a `noindex` tag so search engines skip the page |
| **Confirmation** | **Confirm failures** and **Confirm recovery** — how many consecutive failing (or passing) runs are required before a component's status changes |

Confirm failures and confirm recovery both default to 2 consecutive runs, so a single flaky run does not flip a component's public status.

### Components

Add one component per thing you want visitors to see as a unit (for example, one component per service, region, or environment), and select the checks that map to it. A component with no checks mapped shows no data rather than a false "operational."

## Visibility

| Visibility | Who can view |
|---|---|
| **Draft** | No one — the page is not served at any URL |
| **Public** | Anyone with the URL |
| **Password** | Anyone with the URL and the page password |

Public and password-protected pages are both served from a per-page slug at `/status/<slug>`. Use **Rotate URL** to change the slug and invalidate the old one — useful if a link leaked before you meant it to be shared. **Copy URL** copies the current public URL.

A password-protected page issues visitors a signed unlock cookie valid for 24 hours after a correct password, so they are not re-prompted on every visit. Password attempts are rate-limited per visitor IP.

## Incidents and updates

A **notice** is anything posted to the page's timeline: an incident, a scheduled maintenance window, or a plain informational note.

**Automatic incidents** open and resolve on their own, driven by the confirm failures/confirm recovery thresholds on the mapped checks. If an automatic incident was a false alarm, resolve it and **snooze** the underlying check for a set number of hours so it does not immediately reopen the same incident.

**Post update** (Enterprise) lets you write to the page by hand:

- Attach an update to an already-open incident, or post a new one.
- Set the **impact**: Degraded, Partial outage, or Major outage. Degraded shows amber on the page but does not count against uptime; partial and major outages do.
- Choose the **affected components**.
- Optionally **escalate** the impact as the incident develops.

Every notice keeps a chronological list of updates (the "investigating / identified / monitoring / resolved" narrative visitors expect), viewable and postable from **View updates** (Enterprise).

## Public page contents

A published page serves:

- **Current status** — overall status and per-component status, refreshed as checks report in.
- **Uptime percentage** and **timeline bars** — 90 days of daily grades (OK / minor / major / severe / maintenance / no data), if enabled in Display. Uptime is capped at the page's tracking start date, so a page only a few days old reports honestly rather than showing a fabricated 90-day number.
- **Incident and maintenance history** with their update timelines.
- A status **badge** (`/api/status_pages_public/<slug>/badge.svg`) you can embed elsewhere, and an **Atom feed** (`/api/status_pages_public/<slug>/feed.xml`) of notices for subscribers.

Degraded impact never counts as downtime in the uptime percentage; only partial and major outages do. Overlapping incidents on the same component are counted once, not double-counted.

## Custom domains (Enterprise)

Serve a status page from your own domain, such as `status.yourcompany.com`, instead of the OpenObserve-hosted slug.

1. Open **Manage domains** on the page and add your domain.
2. Create the DNS TXT record shown, at your DNS provider.
3. Click **Verify now**, or wait for the periodic verification check to pick it up.

A domain only serves content once ownership verification passes; an unverified or since-released domain is intercepted but never shown tenant data.

## Limitations

- **The public page never exposes check names, targets, folders, locations, or any other internal identifier.** Only what you configure in components and notices is published.
- **Custom logo, posting updates, and custom domains require an Enterprise license.** An OSS build or a lapsed license still renders a logo that was set previously; it just can't set a new one.
- **A password page's content is never cached or served to a visitor without a valid unlock cookie.** Locked and unknown pages return the same response, so a page's existence cannot be probed from the outside.

:::accordion[Troubleshooting]

**A custom domain won't verify**

**Problem**: `Verify now` reports a failure.

**Solution**: Check the failure reason shown:

- *TXT record not found* — the record has not propagated yet, or was not created at the name shown.
- *TXT record found, but the value doesn't match* — re-copy the value shown; a partial paste is the most common cause.
- *DNS resolution failed* — your DNS provider could not be queried; retry once propagation has had time to complete.

**The status page shows "building"**

**Problem**: A newly published page briefly shows a building state instead of its status.

**Solution**: This is expected for a few seconds after first publishing — the snapshot the public page reads from has not been generated yet. Reload after a moment.

**A component shows no data**

**Problem**: A component never shows operational, even though its checks are passing.

**Solution**: Confirm at least one check is actually mapped to the component under **Components**, and that mapped check has run at least once.
:::

**Need help:**

  [Community Slack](https://short.openobserve.ai/community)
  
  [GitHub issues](https://github.com/openobserve/openobserve/issues)
