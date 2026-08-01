---
title: Gateways
metaTitle: AI Gateway Observability - Portkey, LiteLLM Proxy, OpenRouter, Kong
description: "Monitor AI gateway traffic with OpenObserve. Trace Portkey, LiteLLM Proxy, OpenRouter, Kong, and Vercel AI Gateway for token usage, latency, and routing."
---

# AI Gateway Observability Integrations

OpenObserve integrates with AI gateway and proxy layers to provide observability across all LLM traffic routed through them. Capture token usage, per-model latency, routing decisions, error rates, and cost metadata for every request passing through your AI gateway.

These integrations instrument the gateway's OpenAI-compatible API endpoints using OpenTelemetry, so you get traces regardless of which underlying model the gateway routes to.

## Gateway Integration Guides

- [Anannas](anannas.md)
- [Kong AI Gateway](kong-gateway.md)
- [LiteLLM Proxy](litellm-proxy.md)
- [OpenRouter](openrouter.md)
- [Portkey](portkey.md)
- [Vercel AI Gateway](vercel-ai-gateway.md)
