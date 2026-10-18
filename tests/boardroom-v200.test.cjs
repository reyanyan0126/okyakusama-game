'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js'), F=require('../finance.js');
const MILESTONES=[6,11,16,21,26,30];
for(const week of MILESTONES){
 const s=G.initial(34);s.week=week;s.cash=500000;
 const offers=G.weeklyOffers(s),d=G.boardroomDemand(s);
 assert(d&&d.milestone, 'expected boardroom demand at '+week);
 const alternative=offers.find(a=>a.id!==d.actionId);
 assert(alternative);
 const before=JSON.stringify(s);
 const accepted=G.play(s,d.actionId),declined=G.play(s,alternative.id);
 const a=accepted.lastResult.boardroomDilemma,b=declined.lastResult.boardroomDilemma;
 assert.equal(a.followed,true);assert.equal(b.followed,false);
 assert.deepEqual(a.delta,{boss:2,manager:-1,customers:-1});
 assert.deepEqual(b.delta,{boss:-1,manager:1,customers:1});
 assert.equal(accepted.lastResult.boardroomBonus,d.bonus);
 assert.equal(declined.lastResult.boardroomBonus,0);
 assert.equal(JSON.stringify(s),before,'input mutated');
 assert.deepEqual(G.play(s,d.actionId),accepted,'seed reproducibility');
 assert.equal(F.createLedger(accepted.lastResult,'store').residual,0);
 assert.equal(F.createLedger(accepted.lastResult,'personal').residual,0);
}
for(const week of [1,2,3,4,5,7,12,20,27,29]){
 const s=G.initial(123);s.week=week;s.cash=500000;
 const a=G.weeklyOffers(s)[0],after=G.play(s,a.id);
 assert.equal(after.lastResult.boardroomDilemma,null,'non-milestone '+week);
}
{
 const s=G.initial(34);s.week=6;s.cash=90000;
 const d=G.boardroomDemand(s);
 assert(d&&d.urgent&&d.milestone);
 const choice=G.weeklyOffers(s).find(x=>x.id!==d.actionId);
 const choiceRes=G.play(s,choice.id);
 assert.deepEqual(choiceRes.lastResult.boardroomDilemma.delta,{boss:-2,manager:1,customers:1});
}
{
 const s=G.initial(34);s.week=6;s.cash=500000;s.cast={boss:100,manager:-100,customers:-100};
 const d=G.boardroomDemand(s),a=G.play(s,d.actionId);
 assert.deepEqual(a.lastResult.boardroomDilemma.delta,{boss:0,manager:0,customers:0},'relationship cap');
 assert.deepEqual(a.cast,s.cast);
}
{
 const old=G.initial(34);old.campaignWeeks=12;old.week=6;old.cash=500000;
 assert.equal(G.boardroomDemand(old)?.milestone,false,'legacy campaign has no new milestones');
 assert.equal(G.play(old,G.weeklyOffers(old)[0].id).lastResult.boardroomDilemma,null);
}
{
 const s=G.initial(34);s.week=6;s.cash=500000;s.ownerFundUsed=true;
 assert.equal(G.boardroomDemand(s),null);
 assert.equal(G.play(s,G.weeklyOffers(s)[0].id).lastResult.boardroomDilemma,null);
}
for(const seed of [12,34,42,2654435761]){
 let s=G.initial(seed);
 while(!s.finished){
  const before=s,offers=G.weeklyOffers(s);
  s=G.play(s,(offers.find(x=>x.type==='kind')||offers[0]).id);
  if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);
  if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
  const record=s.lastResult;
  for(const [key,delta]of [['storeRep','deltaRep'],['sat','deltaSat'],['fire','deltaFire'],['frust','deltaFrust'],['skill','deltaSkill']])
   assert.equal(s[key]-before[key],record[delta],'reported delta seed='+seed+' week='+record.week+' '+key);
  assert.equal(F.createLedger(record,'store').residual,0);
  assert.equal(F.createLedger(record,'personal').residual,0);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(s))).week,s.week);
 }
 assert(s.history.length>0);
}
console.log('PASS v2.0 boardroom dilemmas: six milestones, urgent tradeoff, legacy protection, caps, 4 seeds of save/ledger/delta replays');
