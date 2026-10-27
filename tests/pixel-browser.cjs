"use strict";
const { chromium, webkit } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  path = require("path"),
  http = require("http");
const G = require("../engine.js"),
  root = path.resolve(__dirname, ".."),
  browserName = process.env.BROWSER || "chromium";
(async () => {
  let disconnected = false;
  const server = http
    .createServer((q, r) => {
      if(disconnected){q.socket.destroy();return;}
      const f = path.join(
        root,
        decodeURI(q.url.split("?")[0]).replace(/\/$/, "/index.html"),
      );
      try {
        r.setHeader(
          "Content-Type",
          {
            html: "text/html",
            js: "text/javascript",
            css: "text/css",
            svg: "image/svg+xml",
            webmanifest: "application/manifest+json",
            png: "image/png",
          }[f.split(".").pop()] || "application/octet-stream",
        );
        r.end(fs.readFileSync(f));
      } catch {
        r.writeHead(404);
        r.end();
      }
    })
    .listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base =
      process.env.BASE_URL || "http://localhost:" + server.address().port + "/",
    out = path.join(
      root,
      "test-artifacts",
      (process.env.AUDIT_PHASE || "pixel") + "-" + browserName,
    );
  fs.mkdirSync(out, { recursive: true });
  const checks = [];
  const b = await { chromium, webkit }[browserName].launch();
  for (const width of (process.env.WIDTHS || "320,375,390,430,768,1024")
    .split(",")
    .map(Number)) {
    const context = await b.newContext({
      viewport: { width, height: 844 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const p = await context.newPage();
    p.setDefaultTimeout(8000);
    let errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("dialog", (d) => d.accept());
    const fontRoot = path.join(root, "node_modules/@fontsource/noto-sans-jp");
    const fontCSS =
      fs
        .readFileSync(path.join(fontRoot, "400.css"), "utf8")
        .replace(
          /url\(([^)]+)\)/g,
          (_, file) =>
            "url(data:font/woff2;base64," +
            fs
              .readFileSync(path.join(fontRoot, file.replace(/[\'"]/g, "")))
              .toString("base64") +
            ")",
        ) + ' body,button,svg text{font-family:"Noto Sans JP",sans-serif}';
    const font = async () => {
      if (await p.locator("#qa-font").count()) return;
      const style = await p.addStyleTag({ content: fontCSS });
      await style.evaluate((e) => (e.id = "qa-font"));
      await p.evaluate(async () => {
        await document.fonts.load(
          '15px "Noto Sans JP"',
          document.body.innerText,
        );
        await document.fonts.ready;
      });
    };
    await p.goto(base);
    await font();
    const snap = async (name) => {
      await font();
      await p
        .locator("img")
        .evaluateAll(
          async (imgs) =>
            await Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
        );
      const problems = await p.evaluate(() => ({
        overflow: [...document.querySelectorAll("main *")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return (
              r.width &&
              r.height &&
              !e.closest("svg") &&
              (r.right > innerWidth + 1 || r.left < -1)
            );
          })
          .map((e) => e.id || e.className)
          .slice(0, 8),
        images: [...document.images]
          .filter((i) => !i.complete || !i.naturalWidth)
          .map((i) => i.src),
        ids: [...document.querySelectorAll("[id]")].map((e) => e.id),
      }));
      assert.deepEqual(problems.overflow, [], name + " overflow");
      assert.deepEqual(problems.images, [], name + " missing images");
      assert.equal(
        problems.ids.length,
        new Set(problems.ids).size,
        name + " duplicate ids",
      );
      assert.deepEqual(errors, [], name + " JS errors");
      await p.screenshot({
        path: path.join(out, `${width}-${name}.png`),
        fullPage: true,
      });
      checks.push({ width, name, passed: true });
      fs.writeFileSync(
        path.join(out, "audit.json"),
        JSON.stringify(checks, null, 2),
      );
    };
    const click = async (id) => p.locator("#" + id).click();
    const load = async (s) => {
      await p.evaluate(
        (s) => localStorage.setItem("okyakusama.save.v1", JSON.stringify(s)),
        s,
      );
      await p.reload();
      await click("titleResume");
    };
    const drain = async (name) => {
      for (let i = 0; i < 25; i++) {
        if (await p.locator("#workingSkip").count()) {
          await click("workingSkip");
        } else if (await p.locator("#outcomeNext").count()) {
          if (name) await snap(name + "-outcome");
          await click("outcomeNext");
        } else if (await p.locator("#accidentIgnore").count()) {
          if (name) await snap(name + "-accident");
          await click("accidentIgnore");
        } else if (await p.locator("#newsNext").count()) {
          if (name) await snap(name + "-news-" + i);
          await click("newsNext");
        } else if (await p.locator("[data-rescue]").count()) {
          if (name) await snap(name + "-rescue");
          await p.locator("[data-rescue]").first().click();
        } else if (await p.locator("#reportContinue").count()) {
          if (name) await snap(name + "-report");
          await click("reportContinue");
          return;
        } else if (
          (await p.locator("#endRestart").count()) ||
          (await p.locator("#openProposals").count())
        )
          return;
        else
          throw Error(
            "Unknown theater state: " + (await p.locator("main").innerText()),
          );
      }
      throw Error("theater stalled");
    };
    await snap("title");
    await click("titleHelp");
    await snap("help");
    await click("aboutClose");
    await click("titleStart");
    await snap("contracts");
    await click("acceptMarket");
    for (let i = 0; i < 7; i++) {
      await snap("prologue-" + (i + 1));
      await click("prologueNext");
    }
    await snap("home");
    // Home essentials stay in the first mobile viewport.
    const cta = await p.locator("#openProposals").boundingBox();
    assert(
      cta.y + cta.height <= 844,
      "primary home operation below first screen",
    );
    await p.locator('[data-go="status"]').click();
    await snap("status");
    await p.locator("summary").click();
    await snap("status-detail");
    await click("statusDone");
    await p.locator('[data-finance="store"]').click();
    await snap("money-store");
    await click("moneyPersonalTab");
    await snap("money-personal");
    await click("moneyDone");
    await p.locator('[data-go="voice"]').click();
    await snap("voice");
    await p.locator('[data-go="records"]').click();
    await snap("records");
    await p.locator("summary").last().click();
    await snap("backup");
    await click("showCast");
    await snap("cast");
    await p.locator('[data-go="records"]').click();
    await p.locator('[data-go="home"]').first().click();
    await click("openProposals");
    await snap("choices");
    assert.equal(await p.locator("[data-choice]").count(), 4);
    for (let i = 0; i < 4; i++) {
      await p.locator("[data-choice]").nth(i).click();
      await snap("choice-" + i);
    }
    await p.getByText("経営会議・現場の証言", { exact: true }).click();
    await snap("meeting");
    await p.getByText("追加投資・悪魔の取引", { exact: true }).click();
    await snap("investments-devil");
    await p.locator('[data-project="people"]').click();
    await p.locator('[data-devil="personal"]').click();
    await snap("optional-selected");
    await p.locator('[data-project=""]').click();
    await p.locator('[data-devil=""]').click();
    await click("advanceButton");
    if (await p.locator("#workingSkip").count()) await snap("working");
    await drain("week-one");
    await snap("week-two");
    // Compatibility with every actual legacy outcome/event/rescue fixture.
    const fixtures = require("./build-ui-fixtures.cjs");
    for (const [name, s] of Object.entries(fixtures)) {
      if (name === "campaign" || name === "large-low-reputation") continue;
      await load(s);
      await drain("branch-" + name);
      const saved = await p.evaluate(() =>
        JSON.parse(localStorage.getItem("okyakusama.save.v1")),
      );
      assert.equal(saved.week, s.week, "resume must not replay week");
      assert.equal(saved.rng, s.rng, "resume must not advance RNG");
      if (await p.locator("#endRestart").count()) await snap("ending-" + name);
    }
    await load(fixtures["large-low-reputation"]);
    await snap("large-balances");
    // One full deterministic 30-week interaction campaign per viewport.
    await load(fixtures.campaign);
    for (let i = 0; i < 29; i++) {
      await click("openProposals");
      assert.equal(await p.locator("[data-choice]").count(), 4);
      await p.locator("[data-choice]").first().click();
      await click("advanceButton");
      await drain();
    }
    const final = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("okyakusama.save.v1")),
    );
    assert.equal(final.history.length, 30);
    assert.equal(final.week, 31);
    assert.equal(final.finished, true);
    G.validateSaved(final);
    await snap("campaign-ending");
    // Browser-native save round trip and safe import (engine validation required).
    await p.locator('[data-go="records"]').click();
    await p.locator("summary").last().click();
    const downloadPromise = p.waitForEvent("download");
    await click("exportSave");
    const download = await downloadPromise;
    await download.saveAs(path.join(out, `${width}-save.json`));
    const exported = JSON.parse(
      fs.readFileSync(path.join(out, `${width}-save.json`), "utf8"),
    );
    assert.deepEqual(exported, final);
    await p
      .locator("#importSave")
      .setInputFiles({
        name: "save.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(fixtures.campaign)),
      });
    await p.locator("#openProposals").waitFor();
    if(browserName === "webkit" && process.env.BASE_URL){
      console.log(browserName,width,checks.filter(x=>x.width===width).length,'PUBLIC screens and 30-week campaign PASS; offline covered by local-origin suite');
      await context.close();continue;
    }
    // Installed release has every sprite, and works with browser offline.
    await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await p.reload();
    await p.waitForFunction(() => !!navigator.serviceWorker.controller);
    if (browserName === "webkit" && !process.env.BASE_URL) disconnected = true;
    else await context.setOffline(true);
    await p.reload();
    await click("titleResume");
    await snap("offline-home");
    await click("openProposals");
    await snap("offline-choices");
    await p.locator('[data-go="home"]').click();
    await p.locator('[data-go="records"]').click();
    await p.locator("summary").last().click();
    await click("showCast");
    await snap("offline-cast");
    disconnected = false;
    await context.setOffline(false);
    console.log(
      browserName,
      width,
      checks.filter((x) => x.width === width).length,
      "screens; full 30-week campaign; legacy branches; save round trip; offline PASS",
    );
    await context.close();
  }
  await b.close();
  server.close();
  console.log("PASS", checks.length, "screens");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
