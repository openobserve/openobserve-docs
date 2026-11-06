// OpenObserve RUM + Browser Logs instrumentation for the docs site.
//
// Loads the browser-rum and browser-logs bundles from jsDelivr, then
// initializes Real User Monitoring, session replay and error log forwarding.
//
// The bundles expose the globals `window.OO_RUM` and `window.OO_LOGS`.
// Everything is guarded so it runs at most once, even with the theme's
// `navigation.instant` (SPA-style) navigation re-executing page scripts.
(function () {
  // Only instrument the live docs site — skip local previews / mkdocs serve.
  // Override with `?rum=1` to force RUM on any host (for local testing).
  var host = window.location.hostname;
  var isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local");
  var forceRum = /[?&]rum=1(&|$)/.test(window.location.search);
  if (isLocal && !forceRum) {
    return;
  }

  // Guard against double initialization (instant navigation, duplicate loads).
  if (window.__ooRumInitialized) {
    return;
  }
  window.__ooRumInitialized = true;

  var RUM_SRC =
    "https://cdn.jsdelivr.net/npm/@openobserve/browser-rum@0.3.4/bundle/openobserve-rum.min.js";
  var LOGS_SRC =
    "https://cdn.jsdelivr.net/npm/@openobserve/browser-logs@0.3.4/bundle/openobserve-logs.min.js";

  var options = {
    clientToken: "rumSrLmzRxM2F9BErL2",
    applicationId: "o2-website",
    site: "api.introspect.external.zinclabs.dev",
    service: "o2-docs",
    env: "production",
    version: "0.0.1",
    organizationIdentifier: "default",
    insecureHTTP: false,
    apiVersion: "v1",
  };

  // ---- Error noise filters -------------------------------------------------
  // Mirrors the filters on the marketing site (website5 OpenObserveRUM.astro)
  // so Error Tracking only shows errors we can act on.

  // Hosts we own. Errors raised by scripts anywhere else come from GTM-loaded
  // vendors (Vector, LinkedIn, Clarity, Plausible, ...) or browser extensions.
  var FIRST_PARTY_HOSTS = [
    window.location.hostname,
    "openobserve.ai",
    "zinclabs.dev",
  ];

  // 1. A request died: offline, a flaky connection, or an ad/privacy blocker
  //    (Chrome, Safari and Firefox word it differently). Vendors console.error
  //    these with their own prefix ("Fetch error: ", "load error: "), so only
  //    the end is matched. Covers "Failed to fetch", "load error: TypeError:
  //    Failed to fetch" and "Fetch error: TypeError: Failed to fetch".
  var NETWORK_FAILURE = [
    /(^|: )(TypeError: )?(Failed to fetch|Load failed)$/,
    /NetworkError when attempting to fetch resource/,
  ];

  // 2. "Script error." is what the browser reports for an exception thrown by
  //    a cross-origin script: message, file and stack are all stripped, so
  //    there is nothing to act on.
  var IGNORED_MESSAGES = NETWORK_FAILURE.concat([
    /^(Uncaught )?"?Script error\.?"?$/,
    /ResizeObserver loop/,
  ]);

  function isIgnoredMessage(message) {
    message = message || "";
    for (var i = 0; i < IGNORED_MESSAGES.length; i++) {
      if (IGNORED_MESSAGES[i].test(message)) return true;
    }
    return false;
  }

  function hostOf(url) {
    try {
      return url ? new URL(url, window.location.href).hostname : "";
    } catch (e) {
      return "";
    }
  }

  function isFirstParty(host) {
    for (var i = 0; i < FIRST_PARTY_HOSTS.length; i++) {
      var h = FIRST_PARTY_HOSTS[i];
      if (host === h || host.slice(-(h.length + 1)) === "." + h) return true;
    }
    return false;
  }

  // The RUM/logs SDK bundles themselves (loaded from jsDelivr). Their console
  // wrapper frames sit on top of every console.error's handling stack, so they
  // are skipped to find the code that actually called console.error.
  var SDK_FRAME = /\/npm\/@openobserve\/browser-(rum|logs)@/;

  // 3. True when the error was raised by a script we don't host: the first
  //    stack frame that isn't the SDK or the page document is on a third-party
  //    host. Vendor tags (e.g. Vector's pixel.js logging "Error creating
  //    visitor via new-visitor endpoint, falling back to legacy visitor flow
  //    TypeError: Failed to fetch") fail in ways we can't fix, so they are
  //    dropped by origin rather than listing every message. Only the first
  //    such frame counts, since vendor stacks still pass through our page.
  function fromThirdParty(stack) {
    if (!stack) return false;
    var page = window.location.href.split("#")[0];
    var lines = String(stack).split("\n").slice(1); // line 0 is the message
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (
        !/@ (https?|chrome-extension|moz-extension|safari-web-extension):\/\//.test(
          line
        )
      ) {
        continue;
      }
      var url = line
        .slice(line.lastIndexOf("@ ") + 2)
        .replace(/:\d+(:\d+)?$/, "");
      if (url === page || SDK_FRAME.test(url)) continue;
      var host = hostOf(url);
      return !!host && !isFirstParty(host);
    }
    return false;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error("Failed to load " + src));
      };
      document.head.appendChild(s);
    });
  }

  Promise.all([loadScript(RUM_SRC), loadScript(LOGS_SRC)])
    .then(function () {
      var rum = window.OO_RUM;
      var logs = window.OO_LOGS;
      if (!rum || !logs) {
        return;
      }

      rum.init({
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
        defaultPrivacyLevel: "allow", // 'allow' | 'mask-user-input' | 'mask'
        // Enables end-to-end trace correlation from RUM to backend services by
        // injecting tracing headers into matched outgoing requests.
        allowedTracingUrls: [],
        sessionSampleRate: 100, // Track 100% of sessions
        sessionReplaySampleRate: 100, // Record 100% of sessions
        // RUM collects console errors and unhandled rejections itself (this
        // feeds Error Tracking), so the noise filters apply here too. Thrown
        // errors carry `stack`; console errors only `handling_stack`.
        beforeSend: function (event) {
          if (event.type !== "error") return true;
          var error = event.error || {};
          return !(
            isIgnoredMessage(error.message) ||
            fromThirdParty(error.stack || error.handling_stack)
          );
        },
      });

      logs.init({
        clientToken: options.clientToken,
        site: options.site,
        organizationIdentifier: options.organizationIdentifier,
        service: options.service,
        env: options.env,
        version: options.version,
        forwardErrorsToLogs: true,
        insecureHTTP: options.insecureHTTP,
        apiVersion: options.apiVersion,
        beforeSend: function (event, context) {
          if (event.origin === "network") {
            var http = event.http || {};
            // Always keep server errors, from anyone.
            if ((http.status_code || 0) >= 500) return true;
            // Aborted by navigation: not a real failure.
            if (context && context.isAborted) return false;
            // Status 0 to a third-party host = blocked by an ad/privacy blocker.
            return isFirstParty(hostOf(http.url));
          }
          if (isIgnoredMessage(event.message)) return false;
          if (
            (event.origin === "source" || event.origin === "console") &&
            fromThirdParty(
              (event.error && event.error.stack) ||
                (context && context.handlingStack)
            )
          ) {
            return false;
          }
          return true;
        },
      });

      // Default anonymous user context; call setUser() elsewhere once known.
      rum.setUser({
        id: "1",
        name: "Anonymous user",
        email: "anonymous@openobserve.ai",
      });

      rum.startSessionReplayRecording();
    })
    .catch(function (err) {
      // Never let instrumentation break the page.
      if (window.console && console.warn) {
        console.warn("OpenObserve RUM failed to load:", err);
      }
    });
})();
