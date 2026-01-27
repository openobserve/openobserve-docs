---
title: OpenObserve O2 CLI
description: >-
  Manage OpenObserve resources directly from the command line using O2 CLI.
  Configure alerts, pipelines, destinations, functions, and templates across
  multiple environments with automation-friendly, CI/CD-ready workflows.
keywords: >
  openobserve cli, o2 cli, openobserve command line, observability cli,
  openobserve automation, openobserve enterprise cli, observability as code,
  openobserve devops
---

# O2 CLI

**Enterprise-Grade Command Line Interface for OpenObserve Management**

| Version | Status | License |
|---------|--------|---------|
| 1.1.3 | Production-Ready | Enterprise |

> **⚠️ Enterprise Requirement:** O2 CLI requires OpenObserve Enterprise edition. It will not work with the community version. For Enterprise access, visit [openobserve.ai/pricing](https://openobserve.ai/pricing).


## Overview

[O2 CLI](https://github.com/openobserve/o2-cli/tree/main) is a command-line interface for managing OpenObserve resources directly, similar to AWS CLI or kubectl. It provides an imperative way to manage OpenObserve alongside the declarative Kubernetes Operator.

## Installation

### Quick Install (macOS/Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/openobserve/o2-cli/main/install.sh | bash
```

### Homebrew (Recommended)

```bash
brew tap openobserve/tap
brew install o2
```

### Download Binary Directly

**macOS Apple Silicon:**
```bash
curl -L https://github.com/openobserve/o2-cli/releases/latest/download/o2-darwin-arm64.tar.gz | tar xz
sudo mv o2 /usr/local/bin/
```

**macOS Intel:**
```bash
curl -L https://github.com/openobserve/o2-cli/releases/latest/download/o2-darwin-amd64.tar.gz | tar xz
sudo mv o2 /usr/local/bin/
```

**Linux AMD64:**
```bash
curl -L https://github.com/openobserve/o2-cli/releases/latest/download/o2-linux-amd64.tar.gz | tar xz
sudo mv o2 /usr/local/bin/
```

## Quick Start

### Prerequisites

- OpenObserve Enterprise instance
- Valid credentials (username/password or API token)

### Step 1: Configure

Set up your default profile:

```bash
o2 configure
# Enter: endpoint, organization, username, password
```

Set up additional environments:

```bash
o2 configure --profile dev
o2 configure --profile prod
```

> **Note:** The CLI validates your OpenObserve instance is Enterprise edition on first command.

### Step 2: List Resources

```bash
# List all organizations
o2 list organizations

# Get organization summary
o2 organization get default --summary

# List dashboards in a specific folder
o2 list dashboard --folder production

# List enabled alerts only
o2 list alert --folder default --enabled-only
```

### Step 3: Manage Resources

```bash
# Create a template
o2 create template -f slack-alert.yaml

# List templates
o2 list template

# Delete a template
o2 delete template old-template
```


## Configuration

### Profile Management

Configure multiple environments for seamless switching:

```bash
o2 configure                    # Default profile
o2 configure --profile dev      # Dev environment
o2 configure --profile staging  # Staging environment
o2 configure --profile prod     # Production environment
```

List all configured profiles:

```bash
o2 configure list
```

### Config File

**Location:** `~/.o2/config.yaml`

**Example Configuration:**

```yaml
profiles:
  default:
    endpoint: https://openobserve.company.com
    organization: default
    username: user@company.com
    password: your-password
  dev:
    endpoint: https://dev.openobserve.com
    organization: dev-org
    username: dev-user@company.com
    password: dev-password
  prod:
    endpoint: https://prod.openobserve.com
    organization: prod-org
    username: prod-user@company.com
    password: prod-password
```

---

## Supported Resources

| Resource | Create | List | Get | Update | Delete | Sample Files |
|----------|:------:|:----:|:---:|:------:|:------:|:------------:|
| Organizations | ✅ | ✅ | ✅ (+summary) | — | — | — |
| Dashboards | ✅ | ✅ | ✅ | ✅ | ✅ (by ID) | 2 files |
| Templates | ✅ | ✅ | ✅ | ✅ | ✅ | 6 files |
| Destinations | ✅ | ✅ | ✅ | ✅ | ✅ | 3 files |
| Pipelines | ✅ | ✅ | ✅ | ✅ | ✅ | 2 files |
| Functions | ✅ | ✅ | ✅ | ✅ | ✅ | 5 files |
| Alerts | ✅ | ✅ | ✅ | ✅ | ✅ | 2 files |


## Command Syntax

O2 CLI supports **two syntaxes** — use whichever you prefer.

### kubectl-Style (Verb-First)

```
o2 <verb> <resource> [name] [flags]
```

**Examples:**

```bash
o2 list template
o2 get dashboard 123456
o2 create template -f template.yaml
o2 update pipeline -f pipeline.yaml
o2 delete function my-function
```

### Resource-First

```
o2 <resource> <verb> [name] [flags]
```

**Examples:**

```bash
o2 template list
o2 dashboard get 123456
o2 template create -f template.yaml
o2 pipeline update -f pipeline.yaml
o2 function delete my-function
```

> **Both syntaxes are equivalent and produce identical results.**


## Usage Examples

### Multi-Environment Workflow

Promote resources from development to production:

```bash
# Create in dev
o2 create template -f alert.yaml --profile dev

# Test it
o2 list template --profile dev

# Export from dev
o2 get template MyAlert --profile dev -o yaml > tested.yaml

# Deploy to prod
o2 create template -f tested.yaml --profile prod
```

### Cross-Organization Querying

Query resources across multiple organizations:

```bash
# List all organizations
o2 list organizations

# Query different orgs
o2 list alert --org org1
o2 list dashboard --org org2 --folder monitoring
o2 list function --org org3
```

### Backup and Restore

**Backup all templates:**

```bash
for t in $(o2 list template --output json | jq -r '.[].name'); do
  o2 get template $t -o yaml > backups/${t}.yaml
done
```

**Restore templates:**

```bash
for f in backups/*.yaml; do
  o2 create template -f $f
done
```

### Resource Management

```bash
# Create destination
o2 create dest -f slack-webhook.yaml

# List HTTP destinations
o2 list dest --type http

# Update destination
o2 update dest -f updated-webhook.yaml

# Delete destination
o2 delete dest slack-webhook
```

## Global Flags

Available on all commands:

| Flag | Short | Default | Description |
|------|:-----:|---------|-------------|
| `--profile` | | `default` | Use specific profile |
| `--org` | | From profile | Override organization |
| `--output` | `-o` | `table` | Output format: `table`, `json`, `yaml`, `wide` |
| `--config` | | `~/.o2/config.yaml` | Custom config file path |


## Getting Help
```bash
o2 --help
```

