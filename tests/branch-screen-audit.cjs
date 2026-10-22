const {chromium,webkit}=require('playwright');const assert=require('node:assert/strict');const http=require('http'),fs=require('fs'),path=require('path');
const fontRoot=process.env.AUDIT_FONT_ROOT;
const root=path.resolve(__dirname,'..');
(async()=>{const server=http.createServer((q,r)=>{let f=fontRoot&&q.url.startsWith('/qa-font/')?path.join(fontRoot,q.url.slice(9)):path.join(root,decodeURI(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';try{r.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','svg':'image/svg+xml','webp':'image/webp','png':'image/png'})[f.split('.').pop()]||'application/octet-stream');r.end(fs.readFileSync(f))}catch{r.writeHead(404);r.end()}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const out=path.join(root,'test-artifacts',process.env.AUDIT_PHASE||'branches-'+(process.env.BROWSER||'chromium'));fs.mkdirSync(out,{recursive:true});const results=[];
for(const width of (process.env.WIDTHS||'320,375,390,430,768,1024').split(',').map(Number)){
 const b=await (process.env.BROWSER==='webkit'?webkit:chromium).launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--single-process']}:{headless:true});

 const p=await b.newPage({viewport:{width,height:844},reducedMotion:'reduce'});p.setDefaultTimeout(6000);let errors=[];p.on('pageerror',e=>errors.push(e.message));
 const origin='http://localhost:'+server.address().port;
 const fixtures=require('./build-ui-fixtures.cjs');
 await p.goto(origin);
 const font=async()=>{if(fontRoot)await p.addStyleTag({content:fs.readFileSync(fontRoot+'/400.css','utf8').replaceAll('./files/','/qa-font/files/')+' body,button,svg text{font-family:"Noto Sans JP",sans-serif !important}'});await p.evaluate(()=>document.fonts.ready)};
 const snap=async(name)=>{await p.screenshot({path:path.join(out,`${width}-${name}.png`)});const overflow=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!e.closest('svg')&&(r.right>innerWidth+2||r.left< -2)}).slice(0,20).map(e=>e.id||e.className));results.push({width,name,overflow,errors:[...errors]});fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(results,null,2));assert.deepEqual(overflow,[],name+' horizontal overflow');assert.deepEqual(errors,[],name+' JavaScript errors');};
 const load=async(s)=>{await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),s);await p.reload();await font();await p.locator('#titleResume').click()};
 const drain=async(name)=>{for(let n=0;n<20;n++){
 if(await p.locator('#workingScene').isVisible()){await p.locator('#workingSkip').click()}
 else if(await p.locator('#outcomeScene').isVisible()){await snap(name+'-outcome');await p.locator('#outcomeDetailsToggle').click();await snap(name+'-details');await p.locator('#outcomeNext').click()}
 else if(await p.locator('#newsScene').isVisible()){await snap(name+'-news-'+n);if(await p.locator('#accidentIgnore').isVisible())await p.locator('#accidentIgnore').click();await p.locator('#newsNext').click()}
 else if(await p.locator('#rescueScene').isVisible()){await snap(name+'-rescue');const c=p.locator('#rescueChoices [data-rescue]');if(await c.count())await c.first().click();else await p.locator('#rescueGiveUp').click()}
 else if(await p.locator('#reportScene').isVisible()){await snap(name+'-report');if(await p.locator('#reportContinue').isDisabled())throw Error('Report cannot continue '+name);await p.locator('#reportContinue').click();if(await p.locator('#modal').isVisible())await snap(name+'-ending');return}
 else if(await p.locator('#modal').isVisible()){await snap(name+'-modal');return}
 else await p.waitForTimeout(50);
 }throw Error('Scene did not settle '+name)};
 for(const [name,s] of Object.entries(fixtures)){
 if(name==='campaign'||name==='large-low-reputation')continue;
 await load(s);await drain(name);
 }
 await load(fixtures['large-low-reputation']);await snap('large-low-reputation');await p.locator('#openStatusSheet').click();await snap('large-status');await p.locator('#statusDone').click();
 await load(fixtures.campaign);
 for(let week=2;week<=30;week++){
 await p.locator('#openProposals').click();const count=await p.locator('.action-option').count();if(count!==4)throw Error('Expected four offers at week '+week);
 await p.locator('.action-option:not(:disabled)').first().click();if(week===30)await snap('week30-choice');await p.locator('#advanceButton').click();await drain('campaign-week-'+week);
 const state=await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')));if(state.history.length!==week)throw Error('Wrong history length '+week);if(state.finished&&week<30)throw Error('Campaign ended early '+week);
 }
 // PWA precache and fallback must serve the same UI offline.
 await p.evaluate(async()=>{await navigator.serviceWorker.ready;await new Promise(r=>setTimeout(r,250))});await p.context().setOffline(true);await p.reload();await font();await snap('offline-title');if(!await p.locator('#titleResume').isVisible())throw Error('Offline save missing');await p.locator('#titleResume').click();await snap('offline-finished');await p.context().setOffline(false);
 for(const file of ['cast-gallery-v2100.html','protagonist-preview-v2101.html','art-review-v280.html']){await p.goto(origin+'/'+file);await font();await snap(file.replace('.html',''));}
 console.log(width,'screens',results.filter(r=>r.width===width).length,'errors',errors);await b.close();
}
fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(results,null,2));server.close()})().catch(e=>{console.error(e);process.exit(1)})
