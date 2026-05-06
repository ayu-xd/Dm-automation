document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('loginView');
  const selectView = document.getElementById('selectView');
  const activeView = document.getElementById('activeView');
  
  const loginBtn = document.getElementById('loginBtn');
  const connectBtn = document.getElementById('connectBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const browserSelect = document.getElementById('browserSelect');
  const manualPairingKey = document.getElementById('manualPairingKey');
  const manualFallbackGroup = document.getElementById('manualFallbackGroup');
  
  const loginMessage = document.getElementById('loginMessage');
  const selectMessage = document.getElementById('selectMessage');
  
  const browserLabelDisplay = document.getElementById('browserLabelDisplay');
  const tasksCompletedDisplay = document.getElementById('tasksCompletedDisplay');

  // Load state
  const state = await chrome.storage.local.get(['accessToken', 'browserId', 'browserLabel', 'stats']);

  // --- Persistent Logs: restore from storage ---
  const debugDiv = document.getElementById('debugLogs');
  const storedLogs = await chrome.storage.local.get('engineLogs');
  if (storedLogs.engineLogs && debugDiv) {
    debugDiv.innerHTML = storedLogs.engineLogs;
    debugDiv.scrollTop = debugDiv.scrollHeight;
  }
  
  if (state.accessToken && state.browserId) {
    showActiveView(state.browserLabel, state.stats);
  } else if (state.accessToken) {
    showSelectView();
    fetchBrowsers();
  } else {
    showLoginView();
  }

  // Handle Login
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showLoginMsg('Please enter Email and Password', 'error');
      return;
    }

    loginBtn.textContent = 'Authenticating...';
    loginBtn.disabled = true;

    chrome.runtime.sendMessage({ 
      type: "HUB_LOGIN", 
      payload: { email, password } 
    });
  });

  // Handle Connect
  connectBtn.addEventListener('click', async () => {
    let selectedId = browserSelect.value;
    let selectedLabel = browserSelect.options[browserSelect.selectedIndex]?.text || "Manual Connection";

    const manualKey = manualPairingKey.value.trim();
    if (manualKey) {
      selectedId = "MANUAL_KEY:" + manualKey;
      selectedLabel = "Browser (" + manualKey + ")";
    }

    if (!selectedId) return;

    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;

    chrome.runtime.sendMessage({ 
      type: "HUB_CONNECT", 
      payload: { browserId: selectedId, browserLabel: selectedLabel } 
    });
  });

  // Handle Logout
  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.clear();
    chrome.runtime.sendMessage({ type: "HUB_DISCONNECT" });
    showLoginView();
  });

  // Handle Disconnect
  disconnectBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['browserId', 'browserLabel', 'stats']);
    chrome.runtime.sendMessage({ type: "HUB_DISCONNECT" });
    showSelectView();
    fetchBrowsers();
  });

  // Handle Settings Toggle
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const settingsMessage = document.getElementById('settingsMessage');
  const engineToggleBtn = document.getElementById('engineToggleBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  
  const dailyLimitIn = document.getElementById('dailyLimit');
  const baseDelayIn = document.getElementById('baseDelay');
  const minVarianceIn = document.getElementById('minVariance');
  const maxVarianceIn = document.getElementById('maxVariance');

  settingsBtn.addEventListener('click', async () => {
    settingsPanel.classList.toggle('hidden');
    if (!settingsPanel.classList.contains('hidden')) {
      const saved = await chrome.storage.local.get('pacingSettings');
      const conf = saved.pacingSettings || { dailyLimit: 30, baseDelay: 90, minVariance: 5, maxVariance: 300 };
      dailyLimitIn.value = conf.dailyLimit;
      baseDelayIn.value = conf.baseDelay;
      minVarianceIn.value = conf.minVariance;
      maxVarianceIn.value = conf.maxVariance;
      settingsMessage.textContent = '';
    }
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const minV = parseInt(minVarianceIn.value) || 0;
    const maxV = parseInt(maxVarianceIn.value) || 0;
    if (minV > maxV) {
      settingsMessage.textContent = 'Min Variance cannot be > Max Variance';
      settingsMessage.className = 'message error';
      return;
    }
    const newConf = {
      dailyLimit: parseInt(dailyLimitIn.value) || 30,
      baseDelay: parseInt(baseDelayIn.value) || 90,
      minVariance: minV,
      maxVariance: maxV
    };
    await chrome.storage.local.set({ pacingSettings: newConf });
    settingsMessage.textContent = 'Settings Saved Successfully!';
    settingsMessage.className = 'message success';
    setTimeout(() => { settingsMessage.textContent = ''; }, 3000);
  });

  // Handle Engine Start/Stop Toggle
  engineToggleBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get('enginePaused');
    const isPaused = !!data.enginePaused;
    const newPaused = !isPaused;
    await chrome.storage.local.set({ enginePaused: newPaused });
    updateEngineToggle(newPaused);
    // Notify background to log the change
    chrome.runtime.sendMessage({ 
      type: newPaused ? "HUB_PAUSE_ENGINE" : "HUB_RESUME_ENGINE" 
    });
  });

  function updateEngineToggle(isPaused) {
    if (isPaused) {
      engineToggleBtn.textContent = '▶ START ENGINE';
      engineToggleBtn.className = 'paused';
      statusIndicator.textContent = 'Paused';
      statusIndicator.className = 'status-value error';
    } else {
      engineToggleBtn.textContent = '⏸ STOP ENGINE';
      engineToggleBtn.className = 'running';
      statusIndicator.textContent = 'Online';
      statusIndicator.className = 'status-value online';
    }
  }

  // Fetch Browsers to populate dropdown
  function fetchBrowsers() {
    chrome.runtime.sendMessage({ type: "FETCH_BROWSERS" });
  }

  // Listen for background updates
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "HUB_LOGIN_SUCCESS") {
      showSelectView();
      fetchBrowsers();
    }
    if (msg.type === "HUB_LOGIN_ERROR") {
      showLoginMsg(msg.error, 'error');
      loginBtn.textContent = 'Login';
      loginBtn.disabled = false;
    }
    if (msg.type === "FETCH_BROWSERS_SUCCESS") {
      browserSelect.innerHTML = '';
      if (msg.browsers.length === 0) {
        browserSelect.innerHTML = '<option disabled>No browsers found in dashboard</option>';
        manualFallbackGroup.classList.remove('hidden');
        connectBtn.disabled = false;
      } else {
        msg.browsers.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.textContent = `${b.label} (${b.instance_key})`;
          browserSelect.appendChild(opt);
        });
        manualFallbackGroup.classList.remove('hidden'); // allow them to override if they want
        connectBtn.disabled = false;
      }
    }
    if (msg.type === "HUB_CONNECTED_SUCCESS") {
      showActiveView(msg.label, msg.stats);
    }
    if (msg.type === "STATS_UPDATE") {
      if (tasksCompletedDisplay) {
        tasksCompletedDisplay.textContent = msg.stats?.completed || 0;
      }
    }
    if (msg.type === "DEBUG_LOG") {
      const debugDiv = document.getElementById('debugLogs');
      if (debugDiv) {
        const entry = `<div>[${new Date().toLocaleTimeString()}] ${msg.msg}</div>`;
        debugDiv.innerHTML += entry;
        debugDiv.scrollTop = debugDiv.scrollHeight;
        // Persist to storage (cap at 500 entries to avoid bloat)
        const entries = debugDiv.querySelectorAll('div');
        if (entries.length > 500) {
          for (let i = 0; i < entries.length - 500; i++) entries[i].remove();
        }
        chrome.storage.local.set({ engineLogs: debugDiv.innerHTML });
      }
    }
  });

  function showLoginMsg(msg, type) {
    loginMessage.textContent = msg;
    loginMessage.className = `message ${type}`;
  }

  async function showActiveView(label, stats) {
    loginView.classList.add('hidden');
    selectView.classList.add('hidden');
    activeView.classList.remove('hidden');
    browserLabelDisplay.textContent = label || 'Unknown';
    tasksCompletedDisplay.textContent = stats?.completed || 0;
    // Load engine paused state
    const data = await chrome.storage.local.get('enginePaused');
    updateEngineToggle(!!data.enginePaused);
  }

  function showSelectView() {
    loginView.classList.add('hidden');
    activeView.classList.add('hidden');
    selectView.classList.remove('hidden');
    connectBtn.textContent = 'Connect to Hub';
  }

  function showLoginView() {
    selectView.classList.add('hidden');
    activeView.classList.add('hidden');
    loginView.classList.remove('hidden');
    emailInput.value = '';
    passwordInput.value = '';
    showLoginMsg('', '');
    loginBtn.textContent = 'Login';
    loginBtn.disabled = false;
  }

  // --- Download Logs ---
  const downloadLogsBtn = document.getElementById('downloadLogsBtn');
  if (downloadLogsBtn) {
    downloadLogsBtn.addEventListener('click', async () => {
      const debugDiv = document.getElementById('debugLogs');
      if (!debugDiv) return;
      const lines = Array.from(debugDiv.querySelectorAll('div')).map(d => d.textContent).join('\n');
      const blob = new Blob([lines], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dm-engine-logs-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // --- Use Pre-resolved Names Toggle ---
  const preresolvedToggle = document.getElementById('usePreresolvedToggle');
  if (preresolvedToggle) {
    const saved = await chrome.storage.local.get('usePreresolvedNames');
    preresolvedToggle.checked = saved.usePreresolvedNames !== false; // default ON
    preresolvedToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ usePreresolvedNames: preresolvedToggle.checked });
    });
  }
});