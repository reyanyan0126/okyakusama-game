'use strict';
// v2.13 strict legacy character anatomy audit: actual distributed scene symbols,
// not just the five standalone gallery portraits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const targets=[
 ['assets/prologue-v160.svg',7,5],
 ['assets/office-cinema-v171.svg',10,20],
 ['assets/incidents-v160.svg',21,28],
 ['assets/policies-v160.svg',156,288],
 ['assets/episode-cinema-v170.svg',144,288],
 ['assets/storyboards-v150.svg',48,96],
 ['assets/root-cinema-v170.svg',18,12]
];
for(const [file,expectedScenes,minReplaced] of targets){
 const s=read(file);
 assert(s.includes('<image')&&s.includes('data:image/webp;base64,'),file+' must ship embedded original artwork');
 assert.equal((s.match(/<symbol id="(?:prologue-|office-|incident-|policy-|cinema-|register-|robot-|bento-|staff-|festival-|credit-|photo-|press-|repair-|shop-|repair-fix_)/g)||[]).length>0,true,file+' needs intact scene symbols');
 assert((s.match(/<symbol id=/g)||[]).length>=expectedScenes,file+' contains all original scenes');
 const replaced=(s.match(/data-modern-portrait-v213=/g)||[]).length+(file.includes('root-cinema')?(s.match(/<use href="#modern-/g)||[]).length:0);
 assert(replaced>=minReplaced,file+' replacements missing '+replaced+' < '+minReplaced);
 assert(!/<g\b[^>]*(?:data-character|data-role)=/.test(s),file+' must have no procedural labeled people');
 if(file.includes('incidents')) assert(!/<ellipse cx="0" cy="-97" rx="32" ry="33"/.test(s),'old cartoon faces still present');
 if(file.includes('root-cinema'))assert(!/fill="#e8c3ab"/.test(s),'root-cause round heads remain');
}
const html=read('index.html'),sw=read('sw.js');
assert(!html.includes('fill="#f3c39e"')&&!html.includes('fill="#f1be99"')&&!html.includes('fill="#efc097"'),'old storyboard people are gone');
assert((html.match(/data-modern-portrait-v213/g)||[]).length>=10);
assert(html.includes('modern-boss-normal')&&html.includes('modern-worker-normal'));
assert(sw.includes('okyakusama-v2.13.0-rebuilt-scenes-cache-1'),'PWA must invalidate old SVG assets');
const manifest=JSON.parse(read('assets/approved-cast-v270/art-manifest.json'));
assert.equal(manifest.status,'draft');
assert.deepEqual(manifest.approvedAssets,[],'art prototypes do not automatically pass final art review');
console.log('PASS v2.13: all tracked legacy scene actors replaced without changing official approval');
