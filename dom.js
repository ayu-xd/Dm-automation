(() => {
  var a = Object.create,
    u = Object.defineProperty,
    f = Object.getOwnPropertyDescriptor,
    l = Object.getOwnPropertyNames,
    p = Object.getPrototypeOf,
    c = Object.prototype.hasOwnProperty;
  e = (e, t) => {
    "use strict";
    var n = "object" == typeof Reflect ? Reflect : null,
      u = n && "function" == typeof n.apply ? n.apply : function(e, t, n) {
        return Function.prototype.apply.call(e, t, n)
      };
    var r = n && "function" == typeof n.ownKeys ? n.ownKeys : Object.getOwnPropertySymbols ? function(e) {
        return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
      } : function(e) {
        return Object.getOwnPropertyNames(e)
      },
      i = Number.isNaN || function(e) {
        return e != e
      };

    function o() {
      o.init.call(this)
    }
    t.exports = o, t.exports.once = function(a, u) {
      return new Promise(function(e, t) {
        function n(e) {
          a.removeListener(u, r), t(e)
        }

        function r() {
          "function" == typeof a.removeListener && a.removeListener("error", n), e([].slice.call(arguments))
        }
        var i, o, s;
        d(a, u, r, {
          once: !0
        }), "error" !== u && (o = n, s = {
          once: !0
        }, "function" == typeof(i = a).on) && d(i, "error", o, s)
      })
    }, (o.EventEmitter = o).prototype._events = void 0, o.prototype._eventsCount = 0, o.prototype._maxListeners = void 0;
    var s = 10;

    function f(e) {
      if ("function" != typeof e) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e)
    }

    function a(e) {
      return void 0 === e._maxListeners ? o.defaultMaxListeners : e._maxListeners
    }

    function l(e, t, n, r) {
      var i, o;
      return f(n), void 0 === (i = e._events) ? (i = e._events = Object.create(null), e._eventsCount = 0) : (void 0 !== i.newListener && (e.emit("newListener", t, n.listener || n), i = e._events), o = i[t]), void 0 === o ? (o = i[t] = n, ++e._eventsCount) : ("function" == typeof o ? o = i[t] = r ? [n, o] : [o, n] : r ? o.unshift(n) : o.push(n), 0 < (i = a(e)) && o.length > i && !o.warned && (o.warned = !0, (r = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(t) + " listeners added. Use emitter.setMaxListeners() to increase limit")).name = "MaxListenersExceededWarning", r.emitter = e, r.type = t, r.count = o.length, n = r, console) && console.warn && console.warn(n)), e
    }

    function p(e, t, n) {
      e = {
        fired: !1,
        wrapFn: void 0,
        target: e,
        type: t,
        listener: n
      }, t = function() {
        if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
      }.bind(e);
      return t.listener = n, e.wrapFn = t
    }

    function c(e, t, n) {
      e = e._events;
      if (void 0 === e) return [];
      e = e[t];
      {
        if (void 0 === e) return [];
        if ("function" == typeof e) return n ? [e.listener || e] : [e];
        if (n) {
          for (var r = e, i = new Array(r.length), o = 0; o < i.length; ++o) i[o] = r[o].listener || r[o];
          return i
        }
        return v(e, e.length)
      }
    }

    function h(e) {
      var t = this._events;
      if (void 0 !== t) {
        t = t[e];
        if ("function" == typeof t) return 1;
        if (void 0 !== t) return t.length
      }
      return 0
    }

    function v(e, t) {
      for (var n = new Array(t), r = 0; r < t; ++r) n[r] = e[r];
      return n
    }

    function d(n, r, i, o) {
      if ("function" == typeof n.on) o.once ? n.once(r, i) : n.on(r, i);
      else {
        if ("function" != typeof n.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof n);
        n.addEventListener(r, function e(t) {
          o.once && n.removeEventListener(r, e), i(t)
        })
      }
    }
    Object.defineProperty(o, "defaultMaxListeners", {
      enumerable: !0,
      get: function() {
        return s
      },
      set: function(e) {
        if ("number" != typeof e || e < 0 || i(e)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e + ".");
        s = e
      }
    }), o.init = function() {
      void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events || (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
    }, o.prototype.setMaxListeners = function(e) {
      if ("number" != typeof e || e < 0 || i(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
      return this._maxListeners = e, this
    }, o.prototype.getMaxListeners = function() {
      return a(this)
    }, o.prototype.emit = function(e) {
      for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
      var r = "error" === e,
        i = this._events;
      if (void 0 !== i) r = r && void 0 === i.error;
      else if (!r) return !1;
      if (r) {
        if ((o = 0 < t.length ? t[0] : o) instanceof Error) throw o;
        r = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
        throw r.context = o, r
      }
      var o = i[e];
      if (void 0 === o) return !1;
      if ("function" == typeof o) u(o, this, t);
      else
        for (var s = o.length, a = v(o, s), n = 0; n < s; ++n) u(a[n], this, t);
      return !0
    }, o.prototype.on = o.prototype.addListener = function(e, t) {
      return l(this, e, t, !1)
    }, o.prototype.prependListener = function(e, t) {
      return l(this, e, t, !0)
    }, o.prototype.once = function(e, t) {
      return f(t), this.on(e, p(this, e, t)), this
    }, o.prototype.prependOnceListener = function(e, t) {
      return f(t), this.prependListener(e, p(this, e, t)), this
    }, o.prototype.off = o.prototype.removeListener = function(e, t) {
      var n, r, i, o, s;
      if (f(t), void 0 !== (r = this._events) && void 0 !== (n = r[e]))
        if (n === t || n.listener === t) 0 == --this._eventsCount ? this._events = Object.create(null) : (delete r[e], r.removeListener && this.emit("removeListener", e, n.listener || t));
        else if ("function" != typeof n) {
        for (i = -1, o = n.length - 1; 0 <= o; o--)
          if (n[o] === t || n[o].listener === t) {
            s = n[o].listener, i = o;
            break
          } if (i < 0) return this;
        if (0 === i) n.shift();
        else {
          var a = n;
          var u = i;
          for (; u + 1 < a.length; u++) a[u] = a[u + 1];
          a.pop()
        }
        1 === n.length && (r[e] = n[0]), void 0 !== r.removeListener && this.emit("removeListener", e, s || t)
      }
      return this
    }, o.prototype.removeAllListeners = function(e) {
      var t, n = this._events;
      if (void 0 !== n)
        if (void 0 === n.removeListener) 0 === arguments.length ? (this._events = Object.create(null), this._eventsCount = 0) : void 0 !== n[e] && (0 == --this._eventsCount ? this._events = Object.create(null) : delete n[e]);
        else if (0 === arguments.length) {
        for (var r, i = Object.keys(n), o = 0; o < i.length; ++o) "removeListener" !== (r = i[o]) && this.removeAllListeners(r);
        this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0
      } else if ("function" == typeof(t = n[e])) this.removeListener(e, t);
      else if (void 0 !== t)
        for (o = t.length - 1; 0 <= o; o--) this.removeListener(e, t[o]);
      return this
    }, o.prototype.listeners = function(e) {
      return c(this, e, !0)
    }, o.prototype.rawListeners = function(e) {
      return c(this, e, !1)
    }, o.listenerCount = function(e, t) {
      return "function" == typeof e.listenerCount ? e.listenerCount(t) : h.call(e, t)
    }, o.prototype.listenerCount = h, o.prototype.eventNames = function() {
      return 0 < this._eventsCount ? r(this._events) : []
    }
  };
  var e, t, n, r = ((e, t, n) => {
      n = null != e ? a(p(e)) : {};
      var r = !t && e && e.__esModule ? n : u(n, "default", {
          value: e,
          enumerable: !0
        }),
        i = e,
        o = void 0,
        s = void 0;
      if (i && "object" == typeof i || "function" == typeof i)
        for (let e of l(i)) c.call(r, e) || e === o || u(r, e, {
          get: () => i[e],
          enumerable: !(s = f(i, e)) || s.enumerable
        });
      return r
    })((() => (t || e((t = {
      exports: {}
    }).exports, t), t.exports))()),
    i = 0,
    o = new Array(256);
  for (let e = 0; e < 256; e++) o[e] = (e + 256).toString(16).substring(1);
  var s = (() => {
    let t = "undefined" != typeof crypto ? crypto : "undefined" != typeof window ? window.crypto || window.msCrypto : void 0;
    if (void 0 !== t) {
      if (void 0 !== t.randomBytes) return t.randomBytes;
      if (void 0 !== t.getRandomValues) return e => {
        e = new Uint8Array(e);
        return t.getRandomValues(e), e
      }
    }
    return t => {
      var n = [];
      for (let e = t; 0 < e; e--) n.push(Math.floor(256 * Math.random()));
      return n
    }
  })();

  function h() {
    (void 0 === n || 4096 < i + 16) && (i = 0, n = s(4096));
    var e = Array.prototype.slice.call(n, i, i += 16);
    return e[6] = 15 & e[6] | 64, e[8] = 63 & e[8] | 128, o[e[0]] + o[e[1]] + o[e[2]] + o[e[3]] + "-" + o[e[4]] + o[e[5]] + "-" + o[e[6]] + o[e[7]] + "-" + o[e[8]] + o[e[9]] + "-" + o[e[10]] + o[e[11]] + o[e[12]] + o[e[13]] + o[e[14]] + o[e[15]]
  }
  var v, d, y = {
      undefined: () => 0,
      boolean: () => 4,
      number: () => 8,
      string: e => 2 * e.length,
      object: n => n ? Object.keys(n).reduce((e, t) => m(t) + m(n[t]) + e, 0) : 0
    },
    m = e => y[typeof e](e),
    r = new class extends r.EventEmitter {
      constructor(e) {
        super(), this.setMaxListeners(1 / 0), (this.wall = e).listen(e => {
          Array.isArray(e) ? e.forEach(e => this._emit(e)) : this._emit(e)
        }), this._sendingQueue = [], this._sending = !1, this._maxMessageSize = 33554432
      }
      send(e, t) {
        return this._send([{
          event: e,
          payload: t
        }])
      }
      getEvents() {
        return this._events
      }
      on(e, n) {
        return super.on(e, t => {
          n({
            ...t,
            respond: e => this.send(t.eventResponseKey, e)
          })
        })
      }
      _emit(e) {
        "string" == typeof e ? this.emit(e) : this.emit(e.event, e.payload)
      }
      _send(e) {
        return this._sendingQueue.push(e), this._nextSend()
      }
      _nextSend() {
        if (!this._sendingQueue.length || this._sending) return Promise.resolve();
        this._sending = !0;
        let f = this._sendingQueue.shift(),
          l = f[0],
          e = l.event + "." + h(),
          p = e + ".result";
        return new Promise((n, e) => {
          let r = [],
            i = e => {
              var t;
              void 0 !== e && e._chunkSplit ? (t = e._chunkSplit, r = [...r, ...e.data], t.lastChunk && (this.off(p, i), n(r))) : (this.off(p, i), n(e))
            };
          this.on(p, i);
          try {
            var t = f.map(e => ({
              ...e,
              payload: {
                data: e.payload,
                eventResponseKey: p
              }
            }));
            this.wall.send(t)
          } catch (e) {
            if ("Message length exceeded maximum allowed length." === e.message && Array.isArray(l.payload)) {
              t = m(l);
              if (t > this._maxMessageSize) {
                var o = Math.ceil(t / this._maxMessageSize),
                  s = Math.ceil(l.payload.length / o),
                  a = l.payload;
                for (let e = 0; e < o; e++) {
                  var u = Math.min(a.length, s);
                  this.wall.send([{
                    event: l.event,
                    payload: {
                      _chunkSplit: {
                        count: o,
                        lastChunk: e === o - 1
                      },
                      data: a.splice(0, u)
                    }
                  }])
                }
              }
            }
          }
          this._sending = !1, setTimeout(() => this._nextSend(), 16)
        })
      }
    }({
      listen(e) {},
      send(e) {
        e = {
          ...e,
          from: "bex-dom"
        };
        window.postMessage(e, "*")
      }
    });
  v = r, d = "bex-content-script", window.addEventListener("message", e => {
    if (e.source === window && void 0 !== e.data.from && e.data.from === d) {
      var t, n = e.data[0],
        r = v.getEvents();
      for (t in r) t === n.event && r[t](n.payload)
    }
  }, !1)
})();
