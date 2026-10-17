'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../assets/storyboards-v150.js');
const source=fs.readFileSync(path.join(__dirname,'../assets/storyboards-v150.svg'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
assert.equal(B.families.length,8);
assert.equal((source.match(/<symbol /g)||[]).length,48);
for(const [family,actions] of B.families)for(const id of actions){
 assert.equal(B.family(id),family);
 const used=new Set();
 for(let i=0;i<3;i++){
  const symbol=B.symbol(id,'work',i);
  assert(source.includes('id="'+symbol.split('#')[1]+'"'),symbol);
  used.add(symbol);
  const markup=B.markup(id,'work',i);
  assert(markup.includes('<svg')&&markup.includes('<use href='));
 }
 for(const tier of ['failure','success','great']){
  const symbol=B.symbol(id,'result',tier);
  assert(source.includes('id="'+symbol.split('#')[1]+'"'),symbol);
  used.add(symbol);
 }
 assert.equal(used.size,6,'each action needs 6 unique frames');
 const captions=B.captions(id);assert.equal(captions.length,3);
 assert.equal(new Set(captions).size,3);
}
assert.equal(B.markup('quality','work',0),null,'other policies retain compatible fallback');
assert(html.includes('<script defer src="assets/storyboards-v150.js"></script>'));
assert(js.includes('B?.markup(h.actionId'));
assert(js.includes("B.markup(h.actionId,'work',n)"));
assert(sw.includes("'./assets/storyboards-v150.svg'"));
console.log('PASS v1.5.0: 8 authored policy families, 24 narrative work frames, 24 unique outcome frames, compatible fallback and offline cache');
