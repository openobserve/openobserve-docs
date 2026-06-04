# Correlation Settings

This page explains how to use Correlation Settings in OpenObserve. These organization-level settings control how OpenObserve correlates your telemetry, mapping logs, metrics, and traces to the services they belong to.

!!! note "Enterprise feature"
    Correlation Settings is an Enterprise feature. The options described on this page are available only when Enterprise features are enabled for your organization.

## Overview

OpenObserve automatically discovers services from your telemetry and groups related logs, metrics, and traces so you can investigate them together. Correlation depends on recognizing which fields identify a service and which fields describe where that service runs. Because field names vary across instrumentation, languages, and platforms, OpenObserve lets you tune this behavior at the organization level.

Correlation Settings is where you configure that behavior. You define custom groups of semantically related fields, map alternate field names to a canonical correlation field, and control whether telemetry can be correlated even when it lacks an explicit service attribute. These settings feed the service discovery and telemetry correlation used by [Incident Management](../../analytics/incidents/index.md).

Open Correlation Settings from the **Settings** area. The page is organized into tabs, including **Discovered Services**, **Detection Rules**, **Alert Grouping**, and **Field Mappings**. This page focuses on the settings that control field semantics and service identity.

## Custom semantic field groups

A semantic field group maps a set of telemetry field names to a single, meaningful dimension. For example, `deployment`, `k8s.deployment.name`, and `kube_deployment` can all map to one `k8s-deployment` group. OpenObserve uses these groups to organize and correlate metric and log fields consistently, regardless of how each source names them.

OpenObserve ships with built-in groups organized into categories such as Kubernetes, AWS, Azure, GCP, and Common. You can extend these defaults by defining your own custom groups under the **Field Mappings** tab.

For each group, you configure:

- **Name**: The display name for the group as it appears in correlation views.
- **Category**: The category the group belongs to (for example, Kubernetes or AWS). Use the **Category** filter to view and organize groups by category.
- **Field names**: The comma-separated list of telemetry field names that map to this group.

To work with custom groups:

- Select **Add Custom Group** to define a new group, then enter a name, choose a category, and list the field names that map to it.
- Use **Export to JSON** to download your current groups and **Import from JSON** to load a group definition, which is useful for sharing configurations across organizations.
- Use the **Category** filter to narrow the list to a single category while editing.

!!! note "Note"
    The built-in `service` group is always present and cannot be deleted. It is used implicitly for correlation.

## Field aliases

Field aliases let you map alternate field names to a canonical correlation field, so telemetry that uses different names for the same concept still correlates correctly. You manage field aliases through the field group definitions on the **Field Mappings** tab, where each canonical group lists the alternate field names that resolve to it.

The **Field Mappings** editor uses an explicit save-and-discard workflow:

- After you edit a group, select **Save** to apply your changes. OpenObserve confirms with a success message when the field aliases are saved.
- The **Save** button is highlighted only when there are unsaved changes. Adding an empty group without filling in any details does not enable saving.
- If you switch tabs or leave the page with unsaved changes, OpenObserve prompts you to confirm before discarding them. You can choose **Discard changes** to leave or **Cancel** to stay and keep editing.

!!! note "Note"
    Saving field aliases takes effect immediately for correlation across logs, traces, and metrics.

## Correlate without service attribute

Some streams, such as metrics, may not carry an explicit service attribute like `service.name`, even though they share infrastructure attributes (for example, the same Kubernetes namespace) with streams that do, such as logs. The **Correlate without service attribute** setting lets OpenObserve correlate these streams using their shared attributes instead of requiring a service name.

You configure this option as part of the per-service identity setup, on the **Detection Rules** tab:

- **Correlate without service attribute**: When enabled, OpenObserve matches streams using only the disambiguation attributes you configure and ignores the service attribute. When disabled, correlation requires an explicit service attribute. This setting is disabled by default, which preserves the standard correlation behavior.

When this setting is enabled, OpenObserve relies on the disambiguation fields you define, such as cluster, namespace, or environment, to identify which telemetry belongs together.

!!! note "Note"
    Enabling this setting can cause multiple services in the same namespace or cluster to collapse into a single correlated group. Enable it only when your streams genuinely share an identity through their infrastructure attributes.

## Best practices

- Define custom semantic field groups that match the field names your instrumentation actually emits, so correlation works without manual mapping later.
- Keep field aliases up to date as you add new data sources, and save your changes before leaving the **Field Mappings** tab.
- Leave **Correlate without service attribute** disabled unless you have streams that lack a service attribute but share reliable infrastructure attributes.
- Review the **Discovered Services** tab after changing settings to confirm that services are correlated as expected.

## Related pages

- [Incident Management](../../analytics/incidents/index.md): Uses service correlation to group related telemetry and surface incidents.

## Next steps

- [Incidents](../../analytics/incidents/index.md): Investigate incidents built from correlated telemetry.
- [Service Graph](../../data-exploration/traces/service-graph.md): Visualize correlated services as an interactive topology.
- [Management](index.md): Return to the organization management overview.

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
