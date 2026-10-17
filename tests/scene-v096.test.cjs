'use strict';
const assert = require('node:assert/strict');
const G = require('../engine.js');
const {describe}=require('../scene.js');
const fresh=()=>G.initial(126);
const base=fresh();
assert.equal(describe({...base,cash:430000,personalCash:155000,storeRep:79,sat:81,frust:18,fire:4}).store,'busy');
assert.equal(describe({...base,cash:151000,storeRep:44,sat:44,frust:60}).store,'quiet');
assert.equal(describe({...base,cash:64000}).store,'critical');
assert.equal(describe({...base,cash:64000,fire:62}).store,'scandal');
assert.equal(describe({...base,cash:-2000,bankrupt:true,fire:70}).store,'closed');
assert.equal(describe({...base,cash:470000,personalCash:200000,storeRep:75}).office,'upgraded');
assert.equal(describe({...base,cash:470000,personalCash:200000,storeRep:75}).bills,0);
assert.equal(describe({...base,cash:54000,personalCash:1000,arrears:16000}).bills,3);
assert.equal(describe({...base,pacts:[{id:'shop',due:3,price:1}]}).devil,true);
assert.equal(describe({...base,rootCause:'equipment',rootSolved:false}).rootIssue,'repair');
assert.equal(describe({...base,rootCause:'equipment',rootSolved:true}).rootIssue,'none');
assert.ok(describe(base).description.includes('現場')); 
// A read-only visual model must not change save data or influence any economic outcome.
let simulations=0;for(let seed=1;seed<=260;seed++){
 let s=G.initial(seed*991);
 while(!s.finished){
  const before=JSON.stringify(s),a=describe(s);
  assert.equal(JSON.stringify(s),before);assert.ok(['normal','quiet','critical','scandal','busy','closed'].includes(a.store));
  let next=G.play(s,G.weeklyOffers(s)[seed%3].id);
  if(next.rescuePending){const options=G.rescueOptions(next);if(options.length)next=G.resolveRescue(next,options[0].id)}
  s=next;simulations++;
 }
}
console.log('PASS: scenario visuals, no game-state mutation, '+simulations+' weekly turns');