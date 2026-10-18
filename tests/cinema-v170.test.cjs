'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const B=require('../assets/storyboards-v150.js');
const G=require('../engine.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const svg=read('assets/episode-cinema-v170.svg');
const old=read('assets/storyboards-v150.svg');
const prologue=read('assets/prologue-v160.svg');
const styles=read('styles.css');
const app=read('app.js');
const sw=read('sw.js');
const ids=G.STORIES.EPISODES.flatMap(e=>e.choices.map(c=>c.id));
assert.equal(G.STORIES.EPISODES.length,6);
assert.equal(ids.length,24);
assert.equal(new Set(ids).size,24);
assert.equal((svg.match(/<symbol /g)||[]).length,144);
const sceneNames=new Set();
for(const id of ids){
 assert.equal(B.family(id),id,'no generic episode art family: '+id);
 assert.equal(B.captions(id).length,3,'three action-specific beats: '+id);
 const frames=new Set();
 for(const n of [0,1,2])frames.add(B.symbol(id,'work',n));
 for(const tier of ['failure','success','great'])frames.add(B.symbol(id,'result',tier));
 assert.equal(frames.size,6,'six unique frames '+id);
 for(const ref of frames){
  const symbol=ref.split('#')[1];
  assert(symbol.startsWith('cinema-'+id+'-'),ref);
  const match=svg.match(new RegExp('<symbol id="'+symbol+'"[\\s\\S]*?<\\/symbol>'));
  assert(match,'unique SVG symbol missing: '+symbol);
  assert(match[0].includes('data-role='),'cast not represented for '+symbol);
  assert(match[0].includes('viewBox="0 0 720 420"'));
  assert(match[0].includes('<title>'),'scene must have useful description');
  sceneNames.add(symbol);
 }
 const captions=B.captions(id);
 assert.equal(new Set(captions).size,3,'one scene does not repeat the same caption');
}
assert.equal(sceneNames.size,144);
for(const n of ['raise','quality','staff','recall','maintenance']){
 assert(B.symbol(n,'work',0).includes('policies-v160.svg'));
}
assert.equal((prologue.match(/data-role="suited-consultant"/g)||[]).length,5,'protagonist in business suit throughout introduction');
assert.equal((old.match(/<symbol /g)||[]).length,48,'old art retained only for non-active compatibility');
assert(styles.includes('animation-iteration-count:1!important'),'global finite animation policy');
assert(!/animation-iteration-count:\s*infinite\s*!important/.test(styles));
assert(app.includes('B?.family(h.actionId)'));
assert(sw.includes('okyakusama-v1.7.0-cache-1'));
assert(sw.includes('assets/episode-cinema-v170.svg'));
console.log('PASS v1.7.0: 24 independent episodes, 144 illustrated frames, suited protagonist, finite motion and offline cache');
