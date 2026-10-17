'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const G=require('../engine.js');
assert.equal(G.VERSION,1,'Preserve v1 save format');
for(let seed=1;seed<=2400;seed++){
 let s=G.initial(seed*7639);
 while(!s.finished){
  const opts=G.weeklyOffers(s),bonus=G.boardroomDemand(s);
  assert.equal(opts.length,3);
  assert.equal(new Set(opts.map(x=>x.id)).size,3);
  assert.ok(opts.every(x=>G.enabled(s,x.id)));
  if(bonus)assert.ok(opts.some(x=>x.id===bonus.actionId));
  const pick=opts[(seed+s.week)%3].id;
  const next=G.play(s,pick);
  const h=next.lastResult;
  const expected=bonus?.actionId===pick?bonus.bonus:0;
  assert.equal(h.boardroomBonus,expected);
  assert.equal(next.pay,s.pay+h.fee+expected);
  assert.equal(next.cash,s.cash+h.profit+h.financing-h.principal-h.investment-h.fee-h.devilPayment-expected);
  const walletBeforeSupport=s.personalCash+h.fee+expected-G.PERSONAL.living-(h.personalDevilPayment||0);
  if(walletBeforeSupport>=0)assert.equal(next.personalCash+h.supportPaid,walletBeforeSupport);
  else assert.equal(next.personalCash,0);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(next))).week,next.week);
  s=next;
 }
}
let x=G.initial(45),candidate=G.boardroomDemand(x);
assert.ok(candidate,'First meeting should have a personal incentive');
const accept=G.play(x,candidate.actionId);
assert.equal(accept.lastResult.boardroomBonus,candidate.bonus);
const rejectId=G.weeklyOffers(x).find(o=>o.id!==candidate.actionId).id;
const reject=G.play(x,rejectId);
assert.equal(reject.lastResult.boardroomBonus,0);
const old={...G.initial(22)};
const oldLoaded=G.validateSaved(old);
assert.equal(oldLoaded.week,old.week);
// The display deliberately contains no rendered platform emoji characters.
for(const file of ['index.html','app.js','engine.js']){
 const s=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 assert.doesNotMatch(s,/\p{Extended_Pictographic}/u,`Platform emoji remains in ${file}`);
}
console.log('PASS: v0.9 boardroom 2400 campaigns, boss incentive, personal vs shop budgets, no emoji');