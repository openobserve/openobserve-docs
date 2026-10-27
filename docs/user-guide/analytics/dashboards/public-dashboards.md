---
title: Public Dashboards
description: "Share an OpenObserve dashboard through a public link that anyone can open without signing in, and manage those links from the dashboard and org settings."
---

# Public Dashboards

Public Dashboards let you publish a read-only view of a dashboard behind a public link. Anyone with the link opens it in a browser without an OpenObserve account or sign-in.

## Enable public dashboards

Public dashboards are enabled per organization. An admin turns the feature on or off and sets a maximum number of links under **Organization Settings > Public Dashboards**. While disabled, existing links stop serving until it is switched back on.

![TODO: screenshot of the Public Dashboards org settings with the enable toggle and link limit](images/placeholder.png)

Publishing and managing links requires the **Public Dashboards** role, which admins assign on the **Roles** screen. It is a single org-wide permission, not a per-dashboard grant.

![TODO: screenshot of the Public Dashboards row on the Roles screen](images/placeholder.png)

## Create a public link

Open a dashboard and select **Share**. Name the link and create it; OpenObserve generates a URL you can copy and send to anyone:

```txt
https://<host>/public_dashboards/<slug>
```

The same dialog lists all the dashboard's links with their current state and the actions you can take on each one:

- **Pause** and **Resume** — temporarily stop or restore serving.
- **Refresh** — rebuild the snapshot viewers see.
- **Take over** — make yourself the link's publisher.
- **Revoke** — permanently delete the link; its URL stops working immediately.

![TODO: screenshot of the public links dialog listing links with pause, refresh, and revoke actions](images/placeholder.png)

## Viewing a public dashboard

Viewers open the link in any browser and see the dashboard read-only, with no sign-in. Changes you make to a link — pausing, resuming, refreshing, or revoking it — apply to everyone who has that link.

![TODO: screenshot of a public dashboard opened by an anonymous viewer](images/placeholder.png)

:::note[Cloud plans]
On OpenObserve Cloud the link limit comes from your plan: 3 on free or trial plans and 50 on paid plans. The plan sync writes only the limit, so an admin-set limit and the org on/off switch are preserved.
:::
