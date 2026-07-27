---
description: "Extend the OpenObserve AI agent with organization-scoped custom toolsets: MCP servers, CLI tools, Markdown skills, and generic configs for the SRE Agent."
---

# Custom AI Toolsets

Custom AI Toolsets let you define organization-scoped tools and skills that the OpenObserve AI agent loads into its set of available capabilities, so the SRE Agent and AI Assistant can act on systems and knowledge specific to your environment.

> **Enterprise feature.**

## Overview

The OpenObserve AI agent ships with a built-in set of tools for querying and reasoning over your observability data. Custom AI Toolsets extend that set with capabilities you define yourself, scoped to a single organization.

A toolset is a named configuration that the agent loads at request time. Depending on its kind, a toolset can connect the agent to a remote Model Context Protocol (MCP) server, allow it to run an approved command-line tool, teach it a reusable skill written in Markdown, or supply a generic JSON configuration. When you start a chat session or trigger a root-cause analysis (RCA), OpenObserve loads the organization's toolsets and passes them to the agent alongside the request.

Custom AI Toolsets are managed from the OpenObserve UI and through a REST API. Each toolset's configuration is encrypted at rest using per-organization envelope encryption, and access is controlled through role-based access control (RBAC).

## Toolset kinds

Every toolset has a **kind** that determines how the agent uses it and what its configuration (`data`) contains. OpenObserve supports four kinds.

| Kind | Purpose | Configuration (`data`) |
|------|---------|------------------------|
| `mcp` | Connect the agent to a remote Model Context Protocol server that exposes additional tools. | MCP endpoint URL, request headers, and a request timeout. |
| `cli` | Allow the agent to run an approved command-line tool. | Command, allowed subcommands, environment variables, credential files, and a confirmation requirement before execution. |
| `skill` | Teach the agent a reusable skill or procedure. | A Markdown skill definition. |
| `generic` | Supply an arbitrary configuration for the agent to consume. | A free-form JSON object. |

The configuration for each kind is stored in the toolset's `data` field as a kind-specific JSON payload. A toolset whose kind needs no configuration can omit `data`.

### MCP toolsets

An `mcp` toolset points the agent at a remote MCP server. The agent connects to the server's endpoint and makes the tools that the server exposes available during a session. Configure the MCP endpoint URL, any request headers the server requires (for example, an authorization header), and a timeout for requests to the server.

### CLI toolsets

A `cli` toolset lets the agent run a specific command-line tool. To keep execution constrained, you define which command may run, the subcommands that are allowed, environment variables to pass, and any credential files the command needs. You can also require confirmation, so the agent must obtain user approval before the command runs.

### Skill toolsets

A `skill` toolset provides a skill definition written in Markdown. Use it to capture a reusable procedure, runbook, or domain knowledge that the agent should follow.

### Generic toolsets

A `generic` toolset holds a free-form JSON configuration. Use it when the agent expects a configuration shape that does not match the other kinds.

## Managing toolsets

Manage toolsets from the OpenObserve UI under **Management > AI Toolsets**.

### Create a toolset

1. Go to **Management > AI Toolsets**.
2. Click **Create**.
3. Enter a **Name** for the toolset. The name must be unique within the organization.
4. Select the **Kind**: `mcp`, `cli`, `skill`, or `generic`.
5. Optionally enter a **Description**.
6. Fill in the kind-specific configuration. See [Toolset kinds](#toolset-kinds) for the fields each kind expects.
7. Click **Save**.

### Edit a toolset

1. Go to **Management > AI Toolsets**.
2. Select the toolset you want to change.
3. Update the description or configuration. When you provide new configuration data, it fully replaces the existing configuration.
4. Click **Save**.

### Delete a toolset

1. Go to **Management > AI Toolsets**.
2. Select the toolset you want to remove.
3. Click **Delete** and confirm. Deletion is permanent.

## How toolsets are used

When a request reaches the AI agent through a chat session or an RCA trigger, OpenObserve loads the organization's toolsets and includes them with the request to the SRE Agent. The agent then has those tools available while it works on the request. This means changes you make to an organization's toolsets apply to subsequent agent requests for that organization.

## API reference

Custom AI Toolsets are available through a REST API. All endpoints are scoped to an organization by `org_id` and require enterprise deployments. The RBAC resource for these endpoints is `ai_toolsets`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/{org_id}/ai/toolsets` | List toolsets for the organization. |
| `POST` | `/api/{org_id}/ai/toolsets` | Create a toolset. |
| `GET` | `/api/{org_id}/ai/toolsets/{id}` | Get a single toolset by id. |
| `PUT` | `/api/{org_id}/ai/toolsets/{id}` | Update a toolset's description and/or configuration. |
| `DELETE` | `/api/{org_id}/ai/toolsets/{id}` | Delete a toolset. |

### Toolset fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | The toolset's identifier (a 27-character KSUID), generated on create. |
| `name` | String | Unique name within the organization. |
| `kind` | String | One of `mcp`, `cli`, `skill`, or `generic`. |
| `description` | String | Optional description. |
| `data` | JSON | Kind-specific configuration. Omitted when no configuration is needed. |
| `created_by` | String | The user who created the toolset. |
| `created_at` | Int | Creation time, in microseconds. |
| `updated_at` | Int | Last update time, in microseconds. |

### List query parameters

The list endpoint accepts the following optional query parameters:

| Parameter | Description |
|-----------|-------------|
| `name` | Case-insensitive substring filter on the toolset name. |
| `kind` | Exact filter on the kind: `mcp`, `cli`, `skill`, or `generic`. |
| `limit` | Maximum number of results to return. |

### Create a toolset

Send a `POST` request with the toolset's `name`, `kind`, optional `description`, and kind-specific `data`:

```shell
curl -X POST "https://<your-openobserve-host>/api/{org_id}/ai/toolsets" \
  -H "Authorization: Basic <base64_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "incident-runbook",
    "kind": "skill",
    "description": "Runbook the agent follows during incidents",
    "data": { "content": "# Incident runbook\n..." }
  }'
```

On success, the API returns the created toolset, including its generated `id`. Creating a toolset whose name already exists in the organization returns a `409 Conflict`.

## Notes

- **Encryption at rest**: A toolset's `data` configuration is encrypted at rest using per-organization envelope encryption. OpenObserve auto-provisions a per-organization data encryption key (DEK) and uses it to encrypt and decrypt toolset configuration transparently, so configuration values such as MCP headers and CLI credentials are not stored in plaintext.
- **RBAC**: Access to the toolset API and UI is governed by the `ai_toolsets` RBAC resource. Grant the appropriate permissions on this resource to users who need to view or manage toolsets.
- **Uniqueness**: Toolset names must be unique within an organization.
- **Updates replace configuration**: When you update a toolset and provide new `data`, it fully replaces the existing configuration rather than merging with it.
