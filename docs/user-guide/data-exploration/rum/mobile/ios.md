---
title: iOS
description: Add OpenObserve RUM to a native Apple app in Swift — add the package, initialize at launch, and enable automatic view, action, and network instrumentation.
---

# iOS RUM Integration

This guide walks through adding [OpenObserve](https://openobserve.ai) Real User Monitoring to a native Apple app in Swift, end to end: adding the package, initializing the SDK at launch, enabling RUM with automatic view, action, and network instrumentation, reporting errors and crashes, and controlling privacy and data volume. The SDK targets iOS, tvOS, macOS, and watchOS, so the same integration covers your whole Apple lineup.

New to mobile RUM in general? Start with the [Mobile RUM Overview](./index.md) for the concepts — sessions, views, actions, resources, errors — that this guide assumes.

!!! note "Version (Beta)"

    The iOS SDK is published as `0.1.0` on both Swift Package Manager and CocoaPods. Pin the exact version and test upgrades deliberately, since configuration details can still change across early `0.1.x` releases.

## What you get

Once integrated, OpenObserve RUM automatically captures:

- **Screens (views)** — one RUM view per `UIViewController`, driven by a predicate, or started manually.
- **User actions** — taps and other UIKit interactions, named from the accessibility identifier or button title.
- **Network resources** — `URLSession` requests with timing, status, and size, plus distributed tracing to your first-party backends.
- **Errors** — handled errors you report and unhandled failures, with message, source, and stack.
- **Crashes** — native app crashes, symbolicated for readable stack traces, when crash reporting is enabled.
- **Mobile vitals** — slow frames, app hangs, long tasks, memory warnings, and frustration signals.
- **Session Replay** — optional, privacy-first playback of what the user saw and did.

## Prerequisites

- An Apple app project — **iOS 12+**, tvOS 12+, macOS 12.6+, or watchOS 7+.
- **Swift 5.9** and a recent **Xcode**.
- An OpenObserve instance — [OpenObserve Cloud](https://cloud.openobserve.ai) or self-hosted. For local testing, one container is enough:

```bash
docker run -d --name openobserve \
  -p 5080:5080 \
  -e ZO_ROOT_USER_EMAIL="root@example.com" \
  -e ZO_ROOT_USER_PASSWORD="Complexpass#123" \
  public.ecr.aws/zinclabs/openobserve:latest
```

- Your **client token**, **RUM application id**, and **ingestion endpoint** from **Data → Data Sources → Real User Monitoring** in the OpenObserve UI.

## Step 1 — Add the package

### Swift Package Manager (recommended)

In Xcode, choose **File → Add Package Dependencies…** and enter the repository URL:

```
https://github.com/openobserve/openobserve-sdk-ios.git
```

Pin the version to **0.1.0** (Exact Version) and add the products you need. `OpenObserveCore` and `OpenObserveRUM` are required; add the rest for the features you want:

| Product | Purpose |
|---------|---------|
| `OpenObserveCore` | Core SDK — required, provides `OpenObserve.initialize`. |
| `OpenObserveRUM` | RUM — views, actions, resources, errors. Required for RUM. |
| `OpenObserveCrashReporting` | Native crash capture. |
| `OpenObserveSessionReplay` | Privacy-first session replay. |
| `OpenObserveLogs` | Structured logging to OpenObserve. |
| `OpenObserveTrace` | Standalone distributed tracing. |
| `OpenObserveWebViewTracking` | RUM for `WKWebView` content. |

If you manage dependencies in `Package.swift`:

```swift
.package(url: "https://github.com/openobserve/openobserve-sdk-ios.git", exact: "0.1.0"),
```

### CocoaPods

Alternatively, add one pod per module to your `Podfile`, then run `pod install`:

```bash
pod 'OpenObserveCore', '0.1.0'
pod 'OpenObserveRUM', '0.1.0'
pod 'OpenObserveCrashReporting', '0.1.0'
pod 'OpenObserveSessionReplay', '0.1.0'
```

## Step 2 — Initialize OpenObserve RUM

Initialize the SDK once, as early as possible — typically in `application(_:didFinishLaunchingWithOptions:)` or your `App` initializer. First call `OpenObserve.initialize`, then enable RUM with `RUM.enable`:

```swift
import OpenObserveCore
import OpenObserveRUM

let openObserveEndpoint = URL(string: "https://your-openobserve-instance:5080")

OpenObserve.initialize(
    with: OpenObserve.Configuration(
        clientToken: "YOUR_CLIENT_TOKEN",   // from Data → Data Sources → Real User Monitoring
        env: "production",
        service: "com.example.app",
        batchSize: .medium,
        uploadFrequency: .average
    ),
    trackingConsent: .granted   // .pending | .granted | .notGranted
)

RUM.enable(
    with: RUM.Configuration(
        applicationID: "YOUR_APPLICATION_ID",
        sessionSampleRate: 100,
        // Automatic instrumentation:
        uiKitViewsPredicate: DefaultUIKitRUMViewsPredicate(),
        uiKitActionsPredicate: DefaultUIKitRUMActionsPredicate(),
        urlSessionTracking: RUM.Configuration.URLSessionTracking(
            firstPartyHostsTracing: .trace(hosts: ["api.example.com"], sampleRate: 100)
        ),
        customEndpoint: openObserveEndpoint
    )
)
```

Those two calls initialize the SDK, enable RUM, and start the automatic instrumentation you configured. Data now flows to your OpenObserve instance, which appends the RUM intake path to your custom endpoint automatically.

!!! note "No organization field"

    There is no separate "organization" setting on mobile — your organization is part of the ingestion endpoint URL and token. The built-in managed-cloud `site` presets (`.us1`, `.eu1`, and so on) are still being wired up for OpenObserve Cloud as of `0.1.0`; for self-hosted and today's setups, use `customEndpoint` as shown above.

!!! note "Consent gating"

    Nothing is collected until tracking consent is `.granted`. If you show a consent dialog, initialize with `.pending` and call `OpenObserve.set(trackingConsent: .granted)` once the user agrees. See [Security & Privacy](./security-privacy.md).

Set `OpenObserve.verbosityLevel = .debug` during development to see the SDK's internal logs while you verify the integration; lower or remove it in production.

## Step 3 — Configuration options

### Core options — `OpenObserve.Configuration`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientToken` | `String` | — (required) | Ingestion credential from **Data → Data Sources → Real User Monitoring**. |
| `env` | `String` | — (required) | Environment tag, e.g. `production`, `staging`. |
| `service` | `String?` | bundle id | Service/app identifier used to group data. |
| `version` | `String?` | `CFBundleShortVersionString` | Release version — used for release health. |
| `site` | `OpenObserveSite` | `.us1` | Managed-cloud preset; use `customEndpoint` instead as of `0.1.0`. |
| `batchSize` | `BatchSize` | `.medium` | `.small` / `.medium` / `.large` — how much to buffer per upload. |
| `uploadFrequency` | `UploadFrequency` | `.average` | `.frequent` / `.average` / `.rare` — how often to upload. |
| `batchProcessingLevel` | `BatchProcessingLevel` | `.medium` | How aggressively batches are processed. |
| `backgroundTasksEnabled` | `Bool` | `false` | Continue uploading via background tasks. |
| `proxyConfiguration` | `[AnyHashable: Any]?` | `nil` | Route ingestion through a proxy. |
| `encryption` | `DataEncryption?` | `nil` | Encrypt buffered data on disk. |

`trackingConsent` is passed separately to `OpenObserve.initialize` and accepts `.pending`, `.granted`, or `.notGranted`.

### RUM options — `RUM.Configuration`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `applicationID` | `String` | — (required) | RUM application id from **Data → Data Sources → Real User Monitoring**. |
| `customEndpoint` | `URL?` | `nil` | Your OpenObserve instance base URL. |
| `sessionSampleRate` | `Float` | `100` | Percentage of sessions to keep (0–100). |
| `uiKitViewsPredicate` | `UIKitRUMViewsPredicate?` | `nil` (off) | Predicate that turns `UIViewController`s into views. |
| `uiKitActionsPredicate` | `UIKitRUMActionsPredicate?` | `nil` (off) | Predicate that turns UIKit taps into actions. |
| `swiftUIViewsPredicate` | `SwiftUIRUMViewsPredicate?` | `nil` | SwiftUI view tracking (experimental). |
| `swiftUIActionsPredicate` | `SwiftUIRUMActionsPredicate?` | `nil` | SwiftUI action tracking (experimental). |
| `urlSessionTracking` | `URLSessionTracking?` | `nil` | Enables `URLSession` resource tracking and tracing. |
| `trackFrustrations` | `Bool` | `true` | Detect rage taps and other frustration signals. |
| `trackBackgroundEvents` | `Bool` | `false` | Record events while the app is backgrounded. |
| `longTaskThreshold` | `TimeInterval?` | `0.1` | Main-thread block duration reported as a long task. |
| `appHangThreshold` | `TimeInterval?` | `nil` | Duration a UI freeze must exceed to be an app hang. |
| `trackWatchdogTerminations` | `Bool` | `false` | Report OS watchdog terminations. |
| `trackMemoryWarnings` | `Bool` | `true` | Record memory-warning events. |
| `trackSlowFrames` | `Bool` | `true` | Record slow / frozen UI frames. |
| `vitalsUpdateFrequency` | `VitalsFrequency?` | `.average` | Mobile-vitals sampling cadence. |
| `trackAnonymousUser` | `Bool` | `true` | Keep a stable anonymous id across sessions. |
| `viewEventMapper` / `resourceEventMapper` / `errorEventMapper` / `actionEventMapper` / `longTaskEventMapper` | closure | `nil` | Scrub or drop events before send. |

## Step 4 — Track screens (views)

### Automatically with a UIKit predicate

Passing `uiKitViewsPredicate` to `RUM.Configuration` (as in Step 2) is all you need for UIKit apps — the SDK starts a RUM view when a `UIViewController` appears and stops it when the next one takes over. `DefaultUIKitRUMViewsPredicate` names views after the view-controller class; provide your own `UIKitRUMViewsPredicate` implementation to customize names or skip controllers you do not want tracked.

SwiftUI view tracking is available via `swiftUIViewsPredicate` but is still **experimental** as of `0.1.0` — for SwiftUI screens today, prefer manual view calls.

### Manually

When automatic tracking does not fit — custom containers, modals, or SwiftUI screens you want named yourself — drive views directly through the RUM monitor:

```swift
import OpenObserveRUM

// entering a screen
RUMMonitor.shared().startView(key: "checkout", name: "Checkout", attributes: [:])

// ...user is on the screen...

RUMMonitor.shared().stopView(key: "checkout", attributes: [:])
```

You can also start a view from a `UIViewController` instance with `startView(viewController:name:attributes:)`.

## Step 5 — Track user actions

With a `uiKitActionsPredicate` configured, taps on buttons and other UIKit controls are captured automatically and named from the accessibility identifier or control title. To record actions explicitly:

```swift
import OpenObserveRUM

RUMMonitor.shared().addAction(type: .tap, name: "Add to cart", attributes: ["productId": "sku-42"])
```

`RUMActionType` values: `.tap`, `.click`, `.scroll`, `.swipe`, `.custom`. For actions that span time (a drag, a long-running gesture), use `startAction` and `stopAction` instead.

## Step 6 — Track network requests

Supplying `urlSessionTracking` to `RUM.Configuration` records each `URLSession` request as a RUM resource with URL, method, status, size, and timing. For the hosts you mark as first-party, the SDK injects distributed-tracing headers so the mobile resource links to the backend trace in OpenObserve:

```swift
urlSessionTracking: RUM.Configuration.URLSessionTracking(
    firstPartyHostsTracing: .trace(hosts: ["api.example.com"], sampleRate: 100)
)
```

The propagated header is W3C `.tracecontext`, which is what OpenObserve reads — so a slow screen links to the exact backend trace behind it, giving you one continuous trace from tap to server. Tune `sampleRate` to control how many requests carry trace context.

To record a resource manually — for a non-`URLSession` transport, for example — use the monitor's `startResource` / `stopResource` methods.

## Step 7 — Report errors

Report handled errors yourself so you can see failures you caught and recovered from, alongside the unhandled ones the SDK captures:

```swift
import OpenObserveRUM

do {
    try checkout()
} catch {
    RUMMonitor.shared().addError(error: error, source: .source, attributes: ["screen": "checkout"])
}
```

You can also report an error from a message and stack directly with `addError(message:type:stack:source:attributes:)`. `RUMErrorSource` values: `.source`, `.network`, `.webview`, `.console`, `.custom`. For crash symbolication and error grouping, see [Error & Crash Tracking](./error-tracking.md).

## Step 8 — User identity and global context

Attach the logged-in user so you can measure user-level impact (respecting consent). This identity applies to RUM, logs, and traces. `id` is required:

```swift
import OpenObserveCore

// after login
OpenObserve.setUserInfo(
    id: "user-123",
    name: "Ada Lovelace",
    email: "ada@example.com",
    extraInfo: ["plan": "premium"]
)

// on logout
OpenObserve.clearUserInfo()
```

Add global attributes that attach to every RUM event — useful for release channel, feature flags, or A/B buckets:

```swift
RUMMonitor.shared().addAttribute(forKey: "feature_flag.new_checkout", value: true)
RUMMonitor.shared().addAttribute(forKey: "build.channel", value: "beta")
```

Use `OpenObserve.addUserExtraInfo(_:)` to add more user properties later, and `RUMMonitor.shared().removeAttribute(forKey:)` to clear a global attribute.

## Step 9 — Crash reporting

Add the `OpenObserveCrashReporting` product, import it, and enable it after `OpenObserve.initialize`:

```swift
import OpenObserveCrashReporting

CrashReporting.enable()
```

Crashes are captured on the next launch and attached to the session that crashed, so you see the sequence of views, actions, and errors that led up to them. To turn addresses into readable, symbolicated stack traces, upload your app's **dSYM** files for each release build. Automated dSYM upload tooling is still being finalized as of `0.1.0` — until then, keep your dSYMs archived per release; see [Error & Crash Tracking](./error-tracking.md) for the symbolication workflow.

## Step 10 — Session Replay (optional)

Add the `OpenObserveSessionReplay` product to record privacy-first playback of user sessions. Enable it after RUM is enabled:

```swift
import OpenObserveSessionReplay

SessionReplay.enable(
    with: SessionReplay.Configuration(
        replaySampleRate: 20, // replay is heavier — sample lower than sessions
        textAndInputPrivacyLevel: .maskAll,
        imagePrivacyLevel: .maskAll,
        touchPrivacyLevel: .hide
    )
)

// If you set startRecordingImmediately to false, start manually:
SessionReplay.startRecording()
```

The privacy levels control what the recording can reveal:

- **`textAndInputPrivacyLevel`** — `.maskAll` (default, all text and inputs masked), `.maskAllInputs`, or `.maskSensitiveInputs`.
- **`imagePrivacyLevel`** — `.maskAll` (default), `.maskNonBundledOnly`, or `.maskNone`.
- **`touchPrivacyLevel`** — `.hide` (default) or `.show`.

Defaults are privacy-preserving. Stop recording at any time with `SessionReplay.stopRecording()`. See [Security & Privacy](./security-privacy.md) for the full privacy model.

## Step 11 — App hangs, watchdog, and frames

Beyond crashes, the RUM configuration exposes the mobile-vitals signals that catch a sluggish or unresponsive app:

- **App hangs.** Set `appHangThreshold` (for example `2.0` seconds) to report UI freezes where the main thread stops responding without crashing.
- **Watchdog terminations.** Set `trackWatchdogTerminations: true` to report cases where the OS killed your app for exceeding resource limits.
- **Slow / frozen frames.** `trackSlowFrames` (on by default) records rendering that misses the display's frame budget.
- **Long tasks.** `longTaskThreshold` (default `0.1s`) flags main-thread blocks that stall the UI.
- **Memory warnings.** `trackMemoryWarnings` (on by default) records `didReceiveMemoryWarning` events, which often precede a watchdog kill.

```swift
RUM.enable(
    with: RUM.Configuration(
        applicationID: "YOUR_APPLICATION_ID",
        appHangThreshold: 2.0,
        trackWatchdogTerminations: true,
        longTaskThreshold: 0.1,
        // ...other options...
        customEndpoint: openObserveEndpoint
    )
)
```

See [Performance Monitoring](./performance-monitoring.md) for how to read these signals in OpenObserve.

## Performance and overhead

The SDK is designed to stay out of your app's way:

- **Off the main thread.** Collection, batching, and upload happen in the background.
- **Batched and buffered.** Events are grouped and written to disk, then uploaded on the `uploadFrequency` cadence; if the device is offline, they wait and retry rather than being lost.
- **You control volume.** `sessionSampleRate`, the tracing `sampleRate`, Session Replay's `replaySampleRate`, and a larger `batchSize` / rarer `uploadFrequency` all reduce network and battery use.
- **Session Replay is the heaviest feature** — keep its sample rate well below your session sample rate.

`Authorization` and `Cookie` request headers are never captured. See [Best Practices](./best-practices.md) for production tuning and cost control.

## Verify it works

1. Run the app on a device or simulator (a debug build is fine).
2. Navigate a few screens, tap around, and trigger a network request.
3. In OpenObserve, open **RUM** and confirm your session appears with views, actions, and resources.
4. Force a test error and confirm it shows under **Error Tracking**.

If nothing appears, set `OpenObserve.verbosityLevel = .debug` and watch the Xcode console, verify the `customEndpoint` matches your instance, confirm the client token and application id are correct, and make sure tracking consent is `.granted`.

## Troubleshooting

- **No data in OpenObserve.** Confirm `customEndpoint` is reachable from the device, the client token is valid, and consent is `.granted`. Set `OpenObserve.verbosityLevel = .debug` and read the console output.
- **Screens not tracked.** Make sure you passed a `uiKitViewsPredicate` to `RUM.Configuration`, or switch to manual `startView` / `stopView`. SwiftUI tracking is experimental — prefer manual views there.
- **Network requests missing.** You must supply `urlSessionTracking`; requests made before the SDK initializes are not captured.
- **Crash stack traces are unreadable.** Upload the matching **dSYM** files for the release build so crashes symbolicate — see [Error & Crash Tracking](./error-tracking.md).
- **Too much data / cost.** Lower `sessionSampleRate` and `replaySampleRate`; see [Best Practices](./best-practices.md).

## What's next

- [Performance Monitoring](./performance-monitoring.md) — read mobile vitals, screen timing, and network performance.
- [Error & Crash Tracking](./error-tracking.md) — dSYM upload, symbolication, and error grouping.
- [Security & Privacy](./security-privacy.md) — consent, masking, and data scrubbing.
- [Best Practices](./best-practices.md) — sampling, cost, and release health.
- [Android](./android.md) and [React Native](./react-native.md) — if you also ship on those platforms.

## Frequently asked questions

### How do I add the OpenObserve iOS SDK to my project?

Use Swift Package Manager. In Xcode go to File > Add Package Dependencies and enter https://github.com/openobserve/openobserve-sdk-ios.git, then pick the products you need — OpenObserveCore and OpenObserveRUM at minimum, plus OpenObserveCrashReporting and OpenObserveSessionReplay if you want crash reporting and replay. CocoaPods is also supported with one pod per module.

### Where do I get the client token and application id?

Both come from **Data → Data Sources → Real User Monitoring** in your OpenObserve instance. The client token authenticates ingestion and the application id identifies your app in RUM. You pass the client token to OpenObserve.Configuration and the application id to RUM.Configuration, and point RUM.Configuration.customEndpoint at your OpenObserve instance base URL.

### Does the SDK support tvOS, macOS, and watchOS?

Yes. The Swift package targets iOS 12+, tvOS 12+, macOS 12.6+, and watchOS 7+. The RUM API is the same across platforms, though UIKit-based automatic view and action tracking applies to UIKit targets. SwiftUI view and action tracking is available but still experimental as of `0.1.0`.

### How are screens tracked automatically?

Pass a uiKitViewsPredicate (for example DefaultUIKitRUMViewsPredicate) to RUM.Configuration and the SDK starts and stops a RUM view for each UIViewController automatically. Pass a uiKitActionsPredicate to capture taps the same way. When automatic tracking does not fit, drive views manually with RUMMonitor.shared().startView and stopView.

### Does the SDK capture native crashes on iOS?

Yes, when you add the OpenObserveCrashReporting product, import it, and call CrashReporting.enable() after initializing the SDK. Crashes are reported on the next app launch and attached to the session that crashed. To get readable, symbolicated stack traces you upload your app's dSYM files as part of your release build.

### How do I link app network requests to backend traces?

Configure urlSessionTracking on RUM.Configuration with firstPartyHostsTracing set to .trace for your API hosts. The SDK records each URLSession request as a RUM resource and injects W3C tracecontext headers, so the mobile resource links to the backend trace in OpenObserve for full tap-to-server visibility.

### Is the iOS SDK production-ready?

It is in Beta, published as 0.1.0. The API produces the same RUM data model as OpenObserve's other SDKs, but you should pin the exact version, test upgrades, and expect some details — managed-cloud endpoint presets and build-time dSYM upload tooling — to be finalized in a later 0.1.x release.
