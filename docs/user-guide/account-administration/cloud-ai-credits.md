# AI Credits (Cloud)

AI Credits are a shared pool of free credits that every OpenObserve Cloud organization can spend on AI-powered features such as AI chat and incident analysis.

> **Note**: AI Credits apply to **OpenObserve Cloud only**. They are not available in self-hosted deployments.

## Overview

Every OpenObserve Cloud organization receives a single, shared lifetime pool of free AI credits. This pool is drawn down as you use AI features across the organization, and it is shared by all members and all AI features rather than allocated per user or per feature.

AI Credits let you try OpenObserve's AI features without configuring billing first. You can monitor how much of the pool you have consumed at any time, both in the user interface and through the API.

Once the free pool is exhausted, the behavior depends on whether your organization has an active paid subscription. Paid organizations continue using AI features with pay-as-you-go billing. Organizations without a subscription lose access to paid AI actions until they subscribe.

## What consumes credits

The free credit pool is shared across all AI features. The following actions draw down credits:

### AI chat

Each message you send to OpenObserve's AI chat consumes credits from the shared pool.

### Automatic incident creation

When an alert correlates into a new incident, OpenObserve performs AI analysis as part of creating that incident. This consumes credits from the shared pool.

### Incident RCA reanalysis

Re-running root cause analysis (RCA) on an existing incident consumes credits. This applies to reanalysis runs that happen after an incident is first created, whether triggered automatically by the incident lifecycle or manually by a user.

> **Note**: All AI features draw from the same shared pool. There is no separate per-feature allowance.

## Credit exhaustion behavior

When the free pool runs out, OpenObserve behaves differently for each AI feature and for paid versus unpaid organizations.

### Paid organizations (pay-as-you-go)

If your organization has an active paid subscription, AI features keep working after the free pool is exhausted. Additional usage overflows to pay-as-you-go billing, and the cost is billed to your subscription through Stripe.

### Unpaid organizations

If your organization does not have an active subscription, behavior depends on the feature:

| AI feature | Behavior when the free pool is exhausted |
|------------|------------------------------------------|
| **AI chat** | The request is rejected with HTTP `402 Payment Required`. |
| **Automatic incident creation** | AI-driven incident creation is silently skipped. The underlying alert still fires and notifies as configured. |
| **Incident RCA reanalysis** | Reanalysis is silently skipped. |

> **Warning**: For unpaid organizations, incident creation and RCA reanalysis are skipped without an error once credits are exhausted. Alerts continue to fire, but you will not get AI-generated incidents or reanalysis until you subscribe.

## Monitoring your usage

You can track AI credit consumption from the OpenObserve Cloud user interface or programmatically through the API.

### AI Credits card on the billing plans page

The billing plans page includes an **AI Credits** card that shows your current usage at a glance:

- A progress bar showing the proportion of the pool consumed.
- The number of credits used and the pool limit, shown as `credits used / credits limit`.
- A status badge indicating the current mode:
    - **Free**: Credits remain in the pool.
    - **Pay as you go**: The free pool is exhausted and usage is billed to your subscription.
    - **Exhausted**: The free pool is exhausted and there is no active subscription.

When the pool is exhausted, the card also shows a message prompting you to subscribe to continue using AI features. When usage has overflowed to pay-as-you-go, the card shows a message indicating that usage is billed to your subscription.

### AI Credits tile on the usage page

The usage page includes an **AI Credits** tile alongside the other usage metrics, giving you a quick summary of AI credit consumption.

### AI usage API

Retrieve current AI credit usage programmatically with the following endpoint:

```
GET /api/{org_id}/ai/usage
```

The response reports the single shared pool for the organization:

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | Current usage mode: `free`, `pay_as_you_go`, or `exhausted`. |
| `credits_used` | number | Credits consumed from the pool. |
| `credits_limit` | number | Total size of the free credit pool. |
| `credits_remaining` | number | Credits still available in the pool. |

The `mode` field is derived from the organization's state:

- `free`: Credits remain in the pool.
- `pay_as_you_go`: The pool is exhausted and the organization has an active subscription.
- `exhausted`: The pool is exhausted and the organization has no active subscription.

### Usage stream events

AI credit activity is recorded in the `_usage` stream, so you can build your own dashboards and queries on top of it. The following event types are emitted:

| Event | Description |
|-------|-------------|
| `AiChat` | Recorded for AI chat activity. |
| `AiFreeCredits` | Informational record of credits drawn from the free pool. Not billed. |
| `AiCredits` | Billable pay-as-you-go usage for paid organizations after the free pool is exhausted. Billed to your subscription. |

## Notifications

OpenObserve emails your organization administrators as the free credit pool is consumed, so you can subscribe or plan ahead before AI features are interrupted.

Notification emails are sent when usage crosses each of these checkpoints:

- 80% of the pool used
- 90% of the pool used
- 95% of the pool used
- 100% of the pool used (exhausted)

Each checkpoint is sent once. The message content adapts to whether your organization is on a paid plan:

- **Paid organizations** are told that usage will continue under pay-as-you-go billing once the free pool is exhausted.
- **Unpaid organizations** are prompted to subscribe to avoid losing access to AI features.

> **Tip**: To stay ahead of exhaustion, monitor the **AI Credits** card on the billing plans page or poll the `GET /api/{org_id}/ai/usage` endpoint, and subscribe to a plan before the pool runs out.

## Next steps

- [Incidents](../analytics/incidents/index.md): Learn how incidents are created and analyzed, which draws down AI credits.
- [SRE Agent](../../enterprise-setup/sre-agent.md): Explore the AI-powered SRE Agent for automated investigation.
- [AI integrations](../../integration/ai/index.md): Configure AI providers and models for OpenObserve's AI features.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
