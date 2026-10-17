'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
let checked=0;
const all=G.availableProjects(G.initial(777));
assert.equal(all.length,3);
assert.equal(all[0].nextCost,45000);
{
 const s=G.initial(1234),copy=JSON.parse(JSON.stringify(s));
 const baseline=G.play(s,'shrink');
 const equip=G.play(s,'shrink',{project:'equipment'});
 assert.deepEqual(s,copy,'play must be pure');
 assert.equal(equip.upgrades.equipment,1);
 assert.equal(baseline.upgrades.equipment,0);
 assert.equal(equip.lastResult.investment,45000);
 assert.equal(equip.lastResult.projectId,'equipment');
 assert.equal(equip.lastResult.cashAfter-equip.lastResult.cashBefore,equip.lastResult.profit+equip.lastResult.financing-equip.lastResult.principal-equip.lastResult.investment);
 assert.equal(G.validateSaved(JSON.parse(JSON.stringify(equip))).upgrades.equipment,1);
 assert.throws(()=>G.play(s,'shrink',{project:'nonsense'}));
 checked++;
}
{
 const s=G.initial(54321),p=G.play(s,'quality',{project:'people'});
 assert.equal(p.upgrades.people,1);
 const next=G.play(p,G.weeklyOffers(p)[0].id,{project:'fans'});
 assert.equal(next.upgrades.people,1);
 assert.equal(next.upgrades.fans,1);
 assert.equal(next.history[0].investment,35000);
 assert.equal(next.history[1].investment,42000);
 let old=JSON.parse(JSON.stringify(s));delete old.upgrades;
 assert.deepEqual(G.validateSaved(old).upgrades,{equipment:0,people:0,fans:0});
 old.upgrades={equipment:5,people:0,fans:0};
 assert.throws(()=>G.validateSaved(old));
 checked++;
}
let incidents=0, repairs=0, closures=0;
for(let seed=1;seed<=3500;seed++){
 let s=G.initial(seed*1234567),fresh=G.initial(seed*1234567);
 for(let week=1;week<=12&&!s.finished;week++){
  let choice=G.weeklyOffers(s)[(seed+week)%4]?.id;
  const projects=G.availableProjects(s).filter(p=>p.nextCost!==null&&p.nextCost<=s.cash);
  const project=projects.length&&week%4===0?projects[seed%projects.length].id:null;
  const prevCash=s.cash;
  const current=G.play(s,choice,{project});
  assert.ok(current.lastResult.cashAfter===current.cash);
  assert.ok(current.lastResult.cashBefore===prevCash);
  assert.equal(current.lastResult.deltaCash,current.cash-prevCash);
  if(current.lastResult.accidentId&&current.lastResult.incidentCost>0){
    incidents++;
    assert.equal(current.lastResult.accidentResponse,null);
    const mode=current.cash>=28000?'repair':'ignore';
    const updated=G.handleAccident(current,mode);
    assert.equal(updated.lastResult.accidentResponse,mode);
    assert.equal(updated.lastResult.cashAfter,updated.cash);
    assert.equal(updated.lastResult.deltaCash,updated.cash-prevCash);
    assert.equal(G.validateSaved(updated).lastResult.accidentResponse,mode);
    assert.throws(()=>G.handleAccident(updated,mode),'must not resolve twice');
    if(mode==='repair')repairs++;
    s=updated;
  } else s=current;
  if(s.finished)closures++;
 }
 checked++;
}
assert.ok(incidents>250,'test incidents should be sufficiently common');
assert.ok(repairs>100);
console.log('PASS v0.7 mechanics',JSON.stringify({campaigns:checked-2,incidents,repairs,closures}));