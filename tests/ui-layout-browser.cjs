'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),http=require('http'),fs=require('fs'),path=require('path'),G=require('../engine');
(async()=>{
 const root=path.resolve(__dirname,'..'),name=process.env.BROWSER||'chromium',out=path.join(root,'test-artifacts/layout-'+name);fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((q,r)=>{try{const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);r.setHeader('Content-Type',({js:'text/javascript',css:'text/css',png:'image/png',svg:'image/svg+xml'})[f.split('.').pop()]||'text/html');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const b=await {chromium,webkit}[name].launch();let checks=0;
 try {
 for(const width of [320,375,390,430,768]){
  const c=await b.newContext({viewport:{width,height:844},reducedMotion:'reduce',isMobile:true,hasTouch:true}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.clock.install();p.setDefaultTimeout(10000);await p.goto(process.env.BASE_URL||'http://localhost:'+server.address().port);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
  const fontRoot=path.join(root,'node_modules/@fontsource/noto-sans-jp');const css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(path.join(fontRoot,f.replace(/['"]/g,''))).toString('base64')+')');
  const font=async()=>{await p.addStyleTag({content:css+' body,button{font-family:"Noto Sans JP",sans-serif}'});await p.evaluate(()=>document.fonts.load('15px "Noto Sans JP"',document.body.innerText));};await font();
  const check=async(label,fixed=false)=>{
   await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');
   assert.equal(await p.locator('.action-bar').count(),fixed?1:0,label+' CTA classification');
   if(fixed){
    assert.equal(await p.locator('.nav').count(),0,label+' nav collision');
    const initial=await p.locator('.action-bar button').boundingBox();assert(initial.height>=44);assert(initial.y+initial.height<=844);
    // Simulate a nonzero safe area to test geometry even on engines without device cutouts.
    await p.addStyleTag({content:':root{--safe-bottom:34px}'});
    const safe=await p.locator('.action-bar button').boundingBox();assert(safe.y+safe.height<=844-34);
    const baseline=safe.y;
    await p.locator('main > :first-child').evaluate(el=>{const marker=document.createElement('p');marker.id='qa-last-line';marker.textContent='本文末尾の確認。'.repeat(140);el.append(marker);});
    await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    const after=await p.locator('.action-bar button').boundingBox();assert(Math.abs(after.y-baseline)<1,label+' CTA moved');
    const last=await p.locator('#qa-last-line').boundingBox(),bar=await p.locator('.action-bar').boundingBox();assert(last.y+last.height<=bar.y+1,label+' hidden last line');
    await p.locator('#qa-last-line').evaluate(el=>el.remove());await p.evaluate(()=>window.scrollTo(0,0));
   }
   if(width<768){
    const columns=await p.locator('.store-floor').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).gridTemplateColumns.split(' ').length));assert(columns.every(x=>x===1),label+' mobile columns');
    for(const el of await p.locator('.dialogue:not(.anonymous)').all()){
     const portrait=await el.locator('.portrait').boundingBox(),text=await el.locator(':scope > div').boundingBox();assert(text.y>=portrait.y+portrait.height-1,label+' portrait above text');
    }
   }
   const ratios=await p.locator('.character,.portrait,.guest').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return Math.abs(r.width/r.height-x.naturalWidth/x.naturalHeight)}));assert(ratios.every(x=>x<.02),label+' stretched image');
   assert.deepEqual(errors,[]);await p.screenshot({path:path.join(out,width+'-'+label+'.png'),fullPage:true});checks++;
  };
  const load=async(s)=>{await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),s);await p.reload();await p.locator('#titleResume').click();await font();};
  await check('title');await p.locator('#titleStart').click();await check('contracts');await p.locator('#acceptMarket').click();
  for(let i=1;i<=7;i++){await check('prologue-'+i,true);if(width===390){const text=await p.locator('.panel p').boundingBox();assert(text.y<844-110,'prologue opening visible');}await p.locator('#prologueNext').click();}
 await p.locator('[data-goal]').first().click();
  await check('home');await p.locator('#openProposals').click();await check('choices');await p.locator('[data-sheet=project]').click();await check('investment-choice');await p.locator('dialog form button').click();
  await p.clock.pauseAt(new Date(Date.now()+10000));await p.locator('#advanceButton').click();await check('working-open',true);await p.clock.runFor(1700);await check('working-sales',true);
  const phase=await p.locator('#workingPhase').boundingBox(),actor=await p.locator('#workingActors').boundingBox(),progress=await p.locator('.week-progress').boundingBox();assert(phase.y<actor.y&&actor.y+actor.height<=progress.y+1);
  await p.locator('#workingSkip').click();await check('outcome',true);
  for(let i=0;i<20;i++){
   if(await p.locator('#outcomeNext').count())await p.locator('#outcomeNext').click();
   else if(await p.locator('#newsNext').count()){await check('news-'+i,true);await p.locator('#newsNext').click();}
   else if(await p.locator('#accidentIgnore').count()){await check('accident',false);await p.locator('#accidentIgnore').click();}
   else if(await p.locator('#reportContinue').count()){await check('report',true);break;}
   else break;
  }
  // The two reported iPhone screens come from successive weeks of one real run.
  const failed = G.play(G.initial(2), "shrink");
  assert.equal(failed.lastResult.performanceTier, "failure");
  failed.presentation = {week:1,stage:"outcome",newsIndex:0};
  await load(failed);
  assert.deepEqual(await p.locator(".impact-grid dd").allTextContents(), ["-4","-4","+9"]);
  assert.equal(await p.locator("main details").count(),0);
  const visibleAbove = async (selector, footer) => {
    const item = await p.locator(selector).boundingBox();
    const end = await p.locator(footer).boundingBox();
    assert(item && item.y >= 0 && item.y + item.height <= end.y, selector + " inside first viewport");
  };
  await visibleAbove(".result-summary .impact-grid", ".action-bar");
  await p.screenshot({path:path.join(out,width+"-shrink-failure.png")});
  failed.presentation = null;
  await load(failed);
  assert.equal(await p.locator("main figure").count(),1);
  assert((await p.locator(".brief-note").innerText()).includes("30人"));
  await visibleAbove("#openProposals", ".nav");
  await p.screenshot({path:path.join(out,width+"-register-home.png")});
  await p.locator("#openProposals").click();
  assert.equal(await p.locator("[data-choice]").count(), 4);
  assert.equal(await p.locator("main details,dialog[open]").count(),0);
  await p.screenshot({path:path.join(out,width+"-register-options.png")});
  const s=G.initial(12,{difficulty:'easy'}),played=G.play(s,G.weeklyOffers(s)[0].id);
  Object.assign(played.lastResult,{accidentId:'complaint',accidentTitle:'苦情への対応',accidentText:'商品の説明を求められています。',accidentPositive:false,incidentCost:20000,accidentResponse:null});played.presentation={week:1,stage:'news',newsIndex:0};await load(played);
  for(let i=0;i<15&&await p.locator('#newsNext').count();i++)await p.locator('#newsNext').click();await check('accident-choice',false);assert.equal(await p.locator('#accidentIgnore').count(),1);
  // All full-body source pixels share a ground baseline; widths retain body differences.
  await p.evaluate(()=>{const main=document.querySelector('main');main.dataset.cta='false';main.dataset.nav='false';main.innerHTML='<div class="stack" id="scale-check">'+['you','boss','manager','worker','customer','devil'].map(r=>PixelUI.character(r,'normal')).join('')+'</div>';});
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ui/manifest.json')));
  await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
  const dims=await p.locator('.character').evaluateAll(xs=>xs.map(x=>({height:x.getBoundingClientRect().height,width:x.getBoundingClientRect().width,src:x.getAttribute('src')})));
  for(const d of dims){const a=manifest.assets.find(a=>a.output===d.src);assert.equal(a.alphaBounds[3],a.size[1]);assert(Math.abs(d.height-144)<.02);}
  await check('scale-main');await c.close();console.log('PASS layout',name,width,'CTA stability, safe area, last line, choices, vertical flow, ratios and ground');
 }
 // Same-frame comparison includes every main expression, all 40 guests and 16 special heads.
 const p=await b.newPage({viewport:{width:1080,height:900},reducedMotion:'reduce'});await p.goto(process.env.BASE_URL||'http://localhost:'+server.address().port);
 for(const group of ['body','face','guest']){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ui/manifest.json'))).assets.filter(x=>x.kind===group);
  await p.evaluate(({assets,group})=>{document.querySelector('main').outerHTML='<main style="max-width:1080px;padding:16px"><h1>Same-frame '+group+'</h1><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px">'+assets.map(a=>'<figure style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border-bottom:1px solid #315c49"><img class="'+(group==='body'?'character':group==='face'?'portrait':'guest')+'" src="'+a.output+'"><figcaption style="font:11px sans-serif">'+a.output.split('/').pop()+'</figcaption></figure>').join('')+'</div></main>';},{assets:manifest,group});
  await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));await p.screenshot({path:path.join(out,'comparison-'+group+'.png'),fullPage:true});checks++;
 }
 console.log('PASS',checks,'layout screens and comparison sheets');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
