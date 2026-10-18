'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const M=require('../manga-v200.js'),G=require('../engine.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const names=['normal','happy','angry','sad','panic'];
for(const mood of names){
 assert(M.EMOTION_LABELS[mood],'all five mood badges need Japanese labels');
 const full=M.art('you',mood,'office',0);
 const img=M.portraitSource('you',mood);
 assert(full.includes(img),'manga must render source for actual selected mood '+mood);
 assert(full.includes('class="manga-painted-character"'));
 assert(!full.includes('class="arm'),'person anatomy must remain a single finished image');
}
assert.notEqual(M.portraitSource('you','sad'),M.portraitSource('you','happy'));
assert.notEqual(M.portraitSource('you','angry'),M.portraitSource('you','sad'));
assert(M.portraitSource('you','sad').includes('thinking'));
assert(M.portraitSource('you','angry').includes('illustrated-protagonist-v173.webp'));
for(const source of [
 './assets/illustrated-protagonist-v173.webp',
 './assets/illustrated-protagonist-thinking-v173.webp',
 './assets/illustrated-protagonist-determined-v173.webp']){
 assert(fs.statSync(path.join(__dirname,'..',source)).size>2000,'actual picture must exist');
 assert(read('sw.js').includes("'"+source+"'"),'painting must be cached offline: '+source);
}
for(const role of ['boss','manager','worker','customer']){
 for(const mood of names)assert.equal(M.portraitSource(role,mood),'./assets/manga-painted-cast-v173.webp',
 'remaining roles continue to use full painted busts without fake expression asset claims');
}
assert.equal(M.expression('店長「良かった！」',0,'success'),'happy');
assert.equal(M.expression('社長「責任を取れ！」',0,'success'),'angry');
assert.equal(M.expression('従業員「本当に大丈夫？」',1,'success'),'panic');
assert.equal(M.expression('常連「残念だね」',0,'success'),'sad');
const manga=M.markup('office',[
 'あなたは今週の資金繰りに困った？',
 '社長「私の責任なのか！」',
 '店長「良かった！」
]);
assert.equal((manga.match(/<article /g)||[]).length,3);
assert(manga.includes('illustrated-protagonist-v173.webp'));
assert(manga.includes('data-emotion="panic"'));
assert(manga.includes('data-emotion="angry"'));
assert(manga.includes('data-emotion="happy"'));
assert.equal((manga.match(/manga-emotion-cue/g)||[]).length,3);
assert(!manga.includes('face-mouth'));
const game=G.initial(33),saved=JSON.stringify(game);
for(const emotion of names)M.art('you',emotion,'office',0);
assert.equal(JSON.stringify(game),saved,'choosing emotional assets must not affect game RNG/saves');
const css=read('styles.css');
assert(css.includes('.manga-panel[data-emotion="angry"]'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(!css.includes('.portrait-hair'));
console.log('PASS v1.7.4 painted protagonist expressions and CSS-free mood signals');
