'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const S=require('../cast-cinema-v260.js'),C=require('../cast-director-v220.js'),M=require('../manga-v200.js'),G=require('../engine.js');
const html=read('index.html'),sw=read('sw.js'),css=read('cast-cinema-v260.css'),js=read('cast-cinema-v260.js');
assert.equal(C.CAST.length,5);
assert.deepEqual(S.MOODS,['normal','happy','angry','sad','panic']);
for(const actor of C.CAST){
 for(const mood of S.MOODS){
  const ref=C.portraitRef(actor.id,mood);
  const [source,id]=ref.split('#');
  assert(read(source.replace('./','')).includes('<symbol id="'+id+'"'),'complete portrait exists '+ref);
 }
}
assert.equal(S.stageFor('press','panic','failure').duration,520);
assert.equal(S.stageFor('invalid','happy','impossible').kind,'shop');
assert.equal(S.stageFor('invalid','happy','impossible').tier,'success');
assert.equal(S.stageFor('shop','not-mood').mood,'normal');
assert(!js.includes('innerHTML')&&!js.includes('localStorage.setItem')&&!js.includes('Math.random'));
assert(js.includes('use.setAttribute('+'\'href\''+',Cast.portraitRef(person.id,mood))'));
assert(js.includes('aria-pressed'));
assert(css.includes('min-height:44px'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('.manga-panel.is-revealed[data-mood="happy"] .manga-illustrated-person'));
assert(!css.includes('.arm')&&!css.includes('.hair')&&!css.includes('.face{'));
assert(html.indexOf('cast-director-v220.js')<html.indexOf('cast-cinema-v260.js'));
for(const file of ['cast-cinema-v260.js','cast-cinema-v260.css']){
 assert(html.includes(file));assert(sw.includes("'./"+file+"'"));
}
assert(sw.includes('okyakusama-v2.10.0-character-gallery-review-cache-1'));
const captions=['店長「ありがとう！」','従業員「困りました」','常連「次は改善してね」'];
const result=M.markup('quality',captions,{setting:'shop',all:true,tier:'success'});
assert.equal((result.match(/<article class="manga-panel is-revealed"/g)||[]).length,3);
assert(result.includes('data-role="manager" data-mood="happy" data-setting="shop"'));
assert(result.includes('data-role="worker" data-mood="panic" data-setting="shop"'));
const s=G.initial(45),before=JSON.stringify(s);
M.markup('quality',captions,{setting:'shop'});S.stageFor('office','sad','failure');
assert.equal(JSON.stringify(s),before);
console.log('PASS v2.6: 5x5 expression visuals, gallery stage directions, full-portrait animations and immutable game state');
