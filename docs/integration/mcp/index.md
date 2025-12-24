---
description: >-
  Learn how to connect OpenObserve with external tools using the Model Context Protocol (MCP)
  for programmatic access to logs, traces, metrics, alerts, and more.
---

# Model Context Protocol (MCP)

## Overview

OpenObserve supports the **Model Context Protocol (MCP)**, an open standard that enables seamless integration between AI tools and data platforms. With MCP, you can connect tools like Claude Code CLI, custom AI agents, and other MCP-compatible clients to your OpenObserve instance.

!!! note
    This capability is supported in the Enterprise edition of OpenObserve.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how AI applications connect to external data sources and tools. It enables:

- **Natural Language Queries:** Ask questions about your observability data in plain English
- **Automated Operations:** Create alerts, manage streams, and query data programmatically
- **AI-Powered Analysis:** Leverage AI to analyze logs, traces, and metrics
- **Tool Integration:** Connect any MCP-compatible tool to OpenObserve

## Capabilities

With OpenObserve's MCP server, you can:

??? "Data Query & Analysis"
    - List and explore streams (logs, metrics, traces)
    - Query data using natural language
    - Get stream statistics and metadata
    - Search and filter across multiple data types

??? "Alert Management"
    - Create, update, and delete alerts
    - List all configured alerts
    - Manage alert destinations (Slack, email, webhooks)
    - Configure alert conditions and thresholds

??? "Stream Management"
    - List all streams by type
    - View stream schemas and settings
    - Get stream statistics
    - Manage stream configurations

## Supported MCP Clients

OpenObserve's MCP server works with any MCP-compatible client, including:

- **Claude Code CLI** - Anthropic's official CLI tool ([Setup Guide](claude.md))
- **Custom AI Agents** - Build your own using the MCP SDK
- **Other MCP Tools** - Any tool that implements the MCP protocol

## Getting Started

Choose your integration:

### [Claude Code CLI Setup](claude.md)
Connect OpenObserve to Claude Code CLI for interactive querying and management through natural language.

**Quick Start:**
```bash
claude mcp add o2 https://your-instance/api/default/mcp \
  -t http --header "Authorization: Basic <YOUR_TOKEN>"
```

### Building Custom Integrations

For developers building custom MCP clients:

1. **Endpoint:** `https://your-instance/api/{org_id}/mcp`
2. **Authentication:** Basic Auth (Base64 encoded `username:password`)
3. **Transport:** HTTP
4. **Protocol:** [MCP Specification](https://modelcontextprotocol.io/)

## Available MCP Tools

When connected to OpenObserve via MCP, you'll have access to:

| Tool | Description |
|------|-------------|
| `StreamList` | List all streams (logs, metrics, traces) |
| `CreateAlert` | Create new alerts |
| `UpdateAlert` | Update existing alerts |
| `DeleteAlert` | Delete alerts |
| `ListAlerts` | List all configured alerts |
| `ListDestinations` | List alert destinations |
| `GetStreamStats` | Get statistics for streams |
| `QueryData` | Query data from streams |

> **Note:** Tool names are prefixed with your MCP server name. For example, if you name your server `o2`, tools will be: `mcp__o2__StreamList`, `mcp__o2__CreateAlert`, etc.

## Authentication

MCP connections require authentication using Basic Auth:

```bash
# Generate Base64 token
echo -n "your-email@example.com:your-password" | base64
```

Use the generated token in your MCP client configuration:
```
Authorization: Basic <YOUR_BASE64_TOKEN>
```

## Security Considerations

- **Never commit credentials** to version control
- **Use environment variables** for sensitive tokens
- **Rotate credentials** regularly
- **Use organization-specific endpoints** to limit access scope
- **Implement IP allowlisting** if needed

## Multi-Organization Support

OpenObserve's MCP server supports multiple organizations. Each organization has its own endpoint:

```
https://your-instance/api/org1/mcp
https://your-instance/api/org2/mcp
```

You can add multiple MCP servers with different organizations:

```bash
claude mcp add o2-prod https://instance/api/production/mcp -t http --header "..."
claude mcp add o2-dev https://instance/api/development/mcp -t http --header "..."
```


### Use Cases

- **Interactive Data Analysis**
Users can ask natural-language questions about their observability data, such as requesting error logs from the last hour, identifying the top ten endpoints by latency, or listing all failed transactions.

- **Alert Management**
Alerts can be created, viewed, and updated using simple language. For example, users can create an alert for 5xx errors, view all critical alerts, or update an existing memory alert threshold to 90 percent.

- **Automated Operations**
The system integrates seamlessly with CI/CD pipelines and automation workflows, enabling teams to query metrics programmatically, create alerts as part of deployment processes, and monitor stream health and related statistics.

- **AI-Powered Troubleshooting**
AI can assist with debugging and root-cause analysis by analyzing error patterns in production, explaining the causes of latency spikes, and finding correlations between traces and logs.



## Troubleshooting

??? "Connection Issues"

    If MCP clients can't connect:

    1. **Verify endpoint URL:** Ensure `/api/{org_id}/mcp` path is correct
    2. **Check authentication:** Verify Base64 token is valid
    3. **Test network access:** Ensure firewall allows connections
    4. **Validate permissions:** User must have appropriate org access

??? "Authentication Failures"

    If getting 401 errors:

    ```bash
    # Test credentials directly
    curl -u "username:password" https://your-instance/api/default/_meta

    # Verify Base64 encoding
    echo "YOUR_TOKEN" | base64 -d
    ```

??? "Tools Not Available"

    If MCP tools don't appear:

    1. Restart the MCP client
    2. Check server connection status
    3. Verify organization ID is correct
    4. Ensure user has required permissions

## Resources

- [Claude Code Setup Guide](claude.md) - Detailed setup instructions
- [MCP Protocol Specification](https://modelcontextprotocol.io/) - Official MCP docs


## Support

Need help with MCP integration?

- **Community:** [Join our Slack](https://short.openobserve.ai/community)
- **Documentation:** [OpenObserve Docs](https://openobserve.ai/docs/)
- **Issues:** [GitHub Issues](https://github.com/openobserve/openobserve/issues)
- **Email:** support@openobserve.ai

---

**Last Updated:** December 2025