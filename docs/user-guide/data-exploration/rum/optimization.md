---
title: Optimization
description: Optimize OpenObserve RUM in production — NPM vs CDN loading, multi-application setup, reducing event volume, distributed tracing, and Content Security Policy.
---

# Optimization

This guide focuses on getting the most out of OpenObserve RUM in production: how to load the SDK without hurting page performance, how to run more than one application cleanly, how to connect frontend events to your backend traces, and how to harden the setup with Content Security Policy and server-side filtering.

It complements two existing guides rather than repeating them. For depth on the topics they already cover, follow the cross-links:

- **Sampling, privacy, consent, and error-noise filtering** &rarr; see [Best Practices](best-practices.md)
- **Global/view context, custom timings, `beforeSend`, and conditional sampling** &rarr; see [Advanced Features](advanced-features.md)

---

## SDK Loading Strategy

### NPM vs. CDN

There are two ways to load the SDK.

**NPM** is the default for any app with a bundler (Vite, Webpack, Rollup). You get type definitions, tree-shaking, and the SDK versioned alongside your code:

```bash
npm install @openobserve/browser-rum @openobserve/browser-logs
```

```javascript
import { openobserveRum } from '@openobserve/browser-rum';

openobserveRum.init({
  applicationId: 'YOUR_APPLICATION_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'your-openobserve-host.com',
  organizationIdentifier: 'YOUR_ORG',
  service: 'web-app',
  env: 'production',
  version: '1.2.3',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  defaultPrivacyLevel: 'mask-user-input',
});
```

**CDN async** suits sites without a build step, or where you want the agent loaded out-of-band so it never sits in your critical bundle. The async bundle exposes a global (`OO_RUM`) and an `onReady` queue:

```html
<script>
  (function(h,o,u,n,d) {
    h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
    d=o.createElement(u);d.async=1;d.src=n
    n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
  })(window,document,'script','https://browsersdk.openobserve.ai/0.3.1/openobserve-rum.js','OO_RUM')

  window.OO_RUM.onReady(function() {
    window.OO_RUM.init({
      applicationId: 'YOUR_APPLICATION_ID',
      clientToken: 'YOUR_CLIENT_TOKEN',
      site: 'your-openobserve-host.com',
      organizationIdentifier: 'YOUR_ORG',
      service: 'web-app',
      env: 'production',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      defaultPrivacyLevel: 'mask-user-input',
    });
  });
</script>
```

With the CDN async setup, any early API call (`setUser`, `startView`, and similar) must run inside `window.OO_RUM.onReady(...)` so it only executes once the SDK has finished loading.

### Protecting Page Load (LCP / INP)

The agent should never be the reason a page feels slow. Three rules:

1. **Load async, always.** Whether via the CDN snippet above or a deferred bundle entry, the SDK must not block the main document parse or your first paint.
2. **Pick the lighter package when you can.** If you do not need session replay, install `@openobserve/browser-rum-slim` instead of `@openobserve/browser-rum`. It collects views, actions, errors, and resources without the replay recorder, so the bundle is smaller, which directly helps LCP on bandwidth-constrained devices.
3. **Gate the expensive feature.** Session replay is the heaviest thing the SDK does. Keeping `sessionReplaySampleRate` low, or recording manually, keeps the main thread free for the interactions that INP measures. See [Best Practices &rarr; Sampling Strategies](best-practices.md#sampling-strategies).

### Version Pinning

Pin the CDN URL to an explicit version (`.../0.3.1/openobserve-rum.js`) rather than a floating alias, so a new release can never change behavior under you mid-incident. For NPM, pin the exact version in `package.json` and upgrade deliberately: read the changelog, bump in a branch, and confirm that sessions, replays, and errors still arrive in OpenObserve before you ship.

---

## Multi-Application Setup

If you run distinct zones, for example a public marketing site and a logged-in dashboard, give each its own RUM application (its own `applicationId`) and a distinct `service` name:

```javascript
// Marketing site
openobserveRum.init({
  applicationId: 'MARKETING_APP_ID',
  service: 'marketing-site',
  sessionSampleRate: 10,          // high traffic, sample hard
  // ...shared credentials...
});
```

```javascript
// Authenticated dashboard
openobserveRum.init({
  applicationId: 'DASHBOARD_APP_ID',
  service: 'app-dashboard',
  sessionSampleRate: 100,         // lower traffic, higher value
  // ...shared credentials...
});
```

Separating them keeps high-traffic, unauthenticated marketing pageviews from drowning out the lower-volume but higher-value authenticated sessions, and lets you sample, alert, and budget each independently.

---

## Reducing Volume

Cost and noise reduction is covered end-to-end in the existing guides. In short:

- **Sampling for cost** (`sessionSampleRate`, `sessionReplaySampleRate`, environment-driven and conditional): [Best Practices &rarr; Sampling Strategies](best-practices.md#sampling-strategies) and [Advanced Features &rarr; Advanced Sampling Strategies](advanced-features.md#advanced-sampling-strategies).
- **Dropping noisy events in the browser** with the `beforeSend` hook: [Advanced Features &rarr; beforeSend Hook](advanced-features.md#beforesend-hook).

Two lower-level levers are worth calling out here because they are easy to miss:

### Excluding Activity URLs

Long-polling endpoints, websockets, and analytics beacons keep a view looking busy forever and inflate resource counts. Tell the SDK to ignore them so they do not distort loading metrics or pad your volume:

```javascript
openobserveRum.init({
  // ...credentials...
  excludedActivityUrls: [
    /\/api\/heartbeat/,
    (url) => url.startsWith('https://analytics.example.com'),
  ],
});
```

### Trimming SDK Telemetry

The SDK reports a small amount of its own internal telemetry. In a high-traffic app even that adds up. `telemetrySampleRate` defaults to `20` (percent); lower it if you do not actively use that data:

```javascript
openobserveRum.init({
  // ...credentials...
  telemetrySampleRate: 5,
});
```

### Server-Side Filtering with Pipelines

Browser-side filtering catches what you can predict in advance. For everything else, OpenObserve [ingest pipelines](../../data-processing/pipelines/index.md) give you a second, server-side line of defense: attach a pipeline to the RUM stream and use a function condition to **drop high-volume, low-value events before they are stored**, for example resource events for static assets, or actions below a relevance threshold. Because this runs at ingest time, it reduces stored volume without a frontend deploy, which makes it the fastest lever to pull when a noisy event type suddenly spikes.

---

## Distributed Tracing: Connect Frontend to Backend

The biggest payoff of RUM is connecting a slow or failed frontend action to the exact backend span that caused it. The SDK does this by injecting trace headers into outgoing requests.

### allowedTracingUrls

List the backend origins your app calls in `allowedTracingUrls`. For matching `fetch` and XHR requests, the SDK injects a W3C `traceparent` header so the resulting backend trace shares an ID with the RUM resource:

```javascript
openobserveRum.init({
  // ...credentials...
  service: 'web-app',
  allowedTracingUrls: [
    'https://api.example.com',
    /https:\/\/.*\.internal\.example\.com/,
    { match: 'https://payments.example.com', propagatorTypes: ['tracecontext', 'b3multi'] },
  ],
});
```

Each entry can be a string prefix, a regular expression, a matching function, or an object with an explicit `propagatorTypes` list. By default the SDK uses the `tracecontext` (W3C `traceparent`) propagator. If your backend expects a different format, set `propagatorTypes`, supported values include `tracecontext`, `b3`, `b3multi`, and `datadog`. Match the propagator to whatever your backend instrumentation already understands.

### CORS Configuration

For cross-origin API calls, the browser sends a preflight `OPTIONS` request. If your API does not advertise the tracing headers as allowed, the browser strips them and the trace link is lost. Add them to your API's CORS response:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Headers: traceparent, tracestate, b3, x-b3-traceid, x-b3-spanid
```

Include only the headers matching the propagators you actually use. Once this is in place, a slow `fetch` in a RUM session links straight to the backend span that served it.

---

## Content Security Policy

If you run a strict CSP, allow the SDK to load and report:

| Directive | Value to allow | Why |
|-----------|----------------|-----|
| `connect-src` | your OpenObserve collector host (the `site` you configured) | Send events and session replay data |
| `script-src` | `https://browsersdk.openobserve.ai` | Only if you load the agent from the CDN |
| `worker-src` | `blob:` | Session replay runs its serializer in a web worker |

If session replay is enabled but `worker-src blob:` is missing, recordings silently fail to start, this is a common cause of "replay is not recording" reports. See the [Troubleshooting Guide](troubleshooting-guide.md) for more.

---

## Related Optimization Topics

These are documented in dedicated pages:

- **Masking PII and PHI** (`defaultPrivacyLevel`, `data-oo-privacy`, `oo-privacy-*` classes) &rarr; [Best Practices &rarr; PII Protection](best-practices.md#pii-protection)
- **User consent gating for GDPR** (`trackingConsent`, `setTrackingConsent`) &rarr; [Advanced Features &rarr; Tracking Consent Management](advanced-features.md#tracking-consent-management)
- **Identity and business context enrichment** &rarr; [Advanced Features &rarr; Global Context Management](advanced-features.md#global-context-management)
- **Manual SPA view tracking** &rarr; [Advanced Features &rarr; SPA View Tracking](advanced-features.md#spa-view-tracking)
- **Deobfuscating production stack traces** &rarr; [Source Maps](source-map.md)

---

## Optimization Checklist

- [ ] Agent loaded **async**; replay-free apps use `browser-rum-slim`
- [ ] CDN URL pinned to an explicit version; NPM version pinned in `package.json`
- [ ] Distinct `applicationId` and `service` per application zone
- [ ] `sessionSampleRate` tuned per environment; replay gated (see [Best Practices](best-practices.md#sampling-strategies))
- [ ] `excludedActivityUrls` set for heartbeats, sockets, and beacons
- [ ] `telemetrySampleRate` lowered if internal telemetry is unused
- [ ] Server-side ingest pipeline drops remaining high-volume, low-value events
- [ ] `allowedTracingUrls` set, and backend CORS allows the tracing headers
- [ ] CSP allows the collector host, the CDN (if used), and `worker-src blob:`
- [ ] PII masking, consent, and source maps configured (see linked guides)
