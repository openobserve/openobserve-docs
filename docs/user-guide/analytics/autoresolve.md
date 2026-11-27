---
title: AutoResolve
description: AutoResolve plans fixes through your organization's MCP connections, proposes options, and runs only the changes you approve, keeping every call as evidence.
---

# AutoResolve

AutoResolve (Alpha) is an enterprise SRE agent that takes a goal from you, investigates through your organization's MCP connections, and proposes up to four options — stopping before the first change. It runs only the exact calls you approve, and keeps every call as evidence.

:::note[Alpha]
AutoResolve is available in **OpenObserve Enterprise builds only** and is off by default. It appears in the left navigation under **Reliability** next to **Incidents**, and only when it is enabled.
:::

## Enable AutoResolve

Set `O2_AUTORESOLVE_ENABLED=true` on the server. The route stays closed (returns 404) until every requirement is met:

| Requirement | Value |
|-------------|-------|
| `O2_AUTORESOLVE_ENABLED` | `true` (default `false`) |
| Licence | the `autoresolve` feature |
| `O2_AI_INTERNAL_SECRET` | a shared secret, equal to the SRE Agent's `O2_INTERNAL_API_SECRET` |
| Delegation signing keys | configured |

These optional variables tune a run:

| Variable | Default | Description |
|----------|---------|-------------|
| `O2_AUTORESOLVE_APPROVAL_WAIT_MINUTES` | 30 | Minutes a run waits for approval before it lapses. |
| `O2_AUTORESOLVE_TURN_TIMEOUT_SECS` | 900 | Seconds one agent turn may run before it is abandoned. |
| `O2_AUTORESOLVE_MAX_CONNECTIONS` | 20 | Most MCP connections one run or saved AutoResolve may use. |

## Start a run

1. Open **AutoResolve** from the left navigation.
2. On the **Home** tab, describe the goal in **What should be done?**.
3. Choose the MCP connections the run may use, then click **Start**.

The run investigates with read-only calls, then stops and asks before the first change. Its tabs are **Home**, **Runs**, and **Saved**.

## Review and approve a plan

When the model proposes a plan, the run enters **Waiting for approval** and shows up to four options, each with its steps through the chosen MCPs. The run marks one **Recommended**.

Decide on an option:

- **Approve and proceed** runs its steps in order, once each. You can approve only if you may approve changes through every MCP the option uses.
- **Decline** ends the run without changing anything.
- **Ask for a different plan** starts a new planning turn with your note.

Only the calls you approve run. Any other change the model tries while planning is held, not run. A run ends in one of these states: **Worked**, **No change**, **Worse**, **Declined**, **Lapsed**, **Step failed**, **Outcome unknown**, or **Failed**. After a run, you can mark it **fixed**, raise a revert, or ask for a new plan with a correction.

## Saved AutoResolves

From a finished run, choose **Save as AutoResolve** to reuse the goal and its MCPs. A saved AutoResolve has a **Trigger**:

- **A person starts it** — run it on demand with **Run now**.
- **An alert fires** — start a run when a chosen alert fires.
- **An incident opens** — start a run when an incident opens from a chosen alert.

Corrections you send on a run can be remembered so later runs of the same AutoResolve see them.

## Approve in Slack

Runs started by an alert or incident trigger send an approval card to the connected Slack channel, with **Approve** and **Decline** buttons. The card redraws as the run changes state.

## Notes

- Runs, saved AutoResolves, and connections are region-local; a trigger starts only the AutoResolves saved in the region that evaluates the alert or incident.
- A saved AutoResolve's trigger turns off if you edit it, until someone re-approves it.
