// feedback.js

function feedbackModalInit() {
  // Remove any previous event listeners by replacing the button and modal with clones
  const oldBtn = document.querySelector("#feedbackButton");
  const oldModal = document.querySelector("#feedbackModal");
  if (oldBtn) {
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  }
  if (oldModal) {
    const newModal = oldModal.cloneNode(true);
    oldModal.parentNode.replaceChild(newModal, oldModal);
  }

  // Now re-select after replacement  
  const feedbackButton = document.querySelector("#feedbackButton");
  const modal = document.querySelector("#feedbackModal");

  if (!feedbackButton || !modal) {
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
    lastActiveElement = document.activeElement;
    modal.classList.remove("tw-hidden");
    calculatePosition();
    const ta = modal.querySelector("textarea");
    if (ta) ta.focus();
  }

  function closeModal() {
    modal.classList.add("tw-hidden");
    form.reset();
    errorView.classList.add("tw-hidden");
    successView.classList.add("tw-hidden");
    successView.classList.remove("tw-flex");
    try {
      modal.style.top = "";
      modal.style.bottom = "";
    } catch (e) {}
    formView.classList.remove("tw-hidden");
    try {
      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    } catch (e) {}
  }

  function calculatePosition() {
    try {
      const btnRect = feedbackButton.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const buttonCenter = btnRect.top + btnRect.height / 2;
      const placeAbove = buttonCenter > screenHeight / 2;
      modal.classList.remove(
        "tw-top-full",
        "tw-bottom-full",
        "tw-mt-4",
        "tw-mb-4"
      );
      if (placeAbove) {
        modal.classList.add("tw-bottom-full", "tw-mb-4");
        modal.style.bottom = "100%";
        modal.style.top = "";
      } else {
        modal.classList.add("tw-top-full", "tw-mt-4");
        modal.style.top = "100%";
        modal.style.bottom = "";
      }
      if (!modal.classList.contains("tw-right-0"))
        modal.classList.add("tw-right-0");
    } catch (err) {}
  }

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

    setActiveTab(0);
  }

  feedbackButton.addEventListener("click", () => {
    try {
      if (modal.classList.contains("tw-hidden")) {
        openModal();
      } else {
        closeModal();
      }
    } catch (err) {}
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
    if (typeof form.reportValidity === "function") {
      const ok = form.reportValidity();
      if (!ok) {
        return;
      }
    }
    try {
      errorView.classList.add("tw-hidden");
    } catch (err) {}
    const ta =
      form.querySelector("textarea") || modal.querySelector("textarea");
    const message = (ta && ta.value && ta.value.trim()) || "";
    const data = {
      type: (typeInput && typeInput.value) || "Issue",
      message: message,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      source: "feedback_form",
    };
    if (typeof window.trackFeedback === "function") {
      try {
        window.trackFeedback(data);
      } catch (e) {}
    }
    formView.classList.add("tw-hidden");
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
      } catch (err) {}
    });
  });
}

// Run on DOMContentLoaded and MkDocs instant navigation
if (typeof window.document$ !== "undefined") {
  window.document$.subscribe(() => {
    setTimeout(feedbackModalInit, 0);
  });
}
// Always run on DOMContentLoaded (for initial load)
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(feedbackModalInit, 0);
});
