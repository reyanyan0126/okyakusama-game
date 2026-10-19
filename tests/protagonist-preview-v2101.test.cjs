'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const QA=require('../scripts/audit-cast-art-v270.cjs');
const load=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const html=load('protagonist-preview-v2101.html'),index=load('index.html'),gallery=load('cast-gallery-v2100.html'),sw=load('sw.js');
assert(index.includes('href="./protagonist-preview-v2101.html"'),'title must link to portrait preview');
assert(gallery.includes('href="./protagonist-preview-v2101.html"'),'gallery must link to portrait preview');
assert(sw.includes("'./protagonist-preview-v2101.html'"),'preview must be available offline');
assert(html.includes('制作候補')&&html.includes('正式承認はまだ'),'preview must not imply published approval');
const matches=[...html.matchAll(/src="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/g)];
assert.equal(matches.length,5,'five original candidate image payloads');
for(let i=0;i<5;i++){
 const name=['normal','happy','angry','sad','panic'][i];
 assert(html.includes('alt="主人公・'),'alt text missing');
 const data=Buffer.from(matches[i][1],'base64');
 assert(data.length>10000&&data.length<6291456,'candidate size invalid: '+name);
 const dims=QA.dimsWebp(data);
 assert.equal(dims.width,1024,'candidate width '+name);
 assert.equal(dims.height,1280,'candidate height '+name);
 assert.equal(dims.alpha,true,'candidate alpha '+name);
 assert(html.includes('you-'+name+'.webp')===false,'image must be inline, without external path dependency');
}
const manifest=JSON.parse(load('assets/approved-cast-v270/art-manifest.json'));
assert.equal(manifest.status,'draft');
assert.deepEqual(manifest.approvedAssets,[],'candidate art must not be marked as production art');
console.log('PASS v2.10.1 preview: five embedded 1024x1280 alpha WebP, linked title/gallery, offline caching, release still unapproved');
