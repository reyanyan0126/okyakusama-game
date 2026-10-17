'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
assert.equal(G.VERSION,1,'Save version must not change for legacy clients');
assert.equal(G.unitCost(G.initial(123)),110);
assert.equal(G.ACTIONS.length,19);
assert.equal(G.CONTRACT.profit,1800000);
assert.equal(G.CONTRACT.reputation,50);
let s=G.initial(123456);
assert.equal(G.weeklyBrief(s).id,'opening');
assert.equal(G.weeklyOffers(s).length,4);
assert.deepEqual(G.weeklyOffers(s).map(x=>x.id),G.weeklyOffers(s).map(x=>x.id));
assert.equal(G.previewRisk(s,'shrink')>G.risk(s),true);
assert.equal(s.rng,123456,'No RNG changes in preview');
assert.equal(G.goalStatus(s).profit,0);
let s1=G.play(s,'shrink');
assert.equal(s1.size,90);assert.equal(s.size,100);
assert.equal(s1.history[0].scenarioId,'opening');
assert.equal(s1.history[0].actionId,'shrink');
assert.ok(G.weeklyOffers(s1).length===4);
assert.equal(JSON.stringify(G.play(G.initial(42),'shrink')),JSON.stringify(G.play(G.initial(42),'shrink')));
// If an earlier decision causes a scandal, the next proposal must be a relevant crisis response.
let chain=G.initial(1);chain.lastResult={fireHit:true,memoryEvent:false};
assert.equal(G.weeklyBrief(chain).id,'crisis');
assert.deepEqual(G.weeklyOffers(chain).map(x=>x.id),['apology','recall','blame','explain']);
let a=G.play(chain,'apology'),b=G.play(chain,'blame');
assert.ok(a.frust<b.frust,'Apology and blame must have different consequences');
assert.ok(a.storeRep>b.storeRep);
for(let seed=1;seed<=2000;seed++){
 let game=G.initial(seed);
 for(let i=0;i<12;i++){
  const offers=G.weeklyOffers(game);
  assert.equal(offers.length,4,'Always four choices');
  assert.equal(new Set(offers.map(x=>x.id)).size,4);
  assert.ok(offers.every(x=>G.enabled(game,x.id)));
  const id=offers[(seed+i*7)%4].id;
  const before=JSON.stringify(game);
  const next=G.play(game,id);
  assert.equal(JSON.stringify(game),before,'Input game should not mutate');
  assert.equal(next.week,game.week+1);
  assert.equal(next.history.length,game.history.length+1);
  assert.equal(next.pay,game.pay+next.lastResult.fee);
  assert.equal(next.sales,next.lastResult.sales);
  const h=next.lastResult;
  assert.equal(h.sales,h.units*h.price);
  assert.equal(h.profit,h.units*(h.price-h.cost)-(90000-(60-next.staff)*800)-h.extra);
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
 assert.equal(game.week,13);
 assert.equal(G.ending(game).passed,G.goalStatus(game).passed);
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
console.log('PASS: v0.5 story arcs, contracts, causal crises, 2000 complete games, 24000 turns, legacy saves, profit accounting and balance',scores);