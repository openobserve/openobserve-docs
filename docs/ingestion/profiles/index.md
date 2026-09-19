---
title: Index
metaTitle: Continuous Profiling Ingestion | OpenObserve
description: "Send CPU, memory, and lock profiles to OpenObserve over OTLP Profiles from Java async-profiler, Go pprof, and the OpenTelemetry eBPF profiler."
---

# Continuous Profiling

OpenObserve accepts [OpenTelemetry Profiles](https://opentelemetry.io/docs/concepts/signals/profiles/) over OTLP as a fourth telemetry signal, alongside logs, metrics, and traces. Use it to see which functions consume CPU, allocate memory, or wait on locks — information that traces and metrics do not include.

## Choose an integration

| Language | Path |
|---|---|
| **Java** | [async-profiler](./java.md) |
| **Go** | [pprof](./go.md), [eBPF profiler](./ebpf.md) |
| **Rust** | [pprof](./rust.md), [eBPF profiler](./ebpf.md) |
| **Any OTLP source** | [OTLP / Collector](./otlp.md) |

## In this section

::child-pages

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
