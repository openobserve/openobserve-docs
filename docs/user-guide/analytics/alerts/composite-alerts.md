---
title: Composite Alerts | OpenObserve
description: >-
  Combine the firing state of multiple alerts into a single boolean condition.
  Create composite alerts with an expression builder, live preview, and durable
  state evaluation.
---
# Composite Alerts

A composite alert combines the firing state of other alerts into a single boolean condition, without running a query of its own. Instead of re-evaluating each child's data, a composite reads each child's latest durable evaluation state and combines them with operators such as `&&` (AND), `||` (OR), and `!` (NOT).

Use composite alerts when one signal alone is not enough. For example, alert only when **High error rate** fires **and** **High latency** fires, or when **Database down** fires on its own.

## How composite alerts work

A composite alert does not query a stream. It references two or more child alerts and combines their current truth values with a boolean expression. Each child can be a **scheduled**, **SLO**, or another **composite** alert. Real-time alerts are not eligible as children.

On every evaluation tick, OpenObserve:

1. Reads each child's latest rollup state (its current level and the time it was last computed).
2. Converts each child to a boolean truth value:
    - **Critical** counts as firing (`true`).
    - **Warning** counts as firing by default. You can change this with the **Count warning as firing** setting.
    - **OK** and **No data** are `false`.
3. Applies the stale-child policy to any child whose state is out of freshness.
4. Combines the boolean values using the expression, with `AND` binding tighter than `OR`.

A composite that fires always reports the **Critical** level.

## Create a composite alert

1. On the **Alerts** page, click **Add Alert**.
2. In the top bar, set **Alert Type** to **Composite Alert**.
3. Configure the composite:

    - **Sub-alerts**: search and add between 2 and 10 child alerts. Each selected child gets a letter chip (**A**, **B**, **C**, …) used in the expression.
    - **Trigger expression**: build a boolean expression over the lettered children using the **AND**, **OR**, **NOT**, and group controls, or type a custom expression in the editor.
    - **Settings**: choose whether **Warning** counts as firing and how to treat stale children.
4. Review the live preview and summary on the right, then click **Save**.

![TODO: screenshot of the composite alert creation form showing sub-alert selector, expression builder, and settings](images/placeholder.png)

### Expression syntax

The stored expression uses brace-wrapped child IDs, for example `{A} && ({B} || {C})`. In the UI you work with letter chips; the builder maps them to IDs transparently. Expressions support:

- `&&` for **AND**, `||` for **OR**, `!` for **NOT**, and parentheses for grouping.
- **AND** binds tighter than **OR** — `A || B && C` means `A || (B && C)`.
- A maximum size of 4 KiB and a maximum of 10 distinct children.

### Stale-child policy

A child becomes stale when it has not been evaluated within its freshness deadline, defined as a multiple (by default 3×) of the child's own schedule. Choose how the composite treats a stale child:

- **Use last state** (default): trust the child's most recent frozen state.
- **Treat as false**: a stale child never satisfies the expression.
- **Treat as true**: a stale child always satisfies the expression. Useful for fail-safe heartbeat patterns, where the *absence* of a fresh "OK" should fire the composite.

## Live preview

As you build the expression, the right panel shows a live **Preview** that evaluates the expression against the children's current state without saving anything. The preview shows:

- A verdict (**Would trigger** / **Would not trigger** / **Unknown**) with the resolved level.
- A step-by-step breakdown of each operand's level and boolean result.
- Advisory warnings for children that are **disabled**, **never evaluated**, or **stale**.

![TODO: screenshot of the composite alert live preview showing the verdict and step-by-step evaluation](images/placeholder.png)

The preview also exposes warnings such as `child_disabled` and `child_never_evaluated`, so you can catch problems before saving.

## View composite alert details

Open a composite alert from the list to see its detail view, which includes:

- The **current evaluation** result and the expression rendered as level pills.
- A card per child showing its name (linked to its own detail page), type, current level, last computed time, and stale reason when applicable.
- A **status timeline** of each child's level transitions over time.
- A **Configuration** summary of the expression, warning policy, and stale policy.

![TODO: screenshot of the composite alert detail view showing the current evaluation and per-child cards](images/placeholder.png)

If a composite is enabled but has no scheduler job, the detail view shows a warning banner so you can re-save or re-enable the alert to reschedule it.

## Alerts list

Composite alerts appear in the **Alerts** list under their own **Composite** filter tab, marked with a **Composite Alert** badge. Each composite row shows its child count and its expression summary instead of a stream/query summary.

![TODO: screenshot of the alerts list showing composite rows with badge, child count, and expression summary](images/placeholder.png)

### Referenced by composites

When an alert is used as a child of a composite, its list row shows a **Referenced by** count. Click it to open a drawer listing the parent composites. Deleting an alert that is still referenced by a composite returns a conflict; use the drawer to open and update the parent composite first.

## Delete safeguards

Composite alerts protect their children from accidental deletion:

- Deleting a child alert that a composite references fails with a `409` `child_referenced` response that lists the referencing composites.
- Bulk delete reports the same conflicts in a `conflicts` list instead of silently dropping referenced alerts.
- You can delete a composite alert directly; deleting a composite that is itself a child of another composite is likewise blocked.

## API

Composite alerts share the unified alerts API with a `composite` alert type. Key endpoints include:

- `POST /api/v2/{org_id}/alerts` and `PUT /api/v2/{org_id}/alerts/{alert_id}` with `alert_type: "composite"` and a `composite_condition` body.
- `POST /api/v2/{org_id}/alerts/composites/validate` to validate and preview an expression without persisting it.
- `GET /api/v2/{org_id}/alerts/{alert_id}/composite-references` to list the composites referencing an alert.
- `GET /api/v2/{org_id}/alerts/{alert_id}/composite-timeline` to read per-child status history.

A composite request must not carry query conditions, realtime flags, or trigger thresholds; supplying an unsupported field returns a `composite_unsupported_field` error. Invalid expressions return `composite_invalid_expression`, and cycles or over-deep nesting return `composite_cycle` / `composite_too_deep`.

## Configuration

The following environment variables tune composite alerts:

| Variable | Default | Description |
| --- | --- | --- |
| `ZO_ALERT_COMPOSITE_WRITES_ENABLED` | `true` | Opt-out kill-switch for composite create/update/move/trigger. |
| `ZO_ALERT_COMPOSITE_STALE_K` | `3` | Multiplier on a child's cadence that marks it stale. |
| `ZO_ALERT_COMPOSITE_SWEEP_SECS` | `300` | Composite scheduler sweep interval in seconds. |
| `ZO_ALERT_COMPOSITE_DEBOUNCE_SECS` | `15` | Minimum seconds between composite evaluations. |
