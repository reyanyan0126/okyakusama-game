'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('art-review-v280.html'),js=read('art-review-v280.js'),css=read('art-review-v280.css');
const data=JSON.parse(read('assets/approved-cast-v270/art-manifest.json'));
for(const id of ['assetCount','approvedCount','candidateFiles','portraitGrid','characterFilter','exportReview','uploadStatus']){
 assert(html.includes('id="'+id+'"'),id+' must exist');
}
assert(js.includes("const ROLES=[")&&js.includes("const MOODS=[")&&js.includes("const FLAGS=["));
assert.deepEqual(data.roles,['you','boss','manager','worker','customer']);
assert.deepEqual(data.moods,['normal','happy','angry','sad','panic']);
assert(js.includes("window.PortraitReviewV280=API"));
assert(js.includes("img.naturalWidth")&&js.includes('MAX_BYTES=6*1024*1024'));
assert(js.includes('Math.abs(ratio-0.8)>0.06'));
assert(js.includes('imageValid:true')===false,'image approval requires runtime dimension check');
assert(js.includes("reviewOnly:true"),'exports remain proposals, not publication state');
assert(!js.includes('fetch(')&&!js.includes('XMLHttpRequest')&&!js.includes('navigator.sendBeacon'),'never upload user previews');
assert(!js.includes('localStorage')&&!js.includes('GameEngine.play('),'never touch games or saves');
assert(!js.includes('innerHTML'),'render metadata with textContent only');
assert(css.includes('min-height:44px')&&css.includes('prefers-reduced-motion:reduce'));
console.log('PASS v2.8: 25-slot asset review UI, manual approvals, no network upload, no game-state changes');
