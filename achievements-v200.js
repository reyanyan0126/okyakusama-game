/* v2.0.0: durable unlocks separate from the version-1 campaign save. */
(function(root){
'use strict';
const KEY='okyakusama.achievements.v1';
const G=(typeof module==='object'&&module.exports)?require('./engine.js'):root.GameEngine;
const DEFINITIONS=[
 {id:'complete',title:'契約満了',hint:'30週間を最後まで経営する',when:s=>completed(s)},
 {id:'contract',title:'再建請負人',hint:'30週間を終えて契約目標を達成する',when:s=>completed(s)&&G.goalStatus(s).passed},
 {id:'clean',title:'悪魔とは無縁',hint:'悪魔と契約せず30週間を完走する',when:s=>completed(s)&&s.pactCount===0},
 {id:'credit',title:'信用が財産',hint:'評判80以上で30週間を完走する',when:s=>completed(s)&&s.storeRep>=80},
 {id:'recovery',title:'崖っぷちからの生還',hint:'緊急再建を経て30週間を完走する',when:s=>completed(s)&&(s.rescueUsed||0)>0},
 {id:'manager',title:'現場の味方',hint:'店長の信頼15以上で30週間を完走する',when:s=>completed(s)&&(s.cast?.manager||0)>=15},
 {id:'locals',title:'町の相談役',hint:'常連の信頼15以上で30週間を完走する',when:s=>completed(s)&&(s.cast?.customers||0)>=15},
 {id:'firefighter',title:'炎上のあとで',hint:'炎上を経験し、最後の炎上度20未満で完走する',when:s=>completed(s)&&s.fire<20&&s.history.some(h=>h.fireHit)}
];
const LABELS=Object.fromEntries(DEFINITIONS.map(x=>[x.id,x.title]));
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function completed(s){return s.finished&&s.week===G.campaignWeeks(s)+1&&!s.bankrupt&&!s.personalFailed;}
function finalised(s){
 if(!s||!s.finished||s.rescuePending)return false;
 const h=s.lastResult;
 return !h||!(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&!h.accidentResponse);
}
function blank(){return {version:1,unlocked:{},endings:[]};}
function read(storage){
 let saved;
 try{saved=JSON.parse(storage.getItem(KEY)||'null');}catch(_){return blank();}
 if(!saved||saved.version!==1||!saved.unlocked||typeof saved.unlocked!=='object'||Array.isArray(saved.unlocked))return blank();
 const unlocked={};
 for(const item of DEFINITIONS)if(saved.unlocked[item.id]===true)unlocked[item.id]=true;
 const endings=Array.isArray(saved.endings)?saved.endings.filter(x=>typeof x==='string'&&x.length>0&&x.length<=120).slice(0,30):[];
 return {version:1,unlocked,endings:[...new Set(endings)]};
}
function evaluate(s){
 if(!finalised(s))return [];
 return DEFINITIONS.filter(item=>item.when(s)).map(item=>item.id);
}
function record(s,storage){
 const previous=read(storage);
 if(!finalised(s))return {newIds:[],data:previous,persisted:true};
 const next={version:1,unlocked:{...previous.unlocked},endings:[...previous.endings]};
 const gained=[];
 for(const id of evaluate(s))if(!next.unlocked[id]){next.unlocked[id]=true;gained.push(id);}
 const ending=G.ending(s)?.name;
 if(ending&&!next.endings.includes(ending))next.endings.push(ending);
 if(!gained.length&&next.endings.length===previous.endings.length)return {newIds:[],data:previous,persisted:true};
 try{storage.setItem(KEY,JSON.stringify(next));}
 catch(_){return {newIds:[],data:previous,persisted:false};}
 return {newIds:gained,data:next,persisted:true};
}
function markup(data){
 const unlocked=data?.unlocked||{};
 const count=DEFINITIONS.filter(x=>unlocked[x.id]).length;
 const items=DEFINITIONS.map(x=>'<li class="achievement-item '+(unlocked[x.id]?'is-unlocked':'')+'"><span aria-hidden="true">'+(unlocked[x.id]?'★':'☆')+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.hint)+'</small></div><span>'+(unlocked[x.id]?'達成':'未達成')+'</span></li>').join('');
 const endings=(data?.endings||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 return '<div class="achievement-summary">達成した実績 '+count+' / '+DEFINITIONS.length+'</div><ul class="achievement-list">'+items+'</ul><h3>発見したエンディング（'+(data?.endings||[]).length+'種類）</h3>'+(endings?'<ul class="achievement-endings">'+endings+'</ul>':'<p>まだ結末を記録していません。</p>')+'<p class="achievement-note">実績はこの端末に別保存されます。従来のセーブJSONには含まれず、自動同期もされません。</p>';
}
const api={KEY,DEFINITIONS,read,evaluate,record,markup,title:id=>LABELS[id]||null};
root.GameAchievements=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
