---
title: Domain Management
description: Link your email domains to your organization, map their users to organizations, and block specific users from joining.
---

# Domain Management

Domain Management lets an organization claim its email domains, auto-provision users by domain, and block individual users. Link a domain and prove ownership with a DNS TXT record (or request that OpenObserve link it), then map the domain's users to an organization, optionally remove mapped users from other organizations, and block specific users.

:::info[Availability]
This feature is available in OpenObserve Cloud only.
:::

To open it, go to **Settings** > **Domain management** (under **Access & Security**). The page has four tabs: **Linked domains**, **Mappings**, **Blocked users**, and **Link requests** — the last appears only in the `_meta` organization.

## Link a domain

On the **Linked domains** tab, click **Link domain**, enter the email domain (for example `acme.com`, without the `@`), and choose how to prove ownership:

- **Add a DNS TXT record**: OpenObserve shows a DNS TXT record to publish at your DNS provider. Ownership is verified automatically, every 5 minutes, once the record is published. Best when you manage the domain's DNS.
- **Request a link from OpenObserve**: OpenObserve reviews the request and links the domain once approved, without a DNS record.

The table lists each domain with its **Status** (**Verified**, **Pending**, **Failed**, **Awaiting approval**, or **Rejected**), **Linked via** (**DNS record**, **Approved request**, or **Link request**), and **Last checked**. Open a domain's **Details** to see the TXT record, run **Verify now**, or read the request outcome. If the record is missing for more than 30 minutes, the domain is marked **Failed** and its mappings stop applying, so keep the record in place. **Remove domain** unlinks the domain and drops its mappings.

## Map a domain's users

On the **Mappings** tab, click **Add mapping** to add users of a verified domain to an organization automatically:

- **Email domain**: a domain you have linked and verified.
- **Organization**: this organization or one of its billing-group members.
- **Base role**: the role a user gets when added (**Admin**, **Editor**, **Viewer**, or **User**).
- **Role claim** (optional): an SSO token claim that lists the user's custom roles, synced on each sign-in.
- **Create claimed roles that don't exist in the organization**: create custom roles named in the claim that are missing.

Mappings for unverified domains are tagged **Not verified** and are skipped. Turn on **Remove users from other organizations** so a mapped user who signs in through SSO is removed from every organization outside this one and its billing group, including their personal organizations.

## Block users

On the **Blocked users** tab, click **Block users**, choose one of your verified domains, and add the emails to block. Blocked users cannot join this organization or its billing-group members through SSO, and are removed from them at their next sign-in. **Unblock all** clears a domain's list.

## Review link requests

In the `_meta` organization, the **Link requests** tab lists domains that organizations asked OpenObserve to link. Filter by **Pending** or **All**. **Approve** links a domain without a DNS check; **Reject** requires a reason, which the requesting organization can see. Both apply only to pending requests.
