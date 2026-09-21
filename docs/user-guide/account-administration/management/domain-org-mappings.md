---
title: Domain to Organization Mappings
description: >-
  Map email domains to organizations in OpenObserve Cloud so new users are
  automatically added to the right organization with the correct role and group.
---

# Domain to Organization Mappings

Domain to organization mappings let you provision new users automatically based on their email domain. When a new user signs in with an email address whose domain matches a mapping, they are added to the mapped organization with a preset **base role** and, optionally, a **user group** — no manual invitation required.

!!! info "Availability"
    This feature is available in OpenObserve Cloud only. The section is configured from the **`_meta`** organization.

## How it works

Each mapping connects a single email domain to a target organization:

- **Email domain** — the part of the email address after the `@` symbol (for example, `acme.com`).
- **Organization** — the identifier of the organization matching users are added to.
- **Base role** — the role (`admin`, `editor`, `viewer`, or `user`) matching users are granted in that organization.
- **User group** (optional) — a group in the target organization that matching users also join.

The mappings are stored on the **_meta** organization's settings. On sign-in, OpenObserve compares the new user's email domain (case-insensitively) against the configured mappings. If it finds a match, the user is added to the mapped organization and group before the regular sign-in flow continues.

## Access the section

1. Switch to the **_meta** organization using the organization selector in the top navigation bar.
2. Navigate to **Settings** > **Organization Settings**.
3. Scroll to the **Domain to organization mappings** section.

![TODO: screenshot of the Domain to organization mappings section in Organization Settings](images/placeholder.png)

## Add a mapping

1. In the **Domain to organization mappings** section, click **Add mapping**.
2. In the **Add mapping** dialog, enter the following:

    - **Email domain** — enter only the domain name, for example `acme.com`, without the `@` symbol.
    - **Organization** — enter the identifier of the target organization.
    - **Base role** — select the role to assign to matching users: `admin`, `editor`, `viewer`, or `user`.
    - **User group** (optional) — enter the name of a group in the target organization that matching users should also join.

3. Click **Add**.

![TODO: screenshot of the Add mapping dialog](images/placeholder.png)

The mapping appears in the list as `@<domain>` → `<organization>`, with a tag for the base role and, if set, the user group.

![TODO: screenshot of the domain mappings list with a configured mapping](images/placeholder.png)

!!! note "Validation"
    The organization must exist and the base role must be one of `admin`, `editor`, `viewer`, or `user`. If you specify a user group, it must already exist in the target organization; otherwise the save fails with an error.

## Edit a mapping

1. In the mappings list, click the edit icon next to the mapping you want to change.
2. Update the fields in the **Edit mapping** dialog.
3. Click **Save**.

## Delete a mapping

1. In the mappings list, click the delete icon next to the mapping you want to remove.
2. In the confirmation dialog, click **Delete**.

A deleted mapping no longer provisions new users for that domain. Existing users who were already added to an organization are not affected.

## Troubleshooting

| **Problem** | **Solution** |
| --- | --- |
| The **Domain to organization mappings** section is not visible. | Verify you are in the **_meta** organization and using OpenObserve Cloud. The section is hidden in non-cloud deployments and outside the **_meta** org. |
| Saving fails with `No org with org id <id> found`. | The **Organization** field must reference an existing organization identifier. |
| Saving fails because the user group is not found. | The **User group** must already exist in the target organization before you reference it in a mapping. |
| A new user is not added automatically. | Confirm the user is signing in with an email domain that exactly matches a configured mapping (the comparison is case-insensitive). |
