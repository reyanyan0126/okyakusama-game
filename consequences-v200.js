/* v2.0.0: readable consequences from existing saved arcs, resolved stories and boardroom records. */
(function(root){
'use strict';
const S=(typeof module==='object'&&module.exports)?require('./stories.js'):root.GameStories;
const episodes=new Map(S.EPISODES.map(x=>[x.id,x]));
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function entries(game){
 const current=Array.isArray(game?.storyArcs)?game.storyArcs:[];
 const completed=Array.isArray(game?.storyJournal)?game.storyJournal:[];
 const history=Array.isArray(game?.history)?game.history:[];
 const ongoing=current.filter(x=>x&&episodes.has(x.id)&&(x.stage==='follow'||x.stage==='echo')).map(x=>{
  const ep=episodes.get(x.id);
  const policy=ep.choices.find(p=>p.id===x.choice);
  return {title:ep.title,tag:x.stage==='follow'?'続報待ち':'結果の反響を待っています',
   body:'最初の判断：'+(policy?.name||'旧セーブに記録された選択')+'。'+(Number.isInteger(x.due)&&x.due>0?'第'+x.due+'週以降に進展する可能性。':'次の展開を待っています。'),
   positive:null,kind:'pending'};
 });
 const resolved=[...completed].reverse().filter(x=>x&&episodes.has(x.id)).map(x=>{
  const ep=episodes.get(x.id);
  return {title:ep.title,tag:x.positive?'改善につながった':'代償が残った',
    body:x.summary||'結末の説明は旧セーブに記録されていません。',positive:x.positive===true,kind:'resolved'};
 });
 const boardroom=history.filter(h=>h?.boardroomDilemma&&Number.isInteger(h.week)).reverse().map(h=>{
  const d=h.boardroomDilemma;
  return {title:'第'+h.week+'週・社長との経営会議',tag:d.followed?'社長案を採用':'社長案を見送った',
   body:d.text||'人間関係が変化しました。',positive:null,kind:'boardroom'};
 });
 return {ongoing,resolved,boardroom,count:ongoing.length+resolved.length+boardroom.length};
}
function render(items,className){
 if(!items.length)return '';
 return '<ul class="consequence-list">'+items.map(x=>'<li class="consequence-item '+className+'"><small>'+esc(x.tag)+'</small><strong>'+esc(x.title)+'</strong><p>'+esc(x.body)+'</p></li>').join('')+'</ul>';
}
function markup(game){
 const {ongoing,resolved,boardroom,count}=entries(game);
 if(!count)return '<p class="consequence-empty">まだ記録された大きな選択はありません。経営を進めると、選んだ方針の続報や後日談がここに残ります。</p>';
 return '<div class="consequence-summary">進行中 '+ongoing.length+'件・決着済み '+resolved.length+'件・社長との重要会議 '+boardroom.length+'件</div>'+
 (ongoing.length?'<h3>この先に続く問題</h3>'+render(ongoing,'is-pending'):'')+
 (resolved.length?'<h3>過去の判断の結末</h3>'+render(resolved,'is-resolved'):'')+
 (boardroom.length?'<h3>社長との駆け引き</h3>'+render(boardroom,'is-boardroom'):'')+
 '<p class="consequence-note">これは保存済みの事件・選択履歴です。まだ起きていない未来の結果は表示しません。</p>';
}
const api={entries,markup};
root.GameConsequences=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
