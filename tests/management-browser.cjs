'use strict';
const {chromium,webkit}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),G=require('../engine');
const root=path.resolve(__dirname,'..');
const finals=Object.entries(require('./fixtures/v310-endings.json')).map(([id,r])=>{let s=G.initial(r.seed,{difficulty:r.difficulty});for(const a of r.actions){s=G.play(s,a);if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);}return {id,s};});
(async()=>{
 let disconnected=false;
 const server=http.createServer((q,r)=>{if(disconnected){q.socket.destroy();return;}const f=path.join(root,q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);try{r.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.webmanifest')?'application/manifest+json':'text/html');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const b=await (process.env.BROWSER==='webkit'?webkit:chromium).launch();
 try{for(const width of [320,390,1024]){
 const c=await b.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),p=await c.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(8000);
 await p.goto('http://localhost:'+server.address().port);await p.locator('#titleStart').click();
 for(const difficulty of ['easy','hard','normal']){await p.locator('#difficulty').selectOption(difficulty);assert((await p.locator('main').innerText()).includes(G.MANAGEMENT.DIFFICULTIES[difficulty].target.toLocaleString('ja-JP')));}
 await p.locator('#difficulty').selectOption('easy');await p.locator('#acceptMarket').click();for(let i=0;i<7;i++)await p.locator('#prologueNext').click();
 const initial=await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')));assert.equal(initial.difficulty,'easy');assert.equal(initial.cash,300000);
 await p.locator('[data-go="status"]').click();assert((await p.locator('main').innerText()).includes('士気'));assert((await p.locator('main').innerText()).includes('離職率'));
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#statusDone').click();await p.locator('[data-go="records"]').click();await p.locator('summary').last().click();
 // Failed imports must preserve existing disk and in-memory state.
 await p.locator('#importSave').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await p.waitForFunction(()=>document.getElementById('notice').textContent.includes('復元できません'));
 assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1'))),initial);
 await p.evaluate(()=>{window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});
 await p.locator('#importSave').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(finals[0].s))});await p.waitForFunction(()=>document.getElementById('notice').textContent.includes('quota'));
 await p.evaluate(()=>{Storage.prototype.setItem=window.realSet;});await p.locator('[data-go="home"]').first().click();assert.equal(await p.locator('.week').innerText(),'第1週 / 30');
 for(const {id,s} of finals){await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),s);await p.reload();await p.locator('#titleResume').click();assert((await p.locator('main').innerText()).includes(G.MANAGEMENT.ENDINGS[id][0]));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.equal((await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.achievements.v1')))).length,8);
 await p.reload();await p.locator('#titleResume').click();assert.equal((await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.achievements.v1')))).length,8);
 await p.locator('[data-go="records"]').click();await p.getByText('売上・利益・評判の推移',{exact:true}).click();assert.equal(await p.locator('svg.chart').count(),4);assert.deepEqual(errors,[]);
 const css=fs.readFileSync(path.join(root,'node_modules/@fontsource/noto-sans-jp/400.css'),'utf8').replace(/url\(([^)]+)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(path.join(root,'node_modules/@fontsource/noto-sans-jp',f.replace(/[\"\']/g,''))).toString('base64')+')');await p.addStyleTag({content:css+' body,button,select,svg text{font-family:"Noto Sans JP",sans-serif}'});await p.evaluate(()=>document.fonts.ready);
 fs.mkdirSync(path.join(root,'test-artifacts/management'),{recursive:true});await p.screenshot({path:path.join(root,`test-artifacts/management/${process.env.BROWSER||'chromium'}-${width}.png`),fullPage:true});
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller);disconnected=true;await p.reload();await p.locator('#titleResume').click();assert((await p.locator('main').innerText()).includes(G.MANAGEMENT.ENDINGS[finals.at(-1).id][0]));assert.deepEqual(errors,[]);
 disconnected=false;await c.close();console.log('PASS management',process.env.BROWSER||'chromium',width,'difficulty, workforce, import failure preservation, eight endings, achievements, charts');
 }}finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
