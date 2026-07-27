---
description: "Define per-organization LLM model pricing in OpenObserve to compute token costs on traces, enriching every LLM span with input, output, and total cost fields."
---

# Model Pricing

Model Pricing lets you define per-organization LLM pricing so OpenObserve can compute token costs directly on your traces. With it enabled, every LLM span is enriched with cost fields derived from the model name and token usage.

## Overview

When you ingest LLM traces, each span carries token usage and a model name. Model Pricing maps that model name to a pricing definition and calculates the cost of the call, writing the result into the cost fields stored on the span.

This feature is for teams running LLM observability who want accurate, up-to-date cost attribution per model, per organization. You can rely on the built-in pricing catalog that OpenObserve maintains, or define your own pricing to match negotiated rates, custom models, or providers not covered by the catalog.

OpenObserve populates the following cost fields on each LLM span when Model Pricing is enabled:

| Field | Type | Description |
|-------|------|-------------|
| `llm_usage_cost_input` | Float64 | Cost of input (prompt) tokens |
| `llm_usage_cost_output` | Float64 | Cost of output (completion) tokens |
| `llm_usage_cost_total` | Float64 | Total cost of the LLM call |

> **Note**: When Model Pricing is disabled, OpenObserve falls back to a built-in, hardcoded pricing set. The DB pricing lookup, the periodic sync job, and the **Model Pricing** UI tab are all gated behind the enable flag.

## Key features

### Built-in pricing catalog

OpenObserve ships with a built-in catalog of model pricing that is synced periodically from an upstream source. Built-in definitions are read-only.

- View the full built-in catalog without any setup
- Clone a built-in definition to customize it for your organization
- Refresh the catalog on demand from the upstream source

### Custom pricing definitions

Define your own pricing per organization. User-defined pricing takes priority over built-in pricing when both match a model.

- Match incoming model names with a regex pattern (for example, `(?i)^gpt-4o`)
- Define one or more pricing tiers with per-token rates keyed by usage type (`input`, `output`, and others)
- Optionally set a validity start time so historical traces keep their original cost calculations

### Test model match

Before relying on a definition, test how a given model name resolves against your configured pricing, and preview the computed cost for a sample token count.

## Getting started

### Prerequisites

- A self-hosted OpenObserve instance where you can set environment variables
- LLM traces being ingested (see [LLM Observability](llm-applications.md))

### Enabling Model Pricing

Model Pricing is controlled by environment variables. The feature is disabled by default.

Set the following variable to enable it:

```shell
ZO_MODEL_PRICING_ENABLED=true
```

Enabling this flag turns on three behaviors: it shows the **Model Pricing** tab in the UI, starts the background sync job that pulls built-in pricing, and enables the database pricing lookup during ingestion. When the flag is `false`, OpenObserve skips the database lookup and uses its hardcoded built-in pricing instead.

| Setting | Description | Default |
|---------|-------------|---------|
| `ZO_MODEL_PRICING_ENABLED` | Enable user-defined model pricing. When `true`, uses database pricing definitions and syncs from the source URL. When `false`, falls back to hardcoded built-in pricing only. | `false` |
| `ZO_MODEL_PRICING_SOURCE_URL` | URL of the built-in LLM model pricing JSON source. | `https://raw.githubusercontent.com/openobserve/sdr_patterns/refs/heads/main/llm_pricing.json` |
| `ZO_MODEL_PRICING_SYNC_INTERVAL_SECS` | Interval in seconds for syncing built-in model pricing from the source URL. | `21600` (6 hours) |

> **Tip**: Restart your OpenObserve instance after changing these variables so the configuration takes effect.

## Managing pricing in the UI

After enabling the feature, manage pricing from the **Settings > Model Pricing** tab. The tab is hidden unless `ZO_MODEL_PRICING_ENABLED` is `true`.

From this tab you can:

- **View built-in pricing**: Browse the read-only built-in catalog and search by model name.
- **Refresh built-in pricing**: Trigger an on-demand sync from the configured source URL.
- **Import**: Bring in pricing definitions to seed your organization's pricing.
- **Edit**: Create and edit custom pricing definitions in the editor, including the match pattern and pricing tiers.
- **List**: Review all pricing definitions for your organization.
- **Test model match**: Enter a model name to see which definition it matches and preview the computed cost.

### How matching works

For each LLM span, OpenObserve evaluates pricing definitions by their regex `match_pattern` against the model name. User-defined definitions take priority over built-in ones. Within a matched definition, pricing tiers are evaluated in order: tiers with a condition are checked first, and the first tier whose condition is met wins. A tier without a condition acts as the default fallback.

Per-token rates are keyed by usage type, for example `input` and `output`, and are expressed as the price for a single token (for example, `0.000003` equals $3 per 1M tokens).

## API reference

All endpoints are scoped to an organization (`{org_id}`) and use the `model_pricing` resource for authorization.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/{org_id}/llm/models` | List pricing definitions for the organization |
| `POST` | `/api/{org_id}/llm/models` | Create a pricing definition |
| `GET` | `/api/{org_id}/llm/models/{model_id}` | Get a pricing definition by ID |
| `PUT` | `/api/{org_id}/llm/models/{model_id}` | Update a pricing definition |
| `DELETE` | `/api/{org_id}/llm/models/{model_id}` | Delete a pricing definition |
| `GET` | `/api/{org_id}/llm/models/built-in` | Get the read-only built-in pricing catalog |
| `POST` | `/api/{org_id}/llm/models/refresh-built-in` | Refresh built-in pricing from the source URL |
| `POST` | `/api/{org_id}/llm/models/test` | Test how a model name matches and preview its cost |

A pricing definition includes a display `name`, a regex `match_pattern` used to match incoming model names, an `enabled` flag, and a list of pricing `tiers`. The test endpoint accepts a `model_name`, an optional `usage` map of token counts (for example, `{"input": 1000, "output": 500}`), and an optional `timestamp` so only definitions valid at that time are considered.

> **Note**: Built-in definitions are read-only. They cannot be created, edited, or deleted directly. Use the refresh endpoint to sync them from the upstream source, and clone a built-in definition if you need to customize it.

## Best practices

- Keep Model Pricing disabled until you are ingesting LLM traces and want cost attribution; the built-in hardcoded pricing still applies as a fallback.
- Use anchored, case-insensitive regex patterns (for example, `(?i)^gpt-4o`) to avoid unintended matches across model families.
- Set a validity start time on definitions when rates change, so historical traces retain their original computed costs.
- Use the test model match tool to confirm a new definition resolves as expected before depending on its cost output.

## Troubleshooting

### Cost fields are empty on LLM traces

**Problem**: Traces show token usage but `llm_usage_cost_*` fields are zero or missing.

**Solution**:
1. Confirm `ZO_MODEL_PRICING_ENABLED=true` and that the instance was restarted.
2. Verify the model name on the span matches a definition's `match_pattern` using the test model match tool.
3. Check that the matched tier defines a per-token price for the usage keys present on the span (for example, `input` and `output`).

### The Model Pricing tab is not visible

**Problem**: The **Model Pricing** tab does not appear under **Settings**.

**Solution**:
1. Ensure `ZO_MODEL_PRICING_ENABLED=true`; the tab is hidden when the flag is `false`.
2. Restart the instance so the updated configuration is applied.

### Built-in catalog is out of date

**Problem**: Built-in pricing does not reflect the latest upstream values.

**Solution**:
1. Trigger a refresh from the **Model Pricing** tab, or call `POST /api/{org_id}/llm/models/refresh-built-in`.
2. Confirm `ZO_MODEL_PRICING_SOURCE_URL` points to a reachable source.
3. Review `ZO_MODEL_PRICING_SYNC_INTERVAL_SECS` if you expect more frequent automatic syncs.

## Related

For instrumenting and shipping LLM traces to OpenObserve, see [LLM Observability](llm-applications.md). The cost fields documented there (`llm_usage_cost_input`, `llm_usage_cost_output`, `llm_usage_cost_total`) are populated by the Model Pricing feature described on this page.
