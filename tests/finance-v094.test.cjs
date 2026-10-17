'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
const F=require('../finance.js');
let steps=0, differenceShop=0, differencePersonal=0, residualPersonal=0;
for(let seed=1;seed<=1300;seed++){
 let s=G.initial(seed*32591);
 for(let week=0;week<12&&!s.finished;week++){
  const options=G.weeklyOffers(s);
  const action=options[(seed+week)%options.length];
  let n=G.play(s,action.id);
  if(n.rescuePending){const o=G.rescueOptions(n);if(o.length)n=G.resolveRescue(n,o[0].id);}
  const h=n.lastResult;
  const shop=F.createLedger(h,'store'),personal=F.createLedger(h,'personal');
  assert.equal(shop.start+shop.inTotal-shop.outTotal,shop.end,'store exact ledger');
  assert.equal(personal.start+personal.inTotal-personal.outTotal,personal.end,'personal exact ledger');
  assert.equal(shop.delta,h.deltaCash);
  assert.equal(personal.delta,n.personalCash-h.personalCashBefore);
  if(shop.residual!==0)differenceShop++;
  if(personal.residual!==0){differencePersonal++;if(personal.residual>0)residualPersonal++;}
  steps++;s=n;
  if(h.accidentId&&h.incidentCost>0&&h.accidentResponse===null){
    const choice=s.cash>=Math.min(28000,Math.round(h.incidentCost*.48)+4000)?'repair':'ignore';
    s=G.handleAccident(s,choice);
    const repaired=F.createLedger(s.lastResult,'store');
    assert.equal(repaired.start+repaired.inTotal-repaired.outTotal,repaired.end,'accident compensation ledger');
  }
 }
}
assert.equal(differenceShop,0,'all store cash movements must be fully explained');
console.log(`PASS ${steps} weeks store balances fully reconciled; personal shortfalls ${residualPersonal}/${steps}`);
// Unknown legacy report fields: show the remaining adjustment rather than hide it.
const legacy={cashBefore:100000,cashAfter:110000,deltaCash:10000,personalCashBefore:20000,personalCashAfter:22000};
assert.equal(F.createLedger(legacy,'store').residual,10000);
assert.equal(F.createLedger(legacy,'personal').residual,2000);