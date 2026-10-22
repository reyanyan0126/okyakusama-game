'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js'),T=require('../scene.js').theater;
const pro=fs.readFileSync(path.join(__dirname,'../assets/prologue-v160.svg'),'utf8');
const inc=fs.readFileSync(path.join(__dirname,'../assets/incidents-v160.svg'),'utf8');
const policies=fs.readFileSync(path.join(__dirname,'../assets/policies-v160.svg'),'utf8');
const B=require('../assets/storyboards-v150.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
assert.equal((pro.match(/<symbol id="prologue-/g)||[]).length,7);
assert.equal((inc.match(/<symbol id="incident-/g)||[]).length,21);
assert.equal((policies.match(/<symbol id="policy-/g)||[]).length,156);
const nativeIds=['raise','lower','shrink','cheap','quality','staff','explain','sale','points','pop','tasting','local','restorestaff','apology','recall','blame','loyalty','stamp','audit','maintenance','loan','airtax','photo','ceocut','bills','apologybot'];
for(const id of nativeIds){
 assert.equal(B.family(id),id,'dedicated family '+id);
 assert.equal(B.captions(id).length,3,'three story captions '+id);
 const art=new Set();
 for(const frame of [0,1,2])art.add(B.symbol(id,'work',frame));
 for(const tier of ['failure','success','great'])art.add(B.symbol(id,'result',tier));
 assert.equal(art.size,6);
 for(const symbol of art)assert(policies.includes('id="'+symbol.split('#')[1]+'"'),symbol);
}

for(let n=1;n<=7;n++){
 assert(pro.includes('id="prologue-'+n+'"'));
 assert(app.includes("'./assets/prologue-v160.svg#prologue-'+illustrationStep"));
}
assert(html.includes('./assets/prologue-v160.svg#prologue-1'));
const base=G.initial(77338);
for(const item of G.ACCIDENTS){
 const id='incident-'+item.id;
 assert(inc.includes('id="'+id+'"'),id);
 const h={accidentId:item.id,accidentTitle:item.title,accidentPositive:!!item.positive,incidentCost:item.cost,storyEcho:[]};
 assert(T.news(h,G).some(n=>n.visualId===item.id),'news art mapping '+item.id);
}
for(const special of ['fire','memory','boycott','devil',...G.STORIES.EPISODES.map(e=>'echo-'+e.id)])assert(inc.includes('id="incident-'+special+'"'),special);
const multiple=T.news({fireHit:true,memoryEvent:true,accidentId:'freezer',accidentTitle:G.ACCIDENTS.find(a=>a.id==='freezer').title,storyEcho:[{id:'staff',text:'回想'}],boycottHit:true,devilPayment:1000},G);
assert.equal(multiple.length,6);
assert(multiple.every(x=>inc.includes('id="incident-'+x.visualId+'"')));
assert(sw.includes('assets/prologue-v160.svg'));
assert(sw.includes('assets/incidents-v160.svg'));
assert(sw.includes('assets/policies-v160.svg'));
assert(app.includes('class="news-symbol"'),"news uses a single symbol, not duplicated actors");
console.log('PASS v1.6.0: seven story drawings, 11 accident drawings, 10 distinct news/echo illustrations, all story references, offline cache');
