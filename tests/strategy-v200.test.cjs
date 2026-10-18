'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
const X=require('./strategy-v200.cjs');
const seed=2654435761;
for(const finance of X.FINANCE_POLICIES){
 const records=X.STRATEGIES.map(strategy=>X.execute(seed,strategy,finance));
 for(const r of records){
  assert(r.weeks>0&&r.weeks<=30);
  assert.equal(r.saveErrors,0,'save roundtrip: '+r.strategy+'/'+finance);
  assert.equal(r.ledgerErrors,0,'store/personal ledger: '+r.strategy+'/'+finance);
  assert.equal(r.deltaErrors,0,'bounded change narration: '+r.strategy+'/'+finance);
  assert.deepEqual(X.execute(seed,r.strategy,finance),r,'deterministic: '+r.strategy+'/'+finance);
 }
}
// Critical scenario: profitability tactics must yield to credible recovery choices.
assert(X.STRATEGIES.includes('guarded-profit'));
const healthy=G.initial(seed),troubled=G.initial(seed);
troubled.storeRep=20;troubled.frust=80;troubled.fire=65;
assert(X.guardedScore(healthy,G.ACTIONS.find(x=>x.id==='blame'))>X.guardedScore(healthy,G.ACTIONS.find(x=>x.id==='apology')));
assert(X.guardedScore(troubled,G.ACTIONS.find(x=>x.id==='apology'))>X.guardedScore(troubled,G.ACTIONS.find(x=>x.id==='blame')));
const budgetBefore=JSON.stringify(troubled);
X.select(troubled,G.weeklyOffers(troubled),'guarded-profit',()=>0.4);
assert.equal(JSON.stringify(troubled),budgetBefore,'guarded selection is pure');
const s=G.initial(seed),before=JSON.stringify(s);
const offers=G.weeklyOffers(s),selected=X.select(s,offers,'trust',()=>0.8);
assert(offers.some(a=>a.id===selected.id));
assert.equal(JSON.stringify(s),before,'selection must not change game state');
assert.notDeepEqual(X.execute(seed,'trust','no-invest-repair'),X.execute(seed,'trust','invest-repair'),'investment control matters');
const report=X.experiment(2);
assert.equal(Object.keys(report.groups).length,X.STRATEGIES.length*X.FINANCE_POLICIES.length);
for(const entry of Object.values(report.groups)){assert.equal(entry.runs,2);assert.equal(entry.ledgerErrors,0);assert.equal(entry.saveErrors,0);}
console.log('PASS v2.0 matched seed strategies and finance controls, deterministic saves, ledger and delta integrity');