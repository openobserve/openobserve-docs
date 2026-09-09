---
title: LLM Annotations and Datasets
metaTitle: LLM Annotations and Datasets in OpenObserve
description: Learn how to build human review queues, curate golden datasets, and discover underperforming LLM traces in OpenObserve.
---

# LLM Annotations and Datasets

Annotations and Datasets extend Online Evaluations with a human-in-the-loop workflow: you discover underperforming spans, traces, and sessions, enqueue them for review against a rubric, and promote the human-verified results into golden datasets you can reuse for offline evaluation.

## Overview

Online Evaluations score your LLM traffic automatically with LLM Judge or Remote scorers. Annotations and Datasets add the human layer on top of those machine scores, with three resources:

| Resource | What it does |
|---|---|
| **Annotation Queue** | A review workflow. A queue pins one or more **Score Configs** as a rubric, holds a list of span/trace/session references to review, and tracks per-item review progress. Reviewers submit human scores that are written back to the `_llm_scores` stream. |
| **Dataset** | A golden dataset for offline evaluation. Each dataset holds items with an `input` and a human-approved `expectedOutput`, sourced manually, from telemetry, or from queue adjudication. Items are fully versioned. |
| **Discovery** | A read-side projection over `_llm_scores` that surfaces the traffic most worth reviewing, ranked by the number of unhealthy score dimensions, so you can enqueue or annotate issues directly. |

All three resources build on the **Score Config** from Online Evaluations: a score config defines the shape and healthy/unhealthy threshold of a score, and it is the "dimension" you review against in a queue.

![the AI Observability area showing Queues, Datasets, and Discovery](images/placeholder.png)

## Enable Annotations and Datasets

Annotations and Datasets are an enterprise feature, gated by the same flag as Online Evaluations:

```env
ZO_ONLINE_EVALS_ENABLED=true
```

When enabled, the **Queues**, **Datasets**, and **Discovery** pages appear alongside the Online Evaluations pages. When disabled, the pages and settings are hidden; backend API endpoints remain reachable.

A background reconciliation job keeps queue review state consistent with the `_llm_scores` stream. Control its cadence with:

```env
O2_LLM_REVIEW_RECONCILE_INTERVAL_SECS=600
```

Set it to `0` or a negative value to pause the job. See [Review reconciliation](#review-reconciliation) below.

## Annotation Queues

An Annotation Queue is a named review workflow. When you create a queue, you pin one or more **Score Configs** to it; those score configs become the rubric reviewers score against. The queue can optionally target a **Dataset** so reviewed items can be pushed straight into a golden set.

### Create a queue

Navigate to **Evaluations > Queues** and click **Add Queue**.

![TODO: screenshot of the Add Queue dialog showing pinned score configs and target dataset](images/placeholder.png)

| Field | Description |
|---|---|
| **Name** | Display name for the queue. |
| **Description** | Optional description. |
| **Target Dataset** | (Optional) A dataset this queue adjudicates into. Reviewed items can be pushed to it in one step. |
| **Score Configs** | One or more score configs that define the review rubric. The queue records the exact immutable physical row ID of each selected score config version. |

A queue accepts span, trace, and session references. The allowed reference types and the pinned score configs are server-owned; you cannot spoof them through the API.

![TODO: screenshot of the Annotation Queues list page showing review progress](images/placeholder.png)

The queues list shows each queue's **reviewed** versus **total** item count so you can see review progress at a glance.

### Update a queue

Editing a queue's score config bindings uses optimistic concurrency. You submit both the `expectedScoreConfigRowIds` (the exact binding set the edit form rendered) and the new `scoreConfigRowIds`. If another editor changed the rubric in the meantime, the update is rejected with a conflict so a stale form cannot silently overwrite their work.

### Enqueue items

Add a discovered span, trace, or session to a queue from **Discovery**, or by sending a `POST` to `/api/{org_id}/annotation_queues/{queue_id}/items` with:

```json
{
  "refType": "trace",
  "refId": "trace-abc123",
  "refTraceId": null,
  "refTraceStartTime": 1720000000000000
}
```

| Field | Description |
|---|---|
| `refType` | The reference scope: `span`, `trace`, or `session`. |
| `refId` | The span, trace, or session ID, according to `refType`. |
| `refTraceId` | Owning trace ID. Required only when `refType` is `span`. |
| `refTraceStartTime` | Reference trace start time in microseconds. Required for every scope; used as the lower bound for score/annotation lookups in the workbench. |

Enqueuing the same reference into the same queue returns a conflict. A reference can live in multiple queues independently, and each queue tracks its own item status.

### Review items in the workbench

Open a queue and select an item to review. The **workbench** hydrates the item's business **input**, **output**, and **trace** context from the source stream, and lists the item's **machine scores** (the LLM Judge / Remote scores already recorded for that target) next to the review rubric.

![TODO: screenshot of the review workbench showing a queue item's input, output, machine scores, and score rubric](images/placeholder.png)

Submit your review by scoring each pinned score config and adding an optional comment. A review submission includes:

- `submissionId` — a client-generated idempotency key shared by all the scores in one submission. Reuse it only when retrying the identical logical submission.
- `scores` — one entry per rubric dimension, each carrying the `scoreConfigRowId` and a value matching that config's data type (numeric, categorical, or boolean), plus optional reasoning and metadata.
- `comments` and `targetMetadata` — optional reviewer comment and agent identity.

The submission is written to `_llm_scores` with a source type of `annotation`, and the queue item flips from **pending** to **reviewed**.

### Push reviewed items to a dataset

When a queue targets a dataset, you can promote a reviewed item into it with `POST /api/{org_id}/annotation_queues/{queue_id}/items/{queue_item_id}/push_to_dataset`. You select the destination dataset and the review submission that represents your final adjudication, and provide an explicit human-finalized `expectedOutput`. The item's input is resolved server-side from the queue item, so provenance cannot be spoofed.

### Manage queue items

- **Archive** removes items from the active review set in bulk while preserving them for audit.
- **Clear** removes all items from a queue.

## Datasets

A Dataset is a golden set of `input`/`expectedOutput` pairs you can use to benchmark and regress your LLM application offline. Datasets carry `name`, `description`, `tags`, and a `globalVersion` that increments as items change.

### Create a dataset

Navigate to **Evaluations > Datasets** and click **Add Dataset**.

![TODO: screenshot of the Datasets list page](images/placeholder.png)

Provide a **Name**, an optional **Description**, and optional **Tags**. Tags help you filter and organize datasets for offline evaluation.

### Add items

Dataset items are written through three entry paths, each exposing only the provenance the caller legitimately owns:

| Entry path | How you add the item |
|---|---|
| **Manual** | From the dataset detail page, enter an `input` and `expectedOutput` directly. |
| **Telemetry** | From a trace or span's detail, add the object as an item by reference (`refType` of `trace` or `span`, not `session`). The service retrieves and purifies the business input from the immutable reference. |
| **Queue adjudication** | Push a reviewed queue item into the dataset (see [Push reviewed items to a dataset](#push-reviewed-items-to-a-dataset)). |

![TODO: screenshot of the Add to Dataset drawer for adding a telemetry item](images/placeholder.png)

### Import from CSV

Add many items at once with a multipart CSV import at `POST /api/{org_id}/datasets/{dataset_id}/items/import`. Malformed rows are skipped and summarized in the response (`importedCount` and `skippedCount`).

### Version history

Every dataset item is immutable and versioned. Each item has a stable **logical ID**, a unique **row ID** per version, and a `globalVersion`. Updating an item writes a new version rather than overwriting the old one. The item detail page shows the full version history, and you can retrieve it via `GET /api/{org_id}/datasets/{dataset_id}/items/{item_id}`.

![TODO: screenshot of the Dataset detail page showing items and their version history](images/placeholder.png)

Deleting an item records a tombstone rather than erasing history; use the `includeDeleted` query parameter to include the latest tombstone for deleted logical items. Item fields track their provenance — `source` (`trace`, `annotation`, or `manual`), `sourceRef`, `queueId`, `reviewSubmissionId`, `adjudicatedBy`, and `importFilename` are all server-owned.

## Discovery

Discovery is the entry point for finding traffic worth reviewing. It projects `_llm_scores` into a scoped list of spans, traces, and sessions, each tagged with a **quality** classification.

![TODO: screenshot of the Discovery page showing issue quality cells and scope totals](images/placeholder.png)

| Filter | Description |
|---|---|
| **Scope** | The target granularity: `span`, `trace`, or `session`. |
| **Queue status** | Membership filter: `not_enqueued` (default), `enqueued`, `pending`, `reviewed`, or `all`. |
| **Time range** | `startTime` and `endTime`, in microseconds. |

Each discovery item reports:

- **Quality** — `issue` when one score dimension is unhealthy, or `multiple` when two or more are unhealthy.
- **Issue count** — the number of unhealthy dimensions.
- **Context** — scope-specific display fields hydrated from the target trace stream (for example input, service name, and operation name).
- **Queues** — the annotation queues this target already belongs to, with each membership's workflow status.

The response also returns **scope totals** (span / trace / session counts) so you can see the shape of issues across granularities. From Discovery you can **Add to Queue** to enqueue an item for review, or **Annotate** to score it immediately.

## On-demand annotation

In addition to queue-based review, you can annotate a single span, trace, or session directly from a trace's detail view or from Discovery. The annotation writes human scores straight to `_llm_scores`.

![TODO: screenshot of the Annotate drawer for on-demand annotation](images/placeholder.png)

Send a `POST` to `/api/{org_id}/annotations` with:

```json
{
  "scope": "trace",
  "targetId": "trace-abc123",
  "traceId": "trace-abc123",
  "sessionId": null,
  "refTimestamp": 1720000000000000,
  "sourceStream": "default",
  "scores": [
    { "scoreConfigRowId": "row-v1", "value": 0.9, "reasoning": "accurate" }
  ],
  "targetMetadata": { "agentName": "support-bot" }
}
```

The response returns the `annotationId`, the created `scoreIds`, and the `annotatedAt` timestamp. Annotation scores are recorded in `_llm_scores` with a source type of `annotation`.

## Score writing

Both queue reviews and on-demand annotations write their scores to the `_llm_scores` system stream. Each score carries the pinned score config's row ID and version, so human scores are always traceable to the exact rubric version they were judged against. Machine scores (from LLM Judge and Remote scorers) and human scores (from annotations and reviews) coexist in the same stream and are distinguished by `sourceType`.

## RBAC

Annotations and Datasets introduce two OFGA resources, in addition to the Online Evaluations resources:

| Resource | OFGA Type | Permissions |
|---|---|---|
| Annotation Queues | `annotation_queue` | GET, LIST, POST, PUT, DELETE |
| Datasets | `dataset` | GET, LIST, POST, PUT, DELETE |

Additional access rules:

- **Discovery** requires the organization-level trace-read grant, the same as other derived trace views.
- **Annotations** require `LIST` on `score_configs` — annotating is a *use* of visible score configs, not a mutation of them. The handler additionally verifies visibility for every selected config before publishing a score.
- **Queues** enforce transitive score config visibility: a queue is only visible to a user who can also see every score config pinned to it, so queue membership cannot leak a hidden rubric.

Assign roles in **Identity & Access Management > Roles** to control access to these resources.

## Super Cluster

In multi-node deployments, annotation queues and datasets are synchronized across the super cluster via dedicated queue topics: `eval_annotation_queue` and `eval_dataset` (joining the existing `eval_provider`, `eval_score_config`, `eval_scorer`, and `eval_job` topics). Changes made on any node propagate automatically.

## Review reconciliation

Queue item review status is projected from `_llm_scores`. A background job, `llm_review_reconciliation`, repairs the narrow eventual-consistency window where score ingestion succeeded but the queue item's workflow status did not update. The job runs only on the scheduler leader and only while Online Evaluations is enabled. Tune or pause it with `O2_LLM_REVIEW_RECONCILE_INTERVAL_SECS` (default `600`).

## API Reference

All endpoints are prefixed with `/api/{org_id}`.

### Annotation Queues

| Method | Path | Description |
|---|---|---|
| `GET` | `/annotation_queues` | List queues |
| `POST` | `/annotation_queues` | Create a queue |
| `GET` | `/annotation_queues/{queue_id}` | Get a queue |
| `PUT` | `/annotation_queues/{queue_id}` | Update a queue (with `expectedScoreConfigRowIds`) |
| `DELETE` | `/annotation_queues/{queue_id}` | Delete a queue |
| `GET` | `/annotation_queues/items` | List queue items (optionally by `queueId`, `queueStatus`, `scope`) |
| `POST` | `/annotation_queues/{queue_id}/items` | Enqueue a span/trace/session |
| `DELETE` | `/annotation_queues/{queue_id}/items` | Clear all items from a queue |
| `GET` | `/annotation_queues/{queue_id}/items/{queue_item_id}` | Get a hydrated item with content and machine scores |
| `GET` | `/annotation_queues/{queue_id}/items/{queue_item_id}/reviews` | List review submissions |
| `POST` | `/annotation_queues/{queue_id}/items/{queue_item_id}/reviews` | Submit a review |
| `POST` | `/annotation_queues/{queue_id}/items/archive` | Archive items in bulk |
| `POST` | `/annotation_queues/{queue_id}/items/{queue_item_id}/push_to_dataset` | Push a reviewed item to a dataset |

### Datasets

| Method | Path | Description |
|---|---|---|
| `GET` | `/datasets` | List datasets |
| `POST` | `/datasets` | Create a dataset |
| `GET` | `/datasets/{dataset_id}` | Get a dataset |
| `PUT` | `/datasets/{dataset_id}` | Update a dataset |
| `DELETE` | `/datasets/{dataset_id}` | Delete a dataset |
| `GET` | `/datasets/{dataset_id}/items` | List items (`includeDeleted`, `from`, `size`) |
| `POST` | `/datasets/{dataset_id}/items` | Push an item (`entryPoint`: `manual` or `telemetry`) |
| `POST` | `/datasets/{dataset_id}/items/import` | CSV import |
| `GET` | `/datasets/{dataset_id}/items/{item_id}` | Get an item's version history |
| `PUT` | `/datasets/{dataset_id}/items/{item_id}` | Update an item (writes a new version) |
| `DELETE` | `/datasets/{dataset_id}/items/{item_id}` | Delete an item (records a tombstone) |

### Annotations

| Method | Path | Description |
|---|---|---|
| `POST` | `/annotations` | Annotate a span/trace/session on demand |

### Discovery

| Method | Path | Description |
|---|---|---|
| `GET` | `/discovery?scope=trace&queueStatus=not_enqueued&startTime=&endTime=` | List discovery items with quality and queue membership |
