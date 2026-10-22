'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const events={},cachedShell={body:'installed HTML'},cachedScript={body:'installed JS'};
let network=0;
const cache={match:async request=>{
 const url=typeof request==='string'?request:request.url;
 if(url==='./index.html'||url==='https://game.test/index.html')return cachedShell;
 if(url==='https://game.test/app.js')return cachedScript;
}};
const context={self:{location:{origin:'https://game.test'},addEventListener:(name,fn)=>events[name]=fn},caches:{open:async()=>cache},URL,fetch:async()=>{network++;throw Error('offline')}};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../sw.js'),'utf8'),context);
async function request(url,mode='cors'){
 let result;events.fetch({request:{url,method:'GET',mode},respondWith:p=>result=p});return result;
}
(async()=>{
 assert.equal(await request('https://game.test/index.html','navigate'),cachedShell);
 assert.equal(await request('https://game.test/app.js'),cachedScript);
 assert.equal(network,0,'Installed assets must not wait for a failed network request');
 assert.equal(await request('https://game.test/other','navigate'),cachedShell);
 await assert.rejects(request('https://game.test/missing.png'),'Never return HTML as an image');
 assert.equal(await request('https://external.test/image.png'),undefined,'External requests are untouched');
 console.log('PASS offline installed shell/scripts, navigation fallback and missing-asset semantics');
})().catch(e=>{console.error(e);process.exitCode=1});
