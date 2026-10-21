'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const scope={window:{}};
vm.runInNewContext(read('assets/cast-gallery-art-v2110.js'),scope,{timeout:8000});
const script=read('cast-art-v2120.js');scope.globalThis=scope.window;
vm.runInNewContext(script,scope,{timeout:8000});
const App=scope.window.CastArtV2120,art=scope.window.CastGalleryArtV2110;
assert(App && typeof App.paint==='function');
for(const role of ['you','boss','manager','worker','customer']){
 const prefix={you:'manga-you-',boss:'manga-boss-',manager:'portrait-manager-',worker:'manga-worker-',customer:'portrait-mori-'}[role];
 for(const mood of ['normal','happy','angry','sad','panic']){
  const match=App.identify('./assets/a.svg#'+prefix+mood);
  assert.equal(match.role,role);assert.equal(match.mood,mood);
  assert.equal(App.candidate(role,mood),art[role+'-'+(role==='you'?mood:'normal')]);
 }
}
assert.equal(App.identify('./assets/portraits-v171.svg#portrait-saito-normal'),null,'do not turn an unrelated character into Mori');
assert.equal(App.identify('#art-bill'),null,'do not rewrite normal SVG symbols');
const html=read('index.html'),sw=read('sw.js');
assert(html.indexOf('src="assets/cast-gallery-art-v2110.js"') < html.indexOf('src="cast-art-v2120.js"'));
assert(html.indexOf('src="cast-art-v2120.js"') < html.indexOf('src="scene-art-v211.js"'));
assert(html.indexOf('src="cast-art-v2120.js"') < html.indexOf('src="cast-director-v220.js"'));
assert(sw.includes("'./cast-art-v2120.js'")&&/okyakusama-v2\.(14|15|16|17|18|19|20)\.0-/.test(sw));
assert(script.includes("MutationObserver")&&script.includes("attributeFilter:['href','xlink:href']"),'live image changes must be monitored');
assert(!script.includes('localStorage')&&!script.includes('GameEngine')&&!script.includes('Math.random'), 'rendering must not change saves/economy');
const manifest=JSON.parse(read('assets/approved-cast-v270/art-manifest.json'));
assert.deepEqual(manifest.approvedAssets,[],'new art remains a visual prototype only');
console.log('PASS v2.12: in-game portrait mapping, live mood handling, fallback, no game/save writes');
