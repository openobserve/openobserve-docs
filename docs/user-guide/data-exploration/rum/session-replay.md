# Session Replay

Session replay is one of the most powerful features of OpenObserve RUM. It allows you to watch a video-like playback of user sessions, showing exactly what users saw and did in your application. This is invaluable for debugging issues, understanding user behavior, and improving user experience.

## What is Session Replay?

Session replay records and reconstructs user sessions by capturing:

- **DOM snapshots**: The structure and content of your pages
- **User interactions**: Clicks, scrolls, form inputs, keyboard events
- **Mouse movements**: Where users moved their cursor
- **Page navigations**: When users navigated between pages
- **Viewport changes**: Window resizing and scrolling
- **Console logs**: JavaScript console output
- **Network activity**: API calls and their timing
- **Errors**: When and where errors occurred

All this data is combined to create a video-like replay that shows you exactly what happened during a user's session.

## How to Access Session Replay

### From Sessions List

1. Navigate to the **Sessions** tab in RUM dashboard
2. Find the session you want to replay
3. Click the **play button (▶)** next to the session
4. Session replay player will open

### From Error Details

1. Navigate to the **Error Tracking** tab
2. Click on an error to view details
3. In the error details, you'll see "Affected Sessions"
4. Click the **play button (▶)** next to any session
5. Replay will open and jump to the moment error occurred

### From Performance Issues

1. In the **Performance** tab, identify slow pages or resources
2. Find sessions that experienced the issue
3. Click play to watch those sessions

## Session Replay Player

The session replay player provides a comprehensive interface for watching and analyzing user sessions.

### Player Interface

#### Video Player Area
The main area shows the reconstructed view of what the user saw. This includes:

- Page content and layout
- Mouse cursor position
- Scroll position
- Form interactions
- Dynamic content changes

#### Timeline
A visual timeline at the bottom shows:


- **Duration**: Total session length (e.g., `00:00 / 01:10:14`)
- **Playback position**: Current position in the replay
- **Event markers**: Visual indicators for important events:

  - Clicks (action markers)
  - Page views (navigation markers)
  - Errors (error markers in red)
  - API calls (resource markers)

#### Playback Controls

**Play/Pause Button (▶ / ⏸)**:

- Start or pause the replay
- Keyboard shortcut: Spacebar

**Rewind Button (⏪)**:

- Jump back 10 seconds
- Keyboard shortcut: Left arrow

**Fast Forward Button (⏩)**:

- Jump forward 10 seconds
- Keyboard shortcut: Right arrow

**Speed Control (4x)**:

- Adjust playback speed
- Options: 0.5x, 1x, 2x, 4x, 8x
- Useful for watching long sessions quickly

**Skip Inactivity Toggle**:

- When enabled, automatically skips periods of no activity
- Saves time when watching long sessions with idle periods
- Inactivity threshold: typically 2-3 seconds of no events

### Side Panels

The right side of the player contains two tabs: **Breadcrumbs** and **Tags**.

#### Breadcrumbs Tab

The Breadcrumbs tab shows a chronological event timeline with timestamps and event details. Each entry shows:

**Time** (left column): Relative timestamp (e.g., `00:00`, `00:01`, `00:02`)

**Event Type and Description** (middle column):

**1. View Events** (navigation icon):

- Format: `initial_load : http://localhost:5080/...`
- Indicates page views and navigation
- Shows the full URL that was loaded
- Initial page load and subsequent navigations

**2. Error Events** (error tag in red):

- Format: `Fetch error POST http://domain.dev.site...`
- Shows when errors occurred
- Includes error type and context
- Click to see full error details
- Helps identify what caused issues

**3. Action Events** (action indicator):

- Format: `click on "Logs"`
- Shows user interactions
- Includes what was clicked
- Shows button or element text
- Helps understand user intent

Each event in the Breadcrumbs list is clickable:

- Click any event to jump to that moment in the replay
- The video will seek to the exact time of that event
- Useful for quickly navigating to important moments

#### Tags Tab

The Tags tab shows filterable tags that let you focus on specific types of events:

**Search Event**: Filter events by keyword

**Filter by Tag**: Select event types to display

- `error`: Error events only
- `action`: User interaction events only
- `view`: Page view events only
- `...`: Other custom event types

## Common Use Cases

### Debugging User-Reported Issues

**Scenario**: User reports "the submit button doesn't work"

**Workflow**:

1. Search for user's session by email or time
2. Open session replay
3. Watch what user did before clicking submit
4. See if any errors occurred
5. Check if form validation failed
6. Verify if API call was made
7. Identify the actual issue (e.g., validation error not shown)

### Understanding Feature Usage

**Scenario**: New feature has low adoption

**Workflow**:

1. Filter sessions that visited feature page
2. Watch several session replays
3. Observe how users interacted (or didn't) with feature
4. Notice if users were confused or missed the feature
5. Identify UX improvements needed

### Reproducing Bugs

**Scenario**: Bug occurs only in production

**Workflow**:

1. Find session where bug occurred
2. Watch replay to see exact steps
3. Note browser, device, screen size
4. Reproduce locally following same steps
5. Fix and verify in production

### UX Research

**Scenario**: Understanding user behavior patterns

**Workflow**:

1. Watch replays of various user sessions
2. Notice common navigation patterns
3. Identify where users hesitate or get stuck
4. See which elements users click on most
5. Discover usability issues
6. Make data-driven UX improvements

### Onboarding Analysis

**Scenario**: Users dropping off during onboarding

**Workflow**:

1. Filter sessions of new users
2. Watch onboarding flow replays
3. Identify where users get confused
4. See which steps take longest
5. Notice where users abandon
6. Optimize onboarding based on findings

## Advanced Features

### Event Navigation

Quickly jump to important moments:

**Jump to Errors**:

- Click red error markers in timeline
- Or click error events in Breadcrumbs tab
- Player jumps to moment error occurred

**Jump to User Actions**:

- Click action events in Breadcrumbs
- See exactly what user clicked
- Understand user intent and workflow

**Jump to Page Views**:

- Click view events in Breadcrumbs
- See page transitions
- Understand navigation flow

### Timeline Visualization

The timeline provides visual cues:

**Color-Coded Events**:

- Red: Errors
- Blue: User actions
- Green: Page views
- Yellow: Network activity

**Event Density**:

- Thick clusters: Lots of activity
- Sparse areas: Low activity
- Helps identify active vs idle periods

### Keyboard Shortcuts

Speed up replay analysis:

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← | Rewind 10 seconds |
| → | Fast forward 10 seconds |
| ↑ | Increase speed |
| ↓ | Decrease speed |
| 0-9 | Jump to 0%-90% of session |

## Privacy Controls

Session replay respects user privacy with configurable privacy levels.

### Privacy Levels

Set when initializing RUM:

```javascript
openobserveRum.init({
  // ... other options
  defaultPrivacyLevel: 'mask-user-input' // Recommended
});
```

**Options**:

#### `allow` - No Masking
Records everything including user input.

**Use when**:

- Internal applications
- You have explicit user consent
- No sensitive data is entered

**Shows**:

- All text content
- All form inputs
- All user data

#### `mask-user-input` - Mask Form Inputs (Recommended)
Masks form inputs but shows other content.

**Use when**:

- Public-facing applications
- Forms may contain sensitive data
- You want to balance debugging with privacy

**Masks**:

- Input field values
- Textarea content
- Password fields (always masked)

**Shows**:

- Page text and content
- Button and link labels
- Element structure

#### `mask` - Mask All Text
Masks all text content and user input.

**Use when**:

- Handling very sensitive data
- Strict privacy requirements
- Compliance regulations require it

**Masks**:

- All text content
- All form inputs
- All user data

**Shows**:

- Page layout and structure
- Element positions
- User interactions (clicks, scrolls)
- Visual layout shifts

### Sensitive Data Handling

**Additional controls**:

Mark elements to never record:
```html
<!-- This element will never be recorded -->
<div data-dd-privacy="hidden">
  Sensitive content here
</div>

<!-- This element will be masked -->
<div data-dd-privacy="mask">
  User personal data
</div>
```

Exclude specific elements:
```html
<!-- Input always masked -->
<input type="password" /> <!-- Automatically masked -->

<!-- Custom masking -->
<input type="text" data-dd-privacy="mask" placeholder="SSN" />
```

### Best Practices for Privacy

**Do**:

- Use `mask-user-input` as default
- Mark sensitive fields explicitly
- Inform users about session recording in privacy policy
- Provide opt-out mechanism if required
- Comply with GDPR, CCPA, and local regulations

**Don't**:

- Record payment card data (PCI compliance)
- Record passwords or credentials
- Record personal health information
- Record social security numbers
- Assume default settings are sufficient

## Recording Control

### Start Recording

Automatically start for all sessions:
```javascript
openobserveRum.startSessionReplayRecording();
```

Start only for specific sessions:
```javascript
// Record only sessions with errors
window.addEventListener('error', () => {
  openobserveRum.startSessionReplayRecording({ force: true });
});

// Record only for logged-in users
if (user.isLoggedIn) {
  openobserveRum.startSessionReplayRecording();
}

// Record only for specific features
if (window.location.pathname.includes('/checkout')) {
  openobserveRum.startSessionReplayRecording({ force: true });
}
```

### Stop Recording

Stop recording when no longer needed:
```javascript
openobserveRum.stopSessionReplayRecording();
```

### Conditional Recording

Sample recording to save bandwidth:
```javascript
openobserveRum.init({
  // ... other options
  sessionSampleRate: 100, // Track all sessions
  sessionReplaySampleRate: 20, // But only record 20%
});
```

## Performance Impact

Session replay is designed to be lightweight:

### Minimal Performance Impact

- **Asynchronous**: Recording happens in background
- **Efficient**: Only captures changes, not full snapshots
- **Compressed**: Data is compressed before sending
- **Batched**: Events are batched to reduce network requests

### Bandwidth Considerations

Average data usage:

- **Short session** (< 5 min): ~50-100 KB
- **Medium session** (5-15 min): ~100-500 KB
- **Long session** (> 15 min): ~500 KB - 2 MB

Reduce bandwidth if needed:

- Lower sampling rate
- Enable conditional recording
- Increase compression level

### User Experience Impact

Users won't notice session replay:

- No visual changes to your application
- No perceptible performance degradation
- Background processing
- Optimized for modern browsers

## Troubleshooting

### Replay Not Available

If replay is not available:

**Check initialization**:
```javascript
// Ensure replay is started
openobserveRum.startSessionReplayRecording();
```

**Check sampling**:
```javascript
// Ensure session is included in replay sampling
openobserveRum.init({
  sessionReplaySampleRate: 100, // Record all sessions
});
```

**Force recording**:
If session is sampled out of replay, you can force recording:
```javascript
// Force recording for this session even if sampled out
openobserveRum.startSessionReplayRecording({ force: true });
```

**Check browser compatibility**:

- Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+)
- Some privacy extensions may block recording

### Replay Quality Issues

If replay looks wrong:

**Layout issues**:

- May be caused by CSS loaded from external sources
- Cross-origin stylesheets may not be captured
- Solution: Inline critical CSS or use CORS headers

**Missing content**:

- Content loaded after page load may not be captured
- Solution: Ensure content is in DOM when loaded

**Flashing or flickering**:

- Usually due to CSS animations
- Solution: Animations are recreated; no fix needed

### Privacy Concerns

If content should be hidden:

**Add privacy attributes**:
```html
<div data-dd-privacy="hidden">This won't be recorded</div>
```

**Increase privacy level**:
```javascript
openobserveRum.init({
  defaultPrivacyLevel: 'mask', // Mask all content
});
```

## Best Practices

### Recording Strategy

**Production**:

- Use sampling (20-50%) to save costs
- Enable for critical flows (checkout, signup)
- Record all sessions with errors

**Staging**:

- Record 100% of sessions
- Use for QA and testing
- Verify features before production

**Development**:

- Record as needed for debugging
- Test privacy settings
- Verify recording quality

### Analysis Workflow

**Daily**:


- Review sessions with errors
- Check new feature adoption
- Spot check random sessions

**Weekly**:

- Analyze error patterns
- Review UX friction points
- Compare against KPIs

**After Deployments**:

- Watch sessions from new version
- Verify features work as expected
- Catch regressions quickly

### Sharing Replays

Share replays with team:

1. Open session replay
2. Copy session URL
3. Share with team members
4. Add timestamp for specific moments

**Use cases**:

- Bug reports with visual evidence
- UX review sessions
- Customer support
- Stakeholder demos

## Integration with Other RUM Features

### With Error Tracking

- Click error in Error Tracking tab
- Jump directly to replay at error moment
- See what led to error
- Understand error context

### With Performance Monitoring

- Identify slow pages in Performance tab
- Find sessions with slow performance
- Watch replays to understand why
- See user frustration from slow performance

### With Session Data

- Filter sessions by criteria
- Watch replays matching filters
- Understand specific user segments
- Analyze cohorts of sessions

## Next Steps

- [Metrics Reference](./metrics-reference.md) - Complete list of all metrics
- [Error Tracking](./error-tracking.md) - Learn more about debugging errors
- [Sessions](./sessions.md) - Understand session data
