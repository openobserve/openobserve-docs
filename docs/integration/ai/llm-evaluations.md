# LLM Evaluations

LLM Evaluations let you automatically score the quality of your LLM traces using an LLM-as-judge pipeline, with results surfaced per trace inside OpenObserve.

> **Enterprise feature.** LLM Evaluations and Eval Templates are available in OpenObserve Enterprise.

## Overview

LLM Evaluations build on [LLM Observability](llm-applications.md). Once your application is exporting LLM traces to OpenObserve, an evaluation pipeline can grade each LLM response against criteria such as correctness, relevance, or safety. A second LLM acts as the judge, so you get continuous, automated quality scoring without manual review or a separate evaluation tool.

This is for teams running LLM-powered applications in production who need to monitor not just latency, tokens, and cost, but also the quality of the responses their models produce. Evaluations run server-side as part of a traces pipeline, so they apply to live traffic as it arrives.

At a high level, the feature has three parts: an **LLM-evaluation pipeline node** that runs the judge on incoming traces, **Eval Templates** that define what the judge evaluates and how, and an **Evaluations** view in the trace detail page where you read the results.

## How evaluations work

An LLM evaluation runs as a node inside a pipeline attached to a traces stream:

1. You add an LLM-evaluation node to a pipeline whose source is a traces stream that contains LLM spans.
2. As traces arrive, the node identifies LLM spans, optionally samples them, and sends them to the LLM judge.
3. The judge scores each trace using an Eval Template. OpenObserve either uses a template you select by name or auto-resolves one by `response_type`.
4. The evaluation results are written to a separate output stream named `<stream>_evaluations`. For example, evaluating a stream called `default` produces a `default_evaluations` stream.
5. Per-trace results appear in an **Evaluations** tab in the trace detail view. This tab is shown only for LLM traces that have associated evaluation records.

Only LLM spans are evaluated. The pipeline pre-filters incoming spans and keeps LLM spans, tool spans, and root spans, dropping pure infrastructure spans (such as HTTP, database, or cache spans) that would never be evaluated.

## Setting up an evaluation pipeline

### Prerequisites

- LLM traces are being ingested into a traces stream. See [LLM Observability](llm-applications.md) to instrument your application.
- An OpenObserve Enterprise instance with the LLM judge configured.
- Optionally, an Eval Template created in advance (see [Eval Templates](#eval-templates)). If you do not select one, OpenObserve auto-resolves a template by `response_type`.

### Add an LLM-evaluation node

1. Create or open a pipeline whose source is the traces stream that contains your LLM spans.
2. Add an **LLM Evaluation** node to the pipeline.
3. Configure the node parameters described below.
4. Save the pipeline. The node begins evaluating traces as new data is ingested.

### Node parameters

| Setting | Description | Default |
|---------|-------------|---------|
| **`enable_llm_judge`** | Turns LLM-as-judge evaluation on for the node. | `true` |
| **`sampling_rate`** | Fraction of LLM traces to evaluate, from `0.0` to `1.0`. Use a lower rate to control cost on high-volume streams. A value of `0.0` disables sampling. | `0.01` |
| **`llm_span_identifier`** | Span field used to detect LLM spans. Only spans that contain this field with a non-empty value are treated as LLM spans. | `llm_input` |
| **`eval_template`** | Optional template to use for evaluation, selected by name. When set, it overrides auto-resolution by `response_type`. Leave empty to auto-resolve. | None |

> **Tip**: Start with a low `sampling_rate` on busy production streams to validate your template and judge configuration before scaling up to evaluate every trace.

When you update a pipeline that contains an LLM-evaluation node, OpenObserve refreshes the running evaluation so changes such as a new `eval_template` take effect on the next batch of ingested traces.

## Eval Templates

An Eval Template defines what the LLM judge evaluates and how it scores a response. Templates are managed from the enterprise **Eval Templates** tab, located alongside **Functions** and **Enrichment Tables**.

### Template fields

Each template specifies:

- **`response_type`**: The expected shape of the evaluation result, for example a numeric score in the range `0.0` to `1.0`. The `response_type` is also used to auto-resolve a template for a pipeline node when no template is explicitly selected.
- **`name`**: A human-readable name used to select the template from a pipeline node.
- **`description`**: An optional summary of what the template evaluates.
- **`content`**: The prompt and instructions the judge uses to perform the evaluation.
- **`dimensions`**: The criteria the trace is evaluated against. At least one dimension is required.

### Versioning

Templates are versioned. Editing a template creates a new version and preserves the original creation time, so you can iterate on a template without losing earlier definitions. New templates start at version `1`.

### Per-template statistics

Each template surfaces usage statistics so you can see how it is performing:

- **Total Evaluations**: The number of evaluations the template has produced.
- **Average Quality Score**: The mean quality score across those evaluations, shown as a percentage.

A template that has been created but not yet used reports zero evaluations and a zero average quality score.

### Managing templates through the API

Eval Templates can also be managed through a CRUD REST API scoped to an organization:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/{org_id}/eval_templates` | List all templates for the organization. |
| `POST` | `/api/{org_id}/eval_templates` | Create a new template. |
| `GET` | `/api/{org_id}/eval_templates/{template_id}` | Retrieve a single template. |
| `PUT` | `/api/{org_id}/eval_templates/{template_id}` | Update a template, creating a new version. |
| `DELETE` | `/api/{org_id}/eval_templates/{template_id}` | Delete a template. |
| `GET` | `/api/{org_id}/eval_templates/{template_id}/stats` | Get usage statistics for a template. |

A template that is referenced by a pipeline cannot be deleted. The delete request returns a conflict response listing the pipelines that still use it; update or remove those pipelines first.

## Viewing results

Evaluation results are stored in the `<stream>_evaluations` output stream and surfaced per trace in the UI:

1. Navigate to **Traces** in the left sidebar.
2. Open an LLM trace that has been evaluated.
3. Select the **Evaluations** tab in the trace detail view to see the scores and dimensions for that trace.

The **Evaluations** tab appears only for LLM traces that have associated evaluation records. Traces without evaluations, or non-LLM traces, do not show the tab.

You can also query the `<stream>_evaluations` stream directly from **Logs** or build dashboards on it to track quality trends over time.

## Best practices

- Confirm LLM traces are flowing and visible under **Traces** before adding an evaluation node, since the judge only evaluates LLM spans.
- Begin with a low `sampling_rate` to validate your template and judge, then increase it once results look correct.
- Define clear, focused `dimensions` in each template so scores are easy to interpret and act on.
- Use template versioning to refine evaluation prompts over time instead of recreating templates.
- Remove or update pipelines that reference a template before attempting to delete it.

## Troubleshooting

### The Evaluations tab does not appear on a trace

**Problem**: You open a trace but there is no **Evaluations** tab.

**Solution**:

1. Confirm the trace is an LLM trace. Non-LLM traces never show the tab.
2. Verify the evaluation pipeline is attached to the correct traces stream and is enabled.
3. Check that `sampling_rate` is not `0.0`, since a zero sampling rate means no traces are evaluated.
4. Confirm the `llm_span_identifier` matches a field present on your LLM spans, so the spans are recognized as LLM spans.
5. Look for records in the `<stream>_evaluations` output stream. If none exist, the pipeline has not produced evaluations yet.

### A template cannot be deleted

**Problem**: Deleting a template returns a conflict error.

**Solution**:

1. Note the pipeline names listed in the error message.
2. Update those pipelines to use a different template, or remove their LLM-evaluation nodes.
3. Retry the delete once no pipeline references the template.

> **Note**: Evaluation cost scales with the number of traces the judge processes. Use `sampling_rate` to balance coverage against the cost of running the judge model. To track the cost of the underlying LLM calls themselves, see [Model Pricing](model-pricing.md).

## Read more

- [LLM Observability with OpenObserve](llm-applications.md)
- [Model Pricing](model-pricing.md)
