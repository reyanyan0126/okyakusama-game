'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
for(let seed=1;seed<=400;seed++){
 const original=G.initial(seed);original.cash=1000;
 const next=G.play(original,'pop');
 if(!next.rescuePending)continue;
 assert.equal(next.bankrupt,true);
 assert.equal(next.finished,true);
 assert.ok(next.cash<0);
 assert.equal(G.validateSaved(JSON.parse(JSON.stringify(next))).rescuePending,true);
 const opts=G.rescueOptions(next);
 assert.ok(opts.length>=1&&opts.length<=3);
 assert.ok(opts.every(o=>next.cash+o.amount>=0),'Only sufficient bailouts');
 for(const option of opts){
  const revived=G.resolveRescue(next,option.id);
  assert.ok(revived.cash>=0,'Intervention restores positive cash');
  assert.equal(revived.bankrupt,false);
  assert.equal(revived.rescuePending,false);
  assert.equal(revived.finished,false);
  assert.equal(revived.rescueUsed,1);
  assert.equal(revived.lastResult.rescueChoice,option.id);
  assert.equal(revived.lastResult.cashAfter,revived.cash);
  assert.equal(revived.lastResult.deltaCash,revived.cash-revived.lastResult.cashBefore);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(revived))).rescueUsed,1);
  if(option.id==='credit')assert.equal(revived.debt,next.debt+185000);
  if(option.id==='inventory')assert.ok(revived.quality<=next.quality&&revived.storeRep<next.storeRep);
  if(option.id==='owner'){assert.equal(revived.ownerFundUsed,true);assert.equal(G.boardroomDemand(revived),null);}
 }
 const ended=G.resolveRescue(next,'giveup');
 assert.ok(ended.finished&&ended.bankrupt&&!ended.rescuePending);
 assert.equal(ended.lastResult.rescueChoice,'giveup');
 assert.throws(()=>G.resolveRescue(ended,'owner'));
}
let used=G.initial(1);used.rescueUsed=2;used.cash=1000;
const over=G.play(used,'pop');
if(over.bankrupt)assert.equal(over.rescuePending,false,'No third rescue');
// Old saves must still be accepted without the new emergency fields.
let old=G.play(G.initial(1234),'quality');
for(const name of ['rescuePending','rescueUsed','ownerFundUsed'])delete old[name];
const saved=G.validateSaved(old);
assert.equal(saved.rescuePending,false);assert.equal(saved.rescueUsed,0);assert.equal(saved.ownerFundUsed,false);
console.log('PASS: deterministic rescue choices, debts, sacrifices, limit, resume state, old saves');