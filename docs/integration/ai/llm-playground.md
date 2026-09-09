---
title: LLM Playground
description: Experiment with prompts, models, and scorers in the OpenObserve LLM Playground, then promote your results to datasets and experiments.
---

# LLM Playground

The Playground is an interactive workbench for iterating on prompts, models, and scorers before you commit them to a Dataset or an Experiment. Run a model to stream its answer, score the result to read your judge's reasoning, and share a snapshot to capture the whole board.

## Overview

The Playground is a two-dimensional board:

- **Columns are variants**: each column is one prompt configuration, a provider, an optional model, an ordered list of messages, sampling parameters, and optional tools or a response format.
- **Rows are cases**: each row is an input (plus optional expected output and metadata) that every variant runs against.

A **cell** is the intersection of a variant and a case. **Run** a cell to stream the model's answer back live; **score** a cell to run your scorers against it and read each judge's verdict and reasoning.

The Playground is volatile by design: opening or running it saves nothing, so drafts never affect your evaluation analytics. **Share** is the only action that saves anything: it copies every column, row, result, and score into a snapshot, which keeps rendering even after the underlying dataset, scorer, or provider changes or is deleted.

![Playground workbench showing variant columns and case rows](images/playground-2d.png)

## Build a variant

Each column is a variant. Configure it with:

| Field | Description |
|---|---|
| **Provider** | The LLM provider to call. You can only use providers you have access to. |
| **Model** | Optional model override. Leave empty to use the provider's default model. |
| **Messages** | The prompt as an ordered list of `role` + `content` messages. String content is templated with `{{variables}}`; structured content is passed through untouched. |
| **Parameters** | Sampling parameters. `temperature` and `max_tokens` map to the provider's own fields; any other key is passed through as-is. |
| **Tools** | Tool definitions passed to the provider. If the model calls a tool, the call is shown as the cell's output; nothing is actually executed. |
| **Response Format** | An optional structured-output schema for the provider. |

![The variant configuration panel with provider, model, messages, and parameters](images/playground-variant.png)

### Variables

Templates in message content bind variables from the row's input:

- A string input binds `{{input}}`.
- An object input binds each of its fields by name.

Only string content is templated. Structured content (multimodal parts and tool results) is passed through as-is, so its structure is never corrupted.

## Add cases

Each row is a case. A case supplies the input every variant renders against, and optionally:

| Field | Description |
|---|---|
| **Input** | A string binds `{{input}}`; an object binds each of its fields by name. |
| **Expected Output** | An optional reference used by scorers that compare output against a gold answer. |
| **Metadata** | Optional extra context made available to scorers as `{{metadata}}`. |

## Run a cell

Running a cell streams the model's answer back live. You first see the exact rendered prompt (with variables filled in), then incremental text as it's generated, and finally the model used, latency, and token usage and cost.

Configuration errors (an inaccessible provider, an unrenderable message, an invalid parameter) are caught before streaming starts. Once streaming begins, an upstream failure, including rate limits and other gateway errors, is surfaced as an error in the stream. Any API key in an upstream error is redacted before it reaches you.

## Score a cell

Scoring a cell runs your scorers against it and returns one verdict per scorer immediately; nothing is saved, so throwaway scores never affect your experiment comparisons. Select the scorers to apply, then run them.

Each result reports one of three outcomes:

| Outcome | Meaning |
|---|---|
| **Scored** | The judge returned a value (`numeric`, `categorical`, or `boolean`) plus reasoning, metadata, the model used, prompt/completion tokens, and latency. |
| **Skipped** | The scorer couldn't judge this cell: `requires_trace` means it needs spans or steps a Playground run never produces; `no_reference` means it needs an expected output the case doesn't supply. |
| **Failed** | The scorer ran and errored. One failed scorer doesn't cost you the other verdicts in the batch. |

Scorers run at their **latest** version in the Playground. Pinning to a specific version happens when you promote a column to an Experiment.

## Tool calls and structured output

When a variant defines **tools**, a model that chooses to call one returns the call (name and arguments) as the cell's output rather than executing anything. This lets you iterate on tool definitions without wiring up an execution environment.

When a variant sets a **response format**, the provider is asked for structured output, and the returned structure is shown as the result.

## Share a snapshot

Share captures the entire board, every column, row, result, and score, into an immutable snapshot and returns a short link you can hand to a teammate. The snapshot keeps rendering even after the dataset, scorer, or provider it came from changes or is deleted.

Editing a shared board doesn't update the existing snapshot; it creates a new one. A snapshot is visible only within your organization.

![The share snapshot dialog showing the short link](images/share-snapshot.png)

### Limits and retention

- A snapshot may hold up to **4 columns**, **10 rows**, and **1 MB** of data.
- Snapshots expire after a configurable number of days of not being opened; opening one renews the window.
- Each organization is capped at a configurable number of snapshots; over the cap, the least recently opened are purged first.

## Promote to a Dataset or Experiment

The Playground is a drafting surface for the rest of the LLM evaluations suite. When you're happy with a result, promote it:

- Promote a **result cell** into a Dataset, where it becomes a reference case recorded with source `playground`.
- Promote a **column** into an Experiment, which is the moment a scorer is pinned to a specific version.

## Configuration

The Playground is part of the enterprise AI Observability / Online Evaluations suite.

| Variable | Default | Description |
|---|---|---|
| `O2_LLM_PLAYGROUND_RUN_TIMEOUT_MS` | `120000` | Per-cell timeout in milliseconds for a Playground run. |
| `O2_LLM_PLAYGROUND_SNAPSHOT_TTL_DAYS` | `180` | Days a shared snapshot survives without being opened. Set to `0` to keep snapshots forever. |
| `O2_LLM_PLAYGROUND_SNAPSHOT_MAX_PER_ORG` | `1000` | Maximum shared snapshots retained per organization. Set to `0` to remove the cap. |

## RBAC

The Playground has its own permissions (GET, LIST, POST, PUT, DELETE). Two things to note:

- **Run** and **Score** require the write grant, even though they save nothing, since both call a provider or judge and spend real money.
- You can only use providers and scorers you have access to.

Assign the appropriate roles in **Identity & Access Management > Roles** to control Playground access.

## API Reference

All endpoints are prefixed with `/api/{org_id}`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/playground/run` | Run a cell: stream the model's answer back. |
| `POST` | `/playground/score` | Score a cell against one or more scorers. |
| `POST` | `/playground/snapshots` | Share a workbench snapshot. |
| `GET` | `/playground/snapshots/{snapshot_id}` | Read a snapshot (renewing its retention window). |

**Run payload** (a column plus an optional row):

```json
{
  "column": {
    "provider_id": "provider-id",
    "model": "gpt-4o",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "{{input}}" }
    ],
    "params": { "temperature": 0.2, "max_tokens": 256 },
    "tools": [],
    "response_format": null
  },
  "row": {
    "input": "What is the retention default?",
    "expected_output": "14 days",
    "metadata": {}
  }
}
```

**Score payload** (the scorers to run against a subject):

```json
{
  "scorer_ids": ["scorer-1", "scorer-2"],
  "input": "What is the retention default?",
  "output": "Fourteen days.",
  "expected_output": "14 days",
  "metadata": {}
}
```

**Share payload** (the whole workbench by value):

```json
{
  "payload": {
    "columns": [ { "provider_id": "provider-id", "messages": [], "model": "gpt-4o", "params": {} } ],
    "rows": [ { "input": "case 1" } ]
  },
  "parent_snapshot_id": null
}
```
