---
title: AISIX AI Gateway
metaTitle: Send AISIX AI Gateway traces to OpenObserve
description: Send gateway-native AISIX traces to OpenObserve over OTLP/HTTP and inspect model, token, latency, and request-correlation metadata.
---

# **AISIX AI Gateway → OpenObserve**

[AISIX](https://github.com/api7/aisix) can export traces directly from the gateway to OpenObserve over OTLP/HTTP. This captures gateway requests, logical model calls, and provider attempts without adding an instrumentation library to every calling application.

This guide uses AISIX 1.2.0 and OpenObserve 1.0.0.

## **Prerequisites**

* AISIX 1.2.0 with a working model and API key
* An [OpenObserve](https://openobserve.ai/) account, either Cloud or self-hosted
* Your OpenObserve organization ID and ingestion `Authorization` header
* The hostname that AISIX uses to reach OpenObserve

In OpenObserve, open **Data Sources**, select **Traces**, and copy the OTLP/HTTP endpoint and authorization header for your organization.

## **Configure the AISIX exporter**

Add an observability exporter to your AISIX resources file. Keep the complete OTLP traces path, including `/v1/traces`, in `endpoint`.

```yaml title="resources.yaml"
observability_exporters:
  - name: openobserve-otlp
    kind: otlp_http
    endpoint: https://<openobserve-host>/api/<organization>/v1/traces
    headers:
      Authorization: ${OPENOBSERVE_AUTH_HEADER}
      stream-name: aisix
    sample_rate: 1
    content_mode: metadata_only
```

Set the copied authorization value in the AISIX process environment instead of writing the credential into the resources file:

```shell
export OPENOBSERVE_AUTH_HEADER='Basic <base64-encoded-credentials>'
```

`sample_rate: 1` makes every request eligible for export while you verify the integration. Choose a sampling policy appropriate for your traffic volume after validation.

`metadata_only` excludes prompt, completion, and system-instruction content from exported spans. Trace metadata can still contain identifiers, source addresses, and user-agent values, so restrict access to the destination stream and apply your normal retention policy.

Validate the resources and start or reload AISIX using your normal deployment workflow:

```shell
aisix validate --resources /etc/aisix/resources.yaml
```

## **Send a traced request**

Send a chat-completions request through an existing AISIX model. The optional `traceparent` header connects the gateway spans to an upstream distributed trace.

```shell
curl -i http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer ${GATEWAY_CALLER_KEY}" \
  -H "Content-Type: application/json" \
  -H "traceparent: 00-11111111111111111111111111111111-2222222222222222-01" \
  -d '{
    "model": "your-aisix-model",
    "messages": [
      {"role": "user", "content": "Explain distributed tracing in one sentence."}
    ]
  }'
```

Record the `x-aisix-request-id` response header. It provides a direct correlation value when searching the exported spans.

## **What gets captured**

A successful chat-completions request can produce a gateway `SERVER` span, a logical model-call `CLIENT` span, and one or more provider-attempt `CLIENT` spans. Retries or fallback routing can therefore appear as additional attempts under the same logical call.

| Attribute | Description |
| --- | --- |
| `aisix_request_id` | AISIX request correlation ID |
| `aisix_operation` | Gateway operation, such as `chat.completions` |
| `aisix_model_id` | AISIX model alias selected by the caller |
| `aisix_attempt_index` | Attempt number within a logical model call |
| `aisix_attempt_kind` | Attempt classification, such as `initial`, `retry`, or `fallback` |
| `gen_ai_request_model` | Requested model alias on model-call spans |
| `gen_ai_response_model` | Model reported by the upstream response |
| `gen_ai_provider_name` | Provider associated with the model attempt |
| `gen_ai_usage_input_tokens` | Input-token count when returned by the provider |
| `gen_ai_usage_output_tokens` | Output-token count when returned by the provider |
| `http_response_status_code` | HTTP status associated with the request or attempt |

Attribute availability depends on the request type and the metadata returned by the upstream provider.

## **View the trace in OpenObserve**

1. In OpenObserve, go to **Traces**.
2. Select the `aisix` stream.
3. Filter on `aisix_request_id` using the value from the response header.
4. Open the trace to inspect the gateway, logical-call, and provider-attempt spans.

If the caller supplied a valid W3C `traceparent` header, the AISIX gateway span appears as a child of that remote parent and preserves the incoming trace ID.

For the versioned setup used to validate this guide, OpenObserve displayed one `chat.completions` trace from `aisix-dp` with three connected spans and zero errors.

## **Troubleshooting**

### **OpenObserve returns 401**

Copy the complete `Authorization` header from the OpenObserve trace-ingestion page and confirm that the variable is available to the AISIX process. Do not commit the value to source control.

### **The `aisix` stream does not appear**

Confirm that the endpoint contains your organization and the complete `/v1/traces` suffix. Also verify the `stream-name: aisix` header and send at least one request through AISIX after the exporter is loaded.

### **No spans appear for a request**

Check the AISIX exporter logs, the configured sampling rate, network access from AISIX to OpenObserve, and the selected time range in the Traces view.

## **Read More**

- [AISIX observability exporters](https://docs.api7.ai/ai-gateway/observability/exporters)
- [AISIX source repository](https://github.com/api7/aisix)
- [Exploring traces in OpenObserve](../../../user-guide/data-exploration/traces/index.md)
- [OpenTelemetry ingestion in OpenObserve](../../../ingestion/traces/opentelemetry.md)
