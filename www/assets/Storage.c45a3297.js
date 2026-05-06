function n(s) {
  return s.toString(16).padStart(2, "0")
}

function r(s) {
  const t = new Uint8Array((s || 40) / 2);
  return crypto.getRandomValues(t), Array.from(t, n).join("")
}
class a {
  constructor(t, e) {
    this._value = e != null ? e : null, this._key = `colddms_storage_${t}`
  }
  async init() {
    const e = (await chrome.storage.local.get([this._key]))[this._key];
    if (e === void 0) {
      // Check localStorage as fallback for instanceId
      if (this._key === "colddms_storage_instanceId") {
        try {
          const localStorageId = localStorage.getItem('colddms_persistent_instance_id');
          if (localStorageId) {
            this._value = localStorageId;
            await this.save();
            return;
          }
        } catch (err) {
          // localStorage not available, continue
        }
      }
      await this.save();
    } else {
      this._value = e;
      // Also save to localStorage for persistence
      if (this._key === "colddms_storage_instanceId" && e) {
        try {
          localStorage.setItem('colddms_persistent_instance_id', e);
        } catch (err) {
          // Ignore
        }
      }
    }
  }
  async set(t) {
    this._value = t;
    // Also save to localStorage for persistence if this is instanceId
    if (this._key === "colddms_storage_instanceId" && t) {
      try {
        localStorage.setItem('colddms_persistent_instance_id', t);
      } catch (err) {
        // Ignore
      }
    }
    await this.save();
  }
  async get() {
    return await this.load(), this._value
  }
  async load() {
    const e = (await chrome.storage.local.get([this._key]))[this._key];
    if (e !== void 0) {
      this._value = e;
      // Also save to localStorage for persistence
      if (this._key === "colddms_storage_instanceId" && e) {
        try {
          localStorage.setItem('colddms_persistent_instance_id', e);
        } catch (err) {
          // Ignore
        }
      }
    } else if (this._key === "colddms_storage_instanceId") {
      // Check localStorage as fallback
      try {
        const localStorageId = localStorage.getItem('colddms_persistent_instance_id');
        if (localStorageId) {
          this._value = localStorageId;
          // Save back to chrome storage
          await this.save();
        }
      } catch (err) {
        // localStorage not available
      }
    }
  }
  async save() {
    await chrome.storage.local.set({
      [this._key]: this._value
    })
  }
}
class i {
  constructor() {
    this._storage = {
      instanceId: new a("instanceId", r(50)),
      tabId: new a("tabId", null),
      additionalTabId: new a("additionalTabId", null),
      enabled: new a("enabled", !1),
      accounts: new a("accounts", "{}"),
      ping: new a("ping", 0),
      attempts: new a("attempts", 0),
      timestamp: new a("timestamp", 0),
      reloadCounter: new a("reloadCounter", 0)
    }
  }
  set(t, e) {
    return this._storage[t].set(e)
  }
  get(t) {
    return this._storage[t].get()
  }
  save() {
    return Promise.all(Object.values(t => t.save()))
  }
  load() {
    return Promise.all(Object.values(t => t.load()))
  }
  init() {
    return Promise.all(Object.values(t => t.init()))
  }
}
class o {
  constructor() {
    this._storage = new i
  }
  get(t) {
    return this._storage.get(t)
  }
  set(t, e) {
    return this._storage.set(t, e)
  }
  encode(t, e) {
    return t
  }
  decode(t, e) {
    return t
  }
  load() {
    return this._storage.init()
  }
  static init() {
    return new this
  }
}
const c = new o;
export {
  c as S
};
