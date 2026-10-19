'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js'),PolicySymbols=require('../policy-symbols-v173.js');
const file=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const symbols=file('assets/policy-icons-v173.svg');
const html=file('index.html'),css=file('styles.css'),app=file('app.js'),sw=file('sw.js');
const ids=[...symbols.matchAll(/<symbol id="icon-([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,26,'at least twenty-six hand-defined large icons');
assert.equal(new Set(ids).size,ids.length,'icon identifiers unique');
assert(html.includes('policy-symbols-v173.js'),'symbols module loaded before the app');
assert(html.indexOf('policy-symbols-v173.js')<html.indexOf('<script defer src="app.js"'));
assert(html.includes('id="prologuePainting"')&&html.includes('id="prologuePaintedPerson"'));
assert(html.includes('id="prologuePaintedHeading"'));
assert(app.includes('window.PolicySymbols.markup(a.id)'),'cards use big icons, not old scene thumbnails');
assert(!app.includes("B?.markup(a.id,'work',1,'presentation')"),'old tiny story thumbnails retired');
assert(app.includes('prologuePaintedPerson'),'prologue switches actual painted art');
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'));
assert(css.includes('#prologuePaintedPerson'));
assert(css.includes('.policy-symbol'));
assert(sw.includes('okyakusama-v2.6.0-cast-cinema-cache-1'));
for(const icon of ids)assert(symbols.includes('id="icon-'+icon+'"'));
const story=G.STORIES.POLICIES;
assert.equal(story.length,24);
for(const action of G.ACTIONS){
 const chosen=PolicySymbols.key(action.id);
 assert(ids.includes(chosen),'no missing pictogram for '+action.id+' -> '+chosen);
 assert.equal(PolicySymbols.markup(action.id).includes('#icon-'+chosen),true);
 if(action.id.startsWith('arc_'))assert(chosen!=='checklist'||action.id==='arc_finale_vote','authored story uses a specific pictogram '+action.id);
}
assert.equal(PolicySymbols.key('fix_equipment'),'wrench');
assert.equal(PolicySymbols.key('fix_people'),'people');
assert.equal(PolicySymbols.key('fix_fans'),'heart');
assert(!PolicySymbols.markup('quality').includes('<script'));
for(const name of [
 'illustrated-protagonist-v173.webp',
 'illustrated-protagonist-thinking-v173.webp',
 'illustrated-protagonist-determined-v173.webp']){
 const b=fs.readFileSync(path.join(__dirname,'../assets',name));
 assert(b.length>1000,'image contains substantial bitmap content '+name);
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WEBP');
 assert.equal(b.toString('ascii',12,16),'VP8 ','painted asset is decodable lossy WebP: '+name);
 const imageWidth=b.readUInt16LE(26)&0x3fff;
 const imageHeight=b.readUInt16LE(28)&0x3fff;
 assert(imageWidth>=190 && imageHeight>=220,
   'reject incomplete tiny face cutouts; expect full bust artwork '+name+' '+imageWidth+'x'+imageHeight);

 assert(sw.includes('./assets/'+name),'painted artwork cached for offline '+name);
}
const s=G.initial(1024),before=JSON.stringify(s);
const four=G.weeklyOffers(s);
assert.equal(four.length,4);
for(const a of four)assert(PolicySymbols.markup(a.id).includes('<use href='));
assert.equal(JSON.stringify(s),before,'icon selection does not mutate financial state or RNG');
console.log('PASS v1.7.3: twenty-six high-contrast symbols, all fifty-three actions, painted bitmap files, offline caching, four-choice purity');
