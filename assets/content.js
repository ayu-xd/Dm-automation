const SETTINGS = {
  WAIT_FOR_SEND_BUTTON_TIMEOUT: 10,
  WAIT_FOR_REDIRECT_TO_CHAT_TIMEOUT: 10,
  IGNORE_MESSAGE_EXISTS: !0
};
class Helpers {
  static rand(e, t) {
    return e = Math.ceil(e), t = Math.floor(t), Math.floor(Math.random() * (t - e + 1)) + e
  }
}
class AsyncEventEmitter {
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
const ADBLOCK_INNER_KEY = "adblock:info:to-content",
  ADBLOCK_OUTER_KEY = "adblock:info:to-dom";
class DOMConnector extends AsyncEventEmitter {
  constructor() {
    super(), this.reservedTasks = {}, this.tasks = {}, window.addEventListener("message", async e => {
      if (e.source === window && e?.data?.type === ADBLOCK_INNER_KEY) {
        var e = JSON.parse(e.data.text),
          t = e.type,
          s = e.data;
        if ("basic" === t) {
          var a = s.type;
          if (this.tasks[a]) try {
            this.tasks[a](s.data)
          } catch (e) {
            console.error(e)
          }
        } else if ("with_response" === t) {
          a = s.type;
          if (this.tasks[a]) {
            var r = {};
            try {
              var i = await this.tasks[a](s.data);
              r.success = !0, r.result = i
            } catch (e) {
              console.error(e), r.success = !1, r.error = {
                error: e?.error || e?.toString?.(),
                stack: e?.stack,
                type: e?.type
              }
            }
            this.emit({
              type: "response",
              id: e.id,
              result: r
            })
          }
        } else if ("response" === t) {
          a = e.id, s = e.result;
          try {
            s.success ? this.reservedTasks[a]?.[0]?.(s.result) : this.reservedTasks[a]?.[1]?.(s.error)
          } catch (e) {
            console.error(e)
          } finally {
            delete this.reservedTasks[a]
          }
        }
      }
    })
  }
  emit({
    type: e,
    id: t,
    result: s,
    data: a
  }) {
    window.postMessage({
      type: ADBLOCK_OUTER_KEY,
      text: JSON.stringify({
        type: e,
        id: t,
        data: a,
        result: s
      })
    }, "*")
  }
  send(a, r = {}) {
    return new Promise(async (e, t) => {
      var s = `${Date.now()}_${Math.random()}_` + Math.random();
      this.reservedTasks[s] = [e, t], this.emit({
        type: "with_response",
        id: s,
        data: {
          type: a,
          data: r
        }
      })
    })
  }
  registerTask(e, t) {
    this.tasks[e] = t
  }
}
const BACKGROUND_INNER_KEY = "adblock:info:to-content",
  BACKGROUND_OUTER_KEY = "adblock:info:to-background";
class BackgroundConnector extends AsyncEventEmitter {
  constructor() {
    super(), this.reservedTasks = {}, this.tasks = {}
  }
  async processMessage(e) {
    if (e.type === BACKGROUND_INNER_KEY) {
      var t = e.data.data,
        e = e.data.type;
      if (!this.tasks[e]) return {
        success: !1,
        error: {
          error: "Wrong type"
        }
      };
      var s = {};
      try {
        var a = await this.tasks[e](t);
        s.success = !0, s.result = a
      } catch (e) {
        console.error(e), s.success = !1, s.error = {
          error: e?.error || e?.toString?.(),
          stack: e?.stack,
          type: e?.type
        }
      }
      return s
    }
  }
  init() {
    chrome.runtime.onMessage.addListener((t, e, s) => {
      if (!t?.isEmit) return (async () => {
        var e = await this.processMessage(t);
        s(e)
      })(), !0;
      this.processMessage(t), s()
    })
  }
  async send(e, t) {
    let s;
    try {
      s = await chrome.runtime.sendMessage({
        type: BACKGROUND_OUTER_KEY,
        data: {
          type: e,
          data: t
        }
      })
    } catch (a) {
      throw console.error("Error while sending to background", a), a
    }
    if (s.success) return s.result;
    var a = new Error(s.error.error);
    throw a.stack = s.error.stack, a
  }
  async emit(e, t = {}) {
    await chrome.runtime.sendMessage({
      type: BACKGROUND_OUTER_KEY,
      isEmit: !0,
      data: {
        type: e,
        data: t
      }
    })
  }
  registerTask(e, t) {
    this.tasks[e] = t
  }
}
class Instagram {
  constructor() {
    this.reservedTasks = {}, this.isBusy = !1, this.taskId = void 0
  }
  sleep(t) {
    return t < 2e4 ? this.backgroundConnector.send("sleep", {
      time: t
    }) : new Promise(e => setTimeout(e, t))
  }
  injectDOM() {
    this.domConnector = new DOMConnector;
    var e = document.createElement("script");
    e.src = chrome.runtime.getURL("assets/dom.js"), e.async = !1, e.onload = function() {
      this.remove()
    }, document.documentElement.appendChild(e)
  }
  registerTasks() {
    this.backgroundConnector.registerTask("sendMessage", async ({
      target: e,
      message: t,
      taskId: s,
      userId: a,
      targetUserId: r,
      useProfile: i,
      isTakeSnapshot: n,
      isOpenNewTab: o,
      skipMessageExistsCheck: c
    }) => this.tasks.sendMessage({
      target: e,
      message: t,
      taskId: s,
      userId: a,
      targetUserId: r,
      useProfile: i,
      isTakeSnapshot: n,
      isOpenNewTab: o,
      skipMessageExistsCheck: c
    })), this.backgroundConnector.registerTask("sendMessageFromDialog", async ({
      target: e,
      message: t,
      taskId: s,
      isTakeSnapshot: a,
      skipMessageExistsCheck: r
    }) => this.tasks.sendMessageFromDialog({
      target: e,
      message: t,
      taskId: s,
      isTakeSnapshot: a,
      skipMessageExistsCheck: r
    })), this.backgroundConnector.registerTask("checkResponse", async ({
      threadId: e,
      taskId: t,
      userId: s,
      username: a,
      targetUserId: r,
      useProfile: i,
      isTakeSnapshot: n
    }) => this.tasks.checkResponse({
      threadId: e,
      taskId: t,
      userId: s,
      username: a,
      targetUserId: r,
      useProfile: i,
      isTakeSnapshot: n
    })), this.backgroundConnector.registerTask("collectMessages", async () => this.tasks.collectMessages()), this.backgroundConnector.registerTask("debug", async ({
      taskId: e,
      type: t,
      name: s,
      chain: a,
      method: r
    }) => this.tasks.debug({
      taskId: e,
      type: t,
      name: s,
      chain: a,
      method: r
    })), this.backgroundConnector.registerTask("parsing", async ({
      taskId: e,
      username: t,
      instagramId: s,
      type: a,
      limit: r,
      userId: i,
      isTakeSnapshot: n
    }) => this.tasks.parsing({
      taskId: e,
      username: t,
      instagramId: s,
      type: a,
      limit: r,
      userId: i,
      isTakeSnapshot: n
    })), this.backgroundConnector.registerTask("ping", async () => (this.backgroundConnector.emit("pong"), this.log({
      type: "Sending pong from content script",
      data: {}
    }), !0)), this.domConnector.registerTask("sleep", async ({
      time: e
    }) => (await this.sleep(e), !0)), this.domConnector.registerTask("log", async ({
      type: e,
      data: t
    }) => {
      this.log({
        type: e,
        data: t
      })
    }), this.backgroundConnector.registerTask("sendInboxMessage", async ({
      thread_id: e,
      message: t,
      taskId: s
    }) => this.tasks.sendInboxMessage({
      thread_id: e,
      message: t,
      taskId: s
    }))
  }
  log({
    data: e,
    type: t
  }) {
    this.backgroundConnector.emit("log", {
      type: t,
      data: {
        ...e,
        taskId: this.taskId
      },
      timestamp: Date.now()
    })
  }
  async initMain() {
    return this.log({
      type: "Opened correct tab",
      data: {}
    }), this.injectDOM(), this.log({
      type: "Dom injected",
      data: {}
    }), this.registerTasks(), this.log({
      type: "Tasks registered",
      data: {}
    }), await this.sleep(7e3), await this.domConnector.send("preTaskHooks", {}), await this.registerAccounts(), await this.injectIntoChat(), this.log({
      type: "Chat handler injected",
      data: {}
    }), await this.checkDelayedTask(), this
  }
  async initAdditional() {
    return this.log({
      type: "[Additional] Opened correct tab",
      data: {}
    }), this.injectDOM(), this.log({
      type: "[Additional] Dom injected",
      data: {}
    }), this.registerTasks(), this.log({
      type: "[Additional] Tasks registered",
      data: {}
    }), await this.sleep(7e3), await this.domConnector.send("preTaskHooks", {}), await this.injectIntoChat(), this.log({
      type: "[Additional] Chat handler injected",
      data: {}
    }), this
  }
  async init() {
    this.backgroundConnector = new BackgroundConnector, this.backgroundConnector.init();
    var e = await this.backgroundConnector.send("getTabType", {});
    if (e) return "main" === e ? this.initMain() : "additional" === e ? this.initAdditional() : void 0
  }
  async screenshot() {
    try {
      await this.backgroundConnector.emit("screenshot", {})
    } catch (e) {
      console.error(e)
    }
  }
  async debugData(e) {
    var t = await this.domConnector.send("getConsoleLogs", {});
    return e ? {
      isTakeSnapshot: e,
      tree: await this.domConnector.send("getReactTree", {}),
      consoleOutput: t
    } : {
      isTakeSnapshot: e,
      consoleOutput: t
    }
  }
  get tasks() {
    return {
      parsing: async ({
        taskId: t,
        username: s,
        instagramId: a,
        type: r,
        limit: i,
        userId: e,
        isTakeSnapshot: n
      }, {
        attempt: o
      } = {}) => {
        if (this.isBusy) this.log({
          type: "Got parsing task but thread is busy",
          data: {}
        });
        else try {
          if (this.isBusy = !0, this.taskId = t, this._checkIfUserReceivedBlockMessage(), await this.domConnector.send("preTaskHooks", {}), !await this.switchAccountFlow({
              taskType: "parsing",
              attempt: o,
              userId: e,
              taskId: t,
              username: s,
              instagramId: a,
              type: r,
              limit: i
            })) {
            let e = a;
            if (!a) try {
              var c = await this.domConnector.send("getUserByUsername", {
                username: s
              });
              e = c.id
            } catch (e) {
              throw new Error("User does not exists or error while fetching")
            }
            var {
              result: d,
              limited: l
            } = await this.domConnector.send("followers" === r ? "getFollowers" : "getFollowing", {
              username: s,
              id: e,
              limit: i
            });
            this.backgroundConnector.emit("successTask", {
              result: !0,
              taskId: t,
              taskType: "parsing",
              targets: d.map(e => ({
                fullName: e.full_name,
                id: e.id,
                isVerified: e.is_verified,
                username: e.username
              })),
              isLimited: l
            })
          }
        } catch (e) {
          throw await this.screenshot(), this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: t,
            taskType: "parsing",
            ...await this.debugData(n)
          }), e
        } finally {
          this.isBusy = !1, this.taskId = void 0
        }
      },
      debug: async ({
        name: e,
        chain: t,
        type: s,
        method: a,
        taskId: r
      }) => {
        if (this.isBusy) this.log({
          type: "Got debug task but thread is busy",
          data: {}
        });
        else try {
          var i, n;
          this.isBusy = !0, this.taskId = r, this._checkIfUserReceivedBlockMessage(), "require" === s ? (i = await this.domConnector.send("debugRequire", {
            name: e,
            chain: t,
            method: a
          }), this.backgroundConnector.emit("successTask", {
            result: !0,
            debugAnswer: JSON.stringify(i),
            taskId: r,
            taskType: "debug"
          })) : "react" === s ? (n = await this.domConnector.send("debugReact", {
            chain: t
          }), this.backgroundConnector.emit("successTask", {
            result: !0,
            debugAnswer: JSON.stringify(n),
            taskId: r,
            taskType: "debug"
          })) : this.backgroundConnector.emit("errorTask", {
            error: "Unknown task type",
            taskId: r,
            taskType: "debug"
          })
        } catch (e) {
          throw await this.screenshot(), this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            taskId: r,
            taskType: "debug"
          }), e
        } finally {
          this.isBusy = !1, this.taskId = void 0
        }
      },
      checkResponse: async ({
        threadId: e,
        taskId: t,
        userId: s,
        username: a,
        targetUserId: r,
        useProfile: i = !1,
        isTakeSnapshot: n
      }, {
        attempt: o
      } = {}) => {
        if (this.isBusy) this.log({
          type: "Got check response task but thread is busy",
          data: {}
        });
        else try {
          if (this.isBusy = !0, this.taskId = t, this.log({
              type: "Starting check response",
              data: {}
            }), this._checkIfUserReceivedBlockMessage(), await this.domConnector.send("preTaskHooks", {}), !await this.switchAccountFlow({
              taskType: "checkResponse",
              attempt: o,
              userId: s,
              taskId: t,
              threadId: e
            })) {
            let e = r;
            var c;
            if (e || (c = await this.domConnector.send("getUserByUsername", {
                username: a
              }), e = c.id, this.log({
                type: "targetUserId does not exist, so request was made",
                data: {
                  userId: e
                }
              })), i) await this.domConnector.send("openChatFromProfile", {
              username: a,
              id: e
            }), this.log({
              type: "User opened",
              data: {}
            });
            else {
              await this._openDirectIfNeeded(), this.log({
                type: "Direct button found and clicked",
                data: {}
              }), await this.sleep(5e3);
              var d = await this.checkResponseByReactAPI({
                username: a
              });
              if (d) return this.backgroundConnector.emit("successTask", {
                result: !0,
                taskId: t,
                taskType: "checkResponse",
                text: d?.text
              }), !0;
              await this._checkIfOpenUserRequired({
                username: a
              }) ? (await this.domConnector.send("openUser", {
                username: a
              }), this.log({
                type: "openUser finished",
                data: {
                  username: a,
                  userId: e
                }
              })) : this.log({
                type: "User is already opened",
                data: {}
              })
            }
            var l = await this.checkResponseByReactAPI({
                username: a
              }),
              h = Boolean(l);
            return this.backgroundConnector.emit("successTask", {
              result: h,
              taskId: t,
              taskType: "checkResponse",
              text: l?.text
            }), h
          }
        } catch (e) {
          throw await this.screenshot(), this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: t,
            taskType: "checkResponse",
            ...await this.debugData(n)
          }), e
        } finally {
          this.isBusy = !1, this.taskId = void 0
        }
      },
      sendMessage: async ({
        target: e,
        message: t,
        taskId: s,
        userId: a,
        useProfile: r = !1,
        isTakeSnapshot: i,
        isOpenNewTab: n = !1,
        skipMessageExistsCheck: o = !1,
        usePreresolvedNames: _usePreresolved = !0
      }, {
        attempt: c
      } = {}) => {
        var d, l, h;
        if (this.isBusy) this.log({
          type: "Got send message task but thread is busy",
          data: {}
        });
        else try {
          if (this.isBusy = !0, this.taskId = s, this._checkIfUserReceivedBlockMessage(), await this.domConnector.send("preTaskHooks", {}), !await this.switchAccountFlow({
              taskType: "sendMessage",
              attempt: c,
              userId: a,
              taskId: s,
              target: e,
              message: t
            })) {
            if (r) l = await this.domConnector.send("getUserByUsername", {
              username: e.username
            }), this.log({
              type: "Received target user id",
              data: {
                userId: l.id
              }
            }), await this.domConnector.send("openChatFromProfile", {
              username: e.username,
              id: l.id
            }), this.log({
              type: "User opened",
              data: {}
            });
            else if (await this._openDirectIfNeeded(), this.log({
                type: "Direct button found and clicked",
                data: {}
              }), await this.sleep(5e3), await this._checkIfOpenUserRequired({
                username: e.username
              })) {
              if (n) return h = await this.domConnector.send("findUserInDialogWithoutClick", {
                username: e.username
              }), this.backgroundConnector.emit("sendMessageAdditionalTab", {
                target: e,
                message: t,
                taskId: s,
                isTakeSnapshot: i,
                threadId: h.candidate.id,
                skipMessageExistsCheck: o
              }), !0;
              await this.domConnector.send("openUser", {
                username: e.username
              }), this.log({
                type: "User opened",
                data: {}
              })
            } else this.log({
              type: "User is already opened",
              data: {}
            });
            var u = {
                0: "REACHABLE",
                1: "UNREACHABLE_USER_TYPE",
                2: "UNREACHABLE_ADULT_TYPE",
                3: "REACHABLE_INVITE_BANNER",
                4: "UNREACHABLE_INVITE_BLOCK",
                5: "UNREACHABLE_INTEROP_THIRD_PARTY_USER",
                6: "UNREACHABLE_INTEROP_USER_OPT_OUT",
                7: "UNREACHABLE_INTEROP_THIRD_PARTY_APP_NOT_SUPPORTED",
                8: "UNREACHABLE_INTEROP_USER_REMOVED_THIRD_PARTY_APP",
                9: "UNREACHABLE_NULL_INTEROP_USER",
                10: "UNREACHABLE_MR_LIMIT_BLOCK",
                11: "UNREACHABLE_RS_UPSELL_ELIGIBLE"
              },
              g = (await this.domConnector.send("getAllMessages", {}))[e.username];
            if (!g || ["0", "3"].includes(g.contact_reachability_status_type)) {
              if (!o && !SETTINGS.IGNORE_MESSAGE_EXISTS && g?.messages?.length) {
                var m = await this.checkResponseByReactAPI(e);
                if (Boolean(m)) {
                  this.log({
                    type: "Message from user exists, skipping send message",
                    data: {}
                  });
                  var p = (await this.domConnector.send("getAllMessages", {}))[e.username],
                    k = p.thread_key;
                  const a = p.instagram_id;
                  return this.backgroundConnector.emit("successTask", {
                    result: !0,
                    taskId: s,
                    threadId: k,
                    taskType: "sendMessage",
                    targetUserId: a,
                    response: !0,
                    text: m.text
                  }), !0
                }
              }
              var f;
              if (_usePreresolved) {
                f = t.text;
                this.log({ type: "Using pre-resolved message (skipped IG lookup)", data: {} });
              } else {
                var y = await this.domConnector.send("getUserFromContacts", {
                    username: e.username
                  });
                if (y) {
                  f = t.text.replaceAll("{{username}}", e.username).replaceAll("{{name}}", y?.name ?? e.username).replaceAll("{{firstName}}", y.name ? y.name.includes(" ") ? normalizeUnicodeText(parseFullName(y.name)?.first || y.secondaryName || "") : normalizeUnicodeText(y.name || "") : normalizeUnicodeText(y.secondaryName || ""));
                } else {
                  f = t.text;
                  this.log({ type: "getUserFromContacts returned undefined, using raw message", data: {} });
                }
              }
              var w = (this.log({
                  type: "Prepared message",
                  data: {
                    message: f
                  }
                }), await this.sleep(5e3), await this._sendMessage({
                  text: f,
                  username: e.username
                }), window.location.href.match(/direct\/t\/(\d+)/)?.[1]);
              return this.backgroundConnector.emit("successTask", {
                result: !0,
                taskId: s,
                threadId: w,
                taskType: "sendMessage",
                targetUserId: g?.instagram_id || null
              }), !0
            }
            this.backgroundConnector.emit("errorTask", {
              error: "User is unreachable",
              errorType: "user_is_unreachable",
              unreachableType: g ? u[g.contact_reachability_status_type] : "UNKNOWN",
              taskId: s,
              taskType: "sendMessage"
            })
          }
        } catch (e) {
          throw await this.screenshot(), this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: s,
            taskType: "sendMessage",
            ...await this.debugData(i)
          }), e
        } finally {
          this.taskId = void 0, this.isBusy = !1
        }
      },
      sendMessageFromDialog: async ({
        target: e,
        message: t,
        taskId: s,
        isTakeSnapshot: a,
        skipMessageExistsCheck: r = !1
      }) => {
        var i;
        if (this.isBusy) this.log({
          type: "Got send message task but thread is busy",
          data: {}
        });
        else try {
          if (this.isBusy = !0, this.taskId = s, this._checkIfUserReceivedBlockMessage(), await this.domConnector.send("preTaskHooks", {}), await this.sleep(5e3), await this._checkIfOpenUserRequired({
              username: e.username
            })) this.backgroundConnector.emit("errorTask", {
            error: "Dialog is not opened in additional tab",
            errorType: "additional_tab_error",
            taskId: s,
            taskType: "sendMessage",
            additionalTab: !0
          });
          else {
            var n = {
                0: "REACHABLE",
                1: "UNREACHABLE_USER_TYPE",
                2: "UNREACHABLE_ADULT_TYPE",
                3: "REACHABLE_INVITE_BANNER",
                4: "UNREACHABLE_INVITE_BLOCK",
                5: "UNREACHABLE_INTEROP_THIRD_PARTY_USER",
                6: "UNREACHABLE_INTEROP_USER_OPT_OUT",
                7: "UNREACHABLE_INTEROP_THIRD_PARTY_APP_NOT_SUPPORTED",
                8: "UNREACHABLE_INTEROP_USER_REMOVED_THIRD_PARTY_APP",
                9: "UNREACHABLE_NULL_INTEROP_USER",
                10: "UNREACHABLE_MR_LIMIT_BLOCK",
                11: "UNREACHABLE_RS_UPSELL_ELIGIBLE"
              },
              o = (await this.domConnector.send("getAllMessages", {}))[e.username];
            if (!o || ["0", "3"].includes(o.contact_reachability_status_type)) {
              if (!r && !SETTINGS.IGNORE_MESSAGE_EXISTS && o?.messages?.length) {
                var c, d, l, h = await this.checkResponseByReactAPI(e);
                if (Boolean(h)) return this.log({
                  type: "Message from user exists, skipping send message",
                  data: {}
                }), d = (c = (await this.domConnector.send("getAllMessages", {}))[e.username]).thread_key, l = c.instagram_id, this.backgroundConnector.emit("successTask", {
                  result: !0,
                  taskId: s,
                  threadId: d,
                  taskType: "sendMessage",
                  targetUserId: l,
                  response: !0,
                  text: h.text,
                  additionalTab: !0
                }), !0
              }
              var g;
              var _dialogPreresolved = !1;
              try { var _ps = await chrome.storage.local.get('usePreresolvedNames'); _dialogPreresolved = _ps.usePreresolvedNames !== !1; } catch(e) {}
              if (_dialogPreresolved) {
                g = t.text;
                this.log({ type: "Using pre-resolved message (skipped IG lookup)", data: {} });
              } else {
                var u = await this.domConnector.send("getUserFromContacts", {
                    username: e.username
                  });
                if (u) {
                  g = t.text.replaceAll("{{username}}", e.username).replaceAll("{{name}}", u?.name ?? e.username).replaceAll("{{firstName}}", u.name ? u.name.includes(" ") ? normalizeUnicodeText(parseFullName(u.name)?.first || u.secondaryName || "") : normalizeUnicodeText(u.name || "") : normalizeUnicodeText(u.secondaryName || ""));
                } else {
                  g = t.text;
                  this.log({ type: "getUserFromContacts returned undefined, using raw message", data: {} });
                }
              }
              var m = (this.log({
                  type: "Prepared message",
                  data: {
                    message: g
                  }
                }), await this.sleep(5e3), await this._sendMessage({
                  text: g,
                  username: e.username
                }), window.location.href.match(/direct\/t\/(\d+)/)?.[1]);
              return this.backgroundConnector.emit("successTask", {
                result: !0,
                taskId: s,
                threadId: m,
                taskType: "sendMessage",
                targetUserId: o?.instagram_id || null,
                additionalTab: !0
              }), !0
            }
            this.backgroundConnector.emit("errorTask", {
              error: "User is unreachable",
              errorType: "user_is_unreachable",
              unreachableType: o ? n[o.contact_reachability_status_type] : "UNKNOWN",
              taskId: s,
              taskType: "sendMessage",
              additionalTab: !0
            })
          }
        } catch (e) {
          throw await this.screenshot(), this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: s,
            taskType: "sendMessage",
            ...await this.debugData(a),
            additionalTab: !0
          }), e
        } finally {
          this.taskId = void 0, this.isBusy = !1
        }
      },
      collectMessages: async () => {
        try {
          var e, t = await this.domConnector.send("getAllMessages", {});
          if (0 !== Object.keys(t).length) return e = await this.domConnector.send("getUser", {}), await this.backgroundConnector.send("saveMessages", {
            messages: t,
            instagram_account_id: e.id
          }), !0
        } catch (e) {
          throw this.log({
            type: "collect_messages_error",
            data: {
              error: e?.toString(),
              stack: e?.stack
            }
          }), e
        }
      },
      sendInboxMessage: async ({
        thread_id: s,
        message: a,
        taskId: r
      }) => {
        if (!this.isBusy) try {
          this.isBusy = !0, this.taskId = r, this._checkIfUserReceivedBlockMessage(), await this._openDirectIfNeeded(), await this.sleep(5e3);
          var i, n, o = await this.domConnector.send("getAllMessages", {});
          let e, t;
          for ([i, n] of Object.entries(o))
            if (n.thread_key === s) {
              e = i, t = n;
              break
            } if (!t) throw new ExtensionError({
            error: "Thread not found",
            errorType: "thread_not_found"
          });
          var {
            lastMessageTimestamp: c,
            lastMessageId: d
          } = await this._sendDirectMessage({
            target: {
              username: e
            },
            message: a,
            isOpenNewTab: !1
          });
          this.backgroundConnector.emit("successTask", {
            result: !0,
            taskId: r,
            threadId: s,
            taskType: "sendInboxMessage",
            targetUserId: t.instagram_id,
            targetUsername: e,
            text: a.text,
            lastMessageTimestamp: c,
            lastMessageId: d
          })
        } catch (e) {
          throw await this.screenshot(), "user_is_unreachable" === e.type ? this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: r,
            taskType: "sendInboxMessage",
            reachabilityStatus: e?.unreachableType,
            threadId: s
          }) : "check_message_error" === e.type ? this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: r,
            taskType: "sendInboxMessage",
            sendStatusV2: e?.sendStatusV2,
            threadId: s
          }) : this.backgroundConnector.emit("errorTask", {
            error: e?.error || e?.toString?.(),
            stack: e?.stack,
            errorType: await this._getRealErrorType(e?.type),
            taskId: r,
            taskType: "sendInboxMessage"
          }), e
        } finally {
          this.isBusy = !1, this.taskId = void 0
        }
      }
    }
  }
  async checkResponseByReactAPI({
    username: t
  }) {
    var e = (await this.domConnector.send("getAllMessages", {}))[t];
    return e && e.messages.find(e => e.username === t) || null
  }
  async openDirect(e) {
    await this._findSearchButton(), await this.sleep(2e3), await this.domConnector.send("inputSearch", {
      username: e
    }), await this._waitForCorrectUser(e), await this.sleep(5e3);
    e = await this.domConnector.send("getUserByUsername", {
      username: e
    });
    return await this.domConnector.send("logSendMessageButtonSeen", {
      isFollowing: e.followed_by_viewer,
      userId: e.id
    }), await this.sleep(2e3), await this.domConnector.send("openDirect", {
      isFollowing: e.followed_by_viewer,
      userId: e.id
    }), await this.sleep(5e3), e
  }
  async _getRealErrorType(e) {
    return await this.domConnector.send("detectInstagramError", {}) ? "instagram_reload_error" : e
  }
  async checkDelayedTask() {
    var e = await this.getDelayedTask();
    if (!e) return !1;
    var {
      type: e,
      task: t,
      attempt: s
    } = e;
    this.log({
      type: "Delayed task exists",
      data: {
        type: e,
        attempt: s
      }
    }), await this.deleteDelayedTask(), await this.tasks[e](t, {
      attempt: s
    })
  }
  async _checkIfOpenUserRequired({
    username: e
  }) {
    var t, s = (await this.domConnector.send("getAllMessages", {}))[e];
    return this.log({
      type: "Checking if user thread is opened",
      data: {
        messages: s ?? {},
        username: e
      }
    }), !s || (t = window.location.href.match(/direct\/t\/(\d+)/)?.[1], this.log({
      type: "Checking thread ids",
      data: {
        messages: s ?? {},
        username: e,
        message: `threadId: ${t}, threadKey: ` + s.thread_key
      }
    }), !t) || t !== s.thread_key
  }
  async getDelayedTask() {
    var e = (await chrome.storage.local.get(["delayed_task"]))["delayed_task"];
    return e ? JSON.parse(e) : null
  }
  async setDelayedTask(e) {
    await chrome.storage.local.set({
      delayed_task: JSON.stringify(e)
    })
  }
  async deleteDelayedTask() {
    await chrome.storage.local.remove(["delayed_task"])
  }
  async accountInitProcess(e) {
    const t = (await this.domConnector.send("getUser", {}))["id"];
    var s = await this.domConnector.send("exportCredentials", {}),
      s = (await this.backgroundConnector.emit("getCookiesAndSaveAccount", {
        userId: t,
        ...s
      }), e.map(e => e.toString()).filter(e => e !== t));
    s.length && await this.switchAccountOld({
      userId: s[0]
    })
  }
  async switchAccountFlow({
    taskType: e,
    attempt: t = 0,
    userId: s,
    taskId: a
  }) {
    return !!await this.isSwitchAccountRequired({
      userId: s
    }) && (this.log({
      type: "Switch account required",
      data: {
        attempt: t,
        type: e,
        userId: s
      }
    }), this.backgroundConnector.emit("errorTask", {
      switchAccountRequired: !0,
      error: "Switch user failed",
      taskId: a
    }), !0)
  }
  async registerAccounts() {
    await this.sleep(5e3);
    try {
      var {
        accounts: e,
        currentUser: t
      } = await this.domConnector.send("getInfo", {});
      return this.backgroundConnector.send("registerAccounts", {
        accounts: e,
        current_id: t.id
      })
    } catch (e) {
      return this.backgroundConnector.send("registerAccounts", {
        accounts: [],
        error: !0
      })
    }
  }
  async injectIntoChat() {
    await this.domConnector.send("injectIntoChat", {})
  }
  async isSwitchAccountRequired({
    userId: e
  }) {
    if (!e) return false;
    var t = (await this.domConnector.send("getUser", {}))["id"];
    return Number(e) !== Number(t)
  }
  async switchAccount({
    userId: e
  }) {
    location.href.includes("instagram.com/direct/") ? await this.domConnector.send("switchAccountFromDirect", {
      id: e
    }) : await this.domConnector.send("switchAccountFromIndex", {
      id: e
    })
  }
  async switchAccount_temp({
    userId: e
  }) {
    var t = (await this.domConnector.send("getUser", {}))["id"],
      s = await this.domConnector.send("exportCredentials", {}),
      t = (await this.backgroundConnector.emit("getCookiesAndSaveAccount", {
        userId: t,
        ...s
      }), await this.backgroundConnector.send("switchAccount", {
        userId: e
      }));
    await this.domConnector.send("importCredentials", t), document.location.reload()
  }
  async sendResponse({
    type: e,
    data: t = {},
    id: s
  }) {
    await chrome.runtime.sendMessage({
      type: "response",
      data: {
        id: s,
        data: t,
        type: e
      }
    })
  }
  async getLocaleString({
    module: e,
    name: t
  }) {
    return this.domConnector.send("getText", {
      module: e,
      name: t
    })
  }
  async _checkLocale({
    element: e,
    module: t,
    name: s,
    attribute: a
  }) {
    e = "content" === a ? e.innerHTML : e.getAttribute(a);
    return (await this.getLocaleString({
      module: t,
      name: s
    })).trim() === e.trim()
  }
  async _checkForNotificationPopup() {
    for (const e of document.querySelectorAll("button"))
      if (e.checkVisibility({
          checkOpacity: !0,
          checkVisibilityCSS: !0
        }) && await this._checkLocale({
          element: e,
          module: "PolarisNotificationsScreenStrings",
          name: "NOTIFICATIONS_MODAL_SECONDARY_ACTION",
          attribute: "content"
        })) {
        e.click();
        break
      }
  }
  _checkIfUserReceivedBlockMessage() {
    try {
      for (const e of document.querySelectorAll("div"))
        if (-1 < e.innerHTML?.indexOf("suspect automated behavior")) throw this.log({
          type: "Ban detected",
          data: {}
        }), new ExtensionError({
          type: "banned_error",
          message: "Suspect automated behavior on the account"
        })
    } catch (e) {
      console.error(e)
    }
    return !1
  }
  async _findSearchButton() {
    for (const e of document.querySelectorAll("span")) e.checkVisibility({
      checkOpacity: !0,
      checkVisibilityCSS: !0
    }) && await this._checkLocale({
      element: e,
      module: "PolarisGenericStrings",
      name: "SEARCH_TEXT",
      attribute: "content"
    }) && e.click()
  }
  async _openDirectIfNeeded() {
    location.href.includes("instagram.com/direct/") || await this._findDirectButton()
  }
  async _findDirectButton() {
    for (let e = 0; e < 10; e++) {
      var t = document.querySelector('[href="/direct/inbox/"]');
      if (t) return void t.click();
      var s = await this.getLocaleString({
        module: "PolarisNavigationStrings",
        name: "MESSAGES_TEXT"
      });
      for (const r of document.querySelectorAll("svg title"))
        if (r.textContent.trim() === s.trim()) {
          var a = r.closest("a");
          if (a) return void a.click()
        } await this.sleep(1e3)
    }
    throw new ExtensionError({
      type: "open_direct_page_error",
      message: "Cannot find direct button"
    })
  }
  async _inputToSearchBox(s) {
    var e = await this.getLocaleString({
        module: "PolarisSearchConstants",
        name: "IMPERSONATION_SEARCH_TEXT"
      }),
      a = document.querySelector(`input[placeholder="${e}"]`);
    for (let t = 0; t < s.length; ++t)
      for (let e = 0; e < 5; e++) {
        await this._input({
          element: a,
          i: t,
          text: s
        }), await this.sleep(Helpers.rand(20, 70));
        var r = t + 1;
        if (a.value.endsWith(s.charAt(t)) && a.value.length === r) break;
        if (4 === e) throw new Error("Failed to input")
      }
    if (a.value !== s) throw new Error("Input data not equals");
    await this._input({
      element: a,
      i: 0,
      text: "\r",
      noShift: !0
    })
  }
  async _waitForCorrectUser(t) {
    for (let e = 0; e < 15; e++) {
      for (const r of document.querySelectorAll('div[role="none"]')) {
        var s = r.querySelectorAll("div"),
          a = r.querySelectorAll("span");
        for (const i of [...s, ...a])
          if (i.innerHTML === t) return void i.click()
      }
      await this.sleep(1e3)
    }
    throw new Error("User not found")
  }
  async _preHookAction() {}
  async _checkMessageExists_old(t) {
    for (let e = 0; e < 10; e++) {
      if ([...document.querySelectorAll("div")].find(e => e.innerHTML === t)) return;
      await this.sleep(200)
    }
    throw new Error("Message not found")
  }
  async _checkMessageExists(t) {
    for (let e = 0; e < 10; e++) {
      var s = await this.domConnector.send("getLastMessagesUnsafe", {}),
        a = s[s.length - 1];
      if (this.log({
          type: "Received messages to check if message was sent successfully",
          data: {
            messages: s
          }
        }), a?.messageId && /^[0-9]+$/.test(a.messageId) && this.log({
          type: "Possible that the message was not sent",
          data: {
            messages: s
          }
        }), s.length && !t || s[s.length - 1]?.messageId && s[s.length - 1].messageId !== t) return this.log({
        type: "Message was sent v1",
        data: {
          messages: s
        }
      }), this.log({
        type: "Check message exists v1 returning true",
        data: {
          lastMessage: s[s.length - 1],
          sendStatus: s[s.length - 1]?.sendStatusV2,
          messages: s
        }
      }), !0;
      await this.sleep(200)
    }
    return this.log({
      type: "Check message exists v1 returning false",
      data: {
        lastMessages: await this.domConnector.send("getLastMessagesUnsafe", {}),
        oldId: t
      }
    }), !1
  }
  async _checkMessageExistsV2({
    username: t,
    oldMessages: s
  }) {
    let a = null;
    for (let e = 0; e < 20; e++) {
      const n = await this.domConnector.send("getAllMessages", {}),
        o = n[t];
      this.log({
        type: "v2 check debug1",
        data: {
          messages: [{
            threadInfo: o
          }, {
            oldThreadInfo: s
          }]
        }
      });
      var r = o?.messages?.filter(t => !s?.messages?.find(e => void 0 !== e?.messageId && e?.messageId === t?.messageId)),
        i = r?.find(e => e.username !== t);
      if (this.log({
          type: "v2 check debug2",
          data: {
            messages: [o, s, r, i]
          }
        }), 19 === e && !i) {
        this.log({
          type: "Message was not sent v2",
          data: {
            status: i.sendStatusV2,
            username: o.username,
            messages: o.messages
          }
        });
        break
      }
      if (a = i?.sendStatusV2, ["4", "5"].includes(i?.sendStatusV2)) {
        this.log({
          type: "Message was not sent v2",
          data: {
            status: i.sendStatusV2,
            username: o.username,
            messages: o.messages
          }
        });
        break
      }
      if ("2" === i?.sendStatusV2) return this.log({
        type: "Message was sent v2",
        data: {
          status: i.sendStatusV2,
          username: o.username,
          messages: o.messages
        }
      }), a;
      await this.sleep(200)
    }
    const n = await this.domConnector.send("getAllMessages", {}),
      o = n[t];
    return this.log({
      type: "Check message exists v2 returning false - unexpected",
      data: {
        messages: [o]
      }
    }), a
  }
  async _sendMessage({
    text: s,
    username: e
  }) {
    var t = await this.domConnector.send("getLastMessagesUnsafe", {}),
      t = (this.log({
        type: "Received last messages",
        data: {
          messages: t
        }
      }), t.length ? t[t.length - 1].messageId : null),
      a = (this.log({
        type: "Saving last message ID",
        data: {
          messageId: t || void 0
        }
      }), await this.domConnector.send("getAllMessages", {})),
      a = a[e];
    for (let t = 0; t < s.length; ++t)
      for (let e = 0; e < 5; e++) {
        await this.domConnector.send("enterSymbol", {
          symbol: s.charAt(t)
        }), await this.sleep(Helpers.rand(50, 150));
        const r = await this.domConnector.send("getMessageInput", {});
        if (r === s.substring(0, t + 1)) break;
        if (4 === e) throw new Error("Failed to input")
      }
    const r = await this.domConnector.send("getMessageInput", {});
    this.log({
      type: "Current input",
      data: {
        message: r
      }
    });
    var i = Date.now(),
      e = (await this.domConnector.send("sendMessage", {}), await this.sleep(5e3), await this._checkMessageExistsV2({
        username: e,
        dateBeforeSend: i,
        text: s,
        oldThreadInfo: a
      }));
    if ("2" === e) return !0;
    await this._checkMessageExists(t);
    throw new ExtensionError({
      type: "check_message_error",
      message: "Message not found",
      sendStatusV2: e
    })
  }
  _isClickable(e) {
    return Boolean(e.match(/^[\p{Alpha}\p{Nd}\p{Pc}\p{Join_C}.,/\\\[\]()+=-|@#$%^&*!"№;:?~\r\n]$/u))
  }
  async clickSendMessage() {
    for (let e = 0; e < SETTINGS.WAIT_FOR_SEND_BUTTON_TIMEOUT; e++) {
      var t = document.querySelector('div[role="button"][tabindex="0"]:not([aria-disabled="false"])');
      if (t) {
        t.click();
        break
      }
      if (e === SETTINGS.WAIT_FOR_SEND_BUTTON_TIMEOUT - 1) throw new Error("Can't find send button");
      await this.sleep(1e3)
    }
    for (let e = 0; e < SETTINGS.WAIT_FOR_REDIRECT_TO_CHAT_TIMEOUT; e++) {
      if (location.href.includes("instagram.com/direct/t/")) return;
      if (e === SETTINGS.WAIT_FOR_REDIRECT_TO_CHAT_TIMEOUT - 1) throw new Error("Redirect to send the message was unsuccessful");
      await this.sleep(1e3)
    }
  }
  async back() {
    for (let e = 0; e < 10; e++)
      if (document.querySelector('a[href="/"]')?.click(), await this.sleep(1e3), "https://www.instagram.com/" === document.location.href || "https://www.instagram.com" === document.location.href) {
        this.log({
          type: "Successfully returned to index page",
          data: {}
        });
        break
      }
  }
  _input({
    element: r,
    i,
    text: n,
    noShift: o = !1
  }) {
    return new Promise(t => {
      const s = new CustomEvent("keypress", {
          bubbles: !0,
          cancelable: !0
        }),
        a = this._isClickable(n.charAt(i));
      var e = n.charCodeAt(i);
      s.cancelBubble = !1, s.returnValue = !0, s.key = n.charAt(i), s.keyCode = e, s.which = e, s.charCode = e, s.shiftKey = !o && 13 !== e, s.ctrlKey = !1, s.metaKey = !1, r.focus(), setTimeout(function() {
        var e;
        a && (e = new window.KeyboardEvent("keypress", s), r.dispatchEvent(e), e = new window.KeyboardEvent("keydown", s), r.dispatchEvent(e)), ["input", "click", "change", "blur"].forEach(function(e) {
          e = new Event(e, {
            bubbles: !0,
            cancelable: !0
          });
          r.dispatchEvent(e)
        }), a && (e = new window.KeyboardEvent("keyup", s), r.dispatchEvent(e)), t()
      }, 0), 13 !== e && (r.value = r.value + n.charAt(i))
    })
  }
  async _getLastTimestamp(e) {
    return ((await this.domConnector.send("getAllMessages", {}))[e]?.messages?.sort((e, t) => t.timestampMs - e.timestampMs)[0])?.timestampMs
  }
  async _getLastMessageId(e) {
    return ((await this.domConnector.send("getAllMessages", {}))[e]?.messages?.sort((e, t) => t.timestampMs - e.timestampMs)[0])?.messageId
  }
  async _sendDirectMessage({
    target: t,
    message: s,
    isOpenNewTab: a = !1
  }) {
    try {
      if (await this._openDirectIfNeeded(), await this.sleep(5e3), await this._checkIfOpenUserRequired({
          username: t.username
        })) {
        if (a) return {
          requiresNewTab: !0,
          threadId: (await this.domConnector.send("findUserInDialogWithoutClick", {
            username: t.username
          })).candidate.id
        };
        await this.domConnector.send("openUser", {
          username: t.username
        })
      }
      var r = (await this.domConnector.send("getAllMessages", {}))[t.username];
      if (!r) throw new Error("No thread info found");
      var i, n = {
        0: "REACHABLE",
        1: "UNREACHABLE_USER_TYPE",
        2: "UNREACHABLE_ADULT_TYPE",
        3: "REACHABLE_INVITE_BANNER",
        4: "UNREACHABLE_INVITE_BLOCK",
        5: "UNREACHABLE_INTEROP_THIRD_PARTY_USER",
        6: "UNREACHABLE_INTEROP_USER_OPT_OUT",
        7: "UNREACHABLE_INTEROP_THIRD_PARTY_APP_NOT_SUPPORTED",
        8: "UNREACHABLE_INTEROP_USER_REMOVED_THIRD_PARTY_APP",
        9: "UNREACHABLE_NULL_INTEROP_USER",
        10: "UNREACHABLE_MR_LIMIT_BLOCK",
        11: "UNREACHABLE_RS_UPSELL_ELIGIBLE"
      };
      if (!["0", "3"].includes(r?.contact_reachability_status_type)) throw new ExtensionError({
        message: "User is unreachable",
        type: "user_is_unreachable",
        unreachableType: n[r.contact_reachability_status_type]
      });
      let e = s.text;
      e.includes("{{") && (i = await this.domConnector.send("getUserFromContacts", {
        username: t.username
      }), e = s.text.replaceAll("{{username}}", t.username).replaceAll("{{name}}", i?.name ?? t.username).replaceAll("{{firstName}}", (l = i).name ? l.name.includes(" ") ? normalizeUnicodeText(parseFullName(l.name)?.first || l.secondaryName || "") : normalizeUnicodeText(l.name || "") : normalizeUnicodeText(l.secondaryName || ""))), await this.sleep(5e3), await this._sendMessage({
        text: e,
        username: t.username
      });
      var o = window.location.href.match(/direct\/t\/(\d+)/)?.[1],
        c = await this._getLastTimestamp(t.username),
        d = await this._getLastMessageId(t.username);
      return {
        success: !0,
        threadId: o,
        targetUserId: r.instagram_id,
        lastMessageTimestamp: c,
        lastMessageId: d
      }
    } catch (e) {
      throw console.log("[sendDirectMessage] Error:", e), e
    }
    var l
  }
}

function parseFullName(e, t, s, a, r) {
  "use strict";
  let n, o, c, d, i, l, h, u, g, m, p, k, y, f, w, _ = [],
    T = [null],
    I = [],
    E = ["&", "and", "et", "e", "of", "the", "und", "y"],
    C = {
      title: "",
      first: "",
      middle: "",
      last: "",
      nick: "",
      suffix: "",
      error: []
    };

  function b(e) {
    if (a) throw "Error: " + e;
    C.error.push("Error: " + e)
  }

  function A(e, t) {
    var s, a, r, i = ["e", "y", "av", "af", "da", "dal", "de", "del", "der", "di", "la", "le", "van", "der", "den", "vel", "von", "II", "III", "IV", "J.D.", "LL.M.", "M.D.", "D.O.", "D.C.", "Ph.D."];
    if (t)
      for (a = Object.keys(C).filter(function(e) {
          return "error" !== e
        }), n = 0, c = a.length; n < c; n++)
        if (e[a[n]]) {
          for (r = (e[a[n]] + "").split(" "), o = 0, d = r.length; o < d; o++) - 1 < (s = i.map(function(e) {
            return e.toLowerCase()
          }).indexOf(r[o].toLowerCase())) ? r[o] = i[s] : 1 === r[o].length ? r[o] = r[o].toUpperCase() : 2 < r[o].length && r[o].slice(0, 1) === r[o].slice(0, 1).toUpperCase() && r[o].slice(1, 2) === r[o].slice(1, 2).toLowerCase() && r[o].slice(2) === r[o].slice(2).toUpperCase() ? r[o] = r[o].slice(0, 3) + r[o].slice(3).toLowerCase() : "suffix" !== a[o] || "." === r[o].slice(-1) || g.indexOf(r[o].toLowerCase()) ? r[o] = r[o].slice(0, 1).toUpperCase() + r[o].slice(1).toLowerCase() : r[o] === r[o].toLowerCase() && (r[o] = r[o].toUpperCase());
          e[a[n]] = r.join(" ")
        } return e
  }
  if (t = t && -1 < ["title", "first", "middle", "last", "nick", "suffix", "error"].indexOf(t.toLowerCase()) ? t.toLowerCase() : "all", s = "undefined" === (s = !0 === (s = !1 === s ? 0 : s) ? 1 : s) || 0 !== s && 1 !== s ? -1 : s, a = (a = !0 === a ? 1 : a) && 1 === a ? 1 : 0, r = (r = !0 === r ? 1 : r) && 1 === r ? 1 : 0, e && "string" == typeof e) {
    if (e = e.trim(), -1 === s && (s = e === e.toUpperCase() || e === e.toLowerCase() ? 1 : 0), u = r ? (g = ["esq", "esquire", "jr", "jnr", "sr", "snr", "2", "ii", "iii", "iv", "v", "clu", "chfc", "cfp", "md", "phd", "j.d.", "ll.m.", "m.d.", "d.o.", "d.c.", "p.c.", "ph.d."], m = ["a", "ab", "antune", "ap", "abu", "al", "alm", "alt", "bab", "bäck", "bar", "bath", "bat", "beau", "beck", "ben", "berg", "bet", "bin", "bint", "birch", "björk", "björn", "bjur", "da", "dahl", "dal", "de", "degli", "dele", "del", "della", "der", "di", "dos", "du", "e", "ek", "el", "escob", "esch", "fleisch", "fitz", "fors", "gott", "griff", "haj", "haug", "holm", "ibn", "kauf", "kil", "koop", "kvarn", "la", "le", "lind", "lönn", "lund", "mac", "mhic", "mic", "mir", "na", "naka", "neder", "nic", "ni", "nin", "nord", "norr", "ny", "o", "ua", "ui'", "öfver", "ost", "över", "öz", "papa", "pour", "quarn", "skog", "skoog", "sten", "stor", "ström", "söder", "ter", "ter", "tre", "türk", "van", "väst", "väster", "vest", "von"], ["mr", "mrs", "ms", "miss", "dr", "herr", "monsieur", "hr", "frau", "a v m", "admiraal", "admiral", "air cdre", "air commodore", "air marshal", "air vice marshal", "alderman", "alhaji", "ambassador", "baron", "barones", "brig", "brig gen", "brig general", "brigadier", "brigadier general", "brother", "canon", "capt", "captain", "cardinal", "cdr", "chief", "cik", "cmdr", "coach", "col", "col dr", "colonel", "commandant", "commander", "commissioner", "commodore", "comte", "comtessa", "congressman", "conseiller", "consul", "conte", "contessa", "corporal", "councillor", "count", "countess", "crown prince", "crown princess", "dame", "datin", "dato", "datuk", "datuk seri", "deacon", "deaconess", "dean", "dhr", "dipl ing", "doctor", "dott", "dott sa", "dr", "dr ing", "dra", "drs", "embajador", "embajadora", "en", "encik", "eng", "eur ing", "exma sra", "exmo sr", "f o", "father", "first lieutient", "first officer", "flt lieut", "flying officer", "fr", "frau", "fraulein", "fru", "gen", "generaal", "general", "governor", "graaf", "gravin", "group captain", "grp capt", "h e dr", "h h", "h m", "h r h", "hajah", "haji", "hajim", "her highness", "her majesty", "herr", "high chief", "his highness", "his holiness", "his majesty", "hon", "hr", "hra", "ing", "ir", "jonkheer", "judge", "justice", "khun ying", "kolonel", "lady", "lcda", "lic", "lieut", "lieut cdr", "lieut col", "lieut gen", "lord", "m", "m l", "m r", "madame", "mademoiselle", "maj gen", "major", "master", "mevrouw", "miss", "mlle", "mme", "monsieur", "monsignor", "mr", "mrs", "ms", "mstr", "nti", "pastor", "president", "prince", "princess", "princesse", "prinses", "prof", "prof dr", "prof sir", "professor", "puan", "puan sri", "rabbi", "rear admiral", "rev", "rev canon", "rev dr", "rev mother", "reverend", "rva", "senator", "sergeant", "sheikh", "sheikha", "sig", "sig na", "sig ra", "sir", "sister", "sqn ldr", "sr", "sr d", "sra", "srta", "sultan", "tan sri", "tan sri dato", "tengku", "teuku", "than puying", "the hon dr", "the hon justice", "the hon miss", "the hon mr", "the hon mrs", "the hon ms", "the hon sir", "the very rev", "toh puan", "tun", "vice admiral", "viscount", "viscountess", "wg cdr", "ind", "misc", "mx"]) : (g = ["esq", "esquire", "jr", "jnr", "sr", "snr", "2", "ii", "iii", "iv", "md", "phd", "j.d.", "ll.m.", "m.d.", "d.o.", "d.c.", "p.c.", "ph.d."], m = ["ab", "bar", "bin", "da", "dal", "de", "de la", "del", "della", "der", "di", "du", "ibn", "l'", "la", "le", "san", "st", "st.", "ste", "ter", "van", "van de", "van der", "van den", "vel", "ver", "vere", "von"], ["dr", "miss", "mr", "mrs", "ms", "prof", "sir", "frau", "herr", "hr", "monsieur", "captain", "doctor", "judge", "officer", "professor", "ind", "misc", "mx"]), (k = (" " + e + " ").match(/\s(?:[['']([^'']+)['']|[""]([^""]+)[""]|\[([^\]]+)\]|\(([^\)]+)\)),?\s/g)) && (I = I.concat(k)), 1 === (y = I.length)) C.nick = I[0].slice(2).slice(0, -2), "," === C.nick.slice(-1) && (C.nick = C.nick.slice(0, -1)), e = (" " + e + " ").replace(I[0], " ").trim(), I = [];
    else if (1 < y) {
      for (b(y + " nicknames found"), n = 0; n < y; n++) e = (" " + e + " ").replace(I[n], " ").trim(), I[n] = I[n].slice(2).slice(0, -2), "," === I[n].slice(-1) && (I[n] = I[n].slice(0, -1));
      C.nick = I.join(", "), I = []
    }
    if (e.trim().length) {
      for (n = 0, i = e.split(" "), c = i.length; n < c; n++) l = i[n], h = null, "," === l.slice(-1) && (h = ",", l = l.slice(0, -1)), _.push(l), T.push(h);
      for (c = _.length, n = c - 1; 0 < n; n--) p = ("." === _[n].slice(-1) ? _[n].slice(0, -1) : _[n]).toLowerCase(), (-1 < g.indexOf(p) || -1 < g.indexOf(p + ".")) && (I = _.splice(n, 1).concat(I), "," === T[n] ? T.splice(n + 1, 1) : T.splice(n, 1));
      if (1 === (y = I.length) ? (C.suffix = I[0], I = []) : 1 < y && (b(y + " suffixes found"), C.suffix = I.join(", "), I = []), _.length) {
        for (c = _.length, n = c - 1; 0 <= n; n--) p = ("." === _[n].slice(-1) ? _[n].slice(0, -1) : _[n]).toLowerCase(), (-1 < u.indexOf(p) || -1 < u.indexOf(p + ".")) && (I = _.splice(n, 1).concat(I), "," === T[n] ? T.splice(n + 1, 1) : T.splice(n, 1));
        if (1 === (y = I.length) ? (C.title = I[0], I = []) : 1 < y && (b(y + " titles found"), C.title = I.join(", "), I = []), _.length) {
          if (1 < _.length)
            for (n = _.length - 2; 0 <= n; n--) - 1 < m.indexOf(_[n].toLowerCase()) && (_[n] = _[n] + " " + _[n + 1], _.splice(n + 1, 1), T.splice(n + 1, 1));
          if (2 < _.length)
            for (n = _.length - 3; 0 <= n; n--) - 1 < E.indexOf(_[n + 1].toLowerCase()) && (_[n] = _[n] + " " + _[n + 1] + " " + _[n + 2], _.splice(n + 1, 2), T.splice(n + 1, 2), n--);
          if (T.pop(), f = T.indexOf(","), w = T.filter(function(e) {
              return null !== e
            }).length, 1 < f || 1 < w)
            for (n = _.length - 1; 2 <= n && "," === T[n]; n--) I = _.splice(n, 1).concat(I), T.splice(n, 1), w--;
          I.length && (C.suffix && (I = [C.suffix].concat(I)), C.suffix = I.join(", "), I = []), 0 < w ? (1 < w && b(w - 1 + " extra commas found"), T.indexOf(",") && (C.last = _.splice(0, T.indexOf(",")).join(" "), T.splice(0, T.indexOf(",")))) : C.last = _.pop(), C = (_.length && (C.first = _.shift(), _.length) && (2 < _.length && b(_.length + " middle names"), C.middle = _.join(" ")), A(C, s))
        } else C = A(C, s)
      } else C = A(C, s)
    } else C = A(C, s)
  } else b("No input"), C = A(C, s);
  return "all" === t ? C : C[t]
}

function normalizeUnicodeText(e) {
  var t = Object.entries({
    L: /ł/gim,
    O: /ø/gim,
    AE: /æ/gim,
    SS: /ß/gim
  });
  e = e.normalize("NFKD");
  for (const s of [
      [/[\u0300-\u036F]/g, ""],
      [/[\u180E\u200B-\u200D\u2060\uFEFF]/g, ""],
      [/[\u2420\u2422\u2423]/g, " "],
      [/[ \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " "],
      [/\s+/g, " "]
    ]) e = e.replace(...s);
  for (const [a, r] of t) e = e.replace(r, e => e === e.toUpperCase() ? a : a.toLowerCase());
  return e
}(async () => {
  await (new Instagram).init()
})();
class ExtensionError extends Error {
  constructor({
    message: e,
    type: t
  }) {
    super(e), this.message = e, this.type = t
  }
}
