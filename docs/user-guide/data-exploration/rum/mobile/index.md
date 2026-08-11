---
title: Mobile Overview
description: OpenObserve Mobile RUM captures screen loads, taps, network requests, errors, and native crashes from real devices across React Native, Android, and iOS.
---

# Mobile Real User Monitoring (RUM)

Mobile Real User Monitoring (RUM) tells you what your app is actually like in the hands of real users — on real devices, real OS versions, and real networks. It captures screen loads, taps and gestures, network requests, errors, native crashes, and complete session timelines, and ships them to [OpenObserve](https://openobserve.ai) where they sit alongside your logs, metrics, and traces. This overview explains what OpenObserve Mobile RUM collects, how the three SDKs fit together, and where to go next to instrument your app.

If you already run [OpenObserve RUM in the browser](../index.md), the mental model is identical — the same sessions, views, actions, resources, and errors — just sourced from native mobile apps instead of a web page.

## Why mobile RUM

Server logs and backend traces stop at the API boundary. They cannot tell you that a checkout screen took four seconds to become interactive on a mid-range Android phone, that a specific SDK update tripled your crash rate on iOS 17, or that users on a flaky network rage-tap a button that silently swallows its own error. Mobile RUM closes that gap:

- **See the real device experience.** Startup time, screen render time, slow and frozen frames, and network latency measured on actual hardware and OS versions — not a simulator, not a synthetic probe.
- **Catch what never reaches your server.** Native crashes, unhandled JavaScript exceptions, Android ANRs, and iOS app hangs are invisible in backend logs. RUM captures them with the session context that produced them.
- **Follow the whole journey.** Every crash and error is attached to the session and the exact sequence of screens, taps, and requests that led up to it — so reproduction stops being guesswork.
- **Connect mobile to backend.** When you mark your API hosts as first-party, network requests from the app propagate W3C trace context, so a slow screen links to the exact backend trace behind it — full-stack visibility from tap to database.
- **Tie technical data to users.** Attach user and account identity (respecting consent) to answer "how many users hit this crash," "which build regressed," and "which release is healthiest."

## What OpenObserve Mobile RUM collects

Across all three platforms, the SDKs organize telemetry into the same core signals:

| Signal | What it captures |
|--------|------------------|
| **Sessions** | A continuous period of user activity, with device, OS, app version, and (optionally) user identity. Everything else hangs off the session. |
| **Views** | Screen visits — an `Activity`/`Fragment` on Android, a `UIViewController`/SwiftUI view on iOS, or a navigation route in React Native — with load and render timing. |
| **Actions** | User interactions: taps, scrolls, swipes, and back gestures, named automatically or manually. |
| **Resources** | Network requests (XHR/fetch, `URLSession`, `OkHttp`) with timing, status, size, and — for first-party hosts — a link to the backend trace. |
| **Errors** | Handled and unhandled errors with message, source, and stack trace. |
| **Crashes** | Native crashes (iOS/Android), NDK/native crashes, and JavaScript crashes, symbolicated for readable stack traces. |
| **Mobile vitals** | Slow/frozen frames, app hangs (iOS), ANRs (Android), long tasks, memory warnings, and frustration signals like rage taps. |
| **Session Replay** | Optional privacy-first playback of what the user saw and did, reconstructed from the UI hierarchy. |

## The three SDKs

OpenObserve ships one SDK per mobile ecosystem. They are independent packages but produce the same RUM data model and target the same backend.

| SDK | Package | Language | Guide |
|-----|---------|----------|-------|
| **React Native** | `@openobserve/mobile-react-native` | TypeScript / JS | [React Native guide](./react-native.md) |
| **Android** | `ai.openobserve:o2-sdk-android-rum` | Kotlin / Java | [Android guide](./android.md) |
| **iOS & Apple** | `OpenObserveRUM` (Swift Package) | Swift / Obj-C | [iOS guide](./ios.md) |

The React Native SDK wraps the native Android and iOS SDKs, so a React Native app gets native crash reporting, native view tracking, and native network instrumentation underneath the JavaScript layer.

:::warning[Alpha status]

The mobile SDKs are currently early alpha releases (`0.1.0-alpha.x`). They are ready to integrate and evaluate, but pin exact versions and expect small configuration details to change before the stable release.
:::
## How it connects to OpenObserve

Every mobile SDK uses the same connection model, so once you understand it for one platform it carries over to the others. You need three things from your OpenObserve instance's **Data → Data Sources → Real User Monitoring** page:

1. A **client token** — the ingestion credential the SDK uses to authenticate.
2. A **RUM application id** — identifies this app within OpenObserve RUM.
3. Your **ingestion endpoint URL** — the base URL of your OpenObserve instance (self-hosted or [OpenObserve Cloud](https://cloud.openobserve.ai)).

You configure the SDK with the client token and application id, and point its **custom endpoint** at your instance's base URL; the SDK appends the RUM intake path automatically. There is no separate "organization" field on mobile — your organization is part of the ingestion endpoint and token. Standard fields — `env` (for example `production` or `staging`), `service` (your app identifier), and `version` — round out the configuration and let you slice data by environment and release in OpenObserve.

:::note

The built-in managed-cloud `site` presets (US1, EU1, and so on) are still being wired up for OpenObserve Cloud in this alpha. For self-hosted instances and today's setups, use the custom-endpoint approach — every platform guide shows exactly how.
:::
## What you'll do to get started

The flow is the same on every platform, and each guide walks through it end to end:

1. **Install** the SDK (npm, Gradle, or Swift Package Manager / CocoaPods).
2. **Initialize** the SDK early in app startup with your client token, application id, and endpoint.
3. **Enable RUM** and choose what to auto-instrument — views, user interactions, and network requests.
4. **Add context** — user identity, global attributes, and manual views/actions/errors where the automatic instrumentation needs help.
5. **Handle crashes** — enable crash reporting and upload symbol/mapping files so stack traces are readable.
6. **Tune privacy and volume** — set masking levels, sampling rates, and data-scrubbing hooks.
7. **Verify** the data lands in the OpenObserve RUM dashboard.

## Where to go next

- **[React Native](./react-native.md)**, **[Android](./android.md)**, **[iOS](./ios.md)** — full per-platform setup and integration guides.
- **[Performance Monitoring](./performance-monitoring.md)** — mobile vitals, screen timing, network performance, and how to read them.
- **[Error & Crash Tracking](./error-tracking.md)** — crash reporting, symbolication, error grouping, and manual error reporting.
- **[Security & Privacy](./security-privacy.md)** — consent, input masking, Session Replay privacy levels, and data scrubbing.
- **[Best Practices](./best-practices.md)** — sampling, cost control, release health, and production rollout guidance.

## Frequently asked questions

### What is Mobile Real User Monitoring?

Mobile Real User Monitoring (RUM) instruments your native or cross-platform app so it reports what real users actually experience on real devices — screen loads, taps, network calls, errors, crashes, and full session timelines. Unlike crash-only tools, RUM correlates crashes and errors with the performance and user journey that led to them, and unlike synthetic testing, it measures production traffic from real hardware, OS versions, and network conditions.

### Which platforms does OpenObserve Mobile RUM support?

There are three mobile SDKs: React Native (@openobserve/mobile-react-native), Android (ai.openobserve:o2-sdk-android-rum, Kotlin/Java), and iOS (the OpenObserveRUM Swift package, covering iOS, tvOS, macOS, and watchOS). All three share the same data model and send to the same OpenObserve RUM backend, so a React Native app and a fully native app appear side by side in the same OpenObserve instance.

### Do I need a separate backend for mobile RUM?

No. Mobile RUM ingests into the same OpenObserve instance you already use for logs, metrics, and traces. You point the SDK at your OpenObserve ingestion endpoint with a client token and a RUM application id, both available under **Data → Data Sources → Real User Monitoring**. Self-hosted and OpenObserve Cloud both work.

### How much overhead does the mobile SDK add?

The SDKs are built for production: data is collected asynchronously off the main thread, batched, compressed, and uploaded on a schedule you control (batch size and upload frequency are configurable). Events are buffered on disk so nothing is lost when the device is offline. You control volume with session sampling and, for Session Replay, a separate replay sample rate.

### Are the mobile SDKs production-ready?

The mobile SDKs are currently published as early alpha releases (0.1.0-alpha.x). The API surface is stable enough to integrate against and the data model matches OpenObserve's browser RUM, but you should pin exact versions, test upgrades, and expect some configuration details — particularly managed-cloud endpoint presets and build-time symbol upload — to be finalized in upcoming releases.

### How is Mobile RUM different from OpenObserve's browser RUM?

They are complementary and share the same concepts (sessions, views, actions, resources, errors) and the same OpenObserve backend. Browser RUM uses a JavaScript SDK for web apps; Mobile RUM uses native SDKs that additionally capture mobile-specific signals like native crashes, ANRs, app hangs, slow/frozen frames, and app-lifecycle events, and they instrument native navigation and network stacks rather than the browser.
