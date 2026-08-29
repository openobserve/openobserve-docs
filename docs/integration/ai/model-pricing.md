---
title: Model Pricing
description: Configure per-token model pricing definitions to estimate LLM costs from traces. Define regex match patterns, pricing tiers, and time-based peak/off-peak rates.
---

# Model Pricing

Model pricing maps LLM model names to per-token rates so OpenObserve can estimate the cost of your AI workloads from trace data. When a span does not carry an explicit cost, OpenObserve matches the span's model name against your pricing definitions and multiplies token usage by the configured rates.

You manage model pricing from the **Model Pricing** page under **Settings**. Definitions are stored per organization, with optional inherited and built-in entries described below.

## How a definition matches a span

Each definition has two core fields:

- **Name** — a human-readable label, e.g. `GPT-4o` or `Claude Sonnet 4.6`.
- **Match pattern** — a regular expression matched against the model name reported on incoming spans, e.g. `(?i)^gpt-4o` or `claude-sonnet-4-6`.

A definition also carries a list of **pricing tiers**, each with per-token prices keyed by usage type (see [Pricing tiers](#pricing-tiers)). At ingestion, OpenObserve finds the best matching definition and tier for each span's model name and computes an approximate cost, stored on the span as `gen_ai.usage.cost`.

### Match priority

When several definitions match the same model name, OpenObserve resolves them in this order:

1. **Source** — your org's own definitions beat the meta org's, which beat built-in definitions (`org` > `meta_org` > `built_in`).
2. **`valid_from`** — among definitions of the same source, the one with the greatest `valid_from` timestamp that is still at or before the span's start time wins. This lets you schedule a price change to take effect on a cutover date.
3. **`sort_order`** and **name** — final tie-breakers. A lower `sort_order` is checked first.

In the list view, a definition that is overridden by a higher-priority one is shown as a nested (shadowed) row with a warning, because it will never be used for cost calculation while the parent is active.

## Pricing tiers

Every definition has one **default** tier (the first tier) and any number of additional tiers. The default tier has no restrictions and is the fallback when no other tier applies. Additional tiers apply only when their restrictions are met, and are evaluated in order — the first match wins.

![TODO: screenshot of the Model Pricing editor showing pricing tiers](images/placeholder.png)

A tier can be restricted in two ways, which can be combined:

- A **usage condition** — a comparison on a usage key, e.g. *apply this tier when `input` `>` `200000`* (extended-context pricing). Supported operators are `>`, `>=`, `<`, `<=`, `=`, and `!=`.
- **UTC time windows** — recurring hours of the day during which the tier applies, for providers that bill peak and off-peak rates (see [Time-based pricing](#time-based-pricing)).

The default tier must remain unrestricted: OpenObserve rejects a definition where every tier has a condition or time window, since a span outside every window would then have no rate to fall back on.

Prices are entered as **per-1M-token** dollar amounts in the editor and stored per-token (e.g. `$2.50`/1M becomes `0.0000025`). Common usage keys include `input`, `output`, `cache_read_input_tokens`, `cache_creation_input_tokens`, and `output_reasoning_tokens`. The **Quick setup** chips populate the standard key sets for OpenAI and Anthropic in one click.

## Time-based pricing

Some providers change their rates with the clock. For example, DeepSeek V4 bills **peak** rates during `01:00–04:00` and `06:00–10:00` UTC and **off-peak** (half the peak rate) at all other hours. Time-based pricing models these recurring rate changes directly on a tier.

To add time-based pricing, open a non-default tier and click **Add time window**, then set the **From** and **To** times (24-hour UTC). You can add multiple windows to one tier, and a window whose start is later than its end wraps past midnight (e.g. `22:00 → 02:00`).

![TODO: screenshot of a pricing tier with UTC time windows and the 24-hour preview bar](images/placeholder.png)

A 24-hour preview bar shows the active hours at a glance, and each window displays a hint in your local timezone. The equivalent JSON for a peak/off-peak definition looks like this:

```json
{
  "name": "DeepSeek V4 Pro",
  "match_pattern": "(?i)deepseek-v4-pro",
  "tiers": [
    { "name": "Off-Peak", "prices": { "input": 6.6e-07, "output": 1.98e-06 } },
    {
      "name": "Peak (01:00-04:00, 06:00-10:00 UTC)",
      "utc_windows": [
        { "start_minute": 60, "end_minute": 240 },
        { "start_minute": 360, "end_minute": 600 }
      ],
      "prices": { "input": 1.32e-06, "output": 3.96e-06 }
    }
  ]
}
```

Windows are stored as minutes past UTC midnight and are half-open (`[start, end)`), so `01:00–04:00` covers `01:00` through `03:59`. At ingestion, OpenObserve resolves the window against the span's start time. If a span has no start time, the time-restricted tier is skipped in favor of the default tier, so an unknown timestamp never lands a span in the wrong rate.

## Test a model match

To verify which definition and tier a model resolves to — including which peak or off-peak rate applies at a given hour — use the **Test** dialog on the **Model Pricing** page.

![TODO: screenshot of the Test Model Match dialog showing a matched peak/off-peak tier](images/placeholder.png)

1. Click **Test**.
2. Enter the **model name** to test.
3. Optionally set **Test at UTC time**. Leave it empty to use the current time; pick a specific hour to exercise a peak/off-peak window without waiting for it.
4. Click **Test match**.

The dialog shows which definition matched (and its source), the winning priority flow, the selected tier with its condition and time windows, and the resulting per-key rates. If nothing matches, it lists troubleshooting tips.

## Built-in pricing

OpenObserve ships a set of built-in pricing definitions for popular models, synced from the community GitHub source into the `_openobserve` org on startup and periodically. Built-in entries are read-only; clone one with the duplicate action to customize it.

To pull the latest built-in rates on demand, click **Refresh** on the **Model Pricing** page. A model removed upstream is disabled (not deleted) to preserve historical cost calculations.

## Related

- [LLM Applications](llm-applications.md): General guide for instrumenting LLM-powered applications
- [LLM Evaluations](llm-evaluations.md): Evaluate and monitor LLM output quality
