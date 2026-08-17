---
title: Notification Dependencies | OpenObserve
description: >-
  See where your alert templates and destinations are used with the "Used by"
  view, then open or delete related alerts, destinations, and templates without
  leaving the list.
---
# Notification Dependencies

OpenObserve links three kinds of entities by name into a notification chain: **Templates**, **Destinations**, and **Alerts**. The **Used by** view surfaces this linkage so you can see the blast radius *before* you change or delete something, and act on the related entities in place.

## How the chain is linked

The three entities form a delivery chain:

```
Template ──► Destination ──► Alert
  └────────────────────────► Alert   (alert-level template override)
```

- An **alert** delivers to one or more destinations (`Alert.destinations`).
- A **destination** has a default template (`Destination.template`).
- An **alert** can override that with its own template (`Alert.template`).

Because the linkage lives in these name references (not in ID foreign keys), the **Used by** view cross-references the templates, destinations, and alerts lists to build the dependency graph.

## See where an entity is used

The **Used by** column appears on two lists:

- **Management > Templates**
- **Management > Alert Destinations**

Each row shows a compact, clickable **Used by** cell. Until the graph has loaded, the cell shows a neutral graph icon; after it loads, the cell shows per-kind count badges (or an **Unused** / **Missing** chip).

### Templates list

A template row shows its downstream usage in delivery order: the number of **destinations** that use it, followed by the number of **alerts** that ultimately depend on it. A template that nothing references shows an **Unused** chip, and a template referenced by a destination or alert but not actually defined shows a **Missing** chip.

![TODO: screenshot of the Templates list showing the Used by column with destination and alert count badges](images/placeholder.png)

### Alert Destinations list

A destination row shows how many **alerts** deliver to it (its total usage). A destination with no alerts shows **Unused**, and a destination name referenced by an alert but not present in the destination list shows **Missing**.

![TODO: screenshot of the Alert Destinations list showing the Used by column with alert count badges](images/placeholder.png)

## Open the dependency dialog

Click a **Used by** cell to open the dependency dialog, which shows everything downstream of that entity along the **Template → Destination → Alert** chain.

- **Template focus** opens a two-lane view: the **Destinations** lane lists the destinations that use the template, and the **Alerts** lane groups the resulting alerts into a box per destination. Alerts that reference the template directly (an override, not via a destination) appear under a separate **Uses this template directly** section.

  ![TODO: screenshot of the dependency dialog for a template showing the Destinations and Alerts lanes](images/placeholder.png)

- **Destination focus** opens a single, flat list of the alerts that deliver to that destination.

  ![TODO: screenshot of the dependency dialog for a destination showing its flat list of alerts](images/placeholder.png)

The dialog header shows the focused entity's name and a summary such as *Used by 3 alerts* (a destination) or *Used by 2 destinations · 5 alerts* (a template). While the graph is building, it shows a **Building dependency graph…** spinner; if the fetch fails, it shows an error banner instead.

## Search and navigate the chain

The **Search** box filters the dialog's contents. For a template, the search keeps the **Destinations** and **Alerts** lanes in sync: a destination stays visible when its own name matches, or when one of its alerts matches.

When a template feeds many destinations, the hover and click behaviour keeps the destination↔alert link readable:

- Hover a **destination** to highlight its alert box (and vice-versa).
- Click a **destination** to scroll its alert box into view.

## Act in place: open and delete

Each row in the dialog carries an **Open** and a **Delete** action:

- **Open** opens the entity's editor in a new browser tab (templates and destinations open their list editor; alerts open the alert's detail page), so you keep the dependency view open.
- **Delete** asks for confirmation with the same **Delete** dialog the list pages use. Deleting a destination that an alert still uses, or a template that a destination or alert still uses, is blocked by the backend's `409` guard and reported as an error. Deleting an unused entity removes it, refreshes the list, and refreshes the dependency graph.

After you add, edit, or delete any template, destination, or alert, the **Used by** counts and the dependency dialog rebuild automatically so they always reflect the current configuration.
