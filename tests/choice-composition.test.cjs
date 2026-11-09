'use strict';
const assert = require('node:assert/strict');
const G = require('../engine');
const legacy = G.initial(72, {difficulty:'normal'});
const current = G.initial(72, {difficulty:'normal',choiceEdition:370});
assert.equal(legacy.choiceEdition, undefined);
assert.equal(G.validateSaved(current).choiceEdition,370);
assert.equal(G.ACTIONS.length,53);
assert(G.ACTIONS.every(a=>['GOOD','SAFE','GREEDY','RISKY','ABSURD'].includes(a.choiceClass)));
const byId = Object.fromEntries(G.ACTIONS.map(a=>[a.id,a]));
for(const [theme,ids] of Object.entries(G.THEMATIC_OFFERS)){
 assert.equal(new Set(ids).size,ids.length,theme);
 assert(ids.every(id=>byId[id]),theme);
 for(const staff of [30,60])for(const price of [150,260])for(const quality of [30,90])for(const size of [60,100]){
  const s={...current,staff,price,quality,size};
  const legal=ids.filter(id=>G.enabled(s,id)).slice(0,4);
  assert.equal(legal.length,4,theme+' '+legal);
  assert(new Set(legal.map(id=>byId[id].choiceClass)).size>=2,theme);
 }
}
assert(G.BRIEFS.every(brief=>G.THEMATIC_OFFERS[brief.id]));
for(const episode of G.STORIES.EPISODES){
 for(const ids of [episode.choices.map(a=>a.id),episode.follow]){
  assert.equal(ids.length,4);
  assert(new Set(ids.map(id=>byId[id].choiceClass)).size>=2,episode.id);
 }
}
let memories=0;
for(let seed=1;seed<=60;seed++){
 let s=G.initial(seed,{difficulty:['easy','normal','hard'][seed%3],choiceEdition:370});
 while(!s.finished){
  const offers=G.weeklyOffers(s);
  assert.equal(offers.length,4);
  assert.equal(new Set(offers.map(a=>a.id)).size,4);
  assert(offers.every(a=>G.enabled(s,a.id)));
  assert(new Set(offers.map(a=>a.choiceClass)).size>=2);
  const due=s.memory.find(m=>m.due<=s.week);
  s=G.play(s,offers[(seed+s.week)%4].id);
  if(s.lastResult.memoryEvent){
   assert.equal(s.lastResult.memoryActionId,due.kind);
   memories++;
  }
  if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
  if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0]?.id||'giveup');
  const upgraded=G.validateSaved(s);assert.deepEqual(upgraded.history,s.history);assert.equal(upgraded.rng,s.rng);assert.deepEqual(G.validateSaved(upgraded),upgraded);
 }
}
assert(memories>0);
// Replay each ending from an unmodified starting save using only actual weekly offers.
const routes=require('./fixtures/v370-endings.json');
assert.deepEqual(Object.keys(routes).sort(),Object.keys(G.MANAGEMENT.ENDINGS).sort());
for(const [ending,{seed,difficulty,actions}] of Object.entries(routes)){
 let s=G.initial(seed,{difficulty,choiceEdition:370});
 for(const id of actions){
  assert(G.weeklyOffers(s).some(action=>action.id===id),ending+' '+id);
  s=G.play(s,id);
  if(s.lastResult.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)s=G.handleAccident(s,'ignore');
  if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0]?.id||'giveup');
 }
 assert.equal(s.finished,true);
 assert.equal(G.ending(s).id,ending);
}
