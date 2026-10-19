'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const T=require('../scene.js').theater,G=require('../engine.js');
const js=read('scene.js'),html=read('index.html'),css=read('layout-repair-v290.css'),sw=read('sw.js');
assert(!js.includes('class="arm arm-left"'),'no old procedural arms');
assert(!js.includes('class="head"'),'no procedural head');
assert(!js.includes('const hair=boss?'),'remove SVG drawn human anatomy');
assert(!js.includes('const eyes=mood'),'remove procedural eyes');
assert(!js.includes('const mouth=mood'),'remove procedural mouth');
const roles=['you','boss','manager','worker','customer'],moods=['normal','joy','anger','down','worry'];
for(const role of roles)for(const mood of moods){
 const portrait=T.person(role,120,130,mood,'idle',1);
 assert(portrait.includes('class="theater-portrait"'));
 assert(portrait.includes('<use href="./assets/'));
 assert.equal((portrait.match(/<use /g)||[]).length,1);
 assert(!/(<path|<ellipse|<g class="arm|<g class="head)/.test(portrait));
}
for(const file of ['manga-cast-v200.svg','portraits-v171.svg'])assert(read('assets/'+file).includes('<symbol'));
for(const file of ['layout-repair-v290.css']){assert(html.includes(file));assert(sw.includes("'./"+file+"'"));}
assert(sw.includes('okyakusama-v2.9.0-figure-removal-mobile-layout-cache-1'));
assert(css.includes('#officeView.view-panel{display:block!important;overflow-y:auto!important'));
assert(html.includes('office-compact-v290.js'));
assert(sw.includes("'./office-compact-v290.js'"));
assert(require('../office-compact-v290.js').mount);
assert(css.includes('#officeView .office-extra-metrics-v290>summary'));
assert(css.includes('#officeView .store-weather-v250{max-width:100%;display:grid'));
assert(css.includes('#weekScene.week-scene:not([hidden])'));
assert(css.includes('#outcomeDetailsPanel:not([hidden])'));
assert(!css.includes('.arm')&&!css.includes('.hair{'));
const original=G.initial(10),before=JSON.stringify(original);
T.art('product','joy','work');T.person('manager',125,90,'down');
assert.equal(JSON.stringify(original),before,'illustration must not mutate game state');
console.log('PASS v2.9: procedural figures removed, finished SVG portraits only, mobile layouts and PWA wired');
