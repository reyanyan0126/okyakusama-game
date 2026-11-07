'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),http=require('http'),fs=require('fs'),path=require('path'),G=require('../engine');
(async()=>{
 const server=http.createServer((q,r)=>{try{const file=path.join(__dirname,'..',q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);r.setHeader('Content-Type',({js:'text/javascript',css:'text/css',png:'image/png',svg:'image/svg+xml'})[file.split('.').pop()]||'text/html');r.end(fs.readFileSync(file));}catch{r.writeHead(404);r.end();}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const name=process.env.BROWSER||'chromium',b=await {chromium,webkit}[name].launch(),out='test-artifacts/consistency-'+name;fs.mkdirSync(out,{recursive:true});
 try{for(const width of [320,375,390,430]){const c=await b.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);await p.goto(process.env.BASE_URL||'http://localhost:'+server.address().port);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
 const check=async(label)=>{const fontRoot=path.join(__dirname,'../node_modules/@fontsource/noto-sans-jp');const css=fs.readFileSync(path.join(fontRoot,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(path.join(fontRoot,f.replace(/['"]/g,''))).toString('base64')+')');await p.addStyleTag({content:css+' body,button{font-family:"Noto Sans JP",sans-serif}'});await p.evaluate(()=>document.fonts.load('15px "Noto Sans JP"',document.body.innerText));await p.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label);assert.equal(await p.locator('img[src*="work-import/scenes"]').count(),0);
 const bad=await p.locator('.dialogue').evaluateAll(xs=>xs.filter(el=>{const r=el.dataset.role,img=el.querySelector('img');if(r==='anonymous')return !!img;return !img||!img.naturalWidth;} ).length);assert.equal(bad,0,label);
 assert.equal(await p.locator('.actor-task:not([data-action]),.guest-task:not([data-action])').count(),0);
 await p.screenshot({path:`${out}/${width}-${label}.png`,fullPage:true});};
 for(const [id,change]of Object.entries({normal:{},queue:{staff:30},fire:{fire:85},cash:{cash:20000},busy:{sat:95,storeRep:95}})){
   const state=Object.assign(G.initial(12,{difficulty:'easy'}),{quality:60},change);
   await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),state);
   await p.reload();await p.locator('#titleResume').click();await check('home-'+id);
   const button=await p.locator('#openProposals').boundingBox();assert(button.y+button.height<=844);
   await p.locator('[data-go="status"]').click();
   assert.equal(await p.locator('figure.composed-scene').getAttribute('data-scene'),id);
   await check('store-'+id);
 }
 assert.deepEqual(errors,[]);await c.close();console.log('PASS',name,width,'5 distinct store conditions and corresponding weekly problems, portraits, actions, CTA and overflow');}
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
