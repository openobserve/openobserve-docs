---
title: Status Pages
description: Publish public status pages that surface the live health of your services from synthetic monitoring. Track components, automate incident detection, post updates, and serve pages on a branded page or your own custom domain.
---

# Status Pages

Status Pages turn your synthetic monitoring checks into a public, branded page your customers can check to see whether your services are up. Map checks to components, let OpenObserve automatically open and resolve incidents from check failures, and post manual updates during outages or scheduled maintenance.

:::note[Note]
Status Pages ship as part of **Synthetics**. Enable synthetic monitoring (`ZO_SYNTHETICS_ENABLED`) before you use them. Base page management, automatic incidents, and public serving are available in the open-source build; **manual notices**, **custom domains**, and **logo upload** require the Enterprise tier.
:::

## How Status Pages Work

A status page is a snapshot of the health of your components, rebuilt on a fixed cadence (`ZO_STATUS_PAGE_REBUILD_INTERVAL`, default `60` seconds). Each component maps to one or more synthetics checks. A background rebuilder observes those checks, opens and resolves **automatic incidents** as checks fail and recover, and computes uptime percentages from the resulting downtime.

The page is served publicly over a small set of unauthenticated read routes, and you can reach it either by its OpenObserve URL (`/status/<slug>`) or, on Enterprise, by a **custom domain** you own.

## Create a Status Page

To create a status page:

1. Open **Synthetics** from the left navigation and select the **Status Pages** tab.
2. Click **Add Status Page**.
3. Enter a **Name** and, optionally, a **Description**.
4. Click **Save** to create the page.

![TODO: screenshot of the Status Pages list view](images/placeholder.png)

Each page is assigned a random public **slug** used in its URL. You can regenerate it at any time from the page editor.

![TODO: screenshot of the Create Status Page dialog](images/placeholder.png)

## Add Components

A component is a named unit of your service (for example, *API*, *Web App*, or *Database*) that visitors see on the page. Each component maps to one or more synthetics checks whose status drives the component's health.

1. Open the page and go to the **Components** section of the editor.
2. Add a component and give it a **Name** and optional **Description**.
3. Select the synthetics **checks** to map to it.

![TODO: screenshot of the Status Page editor Components section](images/placeholder.png)

:::note[Note]
When you map a check to a component, OpenObserve verifies that you have **read access** to that check's synthetics folder. A status page can never publish the status of a check you cannot read.
:::

## Configure the Page

The editor's **Settings** section controls how the page is published and branded:

- **Visibility** — `Draft` (hidden), `Public` (open to anyone), or `Password protected`.
- **Password** — for password-protected pages. The password is hashed with Argon2id at rest and is never returned by the API.
- **Branding** — **Brand name**, **Accent color**, and a **Logo** image.
- **Display options** — toggle the **Uptime percentage**, **Timeline bars**, and **Response time** sections.
- **Incident thresholds** — the number of consecutive **failures** before an incident opens and the number of consecutive **recoveries** before it resolves, plus an optional time-based confirmation window.
- **Hide from search engines** — sets `noindex` on the page.

![TODO: screenshot of the Status Page editor Settings section](images/placeholder.png)

## Automatic Incidents

OpenObserve watches the checks mapped to a page and turns failures into incidents automatically:

- An incident opens after **2 consecutive failures** (configurable per page).
- It resolves after **2 consecutive recoveries** (configurable per page).
- A re-failure within a **10-minute merge window** reopens the same incident as a new downtime segment rather than creating a separate one, so a flapping check stays a single incident.
- Downtime accrues only inside incident notices with an impact of **partial outage** or higher, computed as a union of segments (overlaps are never double-counted).

Uptime is tracked over a rolling 90-day history, and the denominator is capped at the page's `tracking_since` date so a young page never fabricates a long uptime figure.

## Post Manual Updates

:::note[Enterprise]
Manual notices require the Enterprise tier.
:::

Use manual updates to communicate during incidents, scheduled maintenance, or informational announcements that are not driven by a check:

1. Open the page and click **Post Update**.
2. Choose a **Kind** — *Incident*, *Maintenance*, or *Info*.
3. Set the **Impact** — *None*, *Degraded*, *Partial outage*, or *Major outage*.
4. Enter a **Title** and **Body**, and pick the affected **components** (defaults to every component on the page).
5. For maintenance, set a **Start time** in the future to schedule it.

![TODO: screenshot of the Post Update dialog](images/placeholder.png)

You can edit a notice's narrative or impact, append timestamped updates to its public timeline, or resolve it manually. To override an automatic incident you believe is a false positive, use **Mark as false positive** — this resolves the incident, excludes it from uptime math, and snoozes the underlying check for a period you choose so the same flap does not immediately reopen it.

Past updates for a page appear in the **Notice History** dialog.

![TODO: screenshot of the Notice History dialog](images/placeholder.png)

## Preview and Publish

Before publishing, click **Preview** to render the page exactly as visitors will see it. When you switch the page to **Public**, it is served at `/status/<slug>` and the JSON snapshot at `/api/status_pages_public/<slug>`.

![TODO: screenshot of a published public status page](images/placeholder.png)

Visitors can also consume the page programmatically:

- **Status badge** — `/api/status_pages_public/<slug>/badge.svg` returns a Shields-style SVG badge showing the overall status.
- **Atom feed** — `/api/status_pages_public/<slug>/feed.xml` returns the page's notices as a feed.

Password-protected pages return `404` for the badge and feed so no state leaks to unauthenticated callers.

## Custom Domains

:::note[Enterprise]
Custom domains require the Enterprise tier.
:::

Serve a status page on a domain you own instead of your OpenObserve host:

1. Open the page and go to the **Domains** section.
2. Enter the domain you want to claim (for example, `status.example.com`).
3. Copy the generated DNS **TXT record** — a `_o2-verify.<domain>` record containing a verification token.
4. Add the record to your DNS and click **Verify now**, or wait for the periodic check (`ZO_STATUS_PAGE_DOMAIN_VERIFY_INTERVAL`, default `30` seconds).

![TODO: screenshot of the Domains dialog showing a pending domain and its TXT record](images/placeholder.png)

Once the record is confirmed, the domain is **verified** and requests to that host are routed to the page ahead of normal routing, so the domain can serve the page even at the root path. A claimed-but-unverified domain is intercepted but serves no tenant content. Domain uniqueness is global: no two organizations can claim the same domain.

HTTPS termination for a custom domain is your own responsibility — point your reverse proxy or CDN at OpenObserve and forward the original `Host` header.

## Permissions

Status Pages use the OpenFGA `status_page` resource type for role-based access control. It is a top-level, organization-scoped resource, so you can grant permissions per page independently of other synthetics permissions. The public read routes sit outside authentication and are not RBAC-gated.

## Configuration Reference

The following environment variables control Status Pages:

| Variable | Default | Description |
| --- | --- | --- |
| `ZO_STATUS_PAGE_REBUILD_INTERVAL` | `60` | Seconds between status-page snapshot rebuild ticks. |
| `ZO_STATUS_PAGE_DOMAIN_VERIFY_INTERVAL` | `30` | Seconds between custom-domain DNS ownership verification ticks. |
| `ZO_STATUS_PAGE_PUBLIC_RPM` | `240` | Per-IP requests per minute for the public read routes. Set to `0` to disable the limiter. |
