"use strict";
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const { chromium, webkit } = require("playwright");
const G = require("../engine");

const root = path.resolve(__dirname, "..");
const browserName = process.env.BROWSER || "chromium";
const output = path.join(root, "test-artifacts", "weekly-" + browserName);
const types = {html:"text/html",js:"text/javascript",css:"text/css",svg:"image/svg+xml",png:"image/png",woff2:"font/woff2",webmanifest:"application/manifest+json"};
const host = http.createServer((request, response) => {
  const name = new URL(request.url,"http://localhost").pathname;
  const file = path.join(root, name === "/" ? "index.html" : name);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {response.writeHead(404).end();return;}
  response.setHeader("Content-Type", types[path.extname(file).slice(1)] || "application/octet-stream");
  fs.createReadStream(file).pipe(response);
});

async function audit(browser, width, base) {
  const context = await browser.newContext({viewport:{width,height:844},reducedMotion:"reduce"});
  const page = await context.newPage();
  const errors = [];
  const evidence = [];
  const directory = path.join(output,String(width));
  fs.mkdirSync(directory,{recursive:true});
  const click = selector => page.locator(selector).first().click();
  page.on("pageerror", error => errors.push(error.message));
  page.setDefaultTimeout(7000);
  await page.clock.install();
  await page.goto(base);
  const fontDir = path.join(root,"node_modules/@fontsource/noto-sans-jp");
  const fonts = fs.readFileSync(path.join(fontDir,"400.css"),"utf8")
    .replace(/url\(([^)]+)\)/g,(_,url)=>"url(data:font/woff2;base64," + fs.readFileSync(path.join(fontDir,url.replace(/['"]/g,""))).toString("base64") + ")");
  const font = async () => {
    if (!(await page.locator("#qa-jp").count())) {
      const tag = await page.addStyleTag({content:fonts+' body,button,select{font-family:"Noto Sans JP",sans-serif}'});
      await tag.evaluate(el=>el.id="qa-jp");
    }
    await page.evaluate(async()=>{await document.fonts.load('15px "Noto Sans JP"',document.body.innerText);await document.fonts.ready;});
  };
  const shot = async (name) => {
    await font();
    await page.locator("img").evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    const info = await page.evaluate(()=>{
      const m=document.querySelector("main");
      const fig=m.querySelector("figure[data-phase]");
      return {screen:m.dataset.screen,scroller:document.documentElement.scrollWidth,viewport:innerWidth,
        visibleText:(m.querySelector("dialog[open]")||m).innerText,
        figures:fig?{...fig.dataset}:null,
        details:[...m.querySelectorAll("summary")].map(el=>el.textContent),
        images:[...m.querySelectorAll("img")].map(el=>el.getAttribute("src")),
        sceneImages:[...m.querySelectorAll("svg image")].map(el=>el.getAttribute("href")),
        heading:m.querySelector("h1")?.innerText, documentHeight:document.documentElement.scrollHeight};
    });
    assert.deepEqual(errors,[],name);
    assert(info.scroller<=info.viewport,name+" page overflow");
    if (["home","choices","working","outcome","news","rescue","report","voice","ending"].includes(info.screen))
      assert.equal(info.details.length,0,name+" core information must be visible");
    await page.screenshot({path:path.join(directory,name+".png")});
    evidence.push({name,...info});
    fs.writeFileSync(path.join(directory,"evidence.json"),JSON.stringify(evidence,null,2));
  };
  const load = async state => {
    await page.evaluate(s=>localStorage.setItem("okyakusama.save.v1",JSON.stringify(s)),state);
    await page.reload();
    await click("#titleResume");
  };
  try {
    await shot("01-title");
    await click("#titleHelp");await shot("19-help");await click("#aboutClose");
    await click("#titleStart");await shot("02-contract");await click("#acceptMarket");
    for(let i=1;i<=7;i++){await shot("03-intro-"+i);await click("#prologueNext");}

    const failed=G.play(G.initial(2),"shrink");failed.presentation=null;
    await load(failed);await shot("04-home");
    await click("#openProposals");
    const actions = await page.locator("[data-choice]").evaluateAll(els=>els.map(el=>el.dataset.choice));
    assert.equal(new Set(actions).size,4);
    for(const [i,id] of actions.entries()){
      await click('[data-choice="'+id+'"]');await shot("05-choice-"+(i+1)+"-"+id);
    }
    await click("[data-sheet=project]");await shot("06-investment");await click("dialog form button");
    await click("[data-sheet=devil]");await shot("07-devil");await click("dialog form button");
    await page.clock.pauseAt(new Date(Date.now()+60000));
    await click("#advanceButton");
    for(const [i,label] of ["準備","実行","客の反応","集計"].entries()){
      if(i)await page.clock.runFor(1100);
      assert.equal(await page.locator("#workingPhase").innerText(),label);
      await shot("08-working-"+(i+1));
    }
    await click("#workingSkip");await shot("09-result");
    const positive=G.play(G.initial(9),G.weeklyOffers(G.initial(9))[0].id);
    const h=positive.lastResult;
    h.fireHit=true;h.accidentId=null;h.incidentCost=0;
    positive.presentation={week:h.week,stage:"news",newsIndex:0};
    await load(positive);await shot("10-news");

    const incident=structuredClone(positive);
    Object.assign(incident.lastResult,{accidentId:"complaint",accidentTitle:"苦情への対応",accidentPositive:false,incidentCost:20000,accidentResponse:null,fireHit:false});
    await load(incident);
    for(let i=0;i<10 && !(await page.locator("#accidentIgnore").count());i++)await click("#newsNext");
    assert.equal(await page.locator("#accidentIgnore").count(),1);
    await shot("11-incident");await click("#accidentIgnore");
    const fixtures=require("./build-ui-fixtures.cjs");
    const rescue=structuredClone(fixtures.rescue);
    if(rescue.lastResult.accidentId&&!rescue.lastResult.accidentPositive&&rescue.lastResult.incidentCost>0&&!rescue.lastResult.accidentResponse)Object.assign(rescue,G.handleAccident(rescue,"ignore"));
    rescue.presentation={week:rescue.lastResult.week,stage:"rescue",newsIndex:0};
    await load(rescue);await page.locator("#rescueGiveUp").waitFor();await shot("12-insolvency");
    positive.presentation.stage="report";await load(positive);await shot("13-settlement");

    let run=G.initial(19,{difficulty:"easy"});run.cash=1000000;
    for(let i=0;i<4;i++){
      run=G.play(run,G.weeklyOffers(run)[0].id);
      if(run.lastResult.accidentId&&!run.lastResult.accidentPositive&&run.lastResult.incidentCost>0&&!run.lastResult.accidentResponse)run=G.handleAccident(run,"ignore");
    }
    run.presentation=null;
    await load(run);await click('[data-go="voice"]');await shot("14-voice");assert.equal(await page.locator(".public-post").count(),3);
    await click('[data-go="records"]');await shot("17-records");await click("[data-week]");await shot("17-record-detail");
    await click('[data-go="records"]');await click("#showCast");await shot("20-cast");
    for(const [id,patch] of Object.entries({normal:{},busy:{sat:92,storeRep:88},staff:{staff:30},fire:{fire:85},cash:{cash:20000}})){
      const state=Object.assign(G.initial(12,{difficulty:"easy"}),{quality:60},patch);
      await load(state);await click('[data-go="status"]');await shot("15-store-"+id);
    }
    await click("#statusDone");await click('[data-finance="store"]');await shot("16-store-account");
    await click("#moneyPersonalTab");await shot("16-personal-account");
    for(const [id,record] of Object.entries(require("./fixtures/v370-endings.json"))){
      let state=G.initial(record.seed,{difficulty:record.difficulty,choiceEdition:370});
      for(const action of record.actions){
        state=G.play(state,action);
        if(state.lastResult.accidentId&&!state.lastResult.accidentPositive&&state.lastResult.incidentCost>0&&!state.lastResult.accidentResponse)state=G.handleAccident(state,"ignore");
        if(state.rescuePending)state=G.resolveRescue(state,G.rescueOptions(state)[0].id);
      }
      assert.equal(G.ending(state).id,id);
      await load(state);await shot("18-ending-"+id);assert.equal(await page.locator("main").getAttribute("data-screen"),"ending");
    }
    console.log("PASS",browserName,width,evidence.length,"screens");
  } finally {await context.close();}
}
(async()=>{
  await new Promise(resolve=>host.listen(0,"127.0.0.1",resolve));
  let browser;
  try{
    browser=await {chromium,webkit}[browserName].launch();
    for(const width of (process.env.WIDTHS||"390,430").split(",").map(Number))await audit(browser,width,process.env.BASE_URL||"http://localhost:"+host.address().port);
  }finally{if(browser)await browser.close();host.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
