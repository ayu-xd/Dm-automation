class ADBlockAsyncEventEmitter {
  constructor() {
    this._listeners = {}, this._onceListeners = {}
  }
  on(e, t) {
    this._listeners[e] || (this._listeners[e] = []), this._listeners[e].push(t)
  }
  once(e, t) {
    this._onceListeners[e] || (this._onceListeners[e] = []), this._onceListeners[e].push(t)
  }
  emit(e, ...t) {
    var s = [...this._listeners[e] ?? [], ...this._onceListeners[e] ?? []];
    return this._onceListeners[e] = [], Promise.allSettled(s.map(e => e(...t)))
  }
}
const ADBLOCK_INNER_KEY = "adblock:info:to-dom",
  ADBLOCK_OUTER_KEY = "adblock:info:to-content",
  ADBLOCK_REACT_INNER_KEY = "adblock:info:to-inner-dom",
  ADBLOCK_REACT_OUTER_KEY = "adblock:info:to-react";
class ADBlockDOMConnector extends ADBlockAsyncEventEmitter {
  constructor(e, t) {
    super(), this.reservedTasks = {}, this.tasks = {}, this.innerKey = e, this.outerKey = t, window.addEventListener("message", async e => {
      if (e.source === window && e?.data?.type === this.innerKey) {
        var e = JSON.parse(e.data.text),
          t = e.type,
          s = e.data;
        if ("basic" === t) {
          var r = s.type;
          if (this.tasks[r]) try {
            this.tasks[r](s.data)
          } catch (e) {
            console.error(e)
          }
        } else if ("with_response" === t) {
          r = s.type;
          if (this.tasks[r]) {
            var n = {};
            try {
              var a = await this.tasks[r](s.data);
              n.success = !0, n.result = a
            } catch (e) {
              console.error(e), n.success = !1, n.error = {
                error: e?.error || e?.toString?.(),
                stack: e?.stack,
                type: e?.type
              }
            }
            this.emit({
              type: "response",
              id: e.id,
              result: n
            })
          }
        } else if ("response" === t) {
          r = e.id, s = e.result;
          try {
            s.success ? this.reservedTasks[r]?.[0]?.(s.result) : this.reservedTasks[r]?.[1]?.(s.error)
          } catch (e) {
            console.error(e)
          } finally {
            delete this.reservedTasks[r]
          }
        }
      }
    })
  }
  emit({
    type: e,
    id: t,
    result: s,
    data: r
  }) {
    window.postMessage({
      type: this.outerKey,
      text: JSON.stringify({
        type: e,
        id: t,
        data: r,
        result: s
      })
    }, "*")
  }
  send(r, n = {}) {
    return new Promise(async (e, t) => {
      var s = `${Date.now()}_${Math.random()}_` + Math.random();
      this.reservedTasks[s] = [e, t], this.emit({
        type: "with_response",
        id: s,
        data: {
          type: r,
          data: n
        }
      })
    })
  }
  registerTask(e, t) {
    this.tasks[e] = t
  }
}
class ADBlockDOM {
  registerTasks() {
    this.domConnector.registerTask("isLoggedIn", () => this._isLoggedIn()), this.domConnector.registerTask("getText", ({
      module: e,
      name: t
    }) => this._getText(e, t)), this.domConnector.registerTask("getUser", () => this._getUser()), this.domConnector.registerTask("checkResponse", ({
      threadId: e
    }) => this._checkResponse(e)), this.domConnector.registerTask("getInfo", () => this._getInfo()), this.domConnector.registerTask("switchAccount", ({
      id: e
    }) => this._switchAccount({
      id: e
    })), this.domConnector.registerTask("enterSymbol", ({
      symbol: e
    }) => this._enterSymbol({
      symbol: e
    })), this.domConnector.registerTask("sendMessage", () => this._sendMessage()), this.domConnector.registerTask("getMessageInput", () => this._getMessageInput()), this.domConnector.registerTask("injectIntoChat", () => this._injectIntoChat()), this.domConnector.registerTask("getLastMessages", () => this._getLastMessages()), this.domConnector.registerTask("getLastMessagesUnsafe", () => this._getLastMessagesUnsafe()), this.domConnector.registerTask("preTaskHooks", () => this._preTaskHooks()), this.domConnector.registerTask("getUserByUsername", ({
      username: e
    }) => this._getUserByUsername(e)), this.domConnector.registerTask("inputSearch", ({
      username: e
    }) => this._inputSearch({
      username: e
    })), this.domConnector.registerTask("getUserFromContacts", ({
      username: e
    }) => this._getUserFromContacts({
      username: e
    })), this.domConnector.registerTask("openUser", ({
      username: e,
      userId: t
    }) => this._openUser({
      username: e,
      userId: t
    })), this.domConnector.registerTask("findUserInDialogWithoutClick", ({
      username: e,
      userId: t
    }) => this._findUserInDialogWithoutClick({
      username: e,
      userId: t
    })), this.domConnector.registerTask("logSendMessageButtonSeen", ({
      isFollowing: e,
      userId: t
    }) => this._logSendMessageButtonSeen({
      isFollowing: e,
      userId: t
    })), this.domConnector.registerTask("openDirect", ({
      isFollowing: e,
      userId: t
    }) => this._openDirect({
      isFollowing: e,
      userId: t
    })), this.domConnector.registerTask("importCredentials", ({
      indexedDb: e,
      localStorage: t,
      sessionStorage: s
    }) => this._importCredentials({
      indexedDb: e,
      localStorage: t,
      sessionStorage: s
    })), this.domConnector.registerTask("exportCredentials", () => this._exportCredentials()), this.domConnector.registerTask("getReactTree", () => this._getReactTree()), this.domConnector.registerTask("debugRequire", ({
      name: e,
      chain: t,
      method: s
    }) => this._debugRequire({
      name: e,
      chain: t,
      method: s
    })), this.domConnector.registerTask("debugReact", ({
      chain: e
    }) => this._debugReact({
      chain: e
    })), this.domConnector.registerTask("switchAccountFromDirect", ({
      id: e
    }) => this._switchAccountFromDirect({
      id: e
    })), this.domConnector.registerTask("switchAccountFromIndex", ({
      id: e
    }) => this._switchAccountFromIndex({
      id: e
    })), this.domConnector.registerTask("getFollowers", ({
      id: e,
      username: t,
      limit: s
    }) => this._getFollowers({
      id: e,
      username: t,
      limit: s
    })), this.domConnector.registerTask("getFollowing", ({
      id: e,
      username: t,
      limit: s
    }) => this._getFollowing({
      id: e,
      username: t,
      limit: s
    })), this.domConnector.registerTask("openChatFromProfile", ({
      id: e,
      username: t
    }) => this._openChatFromProfile({
      id: e,
      username: t
    })), this.domConnector.registerTask("getAllMessages", () => this._getAllMessages()), this.domConnector.registerTask("getUserThread", ({
      username: e
    }) => this._getUserThread({
      username: e
    })), this.domConnector.registerTask("getDebugMessages", () => this._getDebugMessages()), this.domConnector.registerTask("getConsoleLogs", () => this._getConsoleLogs()), this.domConnector.registerTask("detectInstagramError", () => this._detectInstagramError()), this.domReactConnector.registerTask("sleep", ({
      time: e
    }) => this.sleep(e)), this.domReactConnector.registerTask("log", ({
      data: e,
      type: t
    }) => this.log({
      data: e,
      type: t
    }))
  }
  log({
    data: e,
    type: t
  }) {
    this.domConnector.emit({
      type: "basic",
      data: {
        type: "log",
        data: {
          type: t,
          data: e
        }
      }
    })
  }
  _getConsoleLogs() {
    return consoleMessages
  }
  constructor() {
    this.domConnector = new ADBlockDOMConnector(ADBLOCK_INNER_KEY, ADBLOCK_OUTER_KEY), this.domReactConnector = new ADBlockDOMConnector(ADBLOCK_REACT_INNER_KEY, ADBLOCK_REACT_OUTER_KEY), this.registerTasks(), this.lastMessages = null, this._modules = {}
  }
  _debugReact({
    chain: e
  }) {
    return this.domReactConnector.send("debug", {
      chain: e
    })
  }
  async _debugRequire({
    name: e,
    chain: t,
    method: s
  }) {
    let r = null;
    if ("importDefault" === s && (r = await this._importDefault(e)), "importNamespace" === s && (r = await this._importNamespace(e)), !(r = "require" === s ? require(e) : r)) throw new Error("Unknown method");
    for (var {
        type: n,
        value: a,
        args: o = []
      }
      of t) r = r[a], "execute" === n && (r = r(...o));
    return r
  }
  _inputSearch({
    username: e
  }) {
    return this.domReactConnector.send("inputSearch", {
      username: e
    })
  }
  _getMessageInput() {
    return document.querySelector('div[contenteditable="true"]').__lexicalTextContent
  }
  trickState() {
    Object.defineProperty(document, "hasFocus", {
      get() {
        return () => !0
      }
    }), Object.defineProperty(document, "hidden", {
      get() {
        return !1
      }
    });
    {
      var t = document,
        s = "visibilitychange";
      let e;
      "createEvent" in document ? (e = document.createEvent("Event")).initEvent(s, !0, !0) : "Event" in window && (e = new Event(s, {
        bubbles: !0,
        cancelable: !0
      })), t.dispatchEvent(e)
    } {
      var t = "onfocusin" in (s = window) ? "focusin" : "focus",
        r = "onfocusin" in s;
      let e;
      "createEvent" in document ? (e = document.createEvent("Event")).initEvent(t, r, !0) : "Event" in window && (e = new Event(t, {
        bubbles: r,
        cancelable: !0
      })), s.focus(), s.dispatchEvent(e)
    } {
      t = window, r = "pageshow";
      let e;
      "createEvent" in document ? (e = document.createEvent("Event")).initEvent(r, !0, !0) : "Event" in window && (e = new Event(r, {
        bubbles: !0,
        cancelable: !0
      })), t.dispatchEvent(e)
    }
  }
  async _getFollowers({
    id: e,
    username: t,
    limit: s
  }) {
    return this.domReactConnector.send("getFollowers", {
      id: e,
      username: t,
      limit: s
    })
  }
  async _getAllMessages() {
    return this.domReactConnector.send("getAllMessages", {})
  }
  async _getUserThread({
    username: e
  }) {
    return this.domReactConnector.send("getUserThread", {
      username: e
    })
  }
  async _getDebugMessages() {
    return this.domReactConnector.send("getDebugMessages", {})
  }
  async _openChatFromProfile({
    id: e,
    username: t
  }) {
    return this.domReactConnector.send("openChatFromProfile", {
      id: e,
      username: t
    })
  }
  async _getFollowing({
    id: e,
    username: t,
    limit: s
  }) {
    return this.domReactConnector.send("getFollowing", {
      id: e,
      username: t,
      limit: s
    })
  }
  async _getReactTree() {
    return this.domReactConnector.send("getReactTree", {})
  }
  async _detectInstagramError() {
    return this.domReactConnector.send("detectInstagramError", {})
  }
  async _preTaskHooks() {
    await this._checkNotificationModalAndClick(), await this.domReactConnector.send("preTaskHooks", {})
  }
  async _checkNotificationModalAndClick() {
    try {
      await this.domReactConnector.send("checkNotificationModalAndClick", {})
    } catch (e) {
      console.error(e)
    }
  }
  async _getUserInSearchWindow({
    userId: t,
    username: s
  }) {
    var r = await this.domReactConnector.send("findSearchResult", {});
    if (r?.length) {
      let e = r.filter(e => "user" === e.type).find(({
        candidate: e
      }) => s ? e.subtext === s : e.igid === t);
      if (!e && s) {
        const n = await this.domReactConnector.send("alternativeSearchResultsMapping", {
          username: s
        });
        n && (e = r.filter(e => "user" === e.type).find(({
          candidate: e
        }) => String(e.igid) === String(n.resultIgid)))
      }
      if (!e) {
        const singleMatch = r.filter(x => "user" === x.type);
        if (singleMatch.length === 1) e = singleMatch[0];
      }
      return e
    }
  }
  async _clickOnUserIdDialogButton({
    userId: t,
    username: s,
    skipOpenDialog: r
  }) {
    for (let e = 0; e < 10; e++) {
      var n = await this._getUserInSearchWindow({
        userId: t,
        username: s
      });
      if (n) return await this.domReactConnector.send("clickOnUser", {
        userId: n.candidate.igid,
        username: s
      }), await this.sleep(5e3), r || (await this.domReactConnector.send("clickChat", {}), await this.sleep(5e3)), !0;
      await this.sleep(1e3)
    }
    return !1
  }
  async _clickOnUserIdAndGetDialogButton({
    userId: t,
    username: s
  }) {
    for (let e = 0; e < 10; e++) {
      var r = await this._getUserInSearchWindow({
        userId: t,
        username: s
      });
      if (r) return await this.domReactConnector.send("clickOnUser", {
        userId: r.candidate.igid,
        username: s
      }), await this.sleep(5e3), r;
      await this.sleep(1e3)
    }
    return null
  }
  async _openUser({
    username: e
  }) {
    if (!await this.domReactConnector.send("clickDialogButton", {})) throw new ExtensionError({
      type: "open_search_popup_error",
      message: "Error while opening the popup"
    });
    if (await this.sleep(5e3), !await this.domReactConnector.send("enterUsername", {
        username: e
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    if (await this.sleep(5e3), await this._clickOnUserIdDialogButton({
        username: e
      })) return !0;
    if (this.log({
        type: "User was not found in dialog in first attempt",
        data: {}
      }), !await this.domReactConnector.send("enterUsername", {
        username: "instagra"
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    if (await this.sleep(2e3), !await this.domReactConnector.send("enterUsername", {
        username: e
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    if (await this.sleep(5e3), await this._clickOnUserIdDialogButton({
        username: e
      })) return !0;
    throw new ExtensionError({
      type: "user_click_error",
      message: "User was not found in popup"
    })
  }
  async _findUserInDialogWithoutClick({
    username: e
  }) {
    if (!await this.domReactConnector.send("clickDialogButton", {})) throw new ExtensionError({
      type: "open_search_popup_error",
      message: "Error while opening the popup"
    });
    if (await this.sleep(5e3), !await this.domReactConnector.send("enterUsername", {
        username: e
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    await this.sleep(5e3);
    var t = await this._clickOnUserIdAndGetDialogButton({
      username: e
    });
    if (t) return await this.domReactConnector.send("closeOpenDialogModal", {}), t;
    if (this.log({
        type: "User was not found in dialog in first attempt",
        data: {}
      }), !await this.domReactConnector.send("enterUsername", {
        username: "instagra"
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    if (await this.sleep(2e3), !await this.domReactConnector.send("enterUsername", {
        username: e
      })) throw new ExtensionError({
      type: "user_search_error",
      message: "Error while entering username"
    });
    await this.sleep(5e3);
    t = await this._clickOnUserIdAndGetDialogButton({
      username: e
    });
    if (t) return await this.domReactConnector.send("closeOpenDialogModal", {}), t;
    throw new ExtensionError({
      type: "user_click_error",
      message: "User was not found in popup"
    })
  }
  _enterSymbol({
    symbol: a
  }) {
    const MAX_RETRIES = 3;
    const attemptInsert = (retryCount) => {
      return new Promise(async (t, e) => {
        const s = setTimeout(() => {
            if (retryCount < MAX_RETRIES) {
              clearTimeout(s);
              attemptInsert(retryCount + 1).then(t, e);
            } else {
              e(new Error("Stuck"))
            }
          }, 15e3),
          r = document.querySelector('div[contenteditable="true"]'),
          n = await this._importNamespace("Lexical");
        if (!r || !r.__lexicalEditor) {
          clearTimeout(s);
          if (retryCount < MAX_RETRIES) {
            await new Promise(res => setTimeout(res, 2e3));
            attemptInsert(retryCount + 1).then(t, e);
          } else {
            e(new Error("Stuck"))
          }
          return;
        }
        r.__lexicalEditor.focus(() => {
          r.__lexicalEditor.update(() => {
            var e = 13 === a.charCodeAt(0) ? n.$createLineBreakNode(a) : n.$createTextNode(a);
            n.$insertNodes([e]), clearTimeout(s), t()
          })
        })
      })
    };
    return attemptInsert(0);
  }
  async _sendMessage() {
    var e = new CustomEvent("keydown", {
        bubbles: !0,
        cancelable: !0
      }),
      e = (e.cancelBubble = !1, e.returnValue = !0, e.key = "Enter", e.keyCode = 13, e.which = 13, e.charCode = 13, e.shiftKey = !1, e.ctrlKey = !1, e.metaKey = !1, new window.KeyboardEvent("keydown", e)),
      t = document.querySelector('div[contenteditable="true"]'),
      s = await this._importNamespace("Lexical");
    t.__lexicalEditor.dispatchCommand(s.KEY_ENTER_COMMAND, e)
  }
  async _getText(e, t) {
    e = await this._importNamespace(e);
    if (e) return (t = t.split(".").reduce((e, t) => (e ?? {})[t], e))?.props?.content?.[0] ?? t
  }
  async _isLoggedIn() {
    return (await this._importNamespace("polarisIsUserLoggedIn")).isUserLoggedIn()
  }
  async _formatMessages(e) {
    var t = await this._importDefault("bs_caml_int64"),
      s = await this._importNamespace("I64");
    return {
      senderId: t.to_string(s.of_string(e[10][1])),
      text: e[0]
    }
  }
  async _parseMessages(e) {
    if (Array.isArray(e)) {
      if (5 === e[0] && "upsertMessage" === e[1]) return [await this._formatMessages(e.slice(2))];
      var t = [];
      for (const s of e) t.push(...await this._parseMessages(s));
      return t
    }
    return []
  }
  async _getLastMessages() {
    var e = await this.domReactConnector.send("getMessages", {});
    const t = await this._importDefault("bs_caml_int64");
    return e.map(e => ({
      senderId: t.to_string(e.senderId),
      text: e.text
    }))
  }
  async prepareMessage(t) {
    var s = {},
      r = await this._importDefault("bs_caml_int64");
    for (const n in t) {
      let e = t[n];
      "i64" === e._tag && (e = r.to_string(e.value)), s[n] = e
    }
    return s
  }
  async _getLastMessagesUnsafe() {
    for (let e = 0; e < 10; e++) {
      var t = await this.domReactConnector.send("getMessagesUnsafe", {});
      if (t.length) {
        var s = [];
        for (const r of t) s.push(await this.prepareMessage(r));
        return s
      }
      await this.sleep(1e3)
    }
    return []
  }
  async _injectIntoChat() {
    var e = await this._importNamespace("IGDOverLSMqttChannel"),
      t = await this._importNamespace("LSPlatformDeviceId");
    e.getInstance(t.getDeviceIdForProviderType("ephemeral")).subscribe("/ls_resp", async e => {
      e = JSON.parse(e).payload, e = JSON.parse(e).step, e = await this._parseMessages(e);
      e.length && (this.lastMessages = e)
    })
  }
  async _checkResponse(e) {
    const t = await this._importNamespace("PolarisConsumerReduxStore").createConsumerStore(),
      s = await this._getUser();
    await this._importNamespace("PolarisDirectActionLoadThread").loadThread(e, {})(t.dispatch, t.getState);
    var r = t.getState().direct.threads.get(e),
      n = r.items.map(e => t.getState().direct.messages.get(e)),
      r = r.items[0];
    try {
      var a = await this._importNamespace("PolarisDirectLogger"),
        o = await this._importNamespace("PolarisDirectActionMarkSeen"),
        i = await this._importNamespace("PolarisDirectActionUpdateMediaSharesInThread");
      a.DirectLogger.logDirectClientEvent("direct_inbox_thread_impression", (await this._importNamespace("PolarisDirectLogger")).DIRECT_CONTAINER_MODULES.direct_inbox, {
        thread_id: e
      }), o.markSeen(e, r)(t.dispatch), i.updateMediaSharesInThread(e)(t.dispatch, t.getState)
    } catch (e) {
      console.error(e)
    }
    return !!n.find(({
      user_id: e
    }) => e !== s.id)
  }
  async _getUserById(e) {
    var t = await this._importNamespace("PolarisConsumerReduxStore"),
      s = await this._importNamespace("polarisUserSelectors"),
      t = t.createConsumerStore();
    return s.getUserById(t.getState(), e)
  }
  async _getUserByUsername(e) {
    e = (await (await this._importNamespace("PolarisInstajax")).get_UNTYPED("https://www.instagram.com/api/v1/users/web_profile_info/?username=" + e)).data;
    return e.user
  }
  async _importNamespace(t) {
    for (let e = 0; e < 15; e++) {
      var s = importNamespace(t);
      if (s) return s;
      await this.sleep(1e3)
    }
    throw new Error("Module not found")
  }
  async _importDefault(t) {
    for (let e = 0; e < 15; e++) {
      var s = importDefault(t);
      if (s) return s;
      await this.sleep(1e3)
    }
    throw new Error("Module not found")
  }
  async _getUser() {
    if (!(await this._importNamespace("PolarisConfig"))?.getViewerData_DO_NOT_USE?.()?.username) {
      const {
        id: s,
        username: e,
        profilePictureUrl: n
      } = await this.domReactConnector.send("getUser", {});
      return {
        username: e.startsWith("@") ? e.substring(1) : e,
        profile_pic_url: n,
        id: s
      }
    }
    let {
      username: e,
      profile_pic_url: t,
      id: s
    } = (await this._importNamespace("PolarisConfig")).getViewerData_DO_NOT_USE();
    var r;
    return "Instagram User" === e && (r = await this.domReactConnector.send("getUser", {}), e = r.username), {
      username: e.startsWith("@") ? e.substring(1) : e,
      profile_pic_url: t,
      id: s
    }
  }
  async _getInfo() {
    var e = await this._getUser();
    return {
      accounts: [{
        instagram_id: parseInt(e.id),
        username: e.username
      }],
      currentUser: e,
      oneTapLogin: !1
    }
  }
  sleep(t) {
    return t < 2e4 ? this.domConnector.send("sleep", {
      time: t
    }) : new Promise(e => setTimeout(e, t))
  }
  async _clickSwitchButton() {
    var e = document.querySelectorAll("span"),
      t = await this._getText("PolarisAuthStrings", "SWITCH_CTA_TEXT");
    for (const s of e) s.checkVisibility({
      checkOpacity: !0,
      checkVisibilityCSS: !0
    }) && t.trim() === s.innerHTML && s.click()
  }
  async _logSendMessageButtonSeen({
    isFollowing: e,
    userId: t
  }) {
    return await this._logOpenDirect({
      action: "button_impression",
      isFollowing: e,
      userId: t
    }), !0
  }
  async _logOpenDirect({
    action: e,
    isFollowing: t,
    userId: s
  }) {
    const r = await this._getUser();
    (await this._importDefault("PolarisInstagramProfileActionFalcoEvent")).log(function() {
      return {
        action: e,
        click_point: "message_button",
        containermodule: "profile",
        follow_status: t ? "following" : "not_following",
        ig_userid: r.id,
        profile_user_id: s
      }
    })
  }
  async _openDirect({
    isFollowing: e,
    userId: t
  }) {
    var s = (await this._importNamespace("PolarisConsumerReduxStore")).createConsumerStore();
    await this._logOpenDirect({
      action: "button_click",
      isFollowing: e,
      userId: t
    }), await (await this._importNamespace("PolarisDirectActionMessageFromProfile")).messageFromProfile(t)(s.dispatch, s.getState)
  }
  _importCredentials({
    indexedDb: e,
    localStorage: t,
    sessionStorage: s
  }) {
    return (new AccountDataKeeper).importCredentials({
      indexedDb: e,
      localStorage: t,
      sessionStorage: s
    })
  }
  _exportCredentials() {
    return (new AccountDataKeeper).exportCredentials()
  }
  async _switchAccountFromDirect({
    id: e
  }) {
    await this.domReactConnector.send("switchAccountFromDirect", {
      id: e
    })
  }
  async _switchAccountFromIndex({
    id: e
  }) {
    await this.domReactConnector.send("switchAccountFromIndex", {
      id: e
    })
  }
  async _getUserFromContacts({
    username: e
  }) {
    return this.domReactConnector.send("getUserFromContacts", {
      username: e
    })
  }
  async _switchAccount({
    id: e
  }) {
    const t = (await this._importNamespace("PolarisConsumerReduxStore")).createConsumerStore();
    if (this._getUser().id === e) return !1;
    var s = (await this._importNamespace("PolarisOneTapLoginStorage")).getLoginNonces()[e];
    if (!s) return !1;
    const r = s.nonce;
    if (!r) return !1;
    await this._clickSwitchButton(), await this.sleep(5e3);
    const n = await this._importNamespace("PolarisLoginActionOneTapLogin"),
      a = () => n.switchAccountLogin({
        userId: e,
        loginNonce: r,
        retry: a
      })(t.dispatch);
    return a(), !0
  }
}
class AccountDataKeeper {
  importFromJsonString(o, i) {
    return new Promise((r, t) => {
      var e = new Set(o.objectStoreNames);
      if (0 === e.size) r(null);
      else {
        const s = Array.from(e),
          n = o.transaction(s, "readwrite"),
          a = (n.onerror = e => t(e), JSON.parse(i));
        Object.keys(a).forEach(e => {
          s.includes(e) || delete a[e]
        }), 0 === Object.keys(a).length && r(null), s.forEach(t => {
          let s = 0;
          var e = Array.from(a[t] || []);
          a[t] && 0 < e.length ? e.forEach(e => {
            e = n.objectStore(t).add(e);
            e.onsuccess = () => {
              ++s === a[t].length && (delete a[t], 0 === Object.keys(a).length) && r(null)
            }, e.onerror = e => {
              console.log(e)
            }
          }) : a[t] && (delete a[t], 0 === Object.keys(a).length) && r(null)
        })
      }
    })
  }
  exportToJsonString(s) {
    return new Promise((r, t) => {
      const n = {};
      var e = new Set(s.objectStoreNames);
      if (0 === e.size) r(JSON.stringify(n));
      else {
        const a = Array.from(e),
          o = s.transaction(a, "readonly");
        o.onerror = e => t(e), a.forEach(t => {
          const s = [];
          o.objectStore(t).openCursor().onsuccess = e => {
            e = e.target.result;
            e ? (s.push(e.value), e.continue()) : (n[t] = s, a.length === Object.keys(n).length && r(JSON.stringify(n)))
          }
        })
      }
    })
  }
  clearDatabase(o) {
    return new Promise((s, r) => {
      var e = new Set(o.objectStoreNames);
      const n = e.size;
      if (0 === n) s(null);
      else {
        e = Array.from(e);
        const a = o.transaction(e, "readwrite");
        a.onerror = e => r(e);
        let t = 0;
        e.forEach(function(e) {
          a.objectStore(e).clear().onsuccess = () => {
            ++t === n && s(null)
          }
        })
      }
    })
  }
  async exportCredentials() {
    return {
      indexedDb: await this.exportIndexedDb(),
      localStorage: await this.getLocalStorage(),
      sessionStorage: await this.getSessionStorage()
    }
  }
  async importCredentials({
    indexedDb: e,
    localStorage: t,
    sessionStorage: s
  }) {
    return await this.clearIndexedDb(), await this.importIndexedDb(e), await this.clearLocalStorage(), await this.setLocalStorage(t), await this.clearSessionStorage(), await this.setSessionStorage(s), !0
  }
  async openIndexedDBConnection(r) {
    return new Promise((t, e) => {
      const s = indexedDB.open(r);
      s.onsuccess = function(e) {
        t(e.target.result)
      }, s.onerror = function() {
        e(s.error)
      }
    })
  }
  async exportIndexedDb() {
    var e, t = {};
    for ({
        name: e
      }
      of await indexedDB.databases()) {
      var s = await this.openIndexedDBConnection(e);
      t[e] = await this.exportToJsonString(s)
    }
    return t
  }
  async clearIndexedDb() {
    var e;
    for ({
        name: e
      }
      of await indexedDB.databases()) {
      var t = await this.openIndexedDBConnection(e);
      await this.clearDatabase(t)
    }
  }
  async importIndexedDb(e) {
    for (const s in e) {
      var t = await this.openIndexedDBConnection(s);
      await this.importFromJsonString(t, e[s])
    }
  }
  getLocalStorage() {
    return JSON.stringify(window.localStorage)
  }
  setLocalStorage(e) {
    var t = JSON.parse(e);
    for (const s in t) window.localStorage.setItem(s, t[s])
  }
  clearLocalStorage() {
    return window.localStorage.clear()
  }
  getSessionStorage() {
    return JSON.stringify(window.sessionStorage)
  }
  setSessionStorage(e) {
    var t = JSON.parse(e);
    for (const s in t) window.sessionStorage.setItem(s, t[s])
  }
  clearSessionStorage() {
    return window.sessionStorage.clear()
  }
  async getCacheStorage() {
    var e = {};
    for (const a of await window.caches.keys()) {
      var t = await window.caches.open(a),
        s = (e[a] = {}, await t.keys());
      for (const o of s) {
        var r = new URL(o.url),
          r = o.url.replace(r.origin, ""),
          n = await t.match(r);
        e[a][r] = await n.json()
      }
    }
    return JSON.stringify(e)
  }
  async cleanCacheStorage() {
    for (const s of await window.caches.keys()) {
      var e = await window.caches.open(s);
      for (const r of await e.keys()) {
        var t = new URL(r.url),
          t = r.url.replace(t.origin, "");
        await e.delete(t)
      }
    }
  }
  async setCacheStorage(e) {
    var t = JSON.parse(e);
    for (const r in t) {
      var s = await window.caches.open(r);
      for (const n in t[r]) s.put(n, new Response(JSON.stringify(t[r][n])))
    }
  }
}
new ADBlockDOM;
class ExtensionError extends Error {
  constructor({
    message: e,
    type: t
  }) {
    super(e), this.message = e, this.type = t
  }
}
const consoleMessages = {
    log: [],
    info: [],
    warn: [],
    error: [],
    debug: []
  },
  originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };

function processArguments(e) {
  return e.filter(e => "string" == typeof e || e instanceof Error || e && "string" == typeof e.message && "string" == typeof e.stack).map(e => "string" == typeof e ? e : e instanceof Error || e && "string" == typeof e.message && "string" == typeof e.stack ? {
    errorMessage: e.message,
    errorStack: e.stack
  } : void 0)
}

function addConsoleMessage(e, t) {
  var t = processArguments(t);
  0 !== t.length && (t = {
    type: e,
    timestamp: (new Date).toISOString(),
    message: t
  }, consoleMessages[e].push(t), 10 < consoleMessages[e].length) && consoleMessages[e].shift()
}
console.log = function(...e) {
  addConsoleMessage("log", e), originalConsole.log.apply(console, e)
}, console.info = function(...e) {
  addConsoleMessage("info", e), originalConsole.info.apply(console, e)
}, console.warn = function(...e) {
  addConsoleMessage("warn", e), originalConsole.warn.apply(console, e)
}, console.error = function(...e) {
  addConsoleMessage("error", e), originalConsole.error.apply(console, e)
}, console.debug = function(...e) {
  addConsoleMessage("debug", e), originalConsole.debug.apply(console, e)
};
