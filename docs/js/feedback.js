// feedback.js
document.addEventListener("DOMContentLoaded", () => {
  const feedbackButton = document.querySelector("#feedbackButton");
  const modal = document.querySelector("#feedbackModal");

  if (!feedbackButton || !modal) {
    console.warn(
      "Feedback widget: #feedbackButton or #feedbackModal not found in DOM. Feedback widget disabled."
    );
    return;
  }

  const form = modal.querySelector("form");
  const successView = modal.querySelector(".success-view");
  const formView = modal.querySelector(".form-view");
  const errorView = modal.querySelector(".error-view");
  const tabs = modal.querySelectorAll(".feedback-tab");
  let lastActiveElement = null;

  // Ensure the form exists before touching it
  if (!form) {
    console.warn(
      "Feedback widget: form inside #feedbackModal not found. Feedback disabled."
    );
    return;
  }

  // ensure there's an input[name=type] for the form (hidden) so the submit code can read it
  let typeInput = form.querySelector("input[name=type]");
  if (!typeInput) {
    typeInput = document.createElement("input");
    typeInput.type = "hidden";
    typeInput.name = "type";
    typeInput.value = "Issue";
    form.appendChild(typeInput);
  }

  function openModal() {
    // store previous active element so we can restore focus when modal closes
    lastActiveElement = document.activeElement;
    modal.classList.remove("tw-hidden");
    calculatePosition();
    // focus the textarea for immediate typing if present
    const ta = modal.querySelector("textarea");
    if (ta) ta.focus();
  }

  function closeModal() {
    modal.classList.add("tw-hidden");
    form.reset();
    errorView.classList.add("tw-hidden");
    successView.classList.add("tw-hidden");
    // remove layout class when hidden to avoid display conflicts
    successView.classList.remove("tw-flex");
    // clear any inline positioning set during calculatePosition
    try {
      modal.style.top = "";
      modal.style.bottom = "";
    } catch (e) {
      /* ignore */
    }
    formView.classList.remove("tw-hidden");
    // restore focus to previously active element
    try {
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    } catch (e) {
      /* ignore */
    }
  }

  function calculatePosition() {
    // class-based positioning like the Vue component: toggle top-full / bottom-full
    try {
      const btnRect = feedbackButton.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const buttonCenter = btnRect.top + btnRect.height / 2;
      const placeAbove = buttonCenter > screenHeight / 2;

      // rely on CSS classes and the parent .tw-relative for positioning
      modal.classList.remove(
        "tw-top-full",
        "tw-bottom-full",
        "tw-mt-4",
        "tw-mb-4"
      );
      if (placeAbove) {
        modal.classList.add("tw-bottom-full", "tw-mb-4");
        // explicitly position above using inline style to avoid CSS specificity issues
        modal.style.bottom = "100%";
        modal.style.top = "";
      } else {
        modal.classList.add("tw-top-full", "tw-mt-4");
        // explicitly position below
        modal.style.top = "100%";
        modal.style.bottom = "";
      }
      // ensure right alignment like Vue: right-0 on the modal container
      if (!modal.classList.contains("tw-right-0"))
        modal.classList.add("tw-right-0");
    } catch (err) {
      console.error("Feedback widget: calculatePosition failed", err);
    }
  }

  // wire tab clicks with keyboard navigation and ARIA handling
  if (tabs && tabs.length) {
    const setActiveTab = (index) => {
      tabs.forEach((tb, i) => {
        const selected = i === index;
        tb.classList.toggle("tw-bg-white", selected);
        tb.classList.toggle("tw-text-gray-900", selected);
        tb.classList.toggle("tw-shadow-sm", selected);
        tb.setAttribute("aria-selected", selected ? "true" : "false");
        if (selected) {
          const type = tb.getAttribute("data-type") || tb.textContent.trim();
          typeInput.value = type;
          const ta = modal.querySelector("textarea");
          if (ta) ta.placeholder = `Type your ${type.toLowerCase()} here...`;
        }
      });
    };

    tabs.forEach((t, idx) => {
      t.addEventListener("click", () => {
        setActiveTab(idx);
        t.focus();
      });

      t.addEventListener("keydown", (ev) => {
        const key = ev.key;
        let newIndex = null;
        if (key === "ArrowRight") newIndex = (idx + 1) % tabs.length;
        else if (key === "ArrowLeft")
          newIndex = (idx - 1 + tabs.length) % tabs.length;
        else if (key === "Home") newIndex = 0;
        else if (key === "End") newIndex = tabs.length - 1;

        if (newIndex !== null) {
          ev.preventDefault();
          setActiveTab(newIndex);
          tabs[newIndex].focus();
        }
      });
    });

    // init
    setActiveTab(0);
  }

  feedbackButton.addEventListener("click", () => {
    try {
      if (modal.classList.contains("tw-hidden")) {
        openModal();
      } else {
        closeModal();
      }
    } catch (err) {
      console.error("Feedback widget: error toggling modal", err);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.addEventListener("mousedown", (e) => {
    if (!modal.contains(e.target) && !feedbackButton.contains(e.target)) {
      closeModal();
    }
  });

  window.addEventListener("resize", calculatePosition);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // First, let the browser run HTML5 validation UI (native popup) if any
    // required fields are missing. reportValidity() will show the native
    // validation message and return false if invalid.
    if (typeof form.reportValidity === "function") {
      const ok = form.reportValidity();
      if (!ok) {
        // browser showed a native message; stop submission
        return;
      }
    }

    // hide any previous custom error
    try {
      errorView.classList.add("tw-hidden");
    } catch (err) {
      /* ignore */
    }

    // grab textarea and read trimmed value (we already know it's non-empty)
    const ta =
      form.querySelector("textarea") || modal.querySelector("textarea");
    const message = (ta && ta.value && ta.value.trim()) || "";

    const data = {
      // use the prepared hidden input value (always present)
      type: (typeInput && typeInput.value) || "Issue",
      message: message,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      source: "feedback_form",
    };

    // Track feedback in Segment (if segment.js is loaded)
    if (typeof window.trackFeedback === "function") {
      try {
        window.trackFeedback(data);
      } catch (e) {
        // Segment tracking error should not block submission
        console.error("Segment trackFeedback error:", e);
      }
    }

    // show immediate success view (keeps original UX), then submit in background
    formView.classList.add("tw-hidden");
    // ensure success view displays as flex column when visible
    successView.classList.add("tw-flex");
    successView.classList.remove("tw-hidden");

    setTimeout(closeModal, 1500);

    fetch(
      "https://script.google.com/macros/s/AKfycby5A7NSQCmG4KIBdM0HkRP-5zpRPy8aTrQHiQoe9uG_c_rv1VCiAnnZE8co7-kofgw-hg/exec",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }
    ).catch(() => {
      // network failure: hide success and show error
      try {
        successView.classList.add("tw-hidden");
        successView.classList.remove("tw-flex");
        formView.classList.remove("tw-hidden");
        if (errorView) {
          errorView.textContent =
            "Failed to submit feedback. Please try again.";
          errorView.classList.remove("tw-hidden");
        }
        if (ta && typeof ta.focus === "function") ta.focus();
      } catch (err) {
        /* ignore */
      }
    });
  });
});
