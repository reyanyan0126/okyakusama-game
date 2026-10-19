'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const S=require('../store-scenes-v250.js');
const svg=read('assets/store-scenes-v250.svg'),html=read('index.html'),sw=read('sw.js'),js=read('store-scenes-v250.js'),css=read('store-scenes-v250.css');
assert.equal(Object.keys(S.SCENES).length,4);
for(const id of ['normal','boom','slump','fire']){
 assert(svg.includes('<symbol id="scene-'+id+'"'),id+' art is distinct');
 assert(js.includes('scene-'+id));
}
assert(svg.includes('<symbol id="shop-shell"'),"dedicated supermarket architectural artwork");
assert(!svg.includes('<foreignObject'),"no HTML or CSS person compositing");
assert(!js.includes('localStorage.setItem')&&!js.includes('GameEngine.play')&&!js.includes('Math.random'));
assert(html.includes('store-scenes-v250.css')&&html.includes('store-scenes-v250.js'));
for(const file of ['store-scenes-v250.css','store-scenes-v250.js','assets/store-scenes-v250.svg'])assert(sw.includes("'./"+file+"'"),'offline '+file);
assert(sw.includes("okyakusama-v2.9.0-figure-removal-mobile-layout-cache-1"));
const normal={fire:4,sat:61,rep:58,cash:195000};
assert.equal(S.sceneFor(normal),'normal');
assert.equal(S.sceneFor({...normal,fire:45,sat:90}),'fire','fire precedence');
assert.equal(S.sceneFor({...normal,sat:30}),'slump');
assert.equal(S.sceneFor({...normal,cash:119999}),'slump');
assert.equal(S.sceneFor({...normal,rep:72,sat:85}),'boom');
assert.equal(S.sceneFor({...normal,rep:30,sat:85}),'normal','no misleading boom');
assert(css.includes('prefers-reduced-motion:reduce'));
assert(!css.includes('clip-path:polygon')&&!css.includes('.portrait-hair'));
console.log('PASS v2.5: dynamic 4-scene supermarket illustrations, honest thresholds, offline assets');
