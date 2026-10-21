---
title: Error & Crash Tracking
description: Mobile RUM captures handled errors and native crashes across React Native, Android, and iOS, with error grouping, custom fingerprints, and symbolication.
---

# Mobile RUM Error & Crash Tracking

Errors and crashes are the highest-signal data your mobile app produces — they are the moments a user was actively blocked. This guide covers how [OpenObserve](https://openobserve.ai) Real User Monitoring captures errors and crashes across all three mobile SDKs: what gets captured automatically, how to report handled errors yourself, how errors are grouped into issues, and how to upload the mapping artifacts that turn a stripped release stack trace back into readable source.

If you are new to the mobile SDKs, start with the [Mobile RUM Overview](./index.md) and the per-platform setup guides for [React Native](./react-native.md), [Android](./android.md), and [iOS](./ios.md) — this page assumes the SDK is already initialized and pointed at your OpenObserve instance.

!!! note "Versions (Beta)"

    The mobile SDKs are at React Native `0.1.2`, Android `0.1.0`, and iOS `0.1.0`. The error and crash APIs shown here are settled, but pin exact versions: a few build-time symbol-upload tools are still being finalized, and those are called out explicitly below.

## Handled errors vs. crashes

These are two different things, and OpenObserve treats them differently:

- A **handled error** is an exception your code caught. The app kept running; the user may not have noticed. You report these explicitly so you can see recovered-from failures — a failed retry, a parse error you fell back from, a declined payment. They land in error tracking but do **not** end the session or affect your crash-free rate.
- A **crash** is an *unhandled* fault that terminates the process. That includes an uncaught JavaScript exception, a native signal (segfault, abort), an unhandled Kotlin/Swift exception, an Android ANR, or an iOS watchdog termination. Crashes end the session and count against crash-free session and crash-free user rates.

The rule of thumb: if you wrote a `try/catch` (or `do/catch`) around it, it is a handled error and you report it. If it slips past every handler, it is a crash and the SDK captures it — once you have crash reporting enabled.

## What is captured automatically

Each SDK captures a different set of faults without any per-error code from you, once the relevant feature is enabled:

| Fault type | React Native | Android | iOS |
|---|---|---|---|
| Unhandled JS errors | Yes (`trackErrors`) | — | — |
| Native app crashes | Yes (`nativeCrashReportEnabled`) | Yes (JVM, default on) | Yes (`CrashReporting.enable()`) |
| Native (C/C++) crashes | Yes (via native layer) | Yes (`NdkCrashReports.enable()`) | Included in crash reporting |
| ANRs (app-not-responding) | Native ANRs via native layer | Yes (`trackNonFatalAnrs`) | — |
| App hangs | — | — | Yes (`appHangThreshold`) |

Everything else on this list requires you to opt in during initialization, covered under [Enabling crash reporting](#enabling-crash-reporting) below.

## Reporting handled errors

Automatic capture only sees faults that reach the top of the stack. Everything you catch and recover from is invisible unless you report it. Each SDK gives you an `addError` entry point and an error-source enum that tells OpenObserve where the error came from.

### React Native

Use the `O2Rum.addError` singleton method. Its signature is `addError(message, source, stacktrace, context?, timestampMs?, fingerprint?)`:

```tsx
import { O2Rum, ErrorSource } from '@openobserve/mobile-react-native';

try {
  await submitOrder(cart);
} catch (e) {
  const err = e as Error;
  await O2Rum.addError(
    err.message,
    ErrorSource.SOURCE,
    err.stack ?? '',
    { screen: 'checkout', cartValue: cart.total },
  );
}
```

`ErrorSource` values are `NETWORK`, `SOURCE`, `CONSOLE`, `WEBVIEW`, and `CUSTOM`. Pick the one that reflects the origin — `NETWORK` for failed requests, `SOURCE` for your own code, `WEBVIEW` for errors bubbling out of an embedded web view. With `trackErrors: true`, unhandled JavaScript exceptions are already captured for you, so reserve `addError` for the ones you catch.

### Android

Call `addError` on the RUM monitor returned by `GlobalRumMonitor.get()`. Pass the caught `Throwable` so the SDK reads the class, message, and stack from it:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor
import com.openobserve.android.rum.RumErrorSource

try {
    submitOrder(cart)
} catch (e: Exception) {
    GlobalRumMonitor.get().addError(
        "Order submission failed",
        RumErrorSource.SOURCE,
        e,                                    // Throwable? — source of the stack trace
        mapOf("screen" to "checkout", "cart_value" to cart.total),
    )
}
```

When you have a stack trace as a string rather than a live `Throwable` — for example an error surfaced from a lower layer — use `addErrorWithStacktrace` instead, which takes the pre-formatted stack. `RumErrorSource` marks the origin of the error the same way it does on the other platforms.

### iOS

`RUMMonitor.shared()` exposes two forms of `addError`. Use `addError(error:source:)` when you have a Swift `Error` value, and `addError(message:type:stack:source:)` when you want to supply the message, type, and stack explicitly:

```swift
import OpenObserveRUM

do {
    try submitOrder(cart)
} catch {
    // Pass the Error directly:
    RUMMonitor.shared().addError(error: error, source: .source)

    // Or supply message, type, and stack yourself:
    RUMMonitor.shared().addError(
        message: "Order submission failed",
        type: "OrderError",
        stack: Thread.callStackSymbols.joined(separator: "\n"),
        source: .source
    )
}
```

`RUMErrorSource` values are `.source`, `.network`, `.webview`, `.console`, and `.custom`.

## Error grouping and custom fingerprints

OpenObserve groups similar errors into a single **issue** so that one recurring bug is one row with an occurrence count — not thousands of identical lines. Grouping is driven by a *fingerprint* derived automatically from the error type, message, and the top stack frames.

Automatic grouping is right most of the time, but it can be too coarse (two unrelated failures with the same generic message get merged) or too fine (one bug produces slightly different messages and splits into many issues). When that happens, set a **custom fingerprint** to force the grouping you want:

- **React Native** — pass the `fingerprint` argument (the last parameter of `addError`):

  ```tsx
  await O2Rum.addError(
    err.message,
    ErrorSource.SOURCE,
    err.stack ?? '',
    { screen: 'checkout' },
    Date.now(),
    'checkout-submit-failure',   // custom fingerprint — all matching errors group together
  );
  ```

- **Android and iOS** — set a fingerprint attribute on the error event through the error event mapper (see the next section). Attach a stable string you compute from the error, and matching events group together regardless of small message differences.

Use a custom fingerprint that is stable for "the same bug" and distinct across different bugs — for example a logical operation name plus a failure category, not the raw message (which often contains variable data like ids or values).

## Enabling crash reporting

Handled errors work as soon as RUM is on. Crash capture is a separate switch on each platform — and on iOS it is a separate module you must import.

### React Native

Set `nativeCrashReportEnabled: true` in `rumConfiguration`. This turns on the underlying native crash reporters on both iOS and Android, so native crashes are captured alongside JavaScript errors:

```tsx
const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',
  'production',
  TrackingConsent.GRANTED,
  {
    rumConfiguration: {
      applicationId: 'YOUR_APPLICATION_ID',
      customEndpoint: 'https://your-openobserve-instance:5080',
      trackErrors: true,               // unhandled JS errors
      nativeCrashReportEnabled: true,  // native iOS + Android crashes
    },
  },
);
```

### Android

JVM crash reporting is enabled by default through the core configuration — `setCrashReportsEnabled(Boolean)` on `Configuration.Builder` defaults to `true`, so uncaught Kotlin/Java exceptions are captured with no extra call. For native C/C++ crashes (the NDK layer), add the `:o2-sdk-android-ndk` dependency and enable it after the SDK is initialized. To capture non-fatal ANRs, turn them on in the RUM configuration:

```kotlin
import com.openobserve.android.ndk.NdkCrashReports

// JVM crashes: on by default via Configuration.Builder(...).setCrashReportsEnabled(true)

// Native (C/C++) crashes:
NdkCrashReports.enable()

// Non-fatal ANRs (on RumConfiguration.Builder):
val rumConfig = RumConfiguration.Builder(applicationId)
    .trackNonFatalAnrs(true)
    .build()
```

### iOS

Crash reporting lives in a dedicated module. Import `OpenObserveCrashReporting` and call `CrashReporting.enable()` **after** `OpenObserve.initialize` and `RUM.enable`. To capture app hangs, set an `appHangThreshold` on the RUM configuration:

```swift
import OpenObserveCore
import OpenObserveRUM
import OpenObserveCrashReporting

OpenObserve.initialize(with: configuration, trackingConsent: .granted)

RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        appHangThreshold: 0.25   // report main-thread hangs longer than 250 ms
    )
)

CrashReporting.enable()
```

Crash reports are written on the fatal launch and uploaded on the **next** app start, so you always see the previous session's crash after the user reopens the app.

## Symbolication — making stack traces readable

Release builds strip and obfuscate your code, so a raw crash stack is a wall of mangled names and memory offsets. Symbolication reverses this using artifacts your build produced. Each platform has its own artifact type; upload it for every release you ship, keyed to the same `version` you set in the SDK.

### React Native

React Native has two layers, so it has two kinds of mapping:

- **JavaScript** — upload the **source maps** generated by the Metro bundler for your release build. These map the minified bundle back to your original JS/TS source, so JavaScript error stacks show real file names and line numbers.
- **Native** — the crash that happens under the JS layer is a native crash, so it needs native mapping too: **dSYM** files on iOS and **ProGuard/R8 mapping** (plus NDK symbols) on Android, exactly as for a fully native app.

Generate the source map as part of your release bundle (`react-native bundle ... --sourcemap-output`) and upload it, plus the native artifacts, when you cut the release. See the [React Native guide](./react-native.md) for where these files land in a standard build.

### iOS

Upload the **dSYM** (debug symbol) files Xcode produces for the release build. They map stripped addresses back to Swift/Objective-C symbols and source locations. If you build with Bitcode or let the App Store recompile, download the dSYMs from App Store Connect after processing, since the store-generated binary has its own symbols. Upload the dSYM for each build keyed to its `version`/build number so crashes symbolicate against the exact binary the user ran.

### Android

Android release builds are obfuscated by R8 (or ProGuard) and, if you ship native code, stripped of NDK symbols. You upload two artifacts:

- **ProGuard/R8 mapping file** (`mapping.txt`) — deobfuscates JVM stack traces back to your original class and method names.
- **NDK symbol files** — resolve native C/C++ frames back to source.

The **OpenObserve Android Gradle plugin** (id `io.openobserve.openobserve-sdk-android-gradle-plugin`) is the tool that uploads these mapping and symbol files as part of your build, so you do not do it by hand for every release. It is not yet published alongside the `0.1.0` SDK artifacts and its build-script configuration DSL is still being finalized — rather than reproduce a config block that is about to change, add the plugin and follow the current setup instructions in the [SDK's GitHub repository](https://github.com/openobserve/openobserve-sdk-android-gradle-plugin). Once configured, the plugin hooks into your release build and uploads the artifacts automatically, keyed to your app version.

## Scrubbing sensitive data from errors

Error messages and stack traces are a common place for sensitive data to leak — a message might echo a token, a URL might carry a query parameter, an attribute might hold a user's email. Every SDK lets you intercept each error event on-device, before it is sent, through an **error event mapper**. Return a modified event to redact fields, or return `null` to drop the event entirely so it never leaves the device.

### React Native

Set `errorEventMapper` in `rumConfiguration`:

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  customEndpoint: 'https://your-openobserve-instance:5080',
  errorEventMapper: (event) => {
    if (event.message?.includes('password')) return null;        // drop entirely
    event.message = redactTokens(event.message);                 // or redact and keep
    return event;
  },
},
```

### Android

Set the mapper on `RumConfiguration.Builder` with `setErrorEventMapper`. The same mapper is where you attach a custom fingerprint attribute for grouping:

```kotlin
val rumConfig = RumConfiguration.Builder(applicationId)
    .setErrorEventMapper { event ->
        if (event.error.message.contains("password")) {
            null                        // drop the event
        } else {
            event                       // keep (optionally mutate first)
        }
    }
    .build()
```

### iOS

Set the `errorEventMapper` closure on `RUM.Configuration`:

```swift
RUM.enable(
    with: RUM.Configuration(
        applicationID: "<application id>",
        errorEventMapper: { event in
            if event.error.message.contains("password") {
                return nil              // drop the event
            }
            return event                // keep (optionally mutate first)
        }
    )
)
```

On iOS, `Authorization` and `Cookie` request headers are never captured in the first place, so those never reach the mapper. For the complete data-control model across all three platforms — consent gating, encryption at rest, and replay masking — see [Security & Privacy](./security-privacy.md).

## Verify error tracking works

1. Ship a build with crash reporting enabled and your mapping artifacts uploaded for that `version`.
2. Trigger a handled error (call `addError`) and confirm it appears under **Error Tracking** in OpenObserve, grouped into an issue.
3. Force a test crash, reopen the app so the report uploads, and confirm the crash appears with a **symbolicated** stack trace — real file names and line numbers, not offsets.
4. Check that occurrences of the same error collapse into one issue with a rising count, and that any custom fingerprints group as you intended.

If crashes appear but stacks are unreadable, the mapping artifact for that exact build was not uploaded or was keyed to a different version. If nothing appears at all, confirm crash reporting is actually enabled for the platform (it is a separate switch) and that tracking consent is `granted`.

## What's next

- [Performance Monitoring](./performance-monitoring.md) — ANRs and app hangs also show up as vitals; correlate them with slow frames and long tasks.
- [Security & Privacy](./security-privacy.md) — event mappers, consent, and encryption in depth.
- [Best Practices](./best-practices.md) — release health, crash-free targets, and alerting on error spikes.
- Per-platform setup: [React Native](./react-native.md), [Android](./android.md), [iOS](./ios.md).

## Frequently asked questions

### What is the difference between a handled error and a crash?

A handled error is an exception your code caught and recovered from — you report it explicitly with addError so you can see failures the user never noticed. A crash is an unhandled fault that terminates the process: an uncaught JavaScript exception, a native signal like a segfault, an unhandled Kotlin or Swift exception, an Android ANR, or an iOS watchdog termination. OpenObserve RUM records both, but crashes end the session while handled errors do not.

### Do I need to enable crash reporting separately from RUM?

It depends on the platform. On React Native you set nativeCrashReportEnabled to true in rumConfiguration. On Android, JVM crash reporting is on by default through core configuration (setCrashReportsEnabled defaults to true), and you additionally call NdkCrashReports.enable() for native C/C++ crashes. On iOS you import OpenObserveCrashReporting and call CrashReporting.enable() after initializing the SDK. RUM being enabled is not enough on its own for iOS crash capture.

### Why are my stack traces unreadable in OpenObserve?

Release builds are minified, obfuscated, and stripped of symbols, so raw crash stacks show mangled names and memory offsets. To get readable traces you upload the mapping artifacts your build produced: JavaScript source maps for React Native, dSYM files for iOS, and ProGuard/R8 mapping plus NDK symbol files for Android. OpenObserve uses these to reverse the transformation and show original file names, line numbers, and symbols.

### How are errors grouped into issues?

OpenObserve groups similar errors into a single issue using a fingerprint derived from the error type, message, and stack frames, so a thousand occurrences of the same bug become one issue with a count. When the automatic grouping is too coarse or too fine, you can override it with a custom fingerprint: pass the fingerprint argument on React Native's addError, or set a fingerprint attribute through an error event mapper on Android and iOS.

### Can I stop sensitive data from leaving the device in an error report?

Yes. Every platform exposes an error event mapper — a function that receives each error event before it is sent. Return a modified event to redact fields like messages, stack contents, or attributes, or return null to drop the event entirely. This runs on-device, so scrubbed data never reaches the network. See the Security & Privacy guide for the full data-control model.

### Does OpenObserve capture Android ANRs and iOS app hangs?

Yes. On Android, non-fatal ANRs are captured when you call trackNonFatalAnrs(true) on the RUM configuration, and fatal ANRs surface through crash reporting. On iOS, app hangs are captured when you set an appHangThreshold on the RUM configuration; hangs longer than the threshold are recorded as errors. Both are reported as RUM errors with the blocking stack trace attached.

### Are handled errors counted against my crash-free rate?

No. Crash-free session and crash-free user rates are computed only from fatal crashes that terminate the app, not from handled errors you report with addError. Handled errors show up in error tracking and can be trended and alerted on, but they do not lower your crash-free metrics. This lets you instrument recoverable failures liberally without distorting release-health numbers.
