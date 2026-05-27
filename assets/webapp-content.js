/**
 * Web App Content Script (Auto-Login Sync)
 * Injected into localhost:5173 and *.vercel.app to detect Supabase session
 * and securely pass it to the extension background.
 */

function scanForSupabaseSession() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Look for the Supabase auth token key (e.g., sb-pkzkoixryggxktaybwkp-auth-token)
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const value = localStorage.getItem(key);
        if (value) {
          const session = JSON.parse(value);
          if (session && session.access_token && session.refresh_token) {
            console.log("[DmDroid] Auto-login: Found valid Supabase session. Syncing to background...");
            // Send to extension background
            chrome.runtime.sendMessage({
              type: "HUB_SESSION_SYNCED",
              payload: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token
              }
            }).then(() => {
              console.log("[DmDroid] Auto-login sync successful.");
            }).catch((err) => {
              console.log("[DmDroid] Auto-login sync error (background might not be listening):", err);
            });
            return true; // Successfully found and sent
          } else {
            console.log("[DmDroid] Auto-login: Found token, but it did not have access/refresh tokens.", session);
          }
        }
      }
    }
  } catch (err) {
    console.error("[DmDroid] Auto-Login Sync Error:", err);
  }
  return false;
}

// Initial scan
scanForSupabaseSession();

// Periodically check in case they log in later while keeping the tab open
setInterval(() => {
  scanForSupabaseSession();
}, 2000);
