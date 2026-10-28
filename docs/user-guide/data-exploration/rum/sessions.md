---
title: Session Tracking
description: RUM session tracking captures complete user journeys, showing session duration, page views, errors, and device or location for every visit to your app.
---

# Session Tracking

Session tracking helps you understand user behavior by capturing complete user journeys through your application. A session represents a single visit by a user, from the moment they land on your site until they leave or become inactive.

## What is a Session?

A **session** is a period of user activity on your application. OpenObserve automatically:

- Creates a new session when a user first visits your application
- Maintains the session while the user is active
- Ends the session after 15 minutes of inactivity or when the browser is closed
- Associates all user actions, page views, errors, and performance metrics with the session

## Sessions Dashboard

Go to **Experience** > **RUM** and open the **Sessions** tab. It shows a summary strip, a set of quick filters, and the session list.

### Summary strip

The tiles above the list summarize the sessions in the selected time range, with the change from the previous period where available:

- **Sessions**: Number of sessions
- **With errors**: Sessions with at least one error
- **Frustrated**: Sessions with rage or dead clicks
- **Avg Duration**: Average session length, with the median below it
- **Bounce Rate**: Share of sessions that left without any activity

When a pattern stands out, such as many sessions hitting the same error or rage-clicking the same element, an insight banner above the list links to those sessions or to **Error Tracking**.

### Session List Columns

Each row in the session list represents one user session:

| Column | What it shows |
|--------|---------------|
| Play (▶) | Opens the session replay |
| **User & Session** | The user (if user context was set) and the session start time |
| **Platform** | The platform the session came from, such as browser, Android, or iOS |
| **Activity** | A sparkline of events, errors, and frustration signals over the session |
| **Health** | Error count and frustration count, or **Clean** when the session had neither |
| **Location** | Country, plus city, browser, and operating system |
| **Duration** | Total session length, marked **bounced** or **active** where it applies |

You can sort by any column except the play button.

**Note**: User information must be set using `openobserveRum.setUser()` for the user to appear. Sessions without it show **Unknown**.

### Session Actions

#### Play Button (▶)
Click the play button, or anywhere on a session row, to:

- View the complete session replay
- See all user interactions (clicks, scrolls, navigation)
- Debug errors in context
- Understand user behavior

See [Session Replay](./session-replay.md) for more details.

## Session Details View

Opening a session shows its replay page. The header shows the page URL, the start time, the duration, the user, the location, and the browser and device. When the session had rage, dead, or error clicks, the header also shows the number of frustration signals.

Next to the player, three tabs show the session's events:

- **Breadcrumbs**: A chronological list of views, actions, and errors. Click an event to jump to that moment in the replay.
- **Tags**: The session's tags and attributes.
- **Traces**: Backend traces correlated with the session's requests.

Use **Search Events** and the **Error**, **Action**, **View**, and **Frustration** filters to narrow the event list. See [Session Replay](./session-replay.md) for the player controls.

## Filtering Sessions

Use filters to narrow down the session list and find specific sessions:

### Time Range
Use the date-time picker to choose a relative range (for example, the past 15 minutes or the past 7 days) or an absolute start and end time.

### Quick Filters
The toggles above the list filter by:

- **Health**: **All**, **With errors**, **Frustrated**, or **Clean**
- **Type**: **All**, **Engaged**, or **Bounced**
- **Device**: **All**, **Desktop**, **Mobile**, or **Tablet**

Each option shows how many sessions it matches. If no session matches, select **Reset filters**.

### Query Editor and Fields
Write a filter in the query editor above the list and click **Run query**, or open the field list to add a filter from a field's values. For example:

- `user_email = 'user@example.com'` to find one user's sessions
- `source = 'android'` to show only Android sessions
- Filters on country, browser, operating system, environment, or application version, using the fields in your RUM stream

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
