'use strict';
// Check a previously installed cache on the SAME origin upgrades without losing a save.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http'),cp=require('node:child_process');
const G=require('../engine.js'),root=path.resolve(__dirname,'..');
const gitArgs=['-c','safe.directory='+root];
// Fail before starting the server if the historical source cannot be read.
cp.execFileSync('git',[...gitArgs,'cat-file','-e','70cc84955fed6f5df7fb51a04c1e3b7def3c0d73:index.html'],{cwd:root});
const deadline=setTimeout(()=>{console.error('PWA upgrade did not complete within 60 seconds');process.exit(1);},60000);
(async()=>{let old=true;
const server=http.createServer((q,r)=>{const file=q.url.split('?')[0];r.setHeader('Cache-Control','no-store');
 if(old){
  try{const relative=file==='/'?'index.html':file.slice(1);if(relative.includes('..'))throw Error('bad path');
   r.setHeader('Content-Type',({'js':'text/javascript','html':'text/html','css':'text/css','svg':'image/svg+xml','png':'image/png','webmanifest':'application/manifest+json'})[relative.split('.').pop()]||'application/octet-stream');
   r.end(cp.execFileSync('git',[...gitArgs,'show','70cc84955fed6f5df7fb51a04c1e3b7def3c0d73:'+relative],{cwd:root,maxBuffer:4000000}));
  }catch{r.writeHead(404);r.end();}return;
 }
 try{const f=path.join(root,file==='/'?'index.html':file);r.setHeader('Content-Type',({'js':'text/javascript','html':'text/html','css':'text/css','svg':'image/svg+xml','png':'image/png','webmanifest':'application/manifest+json'})[f.split('.').pop()]||'application/octet-stream');r.end(fs.readFileSync(f));}catch{r.writeHead(404);r.end();}
}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const b=await ({chromium,webkit})[process.env.BROWSER||'chromium'].launch(),p=await b.newPage();p.setDefaultTimeout(20000);
await p.goto('http://localhost:'+server.address().port+'/');await p.evaluate(async()=>{await navigator.serviceWorker.ready;});await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
const save=G.play(G.initial(51),G.weeklyOffers(G.initial(51))[0].id);save.presentation={week:1,stage:'outcome',newsIndex:0};await p.evaluate(s=>localStorage.setItem('okyakusama.save.v1',JSON.stringify(s)),save);
old=false;
await p.evaluate(async()=>{
 const previous=navigator.serviceWorker.controller;
 const changed=new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
 const registration=await navigator.serviceWorker.getRegistration();
 await registration.update();
 if(navigator.serviceWorker.controller===previous)await changed;
});
const cacheNames=await p.evaluate(async()=>{for(let i=0;i<100;i++){const keys=await caches.keys();if(keys.some(n=>n.startsWith('okyakusama-v3.2.0'))&&!keys.includes('okyakusama-v3.1.0-management-cache-10'))return keys;await new Promise(r=>setTimeout(r,50));}return caches.keys();});
assert(cacheNames.some(n=>n.startsWith('okyakusama-v3.2.0')));
assert(!cacheNames.includes('okyakusama-v3.1.0-management-cache-10'));
await p.reload();await p.locator('#titleResume').waitFor();
assert((await p.locator('body').innerText()).includes('PIXEL EDITION'));
assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1'))),save);await p.locator('#titleResume').click();await p.locator('#outcomeNext').waitFor();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('okyakusama.save.v1')).rng),save.rng);
console.log('PASS actual v3.1.0 baseline installed cache upgrade; exact save preservation; pending outcome resumes without reroll');await b.close();server.close();clearTimeout(deadline);})().catch(e=>{console.error(e);process.exit(1)});
