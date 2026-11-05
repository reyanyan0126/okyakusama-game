const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const U = require("../pixel-ui");
const G = require("../engine");
const manifest = require("../assets/work-import/manifest.json");
const cache = fs.readFileSync("sw.js","utf8");

test("132 unique reviewed PNGs ship in the offline release", () => {
  assert.equal(new Set(manifest.assets.map(a => a.path)).size, 132);
  for (const asset of manifest.assets) {
    const path = "assets/work-import/" + asset.path;
    assert.ok(asset.reviewed && cache.includes('"./' + path + '"'));
    assert.equal(fs.readFileSync(path).subarray(1,4).toString(), "PNG");
  }
});

test("visitor identity is stable across reactions, save round trips and repeat renders", () => {
  const s = {...G.initial(11), week: 3, sat: 55, frust: 0, fire: 0};
  const before = JSON.stringify(s);
  const id = html => html.match(/data-guest="regular-(\d+)"/)[1];
  const neutral = U.guests(s);
  for (const [state, label] of [[{sat:80},"喜び"], [{fire:75},"怒り"], [{sat:20},"戸惑い"]]) {
    const html = U.guests({...s,...state});
    assert.equal(id(html),id(neutral));
    assert.ok(html.includes(label));
  }
  assert.equal(U.guests(JSON.parse(before)),neutral);
  assert.equal(JSON.stringify(s),before);
});

test("portraits preserve six roles and route all eight moods to distinct files", () => {
  for (const role of ["you","boss","manager","worker","customer","devil"]) {
    const sources = Object.keys(U.moods).map(m => U.character(role,m,true).match(/src="([^"]+)"/)[1]);
    assert.equal(new Set(sources).size,8);
    for (const src of sources) assert.ok(fs.existsSync(src));
  }
});

test("all six cast roles and eight moods use refreshed art in full and face views", () => {
  for (const role of ["you","boss","manager","worker","customer","devil"]) {
    for (const mood of Object.keys(U.moods)) {
      for (const face of [false,true]) {
        const html = U.character(role,mood,face,true);
        const source = html.match(/src="([^"]+)"/)[1];
        assert.ok(!source.startsWith("assets/pixel/"), role+" "+mood);
        assert.ok(fs.existsSync(source),source);
      }
    }
  }
});
