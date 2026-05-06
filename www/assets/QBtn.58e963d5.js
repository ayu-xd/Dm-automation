import {
  a as s,
  c as F,
  h as v,
  g as V,
  F as ce,
  G as de,
  H as D,
  I as fe,
  J as ve,
  K as ae,
  L as ge,
  r as H,
  b as me,
  M as be,
  N as P,
  T as he,
  l as ye,
  O as ke
} from "./index.4c1e2858.js";

function pe(e, t) {
  return e !== void 0 && e() || t
}

function Ye(e, t) {
  if (e !== void 0) {
    const a = e();
    if (a != null) return a.slice()
  }
  return t
}

function z(e, t) {
  return e !== void 0 ? t.concat(e()) : t
}
const Q = {
    xs: 18,
    sm: 24,
    md: 32,
    lg: 38,
    xl: 46
  },
  re = {
    size: String
  };

function ue(e, t = Q) {
  return s(() => e.size !== void 0 ? {
    fontSize: e.size in t ? `${t[e.size]}px` : e.size
  } : null)
}
const U = "0 0 24 24",
  W = e => e,
  N = e => `ionicons ${e}`,
  ie = {
    "mdi-": e => `mdi ${e}`,
    "icon-": W,
    "bt-": e => `bt ${e}`,
    "eva-": e => `eva ${e}`,
    "ion-md": N,
    "ion-ios": N,
    "ion-logo": N,
    "iconfont ": W,
    "ti-": e => `themify-icon ${e}`,
    "bi-": e => `bootstrap-icons ${e}`
  },
  le = {
    o_: "-outlined",
    r_: "-round",
    s_: "-sharp"
  },
  oe = {
    sym_o_: "-outlined",
    sym_r_: "-rounded",
    sym_s_: "-sharp"
  },
  xe = new RegExp("^(" + Object.keys(ie).join("|") + ")"),
  qe = new RegExp("^(" + Object.keys(le).join("|") + ")"),
  X = new RegExp("^(" + Object.keys(oe).join("|") + ")"),
  $e = /^[Mm]\s?[-+]?\.?\d/,
  Ee = /^img:/,
  Se = /^svguse:/,
  we = /^ion-/,
  Re = /^(fa-(sharp|solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?) /;
var G = F({
  name: "QIcon",
  props: {
    ...re,
    tag: {
      type: String,
      default: "i"
    },
    name: String,
    color: String,
    left: Boolean,
    right: Boolean
  },
  setup(e, {
    slots: t
  }) {
    const {
      proxy: {
        $q: a
      }
    } = V(), n = ue(e), l = s(() => "q-icon" + (e.left === !0 ? " on-left" : "") + (e.right === !0 ? " on-right" : "") + (e.color !== void 0 ? ` text-${e.color}` : "")), f = s(() => {
      let c, u = e.name;
      if (u === "none" || !u) return {
        none: !0
      };
      if (a.iconMapFn !== null) {
        const o = a.iconMapFn(u);
        if (o !== void 0)
          if (o.icon !== void 0) {
            if (u = o.icon, u === "none" || !u) return {
              none: !0
            }
          } else return {
            cls: o.cls,
            content: o.content !== void 0 ? o.content : " "
          }
      }
      if ($e.test(u) === !0) {
        const [o, y = U] = u.split("|");
        return {
          svg: !0,
          viewBox: y,
          nodes: o.split("&&").map(i => {
            const [k, b, p] = i.split("@@");
            return v("path", {
              style: b,
              d: k,
              transform: p
            })
          })
        }
      }
      if (Ee.test(u) === !0) return {
        img: !0,
        src: u.substring(4)
      };
      if (Se.test(u) === !0) {
        const [o, y = U] = u.split("|");
        return {
          svguse: !0,
          src: o.substring(7),
          viewBox: y
        }
      }
      let q = " ";
      const h = u.match(xe);
      if (h !== null) c = ie[h[1]](u);
      else if (Re.test(u) === !0) c = u;
      else if (we.test(u) === !0) c = `ionicons ion-${a.platform.is.ios===!0?"ios":"md"}${u.substring(3)}`;
      else if (X.test(u) === !0) {
        c = "notranslate material-symbols";
        const o = u.match(X);
        o !== null && (u = u.substring(6), c += oe[o[1]]), q = u
      } else {
        c = "notranslate material-icons";
        const o = u.match(qe);
        o !== null && (u = u.substring(2), c += le[o[1]]), q = u
      }
      return {
        cls: c,
        content: q
      }
    });
    return () => {
      const c = {
        class: l.value,
        style: n.value,
        "aria-hidden": "true",
        role: "presentation"
      };
      return f.value.none === !0 ? v(e.tag, c, pe(t.default)) : f.value.img === !0 ? v(e.tag, c, z(t.default, [v("img", {
        src: f.value.src
      })])) : f.value.svg === !0 ? v(e.tag, c, z(t.default, [v("svg", {
        viewBox: f.value.viewBox || "0 0 24 24"
      }, f.value.nodes)])) : f.value.svguse === !0 ? v(e.tag, c, z(t.default, [v("svg", {
        viewBox: f.value.viewBox
      }, [v("use", {
        "xlink:href": f.value.src
      })])])) : (f.value.cls !== void 0 && (c.class += " " + f.value.cls), v(e.tag, c, z(t.default, [f.value.content])))
    }
  }
});
const Le = {
  size: {
    type: [String, Number],
    default: "1em"
  },
  color: String
};

function Be(e) {
  return {
    cSize: s(() => e.size in Q ? `${Q[e.size]}px` : e.size),
    classes: s(() => "q-spinner" + (e.color ? ` text-${e.color}` : ""))
  }
}
var Ce = F({
  name: "QSpinner",
  props: {
    ...Le,
    thickness: {
      type: Number,
      default: 5
    }
  },
  setup(e) {
    const {
      cSize: t,
      classes: a
    } = Be(e);
    return () => v("svg", {
      class: a.value + " q-spinner-mat",
      width: t.value,
      height: t.value,
      viewBox: "25 25 50 50"
    }, [v("circle", {
      class: "path",
      cx: "50",
      cy: "50",
      r: "20",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": e.thickness,
      "stroke-miterlimit": "10"
    })])
  }
});

function _e(e, t) {
  const a = e.style;
  for (const n in t) a[n] = t[n]
}

function Ze(e) {
  if (e == null) return;
  if (typeof e == "string") try {
    return document.querySelector(e) || void 0
  } catch {
    return
  }
  const t = ce(e);
  if (t) return t.$el || t
}

function Pe(e, t = 250) {
  let a = !1,
    n;
  return function() {
    return a === !1 && (a = !0, setTimeout(() => {
      a = !1
    }, t), n = e.apply(this, arguments)), n
  }
}

function J(e, t, a, n) {
  a.modifiers.stop === !0 && ae(e);
  const l = a.modifiers.color;
  let f = a.modifiers.center;
  f = f === !0 || n === !0;
  const c = document.createElement("span"),
    u = document.createElement("span"),
    q = ge(e),
    {
      left: h,
      top: o,
      width: y,
      height: i
    } = t.getBoundingClientRect(),
    k = Math.sqrt(y * y + i * i),
    b = k / 2,
    p = `${(y-k)/2}px`,
    d = f ? p : `${q.left-h-b}px`,
    x = `${(i-k)/2}px`,
    _ = f ? x : `${q.top-o-b}px`;
  u.className = "q-ripple__inner", _e(u, {
    height: `${k}px`,
    width: `${k}px`,
    transform: `translate3d(${d},${_},0) scale3d(.2,.2,1)`,
    opacity: 0
  }), c.className = `q-ripple${l?" text-"+l:""}`, c.setAttribute("dir", "ltr"), c.appendChild(u), t.appendChild(c);
  const B = () => {
    c.remove(), clearTimeout(C)
  };
  a.abort.push(B);
  let C = setTimeout(() => {
    u.classList.add("q-ripple__inner--enter"), u.style.transform = `translate3d(${p},${x},0) scale3d(1,1,1)`, u.style.opacity = .2, C = setTimeout(() => {
      u.classList.remove("q-ripple__inner--enter"), u.classList.add("q-ripple__inner--leave"), u.style.opacity = 0, C = setTimeout(() => {
        c.remove(), a.abort.splice(a.abort.indexOf(B), 1)
      }, 275)
    }, 250)
  }, 50)
}

function Y(e, {
  modifiers: t,
  value: a,
  arg: n
}) {
  const l = Object.assign({}, e.cfg.ripple, t, a);
  e.modifiers = {
    early: l.early === !0,
    stop: l.stop === !0,
    center: l.center === !0,
    color: l.color || n,
    keyCodes: [].concat(l.keyCodes || 13)
  }
}
var Te = de({
  name: "ripple",
  beforeMount(e, t) {
    const a = t.instance.$.appContext.config.globalProperties.$q.config || {};
    if (a.ripple === !1) return;
    const n = {
      cfg: a,
      enabled: t.value !== !1,
      modifiers: {},
      abort: [],
      start(l) {
        n.enabled === !0 && l.qSkipRipple !== !0 && l.type === (n.modifiers.early === !0 ? "pointerdown" : "click") && J(l, e, n, l.qKeyEvent === !0)
      },
      keystart: Pe(l => {
        n.enabled === !0 && l.qSkipRipple !== !0 && D(l, n.modifiers.keyCodes) === !0 && l.type === `key${n.modifiers.early===!0?"down":"up"}` && J(l, e, n, !0)
      }, 300)
    };
    Y(n, t), e.__qripple = n, fe(n, "main", [
      [e, "pointerdown", "start", "passive"],
      [e, "click", "start", "passive"],
      [e, "keydown", "keystart", "passive"],
      [e, "keyup", "keystart", "passive"]
    ])
  },
  updated(e, t) {
    if (t.oldValue !== t.value) {
      const a = e.__qripple;
      a !== void 0 && (a.enabled = t.value !== !1, a.enabled === !0 && Object(t.value) === t.value && Y(a, t))
    }
  },
  beforeUnmount(e) {
    const t = e.__qripple;
    t !== void 0 && (t.abort.forEach(a => {
      a()
    }), ve(t, "main"), delete e._qripple)
  }
});
const se = {
    left: "start",
    center: "center",
    right: "end",
    between: "between",
    around: "around",
    evenly: "evenly",
    stretch: "stretch"
  },
  Oe = Object.keys(se),
  Me = {
    align: {
      type: String,
      validator: e => Oe.includes(e)
    }
  };

function Ae(e) {
  return s(() => {
    const t = e.align === void 0 ? e.vertical === !0 ? "stretch" : "left" : e.align;
    return `${e.vertical===!0?"items":"justify"}-${se[t]}`
  })
}

function je(e) {
  return e.appContext.config.globalProperties.$router !== void 0
}

function Z(e) {
  return e ? e.aliasOf ? e.aliasOf.path : e.path : ""
}

function ee(e, t) {
  return (e.aliasOf || e) === (t.aliasOf || t)
}

function ze(e, t) {
  for (const a in t) {
    const n = t[a],
      l = e[a];
    if (typeof n == "string") {
      if (n !== l) return !1
    } else if (Array.isArray(l) === !1 || l.length !== n.length || n.some((f, c) => f !== l[c])) return !1
  }
  return !0
}

function te(e, t) {
  return Array.isArray(t) === !0 ? e.length === t.length && e.every((a, n) => a === t[n]) : e.length === 1 && e[0] === t
}

function Ke(e, t) {
  return Array.isArray(e) === !0 ? te(e, t) : Array.isArray(t) === !0 ? te(t, e) : e === t
}

function Ie(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length) return !1;
  for (const a in e)
    if (Ke(e[a], t[a]) === !1) return !1;
  return !0
}
const Ne = {
  to: [String, Object],
  replace: Boolean,
  href: String,
  target: String,
  disable: Boolean
};

function De({
  fallbackTag: e,
  useDisableForRouterLinkProps: t = !0
} = {}) {
  const a = V(),
    {
      props: n,
      proxy: l,
      emit: f
    } = a,
    c = je(a),
    u = s(() => n.disable !== !0 && n.href !== void 0),
    q = t === !0 ? s(() => c === !0 && n.disable !== !0 && u.value !== !0 && n.to !== void 0 && n.to !== null && n.to !== "") : s(() => c === !0 && u.value !== !0 && n.to !== void 0 && n.to !== null && n.to !== ""),
    h = s(() => q.value === !0 ? _(n.to) : null),
    o = s(() => h.value !== null),
    y = s(() => u.value === !0 || o.value === !0),
    i = s(() => n.type === "a" || y.value === !0 ? "a" : n.tag || e || "div"),
    k = s(() => u.value === !0 ? {
      href: n.href,
      target: n.target
    } : o.value === !0 ? {
      href: h.value.href,
      target: n.target
    } : {}),
    b = s(() => {
      if (o.value === !1) return -1;
      const {
        matched: g
      } = h.value, {
        length: $
      } = g, S = g[$ - 1];
      if (S === void 0) return -1;
      const R = l.$route.matched;
      if (R.length === 0) return -1;
      const L = R.findIndex(ee.bind(null, S));
      if (L !== -1) return L;
      const K = Z(g[$ - 2]);
      return $ > 1 && Z(S) === K && R[R.length - 1].path !== K ? R.findIndex(ee.bind(null, g[$ - 2])) : L
    }),
    p = s(() => o.value === !0 && b.value !== -1 && ze(l.$route.params, h.value.params)),
    d = s(() => p.value === !0 && b.value === l.$route.matched.length - 1 && Ie(l.$route.params, h.value.params)),
    x = s(() => o.value === !0 ? d.value === !0 ? ` ${n.exactActiveClass} ${n.activeClass}` : n.exact === !0 ? "" : p.value === !0 ? ` ${n.activeClass}` : "" : "");

  function _(g) {
    try {
      return l.$router.resolve(g)
    } catch {}
    return null
  }

  function B(g, {
    returnRouterError: $,
    to: S = n.to,
    replace: R = n.replace
  } = {}) {
    if (n.disable === !0) return g.preventDefault(), Promise.resolve(!1);
    if (g.metaKey || g.altKey || g.ctrlKey || g.shiftKey || g.button !== void 0 && g.button !== 0 || n.target === "_blank") return Promise.resolve(!1);
    g.preventDefault();
    const L = l.$router[R === !0 ? "replace" : "push"](S);
    return $ === !0 ? L : L.then(() => {}).catch(() => {})
  }

  function C(g) {
    if (o.value === !0) {
      const $ = S => B(g, S);
      f("click", g, $), g.defaultPrevented !== !0 && $()
    } else f("click", g)
  }
  return {
    hasRouterLink: o,
    hasHrefLink: u,
    hasLink: y,
    linkTag: i,
    resolvedLink: h,
    linkIsActive: p,
    linkIsExactActive: d,
    linkClass: x,
    linkAttrs: k,
    getLink: _,
    navigateToRouterLink: B,
    navigateOnClick: C
  }
}
const ne = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  Qe = {
    xs: 8,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 24
  },
  Fe = ["button", "submit", "reset"],
  Ve = /[^\s]\/[^\s]/,
  He = ["flat", "outline", "push", "unelevated"];

function Ue(e, t) {
  return e.flat === !0 ? "flat" : e.outline === !0 ? "outline" : e.push === !0 ? "push" : e.unelevated === !0 ? "unelevated" : t
}
const We = {
    ...re,
    ...Ne,
    type: {
      type: String,
      default: "button"
    },
    label: [Number, String],
    icon: String,
    iconRight: String,
    ...He.reduce((e, t) => (e[t] = Boolean) && e, {}),
    square: Boolean,
    rounded: Boolean,
    glossy: Boolean,
    size: String,
    fab: Boolean,
    fabMini: Boolean,
    padding: String,
    color: String,
    textColor: String,
    noCaps: Boolean,
    noWrap: Boolean,
    dense: Boolean,
    tabindex: [Number, String],
    ripple: {
      type: [Boolean, Object],
      default: !0
    },
    align: {
      ...Me.align,
      default: "center"
    },
    stack: Boolean,
    stretch: Boolean,
    loading: {
      type: Boolean,
      default: null
    },
    disable: Boolean
  },
  Xe = {
    ...We,
    round: Boolean
  };

function Ge(e) {
  const t = ue(e, Qe),
    a = Ae(e),
    {
      hasRouterLink: n,
      hasLink: l,
      linkTag: f,
      linkAttrs: c,
      navigateOnClick: u
    } = De({
      fallbackTag: "button"
    }),
    q = s(() => {
      const d = e.fab === !1 && e.fabMini === !1 ? t.value : {};
      return e.padding !== void 0 ? Object.assign({}, d, {
        padding: e.padding.split(/\s+/).map(x => x in ne ? ne[x] + "px" : x).join(" "),
        minWidth: "0",
        minHeight: "0"
      }) : d
    }),
    h = s(() => e.rounded === !0 || e.fab === !0 || e.fabMini === !0),
    o = s(() => e.disable !== !0 && e.loading !== !0),
    y = s(() => o.value === !0 ? e.tabindex || 0 : -1),
    i = s(() => Ue(e, "standard")),
    k = s(() => {
      const d = {
        tabindex: y.value
      };
      return l.value === !0 ? Object.assign(d, c.value) : Fe.includes(e.type) === !0 && (d.type = e.type), f.value === "a" ? (e.disable === !0 ? d["aria-disabled"] = "true" : d.href === void 0 && (d.role = "button"), n.value !== !0 && Ve.test(e.type) === !0 && (d.type = e.type)) : e.disable === !0 && (d.disabled = "", d["aria-disabled"] = "true"), e.loading === !0 && e.percentage !== void 0 && Object.assign(d, {
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": e.percentage
      }), d
    }),
    b = s(() => {
      let d;
      e.color !== void 0 ? e.flat === !0 || e.outline === !0 ? d = `text-${e.textColor||e.color}` : d = `bg-${e.color} text-${e.textColor||"white"}` : e.textColor && (d = `text-${e.textColor}`);
      const x = e.round === !0 ? "round" : `rectangle${h.value===!0?" q-btn--rounded":e.square===!0?" q-btn--square":""}`;
      return `q-btn--${i.value} q-btn--${x}` + (d !== void 0 ? " " + d : "") + (o.value === !0 ? " q-btn--actionable q-focusable q-hoverable" : e.disable === !0 ? " disabled" : "") + (e.fab === !0 ? " q-btn--fab" : e.fabMini === !0 ? " q-btn--fab-mini" : "") + (e.noCaps === !0 ? " q-btn--no-uppercase" : "") + (e.dense === !0 ? " q-btn--dense" : "") + (e.stretch === !0 ? " no-border-radius self-stretch" : "") + (e.glossy === !0 ? " glossy" : "") + (e.square ? " q-btn--square" : "")
    }),
    p = s(() => a.value + (e.stack === !0 ? " column" : " row") + (e.noWrap === !0 ? " no-wrap text-no-wrap" : "") + (e.loading === !0 ? " q-btn__content--hidden" : ""));
  return {
    classes: b,
    style: q,
    innerClasses: p,
    attributes: k,
    hasLink: l,
    linkTag: f,
    navigateOnClick: u,
    isActionable: o
  }
}
const {
  passiveCapture: E
} = ye;
let T = null,
  O = null,
  M = null;
var et = F({
  name: "QBtn",
  props: {
    ...Xe,
    percentage: Number,
    darkPercentage: Boolean,
    onTouchstart: [Function, Array]
  },
  emits: ["click", "keydown", "mousedown", "keyup"],
  setup(e, {
    slots: t,
    emit: a
  }) {
    const {
      proxy: n
    } = V(), {
      classes: l,
      style: f,
      innerClasses: c,
      attributes: u,
      hasLink: q,
      linkTag: h,
      navigateOnClick: o,
      isActionable: y
    } = Ge(e), i = H(null), k = H(null);
    let b = null,
      p, d = null;
    const x = s(() => e.label !== void 0 && e.label !== null && e.label !== ""),
      _ = s(() => e.disable === !0 || e.ripple === !1 ? !1 : {
        keyCodes: q.value === !0 ? [13, 32] : [13],
        ...e.ripple === !0 ? {} : e.ripple
      }),
      B = s(() => ({
        center: e.round
      })),
      C = s(() => {
        const r = Math.max(0, Math.min(100, e.percentage));
        return r > 0 ? {
          transition: "transform 0.6s",
          transform: `translateX(${r-100}%)`
        } : {}
      }),
      g = s(() => {
        if (e.loading === !0) return {
          onMousedown: j,
          onTouchstart: j,
          onClick: j,
          onKeydown: j,
          onKeyup: j
        };
        if (y.value === !0) {
          const r = {
            onClick: S,
            onKeydown: R,
            onMousedown: K
          };
          if (n.$q.platform.has.touch === !0) {
            const m = e.onTouchstart !== void 0 ? "" : "Passive";
            r[`onTouchstart${m}`] = L
          }
          return r
        }
        return {
          onClick: P
        }
      }),
      $ = s(() => ({
        ref: i,
        class: "q-btn q-btn-item non-selectable no-outline " + l.value,
        style: f.value,
        ...u.value,
        ...g.value
      }));

    function S(r) {
      if (i.value !== null) {
        if (r !== void 0) {
          if (r.defaultPrevented === !0) return;
          const m = document.activeElement;
          if (e.type === "submit" && m !== document.body && i.value.contains(m) === !1 && m.contains(i.value) === !1) {
            i.value.focus();
            const I = () => {
              document.removeEventListener("keydown", P, !0), document.removeEventListener("keyup", I, E), i.value !== null && i.value.removeEventListener("blur", I, E)
            };
            document.addEventListener("keydown", P, !0), document.addEventListener("keyup", I, E), i.value.addEventListener("blur", I, E)
          }
        }
        o(r)
      }
    }

    function R(r) {
      i.value !== null && (a("keydown", r), D(r, [13, 32]) === !0 && O !== i.value && (O !== null && A(), r.defaultPrevented !== !0 && (i.value.focus(), O = i.value, i.value.classList.add("q-btn--active"), document.addEventListener("keyup", w, !0), i.value.addEventListener("blur", w, E)), P(r)))
    }

    function L(r) {
      i.value !== null && (a("touchstart", r), r.defaultPrevented !== !0 && (T !== i.value && (T !== null && A(), T = i.value, b = r.target, b.addEventListener("touchcancel", w, E), b.addEventListener("touchend", w, E)), p = !0, d !== null && clearTimeout(d), d = setTimeout(() => {
        d = null, p = !1
      }, 200)))
    }

    function K(r) {
      i.value !== null && (r.qSkipRipple = p === !0, a("mousedown", r), r.defaultPrevented !== !0 && M !== i.value && (M !== null && A(), M = i.value, i.value.classList.add("q-btn--active"), document.addEventListener("mouseup", w, E)))
    }

    function w(r) {
      if (i.value !== null && !(r !== void 0 && r.type === "blur" && document.activeElement === i.value)) {
        if (r !== void 0 && r.type === "keyup") {
          if (O === i.value && D(r, [13, 32]) === !0) {
            const m = new MouseEvent("click", r);
            m.qKeyEvent = !0, r.defaultPrevented === !0 && ke(m), r.cancelBubble === !0 && ae(m), i.value.dispatchEvent(m), P(r), r.qKeyEvent = !0
          }
          a("keyup", r)
        }
        A()
      }
    }

    function A(r) {
      const m = k.value;
      r !== !0 && (T === i.value || M === i.value) && m !== null && m !== document.activeElement && (m.setAttribute("tabindex", -1), m.focus()), T === i.value && (b !== null && (b.removeEventListener("touchcancel", w, E), b.removeEventListener("touchend", w, E)), T = b = null), M === i.value && (document.removeEventListener("mouseup", w, E), M = null), O === i.value && (document.removeEventListener("keyup", w, !0), i.value !== null && i.value.removeEventListener("blur", w, E), O = null), i.value !== null && i.value.classList.remove("q-btn--active")
    }

    function j(r) {
      P(r), r.qSkipRipple = !0
    }
    return me(() => {
      A(!0)
    }), Object.assign(n, {
      click: r => {
        y.value === !0 && S(r)
      }
    }), () => {
      let r = [];
      e.icon !== void 0 && r.push(v(G, {
        name: e.icon,
        left: e.stack !== !0 && x.value === !0,
        role: "img"
      })), x.value === !0 && r.push(v("span", {
        class: "block"
      }, [e.label])), r = z(t.default, r), e.iconRight !== void 0 && e.round === !1 && r.push(v(G, {
        name: e.iconRight,
        right: e.stack !== !0 && x.value === !0,
        role: "img"
      }));
      const m = [v("span", {
        class: "q-focus-helper",
        ref: k
      })];
      return e.loading === !0 && e.percentage !== void 0 && m.push(v("span", {
        class: "q-btn__progress absolute-full overflow-hidden" + (e.darkPercentage === !0 ? " q-btn__progress--dark" : "")
      }, [v("span", {
        class: "q-btn__progress-indicator fit block",
        style: C.value
      })])), m.push(v("span", {
        class: "q-btn__content text-center col items-center q-anchor--skip " + c.value
      }, r)), e.loading !== null && m.push(v(he, {
        name: "q-transition--fade"
      }, () => e.loading === !0 ? [v("span", {
        key: "loading",
        class: "absolute-full flex flex-center"
      }, t.loading !== void 0 ? t.loading() : [v(Ce)])] : null)), be(v(h.value, $.value, m), [
        [Te, _.value, void 0, B.value]
      ])
    }
  }
});
export {
  et as Q, Ye as a, z as b, _e as c, Ce as d, Ze as g, pe as h
};
