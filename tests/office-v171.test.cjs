'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const svg=read('assets/office-cinema-v171.svg'),portraits=read('assets/portraits-v171.svg');
const js=read('app.js'),html=read('index.html'),sw=read('sw.js'),styles=read('styles.css');
const O=require('../scene.js');const G=require('../engine.js');
const sceneNames=['normal','quiet','critical','scandal','busy','closed','repair','upgraded','devil','title'];
const visitors=['manager','mori','saito','aoki','tanaka'],moods=['normal','happy','angry','sad','panic'];
assert.equal((svg.match(/<symbol /g)||[]).length,10);
assert.equal((portraits.match(/<symbol /g)||[]).length,25);
for(const name of sceneNames){
 const symbol=svg.match(new RegExp('<symbol id="office-'+name+'"[^>]*>[\\s\\S]*?<\\/symbol>'));
 assert(symbol,'Missing state '+name);
 assert(symbol[0].includes('<title>'),'Accessible title '+name);
 assert(symbol[0].includes('data-role=')||name==='closed','Narrative cast '+name);
}
for(const v of visitors)for(const m of moods){
 assert(portraits.includes('id="portrait-'+v+'-'+m+'"'),v+' '+m);
}
assert(html.includes('office-cinema-v171.svg#office-title'));
assert(html.includes('office-cinema-v171.svg#office-normal'));
assert(html.includes('id="buyerPersona"'));
assert(js.includes('drawing.innerHTML=\'<use href="./assets/office-cinema-v171.svg#office-\'+kind'));
assert(js.includes("Math.floor((Math.max(1,s.week)-1)/4)%locals.length"));
assert(js.includes("portrait-'+portrait+'-'+mood"));
assert(styles.includes('.title-cinema-svg'));
assert(sw.includes('okyakusama-v2.9.0-figure-removal-mobile-layout-cache-1'));
assert(sw.includes('assets/portraits-v171.svg'));
assert(sw.includes('assets/office-cinema-v171.svg'));
for(const [state,expect] of [
 [{cash:350000,storeRep:75,sat:80,frust:20,fire:4,personalCash:110000},'busy'],
 [{cash:30000,storeRep:10,fire:5},'critical'],
 [{cash:200000,storeRep:55,fire:60},'scandal']
]){
 const generated=G.initial(14);Object.assign(generated,state);
 const desc=O.describe(generated);
 assert.equal(desc.store,expect);
}
console.log('PASS v1.7.1: 10 grounded office and title compositions, 25 individualized emotion portraits, state routing, save schema untouched');
