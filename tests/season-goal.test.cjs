const test=require('node:test'),assert=require('node:assert/strict'),S=require('../season-goals');
function fresh(week=1){
 const state={strategyVersion:380,week,history:[],finished:false,quality:60,storeRep:58,profit:60000,workforce:{departures:0,fatigue:20}};
 S.initialize(state);return state;
}
test('six periods offer three legal choices, migrated contracts get the remaining weeks',()=>{
 for(let week=1;week<=30;week++){
  const s=fresh(week),options=S.offers(s);assert.equal(new Set(options.map(o=>o.id)).size,3);
  for(const o of options){assert.equal(o.start,week);assert.equal(o.end,5*Math.ceil(week/5));assert(S.perkCatalog[o.rewardId]);}
  S.choose(s,options[0].id);assert.throws(()=>S.choose(s,options[0].id));S.validate(s);
 }
});
test('review recomputes after incident, failed goal can continue and reward cannot be claimed twice',()=>{
 for(const pass of [true,false]){
  const s=fresh(4);S.choose(s,'reputation');s.week=6;s.storeRep=40;S.settle(s);
  if(pass)s.storeRep=80;
  assert.equal(S.review(s).achieved,pass);
  S.validate(s);S.complete(s);assert.equal(s.perks.length,pass?1:0);assert.equal(s.seasonLog[0].achieved,pass);
  assert.throws(()=>S.complete(s));assert(S.needsGoal(s));S.validate(s);
 }
});
test('perk cap allows explicit replacement or keeping the current four',()=>{
 for(const replacement of ['merchant','skip']){
  const s=fresh(5);s.perks=['merchant','mentor','buyer','planner'];S.choose(s,'reputation');s.week=6;s.storeRep=80;S.settle(s);
  assert.throws(()=>S.complete(s));assert.equal(s.perks.length,4);S.complete(s,replacement);
  assert.equal(s.perks.length,4);assert.equal(s.perks.includes('neighbor'),replacement==='merchant');
 }
});
