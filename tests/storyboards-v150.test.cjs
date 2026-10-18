'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../assets/storyboards-v150.js');
const source=fs.readFileSync(path.join(__dirname,'../assets/storyboards-v150.svg'),'utf8');
const current=fs.readFileSync(path.join(__dirname,'../assets/episode-cinema-v170.svg'),'utf8');
const cinema=fs.readFileSync(path.join(__dirname,'../assets/episode-cinema-v170.svg'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
assert.equal(B.families.length,8);
assert.equal((source.match(/<symbol /g)||[]).length,48);
for(const [family,actions] of B.families)for(const id of actions){
 assert.equal(B.family(id),id,'current scene uses unique policy ID: '+id);
 const used=new Set();
 for(let i=0;i<3;i++){
  const symbol=B.symbol(id,'work',i);
  assert(cinema.includes('id="'+symbol.split('#')[1]+'"'),symbol);
  used.add(symbol);
  const markup=B.markup(id,'work',i);
  assert(markup.includes('<svg')&&markup.includes('<use href='));
 }
 for(const tier of ['failure','success','great']){
  const symbol=B.symbol(id,'result',tier);
  assert(current.includes('id="'+symbol.split('#')[1]+'"'),symbol);
  used.add(symbol);
 }
 assert.equal(used.size,6,'each action needs 6 unique frames');
 const captions=B.captions(id);assert.equal(captions.length,3);
 assert.equal(new Set(captions).size,3);
}
assert.equal(B.markup('nobody_has_this_id','work',0),null,'other policies retain compatible fallback');
assert(html.includes('<script defer src="assets/storyboards-v150.js"></script>'));
assert(js.includes('B?.family(h.actionId)'), 'legacy story captions are still used in manga');
assert(js.includes("M.markup(h.actionId,lines"),'live theater must use manga');
assert(js.includes('window.MangaCinema.result(h)'),'result uses complete comic scenes');
assert(!js.includes("B.markup(h.actionId,'work',n)"),'old CSS-animated people removed from live theater');
assert(sw.includes("'./assets/storyboards-v150.svg'"));
assert(sw.includes("'./assets/episode-cinema-v170.svg'"));
console.log('PASS v1.7.0: legacy storyboard remains valid; eight spotlight episodes are now unique per choice');
