'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../assets/cast-gallery-art-v2110.js'),'utf8');
const scope={window:{}};
vm.runInNewContext(src,scope,{timeout:8000});
const art=scope.window.CastGalleryArtV2110;
assert(art&&typeof art==='object');
const cast=['you','boss','manager','worker','customer'];
const mood=['normal','happy','angry','sad','panic'];
for(const person of cast){
 const key=person+'-normal';
 assert(art[key]?.startsWith('data:image/webp;base64,'),key+' illustration is missing');
 const bytes=Buffer.from(art[key].slice('data:image/webp;base64,'.length),'base64');
 assert(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP',key+' webp header invalid');
 assert(bytes.length>5000&&bytes.length<6000000,key+' image bytes out of range');
}
for(const expression of mood)assert(art['you-'+expression]?.startsWith('data:image/webp;base64,'),'hero '+expression+' missing');
assert.equal(Object.keys(art).length,9,'only five prototype hero expressions and four other character normal portraits');
const html=fs.readFileSync(path.join(__dirname,'../cast-gallery-v2100.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../cast-gallery-v2100.js'),'utf8');
assert(html.indexOf('assets/cast-gallery-art-v2110.js')<html.indexOf('src="./cast-gallery-v2100.js"'),'must initialize art before gallery');
assert(js.includes('btn.disabled=!hasMoods'),'do not pretend unfinished expression variants exist');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/approved-cast-v270/art-manifest.json'),'utf8'));
assert.equal(manifest.status,'draft');assert.equal(manifest.approvedAssets.length,0);
console.log('PASS v2.11: 5 illustrated actor faces, 5 hero expressions, unfinished moods disabled, official art still unapproved');
