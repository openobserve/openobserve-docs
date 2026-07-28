---
title: RUM Setup Guide
description: Step-by-step instructions for integrating OpenObserve Real User Monitoring into browser and React Native applications.
---
This guide walks you through setting up OpenObserve RUM for both **browser** (web) and **React Native** (iOS / Android) applications.

From the **Ingestion > RUM** page, use the **Browser** / **React Native** platform switch in the card header to toggle between the two setup guides. Both platforms share the same RUM token, generated from the page header, and send data to the same `_rumdata` stream.

![TODO: screenshot of RUM setup page with Browser/React Native platform switcher](images/placeholder.png)

## Prerequisites

- A running OpenObserve instance
- Your organization's RUM token (generated from the **Ingestion > RUM** page header)

---

## Browser Setup

Install the OpenObserve browser RUM SDK into your web application.

### Step 1: Install Required Packages

```bash
npm install @openobserve/browser-rum @openobserve/browser-logs
```

Or using yarn:

```bash
yarn add @openobserve/browser-rum @openobserve/browser-logs
```

### Step 2: Get Your Client Token

1. Log in to your OpenObserve instance
2. Navigate to **Ingestion > RUM**
3. Select **Generate RUM Token** to create your org's RUM token
4. Copy the token — you'll need it for configuration

![TODO: screenshot of browser RUM setup card showing install and init steps](images/placeholder.png)

### Step 3: Initialize RUM

Add the following code to your application's entry point (e.g., `main.js`, `index.js`, or `App.vue`):

```javascript
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const options = {
  clientToken: 'your-client-token-here', // Get this from the Ingestion page
  applicationId: 'web-application-id',
  site: 'localhost:5080', // Your OpenObserve instance URL
  service: 'my-web-application',
  env: 'production', // or 'development', 'staging', etc.
  version: '0.0.1',
  organizationIdentifier: 'default',
  insecureHTTP: true, // Set to false if using HTTPS
  apiVersion: 'v1',
};

// Initialize RUM
openobserveRum.init({
  applicationId: options.applicationId,
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  apiVersion: options.apiVersion,
  insecureHTTP: options.insecureHTTP,
  defaultPrivacyLevel: 'allow' // 'allow' or 'mask-user-input' or 'mask'
});

// Initialize Logs
openobserveLogs.init({
  clientToken: options.clientToken,
  site: options.site,
  organizationIdentifier: options.organizationIdentifier,
  service: options.service,
  env: options.env,
  version: options.version,
  forwardErrorsToLogs: true,
  insecureHTTP: options.insecureHTTP,
  apiVersion: options.apiVersion,
});

// Set user context (optional)
openobserveRum.setUser({
  id: "1",
  name: "Captain Hook",
  email: "captainhook@example.com",
});

// Start session replay recording
openobserveRum.startSessionReplayRecording();
```

### Step 4: Configuration Options

#### RUM Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `applicationId` | string | Yes | A unique identifier for your application |
| `clientToken` | string | Yes | Your OpenObserve client token from Ingestion page |
| `site` | string | Yes | Your OpenObserve instance URL (e.g., 'openobserve.example.com:5080') |
| `organizationIdentifier` | string | Yes | Your organization identifier (usually 'default') |
| `service` | string | Yes | Name of your service/application |
| `env` | string | Yes | Environment (e.g., 'production', 'staging', 'development') |
| `version` | string | Yes | Version of your application |
| `trackResources` | boolean | No | Track loading of resources (images, scripts, CSS). Default: false |
| `trackLongTasks` | boolean | No | Track long-running JavaScript tasks. Default: false |
| `trackUserInteractions` | boolean | No | Track clicks, form submissions, etc. Default: false |
| `defaultPrivacyLevel` | string | No | Privacy level: 'allow', 'mask-user-input', or 'mask'. Default: 'mask-user-input' |
| `insecureHTTP` | boolean | No | Set to true for HTTP, false for HTTPS. Default: false |
| `apiVersion` | string | No | API version to use. Default: 'v1' |

#### Privacy Levels

Choose the appropriate privacy level for your application:

- **`allow`**: Record all content including user input
- **`mask-user-input`**: Mask form inputs but show other content (recommended)
- **`mask`**: Mask all user input and text content

#### Logs Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `clientToken` | string | Yes | Your OpenObserve client token |
| `site` | string | Yes | Your OpenObserve instance URL |
| `organizationIdentifier` | string | Yes | Your organization identifier |
| `service` | string | Yes | Name of your service |
| `env` | string | Yes | Environment |
| `version` | string | Yes | Application version |
| `forwardErrorsToLogs` | boolean | No | Automatically forward errors to logs. Default: true |
| `insecureHTTP` | boolean | No | Set to true for HTTP. Default: false |
| `apiVersion` | string | No | API version. Default: 'v1' |

### Step 5: Set User Context (Optional)

You can associate RUM data with specific users by setting user context:

```javascript
openobserveRum.setUser({
  id: "user-123",
  name: "John Doe",
  email: "john.doe@example.com",
  // Add any custom attributes
  plan: "premium",
  signup_date: "2024-01-15"
});
```

To clear user context (e.g., on logout):

```javascript
openobserveRum.clearUser();
```

### Step 6: Start Session Replay

Session replay recording can be started in two ways:

#### Automatic Recording

Start recording for all sessions:

```javascript
openobserveRum.startSessionReplayRecording();
```

#### Conditional Recording

Start recording only for specific sessions (e.g., when an error occurs):

```javascript
// Start recording only when needed
if (userEncounteredError) {
  openobserveRum.startSessionReplayRecording({ force: true });
}
```

#### Stopping Session Replay

To stop recording:

```javascript
openobserveRum.stopSessionReplayRecording();
```

### Framework-Specific Integration (Browser)

#### Vue.js

Add initialization in your `main.js` or `main.ts`:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { openobserveRum } from '@openobserve/browser-rum'
import { openobserveLogs } from '@openobserve/browser-logs'

// Initialize RUM
openobserveRum.init({
  // ... configuration
});

openobserveLogs.init({
  // ... configuration
});

const app = createApp(App)
app.mount('#app')
```

#### React

Add initialization in your `index.js` or `index.tsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

// Initialize RUM
openobserveRum.init({
  // ... configuration
});

openobserveLogs.init({
  // ... configuration
});

ReactDOM.render(<App />, document.getElementById('root'));
```

#### Angular

Add initialization in your `main.ts`:

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

// Initialize RUM
openobserveRum.init({
  // ... configuration
});

openobserveLogs.init({
  // ... configuration
});

platformBrowserDynamic().bootstrapModule(AppModule);
```

#### Vanilla JavaScript

Add the script in your HTML file or main JavaScript file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { openobserveRum } from '@openobserve/browser-rum';
    import { openobserveLogs } from '@openobserve/browser-logs';

    // Initialize RUM
    openobserveRum.init({
      // ... configuration
    });

    openobserveLogs.init({
      // ... configuration
    });

    openobserveRum.startSessionReplayRecording();
  </script>
</body>
</html>
```

---

## React Native Setup

Install the OpenObserve React Native SDK to monitor your iOS and Android applications.

### Step 1: Install the React Native SDK

Add the core SDK plus the optional session-replay and navigation packages. On iOS, run `npx pod-install` afterwards so the native modules are linked.

```bash
npm install @openobserve/mobile-react-native \
  @openobserve/mobile-react-native-session-replay \
  @openobserve/mobile-react-navigation

# iOS only — link the native pods after installing.
npx pod-install
```

Or using yarn:

```bash
yarn add @openobserve/mobile-react-native \
  @openobserve/mobile-react-native-session-replay \
  @openobserve/mobile-react-navigation

# iOS only — link the native pods after installing.
npx pod-install
```

The session-replay and navigation packages are optional — drop either line if you do not need screen recording or automatic view tracking.

![TODO: screenshot of React Native RUM setup card showing install step](images/placeholder.png)

### Step 2: Initialize RUM + Logs

Wrap your app in `OpenObserveProvider`. The SDK appends `/rum` and `/logs` to the base URL automatically. Adjust `applicationId`, `service` and `env` to describe your app.

```tsx
import React from 'react';
import {
  OpenObserveProvider,
  OpenObserveProviderConfiguration,
  TrackingConsent,
} from '@openobserve/mobile-react-native';

const config = new OpenObserveProviderConfiguration(
  'your-rum-token', // clientToken — this org's RUM token
  'production', // env
  TrackingConsent.GRANTED,
  {
    rumConfiguration: {
      applicationId: 'my-mobile-app', // any string identifying your app
      customEndpoint: 'https://your-instance.example.com/rum/v1/default',
      sessionSampleRate: 100, // track 100% of sessions
      trackInteractions: true,
      trackResources: true,
      trackErrors: true,
      nativeCrashReportEnabled: true,
    },
    logsConfiguration: {
      customEndpoint: 'https://your-instance.example.com/rum/v1/default',
    },
  },
);

config.service = 'my-mobile-app';

export default function App() {
  return (
    <OpenObserveProvider configuration={config}>
      {/* your app */}
    </OpenObserveProvider>
  );
}
```

Initialize as early as possible — the provider must mount before the screens you want measured.

The `clientToken` is your **RUM token** (generated from the **Ingestion > RUM** page header), not the ingestion passcode. If the token is rotated, regenerate it and rebuild the app.

For plain HTTP endpoints (local development), add the Android cleartext configuration:

```tsx
additionalConfiguration: { '_dd.needsClearTextHttp': true },
```

### Step 3: Enable Session Replay

Session Replay is configured **separately** from RUM and does **not** inherit `rumConfiguration.customEndpoint`. It also does not append a path, so it needs the full `/replay` URL. Getting this wrong is the usual reason RUM events arrive but replays never do.

```tsx
import { OpenObserveProvider } from '@openobserve/mobile-react-native';
import {
  SessionReplay,
  TextAndInputPrivacyLevel,
  ImagePrivacyLevel,
  TouchPrivacyLevel,
} from '@openobserve/mobile-react-native-session-replay';

<OpenObserveProvider
  configuration={config}
  onInitialization={() => {
    SessionReplay.enable({
      replaySampleRate: 100, // record 100% of sampled sessions
      startRecordingImmediately: true,
      // Must be the FULL URL ending in /replay — not the RUM base URL.
      customEndpoint: 'https://your-instance.example.com/rum/v1/default/replay',
      textAndInputPrivacyLevel: TextAndInputPrivacyLevel.MASK_SENSITIVE_INPUTS,
      imagePrivacyLevel: ImagePrivacyLevel.MASK_NONE,
      touchPrivacyLevel: TouchPrivacyLevel.SHOW,
    }).catch(() => {});
  }}
>
  {/* your app */}
</OpenObserveProvider>
```

Session Replay on React Native is currently verified on Android. On iOS the SDK appends its own path to the replay URL, so replay uploads do not yet reach OpenObserve — RUM, logs and crashes are unaffected.

### Step 4: Track Screens Automatically (Optional)

If you use React Navigation, hand the SDK your navigation ref and every route change is recorded as a RUM view — no per-screen code.

```tsx
import { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { OoRumReactNavigationTracking } from '@openobserve/mobile-react-navigation';

const navigationRef = useRef(null);

<NavigationContainer
  ref={navigationRef}
  onReady={() => {
    OoRumReactNavigationTracking.startTrackingViews(navigationRef.current);
  }}
>
  {/* your screens */}
</NavigationContainer>
```

Without this you can still record views manually with `OoRum.startView()` / `OoRum.stopView()`.

### Step 5: Verify Data in OpenObserve

Run the app on a simulator, emulator or device, move between a few screens, then check OpenObserve:

1. Log in to OpenObserve
2. Navigate to the **RUM** section
3. You should see data appearing in:
   - **Sessions** — your mobile session
   - **Views** — screen views for each route
   - **User Actions** — taps, scrolls, and interactions
   - **Errors** — JavaScript and native crashes
   - **Session Replay** — recorded screen sessions (Android)

### Host Resolution for Mobile Devices

`localhost` inside an emulator or on a physical device is the device itself, not your machine — the most common reason nothing arrives at all. Use the right host for where the app runs:

```bash
# Android emulator  → your machine is 10.0.2.2
https://10.0.2.2:5080/rum/v1/default

# iOS simulator    → localhost works as-is
https://localhost:5080/rum/v1/default

# Physical device  → your machine's LAN IP, reachable from the same network
https://192.168.1.10:5080/rum/v1/default
```

---

## Advanced Configuration

### Custom Sampling

Control which sessions are tracked:

```javascript
openobserveRum.init({
  // ... other options
  sessionSampleRate: 100, // Track 100% of sessions
  sessionReplaySampleRate: 50, // Record 50% of sessions
});
```

### Manual Error Tracking

Send custom errors:

```javascript
try {
  // Your code
} catch (error) {
  openobserveLogs.logger.error('Custom error message', {
    error: error,
    context: 'additional context'
  });
}
```

### Custom Actions

Track custom user actions:

```javascript
openobserveRum.addAction('button_clicked', {
  button_name: 'subscribe',
  page: 'homepage'
});
```

---

## Troubleshooting

### Browser — No Data Appearing

If you don't see any RUM data:

1. **Check console for errors**: Open browser DevTools and look for any error messages
2. **Verify client token**: Ensure your client token is correct
3. **Check network requests**: Look for requests to your OpenObserve instance in the Network tab
4. **Verify site URL**: Ensure the `site` option matches your OpenObserve instance URL
5. **Check CORS settings**: Make sure your OpenObserve instance allows requests from your application domain

### Browser — Session Replay Not Recording

If session replay is not working:

1. **Verify initialization**: Ensure `startSessionReplayRecording()` is called after `openobserveRum.init()`
2. **Check privacy settings**: `defaultPrivacyLevel` affects what is recorded
3. **Browser compatibility**: Ensure you're using a modern browser that supports session replay
4. **Force recording**: If session is sampled out of replay, apply `{ force: true }` to force recording:
   ```javascript
   openobserveRum.startSessionReplayRecording({ force: true });
   ```

### React Native — RUM Events Arrive but No Session Replay

Almost always the endpoint. Session Replay is configured separately and does **not** inherit `rumConfiguration.customEndpoint`; left unset it defaults to an empty string and uploads go nowhere. Pass the full URL explicitly:

```
customEndpoint: 'https://your-instance.example.com/rum/v1/default/replay'
```

Note the trailing `/replay`, which the core SDK's base URL does not have.

### React Native — Session Replay Works on Android but Not iOS

Known limitation of the current React Native SDK: on iOS it appends its own path to the session-replay `customEndpoint`, so uploads miss OpenObserve's `/replay` route. Android uses the URL verbatim and works. RUM events, logs and crash reporting are unaffected on both platforms.

### React Native — Nothing Arrives from an Emulator or Device

Check the host first. `localhost` resolves to the device, not your machine: use `10.0.2.2` on the Android emulator, `localhost` on the iOS simulator, and your machine's LAN IP on a physical device.

### React Native — Android Sends Nothing over Plain HTTP

Android blocks cleartext traffic by default. For an `http://` endpoint set `additionalConfiguration: { '_dd.needsClearTextHttp': true }` in the SDK config, and allow cleartext for your host in the app's network security config. Prefer HTTPS outside local development.

### React Native — iOS Build Fails or Native Module Is Missing

Run `npx pod-install` (or `cd ios && pod install`) after adding the packages, then rebuild from Xcode or `npx react-native run-ios`. A Metro-only reload will not pick up new native modules.

### React Native — Replays Render but Everything Is Masked

That is the default. `textAndInputPrivacyLevel`, `imagePrivacyLevel` and `touchPrivacyLevel` all default to their strictest setting (`MASK_ALL`). Relax them only as far as your privacy policy allows — `MASK_SENSITIVE_INPUTS` keeps passwords and card fields hidden while showing the rest.

### React Native — Requests Return 401 or 403

The `clientToken` is your org's **RUM token**, not the ingestion passcode. If it was rotated, regenerate it from the **Ingestion > RUM** page header and rebuild the app.

### React Native — Sessions Appear but All Screens Have the Same Name

View tracking is not wired up. Either pass your navigation ref to `OoRumReactNavigationTracking.startTrackingViews()` (see Step 4 above), or call `OoRum.startView()` / `OoRum.stopView()` yourself on each screen.

### Performance Impact

RUM is designed to have minimal impact on your application:

- **Asynchronous**: Data collection happens asynchronously
- **Batching**: Events are batched before sending
- **Small bundle size**: The RUM SDK is lightweight
- **Sampling**: You can configure sampling rates to reduce data volume

---

## Next Steps

- [Performance Monitoring](./performance-monitoring.md) — Learn about performance metrics
- [Session Tracking](./sessions.md) — Understand session data across platforms
- [Error Tracking](./error-tracking.md) — Track and debug errors
- [Session Replay](./session-replay.md) — Use session replay effectively
- [Metrics Reference](./metrics-reference.md) — Complete metrics documentation
