---
title: Best Practices
description: Production guidance for mobile RUM — sampling strategy, batch size and upload frequency, cost control, release health hygiene, and naming conventions.
---

# Mobile RUM Best Practices

This guide collects the decisions that separate a mobile RUM setup that just works in a demo from one that is healthy, affordable, and trustworthy in production — across React Native, Android, and iOS. It assumes you have a working integration from one of the [platform guides](./index.md) and focuses on the choices you make around it: how much to sample, how to batch, how to keep cost and volume under control, how to keep releases comparable, and how to verify everything before you ship. Every setting mentioned here maps to a real SDK option; where a platform differs, that is called out.

:::warning[Alpha status]

The mobile SDKs are published as `0.1.0-alpha.x` (React Native `0.1.0-alpha.5`, Android `0.1.0-alpha5`, iOS `0.1.0-alpha.4`). They are ready to integrate and evaluate. Pin exact versions, test upgrades deliberately, and watch release notes — the version-management section below covers this in detail.
:::
## Sampling strategy — pick each rate for what it costs

The single most important cost-and-value lever in mobile RUM is sampling, and the mistake to avoid is treating it as one number. There are three independent sample rates, and they exist because the three data types they gate have wildly different volume and value.

| Sample rate | What it gates | Typical starting point | Why |
|---|---|---|---|
| Session sample rate | Whether a session is recorded at all (views, actions, resources, errors) | 100 while validating, then lower to fit budget | One number that scales everything down proportionally. |
| Resource trace sample rate | Whether a network resource is traced end-to-end into the backend | Lower than the session rate | Traces multiply per request; you rarely need every request traced. |
| Session Replay sample rate | Whether a sampled session is also screen-recorded | Much lower — often 10–20% | Replay is by far the heaviest data type per session. |

Three rules follow from this:

- **Session sample rate is your master volume dial.** It decides what fraction of sessions produce any RUM data. Set it to `100` while you validate the integration and understand your traffic, then lower it to fit your budget. Because it gates everything downstream, cutting it in half roughly halves your RUM volume.
- **Resource trace sample rate is a subset of sessions, applied per resource.** A single session can fire dozens of network requests; tracing all of them into your backend is usually more than you need. Keep this below the session rate — you still get representative end-to-end traces without a trace for every call.
- **Session Replay should be sampled the lowest.** Replay captures the UI over time, so it produces far more data than views, actions, and resources combined. It is a subset of already-sampled sessions. A replay rate well below the session rate gives you enough recordings to investigate real problems while keeping bandwidth, battery, and storage sane. Recording every session is almost never worth it.

Sampling is a device-side decision — dropped data never leaves the phone, so lowering these rates saves the user's battery and bandwidth as well as your ingestion cost.

### React Native

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  customEndpoint: 'https://your-openobserve-instance:5080',
  sessionSampleRate: 100,        // master dial — lower once validated
  resourceTraceSampleRate: 20,   // trace a fifth of resources end-to-end
},
```

```tsx
// Session Replay is a separate package — sample it far lower
import { SessionReplay } from '@openobserve/mobile-react-native-session-replay';

await SessionReplay.enable({ replaySampleRate: 10 });
```

### Android

```kotlin
val rumConfig = RumConfiguration.Builder(BuildConfig.OPENOBSERVE_RUM_APPLICATION_ID)
    .useCustomEndpoint("https://your-openobserve-instance:5080")
    .setSessionSampleRate(100f)     // master dial
    .build()
Rum.enable(rumConfig)

SessionReplay.enable(
    SessionReplayConfiguration.Builder(sampleRate = 10f).build(), // far lower
)
```

### iOS

```swift
RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        sessionSampleRate: 100,   // master dial
        customEndpoint: URL(string: "https://your-openobserve-instance:5080")
    )
)

SessionReplay.enable(
    with: SessionReplay.Configuration(replaySampleRate: 10) // far lower
)
```

## Batch size and upload frequency — the battery/bandwidth tradeoff

The SDK buffers events on disk and uploads them in batches on a cadence. Two settings control that cadence, and both trade freshness against efficiency:

- **`batchSize`** (`SMALL` / `MEDIUM` / `LARGE`) — how much to accumulate per upload. Larger batches mean fewer, bigger network requests.
- **`uploadFrequency`** (`FREQUENT` / `AVERAGE` / `RARE`) — how often to flush. Rarer uploads mean the radio wakes up less often.

The guidance is simple: **fewer, larger uploads are cheaper on battery and radio; smaller, more frequent uploads get data to OpenObserve sooner.** Waking the cellular radio is one of the most expensive things an app does, so batching aggressively (larger batch, rarer frequency) is usually the right default for production. Move toward smaller and more frequent only when you genuinely need near-real-time data and have accepted the battery cost — for example while actively debugging a live incident.

Defaults are `MEDIUM` batch size and `AVERAGE` upload frequency on all three platforms, which is a sensible middle ground. For a battery-sensitive consumer app, lean toward `LARGE` / `RARE`.

### React Native

```tsx
const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',
  'production',
  TrackingConsent.GRANTED,
  {
    batchSize: BatchSize.LARGE,          // fewer, bigger uploads
    uploadFrequency: UploadFrequency.RARE, // wake the radio less often
    rumConfiguration: { /* ... */ },
  },
);
```

### Android

```kotlin
val config = Configuration.Builder(
        clientToken = BuildConfig.OPENOBSERVE_CLIENT_TOKEN,
        env = "production",
        service = "com.example.app",
    )
    .setBatchSize(BatchSize.LARGE)
    .setUploadFrequency(UploadFrequency.RARE)
    .build()
```

### iOS

```swift
OpenObserve.Configuration(
    clientToken: "<client token>",
    env: "production",
    service: "com.example.app",
    batchSize: .large,
    uploadFrequency: .rare
)
```

## Cost control — know what drives volume, then cut the noise

RUM cost in OpenObserve is driven by the number of events you ingest. In rough order of impact, volume comes from:

1. **Number of sessions** — gated by the session sample rate.
2. **Session Replay** — the heaviest per-session data type, gated by its own sample rate.
3. **Resources and traces per session** — chatty apps and untuned trace sampling add up fast.
4. **Actions and views per session** — usually modest, but frustration and interaction tracking can inflate them.

Attack cost in this order:

- **Sample first.** The three rates above are the biggest, cleanest lever. Start there before micro-optimizing anything else.
- **Enable only the instrumentation you use.** Automatic tracking of interactions, resources, long tasks, background events, and non-fatal ANRs are all opt-in or individually toggleable. Turning on features you never look at pays no dividend and costs volume. Leave `trackBackgroundEvents` off unless you specifically need background activity.
- **Drop noise at the source with event mappers.** Every platform exposes event-mapper hooks that run on the device before an event is sent. Return `null` to drop an event entirely, or a modified event to trim it. Use them to drop health-check and polling requests, silence known-benign errors, and redact fields — this reduces both cost and clutter, and keeps sensitive data off the wire (see [Security & Privacy](./security-privacy.md)).

### React Native

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  trackResources: true,
  // Drop noisy polling requests before they leave the device
  resourceEventMapper: (event) => {
    if (event.resource?.url?.includes('/healthz')) return null;
    return event;
  },
},
```

### Android

```kotlin
RumConfiguration.Builder(applicationId)
    .setResourceEventMapper { event ->
        if (event.url.contains("/healthz")) null else event
    }
    .build()
```

### iOS

```swift
RUM.Configuration(
    applicationID: "<application id>",
    resourceEventMapper: { event in
        event.url.contains("/healthz") ? nil : event
    }
)
```

## Release health hygiene — always set env, service, and version

Release health is only as good as the metadata you attach. Three fields make releases and environments comparable in OpenObserve, and you should treat setting all three as non-negotiable:

- **`env`** — separate `production`, `staging`, and `development` so a QA crash never pollutes production crash-free rates. Never leave everything as one environment.
- **`service`** — the identifier your app is grouped under. **Use the same service name across React Native, Android, and iOS builds of the same app.** If the platforms use different service names, OpenObserve sees three unrelated apps instead of one app on three platforms, and you lose the cross-platform view.
- **`version`** — the release version. This powers release health: crash-free rate, error trends, and regressions per release. An app that never sets `version` cannot answer "is this release worse than the last one," which is the entire point of release health. Keep it in sync with your store version, and derive it from the build so it can never drift.

All three are first-class fields on every platform. `service` and `version` default to the app's bundle id and version, but set them explicitly so they stay stable and consistent rather than depending on defaults.

### React Native

```tsx
const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',
  'production', // env — swap per build type
  TrackingConsent.GRANTED,
  { rumConfiguration: { /* ... */ } },
);
config.service = 'com.example.app'; // identical across all platforms
config.version = '1.4.0';           // your store release version
```

### Android

```kotlin
Configuration.Builder(
    clientToken = BuildConfig.OPENOBSERVE_CLIENT_TOKEN,
    env = "production",                 // env
    service = "com.example.app",        // identical across all platforms
)
    .setVersion(BuildConfig.VERSION_NAME) // derive from the build
    .build()
```

### iOS

```swift
OpenObserve.Configuration(
    clientToken: "<client token>",
    env: "production",            // env
    service: "com.example.app",   // identical across all platforms
    version: "1.4.0"              // your store release version
)
```

There is no separate "organization" field in the mobile config — your org is part of the ingestion endpoint URL and token, so you do not manage it here.

## Naming conventions — stable, human-readable, low-cardinality

View and action names become the dimensions you group and filter by in OpenObserve, so their quality determines whether your dashboards are readable. Follow three rules:

- **Stable** — a view's name should not change between sessions or releases for the same screen. Names built from mutable state fragment your data across releases.
- **Human-readable** — `Checkout` and `Product Details`, not class names, route paths, or opaque ids. You and your on-call teammates read these at 3 a.m.
- **Low-cardinality** — never put ids, emails, timestamps, or other unbounded values into a view or action *name*. `Order #48213` as a view name creates a distinct view per order and makes aggregation meaningless. Put those variable values into **attributes** instead, where they belong and can be searched without exploding cardinality.

Automatic instrumentation already produces reasonable names — screens from your navigation library, actions from accessibility labels. Lean on it, and override with manual naming only where the automatic name is unclear. When you do add attributes, use consistent keys across platforms (`order.id`, `cart.value`) so a single query works everywhere.

```tsx
// Good: stable, readable view name; variable data goes in attributes
await OoRum.startView('order-detail', 'Order Detail', { 'order.id': orderId });

// Avoid: id in the name explodes cardinality and breaks aggregation
await OoRum.startView(orderId, `Order ${orderId}`);
```

## Automatic vs manual instrumentation — start automatic, fill gaps manually

Automatic instrumentation is the right default: it captures screens, taps, network resources, and errors with almost no code and covers most of your app. Turn it on and let it do the heavy lifting.

Reach for manual instrumentation only to fill specific gaps:

- **Views** — when a screen has no navigation event the SDK can hook, or you want a business-meaningful name (a checkout funnel step) rather than a component name. Use `startView` / `stopView`.
- **Actions** — for a conceptual action that is not a single tap, such as "Applied coupon," via `addAction(type, name, ...)`.
- **Errors** — for handled errors you caught and recovered from. Automatic tracking only sees *unhandled* errors, so a `try/catch` that swallows a failure is invisible unless you call `addError` yourself.
- **Resources** — for non-HTTP work you want timed as a resource (a database read, a native bridge call), via `startResource` / `stopResource`.

Manual and automatic coexist — you are adding detail, not replacing the automatic layer. Resist the urge to instrument everything by hand; it is more code to maintain and a common source of double-counted or mis-timed events.

## Consent-first rollout — collect nothing until you may

Ship with consent gating from day one rather than retrofitting it. Every SDK has a three-state tracking consent: `PENDING`, `GRANTED`, `NOT_GRANTED`. When consent is `PENDING`, the SDK buffers nothing to the network; when it is `NOT_GRANTED`, data is dropped. Initialize with `PENDING` if you show a consent prompt, then flip to `GRANTED` (or `NOT_GRANTED`) once the user decides.

### React Native

```tsx
// Initialize pending, then grant after the user agrees
import { OoSdkReactNative, TrackingConsent } from '@openobserve/mobile-react-native';

OoSdkReactNative.setTrackingConsent(TrackingConsent.GRANTED);
```

### Android

```kotlin
OpenObserve.setTrackingConsent(TrackingConsent.GRANTED)
```

### iOS

```swift
OpenObserve.set(trackingConsent: .granted)
```

If a user withdraws consent, `clearAllData()` discards data still buffered on the device. See [Security & Privacy](./security-privacy.md) for the full consent, masking, and scrubbing model.

## Distributed tracing — connect mobile to your backend traces

If your backend already sends traces to OpenObserve, one change connects mobile sessions to them: mark your backend hosts as **first-party** so the SDK injects **W3C `tracecontext`** headers on requests to those hosts. OpenObserve reads `tracecontext`, so a mobile network resource links to the server spans it triggered — one continuous trace from tap to backend. Only mark hosts you own as first-party; injecting trace headers into third-party requests leaks context and can break their CORS or signature checks. Prefer `tracecontext` over `b3` / `b3multi` unless a backend specifically requires the others.

### React Native

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  trackResources: true,
  firstPartyHosts: [
    { match: 'api.example.com', propagatorTypes: ['tracecontext'] },
  ],
},
```

### Android

```kotlin
// Mark first-party hosts on the core config, then instrument OkHttp
Configuration.Builder(clientToken, env = "production", service = "com.example.app")
    .setFirstPartyHosts(listOf("api.example.com"))
    .build()

val client = OkHttpClient.Builder()
    .configureOpenObserveInstrumentation(
        rumInstrumentationConfiguration = RumNetworkInstrumentationConfiguration(),
        apmInstrumentationConfiguration = ApmNetworkInstrumentationConfiguration(listOf("api.example.com")),
    )
    .build()
```

### iOS

```swift
RUM.Configuration(
    applicationID: "<application id>",
    urlSessionTracking: RUM.Configuration.URLSessionTracking(
        firstPartyHostsTracing: .trace(hosts: ["api.example.com"], sampleRate: 20)
    )
)
```

Note how the iOS trace sample rate lives right here on the tracing config — a good reminder that trace volume is tuned separately from session volume.

## Verify in non-prod before shipping

Never let a release be the first time your instrumentation runs against real config. Before every ship:

1. Build a `staging` (or `development`) `env` variant pointed at your OpenObserve instance and raise SDK verbosity to debug so the SDK prints what it sends.
2. Exercise the app — navigate several screens, tap around, trigger network calls, and force a test error.
3. In OpenObserve, open **RUM** and confirm the session appears with views, actions, and resources, and that **Error Tracking** shows your test error.
4. Confirm `env`, `service`, and `version` are correct on the events, and that a first-party request shows a linked backend trace.
5. Only then promote the same code to a `production` `env` build.

Raise verbosity in non-prod builds and lower or remove it in production — debug logging is for you, not for your users' devices.

## Alpha version management — pin, align, and watch release notes

Because these SDKs are `0.1.0-alpha.x`, treat version management as part of your production hygiene:

- **Pin exact versions**, not ranges. Configuration details can change between alpha releases, and a floating range can pull a breaking change into a build without you noticing.
- **Keep React Native's layers aligned.** The JavaScript package wraps native Android and iOS code, so the npm package version and the native pods / Gradle artifacts it brings in must match. After upgrading the JS package, run `pod install` again and rebuild both platforms so the native side matches the JavaScript side.
- **Test every upgrade in a non-prod build** using the verification steps above before it reaches production.
- **Read the release notes** for each SDK on every bump and watch for breaking changes to configuration and API surface.

```bash
# Pin exact versions — no ^ or ~ ranges on alpha SDKs
npm install @openobserve/mobile-react-native@0.1.0-alpha.5
```

```groovy
// Android — pin the exact alpha coordinate
implementation "ai.openobserve:o2-sdk-android-rum:0.1.0-alpha5"
```

```swift
// iOS SPM — pin exactly rather than using a floating range
.package(url: "https://github.com/openobserve/openobserve-sdk-ios.git", exact: "0.1.0-alpha.4")
```

## Production readiness checklist

Run this list before you flip a mobile RUM build to production:

- [ ] **Consent** — the app initializes with the correct tracking consent and honors withdrawal.
- [ ] **`env` set** — production builds report `production`; QA and dev report something else.
- [ ] **`service` consistent** — identical service name across React Native, Android, and iOS.
- [ ] **`version` set** — derived from the build and matching your store release, so release health works.
- [ ] **Session sample rate** — set to a deliberate value, not left at 100 by accident.
- [ ] **Resource trace sample rate** — lower than the session rate.
- [ ] **Session Replay** — off, or sampled far below the session rate if on.
- [ ] **Batching** — `batchSize` and `uploadFrequency` tuned toward battery efficiency for a consumer app.
- [ ] **Only-what-you-use** — automatic instrumentation limited to features you actually look at; `trackBackgroundEvents` off unless needed.
- [ ] **Event mappers** — noisy requests and benign errors dropped; sensitive fields redacted.
- [ ] **Naming** — views and actions are stable, human-readable, and low-cardinality; ids live in attributes.
- [ ] **First-party hosts** — your backend hosts marked so `tracecontext` links mobile to backend traces.
- [ ] **Verbosity** — debug logging disabled in production.
- [ ] **Versions pinned** — exact alpha versions, RN JS and native layers aligned, release notes reviewed.
- [ ] **Verified in non-prod** — data confirmed in OpenObserve RUM and Error Tracking before promotion.

## What's next

- [Performance Monitoring](./performance-monitoring.md) — read mobile vitals, screen timing, and network performance once data flows.
- [Error & Crash Tracking](./error-tracking.md) — symbolication, source maps, and error grouping.
- [Security & Privacy](./security-privacy.md) — the full consent, masking, and data-scrubbing model.
- [Mobile RUM Overview](./index.md) — the concepts these practices build on.

## Frequently asked questions

### What sample rates should I start with for mobile RUM?

A common starting point is a session sample rate of 100 while you validate the integration, then lowering it once volume and cost are understood. Keep the resource trace sample rate lower than the session rate because traces multiply per network call, and keep Session Replay far lower still — often 10 to 20 percent — because replay is the heaviest data type. Sampling is independent per data type, so tune each one to the value you get from it rather than using a single number everywhere.

### Why should Session Replay be sampled much lower than sessions?

Session Replay records the UI over time, so it produces far more data per session than views, actions, and resources combined. Recording every session is rarely worth the bandwidth, battery, and storage cost. A low replay sample rate still gives you enough recordings to investigate real problems while keeping the volume and cost manageable. Session Replay is sampled as a subset of already-sampled sessions.

### How do I control how much RUM data reaches OpenObserve?

Volume is driven by number of sessions, events per session, resources and traces per session, and whether Session Replay is on. Reduce it with sampling (session, resource trace, replay), by turning on only the automatic instrumentation you use, by raising batch size and lowering upload frequency, and by using event mappers to drop noisy or low-value events on the device before they are ever sent.

### Why do env, service, and version matter so much?

These three fields let you compare releases and environments in OpenObserve. Version powers release health — crash-free rates and error trends per release — so an app that never sets version cannot answer 'is this release worse than the last one'. Using a consistent service name across platforms lets you see one app across React Native, Android, and iOS instead of three disconnected apps.

### Should I use automatic instrumentation or add views and actions manually?

Start with automatic instrumentation — it captures screens, taps, network calls, and errors with almost no code and covers the majority of your app. Add manual views, actions, and errors only where automatic naming is unclear or where a business step matters, such as a checkout funnel or a handled error you recovered from. Manual and automatic instrumentation coexist, so use manual calls to fill gaps rather than replacing the automatic layer.

### How do I connect mobile sessions to my backend traces in OpenObserve?

Mark your backend hosts as first-party and let the SDK inject W3C tracecontext headers on requests to those hosts. OpenObserve reads tracecontext, so a mobile resource links to the server-side spans it triggered, giving you one continuous trace from tap to backend. If your backend is already sending traces to OpenObserve, this is the single change that connects the two.

### These SDKs are alpha — how should I manage upgrades?

Pin exact versions rather than version ranges, because configuration details can change between alpha releases. On React Native, keep the JavaScript package version aligned with the native pods and Gradle artifacts it brings in. Test each upgrade in a non-production build, read the release notes for breaking changes, and verify data still appears in OpenObserve before you ship.
