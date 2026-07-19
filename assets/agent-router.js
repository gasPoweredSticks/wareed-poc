// Agent auto-routing: when the tkana widget receives an agent message that
// contains one of our deep links (/?page=...), navigate the page to it —
// the agent "does the action" on the landing page instead of just linking.
(function () {
  const SEEN_KEY = "tkanaRoutedUrls";
  const seen = new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));
  let pending = null;

  // Match /?page=... either relative or absolute on wareed.com.sa / current host
  const LINK_RE = /(?:https?:\/\/(?:www\.)?(?:wareed\.com\.sa|[^\s"'<>]*localhost:\d+)?)?\/?\?page=[\w-]+(?:&id=[\w-]+)?(?:&book=1)?/g;

  function normalize(raw) {
    const q = raw.slice(raw.indexOf("?"));
    return "/" + q; // same-origin path with query
  }

  function samePage(url) {
    const target = new URLSearchParams(url.slice(url.indexOf("?")));
    const here = new URLSearchParams(location.search);
    return (
      (target.get("page") || "home") === (here.get("page") || "home") &&
      (target.get("id") || "") === (here.get("id") || "")
    );
  }

  function scan() {
    const widget = document.querySelector('[class*="tkana-chat-widget"]');
    if (!widget) return;
    const text = widget.innerText || "";
    const links = [...new Set(text.match(LINK_RE) || [])];
    // also collect real anchors inside the widget
    widget.querySelectorAll("a[href*='?page=']").forEach((a) => links.push(a.getAttribute("href")));
    if (!links.length) return;

    // The widget may render newest messages first, so DOM order is unreliable —
    // act on whichever link we haven't routed to yet.
    const fresh = [...new Set(links.map(normalize))].filter((u) => !seen.has(u) && !samePage(u));
    if (!fresh.length) return;
    const url = fresh[fresh.length - 1];

    clearTimeout(pending);
    // small delay so the customer sees the agent message before the page moves
    pending = setTimeout(() => {
      seen.add(url);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
      sessionStorage.setItem("tkanaReopen", "1"); // keep the chat open across the redirect
      const overlay = mountOverlay();
      requestAnimationFrame(() => overlay.classList.add("visible"));
      setTimeout(() => window.location.assign(url), 550); // let the fade-in finish
    }, 1200);
  }

  function mountOverlay() {
    let overlay = document.querySelector(".agent-nav-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "agent-nav-overlay";
    overlay.innerHTML =
      '<div class="nav-card">' +
      '<div class="nav-logo"><img src="/assets/img/logo-mark.svg" alt="" /></div>' +
      '<div class="nav-text">لحظات... نفتح لك الصفحة</div>' +
      '<div class="nav-dots"><span></span><span></span><span></span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  // After an agent-driven redirect: land under the overlay, ease it out, and
  // reopen the chat so the conversation continues
  if (sessionStorage.getItem("tkanaReopen") === "1") {
    sessionStorage.removeItem("tkanaReopen");
    const overlay = mountOverlay();
    overlay.classList.add("visible");
    setTimeout(() => {
      overlay.classList.remove("visible");
      setTimeout(() => overlay.remove(), 600);
    }, 650);
    const tryOpen = setInterval(() => {
      if (window.tkanaChatWidget && typeof window.tkanaChatWidget.open === "function" && document.querySelector(".tkana-chat-bubble")) {
        clearInterval(tryOpen);
        window.tkanaChatWidget.open();
      }
    }, 400);
    setTimeout(() => clearInterval(tryOpen), 15000);
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
