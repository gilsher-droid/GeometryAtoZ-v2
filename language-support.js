(() => {
  const supported = ["he", "en", "ar"];
  function syncLanguage() {
    const lang = document.documentElement.lang;
    if (!supported.includes(lang)) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== lang) {
      url.searchParams.set("lang", lang);
      window.history.replaceState(window.history.state, "", url);
    }
    document.querySelectorAll('a[href]').forEach(link => {
      const target = new URL(link.href, window.location.href);
      if (target.origin === "https://fundamatics.com") {
        target.searchParams.set("lang", lang);
        link.href = target.href;
      }
    });
  }
  new MutationObserver(syncLanguage).observe(document.documentElement, {
    attributes: true, attributeFilter: ["lang"]
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncLanguage);
  else syncLanguage();
})();
