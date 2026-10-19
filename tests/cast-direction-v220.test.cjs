'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const Cast=require('../cast-director-v220.js'),Manga=require('../manga-v200.js'),G=require('../engine.js');
const html=read('index.html'),sw=read('sw.js'),css=read('cast-director-v220.css'),js=read('cast-director-v220.js');
assert.equal(Cast.CAST.length,5);
assert.equal(new Set(Cast.CAST.map(c=>c.id)).size,5);
assert.equal(new Set(Cast.CAST.map(c=>c.label)).size,5);
assert.deepEqual(Cast.MOODS,['normal','happy','angry','sad','panic']);
const icon=(source,symbol)=>read(source).includes('<symbol id="'+symbol+'"');
for(const p of Cast.CAST)for(const mood of Cast.MOODS){
 const ref=Cast.portraitRef(p.id,mood),[url,id]=ref.split('#');
 assert(icon(url.slice(2),id),ref+' has an independently finished vector illustration');
}
assert.equal(Cast.expression('店長「感謝しています！」',0,'success'),'happy');
assert.equal(Cast.expression('店長「失敗だ！」',0,'success'),'sad');
assert.equal(Cast.expression('社長「責任逃れは許さない！」',0,'success'),'angry');
assert.equal(Cast.expression('従業員「どうしよう？」',1,'success'),'panic');
assert.equal(Cast.expression('店長「安心しました」',0,'success'),'normal');
assert.equal(Cast.expression('常連「残念でした」',2,'failure'),'sad');
assert.equal(Cast.expression('常連「ありがとう！」',2,'great'),'happy');
assert.equal(Manga.expression('店長「失敗だ！」',0,'success'),'sad','manga uses same emotional director');
assert.equal(Manga.expression('店長「感謝しています！」',0,'success'),'happy');
assert(Manga.art('manager','happy','shop',0).includes(Cast.portraitRef('manager','happy')));
assert(Manga.art('you','angry','office',0).includes(Cast.portraitRef('you','angry')));
const count=(str,v)=>str.split(v).length-1;
assert.equal(count(js,"document.createElementNS('http://www.w3.org/2000/svg'"),2);
assert(js.includes("panel.id='castGalleryV220'"));
assert(js.includes("document.createElement('details')"));
assert(css.includes('min-height:52px')&&css.includes('prefers-reduced-motion:reduce'));
assert(!css.includes('.arm')&&!css.includes('.hair')&&!css.includes('.face'));
assert(html.indexOf('cast-director-v220.js')<html.indexOf('manga-v200.js'),'cast registry loaded first');
for(const asset of ['cast-director-v220.js','cast-director-v220.css'])
 assert(sw.includes("'./"+asset+"'"));
assert(sw.includes('okyakusama-v2.4.0-review-preview-cache-1'));
const s=G.initial(9441),before=JSON.stringify(s);
for(const action of G.weeklyOffers(s)){Manga.markup(action.id,['店長「頑張ろう！」','従業員「失敗だ！」','常連「困ったね」'],{setting:'shop'});}
assert.equal(JSON.stringify(s),before,'display only: game state is unchanged');
console.log('PASS v2.2 Milestone A: unique cast, vector moods, gallery accessibility, preserved engine');
