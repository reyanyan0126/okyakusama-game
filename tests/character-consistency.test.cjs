'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../character-canon'),U=require('../pixel-ui'),P=require('../plain-copy'),G=require('../engine');
test('canon specifies identity, relationships and voice without inventing demographics',()=>{
 for(const [id,p]of Object.entries(C.profiles)){for(const k of ['name','job','gender','age','first','second','politeness','personality','normal','angry','troubled','happy','player','relations','allowed','forbidden','source'])assert(p[k],id+' '+k);}
 for(const [role,edits]of Object.entries(C.edits))for(const [before,after]of Object.entries(edits)){assert.notEqual(before,after);assert(!C.profiles[role].forbidden.some(s=>after.includes(s)),role+after);}
});
test('all shipped attributed lines follow voice rules after legacy display conversion',()=>{
 let count=0;
 for(const file of ['app.js','engine.js','stories.js','scene.js','management.js','pixel-story-copy.js','plain-copy.js'])for(const m of fs.readFileSync(file,'utf8').matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'/g)){
  if(m[0].startsWith('/'))continue;const raw=vm.runInNewContext(m[0]);if(typeof raw!=='string')continue;
  const text=P.text(raw);assert.equal(P.text(text),text,file+': idempotent');
  for(const p of C.split(text)){if(!p.role)continue;count++;if(['worker','manager','customer'].includes(p.role)){const spoken=p.text.replace(/「[^」]*」|『[^』]*』/g,'');for(const bad of C.profiles[p.role].forbidden)assert(!spoken.includes(bad),file+': '+p.speaker+' '+p.text);}}
 }assert(count>300);
});
test('speaker parsing handles nested quotes, outsiders and empty speech safely',()=>{
 const text='元従業員「辞めました」社員「給料です」客「俺が会計？」森さん「私も並ぶね」社長の内緒話「俺の「大成功」だ」';
 assert.deepEqual(C.split(text).filter(x=>x.speaker).map(x=>x.role),[null,'worker',null,'customer','boss']);
 const html=U.dialogue('boss',text);assert.equal((html.match(/class="portrait"/g)||[]).length,3);assert(!html.includes('undefined'));assert.equal(U.dialogue('manager',''),'');assert.equal(U.character('typo'),'');assert.equal(U.character('boss','typo'),'');assert.equal(U.actor('boss','normal',''),'');
 for(const raw of ['社長の謝罪より、商品の説明が聞きたい。','お客様のために？ 誰のお客様？','最近ちょっといいじゃない！','悪くはない。褒めてないけど。']){const html=U.dialogue('customer',raw);assert(!/説明しろ|ためだろ|じゃん|するなよ/.test(html));assert.equal(P.text(html),html);}
 assert(!U.dialogue('worker','いつもの売り場に戻りました。').includes('始めるなよ'));
 assert(!U.narrative('記者「質問です」').includes('class="portrait"'));assert(!U.dialogue('boss','<script>').includes('<script>'));
});
test('all character and customer image paths exist; general and special IDs stay separate',()=>{
 const sw=fs.readFileSync('sw.js','utf8');assert(sw.includes('./character-canon.js'));
 for(const role of Object.keys(C.profiles))for(const mood of Object.keys(U.moods))for(const face of [true,false]){const src=U.character(role,mood,face).match(/src="([^"]+)"/)[1];assert(fs.existsSync(src));assert(sw.includes(src));}
 assert.equal(U.customerProfiles.length,40);assert.equal(new Set(U.customerProfiles.map(x=>x.id)).size,40);
 for(const g of U.customerProfiles){assert(g.action&&g.role&&g.speech);const n=g.index;assert(fs.existsSync(`assets/work-import/customers/customers_${String(Math.floor((n-1)/8)+1).padStart(2,'0')}_${String((n-1)%8+1).padStart(2,'0')}.png`));}
});
test('store actions use state, not random people, without changing simulation',()=>{
 const s=G.initial(11,{difficulty:'easy'}),before=JSON.stringify(s);
 for(const [change,action]of [[{staff:30},'レジ応援中'],[{workforce:{fatigue:90}},'交代で休憩中'],[{fire:80},'問い合わせ対応中'],[{cash:1},'支払い確認中'],[{sat:90},'レジ対応中'],[{frust:90},'商品の説明中'],[{bankrupt:true},'閉店作業中']]){const state={...s,...change};assert.equal(U.activity(state).action,action);assert(U.floor(state).includes(action));}
 assert(U.floor(s,0).includes('開店準備中'));assert(U.floor(s,2).includes('売上集計中'));assert(U.floor(s,3).includes('閉店点検中'));
 assert.equal(U.guests(s,'news'),'');assert.equal(U.guests(s,'voice'),'');assert.equal(JSON.stringify(s),before);
 const app=fs.readFileSync('app.js','utf8');assert(!app.includes('U.scene('));assert(!app.includes('U.guests('));
});

test('consecutive lines share a portrait until the speaker changes', () => {
  const html = U.dialogue('boss','社長「一つ目」 社長「二つ目」 店長「確認します」社長「三つ目」');
  assert.equal((html.match(/class="portrait"/g)||[]).length,3);
  for(const line of ['一つ目','二つ目','確認します','三つ目']) assert(html.includes(line));
});
