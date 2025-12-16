# Session Tracking

Session tracking helps you understand user behavior by capturing complete user journeys through your application. A session represents a single visit by a user, from the moment they land on your site until they leave or become inactive.

## What is a Session?

A **session** is a period of user activity on your application. OpenObserve automatically:

- Creates a new session when a user first visits your application
- Maintains the session while the user is active
- Ends the session after 15 minutes of inactivity or when the browser is closed
- Associates all user actions, page views, errors, and performance metrics with the session

## Sessions Dashboard

The Sessions tab provides a comprehensive view of all user sessions. Each row in the session list represents a unique user session with detailed information.

### Session List Columns

The session list displays the following information for each session:

#### Timestamp
**Format**: `Dec 15, 2025 17:42:20 +05:30`

The exact date and time when the session started, shown in the local timezone with timezone offset.

**Use cases**:

- Identify when users are most active
- Track session timing relative to deployments
- Analyze time-based patterns

#### User Email
**Format**: `root@example.com`

The email address of the user (if user context was set). This helps you:

- Identify specific users experiencing issues
- Track behavior of individual users
- Provide personalized support

**Note**: User information must be set using `openobserveRum.setUser()` for this field to be populated.

#### Time Spent
**Format**: `5.18 min`, `1.46 hr`, `15.01 min`

The total duration of the session from start to end (or last activity).

**Insights**:

- **Short sessions** (< 1 min): Users may not be finding what they need
- **Medium sessions** (1-10 min): Normal browsing behavior
- **Long sessions** (> 10 min): Highly engaged users or users struggling with a task

#### Error Count
**Format**: `4`, `22`, `16`, `0`

The total number of errors that occurred during the session.

**Analysis**:

- **0 errors**: Clean session, good user experience
- **1-5 errors**: Minor issues, investigate if pattern emerges
- **5+ errors**: Significant problems, high priority to investigate
- **Many errors**: Critical issues affecting user experience

**Action**: Click on sessions with high error counts to investigate what went wrong.

#### Location
**Format**: `India - Unknown · Chrome · Mac OS X`

Detailed information about the user's context:

**Geographic Location**:

- Country flag icon
- Country name
- City (if available, otherwise "Unknown")

**Browser Information**:

- Browser name (Chrome, Firefox, Safari, Edge, etc.)
- Browser version (shown in detailed view)

**Operating System**:

- OS name (Mac OS X, Windows, Linux, iOS, Android)
- OS version (shown in detailed view)

**Use cases**:

- Identify region-specific issues
- Test browser compatibility
- Understand your user demographics

### Session Actions

#### Play Button (▶)
Click the play button next to any session to:

- View the complete session replay
- See all user interactions (clicks, scrolls, navigation)
- Debug errors in context
- Understand user behavior

See [Session Replay](./session-replay.md) for more details.

## Session Details View

Click on any session row to open the detailed session view, which includes:

### Session Overview

- **Session ID**: Unique identifier for the session
- **Duration**: Total session length
- **Page Views**: Number of pages visited
- **User Actions**: Total number of interactions (clicks, form submissions, etc.)
- **Errors**: Total errors encountered

### User Information

If user context was set, you'll see:

- User ID
- Name
- Email
- Custom user attributes

### Device and Browser Details

Complete technical information:

- Browser name and version
- Operating system and version
- Device type (Desktop, Mobile, Tablet)
- Screen resolution
- Viewport size

### Network Information

- **Connection Type**: 4G, WiFi, Ethernet, etc.
- **Effective Connection Type**: slow-2g, 2g, 3g, 4g

### Geographic Information

- Country
- City (if available)
- Region/State (if available)
- IP address (optionally tracked)

### Session Timeline

A chronological list of all events during the session:

- Page views with URLs and timestamps
- User interactions (clicks, form submissions)
- API calls with response times
- Errors with stack traces
- Performance metrics

### Performance Metrics for Session

Web Vitals specific to this session:

- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Resources Loaded

List of all resources loaded during the session:

- JavaScript files
- CSS stylesheets
- Images
- Fonts
- API calls

With timing information:

- DNS lookup time
- Connection time
- Request/response time
- Total duration

## Filtering Sessions

Use filters to narrow down the session list and find specific sessions:

### Available Filters

#### Time Range
Filter sessions by when they occurred:

- Past 15 minutes
- Past hour
- Past 6 hours
- Past 24 hours
- Past 7 days
- Past 30 days
- Custom date range

#### User Email
Search for sessions by specific user email address.

**Example**: `user@example.com`

#### Error Count
Filter sessions based on number of errors:

- No errors (= 0)
- With errors (> 0)
- Many errors (> 5, > 10, etc.)

#### Location Filters

**Country**: Filter by country
- Example: India, United States, United Kingdom

**City**: Filter by city (if available)
- Example: Mumbai, New York, London

#### Browser
Filter by browser type:

- Chrome
- Firefox
- Safari
- Edge
- Opera
- Mobile browsers

#### Operating System
Filter by OS:

- Windows
- Mac OS X
- Linux
- iOS
- Android

#### Device Type
Filter by device category:

- Desktop
- Mobile
- Tablet

#### Session Duration
Filter by how long sessions lasted:

- Short sessions (< 1 minute)
- Medium sessions (1-10 minutes)
- Long sessions (> 10 minutes)
- Custom duration range

#### Environment
Filter by environment:

- Production
- Staging
- Development

#### Application Version
Filter by specific version of your application.

### Search

Use the search box to find sessions containing specific:

- URLs visited
- Error messages
- User actions
- Custom attributes

## Session Analysis Use Cases

### Debugging User-Reported Issues

When a user reports a problem:

1. **Find the session**: Search by user email or time range
2. **Review session details**: Check error count and timeline
3. **Watch session replay**: See exactly what the user did
4. **Identify the issue**: Find the error or performance problem
5. **Reproduce**: Try to reproduce based on what you observed

### Understanding User Behavior

Analyze sessions to understand how users interact with your app:

1. **Filter by feature**: Find sessions that visited specific pages
2. **Measure engagement**: Look at time spent and actions taken
3. **Identify patterns**: Notice common navigation paths
4. **Find friction**: Look for sessions with many actions but no completion

### Quality Assurance

Use sessions to verify new features:

1. **Filter by version**: Select sessions with new version
2. **Check error rates**: Compare error counts to previous version
3. **Monitor performance**: Check Web Vitals for new version
4. **Watch replays**: Verify features work as expected

### Performance Analysis by Segment

Understand performance for different user segments:

1. **Segment by location**: Compare performance across countries
2. **Segment by device**: Check mobile vs. desktop performance
3. **Segment by browser**: Identify browser-specific issues
4. **Segment by network**: Analyze slow connection impact

## Session Sampling

For high-traffic applications, you may want to sample sessions to manage data volume:

### Session Sample Rate

Control what percentage of sessions are tracked:

```javascript
openobserveRum.init({
  // ... other options
  sessionSampleRate: 100, // Track 100% of sessions (default)
});
```

**Options**:

- `100`: Track all sessions (recommended for most apps)
- `50`: Track 50% of sessions
- `10`: Track 10% of sessions
- `1`: Track 1% of sessions

### Session Replay Sample Rate

Separately control what percentage of sessions include replay recording:

```javascript
openobserveRum.init({
  // ... other options
  sessionSampleRate: 100, // Track all sessions
  sessionReplaySampleRate: 20, // But only record 20% of sessions
});
```

This allows you to:

- Track all sessions for metrics and errors
- Record fewer sessions to save storage and bandwidth
- Still capture enough replays for debugging

### Conditional Recording

You can also start recording for specific sessions:

```javascript
// Start recording only when user encounters an error
window.addEventListener('error', () => {
  openobserveRum.startSessionReplayRecording({ force: true });
});

// Or when user performs critical action
function onCheckout() {
  openobserveRum.startSessionReplayRecording({ force: true });
  // ... checkout logic
}
```

## Session Metrics and KPIs

### Key Performance Indicators

Track these session-based KPIs:

#### Total Sessions
Total number of sessions in the selected time period.

**Trend**: Monitor daily/weekly to understand traffic patterns.

#### Average Session Duration
Mean time users spend in your application.

**Benchmark**:

- < 1 minute: Poor engagement
- 1-5 minutes: Normal engagement
- 5+ minutes: High engagement

#### Error Rate
Percentage of sessions that encountered at least one error.

**Benchmark**:

- < 5%: Excellent
- 5-10%: Good
- 10-20%: Needs attention
- > 20%: Critical issues

#### Pages per Session
Average number of pages viewed per session.

**Insights**:

- Low (< 2): Users not exploring
- Medium (2-5): Normal browsing
- High (> 5): Highly engaged or lost users

### Session Cohort Analysis

Compare sessions across different cohorts:

1. **By Version**: Compare new vs. old versions
2. **By Time**: Compare weekday vs. weekend sessions
3. **By User Type**: Compare new vs. returning users
4. **By Feature**: Compare sessions using different features

## Privacy Considerations

### User Data

Be mindful of user privacy when tracking sessions:

- **Inform users**: Add RUM tracking to your privacy policy
- **Mask sensitive data**: Use appropriate privacy levels
- **Allow opt-out**: Provide a way for users to opt out
- **Secure data**: Ensure data is transmitted and stored securely

### Compliance

Ensure compliance with regulations:

- **GDPR**: For European users
- **CCPA**: For California users
- **Other local laws**: Based on your user base

### Data Retention

Configure data retention policies:

- Decide how long to keep session data
- Automatically delete old sessions
- Provide data export for users who request it

## Best Practices

### Set User Context Early

Set user information as soon as it's available:

```javascript
// After user logs in
function onLogin(user) {
  openobserveRum.setUser({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

// When user logs out
function onLogout() {
  openobserveRum.clearUser();
}
```

### Add Custom Session Attributes

Enrich sessions with custom data:

```javascript
// Add business context
openobserveRum.setGlobalContextProperty('subscription_plan', 'premium');
openobserveRum.setGlobalContextProperty('account_age_days', 45);

// Add feature flags
openobserveRum.setGlobalContextProperty('new_checkout_enabled', true);
```

### Monitor Session Quality

Regularly review:

- Sessions with high error counts
- Sessions with unusually short or long duration
- Sessions from new regions or devices
- Sessions after deployments

## Troubleshooting

### Sessions Not Appearing

If sessions aren't being tracked:

1. Verify RUM initialization
2. Check browser console for errors
3. Verify network requests are reaching OpenObserve
4. Check sampling configuration

### Missing Session Data

If session data is incomplete:

1. Check if user closed browser quickly
2. Verify all tracking features are enabled
3. Check for ad blockers or privacy extensions
4. Verify network connectivity

### Duplicate Sessions

If you see duplicate sessions:

1. Check if RUM is initialized multiple times
2. Verify session management logic
3. Check for page reloads or SPAs not handled correctly

## Next Steps

- [Error Tracking](./error-tracking.md) - Learn about error tracking in sessions
- [Session Replay](./session-replay.md) - Watch session replays
- [Metrics Reference](./metrics-reference.md) - Complete list of session metrics
