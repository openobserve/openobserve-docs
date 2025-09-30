// docs/js/segment.js

function getAnonymousId() {
  let anonId = localStorage.getItem("segment_anonymous_id");
  if (!anonId) {
    anonId =
      "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("segment_anonymous_id", anonId);
  }
  return anonId;
}

function getSegmentProxyUrl() {
  // Set your Segment proxy URL here or from a global variable
  return "https://swisspipe.dev.zinclabs.dev/api/v1/4e5cac41-4d34-46f9-b862-e7ac551b5a8f/trigger"; // e.g., set in your template
}

function trackFeedback(feedbackData) {
  const proxyUrl = getSegmentProxyUrl();
  if (!proxyUrl) {
    console.warn("Segment proxy URL not set");
    return;
  }
  const message = {
    user: { anonymousId: getAnonymousId() },
    event: "O2 Website Docs Feedback",
    properties: feedbackData,
    timestamp: new Date().toISOString(),
    type: "track",
  };
  console.log("[Segment] trackFeedback called");
  console.log("[Segment] Proxy URL:", proxyUrl);
  console.log("[Segment] Payload:", message);
  fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })
    .then((res) => {
      console.log("[Segment] Response status:", res.status, res.statusText);
      return res.text().then((text) => {
        console.log("[Segment] Response body:", text);
      });
    })
    .catch((e) => {
      console.error("Segment trackFeedback error:", e);
    });
}

window.trackFeedback = trackFeedback;
