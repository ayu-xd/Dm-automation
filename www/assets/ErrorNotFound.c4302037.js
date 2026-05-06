import {
  Q as t
} from "./QBtn.58e963d5.js";
import {
  _ as o,
  s,
  t as r,
  y as n,
  E as e,
  x as a
} from "./index.4c1e2858.js";
const c = s({
    name: "ErrorNotFound"
  }),
  l = {
    class: "fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  },
  d = e("div", {
    style: {
      "font-size": "30vh"
    }
  }, " 404 ", -1),
  i = e("div", {
    class: "text-h2",
    style: {
      opacity: ".4"
    }
  }, " Oops. Nothing here... ", -1);

function _(p, f, m, u, x, h) {
  return r(), n("div", l, [e("div", null, [d, i, a(t, {
    class: "q-mt-xl",
    color: "white",
    "text-color": "blue",
    unelevated: "",
    to: "/",
    label: "Go Home",
    "no-caps": ""
  })])])
}
var b = o(c, [
  ["render", _]
]);
export {
  b as
  default
};
