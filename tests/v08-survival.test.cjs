'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
assert.equal(G.PERSONAL.support,36000);
assert.equal(G.PERSONAL.dueWeeks.join(','),'4,8,12');
assert.equal(G.MACROS.length,6);
assert.equal(G.DEVIL_OFFERS.length,3);
let endings={bankrupt:0,personalFailed:0,completed:0},lives=0,pacts=0;
for(let seed=1;seed<=2500;seed++){
 let s=G.initial(seed*379);const immutable=JSON.stringify(s);
 const macro=G.currentMacro(s);
 assert.equal(G.currentMacro(s).id,macro.id);
 let first=G.play(s,G.weeklyOffers(s)[0].id);
 assert.equal(JSON.stringify(s),immutable,'play should not mutate previous state');
 assert.equal(first.personalCash,first.lastResult.personalCashAfter);
 assert.equal(first.lastResult.personalCashBefore,G.PERSONAL.start);
 assert.equal(first.lastResult.personalLiving,G.PERSONAL.living);
 assert.equal(first.lastResult.macroId,macro.id);
 assert.equal(first.cash,first.lastResult.cashAfter);
 assert.equal(first.cash,s.cash+first.lastResult.profit+first.lastResult.financing-first.lastResult.principal-first.lastResult.investment-first.lastResult.fee-first.lastResult.devilPayment);
 s=first;
 while(!s.finished){
  const choices=G.weeklyOffers(s);
  assert.equal(choices.length,4);
  let k=choices[(seed+s.week)%choices.length].id;
  s=G.play(s,k);
  assert.equal(s.cash,s.lastResult.cashAfter);
  assert.equal(s.personalCash,s.lastResult.personalCashAfter);
  assert.ok(s.personalCash>=0);
  assert.ok(s.arrears>=0);
  assert.equal(s.history.length,s.week-1);
  if(s.lastResult.accidentId&&s.lastResult.incidentCost){
   const update=G.handleAccident(s,'ignore');
   assert.equal(update.lastResult.accidentResponse,'ignore');
   s=update;
  }
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(s))).history.length,s.history.length);
 }
 assert.equal(s.finished,true);
 if(s.bankrupt)endings.bankrupt++;
 else if(s.personalFailed)endings.personalFailed++;
 else endings.completed++;
 assert.ok(G.ending(s));
 if(s.week===13)lives++;
}
assert.ok(endings.bankrupt>0,'Cash pressure must sometimes end a campaign early');
assert.ok(endings.completed>0,'Some campaigns should survive to week 12');
{
 let g=G.initial(11);assert.equal(G.pactAvailable(g),true);
 const h=G.play(g,'quality',{devil:'personal'});
 assert.equal(h.pactCount,1);
 assert.equal(h.pacts[0].due,4);
 assert.equal(h.personalCash, g.personalCash+G.DEVIL_OFFERS[0].gain+h.lastResult.fee-G.PERSONAL.living);
 assert.equal(G.validateSaved(h).pactCount,1);
 assert.throws(()=>G.play(h,G.weeklyOffers(h)[0].id,{devil:'shop'}),'No stacking active debts');
 let s=h;
 while(s.week<=4&&!s.finished){s=G.play(s,G.weeklyOffers(s)[0].id)}
 assert.ok(s.history.some(x=>x.personalDevilPayment===159000),'Devil collects on schedule');
 pacts++;
}
{
 let g=G.initial(13);g.week=10;
 assert.equal(G.pactAvailable(g),false,'No free loans near contract end');
}
{
 let g=G.initial(13);g.cash=1000;
 let next=G.play(g,'pop');
 assert.ok(next.bankrupt,'Negative cash must end game');
 assert.ok(next.finished);
 assert.equal(G.ending(next).passed,false);
}
{
 let g=G.initial(1234);g.personalCash=0;g.arrears=71999;g.week=4;
 const next=G.play(g,'quality');
 assert.ok(next.arrears>71999);
 assert.ok(next.personalFailed,'Personal shortfall must end the consulting contract');
 assert.ok(next.finished);
 assert.equal(G.ending(next).passed,false);
}
{
 const legacyEngine=require('../../okyakusama-v0.7/engine.js');
 let old=legacyEngine.play(legacyEngine.initial(321),'quality');
 const restored=G.validateSaved(old);
 assert.equal(restored.week,old.week);
 assert.equal(restored.history.length,1);
 assert.equal(restored.personalCash,G.PERSONAL.start);
 assert.equal(restored.pactCount,0);
 const renewed=G.play(restored,G.weeklyOffers(restored)[0].id);
 assert.equal(renewed.history.length,2);
}
console.log('PASS: v0.8 survival',JSON.stringify({campaigns:2500,endings,lives,pacts}));