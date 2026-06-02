(function () {
  "use strict";

  var ICONS = {
    copy:
      '<svg viewBox="0 0 24 24" style="fill:none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" style="fill:none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    markdown:
      '<svg viewBox="0 0 24 24"><path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6h17.12c.79 0 1.44.63 1.44 1.41v9.18c0 .78-.65 1.41-1.44 1.41M6.81 15.19v-3.66l1.92 2.35 1.92-2.35v3.66h1.93V8.81h-1.93l-1.92 2.35-1.92-2.35H4.89v6.38h1.92M19.69 12h-1.92V8.81h-1.92V12h-1.93l2.89 3.28L19.69 12Z"/></svg>',
    chatgpt:
      '<svg viewBox="0 0 24 24"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.0719.0719 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>',
    claude:
      '<svg viewBox="0 0 24 24"><path d="M17.304 3.541h-3.672l6.696 16.918H24L17.304 3.541ZM6.696 3.541 0 20.459h3.744l1.369-3.553h7.005l1.369 3.553h3.744L10.536 3.541H6.696Zm-.371 10.223 2.291-5.945 2.291 5.945H6.325Z"/></svg>',
    external:
      '<svg viewBox="0 0 24 24" class="llm-page-actions__ext" style="fill:none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
  };

  function getMarkdownPath() {
    var path = window.location.pathname;
    if (path === "/" || path === "") return "/index.md";
    var stripped = path.endsWith("/") ? path.slice(0, -1) : path;
    return stripped + ".md";
  }

  function getMarkdownUrl() {
    return window.location.origin + getMarkdownPath();
  }

  function llmPrompt() {
    return (
      "Read this documentation page and help me with my questions: " +
      getMarkdownUrl()
    );
  }

  function buildMenu() {
    var wrap = document.createElement("div");
    wrap.className = "llm-page-actions";

    var prompt = encodeURIComponent(llmPrompt());

    wrap.innerHTML =
      '<button type="button" class="llm-page-actions__trigger" aria-haspopup="menu" aria-expanded="false">' +
      ICONS.copy +
      "<span>Copy</span>" +
      ICONS.chevron +
      "</button>" +
      '<div class="llm-page-actions__menu" role="menu" hidden>' +
      '<button type="button" role="menuitem" data-action="copy-page">' +
      '<span class="llm-page-actions__icon">' + ICONS.copy + "</span>" +
      "<span>" +
      '<span class="llm-page-actions__item-title">Copy page</span>' +
      '<span class="llm-page-actions__item-desc">Copy page as Markdown for LLMs</span>' +
      "</span></button>" +
      '<a role="menuitem" target="_blank" rel="noopener" href="' + getMarkdownPath() + '">' +
      '<span class="llm-page-actions__icon">' + ICONS.markdown + "</span>" +
      "<span>" +
      '<span class="llm-page-actions__item-title">View as Markdown' + ICONS.external + "</span>" +
      '<span class="llm-page-actions__item-desc">View this page as plain text</span>' +
      "</span></a>" +
      '<hr role="separator">' +
      '<a role="menuitem" target="_blank" rel="noopener" href="https://chatgpt.com/?q=' + prompt + '">' +
      '<span class="llm-page-actions__icon">' + ICONS.chatgpt + "</span>" +
      "<span>" +
      '<span class="llm-page-actions__item-title">Open in ChatGPT' + ICONS.external + "</span>" +
      '<span class="llm-page-actions__item-desc">Ask ChatGPT about this page</span>' +
      "</span></a>" +
      '<a role="menuitem" target="_blank" rel="noopener" href="https://claude.ai/new?q=' + prompt + '">' +
      '<span class="llm-page-actions__icon">' + ICONS.claude + "</span>" +
      "<span>" +
      '<span class="llm-page-actions__item-title">Open in Claude' + ICONS.external + "</span>" +
      '<span class="llm-page-actions__item-desc">Ask Claude about this page</span>' +
      "</span></a>" +
      "</div>";

    return wrap;
  }

  function flashText(el, msg) {
    var titleEl = el.querySelector(".llm-page-actions__item-title");
    var original = titleEl.textContent;
    titleEl.textContent = msg;
    setTimeout(function () {
      titleEl.textContent = original;
    }, 1500);
  }

  async function copyPage(btn) {
    try {
      var resp = await fetch(getMarkdownPath());
      if (!resp.ok) throw new Error("fetch " + resp.status);
      var text = await resp.text();
      await navigator.clipboard.writeText(text);
      flashText(btn, "Copied!");
    } catch (e) {
      flashText(btn, "Copy failed");
    }
  }

  var current = { wrap: null, trigger: null, menu: null, close: null };
  var globalListenersInstalled = false;

  function installGlobalListenersOnce() {
    if (globalListenersInstalled) return;
    globalListenersInstalled = true;
    document.addEventListener("click", function (e) {
      if (!current.wrap || !current.menu || !current.close) return;
      if (current.menu.hidden) return;
      if (!current.wrap.contains(e.target) && !current.menu.contains(e.target)) {
        current.close();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && current.close) current.close();
    });
  }

  function init() {
    var tocInner = document.querySelector(
      ".md-sidebar--secondary .md-sidebar__inner"
    );
    if (!tocInner) return;
    if (tocInner.querySelector(":scope > .llm-page-actions")) return;

    document.querySelectorAll("body > .llm-page-actions__menu").forEach(
      function (n) { n.remove(); }
    );

    var wrap = buildMenu();
    tocInner.insertBefore(wrap, tocInner.firstChild);

    var trigger = wrap.querySelector(".llm-page-actions__trigger");
    var menu = wrap.querySelector(".llm-page-actions__menu");
    document.body.appendChild(menu);

    function positionMenu() {
      var r = trigger.getBoundingClientRect();
      menu.style.top = r.bottom + 4 + "px";
      menu.style.right = window.innerWidth - r.right + "px";
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      window.removeEventListener("scroll", positionMenu, true);
      window.removeEventListener("resize", positionMenu);
    }
    function open() {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      positionMenu();
      window.addEventListener("scroll", positionMenu, true);
      window.addEventListener("resize", positionMenu);
    }

    current.wrap = wrap;
    current.trigger = trigger;
    current.menu = menu;
    current.close = close;

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.hidden ? open() : close();
    });

    installGlobalListenersOnce();

    var copyBtn = wrap.querySelector('[data-action="copy-page"]');
    copyBtn.addEventListener("click", function () {
      copyPage(copyBtn);
    });
  }

  if (typeof window.document$ !== "undefined" && window.document$.subscribe) {
    window.document$.subscribe(init);
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
