import {
  h as b,
  d as P,
  Q as k
} from "./QBtn.58e963d5.js";
import {
  c as m,
  a as s,
  h as v,
  g as w,
  _ as T,
  s as D,
  t as i,
  u as h,
  v as r,
  y as S,
  x as t,
  E as c,
  Q as $,
  z as p
} from "./index.4c1e2858.js";
import {
  Q as A
} from "./QPage.c2e4af26.js";
import {
  u as E,
  A as L
} from "./api.5de82224.js";
import {
  S as u
} from "./Storage.c45a3297.js";
var f = m({
  name: "QCardSection",
  props: {
    tag: {
      type: String,
      default: "div"
    },
    horizontal: Boolean
  },
  setup(e, {
    slots: a
  }) {
    const n = s(() => `q-card__section q-card__section--${e.horizontal===!0?"horiz row no-wrap":"vert"}`);
    return () => v(e.tag, {
      class: n.value
    }, b(a.default))
  }
});
const B = {
  dark: {
    type: Boolean,
    default: null
  }
};

function C(e, a) {
  return s(() => e.dark === null ? a.dark.isActive : e.dark)
}
const R = {
    true: "inset",
    item: "item-inset",
    "item-thumbnail": "item-thumbnail-inset"
  },
  g = {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24
  };
var q = m({
    name: "QSeparator",
    props: {
      ...B,
      spaced: [Boolean, String],
      inset: [Boolean, String],
      vertical: Boolean,
      color: String,
      size: String
    },
    setup(e) {
      const a = w(),
        n = C(e, a.proxy.$q),
        o = s(() => e.vertical === !0 ? "vertical" : "horizontal"),
        l = s(() => ` q-separator--${o.value}`),
        _ = s(() => e.inset !== !1 ? `${l.value}-${R[e.inset]}` : ""),
        I = s(() => `q-separator${l.value}${_.value}` + (e.color !== void 0 ? ` bg-${e.color}` : "") + (n.value === !0 ? " q-separator--dark" : "")),
        Q = s(() => {
          const d = {};
          if (e.size !== void 0 && (d[e.vertical === !0 ? "width" : "height"] = e.size), e.spaced !== !1) {
            const z = e.spaced === !0 ? `${g.md}px` : e.spaced in g ? `${g[e.spaced]}px` : e.spaced,
              y = e.vertical === !0 ? ["Left", "Right"] : ["Top", "Bottom"];
            d[`margin${y[0]}`] = d[`margin${y[1]}`] = z
          }
          return d
        });
      return () => v("hr", {
        class: I.value,
        style: Q.value,
        "aria-orientation": o.value
      })
    }
  }),
  x = m({
    name: "QCard",
    props: {
      ...B,
      tag: {
        type: String,
        default: "div"
      },
      square: Boolean,
      flat: Boolean,
      bordered: Boolean
    },
    setup(e, {
      slots: a
    }) {
      const {
        proxy: {
          $q: n
        }
      } = w(), o = C(e, n), l = s(() => "q-card" + (o.value === !0 ? " q-card--dark q-dark" : "") + (e.bordered === !0 ? " q-card--bordered" : "") + (e.square === !0 ? " q-card--square no-border-radius" : "") + (e.flat === !0 ? " q-card--flat no-shadow" : ""));
      return () => v(e.tag, {
        class: l.value
      }, b(a.default))
    }
  });
const N = D({
    name: "IndexPage",
    data() {
      return {
        loading: !0,
        instanceId: "",
        test: !0
      }
    },
    methods: {
      async start() {
        await u.set("enabled", !0), this.store.enabled = !0
      },
      async stop() {
        await u.set("enabled", !1), this.store.enabled = !1
      }
    },
    setup() {
      return {
        store: E()
      }
    },
    async mounted() {
      await u.load(), this.store.instanceId = await u.get("instanceId"), this.instanceId = this.store.instanceId;
      try {
        const e = await L.init(this.instanceId).getUser();
        e.success ? (this.store.setUser(e.response.user), this.store.setLoggedIn(!0), this.$router.push("/")) : this.store.setLoggedIn(!1)
      } catch {
        this.store.setLoggedIn(!1), this.$router.push("/auth")
      } finally {
        this.loading = !1
      }
    }
  }),
  O = {
    key: 0,
    class: "flex flex-center"
  },
  V = {
    key: 1,
    class: "flex column fit items-stretch content-stretch justify-between"
  },
  M = {
    class: "row"
  },
  U = {
    class: "col q-py-lg"
  },
  j = {
    class: "col q-py-lg"
  };

function F(e, a, n, o, l, _) {
  return i(), h(A, null, {
    default: r(() => [e.loading ? (i(), S("div", O, [t(P, {
      color: "primary",
      size: "3em",
      thickness: 10
    })])) : (i(), S("div", V, [c("div", M, [c("div", U, [t(x, null, {
      default: r(() => [t(f, {
        class: "text-center"
      }, {
        default: r(() => [$(" Messages today ")]),
        _: 1
      }), t(q), t(f, {
        class: "flex flex-center"
      }, {
        default: r(() => [c("div", null, p(e.store.stats.today), 1)]),
        _: 1
      })]),
      _: 1
    })]), c("div", j, [t(x, null, {
      default: r(() => [t(f, {
        class: "text-center"
      }, {
        default: r(() => [$(" Total messages ")]),
        _: 1
      }), t(q), t(f, {
        class: "flex flex-center"
      }, {
        default: r(() => [c("div", null, p(e.store.stats.today + e.store.stats.all), 1)]),
        _: 1
      })]),
      _: 1
    })])]), e.store.enabled ? (i(), h(k, {
      key: 0,
      label: "PRESS TO STOP",
      onClick: e.stop,
      class: "full-width"
    }, null, 8, ["onClick"])) : (i(), h(k, {
      key: 1,
      label: "PRESS TO START",
      onClick: e.start,
      class: "full-width"
    }, null, 8, ["onClick"]))]))]),
    _: 1
  })
}
var X = T(N, [
  ["render", F]
]);
export {
  X as
  default
};
