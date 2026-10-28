---
title: Domain to Organization Mappings
description: >-
  Map email domains to organizations in OpenObserve Cloud so users who sign in
  are added to the right organization with the correct role automatically.
---

Domain to organization mappings add users to an organization automatically based on their email domain. When a user signs in with an email address whose domain matches a mapping, OpenObserve adds them to the mapped organization with a preset **base role**. You do not need to send an invitation.

:::info[Availability]
This feature is available in OpenObserve Cloud only. You configure it from the `_meta` organization.
:::

## How it works

Each mapping connects one email domain to one target organization:

- **Email domain**: the part of the email address after the `@` symbol, for example `acme.com`.
- **Organization**: the identifier of the organization that matching users are added to.
- **Base role**: the role matching users get in that organization: **Admin**, **Editor**, **Viewer**, or **User**.
- **Role claim** (optional): the name of a token claim that lists the user's custom roles, for example `groups`.

OpenObserve stores the mappings in the `_meta` organization's settings. Each time a user signs in, OpenObserve compares the domain of their email address against the mappings. The comparison is case-insensitive. If a mapping matches:

- If the user is not yet a member of the mapped organization, OpenObserve adds them with the base role and deletes any pending invitations they have for that organization. This applies to new users and to existing users who are not yet members.
- If the mapping has a role claim and the user's token carries that claim as a list, OpenObserve syncs the user's custom roles in that organization to the list. It assigns roles that are in the claim and removes custom roles that are not.

If the mapped organization is not active, for example because it is scheduled for deletion, OpenObserve skips the mapping and the user signs in normally.

## Access the section

1. Switch to the `_meta` organization using the organization selector in the top navigation bar.
2. Go to **Management** > **Organization Parameters**.
3. Scroll to the **Domain to organization mappings** section.

## Add a mapping

1. In the **Domain to organization mappings** section, click **Add mapping**.
2. In the **Add mapping** dialog, enter the following:
    - **Email domain**: enter only the domain, for example `acme.com`, without the `@` symbol. Each domain can have only one mapping.
    - **Organization**: enter the identifier of the target organization, not its display name.
    - **Base role**: select **Admin**, **Editor**, **Viewer**, or **User**. The default is **Admin**.
    - **Role claim** (optional): enter the name of the token claim that lists the user's custom roles, for example `groups`.
    - **Create claimed roles that don't exist in the organization**: this toggle appears only when **Role claim** is set. Turn it on to create custom roles named in the claim that do not yet exist in the target organization.
3. Click **Add**.
4. Click **Save** at the bottom of the page to save the organization settings.

The mapping appears in the list as `@<domain>` → `<organization>`, with a tag for the base role and, if set, the role claim.

:::note[Validation]
When you save, the organization must exist and be active, the domain must not be empty or contain spaces, and the base role must be one of the supported roles. Otherwise the save fails with an error.
:::

## Edit a mapping

1. In the mappings list, click the edit icon next to the mapping you want to change.
2. Update the fields in the **Edit mapping** dialog and click **Save**.
3. Click **Save** at the bottom of the page.

## Delete a mapping

1. In the mappings list, click the delete icon next to the mapping you want to remove.
2. In the **Delete Mapping** dialog, confirm the deletion.
3. Click **Save** at the bottom of the page.

After you delete a mapping, users who sign in with that domain are no longer added to the organization. Users who were already added keep their membership. When an organization is deleted, OpenObserve also removes the mappings that point to it.

## Troubleshooting

| **Problem** | **Solution** |
| --- | --- |
| The **Domain to organization mappings** section is not visible. | Make sure you are in the `_meta` organization on OpenObserve Cloud. The section is hidden in other organizations and in self-hosted deployments. |
| Saving fails with `No org with org id <id> found`. | The **Organization** field must contain the identifier of an existing organization. |
| The dialog shows `A mapping for this domain already exists`. | Each domain can have only one mapping. Edit the existing mapping instead. |
| A user is not added automatically. | Check that the domain of the user's email address exactly matches a mapping, and that the target organization is active. |
| Custom roles are not synced. | Check that the user's token contains the claim named in **Role claim**, and that its value is a list of role names. To have missing roles created, turn on **Create claimed roles that don't exist in the organization**. |
