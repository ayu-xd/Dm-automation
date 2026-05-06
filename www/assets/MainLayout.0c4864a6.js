import {
  c as x,
  a as f,
  h,
  r as w,
  i as J,
  o as E,
  b as k,
  n as Z,
  d as A,
  g as P,
  l as M,
  e as T,
  w as S,
  f as ee,
  j as W,
  p as te,
  k as ne,
  m as H,
  q as ie,
  _ as le,
  s as ae,
  t as B,
  u as U,
  v as C,
  x as q,
  y as re,
  z as se,
  A as K,
  B as ue,
  C as ce,
  D as de,
  E as fe
} from "./index.4c1e2858.js";
import {
  h as D,
  a as ve,
  c as X,
  g as he,
  b as me,
  Q as ge
} from "./QBtn.58e963d5.js";
import {
  A as pe,
  u as be
} from "./api.5de82224.js";
import {
  S as F
} from "./Storage.c45a3297.js";
var ye = x({
    name: "QToolbarTitle",
    props: {
      shrink: Boolean
    },
    setup(e, {
      slots: u
    }) {
      const o = f(() => "q-toolbar__title ellipsis" + (e.shrink === !0 ? " col-shrink" : ""));
      return () => h("div", {
        class: o.value
      }, D(u.default))
    }
  }),
  we = x({
    name: "QToolbar",
    props: {
      inset: Boolean
    },
    setup(e, {
      slots: u
    }) {
      const o = f(() => "q-toolbar row no-wrap items-center" + (e.inset === !0 ? " q-toolbar--inset" : ""));
      return () => h("div", {
        class: o.value,
        role: "toolbar"
      }, D(u.default))
    }
  });

function ze() {
  const e = w(!J.value);
  return e.value === !1 && E(() => {
    e.value = !0
  }), {
    isHydrated: e
  }
}
const oe = typeof ResizeObserver != "undefined",
  Y = oe === !0 ? {} : {
    style: "display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",
    url: "about:blank"
  };
var N = x({
    name: "QResizeObserver",
    props: {
      debounce: {
        type: [String, Number],
        default: 100
      }
    },
    emits: ["resize"],
    setup(e, {
      emit: u
    }) {
      let o = null,
        t, i = {
          width: -1,
          height: -1
        };

      function r(s) {
        s === !0 || e.debounce === 0 || e.debounce === "0" ? c() : o === null && (o = setTimeout(c, e.debounce))
      }

      function c() {
        if (o !== null && (clearTimeout(o), o = null), t) {
          const {
            offsetWidth: s,
            offsetHeight: l
          } = t;
          (s !== i.width || l !== i.height) && (i = {
            width: s,
            height: l
          }, u("resize", i))
        }
      }
      const {
        proxy: m
      } = P();
      if (m.trigger = r, oe === !0) {
        let s;
        const l = g => {
          t = m.$el.parentNode, t ? (s = new ResizeObserver(r), s.observe(t), c()) : g !== !0 && A(() => {
            l(!0)
          })
        };
        return E(() => {
          l()
        }), k(() => {
          o !== null && clearTimeout(o), s !== void 0 && (s.disconnect !== void 0 ? s.disconnect() : t && s.unobserve(t))
        }), Z
      } else {
        let g = function() {
            o !== null && (clearTimeout(o), o = null), l !== void 0 && (l.removeEventListener !== void 0 && l.removeEventListener("resize", r, M.passive), l = void 0)
          },
          p = function() {
            g(), t && t.contentDocument && (l = t.contentDocument.defaultView, l.addEventListener("resize", r, M.passive), c())
          };
        const {
          isHydrated: s
        } = ze();
        let l;
        return E(() => {
          A(() => {
            t = m.$el, t && p()
          })
        }), k(g), () => {
          if (s.value === !0) return h("object", {
            class: "q--avoid-card-border",
            style: Y.style,
            tabindex: -1,
            type: "text/html",
            data: Y.url,
            "aria-hidden": "true",
            onLoad: p
          })
        }
      }
    }
  }),
  Se = x({
    name: "QHeader",
    props: {
      modelValue: {
        type: Boolean,
        default: !0
      },
      reveal: Boolean,
      revealOffset: {
        type: Number,
        default: 250
      },
      bordered: Boolean,
      elevated: Boolean,
      heightHint: {
        type: [String, Number],
        default: 50
      }
    },
    emits: ["reveal", "focusin"],
    setup(e, {
      slots: u,
      emit: o
    }) {
      const {
        proxy: {
          $q: t
        }
      } = P(), i = ee(W, T);
      if (i === T) return console.error("QHeader needs to be child of QLayout"), T;
      const r = w(parseInt(e.heightHint, 10)),
        c = w(!0),
        m = f(() => e.reveal === !0 || i.view.value.indexOf("H") !== -1 || t.platform.is.ios && i.isContainer.value === !0),
        s = f(() => {
          if (e.modelValue !== !0) return 0;
          if (m.value === !0) return c.value === !0 ? r.value : 0;
          const n = r.value - i.scroll.value.position;
          return n > 0 ? n : 0
        }),
        l = f(() => e.modelValue !== !0 || m.value === !0 && c.value !== !0),
        g = f(() => e.modelValue === !0 && l.value === !0 && e.reveal === !0),
        p = f(() => "q-header q-layout__section--marginal " + (m.value === !0 ? "fixed" : "absolute") + "-top" + (e.bordered === !0 ? " q-header--bordered" : "") + (l.value === !0 ? " q-header--hidden" : "") + (e.modelValue !== !0 ? " q-layout--prevent-focus" : "")),
        z = f(() => {
          const n = i.rows.value.top,
            b = {};
          return n[0] === "l" && i.left.space === !0 && (b[t.lang.rtl === !0 ? "right" : "left"] = `${i.left.size}px`), n[2] === "r" && i.right.space === !0 && (b[t.lang.rtl === !0 ? "left" : "right"] = `${i.right.size}px`), b
        });

      function d(n, b) {
        i.update("header", n, b)
      }

      function y(n, b) {
        n.value !== b && (n.value = b)
      }

      function O({
        height: n
      }) {
        y(r, n), d("size", n)
      }

      function R(n) {
        g.value === !0 && y(c, !0), o("focusin", n)
      }
      S(() => e.modelValue, n => {
        d("space", n), y(c, !0), i.animate()
      }), S(s, n => {
        d("offset", n)
      }), S(() => e.reveal, n => {
        n === !1 && y(c, e.modelValue)
      }), S(c, n => {
        i.animate(), o("reveal", n)
      }), S(i.scroll, n => {
        e.reveal === !0 && y(c, n.direction === "up" || n.position <= e.revealOffset || n.position - n.inflectionPoint < 100)
      });
      const L = {};
      return i.instances.header = L, e.modelValue === !0 && d("size", r.value), d("space", e.modelValue), d("offset", s.value), k(() => {
        i.instances.header === L && (i.instances.header = void 0, d("size", 0), d("offset", 0), d("space", !1))
      }), () => {
        const n = ve(u.default, []);
        return e.elevated === !0 && n.push(h("div", {
          class: "q-layout__shadow absolute-full overflow-hidden no-pointer-events"
        })), n.push(h(N, {
          debounce: 0,
          onResize: O
        })), h("header", {
          class: p.value,
          style: z.value,
          onFocusin: R
        }, n)
      }
    }
  }),
  _e = x({
    name: "QPageContainer",
    setup(e, {
      slots: u
    }) {
      const {
        proxy: {
          $q: o
        }
      } = P(), t = ee(W, T);
      if (t === T) return console.error("QPageContainer needs to be child of QLayout"), T;
      te(ne, !0);
      const i = f(() => {
        const r = {};
        return t.header.space === !0 && (r.paddingTop = `${t.header.size}px`), t.right.space === !0 && (r[`padding${o.lang.rtl===!0?"Left":"Right"}`] = `${t.right.size}px`), t.footer.space === !0 && (r.paddingBottom = `${t.footer.size}px`), t.left.space === !0 && (r[`padding${o.lang.rtl===!0?"Right":"Left"}`] = `${t.left.size}px`), r
      });
      return () => h("div", {
        class: "q-page-container",
        style: i.value
      }, D(u.default))
    }
  });
const xe = [Element, String],
  Te = [null, document, document.body, document.scrollingElement, document.documentElement];

function Le(e, u) {
  let o = he(u);
  if (o === void 0) {
    if (e == null) return window;
    o = e.closest(".scroll,.scroll-y,.overflow-auto")
  }
  return Te.includes(o) ? window : o
}

function $e(e) {
  return e === window ? window.pageYOffset || window.scrollY || document.body.scrollTop || 0 : e.scrollTop
}

function Ce(e) {
  return e === window ? window.pageXOffset || window.scrollX || document.body.scrollLeft || 0 : e.scrollLeft
}
let Q;

function I() {
  if (Q !== void 0) return Q;
  const e = document.createElement("p"),
    u = document.createElement("div");
  X(e, {
    width: "100%",
    height: "200px"
  }), X(u, {
    position: "absolute",
    top: "0px",
    left: "0px",
    visibility: "hidden",
    width: "200px",
    height: "150px",
    overflow: "hidden"
  }), u.appendChild(e), document.body.appendChild(u);
  const o = e.offsetWidth;
  u.style.overflow = "scroll";
  let t = e.offsetWidth;
  return o === t && (t = u.clientWidth), u.remove(), Q = o - t, Q
}
const {
  passive: G
} = M, qe = ["both", "horizontal", "vertical"];
var Pe = x({
    name: "QScrollObserver",
    props: {
      axis: {
        type: String,
        validator: e => qe.includes(e),
        default: "vertical"
      },
      debounce: [String, Number],
      scrollTarget: xe
    },
    emits: ["scroll"],
    setup(e, {
      emit: u
    }) {
      const o = {
        position: {
          top: 0,
          left: 0
        },
        direction: "down",
        directionChanged: !1,
        delta: {
          top: 0,
          left: 0
        },
        inflectionPoint: {
          top: 0,
          left: 0
        }
      };
      let t = null,
        i, r;
      S(() => e.scrollTarget, () => {
        s(), m()
      });

      function c() {
        t !== null && t();
        const p = Math.max(0, $e(i)),
          z = Ce(i),
          d = {
            top: p - o.position.top,
            left: z - o.position.left
          };
        if (e.axis === "vertical" && d.top === 0 || e.axis === "horizontal" && d.left === 0) return;
        const y = Math.abs(d.top) >= Math.abs(d.left) ? d.top < 0 ? "up" : "down" : d.left < 0 ? "left" : "right";
        o.position = {
          top: p,
          left: z
        }, o.directionChanged = o.direction !== y, o.delta = d, o.directionChanged === !0 && (o.direction = y, o.inflectionPoint = o.position), u("scroll", {
          ...o
        })
      }

      function m() {
        i = Le(r, e.scrollTarget), i.addEventListener("scroll", l, G), l(!0)
      }

      function s() {
        i !== void 0 && (i.removeEventListener("scroll", l, G), i = void 0)
      }

      function l(p) {
        if (p === !0 || e.debounce === 0 || e.debounce === "0") c();
        else if (t === null) {
          const [z, d] = e.debounce ? [setTimeout(c, e.debounce), clearTimeout] : [requestAnimationFrame(c), cancelAnimationFrame];
          t = () => {
            d(z), t = null
          }
        }
      }
      const {
        proxy: g
      } = P();
      return S(() => g.$q.lang.rtl, c), E(() => {
        r = g.$el.parentNode, m()
      }), k(() => {
        t !== null && t(), s()
      }), Object.assign(g, {
        trigger: l,
        getPosition: () => o
      }), Z
    }
  }),
  He = x({
    name: "QLayout",
    props: {
      container: Boolean,
      view: {
        type: String,
        default: "hhh lpr fff",
        validator: e => /^(h|l)h(h|r) lpr (f|l)f(f|r)$/.test(e.toLowerCase())
      },
      onScroll: Function,
      onScrollHeight: Function,
      onResize: Function
    },
    setup(e, {
      slots: u,
      emit: o
    }) {
      const {
        proxy: {
          $q: t
        }
      } = P(), i = w(null), r = w(t.screen.height), c = w(e.container === !0 ? 0 : t.screen.width), m = w({
        position: 0,
        direction: "down",
        inflectionPoint: 0
      }), s = w(0), l = w(J.value === !0 ? 0 : I()), g = f(() => "q-layout q-layout--" + (e.container === !0 ? "containerized" : "standard")), p = f(() => e.container === !1 ? {
        minHeight: t.screen.height + "px"
      } : null), z = f(() => l.value !== 0 ? {
        [t.lang.rtl === !0 ? "left" : "right"]: `${l.value}px`
      } : null), d = f(() => l.value !== 0 ? {
        [t.lang.rtl === !0 ? "right" : "left"]: 0,
        [t.lang.rtl === !0 ? "left" : "right"]: `-${l.value}px`,
        width: `calc(100% + ${l.value}px)`
      } : null);

      function y(a) {
        if (e.container === !0 || document.qScrollPrevented !== !0) {
          const v = {
            position: a.position.top,
            direction: a.direction,
            directionChanged: a.directionChanged,
            inflectionPoint: a.inflectionPoint.top,
            delta: a.delta.top
          };
          m.value = v, e.onScroll !== void 0 && o("scroll", v)
        }
      }

      function O(a) {
        const {
          height: v,
          width: _
        } = a;
        let $ = !1;
        r.value !== v && ($ = !0, r.value = v, e.onScrollHeight !== void 0 && o("scrollHeight", v), L()), c.value !== _ && ($ = !0, c.value = _), $ === !0 && e.onResize !== void 0 && o("resize", a)
      }

      function R({
        height: a
      }) {
        s.value !== a && (s.value = a, L())
      }

      function L() {
        if (e.container === !0) {
          const a = r.value > s.value ? I() : 0;
          l.value !== a && (l.value = a)
        }
      }
      let n = null;
      const b = {
        instances: {},
        view: f(() => e.view),
        isContainer: f(() => e.container),
        rootRef: i,
        height: r,
        containerHeight: s,
        scrollbarWidth: l,
        totalWidth: f(() => c.value + l.value),
        rows: f(() => {
          const a = e.view.toLowerCase().split(" ");
          return {
            top: a[0].split(""),
            middle: a[1].split(""),
            bottom: a[2].split("")
          }
        }),
        header: H({
          size: 0,
          offset: 0,
          space: !1
        }),
        right: H({
          size: 300,
          offset: 0,
          space: !1
        }),
        footer: H({
          size: 0,
          offset: 0,
          space: !1
        }),
        left: H({
          size: 300,
          offset: 0,
          space: !1
        }),
        scroll: m,
        animate() {
          n !== null ? clearTimeout(n) : document.body.classList.add("q-body--layout-animate"), n = setTimeout(() => {
            n = null, document.body.classList.remove("q-body--layout-animate")
          }, 155)
        },
        update(a, v, _) {
          b[a][v] = _
        }
      };
      if (te(W, b), I() > 0) {
        let _ = function() {
            a = null, v.classList.remove("hide-scrollbar")
          },
          $ = function() {
            if (a === null) {
              if (v.scrollHeight > t.screen.height) return;
              v.classList.add("hide-scrollbar")
            } else clearTimeout(a);
            a = setTimeout(_, 300)
          },
          V = function(j) {
            a !== null && j === "remove" && (clearTimeout(a), _()), window[`${j}EventListener`]("resize", $)
          },
          a = null;
        const v = document.body;
        S(() => e.container !== !0 ? "add" : "remove", V), e.container !== !0 && V("add"), ie(() => {
          V("remove")
        })
      }
      return () => {
        const a = me(u.default, [h(Pe, {
            onScroll: y
          }), h(N, {
            onResize: O
          })]),
          v = h("div", {
            class: g.value,
            style: p.value,
            ref: e.container === !0 ? void 0 : i,
            tabindex: -1
          }, a);
        return e.container === !0 ? h("div", {
          class: "q-layout-container overflow-hidden",
          ref: i
        }, [h(N, {
          onResize: R
        }), h("div", {
          class: "absolute-full",
          style: z.value
        }, [h("div", {
          class: "scroll",
          style: d.value
        }, [v])])]) : v
      }
    }
  });
const Qe = ae({
    name: "MainLayout",
    methods: {
      async logout() {
        this.loading = !0;
        try {
          await pe.init().logout(), this.store.setLoggedIn(!1), this.$router.push("/auth")
        } finally {
          this.loading = !1
        }
      },
      async updateTimestamp() {
        await F.set("timestamp", Date.now())
      }
    },
    data() {
      return {
        loading: !1,
        isProd: !0
      }
    },
    async mounted() {
      await F.load(), this.store.enabled = await F.get("enabled")
    },
    setup() {
      return {
        store: be()
      }
    }
  }),
  Ee = e => (ce("data-v-2909497c"), e = e(), de(), e),
  ke = Ee(() => fe("a", {
    href: "https://app.colddms.com",
    class: "link",
    target: "_blank"
  }, "ColdDMs", -1)),
  Oe = {
    key: 0
  };

function Re(e, u, o, t, i, r) {
  const c = ue("router-view");
  return B(), U(He, {
    view: "lHh Lpr lFf"
  }, {
    default: C(() => [q(Se, {
      class: "bg-dark-black text-white",
      elevated: ""
    }, {
      default: C(() => [q(we, null, {
        default: C(() => [q(ye, null, {
          default: C(() => [ke]),
          _: 1
        }), e.store.loggedIn ? (B(), re("div", Oe, se(e.store.email), 1)) : K("", !0), e.isProd ? K("", !0) : (B(), U(ge, {
          key: 1,
          label: ">",
          onClick: e.updateTimestamp
        }, null, 8, ["onClick"]))]),
        _: 1
      })]),
      _: 1
    }), q(_e, null, {
      default: C(() => [q(c)]),
      _: 1
    })]),
    _: 1
  })
}
var Me = le(Qe, [
  ["render", Re],
  ["__scopeId", "data-v-2909497c"]
]);
export {
  Me as
  default
};
