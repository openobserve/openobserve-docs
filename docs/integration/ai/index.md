---
title: AI & LLM Observability Integrations - Frameworks, Providers, Gateways | OpenObserve
description: Comprehensive AI and LLM observability integrations for tracing AI frameworks (LangChain, CrewAI, LlamaIndex), LLM providers (OpenAI, Anthropic, Gemini), AI gateways (Portkey, LiteLLM), no-code tools (n8n, Flowise), and AI developer tools with OpenObserve.
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
- [Claude Code Tracing](claude-code-tracing.md): Trace Claude Code CLI sessions with OpenObserve
