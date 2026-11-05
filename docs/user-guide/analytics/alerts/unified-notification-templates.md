---
title: Unified Notification Templates
description: "Scope notification templates to the kinds they apply to and override the message for anomaly detection, on-call, and synthetics notifications."
---

# Unified Notification Templates

Every notification OpenObserve sends — an alert, an anomaly, a synthetics check, a downtime, or an on-call page — is rendered from a template. One template system serves all of them: you scope a template to the kinds it applies to, and you can override the message per feature.

## Notification kinds

Templates and overrides are scoped to six kinds: **Alert**, **Incident**, **Anomaly**, **Synthetics**, **Downtime**, and **On-call**. A template with no scope (the default) applies to every kind.

## Set what a template applies to

In the template editor, the **Applies to** field lists the six kinds. Leave it at the default **All kinds**, or pick one or more kinds. A template scoped to **Anomaly** only, for example, is offered only when you configure anomaly notifications.

By default the scope is **Inferred from the variables in the body**: if the body uses a variable only one kind fills (such as `{anomaly_score}`), OpenObserve infers that kind. Select **Chosen by you** to set the scope manually, and **Reset to inferred** to go back to the inferred value.

## Override the template per feature

A **Template override** picks one template to send for a feature, replacing whatever each destination would otherwise use. The field appears where notifications are configured:

- **Anomaly detection** — the **Alerting** tab of an anomaly rule.
- **On-call** — the policy editor.
- **Synthetics** — the alerts section of a check.

Leave the override empty (the default, **Use the destination's template**) and each destination uses its own template when it applies to that kind, then a built-in message.

Prebuilt templates cannot be chosen as an override — copy one first (see below).

## How a message is chosen

For one destination and one kind, OpenObserve resolves the template in this order:

1. The feature's **Template override**, when it is set and fits the destination.
2. The destination's own template, when it applies to the kind.
3. A built-in message for the kind.

An override that does not fit some of the selected destinations is skipped for those, which fall back to their own templates.

## Prebuilt templates

OpenObserve ships read-only prebuilt templates for common channels: Slack, Teams, PagerDuty, Discord, webhook, Opsgenie, ServiceNow, Jira, and email. They are tagged **Prebuilt**, cannot be edited or deleted directly, and cannot be chosen as a template override. Use **Clone** to make a modifiable copy.

## Related

- [Templates](../../account-administration/management/templates.md) — the template editor, content and raw payload kinds, preview, and test-send.
- [Anomaly Detection](anomaly-detection.md)
- [Downtimes](downtimes.md)
- [Notification Dependencies](notification-dependencies.md)
