---
title: Slack Alerts
description: "Act on alerts from Slack: post each firing with acknowledge, mute, and investigate buttons, and auto-investigate critical alerts."
---

# Slack Alerts

With the Slack app connected, OpenObserve turns each alert firing into a Slack message it edits in place as the alert is acknowledged, escalates, is muted, or recovers, with buttons to respond without leaving Slack. Installing the app and linking accounts is covered in [Slack Integration](./slack.md).

## Add a Slack app destination

A Slack app destination posts alert notifications to Slack as interactive messages. Open **Alerts > Destinations**, click **Add Destination**, and pick the **Slack app** tile (tagged **Recommended for alert response**). Choose a **Workspace** and a **Channel**, then set:

- **Mention**: who the message pings on repeats and level upgrades — **@here for critical, none for others** (the default), **@here**, **@channel**, **None**, or a subteam.
- **Re-fire reuse (minutes)**: a re-fire within this time edits the earlier message instead of posting a new one.
- **Acknowledge, Mute and Investigate buttons**: add the action buttons. **Resolve** is added when the firing has an incident or on-call page.
- **Investigate automatically for critical alerts**: runs the AI investigation as the org's AI service account and posts the findings in the alert thread.
- **Template**: keep the **Default Slack template** or pick your own.

Click **Send test** to post a sample message. A Slack app destination cannot be an on-call team's channel, and posting to a channel shared outside the workspace, or to an on-call room, needs a confirmation tick before it saves.

You can also switch an existing Slack webhook destination to the app: on the destination, use **Switch to Slack app**. Its name, template, and alerts stay the same, and **Switch back** restores the webhook.

## Act on alerts from Slack

Each firing is one message, edited in place as its state changes. Level changes and recoveries also post a thread reply. When buttons are enabled on the destination, the message carries:

- **Acknowledge**, or **Take over** when someone else already holds the acknowledgment.
- **Mute**, a menu of quick mutes — **Until it clears**, **30 min**, **1 h**, **4 h**, and **24 h · asks to confirm** (plus **Mute all groups of this alert** for grouped alerts). The 24-hour mute opens a private prompt to confirm, because Slack cannot confirm a single menu option. Muting also snoozes your open on-call page.
- **Extend** to lengthen a mute, and **Unmute**.
- **Investigate** to run the AI investigation and post the verdict in the thread.
- **Resolve** when the firing has an incident or on-call page.

Button clicks are checked against the org role, or a seat on the team being paged; a refusal is a private reply naming who is needed.

## Investigate automatically

Turn on **Investigate automatically for critical alerts** and critical firings run the AI root-cause analysis on their own. The verdict, or the reason it was skipped, is posted in the alert thread, alongside the **Open analysis in OpenObserve** link. At most one automatic investigation runs per alert at a time.

## Digests and outages

A per-workspace send budget keeps an alert storm from flooding a channel. Once the burst is spent, further alerts fold into one digest message per channel (**N alerts firing in #channel · digest**) instead of individual posts.

When Slack is unreachable for a while, OpenObserve stops retrying and, once Slack returns, posts one notice saying when it was unreachable.

## On-call readiness

In the **Linking** section of **Settings > Slack**, a card lists on-call members whose Slack account is not linked, with their team and next shift. Click **Remind them** to send each a direct message. OpenObserve also reminds a member before a shift starts. Acknowledgments made from the on-call page appear in Slack.

## Permissions

Acting on an alert from Slack requires the **Admin** or **Editor** role in the org, or a seat on the team being paged. A refusal is a private reply naming who is needed. Adding or editing destinations needs the usual destination permissions.
