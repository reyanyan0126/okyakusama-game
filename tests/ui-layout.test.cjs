'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
test('normalized UI assets preserve aspect, source bounds and a common body scale',()=>{
 const manifest=require('../assets/ui/manifest.json');assert.equal(manifest.assets.length,152);
 const paths=new Set();for(const a of manifest.assets){assert(!paths.has(a.output));paths.add(a.output);assert(fs.existsSync(path.join(root,a.source)));const png=fs.readFileSync(path.join(root,a.output));assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],a.size);
 assert(a.crop[0]>=0&&a.crop[1]>=0&&a.crop[2]<=a.sourceSize[0]&&a.crop[3]<=a.sourceSize[1]);
 if(a.kind==='face')assert.deepEqual(a.size,[128,128]);else{assert.equal(a.size[1],224);assert(a.size[1]-a.alphaBounds[3]<=2,'ground: '+a.output);}
 }
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),assets=vm.runInNewContext(sw.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/)[1]);for(const p of paths)assert(assets.includes('./'+p),p+' offline missing');
});
test('sprite dimensions have one owner per use, without contextual overrides',()=>{
 const css=fs.readFileSync(path.join(root,'ui.css'),'utf8');for(const cls of ['character','portrait','guest']){
 const blocks=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(x=>new RegExp('\\.'+cls+'(?![-\\w])').test(x[1])&&/(?:^|;)\s*(?:width|height)\s*:/.test(x[2]));
 assert.equal(blocks.length,1,cls+' size owner');assert.equal(blocks[0][1].trim(),'.'+cls);
 }assert(css.includes('env(safe-area-inset-bottom, 0px)'));assert(!/\.working.*\.character\s*\{/.test(css));
});
test('reading action bar is explicitly scoped to one-step screens',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8');const mapping=source.match(/const readingCTA = (\{[^;]+\})\[screen\]/)[1];
 const targets=vm.runInNewContext('('+mapping+')');assert.deepEqual(Object.keys(targets).sort(),['news','outcome','prologue','report','working']);assert(source.includes('!withNav && readingCTA'));assert(source.includes('bar.append(next)'));
});
