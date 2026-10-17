'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
const s=G.initial(6789);
assert.equal(G.unitCost(s),110);
assert.equal(G.risk(s)>0,true);
assert.equal(s.week,1);
assert.equal(G.ACTIONS.length,13);
assert.equal(G.previewRisk(s,'shrink')>G.risk(s),true);
assert.equal(G.weeklyOffers(s).length,4);assert.ok(G.weeklyOffers(s).some(a=>a.type==='kind'));
assert.deepEqual(G.weeklyOffers(s).map(a=>a.id),G.weeklyOffers(s).map(a=>a.id));
assert.equal(s.rng,6789,'Preview must not change RNG');
let x=G.play(s,'shrink');
assert.equal(x.size,90);
assert.equal(G.unitCost(x),101);
assert.equal(x.history.length,1);
assert.equal(s.size,100,'Engine must not mutate input');
assert.equal(JSON.stringify(G.play(G.initial(42),'shrink')),JSON.stringify(G.play(G.initial(42),'shrink')),'Reproducible RNG');
for(let seed=1;seed<=2000;seed++){
 let game=G.initial(seed),totalPay=0;
 for(let i=0;i<12;i++){
  const possible=G.ACTIONS.filter(a=>G.enabled(game,a.id));
  const id=possible[(seed+i*13)%possible.length].id;
  const g2=G.play(game,id);
  assert.equal(g2.week,game.week+1);
  assert.equal(g2.history.length,game.history.length+1);
  assert.equal(g2.pay,game.pay+g2.lastResult.fee);
  assert.equal(g2.sales,g2.lastResult.sales);
  assert.equal(g2.lastResult.sales,g2.lastResult.units*g2.lastResult.price);
  assert.equal(g2.lastResult.profit,g2.lastResult.units*(g2.lastResult.price-g2.lastResult.cost)-(90000-(60-g2.staff)*800)-({explain:10000,sale:12000,points:-8000,pop:23000,tasting:17000,local:11000,restorestaff:8000}[id]||0));
  assert.ok(g2.skill>=0 && g2.skill<=100);
  assert.ok(g2.sat>=0 && g2.sat<=100);
  assert.ok(g2.fire>=0 && g2.fire<=100);
  assert.ok(g2.frust>=0 && g2.frust<=100);
  assert.ok(g2.lastResult.chance>=.01 && g2.lastResult.chance<=.48);
  assert.ok(g2.lastResult.roll>=0 && g2.lastResult.roll<1);
  G.validateSaved(JSON.parse(JSON.stringify(g2)));
  game=g2;
 }
 assert.equal(game.finished,true);
 assert.equal(game.week,13);
 assert.throws(()=>G.play(game,'shrink'));
}
assert.throws(()=>G.validateSaved({version:1,week:2}));
const broken=G.play(G.initial(1234),'lower');
broken.history[0].actionId='unsupported';
assert.throws(()=>G.validateSaved(broken));
console.log('PASS: 2000 games, 24000 weekly turns; exact profit math, save validation, RNG replay, input immutability');