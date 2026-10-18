'use strict';
const assert=require('node:assert/strict'),G=require('../engine.js'),A=require('../strategy-advisor-v200.js');
const s=G.initial(42);
const choice=G.weeklyOffers(s)[0].id, before=JSON.stringify(s);
const a=A.assess(s,choice);
assert(a&&a.weeksLeft===30&&a.week===1);
assert.equal(a.goalGap,G.CONTRACT.profit);
assert.equal(a.weeklyNeeded,Math.ceil(G.CONTRACT.profit/30));
assert.equal(a.riskBefore,G.risk(s));
assert.equal(a.riskAfter,G.previewRisk(s,choice));
assert(A.markup(a).includes('契約利益まであと'));
assert(!A.markup(a).includes('NaN'));
assert.equal(JSON.stringify(s),before,'advice must be read-only and not consume RNG');
const offers=G.weeklyOffers(s);
for(const offer of offers){
 const out=A.assess(s,offer.id);
 assert(out&&out.riskAfter>=0&&out.riskAfter<=1);
 assert.equal(out.id,offer.id);
}
{
 const desperate=G.initial(555);
 desperate.cash=79000;desperate.storeRep=22;desperate.frust=78;desperate.fire=60;desperate.staff=35;
 desperate.quality=35;desperate.size=65;desperate.arrears=36000;
 const state=JSON.stringify(desperate);
 const item=A.assess(desperate,'blame','equipment');
 assert(item&&item.status==='警戒');
 const codes=item.alerts.map(x=>x.kind);
 assert(codes.includes('cash'));assert(codes.includes('reputation'));assert(codes.includes('trust'));
 assert.equal(item.projectCost,G.projectCost(desperate,'equipment'));
 assert.equal(JSON.stringify(desperate),state);
}
{
 const st=G.initial(12),copy=JSON.stringify(st);
 const plain=A.assess(st,'blame'),planned=A.assess(st,'blame','people');
 assert.equal(planned.commitment,plain.commitment+G.projectCost(st,'people'));
 assert.equal(JSON.stringify(st),copy);
}
{
 const legacy=G.initial(12);legacy.campaignWeeks=12;
 legacy.contractGoal=1800000;legacy.week=1;
 const warning=A.assess(legacy,G.weeklyOffers(legacy)[0].id);
 assert.equal(warning.weeksLeft,12);
 assert.equal(warning.weeklyNeeded,150000);
}
assert.equal(A.assess({...s,finished:true},choice),null);
assert(A.markup(null).includes('施策を選ぶ'));
console.log('PASS v2.0 strategic advisory: risk sources, goal targets, cash, old-save campaign and pure rendering');
