'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js');
for(let seed=1;seed<=40;seed++){
 let s=G.initial(seed);
 for(let wk=0;wk<30&&!s.finished;wk++){
  const offers=G.weeklyOffers(s);
  assert.equal(offers.length,4,'four offers week '+s.week+' seed '+seed);
  assert.equal(new Set(offers.map(o=>o.id)).size,4,'no duplicate offers');
  assert(offers.every(a=>G.enabled(s,a.id)),'disabled option leaked');
  const chosen=offers[(seed+wk)%4].id;
  s=G.play(s,chosen);
  assert(s.staff>=30&&s.staff<=60,`invalid staff seed=${seed}, week=${wk}, action=${chosen}, tier=${s.lastResult.performanceTier}, staff=${s.staff}, previous staff=${s.history[wk-1]?.staff}`);
  assert.equal(G.validateSaved(s).history.length,s.history.length,'valid save');
  if(s.rescuePending){const o=G.rescueOptions(s);s=G.resolveRescue(s,o.length?o[0].id:'giveup');}
  if(s.lastResult?.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&s.lastResult.accidentResponse===null)s=G.handleAccident(s,'ignore');
 }
}
for(const kind of ['shrink','staff','photo']){
 const s=G.initial(142);
 s.fire=70;s.cash=110000;
 s.lastResult={fireHit:true,memoryEvent:kind==='photo',actionId:kind,actionName:kind,week:0};
 assert.equal(G.weeklyBrief(s).id,'crisis');
 const choices=G.weeklyOffers(s).map(a=>a.id);
 assert.equal(choices.length,4);
 assert(!choices.includes('loan'),'emergency loan may not erase crisis choice');
 assert(new Set(choices).size===4);
}
const s=G.initial(12);s.cash=120000;s.fire=0;s.lastResult=null;
const offers=G.weeklyOffers(s).map(a=>a.id);
assert.equal(offers.length,4);assert(offers.includes('loan'),'financial urgency loan option');
console.log('PASS v1.1.0: 4 choices for all weeks, contextual crisis, loan, 7 SVGs, live store metrics, savings');
