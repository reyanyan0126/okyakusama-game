'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const G=require('../engine'),U=require('../pixel-ui'),F=require('../forecast');
for(const options of [{},{project:'people'},{devil:'cash'}]){
 let s=G.initial(42,{difficulty:'easy'});const id=G.weeklyOffers(s)[0].id,before=JSON.stringify(s);
 // Only use real options offered by this engine.
 if(options.devil)options.devil=G.DEVIL_OFFERS[0].id;
 const f=F.estimate(G,s,id,options);
 assert(F.valid(f,1));assert.equal(JSON.stringify(s),before);
 assert.deepEqual(F.estimate(G,s,id,options),f);
 assert.deepEqual(F.estimate(G,{...s,rng:1234567},id,options),f,'preview must not disclose saved RNG');
 assert.deepEqual(G.play(s,id,options),G.play(JSON.parse(before),id,options));
 const done=G.play(s,id,options);done.presentation={week:1,stage:'report',newsIndex:0,forecast:f};
 assert.deepEqual(G.validateSaved(JSON.parse(JSON.stringify(done))).presentation.forecast,f);
}
for(const value of [null,{}, {version:1,week:1,samples:64,actionId:'x',profit:{mean:NaN}}])assert(!F.valid(value,1));
let s=G.initial(9,{difficulty:'normal'});const before=JSON.stringify(s);
assert.equal(U.stateMood({...s,cash:1,lastResult:{profit:100000}},'boss'),'anxious');
assert.equal(U.stateMood({...s,bankrupt:true,fire:99},'boss'),'sad');
assert.equal(U.stateMood({...s,fire:99},'customer'),'angry');
assert.equal(U.stateMood({...s,workforce:{morale:99,fatigue:90}},'worker'),'sad');
assert.equal(U.stateMood({...s,workforce:{morale:90,fatigue:10}},'worker'),'happy');
assert.equal(JSON.stringify(s),before);
assert(U.dialogue('boss','社長「大成功だ」','anxious',true).includes('data-mood="anxious"'));
assert.equal(Object.keys(U.moods).length,8);
const sw=fs.readFileSync('sw.js','utf8');
for(const role of ['you','boss','manager','worker','customer','devil']){
 const hashes=[];
 for(const mood of Object.keys(U.moods))for(const suffix of ['','-face','-speaking']){
  const name=`assets/pixel/${role}-${mood}${suffix}.svg`,svg=fs.readFileSync(name,'utf8');
  assert(sw.includes(name));assert(svg.includes('prefers-reduced-motion:reduce'));
  assert(svg.includes(suffix?'viewBox="16 8 64 64"':'viewBox="0 0 96 160"'));
  assert(!/<(?:filter|image|script)\b/.test(svg));
  const rects=[...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"/g)];
  assert(rects.length>0);assert(rects.some(r=>r[3]==='1'||r[4]==='1'),'new fine-grid detail');
  for(const r of rects){assert(+r[1]+ +r[3]<=96);assert(+r[2]+ +r[4]<=160);}
  if(!suffix)hashes.push(crypto.createHash('sha256').update(svg).digest('hex'));
 }
 assert.equal(new Set(hashes).size,8);
}
console.log('PASS 48 expressions / 144 assets, integer fine detail, state priority, pure independent forecasts, JSON roundtrip');
