---
title: React Native
description: Add OpenObserve RUM to a React Native app — install the SDK, initialize at startup, and enable automatic instrumentation for screens, taps, and network calls.
---

# React Native RUM Integration

This guide walks through adding [OpenObserve](https://openobserve.ai) Real User Monitoring to a React Native app end to end: installing the SDK, initializing it at startup, turning on automatic instrumentation for screens, taps, and network calls, reporting errors and crashes, and controlling privacy and data volume. The React Native SDK sits on top of the native OpenObserve Android and iOS SDKs, so your JavaScript app gets native-grade crash reporting and instrumentation without leaving React Native.

New to mobile RUM in general? Start with the [Mobile RUM Overview](./index.md) for the concepts (sessions, views, actions, resources, errors) that this guide assumes.

!!! note "Version (Beta)"

    The React Native SDK is published as `0.1.1` on npm. Pin the exact version and test upgrades deliberately, since configuration details can still change across early `0.1.x` releases.

## What you get

Once integrated, OpenObserve RUM automatically captures:

- **Screens (views)** — via React Navigation, react-native-navigation, or manual calls.
- **User actions** — taps, scrolls, swipes, and back gestures, named from accessibility labels or element props.
- **Network resources** — `fetch` and `XMLHttpRequest` calls with timing, status, and size, plus distributed tracing to your first-party backends.
- **JavaScript errors** — unhandled JS exceptions with stack traces.
- **Native crashes** — iOS and Android crashes, when native crash reporting is enabled.
- **Mobile vitals** — long tasks, app hangs, ANRs, memory warnings, and frustration signals.

## Prerequisites

- A React Native app (`react >= 16.13.1`, `react-native >= 0.63.4 < 1.0`).
- An OpenObserve instance — [OpenObserve Cloud](https://cloud.openobserve.ai) or self-hosted. For local testing, one container is enough:

```bash
docker run -d --name openobserve \
  -p 5080:5080 \
  -e ZO_ROOT_USER_EMAIL="root@example.com" \
  -e ZO_ROOT_USER_PASSWORD="Complexpass#123" \
  public.ecr.aws/zinclabs/openobserve:latest
```

- Your **client token**, **RUM application id**, and **ingestion endpoint** from **Data → Data Sources → Real User Monitoring** in the OpenObserve UI.
- CocoaPods for iOS builds.

## Step 1 — Install the SDK

Add the core package:

```bash
npm install @openobserve/mobile-react-native
# or
yarn add @openobserve/mobile-react-native
```

Install iOS native pods (Android autolinks, no extra step):

```bash
npx pod-install
# or: cd ios && pod install
```

Optionally add companion packages for the features you need:

```bash
# Automatic screen tracking for React Navigation
npm install @openobserve/mobile-react-navigation

# Session Replay
npm install @openobserve/mobile-react-native-session-replay
```

## Step 2 — Initialize OpenObserve RUM

Configure the SDK once, as early as possible in your app's lifecycle, and wrap your app tree in `OpenObserveProvider`. Build the configuration with `OpenObserveProviderConfiguration`:

```tsx
// App.tsx
import React from 'react';
import {
  OpenObserveProvider,
  OpenObserveProviderConfiguration,
  TrackingConsent,
  SdkVerbosity,
  BatchSize,
  UploadFrequency,
} from '@openobserve/mobile-react-native';

const OPENOBSERVE_ENDPOINT = 'https://your-openobserve-instance:5080';

const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',       // clientToken from Data → Data Sources → Real User Monitoring
  'production',              // env
  TrackingConsent.GRANTED,  // pending | granted | not_granted
  {
    batchSize: BatchSize.MEDIUM,
    uploadFrequency: UploadFrequency.AVERAGE,
    rumConfiguration: {
      applicationId: 'YOUR_APPLICATION_ID',
      customEndpoint: OPENOBSERVE_ENDPOINT,
      // Automatic instrumentation — off by default, turn on what you want:
      trackInteractions: true,
      trackResources: true,
      trackErrors: true,
      sessionSampleRate: 100,
      nativeCrashReportEnabled: true,
      // Link app requests to backend traces:
      firstPartyHosts: [{ match: 'api.example.com', propagatorTypes: ['tracecontext'] }],
    },
    logsConfiguration: { customEndpoint: OPENOBSERVE_ENDPOINT },
    traceConfiguration: { customEndpoint: OPENOBSERVE_ENDPOINT },
  },
);
config.service = 'com.example.app';
config.version = '1.0.0';
config.verbosity = SdkVerbosity.DEBUG; // remove or lower in production

export default function App() {
  return (
    <OpenObserveProvider configuration={config}>
      {/* your navigation container and app tree */}
    </OpenObserveProvider>
  );
}
```

That single provider initializes the SDK, enables RUM, and starts the automatic instrumentation you turned on. Data now flows to your OpenObserve instance.

!!! note "Consent gating"

    Nothing is collected until tracking consent is `granted`. If you show a consent dialog, initialize with `TrackingConsent.PENDING` and call `OoSdkReactNative.setTrackingConsent(TrackingConsent.GRANTED)` once the user agrees. See [Security & Privacy](./security-privacy.md).

## Step 3 — Configuration options

### Core options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientToken` | string | — (required) | Ingestion credential from **Data → Data Sources → Real User Monitoring**. |
| `env` | string | — (required) | Environment tag, e.g. `production`, `staging`. |
| `trackingConsent` | `TrackingConsent` | `granted` | `pending`, `granted`, or `not_granted`. |
| `service` | string | app bundle id | Service/app identifier used to group data. |
| `version` | string | app version | Release version — used for release health. |
| `batchSize` | `BatchSize` | `MEDIUM` | `SMALL` / `MEDIUM` / `LARGE` — how much to buffer per upload. |
| `uploadFrequency` | `UploadFrequency` | `AVERAGE` | `FREQUENT` / `AVERAGE` / `RARE` — how often to upload. |
| `verbosity` | `SdkVerbosity` | off | SDK internal log level (`debug`/`info`/`warn`/`error`). |
| `proxyConfiguration` | `ProxyConfiguration` | — | Route ingestion through a proxy. |

### RUM options (`rumConfiguration`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `applicationId` | string | — (required) | RUM application id from **Data → Data Sources → Real User Monitoring**. |
| `customEndpoint` | string | — | Your OpenObserve instance base URL. |
| `trackInteractions` | boolean | `false` | Auto-capture taps/gestures as actions. |
| `trackResources` | boolean | `false` | Auto-capture `fetch`/XHR network requests. |
| `trackErrors` | boolean | `false` | Auto-capture unhandled JavaScript errors. |
| `sessionSampleRate` | number | `100` | Percentage of sessions to keep (0–100). |
| `resourceTraceSampleRate` | number | `100` | Percentage of resources to trace end-to-end. |
| `nativeCrashReportEnabled` | boolean | `false` | Capture native iOS/Android crashes. |
| `nativeViewTracking` | boolean | `false` | Track native views (UIKit/Activity) in addition to JS. |
| `longTaskThresholdMs` | number \| false | `0` | JS long-task threshold; `false` disables. |
| `nativeLongTaskThresholdMs` | number | `200` | Native long-task/ANR threshold. |
| `trackFrustrations` | boolean | `true` | Detect rage taps and other frustration signals. |
| `trackBackgroundEvents` | boolean | `false` | Record events while the app is backgrounded. |
| `vitalsUpdateFrequency` | `VitalsUpdateFrequency` | `AVERAGE` | Mobile-vitals sampling cadence (`NEVER` to disable). |
| `firstPartyHosts` | `FirstPartyHost[]` | `[]` | Hosts to inject trace headers for. |
| `actionEventMapper` / `errorEventMapper` / `resourceEventMapper` | function \| null | `null` | Scrub or drop events before send. |

## Step 4 — Track screens (views)

### With React Navigation

Install `@openobserve/mobile-react-navigation` and start tracking once you have a navigation container ref:

```tsx
import { useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { OoRumReactNavigationTracking } from '@openobserve/mobile-react-navigation';

function Root() {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        OoRumReactNavigationTracking.startTrackingViews(navigationRef);
      }}
    >
      {/* screens */}
    </NavigationContainer>
  );
}
```

This starts and stops a RUM view automatically on every navigation, including Android hardware back-press exits. Stop tracking with `OoRumReactNavigationTracking.stopTrackingViews(navigationRef)`.

### Manually

When automatic tracking does not fit (custom navigators, modals, tab changes you want named yourself), drive views directly:

```tsx
import { OoRum } from '@openobserve/mobile-react-native';

await OoRum.startView('checkout', 'Checkout');
// ...user is on the screen...
await OoRum.stopView('checkout');
```

## Step 5 — Track user actions

With `trackInteractions: true`, taps and gestures are captured automatically and named from the element's `accessibilityLabel` (or a custom `actionNameAttribute` prop you configure). To record actions explicitly:

```tsx
import { OoRum, RumActionType } from '@openobserve/mobile-react-native';

await OoRum.addAction(RumActionType.TAP, 'Add to cart', { productId: 'sku-42' });
```

`RumActionType` values: `TAP`, `SCROLL`, `SWIPE`, `BACK`, `CUSTOM`.

## Step 6 — Track network requests

With `trackResources: true`, the SDK proxies `fetch` and `XMLHttpRequest` and records each call as a RUM resource with URL, method, status, size, and timing. For requests to hosts you list in `firstPartyHosts`, it injects W3C `tracecontext` headers so the resource links to the backend trace in OpenObserve — giving you one continuous trace from tap to server.

To record a resource manually (for a non-HTTP transport, for example):

```tsx
import { OoRum } from '@openobserve/mobile-react-native';

await OoRum.startResource('req-1', 'GET', 'https://api.example.com/cart');
// ...request completes...
await OoRum.stopResource('req-1', 200, 'fetch', 1024);
```

`propagatorTypes` for first-party hosts can be `tracecontext` (W3C — what OpenObserve reads), `b3`, or `b3multi`.

## Step 7 — Report errors

With `trackErrors: true`, unhandled JavaScript exceptions are captured automatically. Report handled errors yourself so you can see failures that you caught and recovered from:

```tsx
import { OoRum, ErrorSource } from '@openobserve/mobile-react-native';

try {
  await checkout();
} catch (e) {
  await OoRum.addError(
    (e as Error).message,
    ErrorSource.SOURCE,
    (e as Error).stack ?? '',
    { screen: 'checkout' },
  );
}
```

`ErrorSource` values: `NETWORK`, `SOURCE`, `CONSOLE`, `WEBVIEW`, `CUSTOM`. For crash symbolication and error grouping, see [Error & Crash Tracking](./error-tracking.md).

## Step 8 — User identity and global context

Attach the logged-in user so you can measure user-level impact (respecting consent). `id` is required:

```tsx
import { OoSdkReactNative } from '@openobserve/mobile-react-native';

// after login
OoSdkReactNative.setUserInfo({
  id: 'user-123',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  plan: 'premium',
});

// on logout
OoSdkReactNative.clearUserInfo();
```

Add global attributes that attach to every RUM event, log, and span — useful for release channel, feature flags, or A/B buckets:

```tsx
OoSdkReactNative.addAttribute('feature_flag.new_checkout', true);
OoSdkReactNative.addAttribute('build.channel', 'beta');
```

## Step 9 — Logs (optional)

The same SDK forwards structured logs to OpenObserve:

```tsx
import { OoLogs } from '@openobserve/mobile-react-native';

OoLogs.info('Checkout started', { cartValue: 89.9 });
OoLogs.error('Payment declined', { reason: 'insufficient_funds' });
```

Logs are correlated with the active RUM session, so you can pivot from a session to its logs in OpenObserve.

## Step 10 — Session Replay (optional)

Add `@openobserve/mobile-react-native-session-replay` to record privacy-first playback of user sessions:

```tsx
import { SessionReplay, TextAndInputPrivacyLevel, TouchPrivacyLevel } from '@openobserve/mobile-react-native-session-replay';

await SessionReplay.enable({
  replaySampleRate: 20, // replay is heavier — sample lower than sessions
  textAndInputPrivacyLevel: TextAndInputPrivacyLevel.MASK_ALL,
  touchPrivacyLevel: TouchPrivacyLevel.HIDE,
});
```

Wrap any subtree you never want recorded in `<OoPrivacyView>`. Replay defaults are privacy-preserving (all text and inputs masked, touches hidden). See [Security & Privacy](./security-privacy.md) for the full privacy model.

## Performance and overhead

The SDK is designed to stay out of your app's way:

- **Off the main thread.** Collection, batching, and upload happen in the background.
- **Batched and buffered.** Events are grouped and written to disk, then uploaded on the `uploadFrequency` cadence; if the device is offline, they wait and retry rather than being lost.
- **You control volume.** `sessionSampleRate`, `resourceTraceSampleRate`, `replaySampleRate`, and larger `batchSize` / rarer `uploadFrequency` all reduce network and battery use.
- **Session Replay is the heaviest feature** — keep its sample rate well below your session sample rate.

See [Best Practices](./best-practices.md) for production tuning and cost control.

## Verify it works

1. Run the app on a device or simulator (a debug build is fine).
2. Navigate a few screens, tap around, and trigger a network request.
3. In OpenObserve, open **RUM** and confirm your session appears with views, actions, and resources.
4. Force a test error and confirm it shows under **Error Tracking**.

If nothing appears, check the SDK logs (`SdkVerbosity.DEBUG`), verify the `customEndpoint` matches your instance, confirm the client token and application id are correct, and make sure tracking consent is `granted`.

## Troubleshooting

- **No data in OpenObserve.** Confirm `customEndpoint` is reachable from the device, the client token is valid, and consent is `granted`. Enable `SdkVerbosity.DEBUG` and watch the native logs.
- **iOS build fails after install.** Run `npx pod-install` again; make sure your `Podfile` platform is iOS 12+.
- **Screens not tracked.** Ensure `startTrackingViews` runs after the navigation container is ready, or switch to manual `startView`/`stopView`.
- **Stack traces are minified.** Upload JavaScript source maps and native mapping/symbol files for the release build — see [Error & Crash Tracking](./error-tracking.md).
- **Too much data / cost.** Lower `sessionSampleRate` and `replaySampleRate`; see [Best Practices](./best-practices.md).

## What's next

- [Performance Monitoring](./performance-monitoring.md) — read mobile vitals, screen timing, and network performance.
- [Error & Crash Tracking](./error-tracking.md) — symbolication, source maps, and error grouping.
- [Security & Privacy](./security-privacy.md) — consent, masking, and data scrubbing.
- [Best Practices](./best-practices.md) — sampling, cost, and release health.
- [Android](./android.md) and [iOS](./ios.md) — if you also ship fully native apps.

## Frequently asked questions

### Which package do I install for React Native RUM?

The core package is @openobserve/mobile-react-native. It wraps the native Android and iOS SDKs, so you get native crash reporting, native view tracking, and native network instrumentation underneath the JavaScript layer. Optional companion packages add React Navigation tracking (@openobserve/mobile-react-navigation), Session Replay (@openobserve/mobile-react-native-session-replay), and more.

### Do I need to run pod install after adding the SDK?

Yes, on iOS. The React Native package brings native iOS pods that are linked via autolinking, so after npm install you run 'npx pod-install' (or 'cd ios && pod install'). Android autolinks with no extra step. If you use the New Architecture, the SDK supports it when RCT_NEW_ARCH_ENABLED=1.

### Where do I get the client token and application id?

Both come from **Data → Data Sources → Real User Monitoring** in your OpenObserve instance. The client token authenticates ingestion and the application id identifies your app in RUM. You pass the client token to OpenObserveProviderConfiguration and the application id to rumConfiguration.applicationId, and point rumConfiguration.customEndpoint at your OpenObserve instance base URL.

### How do I track screens with React Navigation?

Install @openobserve/mobile-react-navigation and call OoRumReactNavigationTracking.startTrackingViews(navigationRef) once you have a navigation container ref. It automatically starts and stops RUM views as the user navigates, including Android hardware back-press exits. You can also track views manually with OoRum.startView / OoRum.stopView.

### Does the React Native SDK capture native crashes?

Yes, when you set nativeCrashReportEnabled: true in rumConfiguration. That enables the underlying native crash reporters on both platforms, so native iOS and Android crashes are captured in addition to JavaScript errors. To get readable stack traces you upload JavaScript source maps and native symbol/mapping files as part of your release build.

### How do I reduce the volume of data sent to OpenObserve?

Use sessionSampleRate (0–100) to keep a percentage of sessions, resourceTraceSampleRate to sample distributed traces, and — if you enable Session Replay — a separate replaySampleRate. You can also raise batchSize and lower uploadFrequency to batch more aggressively, and use event mappers to drop or redact specific events before they leave the device.

### Can I attach the logged-in user to RUM sessions?

Yes. Call OoSdkReactNative.setUserInfo({ id, name, email, ...extra }) after login (id is required) and OoSdkReactNative.clearUserInfo() on logout. User info is attached to all subsequent RUM events, logs, and traces. Only collect identifying data with the appropriate consent — set TrackingConsent accordingly.
