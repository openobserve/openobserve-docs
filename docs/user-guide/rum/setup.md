# RUM Setup Guide

This guide will walk you through setting up OpenObserve RUM in your web application.

## Prerequisites

- A running OpenObserve instance
- A web application where you want to add RUM monitoring
- npm or yarn package manager

## Step 1: Install Required Packages

Install the OpenObserve browser packages:

```bash
npm install @openobserve/browser-rum @openobserve/browser-logs
```

Or using yarn:

```bash
yarn add @openobserve/browser-rum @openobserve/browser-logs
```

## Step 2: Get Your Client Token

1. Log in to your OpenObserve instance
2. Navigate to **Ingestion** menu
3. Select **RUM** or **Custom** ingestion
4. Copy your client token - you'll need this for configuration

## Step 3: Initialize RUM

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

## Step 4: Configuration Options

### RUM Configuration Options

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

### Privacy Levels

Choose the appropriate privacy level for your application:

- **`allow`**: Record all content including user input
- **`mask-user-input`**: Mask form inputs but show other content (recommended)
- **`mask`**: Mask all user input and text content

### Logs Configuration Options

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

## Step 5: Set User Context (Optional)

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

## Step 6: Start Session Replay

Session replay recording can be started in two ways:

### Automatic Recording

Start recording for all sessions:

```javascript
openobserveRum.startSessionReplayRecording();
```

### Conditional Recording

Start recording only for specific sessions (e.g., when an error occurs):

```javascript
// Start recording only when needed
if (userEncounteredError) {
  openobserveRum.startSessionReplayRecording({ force: true });
}
```

### Stopping Session Replay

To stop recording:

```javascript
openobserveRum.stopSessionReplayRecording();
```

## Framework-Specific Integration

### Vue.js

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

### React

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

### Angular

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

### Vanilla JavaScript

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

## Step 7: Verify Installation

After deploying your application with RUM enabled:

1. Open your application in a browser
2. Perform some interactions (navigate pages, click buttons, etc.)
3. Log in to OpenObserve
4. Navigate to the **RUM** section
5. You should see data appearing in:
   - Performance tab (metrics and web vitals)
   - Sessions tab (your session)
   - Error Tracking tab (if any errors occurred)

## Troubleshooting

### No Data Appearing

If you don't see any RUM data:

1. **Check console for errors**: Open browser DevTools and look for any error messages
2. **Verify client token**: Ensure your client token is correct
3. **Check network requests**: Look for requests to your OpenObserve instance in the Network tab
4. **Verify site URL**: Ensure the `site` option matches your OpenObserve instance URL
5. **Check CORS settings**: Make sure your OpenObserve instance allows requests from your application domain

### Session Replay Not Recording

If session replay is not working:

1. **Verify initialization**: Ensure `startSessionReplayRecording()` is called after `openobserveRum.init()`
2. **Check privacy settings**: `defaultPrivacyLevel` affects what is recorded
3. **Browser compatibility**: Ensure you're using a modern browser that supports session replay
4. **Force recording**: If session is sampled out of replay, apply `{ force: true }` to force recording:
   ```javascript
   openobserveRum.startSessionReplayRecording({ force: true });
   ```

### Performance Impact

RUM is designed to have minimal impact on your application:

- **Asynchronous**: Data collection happens asynchronously
- **Batching**: Events are batched before sending
- **Small bundle size**: The RUM SDK is lightweight
- **Sampling**: You can configure sampling rates to reduce data volume

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

## Next Steps

- [Performance Monitoring](./performance-monitoring.md) - Learn about performance metrics
- [Session Tracking](./sessions.md) - Understand session data
- [Error Tracking](./error-tracking.md) - Track and debug errors
- [Session Replay](./session-replay.md) - Use session replay effectively
- [Metrics Reference](./metrics-reference.md) - Complete metrics documentation
