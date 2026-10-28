---
title: AI
metaTitle: "AI & LLM Observability - Frameworks, Providers, Gateways"
description: "AI and LLM observability with OpenObserve: trace AI frameworks, LLM providers, AI gateways, no-code tools, and AI developer tools via OpenTelemetry."
---

# AI & LLM Observability Integrations

OpenObserve provides comprehensive observability for AI and LLM applications, collecting traces, metrics, and logs from AI frameworks, LLM providers, gateways, no-code tools, and AI developer utilities. Monitor token usage, latency, agent runs, and model behavior across your entire AI stack.

These integrations use OpenTelemetry to send traces and metrics to OpenObserve, giving you a unified view of your AI application performance, cost, and reliability.

You can browse these integrations directly in OpenObserve under **Ingestion → AI Integrations**, which provides the connection snippet (endpoint, organization, and auth token) and links to each integration's guide.

## AI Integration Categories

- [Frameworks](frameworks/index.md): Instrument AI orchestration and agent frameworks (LangChain, CrewAI, LlamaIndex, AutoGen, and more)
- [Providers](providers/index.md): Trace LLM provider calls (OpenAI, Anthropic, Google Gemini, Mistral, Ollama, and more)
- [Gateways](gateways/index.md): Monitor AI gateway traffic (Portkey, LiteLLM Proxy, OpenRouter, Kong AI Gateway, and more)
- [No-Code Tools](no-code/index.md): Observe no-code and low-code AI platforms (n8n, Flowise, LangFlow, OpenWebUI, and more)
- [Tools](tools/index.md): Integrate AI developer tools and utilities (Promptfoo, Milvus, Firecrawl, PostHog, and more)
- [Model Context Protocol (MCP)](mcp/index.md): Connect AI agents and IDEs to OpenObserve for natural-language observability queries

## Additional Guides

- [LLM Applications](llm-applications.md): General guide for instrumenting LLM-powered applications
- [LLM Monitoring](llm-monitoring.md): Track cost, tokens, latency, and errors, and replay agent sessions turn by turn
- [LLM Evaluations](llm-evaluations.md): Score live traces with LLM-as-a-judge or remote scorers
- [LLM Annotations and Datasets](llm-annotations-and-datasets.md): Review traces in queues and build golden datasets
- [LLM Prompts](llm-prompts.md): Version prompts and release them with labels
- [LLM Playground](llm-playground.md): Try prompts, models, and scorers side by side
- [LLM Experiments](llm-experiments.md): Run offline evaluations on datasets and compare runs
- [Model Pricing](model-pricing.md): Define how token costs are calculated on LLM spans
- [Claude Code](claude-code-tracing.md): Monitor Claude Code with native OpenTelemetry metrics and events, plus optional per-turn tracing
