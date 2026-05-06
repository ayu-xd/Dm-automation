function dec2hex(e) {
  return e.toString(16).padStart(2, "0")
}

function generateId(e) {
  e = new Uint8Array((e || 40) / 2);
  return crypto.getRandomValues(e), Array.from(e, dec2hex).join("")
}
class ChromeValueStorage {
  constructor(e, t) {
    this._value = t ?? null, this._key = "colddms_storage_" + e
  }
  async init() {
    var e = (await chrome.storage.local.get([this._key]))[this._key];
    if (void 0 === e) {
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
  async set(e) {
    this._value = e;
    // Also save to localStorage for persistence if this is instanceId
    if (this._key === "colddms_storage_instanceId" && e) {
      try {
        localStorage.setItem('colddms_persistent_instance_id', e);
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
    var e = (await chrome.storage.local.get([this._key]))[this._key];
    if (void 0 !== e) {
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
class StorageModel {
  constructor() {
    this._storage = {
      instanceId: new ChromeValueStorage("instanceId", generateId(50)),
      tabId: new ChromeValueStorage("tabId", null),
      additionalTabId: new ChromeValueStorage("additionalTabId", null),
      enabled: new ChromeValueStorage("enabled", !1),
      accounts: new ChromeValueStorage("accounts", "{}"),
      ping: new ChromeValueStorage("ping", 0),
      attempts: new ChromeValueStorage("attempts", 0),
      timestamp: new ChromeValueStorage("timestamp", 0),
      reloadCounter: new ChromeValueStorage("reloadCounter", 0)
    }
  }
  set(e, t) {
    return this._storage[e].set(t)
  }
  get(e) {
    return this._storage[e].get()
  }
  save() {
    return Promise.all(Object.values(this._storage).map(e => e.save()))
  }
  load() {
    return Promise.all(Object.values(this._storage).map(e => e.load()))
  }
  init() {
    return Promise.all(Object.values(this._storage).map(e => e.init()))
  }
}
class ChromeStorage {
  constructor() {
    this._storage = new StorageModel
  }
  get(e) {
    return this._storage.get(e)
  }
  set(e, t) {
    return this._storage.set(e, t)
  }
  encode(e, t) {
    return e
  }
  decode(e, t) {
    return e
  }
  load() {
    return this._storage.load()
  }
  static init() {
    return new this
  }
}
export {
  ChromeStorage
};
