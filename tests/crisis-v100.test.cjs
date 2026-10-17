'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
for(const cfg of [
 {actionId:'shrink',actionName:'「お手軽サイズ」への変更',memoryEvent:false,expected:'recall'},
 {actionId:'staff',actionName:'人件費削減',memoryEvent:false,expected:'explain'},
 {actionId:'photo',actionName:'広告の弁当だけ増量',memoryEvent:true,expected:'recall'}
]){
 const s=G.initial(12345);
 s.fire=65;
 s.lastResult={fireHit:!cfg.memoryEvent,memoryEvent:cfg.memoryEvent,actionId:cfg.actionId,actionName:cfg.actionName,week:0};
 const b=G.weeklyBrief(s);
 assert.equal(b.id,'crisis');
 assert.ok(b.title.includes(cfg.actionName)||cfg.memoryEvent);
 const offers=G.weeklyOffers(s);
 assert.equal(offers.length,3);
 assert.ok(offers.some(x=>x.id===cfg.expected));
 assert.ok(offers.every(x=>['apology','recall','explain','blame'].includes(x.id)));
 const action=offers[0].id;
 const after=G.play(s,action);
 const h=after.lastResult;
 assert.equal(h.scenarioId,'crisis');
 assert.ok(h.crisisResponse.includes(cfg.actionName)||cfg.memoryEvent);
 assert.ok(h.crisisResponse.includes('炎上度')&&h.crisisResponse.includes('評判'));
 assert.equal(after.history.length,1);
 assert.equal(G.validateSaved(after).week,2);
}
// Positive occurrences are never treated as damages that require compensation.
let positive=0;
for(let seed=1;seed<=250;seed++){
 let s=G.initial(seed);
 while(!s.finished){
  const action=G.weeklyOffers(s)[seed%s.week%3||0].id;
  s=G.play(s,action);
  if(s.lastResult.accidentPositive){
   positive++;
   assert.equal(s.lastResult.accidentResponse,'not_needed');
   assert.throws(()=>G.handleAccident(s,'repair'));
  }
  if(s.rescuePending){const choices=G.rescueOptions(s);s=G.resolveRescue(s,choices.length?choices[0].id:'giveup');}
  if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse){s=G.handleAccident(s,'ignore');}
 }
}
assert(positive>0);
console.log('PASS: contextual 3-way crisis response, exact decision impact record, positive events',positive);