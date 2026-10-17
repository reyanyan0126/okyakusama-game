'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
const F=require('../finance.js');
// Different contracts should suffer from different underlying problems.
for(const id of ['equipment','people','fans']){
 let seed=12000;while(G.initial(seed).rootCause!==id || G.play(G.initial(seed),G.weeklyOffers(G.initial(seed))[0].id).lastResult.fireHit)seed++;
 let s=G.initial(seed);
 assert.equal(s.rootSolved,false);
 assert.ok(G.rootDiagnosis(s).clue.length>4);
 const first=G.weeklyOffers(s)[0];s=G.play(s,first.id);
 if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
 if(s.finished)continue;
 const fix=G.ROOT_CASES[id].action;
 assert.ok(G.weeklyOffers(s).some(x=>x.id===fix),id);
 const before=structuredClone(s);
 const after=G.play(s,fix);
 assert.equal(after.rootSolved,true,id);
 assert.equal(after.lastResult.rootFixedThisWeek,true);
 assert.equal(after.lastResult.rootLoss,0);
 assert.equal(after.lastResult.extra,G.ROOT_CASES[id].cost);
 assert.ok(!G.weeklyOffers(after).some(x=>x.id===fix));
 assert.equal(F.createLedger(after.lastResult,'store').residual,0);
 assert.equal(G.validateSaved(JSON.parse(JSON.stringify(after))).rootSolved,true);
 const alternate=G.weeklyOffers(before).find(x=>x.id!==fix);
 const skipped=G.play(before,alternate.id);
 if(id==='equipment')assert.equal(skipped.lastResult.rootLoss,12000);
 assert.equal(F.createLedger(skipped.lastResult,'store').residual,0);
}
// Legacy saves remain intact: no late penalties or retrofit repair cards.
let v=G.initial(17); delete v.rootCause;delete v.rootSolved;
v=G.validateSaved(JSON.parse(JSON.stringify(v)));
assert.equal(v.rootCause,'legacy');assert.equal(v.rootSolved,true);
assert.ok(G.weeklyOffers(v).every(a=>!a.id.startsWith('fix_')));
let campaigns=0,weeks=0;
for(let seed=2;seed<=1102;seed++){
 let s=G.initial(seed*677);
 while(!s.finished){
  const opts=G.weeklyOffers(s);
  assert.equal(opts.length,3);
  assert.equal(new Set(opts.map(o=>o.id)).size,3);
  let n=G.play(s,opts[(seed+s.week)%3].id);
  if(n.rescuePending){const items=G.rescueOptions(n);if(items.length)n=G.resolveRescue(n,items[0].id);}
  assert.equal(F.createLedger(n.lastResult,'store').residual,0);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(n))).week,n.week);
  weeks++;s=n;
 }
 campaigns++;
}
console.log(`PASS v0.9.5: all 3 structural repairs, legacy compatibility, ${campaigns} campaigns ${weeks} weeks, exact cash ledger`);