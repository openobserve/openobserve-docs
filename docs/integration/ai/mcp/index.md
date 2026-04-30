---
description: >-
  Connect AI agents and IDEs to OpenObserve using the Model Context Protocol (MCP).
  Query logs, metrics, and traces in natural language; create alerts; and explore stream metadata
  from Cursor, VS Code, Claude Code, Claude Desktop, Windsurf, ChatGPT, or custom agents.
---

# Model Context Protocol (MCP)

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard introduced by Anthropic that defines how AI applications connect to external tools and data sources. It's analogous to LSP for editors: one protocol, many clients, many servers.

You can connect your AI agents and IDEs to your OpenObserve instance to query logs, metrics, and traces in natural language; create and manage alerts; and explore stream metadata directly from your editor or agent runtime. MCP enables:

- **Natural-language queries** against logs, metrics, and traces from your IDE
- **Agentic operations** like alert creation as part of CI/CD pipelines
- **AI-assisted troubleshooting** where an agent can pull stream data, correlate traces, and suggest root causes

!!! note
    MCP is supported in the Enterprise edition of OpenObserve.

## Prerequisites

Set the following environment variables on your OpenObserve instance:

```bash
O2_TOOL_API_URL="http://localhost:5080"
O2_AI_ENABLED="true"
```

!!! note
    `O2_TOOL_API_URL` is the address OpenObserve uses to call its own REST API internally. `http://localhost:5080` is correct for a local process. For containerized or remote deployments set it to the address at which the OpenObserve API is reachable from within the same environment (e.g. the service name in Docker Compose).

Your MCP endpoint follows the pattern:

```
https://your-instance/api/{org_id}/mcp
```

Generate a Base64-encoded auth token from your OpenObserve credentials:

```bash
echo -n "your-email@example.com:your-password" | base64
```

You'll use this token in every client below.

## Connect to OpenObserve's MCP server

=== "Cursor"

    Add the following to `~/.cursor/mcp.json`. See the [Cursor documentation](https://cursor.com/docs/mcp) for more details.

    ```json
    {
      "mcpServers": {
        "openobserve": {
          "url": "https://your-instance/api/default/mcp",
          "headers": {
            "Authorization": "Basic <YOUR_BASE64_TOKEN>"
          }
        }
      }
    }
    ```

=== "VS Code"

    Add the following to `.vscode/mcp.json` in your workspace. See the [VS Code documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

    ```json
    {
      "servers": {
        "openobserve": {
          "type": "http",
          "url": "https://your-instance/api/default/mcp",
          "headers": {
            "Authorization": "Basic <YOUR_BASE64_TOKEN>"
          }
        }
      }
    }
    ```

=== "Claude Code"

    Add the server with one command. See the [Claude Code documentation](https://docs.claude.com/en/docs/claude-code/mcp).

    ```bash
    claude mcp add openobserve https://your-instance/api/default/mcp \
      -t http \
      --header "Authorization: Basic <YOUR_BASE64_TOKEN>"
    ```

    Verify the connection:

    ```bash
    claude mcp list
    ```

=== "Claude Desktop"

    Add the following to `claude_desktop_config.json`. On macOS this lives at `~/Library/Application Support/Claude/`. See the [Claude Desktop documentation](https://modelcontextprotocol.io/quickstart/user).

    ```json
    {
      "mcpServers": {
        "openobserve": {
          "url": "https://your-instance/api/default/mcp",
          "headers": {
            "Authorization": "Basic <YOUR_BASE64_TOKEN>"
          }
        }
      }
    }
    ```

=== "Windsurf"

    Add the following to `~/.codeium/windsurf/mcp_config.json`. See the [Windsurf documentation](https://docs.windsurf.com/windsurf/cascade/mcp).

    ```json
    {
      "mcpServers": {
        "openobserve": {
          "url": "https://your-instance/api/default/mcp",
          "headers": {
            "Authorization": "Basic <YOUR_BASE64_TOKEN>"
          }
        }
      }
    }
    ```

=== "ChatGPT"

    Custom MCP connectors are available on ChatGPT Pro, Plus, Business, Enterprise, and Education accounts. Follow OpenAI's setup instructions and use these settings:

    - **Server URL:** `https://your-instance/api/default/mcp`
    - **Authentication:** Custom header: `Authorization: Basic <YOUR_BASE64_TOKEN>`

=== "Other"

    MCP is an open protocol supported by many clients (Cline, Zed, Continue, and more). Consult your client's documentation for the exact config format. The values you'll need:

    - **URL:** `https://your-instance/api/{org_id}/mcp`
    - **Transport:** HTTP
    - **Auth header:** `Authorization: Basic <YOUR_BASE64_TOKEN>`

## Building autonomous agents

For agentic workflows outside an IDE, call the MCP server directly over HTTP. We recommend creating a dedicated user with scoped permissions for agent use.

```bash
# start_time / end_time are epoch microseconds; this example queries the last hour
START=$(python3 -c "import time; print(int((time.time() - 3600) * 1_000_000))")
END=$(python3 -c "import time; print(int(time.time() * 1_000_000))")

curl https://your-instance/api/default/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <YOUR_BASE64_TOKEN>" \
  -d @- <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "SearchSQL",
    "arguments": {
      "org_id": "default",
      "request_body": {
        "query": {
          "sql": "SELECT * FROM logs WHERE level = 'error' LIMIT 10",
          "start_time": $START,
          "end_time": $END,
          "from": 0,
          "size": 10
        }
      }
    }
  },
  "id": 1
}
EOF
```

This pattern works with [OpenAI's Responses API](https://platform.openai.com/docs/guides/tools-remote-mcp), Anthropic's API, and any agent runtime that supports remote MCP servers.

## Available tools

When connected, your MCP client will see the following tools. Tool names are prefixed with your server name (e.g. `mcp__openobserve__StreamList`).

**Legend:** `pinned` = visible at the top of tool listings · ⚠️ = destructive (modifies or deletes data)

??? "Alerts (28 tools)"

    | Tool | Description |
    | --- | --- |
    | `CreateAlert` | Create a new alert rule |
    | `GetAlert` | Get alert details by ID |
    | `ExportAlert` | Export alert as JSON |
    | `UpdateAlert` | Update an existing alert |
    | `DeleteAlert` | Delete an alert by ID ⚠️ |
    | `ListAlerts` | List all alerts |
    | `EnableAlert` | Enable or disable an alert |
    | `TriggerAlert` | Manually trigger an alert |
    | `MoveAlerts` | Move alerts to another folder |
    | `GenerateSql` | Generate SQL from natural language |
    | `TestDestination` | Test alert destination connectivity |
    | `CreateDestination` | Create alert/pipeline destination |
    | `UpdateDestination` | Update alert destination |
    | `GetDestination` | Get destination details |
    | `ListDestinations` | List all alert destinations |
    | `DeleteAlertDestination` | Delete alert destination ⚠️ |
    | `ListPrebuiltDestinations` | List prebuilt destination templates |
    | `ListIncidents` | List all incidents |
    | `GetIncident` | Get incident details (`pinned`) |
    | `UpdateIncident` | Update incident title/severity |
    | `GetIncidentStats` | Get incident statistics |
    | `TriggerIncidentRca` | Manually trigger incident RCA |
    | `CreateTemplate` | Create alert template |
    | `UpdateTemplate` | Update alert template |
    | `GetTemplate` | Get template details |
    | `ListTemplates` | List all alert templates |
    | `DeleteAlertTemplate` | Delete alert template ⚠️ |
    | `GetSystemTemplates` | Get system prebuilt templates |

??? "Authorization (4 tools)"

    | Tool | Description |
    | --- | --- |
    | `CreateRoles` | Create a role |
    | `DeleteRole` | Delete a role ⚠️ |
    | `ListRoles` | List all roles |
    | `UpdateRoles` | Update a role |

??? "Dashboards (20 tools)"

    | Tool | Description |
    | --- | --- |
    | `CreateDashboard` | Create a dashboard with panels |
    | `UpdateDashboard` | Update an existing dashboard |
    | `ListDashboards` | List all dashboards in org |
    | `GetDashboard` | Get dashboard details by ID |
    | `DeleteDashboard` | Delete a dashboard ⚠️ |
    | `MoveDashboard` | Move dashboard to another folder |
    | `MoveDashboards` | Move multiple dashboards to folder |
    | `AddPanel` | Add a panel to a dashboard |
    | `UpdatePanel` | Update a single panel |
    | `DeletePanel` | Delete a single panel ⚠️ |
    | `CreateReport` | Create a scheduled report |
    | `UpdateReport` | Update a report |
    | `ListReports` | List all reports |
    | `GetReport` | Get report details |
    | `DeleteReport` | Delete a report ⚠️ |
    | `CreateAnnotations` | Create time annotations |
    | `GetAnnotations` | Get annotations |
    | `DeleteAnnotations` | Delete annotations ⚠️ |
    | `UpdateAnnotations` | Update annotations |
    | `RemoveTimedAnnotationFromPanel` | Remove annotation from panel ⚠️ |

??? "Enrichment Tables (2 tools)"

    | Tool | Description |
    | --- | --- |
    | `CreateUpdateEnrichmentTable` | Create/update enrichment table |
    | `CreateEnrichmentTableFromUrl` | Create table from URL |

??? "Folders (6 tools)"

    | Tool | Description |
    | --- | --- |
    | `CreateFolder` | Create a new folder |
    | `UpdateFolder` | Update folder properties |
    | `ListFolders` | List all folders |
    | `GetFolder` | Get folder details by ID |
    | `GetFolderByName` | Get folder by name |
    | `DeleteFolder` | Delete a folder by ID ⚠️ |

??? "Functions (6 tools)"

    | Tool | Description |
    | --- | --- |
    | `createFunction` | Create a VRL function |
    | `listFunctions` | List all functions |
    | `deleteFunction` | Delete a function ⚠️ |
    | `updateFunction` | Update a VRL function |
    | `functionPipelineDependency` | Check function dependencies |
    | `testFunction` | Test a VRL function |

??? "KV Store (4 tools)"

    | Tool | Description |
    | --- | --- |
    | `GetKVValue` | Get value by key |
    | `SetKVValue` | Set key-value pair |
    | `RemoveKVValue` | Delete key-value pair ⚠️ |
    | `ListKVKeys` | List all keys |

??? "Logs (1 tool)"

    | Tool | Description |
    | --- | --- |
    | `LogsIngestionJson` | Ingest logs via JSON array |

??? "Organizations & System Settings (12 tools)"

    | Tool | Description |
    | --- | --- |
    | `AssumeServiceAccount` | Assume service account identity |
    | `GetUserOrganizations` | Get user organizations |
    | `GetOrganizationSummary` | Get organization summary |
    | `CreateOrganization` | Create an organization |
    | `OrganizationSettingCreate` | Create/update org settings |
    | `OrganizationSettingGet` | Get organization settings |
    | `SystemSettingGetResolved` | Get resolved system setting |
    | `SystemSettingListResolved` | List resolved system settings |
    | `SystemSettingSetOrg` | Set org-level system setting |
    | `SystemSettingSetUser` | Set user-level system setting |
    | `SystemSettingDeleteOrg` | Delete org system setting ⚠️ |
    | `SystemSettingDeleteUser` | Delete user system setting ⚠️ |

??? "Patterns (1 tool)"

    | Tool | Description |
    | --- | --- |
    | `ExtractPatterns` | Extract log patterns |

??? "Pipelines (7 tools)"

    | Tool | Description |
    | --- | --- |
    | `createPipeline` | Create a data pipeline |
    | `listPipelines` | List all pipelines |
    | `getPipeline` | Get pipeline details by ID |
    | `getStreamsWithPipeline` | List streams using pipelines |
    | `deletePipeline` | Delete a pipeline ⚠️ |
    | `updatePipeline` | Update an existing pipeline |
    | `enablePipeline` | Enable or disable a pipeline |

??? "PromQL / Metrics (7 tools)"

    | Tool | Description |
    | --- | --- |
    | `PrometheusQuery` | Execute PromQL instant query |
    | `PrometheusRangeQuery` | Execute PromQL range query (`pinned`) |
    | `PrometheusMetadata` | Get Prometheus metadata |
    | `PrometheusSeries` | Get Prometheus series |
    | `PrometheusLabels` | Get Prometheus label names |
    | `PrometheusLabelValues` | Get Prometheus label values |
    | `PrometheusFormatQuery` | Format PromQL query |

??? "Search (17 tools)"

    | Tool | Description |
    | --- | --- |
    | `SearchSQL` | Search data with SQL (`pinned`) |
    | `SearchAround` | Search logs around a timestamp |
    | `SearchValues` | Get distinct values for a field |
    | `SearchPartition` | Get search partitions |
    | `SearchHistory` | Get search history |
    | `GetSavedView` | Get saved view details |
    | `ListSavedViews` | List all saved views |
    | `DeleteSavedViews` | Delete a saved view ⚠️ |
    | `CreateSavedViews` | Create a saved view |
    | `UpdateSavedViews` | Update a saved view |
    | `SubmitSearchJob` | Submit async search job |
    | `ListSearchJobs` | List all search jobs |
    | `GetSearchJobStatus` | Get search job status |
    | `CancelSearchJob` | Cancel a running search job |
    | `GetSearchJobResult` | Get search job results |
    | `DeleteSearchJob` | Delete a search job ⚠️ |
    | `RetrySearchJob` | Retry a failed search job |

??? "Service Accounts (4 tools)"

    | Tool | Description |
    | --- | --- |
    | `ServiceAccountsList` | List service accounts |
    | `ServiceAccountSave` | Create service account |
    | `ServiceAccountUpdate` | Update service account |
    | `RemoveServiceAccount` | Delete service account ⚠️ |

??? "Sourcemaps (4 tools)"

    | Tool | Description |
    | --- | --- |
    | `SourcemapList` | List sourcemaps |
    | `SourcemapDelete` | Delete sourcemap ⚠️ |
    | `SourcemapStacktrace` | Resolve sourcemap stacktrace |
    | `SourcemapValuesList` | List sourcemap values |

??? "Streams (5 tools)"

    | Tool | Description |
    | --- | --- |
    | `StreamList` | List all streams (logs, metrics, traces) (`pinned`) |
    | `StreamSchema` | Get stream schema (`pinned`) |
    | `StreamCreate` | Create a new stream |
    | `UpdateStreamSettings` | Update stream settings ⚠️ |
    | `StreamDelete` | Delete a stream ⚠️ |

??? "Users (5 tools)"

    | Tool | Description |
    | --- | --- |
    | `UserList` | List all users |
    | `UserSave` | Create a new user |
    | `UserUpdate` | Update user details |
    | `AddUserToOrg` | Add user to organization |
    | `RemoveUserFromOrg` | Remove user from organization ⚠️ |

## Multi-organization workflows

Each organization in your OpenObserve instance has its own MCP endpoint. You can register multiple servers in a single client to switch contexts:

```bash
claude mcp add o2-prod https://your-instance/api/production/mcp \
  -t http --header "Authorization: Basic <PROD_TOKEN>"

claude mcp add o2-dev https://your-instance/api/development/mcp \
  -t http --header "Authorization: Basic <DEV_TOKEN>"
```

This is useful for keeping production data isolated from development queries, or for SaaS deployments where each tenant has its own org.

## Security considerations

- **Use a dedicated MCP user** with the minimum permissions required, rather than your personal admin credentials.
- **Never commit credentials** to version control. Store Base64 tokens in environment variables or a secrets manager.
- **Rotate credentials regularly** and revoke access for any client you no longer use.
- **Confirm tool calls before execution** in your MCP client when possible. This protects against prompt injection from untrusted data sources.
- **Use organization-specific endpoints** to limit blast radius. A token for `org_a` cannot access `org_b`.
- **Restrict network access** to the MCP endpoint via firewall rules or IP allowlisting where feasible.

## Troubleshooting

??? "Connection fails / 404"

    - Confirm the endpoint path includes `/api/{org_id}/mcp`
    - Confirm `O2_AI_ENABLED=true` is set on the server
    - Test the base URL with `curl` to verify network reachability

??? "401 Unauthorized"

    ```bash
    # Verify your Base64 token decodes correctly
    echo "<YOUR_BASE64_TOKEN>" | base64 -d
    # Should print: your-email@example.com:your-password

    # Test credentials against the meta endpoint
    curl -u "username:password" https://your-instance/api/default/_meta
    ```

??? "Tools don't appear in client"

    - Restart the MCP client after editing config
    - Check the client's MCP server status panel; inside a Claude session run `/mcp`
    - Verify the user has access to the target organization
    - Confirm the user has the necessary RBAC permissions for stream and alert operations

## Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code MCP setup](claude.md): detailed walkthrough
- [Community Slack](https://short.openobserve.ai/community)
- [GitHub Issues](https://github.com/openobserve/openobserve/issues)
