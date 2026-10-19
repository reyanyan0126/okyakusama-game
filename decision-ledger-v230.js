/* v2.3 decision ledger + v2.4 strategy statistics. Read-only, no invented causation. */
(function(root){'use strict';
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
const numtext=v=>Math.round(v).toLocaleString('ja-JP');
const yen=v=>num(v)===null?'記録なし':numtext(v)+'円';
const sign=v=>num(v)===null?'不明':(v>0?'+':'')+numtext(v);
const VERDICT={failure:'失敗',success:'成功',great:'大成功'};
const safe=v=>String(v??'');
function weekly(h){
 const impact=h.actionImpact;
 function split(field,delta){
  const a=num(impact?.[field]),total=num(h[delta]);
  return {action:a,total,other:a===null||total===null?null:total-a};
 }
 const factors=[];
 if(h.accidentId)factors.push((h.accidentPositive?'好材料':'事故')+'：'+safe(h.accidentTitle||'臨時イベント'));
 if(h.fireHit)factors.push('炎上イベント');
 if(h.memoryEvent)factors.push('過去の施策の再燃');
 if(h.boycottActive)factors.push('不買運動');
 if((h.macroPenalty||0)>0)factors.push('景気・環境による追加費用 '+yen(h.macroPenalty));
 if((h.macroBonus||0)>0)factors.push('景気・環境による補助金 '+yen(h.macroBonus));
 if((h.investment||0)>0)factors.push('設備投資 '+yen(h.investment));
 if(h.devilId)factors.push('悪魔の契約');
 if(h.storyEvent?.headline)factors.push('物語：'+safe(h.storyEvent.headline));
 if(Array.isArray(h.storyEcho)&&h.storyEcho.length)factors.push('過去の選択による後日談 '+h.storyEcho.length+'件');
 if(h.responseText)factors.push('事故対応：'+safe(h.responseText));
 return {
  week:h.week,action:safe(h.actionName||h.actionId||'施策不明'),
  tier:VERDICT[h.performanceTier]||'判定記録なし',
  rep:split('rep','deltaRep'),sat:split('sat','deltaSat'),fire:split('fire','deltaFire'),
  sales:num(h.sales),profit:num(h.profit),cash:num(h.cashAfter),
  deltaCash:num(h.deltaCash),personalCash:num(h.personalCashAfter),
  factors,story:safe(h.storyEvent?.text||''),summary:safe(h.title||'')
 };
}
function analyze(state){
 const hs=Array.isArray(state?.history)?state.history.filter(h=>h&&Number.isInteger(h.week)&&h.week>=1&&h.week<=30).slice(0,30):[];
 const entries=hs.map(weekly),count=p=>hs.filter(p).length,total=f=>hs.reduce((v,h)=>v+(num(h[f])||0),0);
 const assessed=hs.filter(h=>VERDICT[h.performanceTier]);
 let consecutive=0,worstStreak=0;
 for(const h of hs){
  if(num(h.profit)!==null&&h.profit<0){consecutive++;worstStreak=Math.max(worstStreak,consecutive);}
  else consecutive=0;
 }
 const sales=total('sales'),profit=total('profit');
 return {played:hs.length,entries,sales,profit,avgSales:hs.length?Math.round(sales/hs.length):0,
  profitable:count(h=>num(h.profit)!==null&&h.profit>0),
  lossWeeks:count(h=>num(h.profit)!==null&&h.profit<0),
  fires:count(h=>!!h.fireHit),incidents:count(h=>!!h.accidentId&&!h.accidentPositive),
  memories:count(h=>!!h.memoryEvent),worstStreak,assessed:assessed.length,
  successShare:assessed.length?Math.round(100*assessed.filter(h=>h.performanceTier!=='failure').length/assessed.length):null,
  last:entries.at(-1)||null};
}
function element(tag,cls,content){
 const e=document.createElement(tag);if(cls)e.className=cls;
 if(content!==undefined)e.textContent=String(content);return e;
}
function diffLine(name,info){
 const row=element('div','ledger-v230-line');
 row.append(element('strong','',name));
 row.append(element('span','',info.action===null||info.total===null?'旧記録：内訳なし':'施策 '+sign(info.action)+' / その他 '+sign(info.other)+' / 合計 '+sign(info.total)));
 return row;
}
function showWeek(node,w){
 node.replaceChildren();
 if(!w){node.append(element('p','ledger-v230-note','まだ経営記録はありません。'));return;}
 const head=element('div','ledger-v230-heading');
 head.append(element('strong','','第'+w.week+'週　'+w.action),element('span','',w.tier));
 node.append(head);
 if(w.summary)node.append(element('p','ledger-v230-note',w.summary));
 node.append(diffLine('評判',w.rep),diffLine('満足度',w.sat),diffLine('炎上度',w.fire));
 const money=element('div','ledger-v230-money');
 for(const txt of ['売上 '+yen(w.sales),'利益 '+yen(w.profit),'店の現金増減 '+(w.deltaCash===null?'記録なし':sign(w.deltaCash)+'円')])money.append(element('span','',txt));
 node.append(money,element('strong','ledger-v230-subhead','一緒に起きた出来事'));
 if(w.factors.length){
  const list=element('ul','ledger-v230-factors');
  for(const factor of w.factors)list.append(element('li','',factor));
  node.append(list);
 }else node.append(element('p','ledger-v230-note','記録された事故・後日談はありません。'));
 if(w.story)node.append(element('p','ledger-v230-story',w.story));
 node.append(element('p','ledger-v230-warning','「その他」は週の総増減から施策単独の増減を引いた差です。事故・景気・後日談の個別寄与額ではありません。'));
}
function showStats(node,s){
 node.replaceChildren();
 if(!s.played){node.append(element('p','ledger-v230-note','1週間経営すると分析できます。'));return;}
 const grid=element('div','ledger-v240-grid');
 const facts=[['経営した週',s.played+'週'],['累計営業利益',yen(s.profit)],
 ['黒字の週',s.profitable+'/'+s.played+'週'],['赤字の週',s.lossWeeks+'/'+s.played+'週'],
 ['事故の週',s.incidents+'週'],['炎上の週',s.fires+'週'],
 ['過去施策の再燃',s.memories+'週'],['最長連続赤字',s.worstStreak+'週']];
 for(const [k,v] of facts){
  const card=element('div','ledger-v240-stat');
  card.append(element('span','',k),element('strong','',v));grid.append(card);
 }
 node.append(grid);
 node.append(element('p','ledger-v230-note','1週平均売上 '+yen(s.avgSales)+'。成功・大成功は、判定記録がある'+s.assessed+'件中'+(s.successShare===null?'計算対象なし':s.successShare+'%')+'。'));
 node.append(element('p','ledger-v230-warning','過去の実績値です。次の週の成功確率や必勝法を保証する指標ではありません。'));
}
function saved(){
 try{
  const raw=localStorage.getItem('okyakusama.save.v1');
  if(!raw||!root.GameEngine?.validateSaved)return null;
  return root.GameEngine.validateSaved(JSON.parse(raw));
 }catch(_){return null;}
}
function mount(){
 const records=document.getElementById('recordsView'),anchor=records?.querySelector('.records-summary');
 if(!anchor||document.getElementById('decisionReviewV230'))return;
 const review=element('details','ledger-v230');review.id='decisionReviewV230';
 review.append(element('summary','','選択と結果の内訳を見る'));
 review.append(element('p','ledger-v230-note','施策の直接効果と週全体の変化を区別します。'));
 const picker=element('select','ledger-v230-picker');picker.id='ledgerWeekPickerV230';picker.setAttribute('aria-label','振り返る週');
 const report=element('div','ledger-v230-body');report.id='ledgerWeekDetailV230';
 review.append(picker,report);
 const strategy=element('details','ledger-v230 ledger-v240');strategy.id='strategyReviewV240';
 strategy.append(element('summary','','経営成績を振り返る'));
 const numbers=element('div','ledger-v230-body');numbers.id='ledgerStrategyStatsV240';strategy.append(numbers);
 anchor.insertAdjacentElement('afterend',review);review.insertAdjacentElement('afterend',strategy);
 function refresh(){
  const data=analyze(saved()),current=picker.value;
  picker.replaceChildren();
  for(const w of data.entries.slice().reverse()){
   const o=element('option','','第'+w.week+'週｜'+w.action);o.value=String(w.week);picker.append(o);
  }
  if(data.entries.some(w=>String(w.week)===current))picker.value=current;
  else if(data.last)picker.value=String(data.last.week);
  picker.hidden=!data.entries.length;
  showWeek(report,data.entries.find(w=>String(w.week)===picker.value)||data.last);
  showStats(numbers,data);
 }
 picker.addEventListener('change',()=>{const data=analyze(saved());showWeek(report,data.entries.find(w=>String(w.week)===picker.value));});
 for(const tab of document.querySelectorAll('.game-tab[data-screen="records"]'))tab.addEventListener('click',refresh);
 review.addEventListener('toggle',()=>{if(review.open)refresh();});
 strategy.addEventListener('toggle',()=>{if(strategy.open)refresh();});
 refresh();
}
const api=Object.freeze({weekly,analyze,mount});
root.DecisionLedgerV230=api;
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
