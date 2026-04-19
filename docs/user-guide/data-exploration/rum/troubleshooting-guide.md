# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with OpenObserve RUM.

## Quick Diagnostic Steps

### 1. Verify RUM is Initialized

Open browser console and check:

```javascript
// Check if RUM is loaded
console.log(typeof openobserveRum);
// Should output: "object"

// Check RUM version
console.log(openobserveRum.version);
// Should output: version number like "5.0.0"
```

### 2. Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "openobserve" or your site domain
4. Look for RUM data being sent
5. Check for any failed requests (red status codes)

### 3. Enable Debug Mode

Get detailed logging:

```javascript
// Add to your RUM initialization
openobserveRum.init({
  // ... other config
  // Internal debug flag (if available)
  silentMultipleInit: false
});

// Or add beforeSend logging
openobserveRum.init({
  // ... other config
  beforeSend: (event) => {
    console.log('[RUM Event]', event.type, event);
    return event;
  }
});
```

## Common Issues

### No Data Appearing in OpenObserve

**Symptoms**: RUM initialized but no data visible in dashboard

**Possible Causes**:

1. **Incorrect Configuration**

```javascript
// ❌ Wrong
openobserveRum.init({
  clientToken: 'wrong-token',
  applicationId: 'wrong-id',
  site: 'wrong-site.com'
});

// ✅ Correct - verify these values
openobserveRum.init({
  clientToken: 'YOUR_ACTUAL_CLIENT_TOKEN',
  applicationId: 'YOUR_ACTUAL_APP_ID',
  site: 'your-actual-openobserve-instance.com',
  service: 'web-app',
  env: 'production'
});
```

2. **Sampling Rate Too Low**

```javascript
// ❌ This might exclude your session
openobserveRum.init({
  // ... config
  sessionSampleRate: 1  // Only 1% of sessions tracked
});

// ✅ For testing, use 100%
openobserveRum.init({
  // ... config
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100
});
```

3. **Content Security Policy (CSP) Blocking**

Check console for CSP errors:
```
Refused to connect to 'https://...' because it violates the following Content Security Policy directive
```

Fix by updating CSP headers:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               connect-src 'self' https://your-openobserve-instance.com;">
```

4. **Ad Blockers**

Some ad blockers block analytics tools. Test with:
- Incognito/Private window
- Ad blocker disabled
- Different browser

**Solution**: Ask users to whitelist your domain or use a custom domain for RUM endpoint.

### Session Replay Not Recording

**Symptoms**: Basic metrics work but replay doesn't record

**Solutions**:

1. **Check Sampling Rate**

```javascript
openobserveRum.init({
  // ... config
  sessionReplaySampleRate: 100  // Ensure > 0
});
```

2. **Verify Recording Started**

```javascript
// Manually start recording
openobserveRum.startSessionReplayRecording();

// Force recording even if not sampled
openobserveRum.startSessionReplayRecording({ force: true });
```

3. **Check Privacy Settings**

```javascript
// Ensure not blocking everything
openobserveRum.init({
  // ... config
  defaultPrivacyLevel: 'mask-user-input'  // Not 'allow' which might be too restrictive in some configs
});
```

4. **Verify No Errors in Console**

Check for JavaScript errors that might prevent recording.

### High Data Volume / Cost

**Symptoms**: Sending too much data, high costs

**Solutions**:

1. **Optimize Sampling**

```javascript
openobserveRum.init({
  // ... config
  sessionSampleRate: 100,     // Track all sessions for metrics
  sessionReplaySampleRate: 20  // But only record 20% of replays
});
```

2. **Filter Noisy Resources**

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type === 'resource') {
      const url = event.resource?.url || '';

      // Filter tracking pixels, analytics, ads
      const ignorePatterns = [
        'google-analytics',
        'facebook.com/tr',
        'doubleclick',
        'tracking-pixel',
        '.gif?'
      ];

      if (ignorePatterns.some(p => url.includes(p))) {
        return false;  // Don't send
      }
    }

    return event;
  }
});
```

3. **Limit Actions**

```javascript
// ❌ Don't track every interaction
document.addEventListener('mousemove', (e) => {
  openobserveRum.addAction('mouse_move');  // Too noisy!
});

// ✅ Track meaningful actions only
button.addEventListener('click', () => {
  openobserveRum.addAction('purchase_completed', {
    order_id: '123',
    total: 99.99
  });
});
```

4. **Route-Based Sampling**

```javascript
const isCriticalRoute = ['/checkout', '/payment'].some(r =>
  window.location.pathname.includes(r)
);

openobserveRum.init({
  // ... config
  sessionReplaySampleRate: isCriticalRoute ? 100 : 10
});
```

### Performance Impact

**Symptoms**: RUM slowing down page load or runtime performance

**Solutions**:

1. **Load Asynchronously**

```html
<!-- Load RUM without blocking -->
<script async src="path/to/openobserve-rum.js"></script>
```

2. **Defer Non-Critical Tracking**

```javascript
// Initialize core RUM immediately
openobserveRum.init({ /* minimal config */ });

// Add heavy operations after page load
window.addEventListener('load', () => {
  // Setup complex tracking
  setupAdvancedTracking();
});
```

3. **Disable Heavy Features**

```javascript
openobserveRum.init({
  // ... config
  trackResources: false,      // If you don't need resource timing
  trackLongTasks: false,       // If you don't need long task tracking
  trackUserInteractions: false // If you don't need automatic interaction tracking
});
```

4. **Throttle beforeSend**

```javascript
// If beforeSend has heavy operations
let processingCount = 0;
const MAX_CONCURRENT = 10;

openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (processingCount > MAX_CONCURRENT) {
      return event;  // Skip processing if too busy
    }

    processingCount++;
    try {
      // Your processing
      return processEvent(event);
    } finally {
      processingCount--;
    }
  }
});
```

### Errors Not Being Captured

**Symptoms**: Known errors not appearing in dashboard

**Solutions**:

1. **Check Error Filters**

```javascript
// Make sure beforeSend isn't filtering errors
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    if (event.type === 'error') {
      console.log('[Error Event]', event);  // Debug what's being filtered
    }
    return event;
  }
});
```

2. **Capture Unhandled Rejections**

```javascript
// Already handled by RUM, but verify it's not being prevented
window.addEventListener('unhandledrejection', (event) => {
  console.log('Unhandled rejection:', event.reason);
});
```

3. **Manual Error Logging**

```javascript
try {
  // Your code
  riskyOperation();
} catch (error) {
  // Manually log to RUM
  openobserveLogs.logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: 'my_feature'
  });
}
```

4. **Check Error Sampling**

Ensure you're not sampling out errors:

```javascript
openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    // ❌ Don't sample errors
    if (event.type === 'error') {
      return event;  // Always send errors
    }

    // ✅ Sample other events
    return Math.random() < 0.5 ? event : false;
  }
});
```

### Session Tracking Issues

**Symptoms**: Sessions not being tracked correctly, multiple sessions for same user

**Solutions**:

1. **Check Cookie Settings**

RUM uses cookies for session tracking. Ensure:
- Cookies not blocked by browser
- Cookie domain set correctly
- Cookie SameSite attribute compatible

```javascript
openobserveRum.init({
  // ... config
  useCrossSiteSessionCookie: true,  // If using across subdomains
  useSecureSessionCookie: true,     // For HTTPS sites
});
```

2. **Verify Session Duration**

Sessions timeout after 15 minutes of inactivity by default. If needed:

```javascript
// Keep session alive with periodic actions
setInterval(() => {
  openobserveRum.addAction('keepalive');
}, 5 * 60 * 1000);  // Every 5 minutes
```

3. **Check Multiple Initializations**

```javascript
// ❌ Don't initialize multiple times
openobserveRum.init({ /* config */ });
openobserveRum.init({ /* config */ });  // Creates issues

// ✅ Initialize once
if (typeof openobserveRum !== 'undefined' && !openobserveRum._initialized) {
  openobserveRum.init({ /* config */ });
}
```

### User Identification Not Working

**Symptoms**: Can't filter sessions by user, user data not appearing

**Solutions**:

1. **Set User Info After Login**

```javascript
// Call setUser() after successful login
function onLoginSuccess(user) {
  openobserveRum.setUser({
    id: user.id,
    name: user.name,
    email: user.email,
    // Add custom attributes
    plan: user.subscriptionPlan,
    signup_date: user.signupDate
  });
}
```

2. **Clear User Info on Logout**

```javascript
function onLogout() {
  openobserveRum.clearUser();
  openobserveRum.setGlobalContext({});  // Clear user-specific context
}
```

3. **Verify User Info is Set**

```javascript
// Check current user
const context = openobserveRum.getGlobalContext();
console.log('Current user:', context.user);
```

### Web Vitals Not Appearing

**Symptoms**: No LCP, FID, CLS data in dashboard

**Solutions**:

1. **Ensure Browser Support**

Web Vitals require modern browsers. Check compatibility:
```javascript
if ('PerformanceObserver' in window) {
  console.log('Web Vitals supported');
} else {
  console.warn('Web Vitals not supported in this browser');
}
```

2. **Wait for Metrics**

Some metrics take time to be calculated:
- **LCP**: When largest content paint occurs
- **FID**: On first user interaction
- **CLS**: Continuously calculated, finalized on page hide

3. **Check Page Visibility**

Metrics might not be sent if page is immediately hidden:

```javascript
// Metrics are sent when page becomes hidden
document.addEventListener('visibilitychange', () => {
  console.log('Visibility changed:', document.hidden);
});
```

## Browser Compatibility Issues

### IE11 Support

OpenObserve RUM requires modern browsers. For IE11:

```javascript
// Check browser support
const isSupported = 'PerformanceObserver' in window && 'Proxy' in window;

if (isSupported) {
  openobserveRum.init({ /* config */ });
} else {
  console.warn('RUM not supported in this browser');
  // Fallback to basic error tracking
}
```

### Safari Private Browsing

Safari's private browsing restricts some storage:

```javascript
function checkStorageAvailable() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}

if (checkStorageAvailable()) {
  openobserveRum.init({ /* config */ });
} else {
  // Storage not available - RUM might have limited functionality
  console.warn('Storage not available, RUM functionality limited');
}
```

## Integration Issues

### Single Page Applications (SPAs)

**Issue**: Views not tracked correctly in SPAs

**Solution**: Manual view tracking

```javascript
// React Router
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useRUMTracking() {
  const location = useLocation();

  useEffect(() => {
    openobserveRum.setViewName(location.pathname);
  }, [location]);
}

// Vue Router
const router = useRouter();
router.afterEach((to) => {
  openobserveRum.setViewName(to.path);
});

// Manual routing
window.addEventListener('popstate', () => {
  openobserveRum.setViewName(window.location.pathname);
});
```

### Webpack / Build Tool Issues

**Issue**: RUM not included in bundle or causing build errors

**Solution**: Check module resolution

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  resolve: {
    fallback: {
      // If you get "Can't resolve" errors
      "crypto": false,
      "stream": false
    }
  }
};
```

### TypeScript Issues

**Issue**: Type errors with RUM SDK

**Solution**: Install type definitions

```bash
npm install --save-dev @types/openobserve__browser-rum
```

Or create custom types:

```typescript
// types/openobserve-rum.d.ts
declare module '@openobserve/browser-rum' {
  export const openobserveRum: any;
}

declare module '@openobserve/browser-logs' {
  export const openobserveLogs: any;
}
```

## Debugging Tools

### Console Commands

Useful console commands for debugging:

```javascript
// Check RUM is loaded
typeof openobserveRum !== 'undefined'

// Get current session ID
openobserveRum.getInternalContext?.()?.session_id

// Get global context
openobserveRum.getGlobalContext()

// Get view context
openobserveRum.getViewContext()

// Manually trigger error
throw new Error('Test RUM error tracking');

// Manually trigger action
openobserveRum.addAction('debug_action', { timestamp: Date.now() });

// Start recording manually
openobserveRum.startSessionReplayRecording({ force: true });

// Stop recording
openobserveRum.stopSessionReplayRecording();
```

### Network Debugging

Monitor RUM network requests:

```javascript
// Log all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('openobserve')) {
    console.log('[RUM Request]', args);
  }
  return originalFetch.apply(this, args);
};
```

### Event Debugging

Log all RUM events:

```javascript
const events = [];

openobserveRum.init({
  // ... config
  beforeSend: (event) => {
    // Store event for inspection
    events.push({
      type: event.type,
      timestamp: Date.now(),
      event: event
    });

    // Log to console
    console.log('[RUM Event]', event.type, event);

    return event;
  }
});

// Inspect events later
console.table(events.map(e => ({
  type: e.type,
  timestamp: new Date(e.timestamp).toISOString()
})));
```

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**: Review relevant docs sections
2. **Search GitHub Issues**: Check [OpenObserve GitHub](https://github.com/openobserve/openobserve)
3. **Browser Console**: Check for JavaScript errors
4. **Network Tab**: Verify RUM requests are being sent
5. **Simplify Configuration**: Start with minimal config and add features incrementally

### Minimal Test Configuration

Use this to isolate issues:

```javascript
// Minimal working configuration
openobserveRum.init({
  clientToken: 'YOUR_CLIENT_TOKEN',
  applicationId: 'YOUR_APP_ID',
  site: 'your-openobserve-instance.com',
  service: 'test',
  env: 'testing',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100
});

// Test it works
openobserveRum.addAction('test_action', { timestamp: Date.now() });
console.log('RUM test action sent');
```

## Next Steps

- [Best Practices](./best-practices.md) - Production deployment recommendations
- [Setup Guide](./setup.md) - Detailed setup instructions
- [Advanced Features](./advanced-features.md) - Advanced configuration options
