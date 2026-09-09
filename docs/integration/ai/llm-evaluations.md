# LLM Evaluations

OpenObserve provides two complementary evaluation capabilities: **Online Evaluations**, which continuously score your LLM application's traces and spans in production, and **Experiments**, which run scorers over a static dataset and compare two runs against each other. Both use configurable evaluators - either LLM-as-a-judge powered by your own AI providers, or external remote scoring endpoints.

## Overview

The Online Evaluations system has four core resources, each building on the previous:

| Resource | What it does |
|---|---|
| **Provider** | An LLM API configuration (OpenAI, Anthropic, etc.) with credentials and available models. Used by LLM Judge scorers to call an LLM. |
| **Score Config** | Defines the shape of a score - its data type (numeric, categorical, boolean), valid range or categories, and a healthy/unhealthy threshold. |
| **Scorer** | The evaluation logic: a template with `{{variables}}`, parameters for execution, and a link to a score config that describes the output it produces. Two types exist: **LLM Judge** (calls an LLM via a provider) and **Remote** (calls an external HTTP endpoint). |
| **Eval Job** | A running evaluation pipeline: binds one or more scorers to a specific stream, defines a **target scope** (span, trace, or session), which traces/spans to evaluate (filter), how many to sample, and manages the lifecycle (draft, active, paused, archived). |

When you activate an eval job, OpenObserve runs your scorers against incoming data. Scores flow into the `_llm_scores` stream; evaluator telemetry flows into the `_evaluator` traces stream.

![the Online Evaluations dashboard listing eval jobs](images/online-evaluations-1.png)

## Enable Online Evaluations

Online Evaluations is an enterprise-only feature, enabled by default. Set the enterprise configuration flag to control it:

```env
O2_ONLINE_EVALS_ENABLED=true
```

When disabled, the **Evaluations** navigation and all evaluation pages are hidden in the UI.

Trace- and session-scope jobs are detected by a background **Eval Scheduler** that periodically polls your trace streams for completed targets. Control how often it polls:

```env
O2_EVAL_SCHEDULER_POLL_INTERVAL_SECS=45
```

The default is `45` seconds; values below `1` are clamped to `1` second.

## Providers

A Provider stores the connection details for an LLM API. You configure one provider per AI service you want your LLM Judge scorers to use.

### Create a provider

Navigate to **Evaluations > Providers** and click **Add Provider**.

![the Providers list page](images/online-evaluations-2.png)

| Field | Description |
|---|---|
| **Name** | Display name for the provider. |
| **Provider Type** | The provider kind (`openai`, `deepseek`, `anthropic`, `ollama`, `openai_compatible`, or `vllm`). Determines the API protocol and default endpoint. |
| **Endpoint** | The full request URL. For most provider types this overrides the standard endpoint (leave empty to use the default). For `openai_compatible`, an explicit full request URL is required. |
| **Default Model** | The model used when no model is specified on the scorer. Required for `openai_compatible` and `vllm`, which have no default. |
| **Available Models** | List of model IDs this provider supports. Used for model selection in scorers. |
| **Auth Config** | Credentials in JSON format (e.g., `{"api_key": "sk-..."}`). Optional for keyless self-hosted providers (`openai_compatible`, `vllm`, `ollama`). The form marks the API key as required (`*`) only for `openai`, `deepseek`, and `anthropic`. Masked in API responses. |
| **Is Default** | When set, this provider is preselected when creating new LLM Judge scorers. |

![the Add Provider form](images/online-evaluations-3.png)

### OpenAI-compatible and vLLM providers

Two provider types connect OpenAI-compatible evaluation endpoints, including self-hosted models:

- **`openai_compatible`**: A generic provider for any OpenAI-chat-completions-compatible service (e.g., MiniMax, or your own gateway). Because there is no standard base URL, you must supply the full request URL in **Endpoint** (for example `https://api.minimax.io/v1/chat/completions`). The endpoint is preserved exactly as configured.
- **`vllm`**: A self-hosted vLLM OpenAI-compatible server. Defaults to `http://localhost:8000/v1/chat/completions`, so you can leave **Endpoint** empty to target a local vLLM instance.

Both types work with any model served behind an OpenAI-compatible API. Authentication is optional: if you leave the API key blank (omit `api_key` from **Auth Config**), no `Authorization` header is sent — ideal for keyless self-hosted vLLM and similar deployments.

### Test a provider

Use the **Test Connection** button on the provider form to verify connectivity against a configuration before you save it. The test sends a lightweight request to the configured endpoint and credentials, and reports **Connected** or **Connection failed**. When editing an existing provider, pass the stored provider ID so the test resolves the saved credentials without you re-entering the API key.

### Manage providers

- **Update**: Edit any field. The provider is updated in-place. If you leave the API key blank when updating, the existing key is preserved (so you don't accidentally clear or rotate it); supply a non-empty `api_key` to replace it.
- **Delete**: Removes the provider. Scorers referencing a deleted provider will fail until reassigned.

## Score Configs

A Score Config describes what a score looks like and when it is considered healthy.

### Create a score config

Navigate to **Evaluations > Score Configs** and click **Add Score Config**.

| Field | Description |
|---|---|
| **Name** | A label for this config (e.g., "Faithfulness", "Accuracy"). |
| **Data Type** | `numeric`, `categorical`, or `boolean` - the type of score value. |
| **Description** | Optional description of what the score measures. |
| **Numeric Range** | For numeric scores: `{"min": 0.0, "max": 1.0}`. |
| **Categories** | For categorical scores: a list of valid category labels. |
| **Healthy Threshold** | Defines the boundary for healthy scores (e.g., `{"direction": "gte", "value": 0.7}` means scores ≥ 0.7 are healthy). |

![the Score Configs list page](images/online-evaluations-4.png)

### Versioning

Score configs are versioned. Each config has a stable **entity ID** that stays the same across versions, and a unique **ID** per version. Updating a score config creates a new version and bumps the version number. Scorers that reference a score config can pin to a specific version or always use the latest.

## Scorers

A Scorer is the executable evaluation unit. It contains a prompt **template** with `{{variable}}` placeholders, execution **parameters**, and an optional link to a **score config** that describes its output.

### Scorer types

- **LLM Judge**: Sends the rendered template to an LLM via a configured provider. Supports temperature, max tokens, timeout, output parsing, and optional reasoning.
- **Remote**: Sends the rendered template as an HTTP request to an external evaluation service. Supports bearer token auth, API keys, basic auth, custom headers, timeouts, and retries.

### Create a scorer

Navigate to **Evaluations > Scorers** and click **Add Scorer**.

![the Scorers list page](images/online-evaluations-5.png)

| Field | Description |
|---|---|
| **Name** | Display name. |
| **Description** | Optional description. |
| **Scorer Type** | Choose **LLM Judge** or **Remote**. |
| **Produces Score Config** | (Optional) Link to a score config that describes this scorer's output. |
| **Template** | The evaluation prompt with `{{variable}}` placeholders that will be populated at runtime. |
| **Output Schema** | (LLM Judge only) JSON Schema for structured output parsing. |

For **LLM Judge**, you also configure:

| Field | Description |
|---|---|
| **Provider** | The provider to use for the LLM call. |
| **Model** | Override the provider's default model. |
| **Temperature** | LLM temperature (0-2). |
| **Max Tokens** | Maximum completion tokens. |
| **Timeout** | Request timeout in milliseconds. |
| **Include Reasoning** | When enabled, the LLM is prompted to include reasoning alongside the score. |
| **Extra Metadata Fields** | Additional fields the LLM should return beyond the score (e.g., failure mode classification). |

![the Add Scorer form for LLM Judge](images/online-evaluations-6.png)

For **Remote**, you configure:

| Field | Description |
|---|---|
| **Endpoint** | The URL of the remote scoring service. |
| **HTTP Method** | `POST` or `PUT`. |
| **Auth** | `none`, `bearer` (token), `basic` (username/password), or `api_key` (token + header name). |
| **Custom Headers** | Additional HTTP headers to send. |
| **Content Type** | Request content type (defaults to `application/json`). |
| **Timeout** | Request timeout in milliseconds. |
| **Max Retries** | Number of retry attempts on failure. |

### Test a scorer

From the scorer detail page, use the **Test** button. Provide values for the template variables, and the system executes a one-off evaluation. The response shows the score, reasoning, model used, latency, and token usage.

![the Scorer Test dialog showing results](images/online-evaluations-7.png)

### Preview output schema

For LLM Judge scorers, the **Preview Schema** endpoint shows the derived output schema based on the score config and extra metadata fields, helping you understand what structure the LLM will return.

### Versioning

Like score configs, scorers are versioned. Each scorer has a stable **entity ID** and a version number. Updating a scorer creates a new version. Eval jobs can reference a scorer by entity ID (always latest) or pin to a specific version.

## Eval Jobs

An Eval Job is the execution unit that runs scorers against incoming traces. Each job defines a **target scope** — the granularity at which scoring runs: individual spans, entire traces, or full sessions.

### Create a job

Navigate to **Evaluations > Eval Jobs** and click **Add Job**.

![the Eval Jobs list page](images/online-evaluations-8.png)

| Field | Description |
|---|---|
| **Name** | Display name for the job. |
| **Description** | Optional description. |
| **Stream** | The trace stream to evaluate. Must be a `traces` stream. |
| **Target Scope** | The evaluation granularity: `span` (score each matching span), `trace` (score a whole trace once it completes), or `session` (score an entire conversation session). |
| **Filter Condition** | A JSON filter expression. Only spans matching this filter are considered. For trace/session scopes, this filter selects which traces or sessions are eligible. |
| **Scorers** | One or more scorer references (by entity ID). The system evaluates each target against every listed scorer. |
| **Input Mapping** | Per-scorer mapping of template variables to a value source (e.g., `"input": "{{gen_ai_input_messages}}", "output": "{{gen_ai_output_messages}}"`). Each variable gets a searchable dropdown that combines **system-provided values** (values OpenObserve builds from the target itself, such as `input`, `output`, `statistics`, `spans`, and `steps`) with **span attributes** from the stream. |
| **Sampling Mode** | `all` (evaluate everything) or `rate` (evaluate a percentage, e.g., `0.1` for 10%). |
| **Sampling Value** | A scalar number (0--1) for rate mode, or `null` for all mode. |

![the Add Eval Job form](images/online-evaluations-9.png)

![eval job form with target scope selector](images/trace-session-evaluations-1.png)

### Input mapping

For each scorer in a job, the **Input Mapping** section lists every template variable the scorer's prompt declares. Each variable gets its own searchable dropdown that combines two groups of value sources:

- **System-provided values** — values OpenObserve builds automatically for the target being scored. For trace scope these are `input`, `output`, `statistics`, `spans`, and `steps`; for session scope they are `statistics` and `steps`. Use them directly (e.g., `{{ input }}`) without extra configuration.
- **Span attributes** — columns from the trace stream (e.g., `gen_ai_input_messages`, `gen_ai_output_messages`).

OpenObserve pre-seeds each variable with a sensible default so you can save a job without mapping every field by hand. When a trace-scope variable maps to `{{ spans }}`, the job asks for a Span Selector to choose which spans supply that value.


### Target scope

The **Target Scope** determines what unit of evaluation the job scores:

| Scope | What is evaluated | Completion logic |
|---|---|---|
| **Span** | Each matching span individually | Evaluated in real time, as soon as the span arrives. |
| **Trace** | An entire trace aggregated from multiple spans | The scheduler waits for the trace to complete (idle window + optional end signal), then assembles the aggregated payload. |
| **Session** | A full conversation session spanning multiple traces | Uses session ID columns (`session_id`, `gen_ai_conversation_id`, `llm_session_id`, or `gen_ai.conversation.id`) to group traces. Completes on idle window or end signal. |

Span-scope jobs evaluate in real time. Trace- and session-scope jobs are detected by the Eval Scheduler, which polls trace streams for completed targets.

### Trace and session completion

For trace-scope and session-scope jobs, the system must determine when a target is "complete" and ready for scoring. You control this with completion configuration:

| Field | Default | Description |
|---|---|---|
| **Idle Window** (sec) | 120 (trace) / 120 (session) | Time since the last new span in the target. Once no new spans arrive for this duration, the target is considered complete. Minimum 45 seconds. |
| **Max Age** (sec) | 1800 (trace) / 14400 (session) | Maximum time to wait for a target to complete. The target is scored after this duration even if spans are still arriving. Must be greater than idle window. |
| **End Signal** | None (optional) | A filter condition that marks the target as explicitly complete. When the matching span arrives, the target is evaluated immediately without waiting for the idle window. Useful for applications that emit a terminal span (e.g., `status = "complete"`). |

The end signal is a standard condition expression, using the same filter syntax as the job's main filter condition. For example, to mark a trace complete when a span with `status = "complete"` arrives:

```json
{
  "version": 2,
  "conditions": {
    "filterType": "group",
    "logicalOperator": "AND",
    "conditions": [{
      "filterType": "condition",
      "column": "status",
      "operator": "=",
      "value": "complete",
      "logicalOperator": "AND"
    }]
  }
}
```

When an end signal is configured, the target is evaluated when the signal span arrives OR when max age is reached, whichever occurs first.

![trace config with end signal](images/trace-session-evaluations-2.png)

### Span selectors (trace scope)

For trace-scope jobs, scorers may need only a subset of the spans in a trace rather than the entire trace. **Span Selectors** let you define named sub-queries that filter, pick, and limit spans within the trace for each scorer.

A span selector defines:

| Field | Description |
|---|---|
| **ID** | Unique identifier within the job. |
| **Name** | Human-readable name (e.g., "tool-call-spans"). |
| **Filter Condition** | A filter that selects which spans to include from the trace. |
| **Field Mode** | `default` (uses a preset list of gen-ai semantic convention fields) or `custom` (specify your own field list). |
| **Fields** | (Custom mode) The span attribute columns to include in the payload sent to the scorer. |
| **Maximum Spans** | The maximum number of matching spans to include (default 5). |

Bind each scorer to a span selector via **span selector bindings** — a mapping from scorer ID to selector ID. A trace-scope scorer only requires a binding when its prompt actually uses trace spans — that is, when its template references `{{ spans }}` or a variable mapped to `{{ spans }}`. Scorers that score a trace without reading spans can be activated without any selector.

![span selector configuration](images/trace-session-evaluations-3.png)

### Target view variables (trace/session scope)

For **trace**- and **session**-scope jobs, OpenObserve automatically assembles the target's telemetry into a set of enriched template variables before rendering each scorer template. You can reference these directly in your template (for example `{{input}}`, `{{output}}`, or `{{steps}}`) alongside any variables you map manually via **input mapping**.

| Variable | Scopes | Description |
|---|---|---|
| `input` | trace | The LLM input messages from the target's root span (first matching gen-ai input field). |
| `output` | trace | The LLM output messages from the target's root span. |
| `spans` | trace | A compact list of spans in the target — up to 5 by default, or the subset selected by a bound **span selector** (capped by its maximum spans). Each entry carries sequence, type, name, status, duration, timestamps, and tool/input/output where present. |
| `steps` | trace, session | An ordered sequence of up to 50 steps, each classified as an LLM call, tool call, or other span, with `type`, `kind`, `input`/`output`, `tool_input`/`tool_output`, and timing. Omitted steps are folded into a summary. |
| `statistics` | trace, session | Aggregate counters for the target: span count, LLM calls, tool calls, error count, total duration, total tokens, total cost, distinct tools, and trace/session counts plus event and ingest timestamps. |

These variables are populated for both automatic evaluations and manual evaluations, so the same template works regardless of how the run was triggered. Span-scope jobs do not receive this enrichment — they render templates from the span attributes selected by the job's input mapping.

### Manual evaluation

You can trigger an evaluation for a specific target on demand, bypassing the automatic sampling and completion logic. This is useful for re-evaluating a trace after changing scorers, or testing a job against a known trace or session.

You can launch a manual evaluation directly from the trace or session you are inspecting:

- On the **trace details** page, click **Evaluate trace** in the header to score the whole trace, or open a span's preview and click **Evaluate span** to score a single span.
- On the **session details** page, click **Evaluate session** in the header to score the entire conversation.

The buttons appear only for LLM traces/sessions in Enterprise or Cloud deployments where Online Evaluations is enabled. Clicking one opens a dialog where you choose which Eval Job to run; only jobs whose target scope and stream match the target you are viewing are listed. The evaluation worker loads the source telemetry from the target's own time range, so you don't have to specify one manually.

### Job lifecycle

Jobs follow a defined state machine:

```
draft → active ⇄ paused
          ↓
       degraded → active
          ↓
       archived
```

| Action | Description |
|---|---|
| **Activate** | Validates the job configuration, applies scope defaults, and starts scoring. For span-scope jobs, creates the underlying evaluation pipeline. For trace/session jobs, registers with the scheduler. Allowed from `draft`, `paused`, or `degraded`. |
| **Pause** | Temporarily stops evaluation. The pipeline or scheduler registration is preserved. Allowed from `active` or `degraded`. |
| **Resume** | Restarts evaluation from `paused` or `degraded` state. |
| **Archive** | Permanently stops evaluation. The job is retained for audit but no longer processes data. |

Use the action buttons on the job detail page to manage lifecycle transitions.

When you create a job or edit a draft, the form offers two submit actions: **Save as Draft** (keep it inactive) and **Save & Activate** (promote it straight to active). Editing a job that already has a run state (`active`, `paused`, or `degraded`) shows a single **Save** button instead, so a config edit never silently flips the job's enablement.

![the Eval Job detail page showing status and actions](images/online-evaluations-10.png)

### Update a job

Edit any field on a draft or active job. Updating bumps the job's version. If the job is active, your changes — new filters, sampling, scorers, or a change of target scope — take effect automatically without needing to pause and resume.

### Where scores go

Evaluated scores are written to the `_llm_scores` system stream, and evaluator telemetry (latency, tokens, status) is recorded in the `_evaluator` traces stream. You can query both streams directly for debugging or building dashboards.

## Quality Dashboard

The **Quality** tab provides a real-time overview of evaluation health across all your score configs, agents, and streams.

![quality page KPI cards with scope breakdown](images/trace-session-evaluations-4.png)

When a scorer fails, the **Scorer Failures** KPI card becomes clickable. Selecting it opens the Traces page filtered to the `_evaluator` stream for evaluator runs in an `error` or `timeout` state, so you can jump straight from a failure count to the failing evaluator executions.

![TODO: screenshot of the Scorer Failures KPI opening the filtered evaluator traces](images/placeholder.png)

### Scope filtering

When you drill into a specific score config from the quality page, the detail drawer includes a **scope selector** that lets you filter KPI cards, trend charts, and the evaluation runs table by target scope: **All**, **Span**, **Trace**, or **Session**. Switching the scope re-runs all queries within the drawer so you see metrics scoped to the selected granularity.

![quality detail drawer with scope selector](images/trace-session-evaluations-5.png)

### Evaluation runs

The score config detail drawer includes an **Evaluation Runs** table that lists individual score records — each row shows the score value (numeric, categorical, or boolean), health classification (healthy/unhealthy), the target identity (scope, trace ID, session ID), agent name, and reasoning if available. Click any row to navigate to the evaluator trace in the `_evaluator` stream for deeper debugging.

The runs table supports pagination and filtering (all runs or unhealthy only). Scope selector drilling works with the runs table — changing scope narrows the listed runs to only the selected target granularity.

![evaluation runs table in quality detail](images/trace-session-evaluations-6.png)

## Experiments

Experiments let you evaluate your LLM application against a dataset and compare a candidate against a baseline. Each experiment pins a dataset snapshot (a version and optional filter), a task (prompt- or SDK-driven), and one or more scorers. The system executes the task across every dataset row and trial, records execution evidence, and produces scores you can compare side-by-side.

### Experiment summaries

The experiments list renders a summary for each experiment from batched evidence. The system groups experiments into batches of 25 and issues three coordinated searches per batch — execution records from `_llm_experiment`, scores from `_llm_scores`, and LLM Judge cost from `_evaluator` — so list and detail views stay fast as the number of experiments grows.

Each summary reports:

| Field | Description |
|---|---|
| **Status** | A consolidated lifecycle state that combines execution and scoring: `pending`, `running`, `scoring`, `completed`, `cancelled`, `execution_failed`, or `scoring_failed`. |
| **Execution progress** | Completed, total, and skipped task slots. |
| **Scoring status** | The scoring phase state: `pending`, `running`, `completed`, or `completed_with_errors`. |
| **Score summaries** | Per-scorer score distributions and health classification. |
| **Aggregate summary** | p50 latency and cost totals across the whole experiment. |

You can also filter the experiments list by dataset to narrow the view to a single dataset's runs.

![Experiments list showing consolidated status, progress, and cost summary](images/experiment-status.png)

### Cost breakdown

The aggregate summary separates **task cost** — the LLM calls that execute each dataset row — from **scoring cost** — the LLM Judge calls that produce each score — and reports a single **total cost** that sums the two.

Scoring cost is aggregated from the `_evaluator` traces stream, scoped to the experiment's LLM Judge spans (`llm_judge.evaluate`). Each billed attempt is counted once: redelivered attempts are deduplicated by span so a retry never bills twice. When any cost is missing — an unpriced call, a delayed trace, or a remote scorer with no observable price — the summary flags the total as **incomplete** rather than silently under-reporting.

### Comparing experiments

When you compare a candidate against a baseline, the comparison joins rows by their stable dataset logical ID and classifies each row as **improved**, **regressed**, **unchanged**, **new**, or **missing**.

Two controls shape the verdict:

- **Comparison criteria (outcome dimensions)** — choose which dimensions vote on the outcome. Each selectable dimension has a stable ID (`cost`, `latency`, or a score dimension). Omitting the selection compares every eligible dimension; an empty selection compares none, so every row becomes **inconclusive**. Dimensions you leave unselected still show their values and evidence, but they don't affect the verdict.
- **Percentage threshold** — the threshold is now expressed as a percentage. Ranged numeric scores use the configured range; cost, latency, and unranged numeric scores use the baseline magnitude; boolean and categorical scores use the healthy-observation fraction. A move away from a zero baseline counts as one full directional change.

Only gating dimensions vote: a score dimension gates when it is selected and its pinned score config declares a health policy, while cost and latency gate in the lower-is-better direction when selected. A row regresses when any selected dimension exceeds the threshold in the worse direction, and improves only when at least one selected dimension improves and none regress. A row with no gating dimension on either side is **inconclusive**.

## RBAC

Online Evaluations resources have their own OFGA permissions:

| Resource | OFGA Type | Permissions |
|---|---|---|
| Providers | `provider` | GET, LIST, POST, PUT, DELETE |
| Score Configs | `score_config` | GET, LIST, POST, PUT, DELETE |
| Scorers | `scorer` | GET, LIST, POST, PUT, DELETE |
| Eval Jobs | `eval_job` | GET, LIST, POST, PUT, DELETE |

Assign the appropriate roles in **Identity & Access Management > Roles** to control access to evaluation resources.

## API Reference

All endpoints are prefixed with `/api/{org_id}`.

### Providers

| Method | Path | Description |
|---|---|---|
| `GET` | `/providers` | List all providers |
| `POST` | `/providers` | Create a provider |
| `GET` | `/providers/{id}` | Get a provider |
| `PUT` | `/providers/{id}` | Update a provider |
| `DELETE` | `/providers/{id}` | Delete a provider |
| `POST` | `/providers/test` | Test a provider configuration without saving it (optionally pass `providerId` to test a stored provider) |

### Score Configs

| Method | Path | Description |
|---|---|---|
| `GET` | `/score_configs` | List score configs |
| `POST` | `/score_configs` | Create a score config |
| `GET` | `/score_configs/{id}` | Get a score config |
| `PUT` | `/score_configs/{id}` | Update a score config (version bump) |
| `DELETE` | `/score_configs/{id}` | Delete a score config |
| `GET` | `/score_configs/{id}/versions` | List all versions |

### Scorers

| Method | Path | Description |
|---|---|---|
| `GET` | `/scorers?scorer_type=llm_judge` | List scorers (optionally filtered by type) |
| `POST` | `/scorers` | Create a scorer |
| `GET` | `/scorers/{id}` | Get a scorer |
| `PUT` | `/scorers/{id}` | Update a scorer (version bump) |
| `DELETE` | `/scorers/{id}` | Delete a scorer |
| `POST` | `/scorers/{id}/test` | Test a scorer with input variables |
| `GET` | `/scorers/{id}/versions` | List all versions |

### Eval Jobs

| Method | Path | Description |
|---|---|---|
| `GET` | `/eval_jobs?status=active&scope=trace` | List jobs (optionally filtered by status and target scope) |
| `POST` | `/eval_jobs` | Create a job (draft) |
| `GET` | `/eval_jobs/{id}` | Get a job |
| `PUT` | `/eval_jobs/{id}` | Update a job |
| `DELETE` | `/eval_jobs/{id}` | Delete a job and its pipeline |
| `POST` | `/eval_jobs/{id}/activate` | Activate the job |
| `POST` | `/eval_jobs/{id}/pause` | Pause the job |
| `POST` | `/eval_jobs/{id}/resume` | Resume the job |
| `POST` | `/eval_jobs/{id}/archive` | Archive the job |
| `POST` | `/eval_jobs/{id}/manual_eval` | Trigger evaluation for a specific target |

**Create / Update job payload fields** (in addition to fields described above):

| Field | Type | Description |
|---|---|---|
| `targetScope` | `"span"` \| `"trace"` \| `"session"` | The target evaluation granularity. Defaults to `"span"`. |
| `traceConfig` | object | Completion config for trace-scope jobs: `idleWindowSecs`, `maxAgeSecs`, `endSignal` (optional condition). |
| `sessionConfig` | object | Completion config for session-scope jobs: `idleWindowSecs`, `maxAgeSecs`, `endSignal` (optional condition). |
| `spanSelectors` | array | (Trace scope only) Named sub-queries that select spans within a trace for each scorer. |
| `spanSelectorBindings` | object | (Trace scope only) Mapping of scorer IDs to span selector IDs. Required for activation. |
| `samplingValue` | number \| null | A scalar between 0 and 1 for rate mode; `null` for all mode. |

**Manual eval payload fields**:

| Field | Required | Description |
|---|---|---|
| `targetId` | Yes | The ID of the target to evaluate (a trace, span, or session ID, depending on the job's scope). |
| `startTime` / `endTime` | Yes | The source telemetry window, in microseconds. |
| `traceId` / `sessionId` / `spanId` | No | Pin the evaluation to a specific trace, session, or span. |

### Experiments

All endpoints are prefixed with `/api/{org_id}`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/experiments?includeSummary=true&datasetId={id}` | List experiments, optionally filtered by dataset and enriched with a per-row summary (`status`, progress, scores, cost) |
| `POST` | `/experiments` | Create an experiment |
| `GET` | `/experiments/{id}` | Get an experiment, always with its summary, preview, and results page |
| `POST` | `/experiments/{id}/clone` | Clone an experiment |
| `DELETE` | `/experiments/{id}` | Delete an experiment |
| `PUT` | `/experiments/{id}/baseline` | Set this experiment as its dataset's baseline |
| `DELETE` | `/experiments/{id}/baseline` | Clear this experiment's baseline flag |
| `GET` | `/experiments/compare?baselineId={id}&candidateId={id}` | Compare a baseline and candidate experiment |

**Compare query parameters**:

| Parameter | Type | Description |
|---|---|---|
| `baselineId` | string | The baseline experiment ID (required). |
| `candidateId` | string | The candidate experiment ID (required). |
| `threshold` | number | Sensitivity for classifying movement as unchanged (defaults to the comparison policy default). |
| `outcomeDimensions` | string | Comma-separated dimension IDs that vote on each row's outcome. Omit to use all eligible dimensions; pass an empty value to select none. |

**Experiment summary fields** (returned on `includeSummary` and detail):

| Field | Description |
|---|---|
| `status` | Consolidated status: `pending`, `running`, `scoring`, `completed`, `cancelled`, `execution_failed`, or `scoring_failed`. |
| `scoringStatus` | `pending`, `running`, `completed`, or `completed_with_errors`. |
| `executionProgress` | `{ completed, total, skipped }` for the task phase. |
| `scoringProgress` | `{ completed, total, skipped }` for the scoring phase. |
| `scoreSummaries` | Per-scorer aggregate (`value`, sample/error/pending counts). |
| `aggregateSummary` | Run-level facts: `p50LatencyMs`, `totalCost`, `taskCost`, `scoringCost`, `costIncomplete`, incomplete counts. |

## Super Cluster

In multi-node deployments, evaluation resources are synchronized across the super cluster via dedicated queue topics (`eval_provider`, `eval_score_config`, `eval_scorer`, `eval_job`). Changes made on any node propagate automatically.
