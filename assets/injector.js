(() => {
  // Previously this injected `assets/content.js` into the page context
  // which caused a duplicate execution without extension APIs (chrome.*)
  // and led to timeouts for `preTaskHooks` / `registerAccounts`.
  // Keep only the forwarding bridge from page -> extension here.

  window.addEventListener("message", event => {
    if (event.source !== window || !event?.data?.type) return;
    if (!["_localeFormatterCalled", "_markAsLoggedIn", "_saveUserData"].includes(event.data.type)) return;
    try {
      chrome.runtime.sendMessage({
        type: "adblock:info:to-background",
        isEmit: true,
        data: {
          type: event.data.type,
          data: event.data.text
        }
      });
    } catch (e) {
      // chrome.runtime may be unavailable in some contexts; swallow and log to page console
      console.warn('injector: failed to forward message to background', e);
    }
  });
})();
