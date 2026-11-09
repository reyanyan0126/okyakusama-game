"use strict";
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const { chromium, webkit } = require("playwright");
const G = require("../engine");
const seasons = require("../season-goals");
const root = path.join(__dirname, "..");
const name = process.env.BROWSER || "chromium";
const server = http.createServer((req,res) => {
  const url = new URL(req.url, "http://localhost").pathname;
  const file = path.join(root,url === "/" ? "index.html" : url);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  const types = {".css":"text/css",".js":"application/javascript",".html":"text/html",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
  res.setHeader("content-type",types[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
function states() {
  const first=G.initial(73,{difficulty:"easy",choiceEdition:370,strategyVersion:380});
  let state=structuredClone(first), review;
  while (!state.finished) {
    if(seasons.needsGoal(state))seasons.choose(state,seasons.offers(state)[0].id);
    state=G.play(state,G.weeklyOffers(state)[0].id);
    const h=state.lastResult;
    if(h.accidentId && !h.accidentPositive && h.incidentCost && !h.accidentResponse)state=G.handleAccident(state,"ignore");
    if(state.rescuePending)state=G.resolveRescue(state,G.rescueOptions(state)[0]?.id || "giveup");
    if(state.seasonReview){
      review ||= structuredClone(state);
      seasons.complete(state,state.perks.length>=4?"skip":undefined);
    }
  }
  assert(review);
  return {first,review,end:state};
}
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 let browser;
 try {
  browser=await ({chromium,webkit})[name].launch();
  const samples=states();
  for(const width of [320,375,390,430]){
    const context=await browser.newContext({viewport:{width,height:844},reducedMotion:"reduce"});
    const p=await context.newPage(), errors=[];
    p.setDefaultTimeout(10000);
    p.on("pageerror",err=>errors.push(err.message));
    const out=path.join(root,"test-artifacts","strategy-"+name,String(width));fs.mkdirSync(out,{recursive:true});
    const click=sel=>p.locator(sel).first().click();
    const load=async state=>{
      await p.evaluate(s=>localStorage.setItem("okyakusama.save.v1",JSON.stringify(s)),state);
      await p.reload();await click("#titleResume");
    };
    const snap=async (screen,primary)=>{
      await p.addStyleTag({url:"/node_modules/@fontsource/noto-sans-jp/400.css"});
      await p.addStyleTag({content:'body,button,select{font-family:"Noto Sans JP",sans-serif}'});
      await p.evaluate(()=>document.fonts.ready);
      const main=p.locator("main");
      assert.equal(await main.getAttribute("data-screen"),screen);
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),screen+" horizontal overflow");
      if(primary){const box=await p.locator(primary).last().boundingBox();assert(box&&box.y+box.height<=845,screen+" CTA below viewport "+width);}
      assert.deepEqual(errors,[]);
      await p.screenshot({path:path.join(out,screen+".png"),fullPage:true});
    };
    await p.goto("http://localhost:"+server.address().port);
    await load(samples.first);await snap("seasonGoal","[data-goal]");assert.equal(await p.locator("[data-goal]").count(),3);
    await click("[data-goal]");await snap("home","#openProposals");await click("#openProposals");await snap("choices","#advanceButton");
    await click('[data-go="home"]');await click('[data-go="timeline"]');await snap("timeline");
    await click('[data-go="home"]');await click('[data-go="status"]');await snap("status");await click("#strategyBuild");await snap("strategyBuild");
    await load(samples.review);await snap("seasonReview","#finishSeason");await click("#finishSeason");
    await load(samples.end);await snap("ending");await click('[data-go="records"]');await snap("records");
    await context.close();console.log("PASS strategy UI",name,width);
  }
 } finally {if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
