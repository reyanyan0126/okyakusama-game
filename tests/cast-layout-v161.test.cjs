'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const raw=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=raw('assets/storyboards-v150.svg'),core=raw('assets/policies-v160.svg');
const html=raw('index.html'),css=raw('styles.css'),sw=raw('sw.js');
const scenes=[...original.matchAll(/<symbol id="(register|robot|bento|photo|staff|parade|press|credit)-(work-[012]|failure|success|great)"([\s\S]*?)<\/symbol>/g)];
assert.equal(scenes.length,48);
const policies=[...core.matchAll(/<symbol id="policy-([a-z0-9]+)-(work-[012]|failure|success|great)"([\s\S]*?)<\/symbol>/g)];
assert.equal(policies.length,156);
for(const [full,id,phase,body] of [...scenes,...policies]){
 const roles=[...body.matchAll(/data-modern-portrait-v213="([a-z]+)"/g)].map(x=>x[1]);
 const images=[...body.matchAll(/<use href="#modern-([a-z]+)-(?:normal|happy|sad|angry|panic)"/g)].map(x=>x[1]);
 assert.equal(roles.length,2,'two independent illustrated figures: '+id+' '+phase);
 assert.equal(images.length,2,'two illustration references: '+id+' '+phase);
 assert.deepEqual(roles,images,'each illustrated figure uses the corresponding portrait: '+id+' '+phase);
 assert.notEqual(roles[0],roles[1],'avoid displaying the same character twice: '+id+' '+phase);
}
const kinds=new Set([...scenes,...policies].flatMap(x=>[...x[3].matchAll(/data-modern-portrait-v213="([^"]+)"/g)].map(m=>m[1])));
assert(kinds.size>=5,'five illustrated principal cast roles represented');
assert(html.includes('class="work-footer" role="group"'));
assert(css.includes('#workingScene .work-footer #workingSkip{'));
assert(css.includes('position:static!important'));
assert(css.includes('max-height:100dvh'));
assert(css.includes('overflow-y:auto'));
assert(sw.includes('okyakusama-v2.13.0-rebuilt-scenes-cache-1'));
console.log('PASS v2.13: 204 illustrated panels, 408 actors, correct portrait references, mobile footer and cache');
