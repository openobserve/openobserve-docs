---
title: Java
metaTitle: Java Profiling with async-profiler | OpenObserve
description: Send Java CPU, allocation, and lock profiles from async-profiler to OpenObserve as OTLP Profiles.
---

# Java Profiling with async-profiler

[async-profiler](https://github.com/async-profiler/async-profiler) **4.5** attaches to a JVM and can export [OTLP Profiles](https://opentelemetry.io/docs/concepts/signals/profiles/) (`-o otlp`).

:::note[Experimental OTLP output]
Use async-profiler 4.5 with Collector 0.153.0 for the examples below. Version 4.2 emits an older, incompatible OTLP Profiles schema. The format is experimental; re-test both components when upgrading.
:::

## Send profiles

Run a Collector with the [OTLP Profiles](./otlp.md) configuration. async-profiler writes `-o otlp` to a **local protobuf file**; `-f http://...` does not POST it and fails with `Could not open output file`.

Capture a 60-second CPU profile, then upload it to the Collector:

```bash
PID=8983
asprof -d 60 -e cpu --total -o otlp -f profile.pb "$PID"
curl --fail-with-body \
  -H 'Content-Type: application/x-protobuf' \
  --data-binary @profile.pb \
  http://127.0.0.1:4318/v1development/profiles
```

Replace `8983` with the JVM PID. The Collector adds `service.name` and OpenObserve authorization; the local Collector endpoint above has no authentication. `--total` exports the event's total value, such as time or allocated bytes, instead of sample counts.

For continuous collection, finish each file before uploading it:

```bash
while kill -0 "$PID" 2>/dev/null; do
  asprof -d 60 -e cpu --total -o otlp -f profile.pb "$PID" || break
  curl --fail-with-body \
    -H 'Content-Type: application/x-protobuf' \
    --data-binary @profile.pb \
    http://127.0.0.1:4318/v1development/profiles || break
done
```

### Capture from JVM startup

`-agentpath:lib=options` is one argument. Use `libasyncProfiler.so` on Linux or `libasyncProfiler.dylib` on macOS:

```bash
java -agentpath:/path/to/libasyncProfiler.so=start,event=cpu,total,otlp,file=profile.pb \
  -jar app.jar
```

The file is written when profiling stops or the JVM exits. To upload while the JVM is running, stop and dump with `asprof stop -o otlp --total -f profile.pb "$PID"`, then run the `curl` command above. This captures one window; use the collection loop for repeated uploads.

## Events

| Goal | Flags |
|---|---|
| CPU | `-e cpu` (default) |
| Allocations | `-e alloc` |
| Lock contention | `-e lock` |

See [async-profiler profiling modes](https://github.com/async-profiler/async-profiler/blob/master/docs/ProfilingModes.md) for wall-clock, native memory, and other events (`asprof list`).

:::warning[Do not use `--all` in production]
`--all` turns on CPU, wall, allocation, lock, and native-memory profiling at the same time. Overhead is high. For continuous profiling, pick **one** event from the table above.
:::

## Verify in OpenObserve

Open **Profiles**, select the destination stream and service, choose a profile type and unit, and use a time range covering the capture. Event labels are supplied by the profiler; on macOS, `cpu` sampling can appear as `wall`. Check the Collector logs for export errors even when its receiver returns HTTP 200.

![Java profiles flame graph in OpenObserve](./images/async-profiler-profiles.png)

## Next steps

- [OTLP Profiles](./otlp.md): Collector exporter, `Authorization: Basic`, and `service.name`.
- [async-profiler profiling modes](https://github.com/async-profiler/async-profiler/blob/master/docs/ProfilingModes.md)

**Need some help?**

- Join our [Community Slack](https://short.openobserve.ai/community)
- Or [Contact support](https://openobserve.ai/contactus/)
