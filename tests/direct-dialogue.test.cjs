'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),P=require('../plain-copy'),G=require('../engine');
// Audit all attributed dialogue literals in the scripts loaded by index.html,
// including dormant legacy paths needed when resuming older saves.
let reviewed=0;
for(const f of ['engine.js','stories.js','scene.js','management.js']){
 const source=fs.readFileSync(f,'utf8');
 for(const m of source.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'/g)){
  if(m[0].startsWith("/")||!/(?:社長|店長|従業員|消費者|お客様|客|常連|経理|記者|町内会長)「/.test(m[0]))continue;
  const value=vm.runInNewContext(m[0]);
  if(/(?:社長|店長|従業員|消費者|お客様|客|常連|経理|記者|町内会長)「/.test(value)){
   assert.notEqual(P.text(value),value,`${f}: unreviewed character dialogue: ${value}`); reviewed++;
  }
 }
}
assert(reviewed>150);
for(const [old]of P.replacements){const once=P.text(old);assert.equal(P.text(once),once,'Repeated rendering must not append dialogue: '+old);}
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('pixel-story-copy.js','utf8'),ctx);const C=ctx.window.PixelCopy;
for(const a of G.ACTIONS){
 for(const tier of ['failure','success','great']){const line=P.text(C.resultSatire({actionId:a.id,performanceTier:tier}));assert(line.length<180,a.id);assert.equal(P.text(line),line);}
 assert(C.REACTIONS[a.id].length>0);
 for(const line of C.REACTIONS[a.id])assert(line.length<100);
}
assert(!C.SATIRE.stamp.boss.includes('明日も'));
assert(P.text('仕入れ原価が15%増。').includes('15%'));
assert(P.text('採用・引継ぎ費18,000円。').includes('18,000円'));
console.log(`PASS ${reviewed} source dialogue literals reviewed; 53 action voices; repeat rendering and numeric instructions preserved`);

const before=JSON.stringify(G.ACTIONS);
assert.equal(Object.keys(P.choices).length,G.ACTIONS.length);
for(const action of G.ACTIONS){
 const copy=P.choices[action.id];assert(copy,action.id);
 assert.notEqual(P.text(action.name),action.name);
 assert.equal(P.text(action.name),P.text(copy.name));
 assert.equal(P.choiceDetail(action),copy.detail);
 assert(copy.name.length<=32,action.id+' button too long');
 assert(copy.detail.length<160,action.id+' explanation too long');
 assert.equal(P.text(P.text(action.name)),P.text(action.name));
}
assert.equal(JSON.stringify(G.ACTIONS),before);
assert.equal(new Set(Object.values(P.choices).map(x=>x.name)).size,53);
assert.equal(new Set(Object.values(P.choices).map(x=>x.detail)).size,53);
assert.equal(P.choiceDetail({id:'future-policy',detail:'fallback'}),'fallback');
assert(fs.readFileSync('app.js','utf8').includes('window.PlainCopy.choiceDetail(a)'));
console.log('PASS 53 distinct choice names/descriptions; immutable simulation inputs; unknown action fallback');
