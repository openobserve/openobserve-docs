---
title: LLM Experiments
description: Run offline, batch evaluations of your LLM applications in OpenObserve. Build versioned datasets of test cases, run immutable experiments with pinned scorers and trials, and compare results against a baseline.
---

# LLM Experiments

Experiments bring offline, batch evaluation to OpenObserve's LLM Evaluations. Where [Online Evaluations](llm-evaluations.md) score live traces and spans as they arrive, Experiments run a controlled set of **Dataset cases** through a task and a fixed set of scorers, then let you compare two runs against each other to decide whether a change actually improved your application.

## Overview

An Experiment is an immutable evaluation plan: it pins a **Dataset snapshot**, a **task** (what generates the output), a set of **scorers** (what judges the output), and a **trial count** (how many times each case runs). Creating an Experiment produces a deterministic set of **slots** — one per case per trial — which the platform then executes and scores.

The core resources build on each other:

| Resource | What it does |
|---|---|
| **Dataset** | A versioned collection of evaluation cases. Each case has an `input`, an optional `expected_output` (a reference answer), metadata, and tags. |
| **Dataset Item** | One case in a Dataset. Items are append-only (MVCC) — every edit writes a new revision, so any past state can be pinned and reproduced. |
| **Experiment** | An immutable plan that pins a Dataset snapshot, a task, scorers (each at a specific version), and a trial count. |
| **Slot** | One unit of work: a single case running a single trial. An Experiment with `N` cases and `T` trials plans `N × T` slots. |
| **Remote Task** | A published, versioned task (e.g., an external HTTP endpoint) that an Experiment can reference by `name@version`. |
| **Comparison** | A side-by-side, deterministic comparison of two Experiments on the same Dataset, bucketing each case as regressed, improved, unchanged, new, or missing. |

![TODO: screenshot of the AI Observability Datasets list page](images/placeholder.png)

## Enable Experiments

Experiments are part of the enterprise LLM Evaluations feature. Enable Online Evaluations first:

```env
ZO_ONLINE_EVALS_ENABLED=true
```

When enabled, the **AI Observability** navigation appears with **Datasets**, **Experiments**, and the **Compare** view. You need at least one **Provider**, **Score Config**, and **Scorer** (see [LLM Evaluations](llm-evaluations.md)) before you can run a meaningful Experiment.

## Datasets

A Dataset is the ground truth an Experiment runs against. You can add cases manually, pull them from annotated traces, or upsert them programmatically from your own pipeline.

### Create a dataset

Navigate to **AI Observability > Datasets** and click **Add Dataset**. Give it a name, an optional description, and tags.

### Add cases

A case is the pair of `input` (the prompt or payload) and an optional `expected_output` (the reference answer). The reference answer is now optional: a scorer that only needs `{{input}}` and `{{output}}` — for example a style or safety judge — can run on cases that never declare an expected answer.

Each case records its **source**:

| Source | How the case was created |
|---|---|
| **Manual** | Added by hand through the UI or the Dataset item API. |
| **Trace** | Promoted from a captured trace. |
| **Annotation** | Adjudicated from an annotation queue (see [LLM Evaluations](llm-evaluations.md)). |

![TODO: screenshot of the Add to Dataset drawer](images/placeholder.png)

### Dataset detail and source counts

The Dataset detail page lists the cases and shows a live item count broken down by source (**trace**, **annotation**, **manual**). The counts are computed at read time from the item history rather than stored as a counter, so they always reflect the current, non-deleted cases.

![TODO: screenshot of a Dataset detail page showing items and source counts](images/placeholder.png)

### Snapshots and versioning

Every write to a Dataset bumps a single `global_version` counter and appends a new revision of the affected case. This gives you MVCC history: you can read the Dataset as it existed at any version. An Experiment pins a specific snapshot version, so later edits or deletions never leak into a run already in progress — a pinned snapshot is stable forever.

### Programmatic upserts

For CI pipelines and SDK integrations, the Dataset upsert API creates or updates cases under a client-supplied identity:

| Field | Description |
|---|---|
| `logicalId` | A stable ID for the case. Omit it to append a new case with a server-generated identity. |
| `input` / `expectedOutput` | The case content. `expectedOutput` may be omitted. |
| `ifRowId` | The revision you read. Required whenever `logicalId` names a case that already exists — this gives optimistic-concurrency protection. |
| `restore` | Consent to bring a soft-deleted case back. Without it, updating a deleted case is a conflict. |
| `idempotencyKey` | A client key that makes the whole batch retry-safe. Re-sending the same key with the same content replays the stored result instead of writing again. |

The whole batch commits or rolls back atomically, and unchanged content appends no new revision (repeated runs don't inflate the Dataset's version history).

## Experiments

### Create an experiment

Navigate to **AI Observability > Experiments** and click **Add Experiment**. The form guides you through the plan:

![TODO: screenshot of the Experiment creation form](images/placeholder.png)

| Field | Description |
|---|---|
| **Name / Description** | Display name and an optional description. |
| **Dataset** | The Dataset to evaluate, plus the **snapshot version** to pin (defaults to the current version) and an optional **filter** to select a subset of cases. |
| **Task** | How each case's output is produced — see task types below. |
| **Scorers** | One or more scorers, each pinned to a specific version. |
| **Trial Count** | How many times each case runs. Bounded by the `O2_EVAL_EXPERIMENT_MAX_TRIAL_COUNT` configuration (default `10`). |

### Task types

The task is what actually produces the output that scorers judge:

| Type | Description |
|---|---|
| **Inline Prompt** | The platform calls an LLM provider with a message template (e.g., `Answer: {{input}}`). You choose a provider, an optional model, and extra parameters. |
| **Remote Task** | References a published Remote Task by `name@version` (never "latest"), so a run cannot drift from the version a test connection verified. Only `maxConcurrency` and `timeoutMs` may be overridden. |
| **SDK** | The customer's own process produces the output. The Experiment pins a `taskFingerprint` that every reported execution record must repeat — changed code is a new Experiment, never a continuation of the old one. SDK Experiments may declare no platform scorers and report their own scores instead. |

### Preview and cost estimate

Before you commit, the form shows a preview of the plan: the number of rows, slots (`rows × trials`), the pinned scorer versions, and an **applicability** breakdown that flags cases with no reference answer (which a reference-based scorer can't judge).

![TODO: screenshot of the Experiment preview panel showing applicability and cost estimate](images/placeholder.png)

The preview also shows an order-of-magnitude **cost estimate** in USD: `slots × (task tokens + each judge's tokens)`, priced with the same table used for real calls. Models with no known price are reported as unknown rather than free, and Remote/SDK task execution (which runs in your own environment) is reported as not estimated. Above a warning threshold (default `$10.00`), creation requires an explicit `confirmCostEstimate` acknowledgement — the estimate is a planning aid, not a spending limit.

The plan is capped at `10,000` slots, so an oversized Dataset selection or trial count is rejected up front rather than started.

### Lifecycle

Experiments follow a state machine:

```
pending → running → completed
              ↓
          cancelled
              ↓
            failed → (retry) → running
```

An Experiment starts **running** as soon as it's created and runs within a 24-hour deadline window (configurable via the `deadline_at`). `failed` Experiments stay resumable: a coordinate retry can restart unfinished slots without reopening the whole run.

### Baseline

Each Dataset can have one **Baseline** Experiment — the run every comparison defaults to. Only a completed Experiment with no task errors and settled scoring is eligible. Setting a Baseline clears the previous one in a single transaction, so a Dataset never has two Baselines (or none) mid-move.

### Clone

You can clone an Experiment to reuse its frozen definition. A clone inherits every field from its source; any override you omit is kept, so a bare request reproduces the source exactly (with a `(copy)` name suffix).

## Experiment results

The detail page joins the pinned slots to their execution and score evidence, preserving pinned order. Slots with no evidence yet stay visible as placeholders, so a live run never hides work it still owes.

Each slot reports:

- A **task status** (`pending`, `in_progress`, `ok`, `skipped`, `error`) derived from its execution record.
- One **score entry per pinned scorer**, plus any **client scores** the customer's own code reported.

![TODO: screenshot of the Experiment detail page showing slot results](images/placeholder.png)

Run-level summaries include task and scoring progress, a skip summary (cases skipped for a missing reference or a missing execution trace), and per-scorer aggregates — numeric means, boolean counts, or categorical counts. A derived **scoring status** (`pending`, `running`, `completed`, `completed_with_errors`) tells you whether scoring has settled; a comparison or CI assertion only becomes final once it has.

For SDK Experiments, results are reported back through the ingest API, which accepts records **per part, not per batch**: one malformed record doesn't discard the good ones beside it, and each accepted part is idempotent (re-sending an acknowledged part is a no-op). A record whose `taskFingerprint` doesn't match, or any new evidence written after the Experiment is sealed, is refused.

## Comparing experiments

Use the **Compare** view to pit a candidate Experiment against a Baseline on the same Dataset.

![TODO: screenshot of the Experiment compare picker dialog](images/placeholder.png)

Rows are joined by stable dataset `logicalId`. Each case is bucketed:

| Bucket | Meaning |
|---|---|
| **Regressed** | At least one gating dimension moved past the threshold in the worse direction. |
| **Improved** | At least one gating dimension improved and none regressed. |
| **Unchanged** | No gating dimension moved beyond the threshold. |
| **Inconclusive** | A common case with no gating dimension scored on both sides — there's no evidence to call it either way. |
| **New / Missing** | Present only on the candidate (new) or only on the baseline (missing). |

![TODO: screenshot of the Experiment comparison panel](images/placeholder.png)

Direction is never guessed. A score dimension can vote (be **gating**) only when its pinned Score Config declares a comparison policy: a numeric direction (`gte` = higher is better, or `lte` = lower is better), healthy categories, or a healthy boolean value. **Cost** and **latency** are the only dimensions with an intrinsic direction — lower is always better. Everything else is **descriptive**: its change stays visible but never becomes a verdict. Deltas are oriented so positive always means better, and each case's delta is also compared against the dispersion between its own trials (a "within noise" flag) so you can tell a real change from a noisy one.

## Remote Tasks

Remote Tasks let you register an external evaluation endpoint as a published, versioned task that Experiments can reference. An Experiment references a task by `name@version`, and creation resolves that reference against the registry, accepting only a published, verified, active version. See [LLM Evaluations](llm-evaluations.md) for the Remote scorer type; a Remote Task is the versioned, referenceable form of that idea.

## Configuration

Experiment-related settings live under the LLM evaluation configuration:

| Variable | Default | Description |
|---|---|---|
| `O2_EVAL_OUTBOUND_MAX_RESPONSE_BYTES` | `1048576` | Maximum response size accepted from an evaluation endpoint. The body is abandoned mid-stream once it exceeds this. |
| `O2_EVAL_OUTBOUND_CONNECT_TIMEOUT_SECS` | `10` | Connect timeout (seconds) for evaluation endpoint calls. |
| `O2_EVAL_EXPERIMENT_MAX_TRIAL_COUNT` | `10` | Maximum `trialCount` an Experiment may request. `0` reads as "unset" and falls back to `10`. |

## RBAC

Experiment resources have their own OFGA permissions:

| Resource | OFGA Type | Permissions |
|---|---|---|
| Datasets | `dataset` | GET, LIST, POST, PUT, DELETE |
| Experiments | `experiment` | GET, LIST, POST, PUT, DELETE |
| Remote Tasks | `remote_task` | GET, LIST, POST, PUT, DELETE |

Assign the appropriate roles in **Identity & Access Management > Roles** to control access to experiment resources.

## Super Cluster

In multi-node deployments, experiment and dataset resources are synchronized across the super cluster via dedicated queue topics, and the experiment evaluation target runs through a durable queue topic (`eval.task.experiment`) with a dedicated dead-letter topic (`eval.task.experiment.dlq`). Changes made on any node propagate automatically.

## API Reference

All endpoints are prefixed with `/api/{org_id}` and follow the same conventions as the rest of the evaluation API. The experiment surfaces expose:

| Resource | Operations |
|---|---|
| **Datasets** | List, create, get, update, delete; list items and item versions; read a pinned snapshot; batch upsert items (idempotent). |
| **Experiments** | List, create (returns the preview and the created Experiment, replayable via `idempotencyKey`), get, clone; list slots and scorer definitions; set/clear the Baseline. |
| **Experiment results** | Read slot results, progress, skip and score summaries, and scoring status for an Experiment. |
| **Comparison** | Compare two Experiments, returning counts, dimension summaries, and per-row buckets. |
| **Experiment ingest** | (SDK Experiments) Report execution records and client scores per part, with per-part acceptance and idempotent replays. |
| **Remote Tasks** | List, create, get, update, delete, and verify task versions. |

**Create Experiment payload fields** (in addition to the fields described above):

| Field | Type | Description |
|---|---|---|
| `datasetVersion` | number | The Dataset snapshot version to pin. |
| `datasetFilter` | object | Optional subset filter (`logicalIds`, `sources`, `tags`, `metadata`). |
| `task` | object | Tagged union: `{ "type": "inline_prompt", ... }`, `{ "type": "remote", ... }`, or `{ "type": "sdk", ... }`. |
| `scorers` | array | `{ "id": "...", "version": number }` references. |
| `trialCount` | number | Trials per case (bounded by `O2_EVAL_EXPERIMENT_MAX_TRIAL_COUNT`). |
| `idempotencyKey` | string | Optional retry key; replaying the same key with the same definition returns the stored result. |
| `confirmCostEstimate` | boolean | Required when the cost estimate exceeds the warning threshold. |
