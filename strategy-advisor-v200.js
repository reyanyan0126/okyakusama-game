/* v2.0: advisory only. Predicts no game outcomes; never advances time or RNG. */
(function(root){
'use strict';
const G=(typeof module==='object'&&module.exports)?require('./engine.js'):root.GameEngine;
const yen=x=>Math.round(x).toLocaleString('ja-JP')+'円';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>Math.round(n*100)+'%';
function assess(s,id,project=null){
 if(!s||s.finished||!G.enabled(s,id))return null;
 const a=G.ACTIONS.find(x=>x.id===id),preview=G.policyPreview(s,id);
 const plan=project?G.availableProjects(s).find(x=>x.id===project):null;
 const projectCost=plan&&Number.isFinite(plan.nextCost)?plan.nextCost:0;
 const committed=(preview?.cost||0)+projectCost;
 const macro=G.currentMacro(s);
 const fixedBills=155000-(60-s.staff)*800+macro.fixed;
 const rawRisk=G.risk(s),actionRisk=G.previewRisk(s,id);
 const riskDelta=actionRisk-rawRisk, riskPoints=Math.round(riskDelta*100);
 const weeksLeft=Math.max(1,G.campaignWeeks(s)-s.week+1);
 const gap=G.goalStatus(s).profitGap,average=Math.ceil(gap/weeksLeft);
 const alerts=[];
 if(s.cash-committed<fixedBills)alerts.push({
  kind:'cash',label:'現金に注意',
  detail:'現在の店の現金は、既知の施策費・投資費を除くと'+yen(s.cash-committed)+'。参考固定費'+yen(fixedBills)+'を下回ります。売上・仕入れ・借入・返済を含む着地額の予測ではありません。'
 });
 if(s.storeRep<G.CONTRACT.reputation)alerts.push({
  kind:'reputation',label:'契約に必要な信用が不足',
  detail:'現時点の評判は'+s.storeRep+'。契約条件の'+G.CONTRACT.reputation+'以上に戻す必要があります。利益だけでは契約達成になりません。'
 });
 if(s.frust>=55||s.fire>=35)alerts.push({
  kind:'trust',label:'不満・炎上が蓄積',
  detail:'不満 '+s.frust+' / 炎上度 '+s.fire+'。目先の利益だけを続けると、来週以降の客足や信用にも影響します。修復策との切り替えが重要です。'
 });
 if(s.quality<=45)alerts.push({
  kind:'quality',label:'品質監査への備え',
  detail:'品質 '+s.quality+'。衛生監査の週には低品質が是正費用と評判低下につながります。'
 });
 if(s.staff<=40)alerts.push({
  kind:'staff',label:'人手不足',
  detail:'人員 '+s.staff+'。事故リスクが上昇しやすく、接客も不利な状態です。'
 });
 if(s.size<=70)alerts.push({
  kind:'size',label:'減量策の限界',
  detail:'内容量が'+s.size+'まで減っています。追加の減量には限界があり、顧客の不満や信用低下にも注意が必要です。'
 });
 if(s.arrears>0)alerts.push({
  kind:'personal',label:'個人の未払いにも注意',
  detail:'主人公の未払いが'+yen(s.arrears)+'あります。店の現金とは別会計なので、店の利益だけでは解消できません。'
 });
 if(riskPoints>=3)alerts.push({
  kind:'risk',label:'施策で炎上リスクが上昇',
  detail:'通常効果を仮定した基準炎上率は '+pct(rawRisk)+' → '+pct(actionRisk)+'（約+'+riskPoints+'ポイント）。独立したニュース・事故・再燃を含まない参考値です。'
 });
 else if(riskPoints<=-3)alerts.push({
  kind:'recovery',label:'炎上リスクは下がる方向',
  detail:'通常効果を仮定した基準炎上率は '+pct(rawRisk)+' → '+pct(actionRisk)+'（約'+riskPoints+'ポイント）。今週の安全を保証する値ではありません。'
 });
 if(preview?.memoryRisk)alerts.push({kind:'memory',label:'後日の再燃',detail:'この施策には数週後の再燃候補があります。発生時期や結果は確定していません。'});
 const status=alerts.some(x=>['cash','reputation','trust'].includes(x.kind))?'警戒':
   alerts.some(x=>['quality','staff','size','personal','risk'].includes(x.kind))?'注意':'通常';
 const head='経営参謀のメモ｜'+status+'・残り'+weeksLeft+'週';
 return {id,head,status,week:s.week,weeksLeft,goalGap:gap,weeklyNeeded:average,commitment:committed,projectCost,
  riskBefore:rawRisk,riskAfter:actionRisk,riskPoints,alerts:alerts.slice(0,5),
  message:a.type==='hard'?'利益優先の策です。利益が出ても信用や人員の悪化には別途対応が必要です。':'信頼・現場の維持を重視する策です。費用負担と収益目標の両方を確認しましょう。'};
}
function markup(a){
 if(!a)return '<p>施策を選ぶと、現在の経営状況に基づく参考情報を表示します。</p>';
 const list=a.alerts.length?
  '<ul class="strategy-advisor-list">'+a.alerts.map(x=>'<li><strong>'+esc(x.label)+'</strong><span>'+esc(x.detail)+'</span></li>').join('')+'</ul>':
  '<p class="strategy-advisor-clear">現在、重大な経営上の警戒条件は検出されていません。想定外の事故や社会情勢による変化には注意してください。</p>';
 return '<div class="strategy-advisor-target"><strong>契約利益まであと '+yen(a.goalGap)+'</strong><span>残り'+a.weeksLeft+'週の必要平均 '+yen(a.weeklyNeeded)+'/週。評判条件も別途満たす必要があります。</span></div>'+
  '<p class="strategy-advisor-risk">施策の通常効果を仮定した基準炎上率 '+pct(a.riskBefore)+' → '+pct(a.riskAfter)+'</p>'+
  '<p class="strategy-advisor-policy">'+esc(a.message)+'</p>'+list+
  '<p class="strategy-advisor-note">予測ではなく現時点の警戒メモです。施策の成否・景気・事故・再燃・週次売上は確定していません。選択は自由で、ゲームの計算には影響しません。</p>';
}
const api={assess,markup};
root.GameStrategyAdvisor=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
