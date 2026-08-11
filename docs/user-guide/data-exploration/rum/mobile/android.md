---
title: Android
description: Add OpenObserve RUM to a native Android app — add the Gradle dependencies, initialize the SDK at startup, and instrument screens, taps, and OkHttp calls.
---

# Android RUM Integration

This guide walks through adding [OpenObserve](https://openobserve.ai) Real User Monitoring to a native Android app end to end: adding the Gradle dependencies, initializing the SDK at startup, turning on automatic instrumentation for screens, taps, and OkHttp network calls, reporting errors and crashes, and controlling privacy and data volume. Everything is Kotlin, targets the standard Android build system, and sends to the same OpenObserve instance you already use for logs, metrics, and traces.

New to mobile RUM in general? Start with the [Mobile RUM Overview](./index.md) for the concepts — sessions, views, actions, resources, errors — that this guide assumes.

:::warning[Alpha status]

The Android SDK is currently published as `0.1.0-alpha5`. It is ready to integrate and evaluate — pin the exact version and test upgrades, since some configuration details may change before the stable release.
:::
## What you get

Once integrated, OpenObserve RUM automatically captures:

- **Screens (views)** — each `Activity`, `Fragment`, or Jetpack Navigation destination, with load and render timing, via a view-tracking strategy.
- **User actions** — taps, scrolls, and swipes, named from resource ids or accessibility labels.
- **Network resources** — `OkHttp` requests with timing, status, and size, plus distributed tracing to your first-party backends.
- **Errors** — handled and unhandled JVM exceptions with stack traces.
- **Crashes** — JVM crashes by default, plus native NDK crashes when you enable them.
- **Mobile vitals** — long tasks, non-fatal ANRs, and frustration signals like rage taps.

## Prerequisites

- An Android app project with:
  - **minSdk 23** or higher (some auto-instrumentation requires API 29).
  - **compileSdk 36**.
  - **Kotlin 2.0.21** and **Java 11** source/target compatibility.
- An OpenObserve instance — [OpenObserve Cloud](https://cloud.openobserve.ai) or self-hosted. For local testing, one container is enough:

```bash
docker run -d --name openobserve \
  -p 5080:5080 \
  -e ZO_ROOT_USER_EMAIL="root@example.com" \
  -e ZO_ROOT_USER_PASSWORD="Complexpass#123" \
  public.ecr.aws/zinclabs/openobserve:latest
```

- Your **client token**, **RUM application id**, and **ingestion endpoint** from **Data → Data Sources → Real User Monitoring** in the OpenObserve UI.

## Step 1 — Add the Gradle dependencies

The SDK is published to Maven Central under the `ai.openobserve` group. Add the core and RUM artifacts to your app module's `build.gradle`, plus any optional artifacts for the features you want:

```groovy
// app/build.gradle
dependencies {
    def openobserveVersion = "0.1.0-alpha5"

    // Required
    implementation "ai.openobserve:o2-sdk-android-core:$openobserveVersion"
    implementation "ai.openobserve:o2-sdk-android-rum:$openobserveVersion"

    // Optional — add what you need
    implementation "ai.openobserve:o2-sdk-android-okhttp:$openobserveVersion"          // network tracking
    implementation "ai.openobserve:o2-sdk-android-ndk:$openobserveVersion"             // native crash reporting
    implementation "ai.openobserve:o2-sdk-android-logs:$openobserveVersion"            // logs
    implementation "ai.openobserve:o2-sdk-android-trace:$openobserveVersion"           // tracing
    implementation "ai.openobserve:o2-sdk-android-session-replay:$openobserveVersion"  // Session Replay
}
```

Make sure `mavenCentral()` is in your repositories (in `settings.gradle`'s `dependencyResolutionManagement` block on modern Gradle, or the top-level `build.gradle` on older setups). If you use a **version catalog** (`gradle/libs.versions.toml`), declare the version once and reference the artifacts with `libs.` accessors instead — pin all `o2-sdk-android-*` artifacts to the same version so core, RUM, and the optional modules stay in lockstep.

Confirm your module sets Java 11 compatibility:

```groovy
android {
    compileSdk 36
    defaultConfig { minSdk 23 }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
    kotlinOptions { jvmTarget = "11" }
}
```

## Step 2 — Initialize OpenObserve RUM

Initialize the SDK once, as early as possible — in your `Application.onCreate()`. You build a core `Configuration`, call `OpenObserve.initialize`, then build a `RumConfiguration` and call `Rum.enable`. Keep your client token and application id out of source control (for example in `BuildConfig` fields fed from Gradle properties).

```kotlin
// OpenObserveApp.kt
import android.app.Application
import android.util.Log
import com.openobserve.android.OpenObserve
import com.openobserve.android.core.configuration.BatchSize
import com.openobserve.android.core.configuration.Configuration
import com.openobserve.android.core.configuration.UploadFrequency
import com.openobserve.android.privacy.TrackingConsent
import com.openobserve.android.rum.Rum
import com.openobserve.android.rum.RumConfiguration
import com.openobserve.android.rum.tracking.ActivityViewTrackingStrategy

class OpenObserveApp : Application() {

    override fun onCreate() {
        super.onCreate()

        val config = Configuration.Builder(
                clientToken = BuildConfig.OPENOBSERVE_CLIENT_TOKEN,
                env = "production",
                variant = "",                 // build flavor, optional
                service = "com.example.app",
            )
            .setBatchSize(BatchSize.MEDIUM)
            .setUploadFrequency(UploadFrequency.AVERAGE)
            .setFirstPartyHosts(listOf("api.example.com"))
            .build()

        OpenObserve.setVerbosity(Log.VERBOSE) // lower or remove in production
        OpenObserve.initialize(this, config, TrackingConsent.GRANTED)

        val rumConfig = RumConfiguration.Builder(BuildConfig.OPENOBSERVE_RUM_APPLICATION_ID)
            .useCustomEndpoint("https://your-openobserve-instance:5080")
            .trackUserInteractions()
            .trackLongTasks(250L)
            .trackNonFatalAnrs(true)
            .setSessionSampleRate(100f)
            .useViewTrackingStrategy(ActivityViewTrackingStrategy(true))
            .build()
        Rum.enable(rumConfig)
    }
}
```

Register the `Application` class in your manifest so it actually runs:

```xml
<application
    android:name=".OpenObserveApp"
    ...>
```

That is the whole setup. `OpenObserve.initialize` starts the core SDK, `Rum.enable` turns on RUM with the automatic instrumentation you configured, and data begins flowing to your OpenObserve instance.

:::note[The connection model]

You pass the **client token** to `Configuration.Builder`, the **RUM application id** to `RumConfiguration.Builder`, and point `useCustomEndpoint` at your OpenObserve instance's base URL — the SDK appends the RUM intake path automatically. There is no separate "organization" field; your organization is part of the ingestion endpoint and token. The built-in `useSite(...)` managed-cloud presets (US1, EU1, and so on) are still being wired up for OpenObserve Cloud in this alpha, so use the custom-endpoint approach for self-hosted and today's setups.
:::
:::note[Consent gating]

Nothing is collected until tracking consent is `GRANTED`. If you show a consent dialog, initialize with `TrackingConsent.PENDING` and call `OpenObserve.setTrackingConsent(TrackingConsent.GRANTED)` once the user agrees. See [Security & Privacy](./security-privacy.md).
:::
## Step 3 — Configuration options

### Core options (`Configuration.Builder`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientToken` | String | — (required) | Ingestion credential from **Data → Data Sources → Real User Monitoring**. |
| `env` | String | — (required) | Environment tag, e.g. `production`, `staging`. |
| `variant` | String | `""` | Build flavor / variant, optional. |
| `service` | String | app package id | Service/app identifier used to group data. |
| `setVersion(String)` | String | app version | Release version — used for release health. |
| `setBatchSize(BatchSize)` | `BatchSize` | `MEDIUM` | `SMALL` / `MEDIUM` / `LARGE` — how much to buffer per upload. |
| `setUploadFrequency(UploadFrequency)` | `UploadFrequency` | `AVERAGE` | `FREQUENT` / `AVERAGE` / `RARE` — how often to upload. |
| `setFirstPartyHosts(List<String>)` | `List<String>` | `[]` | Hosts to inject trace headers for. |
| `setCrashReportsEnabled(Boolean)` | Boolean | `true` | Capture unhandled JVM crashes. |
| `setEncryption(Encryption)` | `Encryption` | — | Encrypt buffered data at rest on disk. |
| `setProxy(...)` | — | — | Route ingestion through a proxy. |
| `setUseDeveloperModeWhenDebuggable(...)` | Boolean | — | More verbose behavior on debuggable builds. |
| `setAdditionalConfiguration(Map)` | Map | `{}` | Advanced/internal configuration keys. |

`TrackingConsent` (passed to `initialize`) is `PENDING`, `GRANTED`, or `NOT_GRANTED`.

### RUM options (`RumConfiguration.Builder`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `RumConfiguration.Builder(applicationId)` | String | — (required) | RUM application id from **Data → Data Sources → Real User Monitoring**. |
| `useCustomEndpoint(url)` | String | — | Your OpenObserve instance base URL. |
| `setSessionSampleRate(Float)` | Float 0–100 | `100` | Percentage of sessions to keep. |
| `setTelemetrySampleRate(Float)` | Float 0–100 | — | Percentage of internal SDK telemetry to keep. |
| `trackUserInteractions(...)` | — | off | Auto-capture taps/gestures as actions. |
| `useViewTrackingStrategy(strategy)` | `ViewTrackingStrategy?` | none | How screens become views (see below). |
| `trackLongTasks(thresholdMs)` | Long | `100` | Report main-thread stalls above the threshold. |
| `trackNonFatalAnrs(Boolean)` | Boolean | — | Capture non-fatal ANRs. |
| `trackBackgroundEvents(Boolean)` | Boolean | `false` | Record events while the app is backgrounded. |
| `trackFrustrations(Boolean)` | Boolean | `true` | Detect rage taps and other frustration signals. |
| `trackAnonymousUser(Boolean)` | Boolean | — | Attach a stable anonymous id to sessions. |
| `collectAccessibility(Boolean)` | Boolean | — | Collect device accessibility settings. |
| `setVitalsUpdateFrequency(...)` | — | — | Mobile-vitals sampling cadence. |
| `setViewEventMapper` / `setResourceEventMapper` / `setActionEventMapper` / `setErrorEventMapper` / `setLongTaskEventMapper` | mapper | — | Scrub or drop events before send. |

## Step 4 — Track screens (views)

Pass a view-tracking strategy to `useViewTrackingStrategy`. The right one depends on how your app is structured (all strategies live in `com.openobserve.android.rum.tracking`):

```kotlin
import com.openobserve.android.rum.tracking.ActivityViewTrackingStrategy
import com.openobserve.android.rum.tracking.FragmentViewTrackingStrategy
import com.openobserve.android.rum.tracking.MixedViewTrackingStrategy
import com.openobserve.android.rum.tracking.NavigationViewTrackingStrategy

// One view per Activity (pass true to also track lifecycle timing):
.useViewTrackingStrategy(ActivityViewTrackingStrategy(true))

// One view per Fragment:
.useViewTrackingStrategy(FragmentViewTrackingStrategy(true))

// Both Activities and Fragments:
.useViewTrackingStrategy(MixedViewTrackingStrategy(true))

// Jetpack Navigation — track each destination of a nav graph:
.useViewTrackingStrategy(NavigationViewTrackingStrategy(R.id.nav_host_fragment, true))
```

- **`ActivityViewTrackingStrategy`** — best for Activity-based navigation.
- **`FragmentViewTrackingStrategy`** — for single-Activity apps that swap Fragments.
- **`MixedViewTrackingStrategy`** — when you use both.
- **`NavigationViewTrackingStrategy`** — for Jetpack Navigation; pass the nav-host id, whether to track arguments, and optionally a `ComponentPredicate` to filter or rename destinations.

### Manually

When automatic tracking does not fit — custom transitions, dialogs, or a screen you want named yourself — drive views directly through the RUM monitor:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor

val rum = GlobalRumMonitor.get()
rum.startView("checkout", "Checkout")
// ...user is on the screen...
rum.stopView("checkout")
```

## Step 5 — Track user actions

With `trackUserInteractions()` enabled, taps, scrolls, and swipes are captured automatically and named from the target view's resource id or accessibility label. To record an action explicitly:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor
import com.openobserve.android.rum.RumActionType

GlobalRumMonitor.get().addAction(
    RumActionType.TAP,
    "Add to cart",
    mapOf("productId" to "sku-42"),
)
```

`RumActionType` values: `TAP`, `SCROLL`, `SWIPE`, `CLICK`, `BACK`, `CUSTOM`. For actions that span time, use `startAction` and `stopAction` with the same type and name.

## Step 6 — Track network requests with OkHttp

Add the `o2-sdk-android-okhttp` artifact and instrument your `OkHttpClient` with `configureOpenObserveInstrumentation`. This records every request as a RUM resource — URL, method, status, size, and timing — and, for your traced hosts, injects W3C trace-context headers so the resource links to the backend trace in OpenObserve.

```kotlin
import com.openobserve.android.okhttp.configureOpenObserveInstrumentation
import com.openobserve.android.okhttp.rum.RumNetworkInstrumentationConfiguration
import com.openobserve.android.okhttp.apm.ApmNetworkInstrumentationConfiguration
import okhttp3.OkHttpClient

val tracedHosts = listOf("api.example.com")

val client = OkHttpClient.Builder()
    .configureOpenObserveInstrumentation(
        rumInstrumentationConfiguration = RumNetworkInstrumentationConfiguration(),
        apmInstrumentationConfiguration = ApmNetworkInstrumentationConfiguration(tracedHosts),
    )
    .build()
```

The RUM instrumentation records the resource; the APM instrumentation propagates distributed tracing to the hosts you list, so a slow screen links straight to the backend trace behind it. Reuse this single instrumented client throughout your app. (Lower-level `OpenObserveInterceptor` and `TracingInterceptor` are also available if you need finer control over interceptor ordering.)

To record a resource manually — for a non-OkHttp transport, for example:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor
import com.openobserve.android.rum.RumResourceKind
import com.openobserve.android.rum.RumResourceMethod

val rum = GlobalRumMonitor.get()
rum.startResource("req-1", RumResourceMethod.GET, "https://api.example.com/cart", emptyMap())
// ...request completes...
rum.stopResource("req-1", 200, 1024L, RumResourceKind.NATIVE, emptyMap())
```

## Step 7 — Report errors

Unhandled JVM crashes are captured automatically (core `setCrashReportsEnabled` is on by default). Report handled errors yourself so you can see failures you caught and recovered from:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor
import com.openobserve.android.rum.RumErrorSource

try {
    checkout()
} catch (e: Exception) {
    GlobalRumMonitor.get().addError(
        "Checkout failed",
        RumErrorSource.SOURCE,
        e,                                 // Throwable — gives you the stack trace
        mapOf("screen" to "checkout"),
    )
}
```

`RumErrorSource` distinguishes error origins (source, network, and so on). When you only have a stack-trace string rather than a `Throwable`, use `addErrorWithStacktrace`. For failed network calls, `stopResourceWithError` records the resource and its error together. For crash symbolication and error grouping, see [Error & Crash Tracking](./error-tracking.md).

## Step 8 — User identity and global context

Attach the logged-in user so you can measure user-level impact (respecting consent). `id` is required; the rest are optional:

```kotlin
import com.openobserve.android.OpenObserve

// after login
OpenObserve.setUserInfo(
    id = "user-123",
    name = "Ada Lovelace",
    email = "ada@example.com",
    extraInfo = mapOf("plan" to "premium"),
)

// on logout
OpenObserve.clearUserInfo()
```

Add global attributes that attach to every RUM event, log, and span — useful for release channel, feature flags, or A/B buckets. Set these on the RUM monitor:

```kotlin
import com.openobserve.android.rum.GlobalRumMonitor

val rum = GlobalRumMonitor.get()
rum.addAttribute("feature_flag.new_checkout", true)
rum.addAttribute("build.channel", "beta")
```

You can also record feature-flag evaluations with `rum.addFeatureFlagEvaluation(name, value)`, and attach account-level context with `OpenObserve.setAccountInfo(...)`.

## Step 9 — Logs and tracing (optional)

The same SDK can forward structured logs and distributed traces to OpenObserve. Enable each product once during initialization:

```kotlin
import com.openobserve.android.logs.Logs
import com.openobserve.android.logs.LogsConfiguration
import com.openobserve.android.trace.Trace
import com.openobserve.android.trace.TraceConfiguration

Logs.enable(LogsConfiguration.Builder().build())
Trace.enable(TraceConfiguration.Builder().build())
```

Logs are correlated with the active RUM session, so you can pivot from a session to its logs in OpenObserve. Tracing pairs with the OkHttp APM instrumentation from Step 6 to give you one continuous trace from tap to backend.

## Step 10 — Native (NDK) crash reporting

JVM crashes are captured out of the box. For native C/C++ crashes — the ones that never surface a Java stack trace — add the `o2-sdk-android-ndk` artifact and enable NDK crash reporting during initialization:

```kotlin
import com.openobserve.android.ndk.NdkCrashReports

// after OpenObserve.initialize(...)
NdkCrashReports.enable()
```

This installs native signal handlers that capture crashes in your native libraries and report them to OpenObserve alongside your JVM errors and RUM sessions.

## Step 11 — Deobfuscation and symbol upload

If you ship a release build with R8/ProGuard, your stack traces arrive obfuscated, and NDK crashes arrive as raw addresses. To make them readable, OpenObserve publishes an **Android Gradle plugin** (id `io.openobserve.openobserve-sdk-android-gradle-plugin`) that uploads your R8/ProGuard **mapping files** and **NDK symbol files** as part of your build, so OpenObserve can deobfuscate and symbolicate crash reports automatically.

:::note

The plugin's build-script configuration DSL is being finalized in the current alpha. Apply the plugin id above, then follow the current setup instructions in the [SDK's GitHub repository](https://github.com/openobserve) for wiring the upload task and credentials — the exact DSL is documented there and evolving quickly. See [Error & Crash Tracking](./error-tracking.md) for how symbolicated crashes appear in OpenObserve.
:::
## Step 12 — Session Replay (optional)

Add the `o2-sdk-android-session-replay` artifact to record privacy-first playback of user sessions. Enable it with a sample rate and privacy levels:

```kotlin
import com.openobserve.android.sessionreplay.SessionReplay
import com.openobserve.android.sessionreplay.SessionReplayConfiguration
import com.openobserve.android.sessionreplay.ImagePrivacy
import com.openobserve.android.sessionreplay.TextAndInputPrivacy
import com.openobserve.android.sessionreplay.TouchPrivacy

SessionReplay.enable(
    SessionReplayConfiguration.Builder(sampleRate = 20f)   // replay is heavier — sample lower than sessions
        .setImagePrivacy(ImagePrivacy.MASK_ALL)
        .setTextAndInputPrivacy(TextAndInputPrivacy.MASK_ALL)
        .setTouchPrivacy(TouchPrivacy.HIDE)
        .build(),
)
```

The defaults are privacy-preserving: images `MASK_ALL`, text and inputs `MASK_ALL`, touches `HIDE`. Loosen them deliberately — `ImagePrivacy.MASK_LARGE_ONLY` or `MASK_NONE`, `TextAndInputPrivacy.MASK_SENSITIVE_INPUTS`, `TouchPrivacy.SHOW` — only where you are sure no sensitive data is exposed. See [Security & Privacy](./security-privacy.md) for the full privacy model.

## Performance and overhead

The SDK is designed to stay out of your app's way:

- **Off the main thread.** Collection, batching, and upload happen in the background.
- **Batched and buffered.** Events are grouped and written to disk, then uploaded on the `UploadFrequency` cadence; if the device is offline, they wait and retry rather than being lost.
- **You control volume.** `setSessionSampleRate`, a larger `BatchSize`, and a rarer `UploadFrequency` all reduce network and battery use.
- **Session Replay is the heaviest feature** — keep its sample rate well below your session sample rate.
- **Encryption at rest.** Use `setEncryption(...)` to encrypt buffered data on disk if your threat model requires it.

See [Best Practices](./best-practices.md) for production tuning and cost control.

## Verify it works

1. Build and run the app on a device or emulator (a debug build is fine).
2. Navigate a few screens, tap around, and trigger a network request through the instrumented OkHttp client.
3. In OpenObserve, open **RUM** and confirm your session appears with views, actions, and resources.
4. Force a test error (`GlobalRumMonitor.get().addError(...)`) and confirm it shows under **Error Tracking**.

If nothing appears, raise the SDK log level (`OpenObserve.setVerbosity(Log.VERBOSE)`) and watch Logcat during startup and navigation.

## Troubleshooting

- **No data in OpenObserve.** Confirm the `useCustomEndpoint` URL is reachable from the device, the client token is valid, and consent is `GRANTED`. Enable verbose logging and watch Logcat.
- **Screens not tracked.** Make sure you passed a `useViewTrackingStrategy`, and that it matches your navigation style (Activity vs. Fragment vs. Navigation). For custom flows, fall back to manual `startView` / `stopView`.
- **Network calls missing.** Confirm every request goes through the `OkHttpClient` you built with `configureOpenObserveInstrumentation` — requests on an uninstrumented client are invisible to RUM.
- **Stack traces are obfuscated.** Apply the OpenObserve Gradle plugin and upload your R8/ProGuard mapping and NDK symbol files for the release build — see Step 11 and [Error & Crash Tracking](./error-tracking.md).
- **Build fails on Java version.** Set `sourceCompatibility`/`targetCompatibility` to Java 11 and `jvmTarget = "11"`; the SDK requires Java 11.
- **Too much data / cost.** Lower `setSessionSampleRate` and the Session Replay sample rate; see [Best Practices](./best-practices.md).

## What's next

- [Performance Monitoring](./performance-monitoring.md) — read mobile vitals, screen timing, and network performance.
- [Error & Crash Tracking](./error-tracking.md) — symbolication, mapping upload, and error grouping.
- [Security & Privacy](./security-privacy.md) — consent, masking, and data scrubbing.
- [Best Practices](./best-practices.md) — sampling, cost, and release health.
- [React Native](./react-native.md) and [iOS](./ios.md) — if you also ship cross-platform or Apple apps.

## Frequently asked questions

### Which Gradle dependencies do I need for Android RUM?

At minimum you add the core and RUM artifacts from the ai.openobserve Maven group: ai.openobserve:o2-sdk-android-core and ai.openobserve:o2-sdk-android-rum. Optional artifacts add the features you need — o2-sdk-android-okhttp for network tracking, o2-sdk-android-ndk for native crash reporting, o2-sdk-android-logs and o2-sdk-android-trace for logs and tracing, and o2-sdk-android-session-replay for Session Replay. Pin the same version (currently 0.1.0-alpha5) across all of them.

### What are the minimum requirements to use the Android SDK?

The SDK targets minSdk 23 (some auto-instrumentation needs API 29), compiles against compileSdk 36, and is built with Kotlin 2.0.21 and Java 11. Your app's Gradle module needs Java 11 source and target compatibility. The SDK works with both Kotlin and Java projects, though the examples in this guide are Kotlin.

### Where do I get the client token and RUM application id?

Both come from **Data → Data Sources → Real User Monitoring** in your OpenObserve instance. The client token authenticates ingestion and the RUM application id identifies your app in RUM. You pass the client token to Configuration.Builder and the application id to RumConfiguration.Builder, then point the RUM config's custom endpoint at your OpenObserve instance base URL with useCustomEndpoint.

### How does the Android SDK track screens automatically?

Pass a view-tracking strategy to RumConfiguration.Builder via useViewTrackingStrategy. ActivityViewTrackingStrategy tracks each Activity as a view, FragmentViewTrackingStrategy tracks Fragments, MixedViewTrackingStrategy tracks both, and NavigationViewTrackingStrategy tracks destinations of a Jetpack Navigation graph. You can also drive views manually with GlobalRumMonitor.get().startView and stopView.

### Does the Android SDK capture native (NDK) crashes?

JVM crashes are captured by default through the core configuration. For native C/C++ crashes you add the o2-sdk-android-ndk artifact and call NdkCrashReports.enable() during initialization. To get readable stack traces you upload your ProGuard/R8 mapping file and NDK symbol files as part of your release build.

### How do I make stack traces readable after R8/ProGuard obfuscation?

OpenObserve publishes an Android Gradle plugin (id io.openobserve.openobserve-sdk-android-gradle-plugin) that uploads your R8/ProGuard mapping files and NDK symbol files so obfuscated stack traces are deobfuscated in OpenObserve. The plugin's build-script DSL is being finalized in the current alpha, so check the SDK's GitHub repository for the current configuration.

### How do I reduce the volume of RUM data sent to OpenObserve?

Use setSessionSampleRate on RumConfiguration.Builder to keep a percentage of sessions (0 to 100). Raise setBatchSize and lower setUploadFrequency to batch more aggressively and save battery. If you enable Session Replay, give it a lower replay sample rate than your session rate, and use the event mapper hooks to drop or redact specific events before they leave the device.
