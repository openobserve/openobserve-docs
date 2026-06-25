# Billing Groups

Billing groups let you link multiple organizations under one parent so the parent pays for all child organizations' usage, with a single consolidated bill.

> Applicable to cloud version only

## Overview

A billing group consists of one **super org** (the payer) and one or more **child orgs** (members). The super org is billed for its own usage plus all usage from its child orgs. Child orgs cannot manage their own payment plans or invoices — billing is handled entirely by the super org.

An organization can play only one role at a time: it cannot be both a child of another org's group *and* a super org with its own members.

### Which orgs can be super orgs

- The org must have an active paid subscription with **Stripe** or an **external contract** (NoOp provider).
- The org must be listed in the `O2_BILLING_GROUP_ALLOWED_ORGS` environment variable (a comma-separated list of organization identifiers).
- AWS Marketplace and Azure Marketplace subscriptions cannot act as super orgs.

### Which orgs can be child orgs

- The org must have **no existing payment method or subscription** set up.
- The org must not already be a member of another billing group.
- The org cannot have its own billing group members.

## Managing a billing group

### Super org view

Navigate to **Billings** in the sidebar and select the **Billing Group** tab. If your organization has active members or pending invites, you see the super org management view:

![TODO: screenshot of Billing Group tab showing super org view with stat cards and member table](../../images/placeholder.png)

The view shows:

- **Total Child Orgs** — active members plus pending invites
- **Active** — organizations that have accepted membership
- **Pending Invites** — organizations that have been invited but haven't yet accepted or rejected

Use the filter tabs (**All**, **Active**, **Pending**) to narrow the member table. Each row shows the child organization's identifier, name, status, who invited them, who accepted, and the date.

Select **View Usage** to go to the usage page, where a member selector sidebar lets you switch between viewing your own usage and each child org's usage individually.

### Inviting an organization

Select **Invite Organization** at the top of the Billing Group page. In the drawer that opens, enter the **Organization Identifier** of the org you want to invite and select **Send Invite**.

![TODO: screenshot of Invite Organization drawer with organization identifier field](../../images/placeholder.png)

The invited org must exist, cannot already be part of another billing group, and cannot have an existing payment method. Invites expire after 7 days.

## Joining a billing group

### Received invites

When your org is invited to join a billing group, you see pending invites on the Billing Group tab. Each row shows the inviting org's name, identifier, who invited you, and the date.

![TODO: screenshot of Billing Group tab showing received invites table with accept and reject buttons](../../images/placeholder.png)

Select **Accept** to join the group. Your org's billing is now managed by the super org — usage is billed to them and plan/invoice management is locked.

Select **Reject** to decline the invitation.

### Child org view

After accepting an invitation, the Billing Group tab shows a hero view confirming that your billing is managed by the parent organization:

![TODO: screenshot of Billing Group tab showing child org hero view with billing managed by parent](../../images/placeholder.png)

The view displays:

- **Invited By** — the user who sent the invitation
- **Accepted By** — who accepted (or "Added On Creation" if the org was created as a child)
- **Member Since** — the date membership started

Select **View Usage** to see your org's usage data.

### Plans page as a child org

When your org is a child of a billing group, the **Plans** tab is replaced with a panel confirming that billing is managed by the parent organization. Plan changes, subscriptions, and invoices are all handled by the super org.

![TODO: screenshot of Plans page showing managed billing panel for child org](../../images/placeholder.png)

Select **View Organization Group** to navigate to the Billing Group tab.

## Creating an organization as a billing member

When creating a new organization, a **Add this organization as a billing member** checkbox appears if your current organization is enabled for billing groups (listed in `O2_BILLING_GROUP_ALLOWED_ORGS`).

![TODO: screenshot of Create Organization dialog with billing member checkbox](../../images/placeholder.png)

Select the checkbox and the new organization is automatically added as a child member of your current org — no invitation or acceptance flow needed.

## Viewing member usage

If your org has child members, the **Usage** tab shows a member selector sidebar on the left. Select a member organization or **Current Organization** to switch between viewing your own usage and each member's usage data individually.

![TODO: screenshot of Usage page with member selector sidebar showing child org list](../../images/placeholder.png)

## Configuration

Enable billing groups by setting the environment variable:

```
O2_BILLING_GROUP_ALLOWED_ORGS=org-a,org-b,org-c
```

This comma-separated list specifies which organizations are allowed to act as super orgs. Organizations not in this list cannot invite other orgs or be made super orgs during org creation.

> This environment variable only applies to the **cloud** edition. It is not available in the open-source or standalone enterprise editions.

## Related pages

- [Organizations](identity-and-access-management/organizations.md)
- [Billing & Plans](management/general-settings.md)
- [RBAC](identity-and-access-management/role-based-access-control.md)
