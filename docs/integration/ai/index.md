---
title: AI
metaTitle: "AI & LLM Observability - Frameworks, Providers, Gateways"
description: "AI and LLM observability with OpenObserve: trace AI frameworks, LLM providers, AI gateways, no-code tools, and AI developer tools via OpenTelemetry."
---

# AI & LLM Observability Integrations

OpenObserve collects traces, metrics, and logs from your AI and LLM apps. Sources include AI frameworks, LLM providers, gateways, no-code tools, and AI developer tools. You can track token usage, latency, agent runs, and model behavior across your whole AI stack.

These integrations use OpenTelemetry to send traces and metrics to OpenObserve. You get one view of your AI app's speed, cost, and reliability.

You can also browse these integrations in OpenObserve under **Data** > **Data sources** > **AI Integrations**. That page gives you the connection snippet (endpoint, organization, and auth token). It also links to each integration's guide.

## AI Integration Categories

- [Frameworks](frameworks/index.md): Trace AI and agent frameworks, such as LangChain, CrewAI, LlamaIndex, AutoGen, and more.
- [Providers](providers/index.md): Trace calls to LLM providers, such as OpenAI, Anthropic, Google Gemini, Mistral, Ollama, and more.
- [Gateways](gateways/index.md): Monitor AI gateway traffic from Portkey, LiteLLM Proxy, OpenRouter, Kong AI Gateway, and more.
- [No-Code Tools](no-code/index.md): Observe no-code and low-code AI platforms, such as n8n, Flowise, LangFlow, OpenWebUI, and more.
- [Tools](tools/index.md): Connect AI developer tools, such as Promptfoo, Milvus, Firecrawl, PostHog, and more.
- [Model Context Protocol (MCP)](mcp/index.md): Connect AI agents and IDEs to OpenObserve. Then ask questions about your data in plain language.

## Additional Guides

- [LLM Applications](llm-applications.md): Learn how to instrument any LLM-powered app.
- [LLM Monitoring](llm-monitoring.md): Track cost, tokens, latency, and errors. Replay agent sessions turn by turn.
- [LLM Evaluations](llm-evaluations.md): Score live traces with LLM-as-a-judge or remote scorers.
- [LLM Annotations and Datasets](llm-annotations-and-datasets.md): Review traces in queues and build golden datasets.
- [LLM Prompts](llm-prompts.md): Version prompts and release them with labels.
- [LLM Playground](llm-playground.md): Try prompts, models, and scorers side by side.
- [LLM Experiments](llm-experiments.md): Run offline evaluations on datasets and compare runs.
- [Model Pricing](model-pricing.md): Define how token costs are worked out on LLM spans.
- [Claude Code](claude-code-tracing.md): Monitor Claude Code with native OpenTelemetry metrics and events. You can also add per-turn tracing.
- [GitHub Copilot](github-copilot-tracing.md): Send Copilot CLI and Copilot Chat traces, metrics, and events to OpenObserve.
