---
title: SSO Domain Restrictions
metaTitle: SSO Domain Restrictions User Guide - OpenObserve Enterprise
description: Learn how to configure SSO domain restrictions in OpenObserve Enterprise to control user access by email domains and enhance security.
---

> This feature is only available in the OpenObserve Enterprise Edition. 

This user guide provides step-by-step instructions for configuring and managing **SSO Domain Restrictions** in OpenObserve. <br>
This feature allows you to control which users can log in to OpenObserve using Single Sign-On (SSO) providers. You can allow or block specific domains or individual users from those domains.

:::note[Where to find]
The page is available in the `_meta` org under **Settings** > **SSO Management** (under **Access & Security**). The restrictions are in its **Domain Restrictions** section.
:::

:::note[Who can access]
`Root` user and any other user who has access to the `_meta` org can access the **SSO Management** page.
:::

## Add Domain Restrictions

:::accordion[Step 1: Add a new domain]
### Step 1: Add a new domain
1. In the **Domain and allowed users** section, enter the domain name in the text field. 
> Enter only the domain name, for example, `example.com` and do not include the `@` symbol. 
2. Click the **Add Domain** button. 
![Add a New Domain](../../../images/add-new-domain-sso-restrict-v2.png)
:::

:::accordion[Step 2: Configure Domain Access]

For each domain, you have four control options:

**Option 1: Allow All Users from Domain**<br>
It permits any user with an email address from the selected domain to log in using SSO. <br>
> **Use case:** Allow all employees from your company domain `@example.com`. 
<br>
![Allow all users](../../../images/allow-all-users-v2.png)

**Option 2: Allow Specific Users Only**<br>
It allows you to add individual email addresses that should be permitted to log in using SSO.<br> 
> **Use case**: Allow only certain users from a partner organization. For example, `e1@example1.com` and `e2@example1.com`. 

When **Allow only specific users** is selected:
<br>
![Allow only specific users](../../../images/allow-specific-users-v2.png)

1. Enter the complete email address in the input field. 
2. Click **Add Email**. 
3. The email address will be added to the allowed list. 
4. Repeat for additional users.
5. Use the **X** button next to any email to remove it. 

**Option 3: Block All Users from Domain**<br>
All external SSO users with email addresses from the domain are blocked from the system, including the UI, API and ingestion.

**Option 4: Block Only Specific Users**<br>
Enter each email address to block and click **Block Email**. 

> Blocked entries apply to external SSO identities only (SSO users and SSO/token service accounts). They override any allow rule and cover the UI, API and ingestion. Native and API-created accounts are not affected; delete those instead.
:::

:::accordion[Step 3: Save configuration]
### Step 3: Save configuration
1. Review your domain restrictions.
2. Click **Save** to apply the configuration. 
3. Click **Cancel** to discard changes. 
:::


## SSO claim parser

The same page has an **SSO Claim Parser** section. Use **Select Function** to pick a function from the `_meta` org that parses SSO/LDAP claims (such as email, name, groups and roles, as mapped in Dex) into organization and role assignments. The section also lists **Recent Errors (Last 24 Hours)** from the function.

## Domain limits 
There is no limit on the number of domains you can configure. Add as many domains and specific users as needed for your organization. 

## Error messages
When **SSO Domain Restrictions** are configured, any user attempting to log in from domains or email addresses that are **NOT** in the allowed list will see an `unauthorized` error during SSO login.

## Supported SSO login options
OpenObserve allows users to log in through the following Single Sign-On options, and domain restrictions apply to all of them:

- GitHub 
- GitLab
- Google
- Microsoft

Domain restrictions will be enforced when users attempt to log in using any of these SSO options.

## Troubleshooting
| **Problem**                               | **Solution**                                                         |
| ----------------------------------------- | -------------------------------------------------------------------- |
| SSO Management menu not visible.          | Verify that you are in the `_meta` organization.                     |
| Changes not taking effect.                | Ensure that you clicked **Save** and refresh the login page.         |



