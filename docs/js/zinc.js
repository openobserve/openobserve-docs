(function() {
  // Helper function to generate a UUID
  function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
      d += performance.now(); // use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // Helper function to set a cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  // Helper function to get a cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  // Check if UUID cookie exists, if not, set it
  var uuid = getCookie("uuid");
  if (!uuid) {
    uuid = generateUUID();
    setCookie("uuid", uuid, 365); // set cookie to expire in 365 days
  }

  // Capture domain
  var domain = window.location.hostname;

  // Capture page URL
  var pageUrl = window.location.href;

  // Capture referrer URL
  var referrerUrl = document.referrer || '';

  // Prepare data object
  var data = {
    "type": "track",
    "event": "pageView",
    "properties": {
      "domain": domain,
      "pageUrl": pageUrl,
      "referer": referrerUrl,
      "anonymousId": uuid // Include the UUID in the properties
    }
  };

  // Send POST request
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://e1.zinclabs.dev/v1/track", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
})();
