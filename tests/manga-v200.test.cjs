'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Manga=require('../manga-v200.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const svg=read('assets/manga-cast-v200.svg'),css=read('styles.css');
const js=read('app.js'),html=read('index.html'),sw=read('sw.js');
const G=require('../engine.js');
assert.equal(Manga.PANELS,3);
const variants=[...svg.matchAll(/<symbol id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(variants.length,15,'three complete busts, five expressions each');
for(const role of ['boss','worker','you'])for(const mood of ['normal','happy','angry','sad','panic']){
 const id='manga-'+role+'-'+mood;
 assert(variants.includes(id),'complete-portrait symbol: '+id);
 const pattern=new RegExp('<symbol id="'+id+'"[\\s\\S]*?<\\/symbol>');
 const markup=svg.match(pattern)?.[0];
 assert(markup&&markup.includes('<title>')&&markup.includes('<ellipse'),'full human rendered in one symbol');
 assert(!markup.includes('class="arm')&&!markup.includes('class="hair'),'no independently transformed body parts');
}
assert(!css.includes('.comic-scene .arm{'));
assert(!css.includes('animation:scan-arm'));
assert(!css.includes('animation:gesture-arm'));
assert(css.includes('@keyframes manga-panel-enter'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(html.includes('<script defer src="manga-v200.js"></script>'));
assert(html.includes('id="workingComic"'));
assert(js.includes('M.markup(h.actionId,lines'));
assert(js.includes('M.reveal('));
assert(js.includes('window.MangaCinema.result(h)'));
assert(!js.includes("B.markup(h.actionId,'work',n)"));
assert(!js.includes('T.art(h.actionId'));
assert(sw.includes('okyakusama-v2.11.0-cast-illustration-gallery-cache-1'));
assert(sw.includes("'./manga-v200.js'")&&sw.includes("'./assets/manga-cast-v200.svg'"));
assert.equal(Manga.speaker('社長「責任は君にある！」',0),'boss');
assert.equal(Manga.speaker('社長がレジへ',0),'boss');
assert.equal(Manga.speaker('現場に拍手が響いた',0,'arc_finale_steal'),'boss');
assert.equal(Manga.speaker('店長「数字を見ましょう」',1),'manager');
assert.equal(Manga.speaker('常連「また来るね」',2),'customer');
assert.equal(Manga.speaker('あなたは決算を見た',0),'you');
assert.equal(Manga.expression('店長「安心しました」',0,'success'),'normal');
assert.equal(Manga.expression('店長「怒ったぞ」',0,'success'),'angry');
assert.equal(Manga.expression('店長「え？」',0,'success'),'panic');
assert.equal(Manga.expression('店長「残念」',2,'failure'),'sad');
assert.equal(Manga.expression('店長「良かった！」',2,'great'),'happy');
const first=Manga.markup('arc_register_boss',[
 '社長「私がやる！」','店長「本当に大丈夫？」','常連「<script>alert(1)</script>」'
],{setting:'register'});
assert.equal((first.match(/class="manga-panel"/g)||[]).length,3);
assert.equal((first.match(/<article class="manga-panel" data-panel="\d" data-role="[^"]+" data-mood="[^"]+" data-setting="[^"]+" aria-hidden="true">/g)||[]).length,3,'initially hide three emotion-directed panels, excluding decorative progress');
assert(first.includes('class="manga-illustrated-person"'),'one complete high-density vector person in each frame');
assert(first.includes('./assets/manga-cast-v200.svg#manga-boss-'),'boss artwork is vector and resolution-independent');
assert(first.includes('./assets/portraits-v171.svg#portrait-manager-'),'manager artwork is vector and resolution-independent');
assert(first.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
assert(!first.includes('<script>'));
assert(!first.includes('class="arm'));
assert(!first.includes('manga-painted-cast-v173.webp'),'do not enlarge old 90px portraits');
const painted=fs.readFileSync(path.join(__dirname,'../assets/manga-painted-cast-v173.webp'));
assert(painted.length>4000 && painted.toString('ascii',0,4)==='RIFF' && painted.toString('ascii',8,12)==='WEBP');
assert(sw.includes("'./assets/manga-painted-cast-v173.webp'"),'painted portraits must remain available offline');
const revealed={};
const panels=[0,1,2].map(i=>({
 attrs:{'aria-hidden':'true'},
 classList:{toggle(c,b){revealed[i]=b},},
 setAttribute(k,v){this.attrs[k]=v}
}));
const fake={querySelectorAll:()=>panels};
assert.equal(Manga.reveal(fake,0),1);
assert.deepEqual(revealed,{0:true,1:false,2:false});
assert.equal(Manga.reveal(fake,2),3);
assert.equal(panels[2].attrs['aria-hidden'],'false');
let state=G.initial(255),serialized=JSON.stringify(state);
for(const action of G.weeklyOffers(state)){
 const captions=['店長「会議」','従業員「実行」','常連「結果」'];
 const output=Manga.markup(action.id,captions,{setting:'shop'});
 assert.equal((output.match(/<article /g)||[]).length,3);
 assert(output.includes('manga-picture'));
}
assert.equal(JSON.stringify(state),serialized,'manga must not mutate saved game or RNG');
state=G.play(state,G.weeklyOffers(state)[0].id);
const result=Manga.result(state.lastResult);
assert.equal((result.match(/<article /g)||[]).length,3);
assert(result.includes('manga-strip-result'));
assert(result.includes('manga-verdict'));
assert(!result.includes('.arm'));
console.log('PASS v2.1 manga: full vector illustrated figures, 3-panel sequencing, no CSS anatomy, accessible and read-only');
