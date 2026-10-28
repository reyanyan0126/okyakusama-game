'use strict';
const {chromium,webkit}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const G=require('../engine'),F=require('../forecast');
(async()=>{
 const root=path.resolve(__dirname,'..'),browserName=process.env.BROWSER||'chromium';
 const server=http.createServer((q,r)=>{
  try{const f=path.join(root,decodeURI(q.url.split('?')[0]).replace(/\/$/,'/index.html'));
   r.setHeader('Content-Type',({js:'text/javascript',css:'text/css',svg:'image/svg+xml',html:'text/html',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');r.end(fs.readFileSync(f));
  }catch{r.writeHead(404);r.end();}
 }).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 let b;
 try{
  b=await ({chromium,webkit})[browserName].launch();
  const base='http://localhost:'+server.address().port,out='test-artifacts/v320-'+browserName;fs.mkdirSync(out,{recursive:true});
  for(const width of [320,390,430,1024]){
   const c=await b.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];
   p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
   const s=G.initial(42,{difficulty:'easy'}),raw=JSON.stringify(s);
   await p.evaluate(raw=>localStorage.setItem('okyakusama.save.v1',raw),raw);await p.reload();await p.locator('#titleResume').click();await p.locator('#openProposals').click();
   const first=p.locator('[data-choice]').first();await first.click();const id=await first.getAttribute('data-choice');
   const expected=F.estimate(G,s,id);await p.getByText('収支の見通し',{exact:true}).click();
   assert((await p.locator('main').innerText()).includes(expected.profit.mean.toLocaleString('ja-JP')+'円'));
   await p.locator('[data-choice]').last().click();await first.click();
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')).rng),s.rng);
   await p.locator('#advanceButton').click();await p.locator('#workingSkip').click();
   let saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')));
   assert.deepEqual(saved.presentation.forecast,expected);assert.deepEqual(saved.lastResult,G.play(s,id).lastResult);
   // Resume the real completed result directly at settlement after handling any accident.
   if(saved.lastResult.accidentId&&!saved.lastResult.accidentPositive&&saved.lastResult.incidentCost>0&&!saved.lastResult.accidentResponse)saved=G.handleAccident(saved,'ignore');
   if(saved.rescuePending)saved=G.resolveRescue(saved,G.rescueOptions(saved)[0].id);
   saved.presentation={...saved.presentation,stage:'report'};
   await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),saved);await p.reload();await p.locator('#titleResume').click();
   await p.getByText('予測と実績',{exact:true}).click();assert((await p.locator('main').innerText()).includes('営業利益・実績'));
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.screenshot({path:out+'/forecast-'+width+'.png',fullPage:true});
   const stressed=G.initial(7,{difficulty:'normal'});stressed.workforce.fatigue=90;stressed.cash=20000;
   await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),stressed);await p.reload();await p.locator('#titleResume').click();
   assert.equal(await p.locator('.dialogue[data-role="boss"]').getAttribute('data-mood'),'anxious');
   await p.locator('[data-go="status"]').click();assert.equal(await p.locator('.cast-member[data-role="worker"]').getAttribute('data-mood'),'anxious');
   assert.deepEqual(errors,[]);await c.close();console.log('PASS forecast UI/persistence/no reroll/state priority/overflow',browserName,width);
  }
  for(const reduced of [false,true]){
   const c=await b.newContext({viewport:{width:1024,height:1000},reducedMotion:reduced?'reduce':'no-preference'}),p=await c.newPage();
   await p.goto(base+'/assets/pixel/boss-normal-speaking.svg');
   const animation=await p.evaluate(async()=>{
    const blink=document.querySelector('.blink'),talk=document.querySelector('.talk');
    const results={blink:getComputedStyle(blink).animationName,talk:getComputedStyle(talk).animationName};
    for(const a of document.getAnimations()){a.pause();a.currentTime=a.effect.target===blink?5500:350;}
    await new Promise(requestAnimationFrame);results.blinkOpacity=getComputedStyle(blink).opacity;results.talkOpacity=getComputedStyle(talk).opacity;return results;
   });
   assert.equal(animation.blink,reduced?'none':'blink');assert.equal(animation.talk,reduced?'none':'talk');
   assert.equal(animation.blinkOpacity,reduced?'0':'1');assert.equal(animation.talkOpacity,reduced?'0':'1');
   await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
   await p.evaluate(()=>{document.querySelector('main').innerHTML='<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px">'+['you','boss','manager','worker','customer','devil'].map(r=>Object.keys(PixelUI.moods).map(m=>PixelUI.character(r,m)).join('')).join('')+'</div>';document.querySelector('main').style.maxWidth='1024px';});
   await p.addStyleTag({url:'/node_modules/@fontsource/noto-sans-jp/400.css'});await p.addStyleTag({content:'body{font-family:"Noto Sans JP",sans-serif}'});await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
   assert.equal(await p.locator('.character').count(),48);
   const active=await p.locator('.character').first().evaluate(e=>getComputedStyle(e).animationName);assert.equal(active,reduced?'none':'cast-breathe');
   if(reduced)await p.screenshot({path:out+'/cast-48.png',fullPage:true});
   await c.close();console.log('PASS 48 decoded sprites, SVG blink/mouth frames and reduced motion',browserName,reduced);
  }
 }finally{if(b)await b.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
