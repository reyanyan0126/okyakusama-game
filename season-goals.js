/* Five-week contracts and commitments are derived from the real store ledger. */
(function(root){
'use strict';
const perkCatalog={
 merchant:{name:'商売上手',effect:'客数 +2%'},
 neighbor:{name:'地域の顔',effect:'地域施策の評判 +1'},
 mentor:{name:'現場の師匠',effect:'人材施策の失敗率 −3ポイント'},
 buyer:{name:'仕入れ上手',effect:'品質施策の費用 −10%'},
 firekeeper:{name:'火消し役',effect:'炎上度を毎週さらに1回復'},
 planner:{name:'段取り上手',effect:'効率施策の失敗率 −3ポイント'}
};
const goals={
 profit:['利益','merchant','円'], reputation:['評判','neighbor','点'], staff:['現場','mentor','人'],
 quality:['品質','buyer','点'], calm:['火消し','firekeeper','回'], growth:['成長','planner','回']
};
const endOf=week=>Math.min(30,Math.ceil(week/5)*5);
const invalid=()=>{throw Error('経営目標の記録が不正です');};
function initialize(s){
 s.perks=[];s.seasonGoal=null;s.seasonReview=null;s.seasonLog=[];
}
function needsGoal(s){return s.strategyVersion===380&&!s.finished&&!s.seasonGoal&&!s.seasonReview;}
function condition(id,n){
 return {profit:'期間利益 '+n.toLocaleString('ja-JP')+'円以上',reputation:'期末評判 '+n+'以上',staff:'期間中の離職 '+n+'人以下',quality:'期末品質 '+n+'以上',calm:'期間中の炎上 '+n+'回以下',growth:'大成功 '+n+'回以上'}[id];
}
function offers(s){
 if(!needsGoal(s))return [];
 const start=s.week,end=endOf(start),weeks=end-start+1;
 const target={
  profit:Math.max(0,Math.min(50000,Math.round((s.profit||0)*0.55/1000)*1000))*weeks,
  reputation:Math.min(95,s.storeRep+Math.min(weeks,3)),staff:s.workforce?.fatigue>=75?1:0,
  quality:Math.min(90,s.quality),calm:weeks>=4?1:0,growth:1
 };
 const phase=Math.ceil(start/5);
 const order=[['profit','reputation','staff'],['quality','calm','growth'],['staff','profit','quality'],['reputation','growth','calm'],['profit','staff','growth'],['quality','reputation','calm']][phase-1];
 return order.map(id=>({id,label:goals[id][0],start,end,target:target[id],condition:condition(id,target[id]),rewardId:goals[id][1]}));
}
function choose(s,id){
 const goal=offers(s).find(o=>o.id===id);
 if(!goal)throw Error('この目標は選べません');
 s.seasonGoal={...goal,startDepartures:s.workforce?.departures||0};
}
function metrics(s,g){
 const rows=s.history.filter(h=>h.week>=g.start&&h.week<=g.end);
 const profit=rows.reduce((n,h)=>n+h.profit,0);
 const departures=(s.workforce?.departures||0)-g.startDepartures;
 const value={profit,reputation:s.storeRep,staff:departures,quality:s.quality,calm:rows.filter(h=>h.fireHit).length,growth:rows.filter(h=>h.performanceTier==='great').length}[g.id];
 return {value,target:g.target,unit:goals[g.id][2],achieved:['calm','staff'].includes(g.id)?value<=g.target:value>=g.target,profit,rep:s.storeRep,fatigue:s.workforce?.fatigue||0,departures};
}
function progress(s){return s.seasonGoal?metrics(s,s.seasonGoal):null;}
function review(s){
 const g=s.seasonGoal;
 return g && s.week===g.end+1 ? {...g,...metrics(s,g)} : null;
}
function settle(s){s.seasonReview=review(s);}
function complete(s,replaceId){
 const r=review(s);
 if(!s.seasonReview||!r)throw Error('判定待ちの目標がありません');
 let perk=null,replaced=null;
 if(r.achieved&&!s.perks.includes(r.rewardId)&&replaceId!=='skip'){
  if(s.perks.length===4){
   const i=s.perks.indexOf(replaceId);
   if(i<0)throw Error('入れ替える特典を選んでください');
   replaced=replaceId;s.perks.splice(i,1);
  }
  perk=r.rewardId;s.perks.push(perk);
 }
 s.seasonLog.push({...r,perk,replaced});s.seasonGoal=null;s.seasonReview=null;
}
function validateGoal(g){
 if(!g||!Object.hasOwn(goals,g.id)||!Number.isInteger(g.start)||g.start<1||g.start>30||g.end!==endOf(g.start)||!Number.isSafeInteger(g.target)||g.target<0||g.target>({profit:250000,reputation:100,quality:90,staff:1,calm:1,growth:1})[g.id]||g.rewardId!==goals[g.id][1]||g.label!==goals[g.id][0]||g.condition!==condition(g.id,g.target)||!Number.isInteger(g.startDepartures)||g.startDepartures<0||g.startDepartures>30)invalid();
}
function validate(s){
 if(!Array.isArray(s.perks)||s.perks.length>4||new Set(s.perks).size!==s.perks.length||s.perks.some(id=>!Object.hasOwn(perkCatalog,id)))invalid();
 if(!Array.isArray(s.seasonLog)||s.seasonLog.length>6)invalid();
 let previous=0;
 for(const r of s.seasonLog){
  validateGoal(r);
  if(r.start<=previous||r.end>=s.week||typeof r.achieved!=='boolean'||!Number.isFinite(r.value)||r.perk!==null&&(!r.achieved||r.perk!==r.rewardId)||r.replaced!==null&&!Object.hasOwn(perkCatalog,r.replaced))invalid();
  previous=r.end;
 }
 if(s.seasonGoal!==null){
  validateGoal(s.seasonGoal);
  if(s.seasonGoal.start<=previous||s.seasonGoal.start>s.week||s.week>s.seasonGoal.end+1)invalid();
 }
 const pending=review(s);
 if(!!pending!==!!s.seasonReview)invalid();
 if(pending){if(s.seasonReview.id!==pending.id||s.seasonReview.end!==pending.end)invalid();s.seasonReview=pending;}
 // Recompute timelines on read. Discard obsolete or untrusted cached projections.
 delete s.futureEvents;
}
function timeline(s,G,span=5){
 if(s.finished)return [];
 const rows=[],last=Math.min(G.campaignWeeks(s),s.week+span-1);
 function add(week,kind,label,certainty='fixed',amount=0,account='none'){
  if(week>=s.week&&week<=last)rows.push({week,kind,label,certainty,amount,account});
 }
 let debt=s.debt;
 for(let w=s.week;w<=last;w++){
  add(w,'living','生活費','fixed',G.PERSONAL.living,'personal');
  if(G.PERSONAL.dueWeeks.includes(w))add(w,'support','養育費','fixed',G.PERSONAL.support,'personal');
  if(debt>0){const principal=Math.min(10000,debt);add(w,'loan','借入返済（利息込み）','fixed',principal+3000,'store');debt-=principal;}
  if(w%5===0)add(w,'season','今期の目標判定');
 }
 for(const p of s.pacts)add(p.due,'devil',p.price?'悪魔への返済':'集客契約の代償','fixed',p.price,p.id==='personal'?'personal':'store');
 for(const w of new Set(s.memory.map(m=>Math.max(s.week,m.due))))add(w,'memory','過去の施策が再燃する可能性','possible');
 for(const a of s.storyArcs)add(Math.max(s.week,a.due),'follow','以前の選択に続報','possible');
 for(const e of G.STORIES.EPISODES)add(e.week,'episode',e.id==='festival'?'町内祭り':'店舗イベント');
 add(G.campaignWeeks(s),'contract','契約終了');
 return rows.sort((a,b)=>a.week-b.week);
}
function homeTimeline(s,G){
 const items=timeline(s,G);
 const priority=['devil','support','memory','season','contract','loan','follow','episode'];
 return items.filter(e=>priority.includes(e.kind)).sort((a,b)=>a.week-b.week||priority.indexOf(a.kind)-priority.indexOf(b.kind)).slice(0,2);
}
const api={perkCatalog,initialize,validate,needsGoal,offers,choose,progress,review,settle,complete,timeline,homeTimeline};
root.SeasonGoals=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='undefined'?this:globalThis);
