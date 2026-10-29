---
title: Promptfoo
description: Turn on Promptfoo's built-in OpenTelemetry tracing and send eval test case, provider, and grader spans to OpenObserve over OTLP.
---

# **Promptfoo → OpenObserve**

Capture a trace for every Promptfoo test case, with the model call, token usage, and pass/fail result. Promptfoo is an open-source CLI for evaluating and red-teaming LLM prompts and apps. It has built-in OpenTelemetry tracing: turn it on in `promptfooconfig.yaml` and point its OTLP exporter at OpenObserve.

## **Prerequisites**

* Node.js 22.22+
* An [OpenObserve](https://openobserve.ai/) account (cloud or self-hosted)
* Your OpenObserve **organisation ID** and **Base64-encoded auth token**
* An OpenAI API key

## **Installation**

Run Promptfoo with `npx`, or install it globally:

```shell
npm install -g promptfoo
```

## **Configuration**

Set these environment variables in the shell that runs the eval:

```shell
export OPENAI_API_KEY=your-openai-api-key
export PROMPTFOO_OTEL_ENDPOINT=https://api.openobserve.ai/api/your_org_id/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic%20<your_base64_token>"
export PROMPTFOO_OTEL_SERVICE_NAME=promptfoo
```

| Variable | Description |
| ----- | ----- |
| `PROMPTFOO_OTEL_ENDPOINT` | Full OTLP/HTTP traces URL, including `/v1/traces`. `OTEL_EXPORTER_OTLP_ENDPOINT` is used when this is not set. |
| `OTEL_EXPORTER_OTLP_HEADERS` | Headers for the exporter. Encode the space after `Basic` as `%20`. |
| `PROMPTFOO_OTEL_SERVICE_NAME` | `service_name` on the spans. Default `promptfoo`. |

## **Instrumentation**

Add `tracing.enabled: true` to `promptfooconfig.yaml`. No code changes are needed: Promptfoo creates the spans for its built-in providers, including OpenAI, Anthropic, Azure OpenAI, AWS Bedrock, Google Vertex AI, Ollama, and the HTTP provider.

```yaml
description: Tracing demo

tracing:
  enabled: true

prompts:
  - 'Answer in one sentence: {{question}}'

providers:
  - openai:gpt-4o-mini

tests:
  - vars:
      question: What is distributed tracing?
    assert:
      - type: icontains
        value: trace
  - vars:
      question: What is an OpenTelemetry span?
    assert:
      - type: icontains
        value: span
      - type: llm-rubric
        value: Explains that a span is one unit of work in a trace
```

Run the eval:

```shell
npx promptfoo@latest eval
```

Promptfoo also keeps the traces in its local database, so they still show in its own web viewer. Set `PROMPTFOO_OTEL_LOCAL_EXPORT=false` to send them only to OpenObserve.

## **What Gets Captured**

Each test case produces one trace. OpenObserve stores the dotted attribute names with underscores.

```
promptfoo.test_case
├── openai:gpt-4o-mini              (target provider call)
│   └── chat gpt-4o-mini
├── grader icontains                (one per assertion)
└── grader llm-rubric
    └── grader provider <grader>    (model-graded assertions only)
```

**`promptfoo.test_case` span (root)**

| Attribute | Description |
| ----- | ----- |
| `promptfoo_test_success` | `true` if every assertion passed |
| `promptfoo_test_score` | Test case score |
| `promptfoo_eval_id` | Eval run ID |
| `promptfoo_test_index` | Test case index in the eval |
| `promptfoo_provider_id` | Provider under test |

**`chat <model>` span (model call)**

| Attribute | Description |
| ----- | ----- |
| `gen_ai_provider_name` | Provider (e.g. `openai`) |
| `gen_ai_operation_name` | Operation (e.g. `chat`) |
| `gen_ai_request_model` | Model requested |
| `gen_ai_response_model` | Model that served the response |
| `gen_ai_usage_input_tokens` | Input tokens |
| `gen_ai_usage_output_tokens` | Output tokens |
| `gen_ai_response_finish_reasons` | Finish reasons |
| `promptfoo_provider_id` | Promptfoo provider ID (e.g. `openai:gpt-4o-mini`) |

**`grader <assertion>` span**

| Attribute | Description |
| ----- | ----- |
| `gen_ai_evaluation_name` | Assertion type (e.g. `icontains`, `llm-rubric`) |
| `gen_ai_evaluation_score_label` | `pass` or `fail` |
| `gen_ai_evaluation_score_value` | Grader score |
| `gen_ai_evaluation_explanation` | Grader reason |

The target provider span (`openai:gpt-4o-mini`) carries `promptfoo_cache_hit`. Cached responses do not call the model, so run with `--no-cache` to trace every call.

## **Viewing Traces**

1. Log in to OpenObserve and navigate to **Traces**
2. Filter by `service_name = promptfoo` to isolate eval traces
3. Filter by `operation_name = promptfoo.test_case` to list test cases
4. Filter by `promptfoo_test_success = false` to find failing cases
5. Open a trace to see the model call and grader spans under the test case

## **Next Steps**

With Promptfoo traces in OpenObserve, you can track pass rates and token usage across eval runs, alert when `promptfoo_test_success` drops, and compare models by latency.

## **Read More**

- [LLM Observability Overview](../llm-applications.md)
- [Traces Ingestion with Python](../../../ingestion/traces/python.md)
- [Exploring Traces in OpenObserve](../../../user-guide/data-exploration/traces/index.md)
- [Alerts](../../../user-guide/analytics/alerts/index.md)
