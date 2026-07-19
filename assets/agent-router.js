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

    const raw = links[links.length - 1]; // most recent mention wins
    const url = normalize(raw);
    if (seen.has(url) || samePage(url)) return;

    clearTimeout(pending);
    // small delay so the customer sees the agent message before the page moves
    pending = setTimeout(() => {
      seen.add(url);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
      sessionStorage.setItem("tkanaReopen", "1"); // keep the chat open across the redirect
      window.location.assign(url);
    }, 1200);
  }

  // After an agent-driven redirect, reopen the chat so the conversation continues
  if (sessionStorage.getItem("tkanaReopen") === "1") {
    sessionStorage.removeItem("tkanaReopen");
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
