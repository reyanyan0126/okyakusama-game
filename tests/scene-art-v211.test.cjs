'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const html=read('index.html'),js=read('scene-art-v211.js'),css=read('scene-art-v211.css'),sw=read('sw.js');
for(const file of ['scene-art-v211.js','scene-art-v211.css']){assert(html.includes(file),'document includes '+file);assert(sw.includes("'./"+file+"'"),'offline caches '+file);}
assert(sw.includes('okyakusama-v2.4.0-review-preview'));
for(const scene of ['cover','contract','voice','records','decision','ledger','status','money','rescue']){
 assert(js.includes(' '+scene+':frame('),'unique artwork '+scene);
 assert(css.includes('.scene-v211-'+scene),'scene style '+scene);
}
assert(js.includes("office.querySelectorAll('.new-office-person')"));
assert(js.includes("office.classList.add('scene-v211-office')"));
assert(js.includes("insertAfter(q('#statusSheet .status-head')"));
assert(js.includes("insertAfter(q('#moneySheet .money-sheet-top')"));
assert(js.includes("insertAfter(q('#rescueScene .rescue-kicker')"));
assert(js.includes("new MutationObserver(update).observe(counter"));
assert(!js.includes('localStorage')&&!js.includes('GameEngine')&&!js.includes('Math.random'),'visuals cannot alter saves, engine, or randomness');
assert(!js.includes("q('#outcomeScene'"),'preserve 3-panel result DOM');
assert(!css.includes('background-image:url('),'no low resolution hero bitmaps');
assert(css.includes('#outcomeScene .theater-detail-toggle'));
console.log('PASS v2.1.1: nine distinct scenes, seven chapter props, details accessibility, offline cache and presentation only');
