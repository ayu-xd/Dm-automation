import {
  Q as i
} from "./QBtn.58e963d5.js";
import {
  Q as c
} from "./QPage.c2e4af26.js";
import {
  A as a,
  u as l
} from "./api.5de82224.js";
import {
  _ as d,
  s as u,
  t as p,
  u as h,
  v as m,
  E as s,
  x as f,
  Q as o
} from "./index.4c1e2858.js";
const n = t => new Promise(e => setTimeout(e, t)),
  g = u({
    name: "AuthPage",
    data() {
      return {
        loading: !1
      }
    },
    methods: {
      dec2hex(t) {
        return t.toString(16).padStart(2, "0")
      },
      generateId(t) {
        const e = new Uint8Array((t || 40) / 2);
        return crypto.getRandomValues(e), Array.from(e, this.dec2hex).join("")
      },
      authNew() {
        chrome.windows.create({
          url: "https://app.colddms.com/sign-in/",
          type: "popup"
        })
      },
      async startAuth() {
        const t = this.generateId(128);
        chrome.windows.create({
          url: "https://app.colddms.com/extension-id/" + t,
          type: "popup"
        }), await n(2e3);
        for (let e = 0; e < 10; e++) {
          try {
            if (!(await a.init().authByCode(t)).response.user) continue;
            return this.$router.push("/")
          } catch {}
          await n(1e3)
        }
      },
      async login() {
        try {
          const t = await a.init().getUser();
          t.success ? (this.store.setUser(t.response.user), this.store.setLoggedIn(!0), this.$router.push("/")) : await this.startAuth()
        } catch {
          this.store.setLoggedIn(!1), await this.startAuth()
        } finally {
          this.loading = !1
        }
      }
    },
    setup() {
      return {
        store: l()
      }
    }
  }),
  w = {
    class: "col items-center justify-center content-center"
  },
  _ = s("div", {
    class: "text-center q-mb-md"
  }, [o(" Authorize on "), s("a", {
    href: "https://app.colddms.com",
    target: "_blank"
  }, "app.colddms.com"), o(" first to get access ")], -1);

function y(t, e, r, x, A, I) {
  return p(), h(c, {
    class: "flex flex-center"
  }, {
    default: m(() => [s("div", w, [_, f(i, {
      color: "white",
      class: "full-width",
      "text-color": "black",
      label: "SIGN IN",
      onClick: t.authNew,
      loading: t.loading
    }, null, 8, ["onClick", "loading"])])]),
    _: 1
  })
}
var C = d(g, [
  ["render", y]
]);
export {
  C as
  default
};
