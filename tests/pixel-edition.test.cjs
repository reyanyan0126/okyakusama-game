"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  cp = require("node:child_process");
const G = require("../engine.js"),
  U = require("../pixel-ui.js"),
  read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
// Narrative remains byte-identical. Economic backward compatibility is checked
// by the v3.0 campaign fingerprints in management-v310.test.cjs.
for (const [f, hash] of Object.entries({
  "stories.js":
    "7ae3cdfe244fc8e33a0daf2183d6e3eba6309261957f5857ff3d163495297a31",
}))
  assert.equal(crypto.createHash("sha256").update(read(f)).digest("hex"), hash);
const html = read("index.html"),
  css = read("ui.css"),
  sw = read("sw.js");
assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1);
assert(!html.includes("manga") && !html.includes("cast-art"));
assert.match(css,/image-rendering:\s*pixelated/);
assert(!css.includes("@layer legacy"));
assert(sw.includes("okyakusama-v3.1.0"));
for (const role of ["you", "boss", "manager", "worker", "customer", "devil"]) {
  const hashes = [];
  for (const mood of [
    "normal",
    "happy",
    "angry",
    "confused",
    "surprised",
    "sad",
  ])
    for (const face of ["", "-face"]) {
      const name = `assets/pixel/${role}-${mood}${face}.svg`,
        s = read(name);
      assert(s.includes('shape-rendering="crispEdges"'));
      assert(!s.includes("<path"));
      assert(sw.includes(name));
      if (!face)
        hashes.push(crypto.createHash("sha256").update(s).digest("hex"));
    }
  assert.equal(
    new Set(hashes).size,
    6,
    "six distinct authored expressions for " + role,
  );
}
// Displayed cost must match actual charged strategy expense, for every action.
for (const a of G.ACTIONS) {
  let s = G.initial(25);
  s.cash = 10000000;
  s.personalCash = 1000000;
  if (!G.enabled(s, a.id)) continue;
  const h = G.play(s, a.id).lastResult;
  assert.equal(
    U.cost(G, a.id) < 0
      ? Math.round(U.cost(G, a.id) * h.performanceMultiplier)
      : U.cost(G, a.id),
    h.extra,
    a.id + " displayed strategy cost",
  );
}
for (const name of ["normal", "busy", "shortstaff", "fire", "crisis", "closed"])
  assert(sw.includes("store-" + name + ".svg"));
assert.equal(U.storeState({ ...G.initial(1), fire: 80 }), "fire");
assert.equal(U.storeState({ ...G.initial(1), cash: 20000 }), "crisis");
assert.equal(U.esc("<script>"), "&lt;script&gt;");
console.log(
  "PASS Pixel Edition assets, costs, preserved narrative and current finance, cache manifest",
);
