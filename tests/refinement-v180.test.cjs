'use strict';
const assert=require('node:assert/strict'),G=require('../engine.js'),F=require('../finance.js');
// At the cap, a failed root repair must not remove an existing paid upgrade.
for(const kind of ['equipment','people','fans'])for(const project of [null,kind]){
 let checked=false;
 for(let seed=1;seed<100&&!checked;seed++){
  const s=G.initial(seed);s.rootCause=kind;s.upgrades[kind]=project?1:2;s.cash=300000;
  const n=G.play(s,'fix_'+kind,{project});
  if(n.lastResult.performanceTier==='failure'){assert.equal(n.upgrades[kind],2);assert.equal(n.rootSolved,false);checked=true;}
 }
 assert(checked);
}
// Accident adjustments report actual bounded movements, even at 0/100.
for(const value of [0,100])for(const decision of ['repair','ignore']){
 let s;
 for(let seed=1;seed<100;seed++){s=G.play(G.initial(seed),'quality');if(s.lastResult.incidentCost>0)break;}
 s.cash=100000;s.lastResult.cashAfter=s.cash;s.lastResult.deltaCash=s.cash-s.lastResult.cashBefore;
 for(const k of ['storeRep','sat','fire','frust'])s[k]=value;
 const before=JSON.parse(JSON.stringify(s)),n=G.handleAccident(s,decision);
 for(const [key,d] of [['storeRep','deltaRep'],['sat','deltaSat'],['fire','deltaFire'],['frust','deltaFrust']])assert.equal(n.lastResult[d]-before.lastResult[d],n[key]-before[key]);
 assert.deepEqual(s,before);
}
for(const id of ['credit','inventory','owner']){
 let s=G.play(G.initial(1),'quality');s.cash=-1;s.bankrupt=true;s.finished=true;s.rescuePending=true;s.skill=0;s.storeRep=0;s.fire=100;
 const before=JSON.parse(JSON.stringify(s)),n=G.resolveRescue(s,id);
 for(const [key,d] of [['storeRep','deltaRep'],['fire','deltaFire'],['skill','deltaSkill']])assert.equal(n.lastResult[d]-before.lastResult[d],n[key]-before[key]);
}
// A crisis coinciding with a previous story's echo must describe only today's action.
{
 const s=G.initial(100);s.lastResult={fireHit:true,actionId:'shrink',actionName:'容量削減'};
 s.storyArcs=[{id:'register',stage:'echo',due:1,choice:'arc_register_boss',tier:'success',route:'bold',followAction:'blame'}];
 const h=G.play(s,'apology').lastResult;
 assert.equal(h.storyEcho.length,1);
 assert(h.crisisResponse.includes('評判 '+(h.actionImpact.rep>=0?'+':'')+h.actionImpact.rep+'、'));
}
// Personal debt transfer is explicit and not unexplained cash income.
{
 const s=G.initial(5);s.personalCash=0;s.pacts=[{id:'personal',due:1,price:159000}];s.pactCount=1;
 const n=G.play(s,'quality'),h=n.lastResult;
 assert(h.personalShortfall>0);assert.equal(h.arrearsAfter-h.arrearsBefore,h.personalShortfall);
 const ledger=F.createLedger(h,'personal');assert.equal(ledger.residual,0);assert(ledger.rows.some(r=>r.group==='未払い'));
}
// Preview is pure and only discloses known policy expense, not future RNG.
{
 const s=G.initial(8),before=JSON.stringify(s);
 assert.equal(G.policyPreview(s,'apology').cost,18000);
 assert.equal(G.policyPreview(s,'loan'),null); // not offered when sufficient cash
 assert.equal(G.policyPreview(s,'shrink').memoryRisk,true);
 assert.equal(JSON.stringify(s),before);
}
// Weekly round-trip reload preserves the subsequent deterministic result, including legacy 12 weeks.
for(const weeks of [12,30]){
 let s=G.initial(2654435761);s.cash=900000;s.contractGoal=weeks===12?1000000:G.CONTRACT.profit;
 if(weeks===12)delete s.campaignWeeks;
 s=G.validateSaved(s);
 while(!s.finished){
  const id=G.weeklyOffers(s).find(a=>a.type==='kind')?.id||G.weeklyOffers(s)[0].id;
  const next=G.play(s,id),loaded=G.play(G.validateSaved(JSON.parse(JSON.stringify(s))),id);
  assert.deepEqual(loaded,next);s=next;
  if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
  if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
  assert.equal(F.createLedger(s.lastResult,'store').residual,0);
 }
 assert.equal(s.week,weeks+1);assert(!s.bankrupt&&!s.personalFailed);
}
console.log('PASS v1.8 bounded deltas, paid upgrades, isolated crisis, personal shortfall, pure previews, 12/30 week reload');
