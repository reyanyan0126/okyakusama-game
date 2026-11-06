'use strict';
const fs=require('fs'),vm=require('vm'),P=require('../plain-copy'),C=require('../character-canon');
const files=['app.js','engine.js','stories.js','management.js','scene.js','pixel-story-copy.js','plain-copy.js','pixel-ui.js'];
const entries=[];
for(const file of files){const source=fs.readFileSync(file,'utf8');for(const m of source.matchAll(/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'/g)){
 if(m[0].startsWith('/'))continue;const raw=vm.runInNewContext(m[0]);if(typeof raw!=='string'||!/[ぁ-んァ-ヶ一-龠]/.test(raw))continue;
 const display=P.text(raw),speakers=C.split(display).filter(p=>p.speaker).map(p=>({label:p.speaker,characterId:p.role,portrait:p.role?'本人の感情別画像':'画像なし（匿名・別役職）',text:p.text}));
 entries.push({file,line:source.slice(0,m.index).split('\n').length,raw,display,speakers,review:speakers.length?'発言者と役職別口調を確認':'ナレーション・UI・匿名発言として確認'});
}}
const edits=Object.entries(C.edits).flatMap(([role,lines])=>Object.entries(lines).map(([before,after])=>({role,before,after})));
const out={version:require('../package.json').version,scope:files,method:'実行対象JSの日本語文字列を収集。旧セーブの表示変換後も監査。動的なテンプレート・表情・状態分岐はブラウザテストと人物対応テストで補完。台詞以外の選択肢・見出しも含む。',counts:{stringOccurrences:entries.length,attributedOccurrences:entries.reduce((n,x)=>n+x.speakers.length,0),uniqueAttributedLines:new Set(entries.flatMap(x=>x.speakers.map(p=>p.label+'「'+p.text+'」'))).size,rewrittenVoiceLines:edits.length},profiles:C.profiles,edits,entries};
fs.writeFileSync('docs/character-audit-v340.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out.counts));
