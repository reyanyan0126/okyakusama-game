'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const G=require('../engine'),M=require('../management'),F=require('../finance');
function finish(s){if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);return s;}
// Fingerprints captured from unmodified main 8572e48, including RNG, all reports,
// accidents, rescue, finance, personal life, story and legacy ending state.
for(const {seed,hash} of require('./fixtures/v300-campaign-hashes.json')){
 let s=G.initial(seed);while(!s.finished){s=finish(G.play(s,G.weeklyOffers(s)[(seed/53+s.week)%4].id));s=G.validateSaved(JSON.parse(JSON.stringify(s)));}
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(s)).digest('hex'),hash,`legacy seed ${seed}`);
}
for(const difficulty of Object.keys(M.DIFFICULTIES))for(let seed=1;seed<=40;seed++){
 let s=G.initial(seed*71,{difficulty});
 assert.equal(s.cash,M.DIFFICULTIES[difficulty].cash);
 while(!s.finished){s=finish(G.play(s,G.weeklyOffers(s)[(seed+s.week)%4].id));
  const ledger=F.createLedger(s.lastResult,'store');assert.equal(ledger.residual,0);
  assert.equal(ledger.start+ledger.inTotal-ledger.outTotal,ledger.end);
  assert.equal(ledger.sections[0].amount,s.profit);
  const restored=G.validateSaved(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored,s);s=restored;
 }
 assert(M.ENDINGS[G.ending(s).id]);
}
// Eight full, legal campaigns: no injected balances, weeks, RNG or scores.
const routes=require('./fixtures/v310-endings.json');assert.equal(Object.keys(routes).length,8);
for(const [ending,route] of Object.entries(routes)){
 let s=G.initial(route.seed,{difficulty:route.difficulty});for(const id of route.actions){assert(G.weeklyOffers(s).some(o=>o.id===id));s=G.validateSaved(JSON.parse(JSON.stringify(finish(G.play(s,id)))));}
 assert(s.finished);assert.equal(G.ending(s).id,ending);assert(G.ending(s).legacyName);
}
const s=G.initial(1,{difficulty:'normal'});const bad=structuredClone(s);bad.workforce.morale=NaN;assert.throws(()=>G.validateSaved(bad));
assert.throws(()=>G.initial(1,{difficulty:'unknown'}));
for(const field of ['fatigue','turnover','departures']){const x=structuredClone(s);x.workforce[field]=-1;assert.throws(()=>G.validateSaved(x));}
const unhealthy=G.initial(5,{difficulty:'normal'});unhealthy.staff=30;unhealthy.workforce={morale:0,fatigue:100,turnover:30,departures:0};const event=M.workforce(unhealthy,'staff',0);assert(event.departed);assert.equal(event.cost,18000);assert(event.demand<1);
const rested=G.initial(5,{difficulty:'normal'});M.workforce(rested,'loyalty',.99);assert(rested.workforce.morale>65);assert(rested.workforce.fatigue<20);
let one=finish(G.play(s,G.weeklyOffers(s)[0].id));one.history[0].week=2;assert.throws(()=>G.validateSaved(one));
const hidden=G.initial(9,{difficulty:'easy'});hidden.week=20;hidden.workforce.morale=95;hidden.workforce.fatigue=0;assert(M.workforce(hidden,'loyalty',.9).note.includes('隠し会議'));assert(!M.workforce(hidden,'loyalty',.9).note.includes('隠し会議'));
console.log('PASS v3.1: 40 byte-identical legacy campaigns; 120 new campaigns with every-week JSON/ledger checks; all 8 endings via legal choices; workforce and invalid-save checks');
