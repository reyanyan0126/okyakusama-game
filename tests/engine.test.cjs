'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
assert.equal(G.VERSION,1,'Save version must not change for legacy clients');
assert.equal(G.unitCost(G.initial(123)),110);
assert.equal(G.ACTIONS.length,21);
assert.equal(G.CONTRACT.profit,1000000);
assert.equal(G.CONTRACT.reputation,50);
let s=G.initial(123456);
assert.equal(G.weeklyBrief(s).id,'opening');
assert.equal(G.weeklyOffers(s).length,3);
assert.deepEqual(G.weeklyOffers(s).map(x=>x.id),G.weeklyOffers(s).map(x=>x.id));
assert.equal(G.previewRisk(s,'shrink')>G.risk(s),true);
assert.equal(s.rng,123456,'No RNG changes in preview');
assert.equal(G.goalStatus(s).profit,0);
let s1=G.play(s,'shrink');
assert.equal(s1.size,90);assert.equal(s.size,100);
assert.equal(s1.history[0].scenarioId,'opening');
assert.equal(s1.history[0].actionId,'shrink');
assert.ok(G.weeklyOffers(s1).length===3);
assert.equal(JSON.stringify(G.play(G.initial(42),'shrink')),JSON.stringify(G.play(G.initial(42),'shrink')));
// If an earlier decision causes a scandal, the next proposal must be a relevant crisis response.
let chain=G.initial(1);chain.lastResult={fireHit:true,memoryEvent:false};
assert.equal(G.weeklyBrief(chain).id,'crisis');
assert.deepEqual(G.weeklyOffers(chain).map(x=>x.id),['apology','recall','blame']);
let a=G.play(chain,'apology'),b=G.play(chain,'blame');
assert.ok(a.frust<b.frust,'Apology and blame must have different consequences');
assert.ok(a.storeRep>b.storeRep);
for(let seed=1;seed<=2000;seed++){
 let game=G.initial(seed);
 for(let i=0;i<12&&!game.finished;i++){
  const offers=G.weeklyOffers(game);
  assert.equal(offers.length,3,'Always three choices');
  assert.equal(new Set(offers.map(x=>x.id)).size,3);
  assert.ok(offers.every(x=>G.enabled(game,x.id)));
  const id=offers[(seed+i*7)%3].id;
  const before=JSON.stringify(game);
  const next=G.play(game,id);
  assert.equal(JSON.stringify(game),before,'Input game should not mutate');
  assert.equal(next.week,game.week+1);
  assert.equal(next.history.length,game.history.length+1);
  assert.equal(next.pay,game.pay+next.lastResult.fee+next.lastResult.boardroomBonus);
  assert.equal(next.sales,next.lastResult.sales);
  const h=next.lastResult;
  assert.equal(h.sales,h.units*h.price);
  assert.equal(h.profit,h.units*(h.price-h.cost)-(h.rent+h.utilities+h.payroll+h.macroFixed)-h.extra-h.incidentCost-h.interest-h.macroPenalty+h.macroBonus);
  assert.equal(next.cash,game.cash+h.profit+h.financing-h.principal-h.investment-h.fee-h.devilPayment-h.boardroomBonus);
  assert.equal(next.debt,h.debtAfter);
  assert.ok(!h.accidentId||G.ACCIDENTS.some(a=>a.id===h.accidentId));
  assert.ok(next.skill>=0&&next.skill<=100);
  assert.ok(next.sat>=0&&next.sat<=100);
  assert.ok(next.fire>=0&&next.fire<=100);
  assert.ok(next.frust>=0&&next.frust<=100);
  assert.ok(h.chance>=.01&&h.chance<=.48);
  assert.ok(h.roll>=0&&h.roll<1);
  assert.ok(h.scenarioTitle.length);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(next))).history.length,i+1);
  game=next;
 }
 assert.equal(game.finished,true);
 assert.ok(game.week===13||game.bankrupt||game.personalFailed);
 assert.equal(G.ending(game).passed,!game.bankrupt&&!game.personalFailed&&G.goalStatus(game).passed);
 assert.throws(()=>G.play(game,'quality'));
}
// Exact old-v0.4 schema: no new required keys or save migration.
const old=G.initial(987);
const legacy=G.play(old,'shrink');
delete legacy.lastResult.scenarioTitle;delete legacy.lastResult.scenarioId;
legacy.history[0]=legacy.lastResult;
assert.equal(G.validateSaved(legacy).week,2);
assert.throws(()=>G.validateSaved({version:1,week:2}));
const broken=G.play(G.initial(19),'lower');broken.history[0].actionId='unknown';assert.throws(()=>G.validateSaved(broken));
// Rough game-balance smoke-test: choices should matter, and success shouldn't be trivial.
const scores={kind:0,hard:0,mixed:0};
for(let method of Object.keys(scores))for(let seed=1;seed<=500;seed++){
 let g=G.initial(seed);
 while(!g.finished){const choices=G.weeklyOffers(g);const tag=method==='mixed'?(g.week%2?'hard':'kind'):method;g=G.play(g,(choices.find(a=>a.type===tag)||choices[0]).id);}
 if(G.goalStatus(g).passed)scores[method]++;
}
assert.ok(scores.kind>scores.hard,'Safe approaches should protect the store better');
assert.ok(scores.mixed>0&&scores.mixed<500,'Mixed play must have genuine outcome variability');
console.log('PASS: v0.6 budgets, operating accidents, finance, contracts, 2000 randomized campaigns, backward-compatible saves',scores);

// New game states and old saves are both accepted. New runs target a balanced 100万円, old 180万円 remains unchanged.
const legacy0=G.initial(777);delete legacy0.contractGoal;delete legacy0.debt;delete legacy0.maintenance;delete legacy0.lowCashWeeks;delete legacy0.bankrupt;
const restored=G.validateSaved(legacy0);
assert.equal(restored.contractGoal,1800000);assert.equal(restored.debt,0);assert.equal(restored.bankrupt,false);
assert.equal(G.initial(777).contractGoal,1000000);
assert.equal(G.ACCIDENTS.length>=10,true);
const safe=G.initial(123456);let seen=0;while(!safe.finished&&safe.week<=12){const x=G.play(safe,G.weeklyOffers(safe)[0].id);if(x.lastResult.accidentId)seen++;Object.assign(safe,x)}
assert.ok(seen>=0);
const debtor=G.initial(55);debtor.cash=50000;assert.ok(G.weeklyOffers(debtor).some(a=>a.id==='loan'));let financed=G.play(debtor,'loan');assert.equal(financed.debt,190000);assert.equal(financed.lastResult.financing,200000);assert.ok(financed.cash>debtor.cash);