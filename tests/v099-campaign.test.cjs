'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
assert.equal(G.MAX_WEEKS,30);
assert.equal(G.LEGACY_WEEKS,12);
assert.equal(G.CONTRACT.profit,2550000);
assert.equal(G.initial(100).campaignWeeks,30);
assert.deepEqual(G.PERSONAL.dueWeeks,[4,8,12,16,20,24,28]);
let positive=0,negative=0,randomTurns=0,complete=0,failed=0,rescued=0,finalWeek=0;
for(let seed=1;seed<=1100;seed++){
 let s=G.initial(seed*17),seen=[];
 while(!s.finished){
  const offers=G.weeklyOffers(s);
  assert.equal(offers.length,4,`seed=${seed} week=${s.week} brief=${G.weeklyBrief(s).id} offers=${offers.map(a=>a.id)}`);
  assert.equal(new Set(offers.map(x=>x.id)).size,4);
  const before=s.cash;
  const h0=s;
  s=G.play(s,offers[(s.week+seed)%3].id);
  const h=s.lastResult;
  assert.equal(s.cash,h.cashAfter);
  assert.equal(s.history.length,s.week-1);
  assert.equal(h.deltaCash,s.cash-before);
  assert.equal(s.personalCash,h.personalCashAfter);
  assert.equal(G.validateSaved(s).week,s.week);
  if(h.accidentId){
   if(h.accidentPositive){positive++;assert.equal(h.incidentCost,0);assert.equal(h.accidentResponse,'not_needed');assert.throws(()=>G.handleAccident(s,'repair'));}
   else {negative++;if(h.incidentCost>0){assert.equal(h.accidentResponse,null);s=G.handleAccident(s,'ignore');assert.equal(s.lastResult.accidentResponse,'ignore');}}
  }
  if(s.rescuePending){const opt=G.rescueOptions(s);if(opt.length){s=G.resolveRescue(s,opt[0].id);rescued++;}}
  randomTurns++;
  assert.ok(randomTurns<40000,'Endless loop');
 }
 if(s.week===31)finalWeek++;
 if(s.bankrupt||s.personalFailed)failed++;else {complete++;assert.equal(s.week,31);}
 assert.ok(G.ending(s));
}
assert.ok(positive>30,'Good incidents should appear');
assert.ok(negative>30,'Bad incidents should appear');
assert.ok(complete>0,'At least one full thirty-week campaign should be possible');
assert.ok(failed>0,'Risk must remain meaningful');
{
 const old=G.initial(8128); old.campaignWeeks=12;old.contractGoal=1000000;
 delete old.campaignWeeks;
 let saved=G.validateSaved(old); assert.equal(G.campaignWeeks(saved),12); assert.equal(saved.contractGoal,1000000);
 // Old saves finish on their own twelfth week rather than silently extending.
 while(!saved.finished){const offers=G.weeklyOffers(saved);saved=G.play(saved,offers[0].id);if(saved.rescuePending){const o=G.rescueOptions(saved);saved=G.resolveRescue(saved,o[0].id);}}
 assert.ok(saved.week<=13);
}
{
 const s=G.initial(221);s.week=11;assert.equal(G.weeklyBrief(s).id,'chapter2');s.week=21;assert.equal(G.weeklyBrief(s).id,'chapter3');
 s.week=30;assert.equal(G.weeklyBrief(s).id,'final');
 const noPacts=G.initial(100);noPacts.week=29;assert.equal(G.pactAvailable(noPacts),false);
}
console.log('PASS v0.9.9',JSON.stringify({positive,negative,randomTurns,complete,failed,rescued,finalWeek}));