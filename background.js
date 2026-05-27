const SUPABASE_URL = "https://pkzkoixryggxktaybwkp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBremtvaXhyeWdneGt0YXlid2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDQ2MDQsImV4cCI6MjA5MjE4MDYwNH0.G21RTb9scU7biERl1HqKQYOCUYV4pKStKF9Ls4lo8rY";

let state = {
  accessToken: null,
  refreshToken: null,
  browserId: null,
  browserLabel: null,
  stats: { completed: 0, failed: 0 },
  isProcessing: false,
  processingLockAcquiredAt: 0,
  instagramTabId: null
};

// ---------------------------------------------------------------------------
// Supabase REST Client
// ---------------------------------------------------------------------------
async function supabaseReq(path, method = "GET", body = null, _retried = false) {
  const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${state.accessToken ? state.accessToken : SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, options);
  if (res.status === 401 && !_retried && state.refreshToken) {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Token expired, refreshing..." }).catch(()=>null);
    const refreshed = await refreshAccessToken();
    if (refreshed) return supabaseReq(path, method, body, true);
  }
  if (!res.ok) {
    throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: state.refreshToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || "Refresh failed");
    state.accessToken = data.access_token;
    state.refreshToken = data.refresh_token;
    await chrome.storage.local.set({ accessToken: state.accessToken, refreshToken: state.refreshToken });
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Token refreshed!" }).catch(()=>null);
    return true;
  } catch (err) {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Refresh failed: ${err.message}` }).catch(()=>null);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Extension Core Logic
// ---------------------------------------------------------------------------

async function init() {
  const data = await chrome.storage.local.get(['accessToken', 'refreshToken', 'browserId', 'browserLabel', 'stats', 'instagramTabId']);
  if (data.accessToken) state.accessToken = data.accessToken;
  if (data.refreshToken) state.refreshToken = data.refreshToken;
  if (data.browserId) state.browserId = data.browserId;
  if (data.browserLabel) state.browserLabel = data.browserLabel;
  if (data.stats) state.stats = data.stats;
  if (data.instagramTabId) state.instagramTabId = data.instagramTabId;

  if (state.refreshToken && state.browserId) {
    await refreshAccessToken();
    startEngine();
  } else if (state.accessToken && state.browserId) {
    startEngine();
  }
}

async function handleLogin(email, password) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error_description || data.msg || "Authentication failed");
    
    state.accessToken = data.access_token;
    state.refreshToken = data.refresh_token;
    await chrome.storage.local.set({ accessToken: state.accessToken, refreshToken: state.refreshToken });

    chrome.runtime.sendMessage({ type: "HUB_LOGIN_SUCCESS" }).catch(()=>null);
  } catch(err) {
    chrome.runtime.sendMessage({ type: "HUB_LOGIN_ERROR", error: err.message }).catch(()=>null);
  }
}

function getUserIdFromToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).sub;
  } catch (e) {
    return null;
  }
}

async function fetchBrowsers() {
  try {
    const userId = getUserIdFromToken(state.accessToken);
    const filter = userId ? `user_id=eq.${userId}&` : '';
    const browsers = await supabaseReq(`browser_instances?${filter}select=id,label,instance_key&order=created_at.desc`);
    chrome.runtime.sendMessage({ type: "FETCH_BROWSERS_SUCCESS", browsers }).catch(()=>null);
  } catch (err) {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Fetch browsers error: ${err.message}` }).catch(()=>null);
  }
}

async function handleConnect(browserId, browserLabel) {
  if (browserId.startsWith("MANUAL_KEY:")) {
    const manualKey = browserId.split(":")[1];
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Resolving manual key ${manualKey}...` }).catch(()=>null);
    try {
      const res = await supabaseReq(`browser_instances?instance_key=eq.${manualKey}&select=id`);
      if (res && res.length > 0) {
        browserId = res[0].id;
        chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Resolved manually!` }).catch(()=>null);
      } else {
        throw new Error("Pairing key not found in DB");
      }
    } catch (err) {
      chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Resolve Error: ${err.message}` }).catch(()=>null);
      chrome.runtime.sendMessage({ type: "HUB_CONNECTED_ERROR", error: err.message }).catch(()=>null);
      return;
    }
  }

  state.browserId = browserId;
  state.browserLabel = browserLabel;
  state.stats = { completed: 0, failed: 0 };
  
  await chrome.storage.local.set({ 
    browserId: state.browserId, 
    browserLabel: state.browserLabel,
    stats: state.stats 
  });

  startEngine();
  chrome.runtime.sendMessage({ type: "HUB_CONNECTED_SUCCESS", label: state.browserLabel, stats: state.stats }).catch(()=>null);
}

function startEngine() {
  stopEngine();
  console.log(`Starting Engine with Browser ID: ${state.browserId}`);
  chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Engine started for ${state.browserLabel}` }).catch(()=>null);
  
  // Create alarms for Manifest V3 background script
  chrome.alarms.create("engine_heartbeat", { periodInMinutes: 1 });
  chrome.alarms.create("engine_poll", { periodInMinutes: 0.25 }); // 15 seconds
  chrome.alarms.create("engine_refresh_token", { periodInMinutes: 45 }); // Refresh JWT every 45 min

  // Trigger initial runs
  sendHeartbeat();
  pollTasks();
}

function stopEngine() {
  chrome.alarms.clear("engine_heartbeat");
  chrome.alarms.clear("engine_poll");
  chrome.alarms.clear("engine_refresh_token");
  state.isProcessing = false;
  console.log("Engine stopped.");
}

// Listen to alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "engine_heartbeat") {
    sendHeartbeat();
  } else if (alarm.name === "engine_poll") {
    pollTasks();
  } else if (alarm.name === "engine_refresh_token") {
    refreshAccessToken();
  }
});

async function sendHeartbeat() {
  if (!state.browserId) return;
  try {
    await supabaseReq(`browser_instances?id=eq.${state.browserId}`, "PATCH", {
      last_heartbeat_at: new Date().toISOString(),
      status: 'active'
    });
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Heartbeat sent! Status: active` }).catch(()=>null);
  } catch (err) {
    console.error("Heartbeat failed:", err);
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Heartbeat Error: ${err.message}` }).catch(()=>null);
  }
}

// ---------------------------------------------------------------------------
// Pacing Engine Helpers
// ---------------------------------------------------------------------------

async function checkDailyLimit() {
  const data = await chrome.storage.local.get(['pacingSettings', 'dailyStats']);
  const settings = data.pacingSettings || { dailyLimit: 30, baseDelay: 90, minVariance: 5, maxVariance: 300 };
  
  let stats = data.dailyStats || { date: new Date().toDateString(), sent: 0 };
  
  if (stats.date !== new Date().toDateString()) {
    // Reset for new day
    stats = { date: new Date().toDateString(), sent: 0 };
    await chrome.storage.local.set({ dailyStats: stats });
  }
  
  return {
    isLimited: stats.sent >= settings.dailyLimit,
    sent: stats.sent,
    limit: settings.dailyLimit,
    settings: settings
  };
}

async function incrementDailyLimit() {
  const data = await chrome.storage.local.get(['dailyStats']);
  let stats = data.dailyStats || { date: new Date().toDateString(), sent: 0 };
  stats.sent += 1;
  await chrome.storage.local.set({ dailyStats: stats });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function pollTasks() {
  if (!state.browserId) return;
  if (state.isProcessing) {
    // Safety auto-unlock if stuck for more than 10 minutes (600,000 ms)
    if (Date.now() - state.processingLockAcquiredAt > 600000) {
      chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `[System] Auto-recovering locked engine.` }).catch(()=>null);
      state.isProcessing = false;
    } else {
      // Normal pacing block — silently return to avoid log spam
      return;
    }
  }

  // Check if engine is paused by user
  const pauseData = await chrome.storage.local.get('enginePaused');
  if (pauseData.enginePaused) {
    return; // Silently skip polling when paused
  }
  
  try {
    const limitCheck = await checkDailyLimit();
    if (limitCheck.isLimited) {
      chrome.runtime.sendMessage({ 
        type: "DEBUG_LOG", 
        msg: `[Pacing] Daily limit reached (${limitCheck.sent}/${limitCheck.limit}). Pausing tasks until tomorrow.` 
      }).catch(()=>null);
      return;
    }

    const url = `dm_tasks?select=*&browser_instance_id=eq.${state.browserId}&status=eq.pending&order=created_at.asc&limit=1`;
    // 1. Fetch pending task
    const tasks = await supabaseReq(url);

    if (!tasks || tasks.length === 0) {
      // Diagnostic check: what CAN we see?
      const allTasks = await supabaseReq(`dm_tasks?select=id,status,browser_instance_id,task_type`);
      chrome.runtime.sendMessage({ 
        type: "DEBUG_LOG", 
        msg: `[Poll] 0 pending tasks found for ${state.browserId}. Diagnostic: visible tasks total = ${allTasks ? allTasks.length : 0}` 
      }).catch(()=>null);
      
      if (allTasks && allTasks.length > 0) {
         chrome.runtime.sendMessage({ 
           type: "DEBUG_LOG", 
           msg: `[Poll] First visible task: status=${allTasks[0].status}, browserId=${allTasks[0].browser_instance_id}` 
         }).catch(()=>null);
      }
      return; // Not processing, will retry on next alarm naturally
    }
    
    const task = tasks[0];
    state.isProcessing = true;
    state.processingLockAcquiredAt = Date.now();
    
    // Fetch contact separately if it's a DM task
    if (task.contact_id) {
      const contacts = await supabaseReq(`contacts?select=username&id=eq.${task.contact_id}`);
      if (contacts && contacts.length > 0) {
        task.contacts = contacts[0];
      }
    }

    // 2. Claim task (Processing)
    await supabaseReq(`dm_tasks?id=eq.${task.id}`, "PATCH", {
      status: "processing"
    });

    console.log("Processing task:", task);
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Processing task: ${task.task_type}` }).catch(()=>null);

    // 3. Execute
    let result;
    try {
      result = await executeTask(task);
      
      // 4a. Success
      await supabaseReq(`dm_tasks?id=eq.${task.id}`, "PATCH", {
        status: "completed",
        completed_at: new Date().toISOString()
      });
      
      // Update contact pipeline status
      if (task.contact_id && task.task_type === 'first_dm') {
        await supabaseReq(`contacts?id=eq.${task.contact_id}`, "PATCH", {
          status: "dmed",
          dmed_at: new Date().toISOString()
        });
      }
      
      state.stats.completed++;
      chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Task Completed: ${task.task_type}` }).catch(()=>null);
    } catch (err) {
      // 4b. Failed
      console.error("Task failed:", err);
      await supabaseReq(`dm_tasks?id=eq.${task.id}`, "PATCH", {
        status: "failed",
        error_reason: err.message || String(err)
      });
      state.stats.failed++;
      chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Task Failed: ${err.message}` }).catch(()=>null);
    }

    // Save stats & UI update
    await chrome.storage.local.set({ stats: state.stats });
    chrome.runtime.sendMessage({ type: "STATS_UPDATE", stats: state.stats }).catch(()=>null);

    // Only increment daily limit if it was actually a DM
    if (task.task_type === 'first_dm' || task.task_type === 'followup_1a') {
      await incrementDailyLimit();
    }

    // PACING INJECTION: Hold lock for randomized delay
    const extra = randomInt(limitCheck.settings.minVariance, limitCheck.settings.maxVariance);
    const delayMs = Math.max(0, limitCheck.settings.baseDelay + extra) * 1000;
    
    chrome.runtime.sendMessage({ 
      type: "DEBUG_LOG", 
      msg: `[Pacing] Sleeping for ${Math.round(delayMs/1000)}s to mimic human break...` 
    }).catch(()=>null);

    setTimeout(() => {
      state.isProcessing = false;
      chrome.runtime.sendMessage({ 
        type: "DEBUG_LOG", 
        msg: `[Pacing] Waking up, ready for next task.` 
      }).catch(()=>null);
    }, delayMs);

  } catch (err) {
    console.error("Polling error:", err);
    state.isProcessing = false; // Drop lock on hard crash
  }
}

// ---------------------------------------------------------------------------
// Instagram Tab & Content Script Communication
// ---------------------------------------------------------------------------

async function executeTask(task) {
  if (task.task_type === 'first_dm' || task.task_type === 'followup_1a') {
    const targetUsername = task.contacts?.username;
    if (!targetUsername) throw new Error("Missing target username in contact relation");

    const nameSettings = await chrome.storage.local.get('usePreresolvedNames');
    const usePreresolved = nameSettings.usePreresolvedNames !== false; // default ON

    const payload = {
      target: { username: targetUsername },
      message: { text: task.message_text },
      taskId: task.id,
      usePreresolvedNames: usePreresolved
    };
    
    const res = await sendTaskToContent("sendMessage", payload);
    if (!res?.success) throw new Error(res?.error?.error || "Send message failed");
    return true;
  } 
  else if (task.task_type === 'scrape_followers' || task.task_type === 'scrape_following') {
    return new Promise(async (resolve, reject) => {
      let resolved = false;

      const handler = async (message) => {
        if (message.type === "adblock:info:to-background" && message.isEmit) {
          const payload = message.data;
          if (payload.type === "successTask" && payload.data.taskId === task.id) {
            if (resolved) return;
            resolved = true;
            chrome.runtime.onMessage.removeListener(handler);
            
            try {
              const targets = payload.data.targets;
              if (targets && targets.length > 0) {
                // 1. Create Target List
                const params = JSON.parse(task.message_text);
                const typeStr = task.task_type === 'scrape_followers' ? "followers" : "following";
                
                const listRes = await supabaseReq(`target_lists`, "POST", {
                  user_id: task.user_id,
                  name: `Scraped: ${params.target} (${typeStr})`,
                  type: "raw",
                  count: targets.length
                });

                if (listRes && listRes.length > 0) {
                  const listId = listRes[0].id;
                  
                  // 2. Insert Contacts (batch of 1000 max to avoid payload limits)
                  let contactIds = [];
                  for (let i = 0; i < targets.length; i += 1000) {
                    const chunk = targets.slice(i, i + 1000);
                    const contactsToInsert = chunk.map(t => ({
                      user_id: task.user_id,
                      username: t.username,
                      full_name: t.fullName || t.username,
                      profile_link: `https://instagram.com/${t.username}`,
                      status: 'not_started'
                    }));
                    
                    const cRes = await supabaseReq(`contacts?select=id`, "POST", contactsToInsert);
                    if (cRes) contactIds = contactIds.concat(cRes.map(c => c.id));
                  }

                  // 3. Link Contacts to Target List
                  for (let i = 0; i < contactIds.length; i += 1000) {
                    const chunk = contactIds.slice(i, i + 1000);
                    const links = chunk.map(cId => ({
                      target_list_id: listId,
                      contact_id: cId
                    }));
                    await supabaseReq(`target_list_items`, "POST", links);
                  }
                }
              }
              resolve(true);
            } catch (err) {
              reject(err);
            }
          } else if (payload.type === "errorTask" && payload.data.taskId === task.id) {
            if (resolved) return;
            resolved = true;
            chrome.runtime.onMessage.removeListener(handler);
            reject(new Error(payload.data.error || "Scraping failed"));
          }
        }
      };
      
      chrome.runtime.onMessage.addListener(handler);

      const params = JSON.parse(task.message_text);
      const res = await sendTaskToContent("parsing", {
        taskId: task.id,
        username: params.target,
        type: task.task_type === 'scrape_followers' ? "followers" : "following",
        limit: params.limit
      });
      
      if (!res?.success) {
         if (!resolved) {
           resolved = true;
           chrome.runtime.onMessage.removeListener(handler);
           reject(new Error(res?.error?.error || "Failed to start scrape"));
         }
      }
    });
  }
  else {
    throw new Error(`Unsupported task_type: ${task.task_type}`);
  }
}

function randUrl() {
  const urls = [
    "https://www.instagram.com/instagram",
    "https://instagram.com",
    "https://www.instagram.com/direct/inbox/",
    "https://www.instagram.com/explore/"
  ];
  return urls[Math.floor(Math.random() * urls.length)];
}

async function openMainTab() {
  // Check if existing tab is still alive
  if (state.instagramTabId) {
    try {
      const tab = await chrome.tabs.get(state.instagramTabId);
      if (tab && !tab.discarded) {
        chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Reusing existing tab ${state.instagramTabId}` }).catch(()=>null);
        return state.instagramTabId;
      }
    } catch (e) {
      state.instagramTabId = null;
    }
  }

  chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Opening pinned Instagram tab..." }).catch(()=>null);

  // Create a pinned background tab exactly like production does
  const tab = await chrome.tabs.create({
    url: randUrl(),
    active: false,
    index: 0,
    pinned: true
  });

  state.instagramTabId = tab.id;
  await chrome.storage.local.set({ instagramTabId: tab.id });

  chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Tab opened: ${tab.id}, waiting for load...` }).catch(()=>null);

  // Wait for tab to fully load (up to 10 seconds)
  for (let i = 0; i < 25; i++) {
    try {
      const t = await chrome.tabs.get(tab.id);
      if (t.status === "complete") break;
    } catch(e) { break; }
    await sleep(400);
  }

  // Extra wait for content scripts to inject
  await sleep(7000);
  chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Tab ready." }).catch(()=>null);

  return tab.id;
}

async function closeMainTab() {
  if (state.instagramTabId) {
    try { await chrome.tabs.remove(state.instagramTabId); } catch(e) {}
    state.instagramTabId = null;
    await chrome.storage.local.remove('instagramTabId');
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Tab closed." }).catch(()=>null);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendTaskToContent(taskType, taskData) {
  const tabId = await openMainTab();

  chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: `Sending '${taskType}' to tab ${tabId}` }).catch(()=>null);

  // Ping first to confirm content script is alive
  let pingOk = false;
  for (let i = 0; i < 5; i++) {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "adblock:info:to-content",
        data: { type: "ping", data: {} }
      });
      pingOk = true;
      break;
    } catch(e) {
      await sleep(2000);
    }
  }

  if (!pingOk) {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Content script not responding, reloading tab..." }).catch(()=>null);
    await chrome.tabs.reload(tabId);
    await sleep(8000);
  }

  const response = await chrome.tabs.sendMessage(tabId, {
    type: "adblock:info:to-content",
    data: { type: taskType, data: taskData }
  });

  return response;
}

// ---------------------------------------------------------------------------
// Listeners
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "HUB_LOGIN") {
    handleLogin(message.payload.email, message.payload.password);
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "FETCH_BROWSERS") {
    fetchBrowsers();
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "HUB_CONNECT") {
    handleConnect(message.payload.browserId, message.payload.browserLabel);
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "HUB_DISCONNECT") {
    stopEngine();
    closeMainTab();
    state.browserId = null;
    state.browserLabel = null;
    state.stats = { completed: 0, failed: 0 };
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "HUB_PAUSE_ENGINE") {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "[Engine] Paused by user." }).catch(()=>null);
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "HUB_RESUME_ENGINE") {
    chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "[Engine] Resumed by user. Polling will restart on next cycle." }).catch(()=>null);
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "HUB_SESSION_SYNCED") {
    // Check if we already have the same token to avoid unnecessary restarts
    if (state.accessToken !== message.payload.accessToken) {
      state.accessToken = message.payload.accessToken;
      state.refreshToken = message.payload.refreshToken;
      chrome.storage.local.set({ accessToken: state.accessToken, refreshToken: state.refreshToken }).then(() => {
        chrome.runtime.sendMessage({ type: "HUB_LOGIN_SUCCESS" }).catch(()=>null);
        chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: "Auto-Login Sync Successful!" }).catch(()=>null);
      });
    }
    sendResponse({ ok: true });
    return;
  }

  // --- Content Script Messages (via BackgroundConnector) ---
  if (message.type === "adblock:info:to-background") {
    const taskType = message.data?.type;
    const taskData = message.data?.data;

    // getTabType: critical — tells content.js it's the "main" tab
    if (taskType === "getTabType") {
      const tabId = sender.tab?.id;
      (async () => {
        const storedTabId = state.instagramTabId;
        let result = null;
        if (tabId && storedTabId && tabId === storedTabId) result = "main";
        sendResponse({ success: true, result });
      })();
      return true; // async response
    }

    // sleep: content script uses this to sleep without blocking
    if (taskType === "sleep") {
      const ms = taskData?.time || 1000;
      (async () => {
        await sleep(ms);
        sendResponse({ success: true, result: true });
      })();
      return true;
    }

    // pong: content script acknowledges ping
    if (taskType === "pong") {
      sendResponse({ success: true });
      return;
    }

    // log: content script sending a log
    if (taskType === "log") {
      const logMsg = `[Content] ${taskData?.type}`;
      chrome.runtime.sendMessage({ type: "DEBUG_LOG", msg: logMsg }).catch(()=>null);
      // Also persist from background context
      (async () => {
        const stored = await chrome.storage.local.get('engineLogs');
        const entry = `<div>[${new Date().toLocaleTimeString()}] ${logMsg}</div>`;
        const updated = (stored.engineLogs || '') + entry;
        chrome.storage.local.set({ engineLogs: updated });
      })();
      sendResponse({ success: true });
      return;
    }

    // successTask / errorTask: scraping results
    if (taskType === "successTask" || taskType === "errorTask") {
      // already handled by the Promise listener in executeTask
      sendResponse({ success: true });
      return;
    }

    // Default passthrough
    sendResponse({ success: true });
    return;
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  if (state.instagramTabId === tabId) {
    state.instagramTabId = null;
  }
});

// Boot
init();
