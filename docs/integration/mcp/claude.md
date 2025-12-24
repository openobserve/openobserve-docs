---
description: >-
  Connect OpenObserve as an MCP (Model Context Protocol) server to Claude Code CLI
  for querying logs, traces, managing alerts, and streams through natural language.
---

# OpenObserve MCP Server Setup Guide for Claude Code

## Overview

This guide shows how to connect OpenObserve (O2) as an MCP (Model Context Protocol) server to Claude Code CLI, enabling Claude to interact with your O2 instance for observability tasks like querying traces, logs, creating alerts, and managing streams.

## Prerequisites

- Claude Code CLI installed ([Install Guide](https://docs.anthropic.com/claude/docs/claude-code))
- Access to an OpenObserve instance (cloud or self-hosted)
- Valid OpenObserve credentials (username and password)
- Base64 encoded authorization token

## Getting Your Authorization Token

Your authorization token should be Base64 encoded in the format: `username:password`

```bash
# Example: encoding credentials
echo -n "your-email@example.com:your-password" | base64
```

This will output something like: `eW91ci1lbWFpbEBleGFtcGxlLmNvbTp5b3VyLXBhc3N3b3Jk`

## Adding O2 MCP Server

### Command Syntax

```bash
claude mcp add <server-name> <O2_URL>/api/<ORG_ID>/mcp -t http --header "Authorization: Basic <BASE64_TOKEN>"
```
**Parameters Explained**

- `o2` - Name for the MCP server (you can choose any name)
- `-t http` - Transport type (HTTP). You can also use `--transport http`
- `--header` - HTTP header for authentication (use `--header`, not `-H`)
- `/api/<org_id>/mcp` - MCP endpoint (replace `default` with your org_id)

??? "Example Commands"

    **For OpenObserve Cloud:**
    ```bash
    claude mcp add o2 https://api.openobserve.ai/api/default/mcp -t http --header "Authorization: Basic <YOUR_BASE64_TOKEN>"
    ```

    **For Self-Hosted Instance:**
    ```bash
    claude mcp add o2 https://your-o2-instance.com/api/default/mcp -t http --header "Authorization: Basic <YOUR_BASE64_TOKEN>"
    ```

    **For Local Development:**
    ```bash
    claude mcp add o2 http://localhost:5080/api/default/mcp -t http --header "Authorization: Basic <YOUR_BASE64_TOKEN>"
    ```


### Configuration Scope

By default, MCP servers are added to **local scope** (project-specific). You can specify different scopes:

```bash
# Local scope (default, project-specific)
claude mcp add o2 <URL> -t http --header "Authorization: Basic <TOKEN>"

# User scope (available across all projects)
claude mcp add --scope user o2 <URL> -t http --header "Authorization: Basic <TOKEN>"

# Project scope (shared via .mcp.json in your repo)
claude mcp add --scope project o2 <URL> -t http --header "Authorization: Basic <TOKEN>"
```

## Verifying the Configuration

Check that your MCP server was added successfully:

```bash
# List all configured MCP servers
claude mcp list

# View the configuration file
cat ~/.claude.json
```

You should see your O2 server listed with a ✓ (connected) or ✗ (connection failed).

## Starting Claude

After adding the MCP server, start Claude:

```bash
claude
```

## Testing the Connection

Once Claude starts, verify the O2 MCP server is connected by trying these commands:

### 1. Check MCP Server Status

Inside Claude session:
```
/mcp
```

This will show all connected MCP servers and their status.

### 2. List Available MCP Tools

Ask Claude:
```
What MCP tools do you have access to?
```

**Expected tools from O2:**
- `mcp__o2__StreamList` - List streams (logs, metrics, traces)
- `mcp__o2__CreateAlert` - Create alerts
- `mcp__o2__UpdateAlert` - Update alerts
- `mcp__o2__ListAlerts` - List all alerts
- `mcp__o2__ListDestinations` - List alert destinations
- `mcp__o2__DeleteAlert` - Delete alerts
- And more...

### 3. Test a Simple Query

Try listing streams:
```
Show me all the trace streams for 'default' org_id
```

**Expected response:**
Claude should successfully fetch and display trace streams from your O2 instance.

### 4. Create a Test Alert

Try creating an alert:
```
Create a test alert for the default stream
```

**Expected response:**
Claude should create an alert and return an alert ID.

## Managing MCP Servers

### Removing a Server

If you need to remove or reconfigure the O2 MCP server:

```bash
claude mcp remove o2
```

Then add it again with updated configuration.

### Adding Multiple O2 Instances

You can add multiple O2 instances with different names:

```bash
# Production instance
claude mcp add o2-prod https://prod.example.com/api/default/mcp -t http --header "Authorization: Basic <PROD_TOKEN>"

# Staging instance
claude mcp add o2-staging https://staging.example.com/api/default/mcp -t http --header "Authorization: Basic <STAGING_TOKEN>"
```

Each instance will have its own tool prefix: `mcp__o2-prod__*` and `mcp__o2-staging__*`

## Troubleshooting

??? "Connection Issues"

    **Problem:** MCP server not showing up or failing to connect

    **Solutions:**

    1. **Verify the server was added:**
    ```bash
    claude mcp list
    ```

    2. **Check the configuration file:**
    ```bash
    cat ~/.claude.json | grep -A 10 "mcpServers"
    ```

    3. **Test the endpoint directly:**
    ```bash
    curl -H "Authorization: Basic <YOUR_TOKEN>" https://your-o2-instance/api/default/mcp
    ```

    4. **Check for network/firewall issues:**

        - Ensure your machine can reach the O2 instance
        - Check if there are any IP restrictions on the O2 side

    5. **Restart Claude:**

        - Exit Claude and start it again
        - Changes to MCP configuration require restarting Claude

??? "Authentication Issues"

    **Problem:** Getting 401 Unauthorized errors

    **Solutions:**

    1. **Verify your Base64 token is correct:**
    ```bash
    echo "<YOUR_BASE64_TOKEN>" | base64 -d
    # Should output: username:password
    ```

    2. **Check credentials work directly:**
    ```bash
    curl -u "username:password" https://your-o2-instance/api/default/_meta
    ```

    3. **Ensure you're using the correct header format:**

        - Use `--header "Authorization: Basic <TOKEN>"`
        - The word "Basic" is required
        - Ensure no extra spaces in the token

    4. **Verify user has permissions:**

        - User must have access to the specified organization
        - User needs appropriate permissions for the operations you're trying to perform

??? "Wrong Organization"

    **Problem:** Can't access your data or streams

    **Solution:**

    Replace `default` in the URL with your actual org_id:
    ```bash
    claude mcp remove o2
    claude mcp add o2 https://your-o2-instance/api/YOUR_ORG_ID/mcp -t http --header "Authorization: Basic <TOKEN>"
    ```

??? " MCP Tools Not Available"

    **Problem:** Claude doesn't show MCP tools or can't use them

    **Solutions:**

    1. **Check server is connected:**
    ```
    /mcp
    ```
    Should show your O2 server with a ✓

    2. **Restart Claude:**
    MCP servers are loaded at startup

    3. **Check the server name:**
    Tools are prefixed with `mcp__<server-name>__*`

## Common Use Cases

Once connected, you can ask Claude to:

??? "Query Streams"

    - "Show me all log streams"
    - "List trace streams with their statistics"
    - "What streams are available in the production organization?"

??? "Manage Alerts"

    - "Create an alert for production errors"
    - "Show all alerts in the default org"
    - "Update the alert with ID xyz to change the threshold"
    - "Delete the test alert"

??? "Analyze Data"

    - "What are the most recent traces in the default stream?"
    - "Show me error patterns in logs"
    - "Get statistics for all streams"

??? "Manage Destinations"

    - "List all alert destinations"
    - "What destinations are available for alerts?"
    - "Show me the configured Slack destinations"

## Best Practices

* Use descriptive instance names like `o2-prod`, `o2-staging`, and `o2-dev` to clearly identify environments.
* Select the correct scope: `local` for project-specific use, `user` for personal reuse, and `project` for team-shared configurations.
* Never commit Base64 tokens; store credentials securely using environment variables or a secrets manager and rotate them regularly.
* Always test MCP connections in a non-production environment and verify permissions and network access before going live.
* Keep Claude Code CLI updated and review release notes to stay current with MCP features and improvements.


## Notes

- The MCP server name (e.g., `o2`) will prefix all tools: `mcp__o2__*`
- You can add multiple O2 instances with different names
- Changes to MCP configuration require restarting Claude
- Authorization headers must use `--header` flag, not `-H`
- MCP configuration is stored in `~/.claude.json` (different from Claude Desktop)

## Quick Reference

```bash
# Add O2 MCP server
claude mcp add o2 <URL>/api/<ORG_ID>/mcp -t http --header "Authorization: Basic <TOKEN>"

# Add with specific scope
claude mcp add --scope user o2 <URL> -t http --header "Authorization: Basic <TOKEN>"

# List all MCP servers
claude mcp list

# Remove O2 MCP server
claude mcp remove o2

# Get details for specific server
claude mcp get o2

# Start Claude
claude

# Check MCP status (inside Claude)
/mcp

# View Claude configuration
cat ~/.claude.json
```

## Additional Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/)

## Support

If you encounter issues:

   - [GitHub Issues](https://github.com/openobserve/openobserve/issues)
   - [Slack Community](https://short.openobserve.ai/community)

---
**Last Updated:** December 2025