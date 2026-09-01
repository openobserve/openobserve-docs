---
title: Security & Privacy
description: Mobile RUM privacy controls — tracking consent, PII handling, Session Replay privacy levels, data scrubbing with event mappers, and encryption at rest.
---

# Mobile RUM Security & Privacy

Real User Monitoring is powerful precisely because it watches real people use your app — which means it can capture things you never intended to collect. The OpenObserve mobile SDKs are built so that privacy is the default, not an afterthought: nothing is gathered until the user consents, Session Replay masks everything sensitive out of the box, and you can redact or drop any event before it leaves the device. This guide covers the full privacy and data-control surface across [React Native](./react-native.md), [Android](./android.md), and [iOS](./ios.md) so you can integrate RUM without compromising your users' trust or your compliance posture.

!!! note "Versions (Beta)"

    The mobile SDKs are at React Native `0.1.2`, Android `0.1.0`, and iOS `0.1.0`. The privacy primitives described here — consent, masking, event mappers, encryption at rest — are present today. Pin exact versions and re-verify these controls when you upgrade.

## The tracking-consent model

Every mobile SDK gates all collection behind a three-state consent value. This is the single most important privacy control, because it decides whether the SDK does anything at all.

| Consent state | What the SDK does |
|---|---|
| `PENDING` | Collects events into memory but writes **nothing** to disk and sends **nothing** to OpenObserve. Held events are kept until you make a decision. |
| `GRANTED` | Collects, batches, and uploads normally. |
| `NOT_GRANTED` | Collects nothing. Anything held while `PENDING` is discarded. |

The typical pattern is to initialize with `PENDING` on first launch, show your consent dialog, and then move to `GRANTED` or `NOT_GRANTED` based on the user's choice. Because `PENDING` buffers in memory only, you lose nothing that happened before the prompt if the user agrees — and persist nothing if they decline.

You can change consent at any point in the app's lifecycle. When a user withdraws consent in your settings screen, flip it to `NOT_GRANTED`; when they opt back in, flip it to `GRANTED`.

### React Native

Set consent at init through `OpenObserveProviderConfiguration`, and change it later with the static method on `O2SdkReactNative`:

```tsx
import {
  OpenObserveProviderConfiguration,
  O2SdkReactNative,
  TrackingConsent,
} from '@openobserve/mobile-react-native';

// At init — start pending until the user answers your prompt
const config = new OpenObserveProviderConfiguration(
  'YOUR_CLIENT_TOKEN',
  'production',
  TrackingConsent.PENDING, // pending | granted | not_granted
  {
    rumConfiguration: {
      applicationId: 'YOUR_APPLICATION_ID',
      customEndpoint: 'https://your-openobserve-instance:5080',
    },
  },
);

// Later, from your consent dialog handler
O2SdkReactNative.setTrackingConsent(TrackingConsent.GRANTED);
// Or when the user opts out
O2SdkReactNative.setTrackingConsent(TrackingConsent.NOT_GRANTED);
```

### Android

Pass consent as the third argument to `OpenObserve.initialize`, and update it at runtime through the `OpenObserve` object:

```kotlin
import com.openobserve.android.OpenObserve
import com.openobserve.android.privacy.TrackingConsent

// At init
OpenObserve.initialize(this, config, TrackingConsent.PENDING)

// Later, when the user makes a choice
OpenObserve.setTrackingConsent(TrackingConsent.GRANTED)
// Or on opt-out
OpenObserve.setTrackingConsent(TrackingConsent.NOT_GRANTED)
```

### iOS

Pass `trackingConsent` to `OpenObserve.initialize`, and change it with `OpenObserve.set(trackingConsent:)`:

```swift
import OpenObserveCore

// At init
OpenObserve.initialize(
    with: configuration,
    trackingConsent: .pending // .pending | .granted | .notGranted
)

// Later
OpenObserve.set(trackingConsent: .granted)
// Or on opt-out
OpenObserve.set(trackingConsent: .notGranted)
```

## Handling user identity and PII responsibly

RUM lets you attach a user identity to every session so you can answer "which users hit this crash?" But an identity is also the most sensitive data you can attach — treat it deliberately.

- **Only attach what you need.** `setUserInfo` requires an `id`; name, email, and extra properties are optional. Prefer an opaque internal id over an email address where you can, and don't attach fields you won't actually query.
- **Clear on logout.** Call `clearUserInfo()` when the user signs out so the next session on a shared device isn't misattributed. This clears the identity but keeps the SDK running.
- **Erase on request.** `clearAllData()` wipes all data the SDK has stored on the device but not yet uploaded — use it to honor a deletion request or a full opt-out.

### React Native

```tsx
import { O2SdkReactNative } from '@openobserve/mobile-react-native';

// After login — id is required, everything else is optional
O2SdkReactNative.setUserInfo({ id: 'user-123', name: 'Ada', email: 'ada@example.com' });

// On logout
O2SdkReactNative.clearUserInfo();

// On a deletion / full opt-out request
O2SdkReactNative.clearAllData();
```

### Android

```kotlin
import com.openobserve.android.OpenObserve

OpenObserve.setUserInfo(id = "user-123", name = "Ada", email = "ada@example.com")
OpenObserve.clearUserInfo()
OpenObserve.clearAllData()
```

### iOS

```swift
import OpenObserveCore

OpenObserve.setUserInfo(id: "user-123", name: "Ada", email: "ada@example.com")
OpenObserve.clearUserInfo()
OpenObserve.clearAllData()
```

## Session Replay privacy levels

Session Replay reconstructs what the user saw. That makes masking essential — and the SDKs default every level to its most private setting, so you have to deliberately opt into showing content. Masking happens **on-device before the recording is serialized**, so unmasked text or images are never transmitted.

There are three independent privacy dimensions:

| Dimension | Levels (default first) | Meaning |
|---|---|---|
| **Text & inputs** | `MASK_ALL` → `MASK_ALL_INPUTS` → `MASK_SENSITIVE_INPUTS` | `MASK_ALL` hides all text and input values. `MASK_ALL_INPUTS` hides only input fields but shows static text. `MASK_SENSITIVE_INPUTS` shows most text and inputs but still masks fields the platform flags as sensitive (passwords, etc.). |
| **Images** | `MASK_ALL` → (`MASK_NON_BUNDLED_ONLY` / `MASK_LARGE_ONLY`) → `MASK_NONE` | `MASK_ALL` hides every image. The middle level shows only images shipped in your app bundle (or, on Android, masks only large images). `MASK_NONE` shows all images. |
| **Touches** | `HIDE` → `SHOW` | `HIDE` omits touch indicators; `SHOW` renders where the user tapped. |

Choose the least revealing level that still gives you useful replays. `MASK_SENSITIVE_INPUTS` plus bundled-only images is a common balance for apps without regulated data; keep `MASK_ALL` if you handle anything you can't risk exposing.

### React Native

```tsx
import {
  SessionReplay,
  TextAndInputPrivacyLevel,
  ImagePrivacyLevel,
  TouchPrivacyLevel,
} from '@openobserve/mobile-react-native-session-replay';

await SessionReplay.enable({
  replaySampleRate: 20,
  textAndInputPrivacyLevel: TextAndInputPrivacyLevel.MASK_ALL,       // default
  imagePrivacyLevel: ImagePrivacyLevel.MASK_ALL,                     // default
  touchPrivacyLevel: TouchPrivacyLevel.HIDE,                         // default
  customEndpoint: 'https://your-openobserve-instance:5080', // bare base URL — the bridge appends /replay itself (SDK 0.1.2+)
});
```

For finer control, wrap any subtree you never want recorded in `<SessionReplayView.Hide>` — it is hidden from replay regardless of the global level. `SessionReplayView.MaskAll`, `.MaskNone`, and the lower-level `.Privacy` are also available:

```tsx
import { SessionReplayView } from '@openobserve/mobile-react-native-session-replay';

<SessionReplayView.Hide>
  <CreditCardForm />
</SessionReplayView.Hide>
```

### Android

```kotlin
import com.openobserve.android.sessionreplay.SessionReplay
import com.openobserve.android.sessionreplay.SessionReplayConfiguration
import com.openobserve.android.sessionreplay.ImagePrivacy
import com.openobserve.android.sessionreplay.TextAndInputPrivacy
import com.openobserve.android.sessionreplay.TouchPrivacy

val replayConfig = SessionReplayConfiguration.Builder(sampleRate = 20f)
    .setTextAndInputPrivacy(TextAndInputPrivacy.MASK_ALL)   // default
    .setImagePrivacy(ImagePrivacy.MASK_ALL)                 // default
    .setTouchPrivacy(TouchPrivacy.HIDE)                     // default
    .build()

SessionReplay.enable(replayConfig)
```

Android also supports per-view overrides so you can hide (or explicitly show) individual views regardless of the global setting — apply them to the specific views that need a different level from the rest of the screen.

### iOS

```swift
import OpenObserveSessionReplay

SessionReplay.enable(
    with: SessionReplay.Configuration(
        replaySampleRate: 20,
        textAndInputPrivacyLevel: .maskAll,   // default
        imagePrivacyLevel: .maskAll,          // default
        touchPrivacyLevel: .hide              // default
    )
)
```

iOS likewise lets you override the privacy level on specific views so a single sensitive control can be masked while the rest of the screen records normally.

## Data scrubbing with event mappers

Consent decides *whether* to collect; event mappers decide *what* each collected event contains. A mapper is a function that runs on-device for every event of a given type. Return the event (optionally with fields redacted) to keep it, or return `null` to drop it entirely. Because mappers run before upload, anything you strip never leaves the device.

Every platform exposes mappers for **view**, **resource**, **action**, **error**, and **long task** events. Common uses:

- Redact tokens or PII from resource URLs and query strings.
- Strip sensitive request or response headers.
- Rename or remove custom attributes you don't want stored.
- Drop entire categories of events (for example, resources to a health-check endpoint).

One limitation to know: **view events can be modified but not dropped** — returning `null` from a view mapper keeps the view. Everything else can be dropped.

### React Native

Set mappers on `rumConfiguration`:

```tsx
rumConfiguration: {
  applicationId: 'YOUR_APPLICATION_ID',
  customEndpoint: 'https://your-openobserve-instance:5080',
  resourceEventMapper: (event) => {
    // Redact a token embedded in the URL
    if (event.resource?.url?.includes('token=')) {
      event.resource.url = event.resource.url.replace(/token=[^&]+/, 'token=REDACTED');
    }
    return event;
  },
  errorEventMapper: (event) => {
    // Drop errors you never want to store
    if (event.error?.message?.includes('IgnoreMe')) return null;
    return event;
  },
},
```

### Android

Set mappers on `RumConfiguration.Builder`:

```kotlin
val rumConfig = RumConfiguration.Builder(applicationId)
    .setResourceEventMapper { event ->
        // Redact sensitive query params, then keep the event
        event
    }
    .setErrorEventMapper { event ->
        if (event.error.message.contains("IgnoreMe")) null else event
    }
    .build()
```

Android provides `setViewEventMapper`, `setResourceEventMapper`, `setActionEventMapper`, `setErrorEventMapper`, and `setLongTaskEventMapper`.

### iOS

Set mapper closures on `RUM.Configuration`:

```swift
var rumConfig = RUM.Configuration(applicationID: "<application id>")

rumConfig.resourceEventMapper = { event in
    // Modify the event, or return nil to drop it
    return event
}
rumConfig.errorEventMapper = { event in
    return event.error.message.contains("IgnoreMe") ? nil : event
}
```

iOS exposes `viewEventMapper`, `resourceEventMapper`, `errorEventMapper`, `actionEventMapper`, and `longTaskEventMapper`. On iOS, the `Authorization` and `Cookie` request headers are **never captured** by network instrumentation, so you don't need a mapper to strip those two — but you should still scrub any other sensitive headers or URL segments your app uses.

## Encryption at rest

Between capture and upload, events are batched to local storage on the device. If your threat model includes a compromised or lost device, encrypt those batches at rest:

- **Android** — supply an `Encryption` implementation via `Configuration.Builder(...).setEncryption(...)`. The SDK encrypts and decrypts batch files through it.
- **iOS** — set the `encryption` option on `OpenObserve.Configuration` to encrypt on-disk batches.
- **React Native** — the JavaScript layer routes uploads through a configurable `proxyConfiguration`; the underlying native layers use the platform storage described above.

```kotlin
// Android — plug in your Encryption implementation
val config = Configuration.Builder(clientToken, env = "production", service = "com.example.app")
    .setEncryption(myEncryption)
    .build()
```

```swift
// iOS — set encryption on the core configuration
let configuration = OpenObserve.Configuration(
    clientToken: "<client token>",
    env: "production",
    encryption: myEncryption
)
```

Uploads themselves always travel over HTTPS to your OpenObserve endpoint. Encryption at rest protects the short-lived on-device batches; it is not a substitute for consent or masking, which keep sensitive data out of the batch in the first place.

## Sampling as a privacy and volume control

Sampling is usually framed as a cost lever, but it is also a privacy lever: data you never collect can never leak. `sessionSampleRate` keeps a percentage of sessions (0–100), and a separate `replaySampleRate` governs Session Replay — keep replay well below your session rate, since it is by far the most sensitive and heaviest data you can capture. Collecting fewer, well-masked sessions is often a better trade than collecting everything and relying on downstream controls.

## GDPR and compliance checklist

The SDKs give you the mechanisms; you remain the data controller. Use this checklist to map them onto your obligations:

- **Lawful basis / consent** — Initialize with `PENDING` and only move to `GRANTED` after an affirmative choice. Never collect on a legal basis you can't defend.
- **Data minimization** — Default Session Replay to `MASK_ALL`, attach the fewest user fields you need with `setUserInfo`, and use event mappers to strip URLs, headers, and attributes you don't query.
- **On-device redaction before send** — Rely on masking and mappers, which run before upload, so sensitive data never leaves the device rather than being deleted after the fact.
- **Right to erasure** — Call `clearAllData()` to purge data still on the device, and delete the user's already-ingested data in OpenObserve itself. Use `clearUserInfo()` on logout so sessions aren't misattributed.
- **Right to withdraw** — Wire a settings toggle to the tracking-consent setter so a user can move to `NOT_GRANTED` at any time.
- **Transparency** — Document in your privacy policy what RUM collects (sessions, views, actions, network metadata, errors, and — if enabled — masked replays) and where it is sent.

## What's next

- [Mobile RUM Overview](./index.md) — the concepts these controls apply to.
- [React Native](./react-native.md), [Android](./android.md), and [iOS](./ios.md) — full platform setup, including where consent fits at init.
- [Best Practices](./best-practices.md) — production tuning, sampling, and cost control.
- Browser RUM privacy controls in the [OpenObserve RUM docs](../index.md).

## Frequently asked questions

### Does the SDK collect anything before the user consents?

No. If you initialize with tracking consent set to PENDING, the SDK buffers nothing to disk and sends nothing to OpenObserve. Events are held in memory only. When you move consent to GRANTED, collection begins; if you set NOT_GRANTED, everything held is dropped. This lets you show a consent prompt on first launch and start collecting only after the user agrees.

### How do I stop tracking a user who opts out later?

Call the tracking-consent setter with NOT_GRANTED at runtime — O2SdkReactNative.setTrackingConsent on React Native, OpenObserve.setTrackingConsent on Android, or OpenObserve.set(trackingConsent:) on iOS. New events stop being collected immediately. To also erase everything already stored on the device but not yet uploaded, call clearAllData().

### What does Session Replay capture by default, and is it safe?

By default Session Replay masks all text and inputs, masks all images, and hides touch indicators. Nothing readable leaves the device unless you deliberately lower a privacy level. Masking is applied on-device before recording data is serialized, so unmasked pixels are never transmitted. You opt into showing content, not out of hiding it.

### Can I remove sensitive fields from events before they are sent?

Yes. Every platform supports event mappers for views, resources, actions, errors, and long tasks. A mapper is a function that receives an event, lets you redact fields such as URLs or attributes, and returns the modified event — or returns null to drop the event entirely. Mappers run on-device before upload, so redacted data never leaves the phone. View events cannot be dropped, only modified.

### Are authorization headers or cookies ever collected?

On iOS, the Authorization and Cookie request headers are never captured by network instrumentation. On all platforms, use resource event mappers to strip any other sensitive headers, query parameters, or URL segments before events are sent. Treat URLs as potentially sensitive and scrub tokens embedded in them.

### Is data encrypted while it waits on the device?

The SDKs batch events to local storage before upload. Android exposes setEncryption(Encryption) and iOS exposes an encryption option on the core configuration so you can encrypt those batches at rest with your own implementation. React Native routes uploads through a configurable proxy. Uploads themselves go over HTTPS to your OpenObserve endpoint.

### How does this help with GDPR and similar regulations?

The consent model lets you gate all collection on a lawful basis, event mappers and Session Replay masking enforce data minimization on-device, and clearAllData() supports the right to erasure for data not yet uploaded. You remain the data controller: you decide what user identifiers you attach with setUserInfo and are responsible for honoring deletion requests in OpenObserve itself.
