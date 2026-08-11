---
title: Performance Monitoring
metaTitle: Mobile Performance Monitoring
description: Mobile RUM measures app start time, screen load and render timing, mobile vitals, and network performance as experienced on real devices.
---

# Mobile RUM Performance Monitoring

Performance is what your users actually feel: how long the app takes to open, how quickly a screen becomes usable, whether scrolling is smooth, and whether a tap does something before they give up. [OpenObserve](https://openobserve.ai) Real User Monitoring measures all of this on real devices in the field — not in a lab — and ties each slow moment back to the network call or backend trace that caused it. This guide explains every performance metric the mobile SDKs collect, how to read it in the OpenObserve RUM dashboard, what healthy versus unhealthy looks like, and how to enable or tune each capability on React Native, Android, and iOS.

If you are just getting set up, start with the [Mobile RUM Overview](./index.md) and your platform guide ([React Native](./react-native.md), [Android](./android.md), [iOS](./ios.md)). This page assumes the SDK is already initialized and RUM is enabled.

!!! note "Versions (Beta)"

    The mobile SDKs are at React Native `0.1.1`, Android `0.1.0`, and iOS `0.1.0`. The performance metrics described here are collected today; pin your exact SDK version and re-test on upgrades, since defaults and option names may still change across early `0.1.x` releases.

## What performance data you get

Once RUM is running, OpenObserve automatically captures, per session and per view:

- **App start time** — cold, warm, and hot launches.
- **Screen (view) load and render timing** — how long each screen takes to appear and settle.
- **Mobile vitals** — slow frames, frozen frames, app hangs (iOS), ANRs (Android), long tasks, and memory warnings.
- **Network / resource performance** — request timing, status codes, and payload size for every tracked call.
- **Distributed tracing** — a link from a slow resource on a screen to the backend trace that served it.
- **Frustration signals** — rage taps and other patterns that reveal an unresponsive UI.

Every one of these is attached to the view and session where it happened, so a "slow checkout" is never an abstract number — it is a specific screen, in a specific session, for a specific user, with the exact resource and trace that made it slow.

## App start time

App start time is the first impression. There are three flavors, and the SDK distinguishes them:

- **Cold start** — the process was not running. The OS creates it from scratch, loads your code, and renders the first frame. This is the slowest and the one to optimize first.
- **Warm start** — the process exists but the app was recreated (for example, after being evicted from memory). Faster than cold, slower than hot.
- **Hot start** — the app was already in memory and simply returns to the foreground. This should be nearly instant.

**How to read it.** In the OpenObserve RUM dashboard, app start appears as a duration on the application/launch view. Look at the distribution (p50, p75, p95), not just the average — a good median with a bad p95 means a slice of your users, often on older or lower-memory devices, are having a much worse experience. Break it down by app version to catch a regression the moment a release ships.

**Healthy vs unhealthy.** As a rule of thumb, a cold start under ~1.5s feels fast, 1.5–3s is acceptable, and beyond ~3–5s users start abandoning. Warm and hot starts should be comfortably under a second. The most important signal is the trend: a sudden jump at a release boundary almost always means something new is doing work on the main thread at launch.

App start is captured automatically by the native layer once RUM is enabled — there is no per-platform flag to turn it on. On React Native, native view tracking (`nativeViewTracking`) surfaces the native launch view alongside your JS screens.

## Screen (view) load and render timing

A RUM **view** represents one screen. For each view, OpenObserve records how long the user spent on it, when it became active, and the performance events (slow frames, long tasks, errors, resources) that occurred while it was on screen. This is how you answer "which screen is slow, and why."

**How to read it.** Open the **Views** table in OpenObserve RUM and sort by loading time or by frozen-frame / slow-frame rate. A screen with a long time-to-usable, a high slow-frame rate, and several resources is usually doing too much synchronous work on appear. Pivot into an individual view to see its waterfall of resources and its vitals.

**Healthy vs unhealthy.** A screen that becomes interactive in a few hundred milliseconds is healthy. If a view routinely takes seconds to settle, or shows frozen frames on load, it is doing blocking work (large list rendering, synchronous I/O, image decoding) that should move off the main thread or be deferred.

Views are captured automatically when you enable view tracking, and you can also mark them manually for precise control.

### React Native

```tsx
// Automatic (recommended) — via @openobserve/mobile-react-navigation
OoRumReactNavigationTracking.startTrackingViews(navigationRef);

// Manual — name and time a screen yourself
import { OoRum } from '@openobserve/mobile-react-native';

await OoRum.startView('checkout', 'Checkout');
// ...screen is visible...
await OoRum.stopView('checkout');

// Add a custom timing marker within the current view
await OoRum.addTiming('content_ready');
```

### Android

```kotlin
// Automatic — pick a view-tracking strategy in RumConfiguration
val rumConfig = RumConfiguration.Builder(applicationId)
    .useViewTrackingStrategy(ActivityViewTrackingStrategy(true))
    .build()

// Manual — via the RUM monitor
val monitor = GlobalRumMonitor.get()
monitor.startView(key = this, name = "Checkout")
// ...screen is visible...
monitor.stopView(key = this)
monitor.addTiming("content_ready")
```

### iOS

```swift
// Automatic — supply predicates in RUM.Configuration
RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        uiKitViewsPredicate: DefaultUIKitRUMViewsPredicate()
    )
)

// Manual — via the RUM monitor
let monitor = RUMMonitor.shared()
monitor.startView(key: "checkout", name: "Checkout")
// ...screen is visible...
monitor.stopView(key: "checkout")
monitor.addTiming(name: "content_ready")
```

## Mobile vitals

Mobile vitals are the health metrics of your UI thread and rendering pipeline. They are the fastest way to find jank and unresponsiveness that no crash report would ever surface.

### Slow frames and frozen frames

The display refreshes on a fixed budget (about 16.7ms per frame at 60Hz). When a frame takes longer than that budget, it is a **slow frame** — the user perceives stutter. When the UI produces no frame for a long stretch (typically over ~700ms), it is a **frozen frame** — the screen looks completely stuck.

**How to read it.** OpenObserve reports slow and frozen frames per view. A useful lens is the rate: slow-frames-per-second while scrolling, and the count of frozen frames per view. A screen with a high slow-frame rate is janky; a screen with any frozen frames has something blocking the main thread.

**Healthy vs unhealthy.** A smooth screen has a near-zero frozen-frame count and only occasional slow frames during heavy animation. Frozen frames on a static screen, or a slow-frame rate that climbs as a list grows, both indicate main-thread work that needs profiling.

### App hangs (iOS) and ANRs (Android)

An **app hang** (iOS) or **ANR / Application Not Responding** (Android) is the severe end of the same problem: the main thread is blocked long enough that the app is effectively frozen. Android's system threshold for a fatal ANR is around 5 seconds of blocked input dispatch; iOS considers the app hung once the main thread is unresponsive past a threshold you configure. The SDKs can report these as non-fatal events so you see them *before* they escalate into a system kill or a bad review.

**How to read it.** Each hang/ANR is recorded against the view where it happened, with the duration it was blocked. Group by screen to find the worst offenders. A single 6-second ANR on a rarely used screen matters less than a steady stream of 1–2 second hangs on your home screen.

**Healthy vs unhealthy.** Healthy is zero. Any app hang or ANR is worth investigating — the question is only priority, driven by how often it happens and how central the screen is.

### Long tasks and memory warnings

A **long task** is any single unit of work that occupies the main thread longer than a threshold you set (for example, a heavy JSON parse or an expensive layout pass). Long tasks are the root cause behind most slow and frozen frames, so lowering the threshold surfaces the offenders earlier.

A **memory warning** is the OS telling your app that memory is scarce. Frequent memory warnings precede out-of-memory terminations (which look like crashes with no stack trace), so they are an early warning for a memory leak or oversized caches.

**How to read it.** Long tasks appear as their own events on a view, with a duration and (where available) a source. Memory warnings appear as vitals events; a cluster of them in a session that ends abruptly is a strong signal of an OOM termination.

**Healthy vs unhealthy.** Occasional long tasks under your threshold are normal; a screen that emits many long tasks, or long tasks over ~1s, needs work moved off the main thread. Memory warnings should be rare — a rising trend across a release points to a leak.

### Enabling and tuning vitals

You control how aggressively long tasks are detected, whether ANRs/hangs and memory warnings are tracked, and how often vitals are sampled. Sampling cadence is set with the vitals update frequency (frequent / average / rare / never).

#### React Native

```tsx
const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',
  'production',
  TrackingConsent.GRANTED,
  {
    rumConfiguration: {
      applicationId: 'YOUR_APPLICATION_ID',
      customEndpoint: 'https://your-openobserve-instance:5080',
      // Report JS long tasks longer than 100ms (0 disables JS long tasks):
      longTaskThresholdMs: 100,
      // Native long-task / ANR threshold (default 200ms):
      nativeLongTaskThresholdMs: 200,
      // Detect rage taps and other frustration signals:
      trackFrustrations: true,
      // iOS memory warnings:
      trackMemoryWarnings: true,
      // Android non-fatal ANRs:
      trackNonFatalAnrs: true,
      // Sampling cadence for mobile vitals:
      vitalsUpdateFrequency: VitalsUpdateFrequency.AVERAGE,
    },
  },
);
```

#### Android

```kotlin
val rumConfig = RumConfiguration.Builder(applicationId)
    .useCustomEndpoint("https://your-openobserve-instance:5080")
    // Report long tasks longer than 250ms (default 100ms):
    .trackLongTasks(250L)
    // Report non-fatal ANRs so you see them before they turn fatal:
    .trackNonFatalAnrs(true)
    // Sampling cadence for mobile vitals:
    .setVitalsUpdateFrequency(VitalsUpdateFrequency.AVERAGE)
    .build()
Rum.enable(rumConfig)
```

#### iOS

```swift
RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        // Report long tasks longer than 100ms (default 0.1s):
        longTaskThreshold: 0.1,
        // Report an app hang once the main thread is blocked this long:
        appHangThreshold: 0.25,
        // Track memory warnings and slow frames (both on by default):
        trackMemoryWarnings: true,
        trackSlowFrames: true,
        // Detect rage taps and other frustration signals:
        trackFrustrations: true,
        // Sampling cadence for mobile vitals:
        vitalsUpdateFrequency: .average,
        customEndpoint: URL(string: "https://your-openobserve-instance:5080")
    )
)
```

!!! note

    Setting `appHangThreshold` on iOS is what turns app-hang reporting on — it defaults to off. Choose a value that catches real hangs without flagging brief, expected pauses (0.25s is a reasonable starting point).

## Network and resource performance

Every tracked network call is recorded as a RUM **resource** with its full timing breakdown, HTTP status, and payload size. Because resources are attached to the view that issued them, you can see exactly which requests made a screen slow.

**What each field means.**

- **Timing** — how long the request took end to end, and where the time went (waiting, downloading). A slow resource on a screen's critical path directly slows the screen.
- **Status** — the HTTP status code. A spike in 4xx or 5xx on a view usually correlates with errors and frustration on that screen.
- **Size** — the response payload size. Large payloads slow low-bandwidth users the most and are a common, fixable cause of slow screens.

**How to read it.** In OpenObserve, open a slow view and sort its resources by duration. The slowest resource on the critical path is your first suspect. Cross-reference status codes (are the slow ones also failing?) and size (is it slow because it is huge?).

**Healthy vs unhealthy.** Healthy API calls on a mobile network typically complete in tens to a few hundred milliseconds; anything over ~1s on the critical path is worth attention. A rising p95 duration or a growing share of non-2xx status codes on a view is an early warning that a backend or endpoint is degrading.

Automatic network capture is enabled per platform: React Native proxies `fetch`/XHR, Android instruments OkHttp, and iOS instruments URLSession. You can also record resources manually for non-HTTP transports (see your platform guide).

## Distributed tracing: from a slow screen to the backend

Resource timing tells you a request was slow. **Distributed tracing** tells you *where* the time went — on the device, on the network, or inside your backend. When you declare your backend domains as **first-party hosts**, the SDK injects **W3C `tracecontext`** headers into requests to those hosts. If your backend is instrumented with OpenObserve (or any OpenTelemetry-compatible tracing), it continues the same trace, so the mobile resource and the server spans share one trace id.

**How to read it.** In OpenObserve, open the slow resource on a view and follow the link to its distributed trace. You will see the full waterfall: the client-side request, then the backend spans for the services and database calls it triggered. If the backend spans are fast but the resource is slow, the time is network or client side; if a backend span dominates, you have found your bottleneck.

`tracecontext` is the propagator OpenObserve reads. The SDKs also support `b3` / `b3multi` for interop with other systems, but for OpenObserve use `tracecontext`.

### React Native

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  customEndpoint: 'https://your-openobserve-instance:5080',
  trackResources: true,
  // Inject W3C tracecontext headers for these hosts:
  firstPartyHosts: [
    { match: 'api.example.com', propagatorTypes: ['tracecontext'] },
  ],
  // Percentage of resources to trace end-to-end:
  resourceTraceSampleRate: 100,
}
```

### Android

```kotlin
// 1) Declare first-party hosts on the core Configuration:
val config = Configuration.Builder(
        clientToken = BuildConfig.OPENOBSERVE_CLIENT_TOKEN,
        env = "production",
        service = "com.example.app",
    )
    .setFirstPartyHosts(listOf("api.example.com"))
    .build()

// 2) Instrument OkHttp so requests carry the trace context:
val client = OkHttpClient.Builder()
    .configureOpenObserveInstrumentation(
        rumInstrumentationConfiguration = RumNetworkInstrumentationConfiguration(),
        apmInstrumentationConfiguration = ApmNetworkInstrumentationConfiguration(
            tracedHosts = listOf("api.example.com"),
        ),
    )
    .build()
```

### iOS

```swift
RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        urlSessionTracking: RUM.Configuration.URLSessionTracking(
            firstPartyHostsTracing: .trace(
                hosts: ["api.example.com"],
                sampleRate: 100
            )
        ),
        customEndpoint: URL(string: "https://your-openobserve-instance:5080")
    )
)
```

!!! note

    The `tracecontext` header type (W3C) is what OpenObserve reads to stitch the mobile resource to the backend trace. A request only gets trace headers if its host is in your first-party list — otherwise the SDK still records timing, status, and size, just without the end-to-end link.

## Frustration signals

Performance numbers describe the app; frustration signals describe the *user*. The SDK automatically detects patterns that mean someone is struggling — most importantly **rage taps**, where a user taps the same element repeatedly because nothing responds. These are captured as RUM actions flagged as frustrated.

**How to read it.** In OpenObserve, filter actions by the frustrated flag, or look at a view's frustration count. A button with a high rage-tap count is either broken, disabled without feedback, or sitting behind a frozen frame — cross-reference with slow/frozen frames on the same view to confirm.

**Healthy vs unhealthy.** Frustration signals should be rare and scattered. A concentration of rage taps on one element is a direct, high-signal bug report from your real users — often more actionable than the underlying vital, because it points at the exact control that let them down.

Frustration tracking is on by default on all three platforms (`trackFrustrations` / `trackFrustrations(true)`). Because rage taps are detected from actions, make sure action/interaction tracking is enabled (`trackInteractions` on React Native, `trackUserInteractions()` on Android, an actions predicate on iOS) so there are taps to analyze.

## Vitals update frequency

`vitalsUpdateFrequency` controls how often the SDK samples continuous vitals like frame rendering and memory. It trades resolution for overhead:

| Value | Meaning |
|-------|---------|
| `FREQUENT` | Highest resolution, most overhead — use when actively debugging performance. |
| `AVERAGE` | Balanced default for production. |
| `RARE` | Lower resolution, least overhead — use when cost or battery is the priority. |
| `NEVER` | Disable continuous vitals sampling entirely. |

Discrete events (long tasks, ANRs/hangs, memory warnings, frustration signals) are captured as they occur regardless of this cadence — the frequency setting governs the sampled, continuous vitals. Set it once at initialization:

- **React Native** — `vitalsUpdateFrequency: VitalsUpdateFrequency.AVERAGE` in `rumConfiguration`.
- **Android** — `.setVitalsUpdateFrequency(VitalsUpdateFrequency.AVERAGE)` on `RumConfiguration.Builder`.
- **iOS** — `vitalsUpdateFrequency: .average` in `RUM.Configuration`.

For most apps `AVERAGE` is the right choice. Drop to `RARE` (or `NEVER`) only if you have measured overhead you need to shed, and pair it with a lower `sessionSampleRate` — see [Best Practices](./best-practices.md) for production tuning.

## Putting it together: diagnosing a slow screen

A typical investigation in OpenObserve RUM flows top-down:

1. **Start at the view.** Sort the Views table by loading time or frozen-frame rate and open the worst screen.
2. **Read its vitals.** Are there frozen frames, long tasks, or an app hang / ANR? That points to blocking main-thread work.
3. **Check its resources.** Sort resources by duration; a slow one on the critical path is often the cause.
4. **Follow the trace.** Open the slow resource's distributed trace to see whether the time was in the network, the client, or a specific backend span.
5. **Confirm user impact.** Look at frustration signals on the same view — rage taps confirm real users felt it.

Because every layer shares the same session and trace ids, you move from "this screen is slow" to "this backend query on this endpoint is the reason" without leaving OpenObserve.

## What's next

- [Mobile RUM Overview](./index.md) — the core concepts (sessions, views, actions, resources, vitals).
- [React Native](./react-native.md), [Android](./android.md), [iOS](./ios.md) — full setup and instrumentation per platform.
- [Error & Crash Tracking](./error-tracking.md) — turn crashes and errors into readable, grouped issues.
- [Best Practices](./best-practices.md) — sampling, cost control, and release health.
- [OpenObserve RUM docs](../index.md) — the dashboards these metrics land in.

## Frequently asked questions

### What is a good app start time to aim for on mobile?

Cold start is the strictest budget because the process starts from nothing. A cold start under about 1.5 seconds feels fast, 1.5 to 3 seconds is acceptable, and anything past 3 to 5 seconds is where users notice and abandon. Warm and hot starts should be well under a second since the process is already alive. Watch the trend across releases in OpenObserve rather than a single number, because a regression after a release is usually the real signal.

### What is the difference between a slow frame and a frozen frame?

A slow frame is a UI frame that took longer to render than the display's frame budget, so the animation stutters or drops frames but the app keeps moving. A frozen frame is far more severe: the UI produced no frame for a long stretch, typically over 700 milliseconds, so the screen appears completely stuck. A high slow-frame rate points to jank you should profile, while frozen frames point to work blocking the main thread that needs to move off it.

### What is an ANR and how does it relate to an app hang?

ANR (Application Not Responding) is the Android term for the main thread being blocked long enough that the system offers to kill the app, roughly 5 seconds for input dispatch. The OpenObserve Android SDK can report non-fatal ANRs so you see them before they become fatal. The iOS equivalent is an app hang, an unresponsive main thread that the iOS SDK reports once it crosses a threshold you set. Both mean the same thing: work that belongs off the main thread is running on it.

### How does OpenObserve link a slow screen to the backend trace?

When you list your backend domains as first-party hosts, the SDK injects W3C tracecontext headers into outgoing requests to those hosts. Your OpenObserve-instrumented backend continues the same trace, so the RUM resource on the device and the server-side spans share one trace id. In OpenObserve you can open a slow screen, find the slow resource, and jump straight to the distributed trace to see whether the time was spent in the app, on the network, or in the backend.

### What are frustration signals and rage taps?

Frustration signals are automatically detected patterns that indicate a user is struggling. The most common is a rage tap, where a user taps the same element many times in quick succession because nothing is responding. These are captured as RUM actions flagged as frustrated, and they are a fast way to find broken buttons, dead zones, and screens that feel unresponsive without waiting for a bug report.

### Does collecting mobile vitals slow the app down?

The overhead is small and configurable. Vitals are sampled on a cadence you control with the vitals update frequency setting, which can be frequent, average, rare, or off entirely. Collection, batching, and upload happen off the main thread, so measuring performance does not itself block the UI. If you are cost or battery sensitive, lower the vitals frequency and the session sample rate rather than turning instrumentation off.

### Why do my network resources show timing but no backend trace?

Resource timing is captured for every tracked request, but the distributed trace link only appears for hosts you declared as first-party. If a request goes to a host that is not in your first-party hosts list, the SDK still records timing, status, and size, but it does not inject trace headers, so there is no server-side trace to connect to. Add the backend host to the first-party hosts configuration to get the end-to-end trace.
