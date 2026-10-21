---
title: Slack Integration
description: Install the two-way Slack app to link accounts, ask OpenObserve questions from Slack, and manage workspaces, channels, and access.
---

# Slack Integration

The two-way Slack app brings OpenObserve into your workspace. Team members link their accounts once, then ask questions of your data directly from Slack and get answers that use their own OpenObserve permissions. Admins install the app, link people, map channels to organizations, and manage access from **Settings**. Alerts keep using today's Slack webhook destination; this integration is for asking OpenObserve from Slack.

## Availability

The Slack app is an OpenObserve Enterprise feature and is **off by default**. It turns on only when all of the following hold:

- `O2_SLACK_ENABLED` is set.
- A master encryption key (`O2_MASTER_ENCRYPTION_KEY`) is set and active, so Slack tokens are stored encrypted.
- The instance is not a super cluster.

Until then no Slack tasks start, the `/api/slack/*` routes return `404`, and the UI shows no Slack entry. There is no per-organization switch; the setting is global.

:::note[Rollback]
To disable Slack again, set `O2_SLACK_ENABLED=false` and restart. Rolling the binary back across the Slack table migration is not supported.
:::

## Prerequisites

Before you can install the app, the **Settings > Slack** page runs a prerequisite check. Each check shows a pass, warning, or failure, and names the environment variable to fix:

- **Master key** — `O2_MASTER_ENCRYPTION_KEY` is set and active.
- **Delegation key** — derived from the master key, or set with `ZO_DELEGATION_SIGNING_KEY`.
- **Web URL** — `ZO_WEB_URL` is a public HTTPS URL (needed for OAuth redirects and account links).
- **Agent** — the AI assistant is reachable and `O2_AI_INTERNAL_SECRET` is set.

![TODO: screenshot of the Slack prerequisites checklist on the Settings page](images/placeholder.png)

## Install the app

From **Settings > Slack**, install the app for your workspace. The flow depends on your deployment:

- **Cloud** — use the **Add to Slack** OAuth flow to authorize the app.
- **Self-hosted** — use a configuration token that creates the app from the manifest, or paste your app credentials. You can run the app in **Socket Mode** or **HTTP mode**, and test the connection before finishing.

Once installed, the workspace appears as a card with its status, connection mode, and health. From the card you can test connectivity, take over the app, or uninstall it.

![TODO: screenshot of the Slack settings page with an installed workspace card](images/placeholder.png)

![TODO: screenshot of the self-hosted Slack install wizard](images/placeholder.png)

## Link accounts

A Slack user must link their OpenObserve account before they can ask questions. Linking can happen automatically or on demand:

- **Automatic by email domain** — users whose Slack email matches a configured domain are linked automatically.
- **Domain mapping** — enter the specific domains to match manually.
- **Sign in with Slack** — an individual user links their account in one click, including via SSO when there is no active OpenObserve session.
- **Link all** — an admin links every matching member of the organization in one action.

The linking section shows how many people are linked by each method, how many matches are not yet linked, and any domains that were skipped.

![TODO: screenshot of the account linking section with email domains and Link all](images/placeholder.png)

## Ask OpenObserve from Slack

Once linked, users ask questions in several ways:

- **`/o2 ask <question>`** — ask privately; the answer arrives in a direct message.
- **Mention the bot in a channel** — the answer is posted in the message thread.
- **App Home** — the app's **Home** tab shows the linked account, an **Unlink** button, and example questions you can ask in one click.

The answer is read-only and uses the asker's own OpenObserve permissions. When you belong to several organizations, OpenObserve decides which one answers using, in order: an `in:<org>` word in the question, an OpenObserve link in the question, the thread's organization, a shared link, the channel's default, then your personal default organization. Use **Re-ask in** on an answer to change which organization a thread uses.

Other slash commands:

- **`/o2 org [name]`** — show or set your default organization, for direct messages and channels without a default.
- **`/o2 link`** / **`/o2 unlink`** — link or unlink your account.
- **`/o2 help`** — list every command and your link status.

![TODO: screenshot of the Slack App Home tab with link status and example questions](images/placeholder.png)

## Configure channels

For each channel you can set a default organization and an **answer mode**:

- **Thread** — the answer is posted in the channel thread (default).
- **Private** — the answer is sent by direct message instead.

Channel defaults decide which organization answers when nothing else in the question names one, and where the answer appears.

![TODO: screenshot of the Slack channel defaults table](images/placeholder.png)

## Instance workspace (self-hosted)

On a self-hosted instance, a `_meta` Admin can install a single **instance workspace** that serves every organization, or only the organizations you list. Individual organization Admins then map their own channels and link their own people.

An organization removed from an instance workspace gets a one-time note in its threads (including direct-message threads), and no further turn runs in that organization. Disconnecting or uninstalling the workspace cleans up its data at once.

![TODO: screenshot of the instance workspace org access list](images/placeholder.png)

## Permissions

The Slack app is governed by the same role-based access control as the rest of OpenObserve, through the `slack_integration` OpenFGA type. Read access maps to **LIST**, writes to **PUT**, and deletes to **DELETE**. When OpenFGA is disabled, handlers require an organization Admin.

## Configuration

| Environment variable | Default | Purpose |
| --- | --- | --- |
| `O2_SLACK_ENABLED` | `false` | Enable the two-way Slack app. Requires `O2_MASTER_ENCRYPTION_KEY`. |
| `O2_SLACK_CA_BUNDLE_PATH` | *(empty)* | Extra PEM root certificates for Slack calls, for proxies that re-sign TLS. |
| `O2_SLACK_THREAD_TTL_DAYS` | `7` | Days a Slack thread keeps its assistant session after its last activity. |
| `O2_SLACK_SOCKETS_PER_INSTALL` | `2` | Socket Mode connections per installation. |
| `O2_SLACK_STATUS_INTERVAL_MS` | `3000` | Minimum gap between progress edits of a Slack answer, in milliseconds. |
| `O2_SLACK_SIGNING_SECRET` | *(empty)* | Signing secret of the Cloud Slack app; verifies Slack's HTTP requests. |

## Deploy order

Because Slack depends on both OpenObserve and the AI assistant, deploy in this order:

1. Deploy OpenObserve and OpenObserve Enterprise with Slack off.
2. Deploy the AI assistant, with `O2_INTERNAL_API_SECRET` equal to `O2_AI_INTERNAL_SECRET`.
3. Turn Slack on only after both are deployed. On Cloud, enable it only in the region the Slack app's Request URLs point at.
