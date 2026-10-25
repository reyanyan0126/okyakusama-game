'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const html=read('cast-gallery-v2100.html'),js=read('cast-gallery-v2100.js'),css=read('cast-gallery-v2100.css');
const index=read('index.html'),sw=read('sw.js');
const cast=['you','boss','manager','worker','customer'],moods=['normal','happy','angry','sad','panic'];
const portraitFiles=[
 ['you','assets/manga-cast-v200.svg','manga-you-'],
 ['boss','assets/manga-cast-v200.svg','manga-boss-'],
 ['manager','assets/portraits-v171.svg','portrait-manager-'],
 ['worker','assets/manga-cast-v200.svg','manga-worker-'],
 ['customer','assets/portraits-v171.svg','portrait-mori-']
];
for(const [id,file,prefix] of portraitFiles){
 assert(js.includes("id:'"+id+"'"),'missing cast '+id);
 const svg=read(file);
 for(const mood of moods)assert(svg.includes('id="'+prefix+mood+'"'),id+'-'+mood+' symbol does not exist');
}
assert(index.includes('href="./cast-gallery-v2100.html"'),'gallery must be reachable from title');
assert(index.includes('v2.14.0')&&!index.includes('v2.4.0 preview'),'release version is visible');
assert(/okyakusama-v2\.(14|15|16|17|18|19|20)\.0-/.test(sw),'bump PWA cache');
for(const name of ['assets/cast-gallery-art-v2110.js','cast-gallery-v2100.html','cast-gallery-v2100.js','cast-gallery-v2100.css','art-review-v280.html','art-review-v280.js','art-review-v280.css']){
 assert(sw.includes("./"+name),'cache should include '+name);
}
for(const id of ['castList','castName','castPortrait','moodPicks','castDescription','moodStatus'])assert(html.includes('id="'+id+'"'),id);
assert(js.includes("window.CastGalleryV2100="),'expose pure gallery metadata');
assert(html.includes('src="./assets/cast-gallery-art-v2110.js"'),'load artwork before interactive gallery');
assert(js.includes('window.CastGalleryArtV2110'),'use illustrated portraits in the live app');
assert(js.includes('img.className=\'illustrated-portrait\''),'actual illustrated img nodes required');
assert(css.includes('img.illustrated-portrait'),'full-size and thumbnail images styled');
assert(!js.includes('localStorage')&&!js.includes('fetch(')&&!js.includes('GameEngine'),'gallery must not access saves or game');
assert(!js.includes('innerHTML'),'avoid HTML injection');
assert(css.includes('min-height:48px')&&css.includes('prefers-reduced-motion:reduce'),'mobile accessibility');
console.log('PASS v2.11: five illustrated faces and selectable protagonist expressions, no game save changes');
