/* v0.9.4 Pure, auditable cash movements. Figures are integer yen. */
(function(root){
'use strict';
const value=x=>Number.isFinite(x)?Math.trunc(x):0;
function createLedger(h,kind){
 if(!h)return {kind,week:0,start:0,end:0,delta:0,inTotal:0,outTotal:0,rows:[],sections:[],note:'まだ決算がありません。'};
 const shop=kind!=='personal';
 const end=value(shop?h.cashAfter:h.personalCashAfter);
 const start=value(shop?(h.cashBefore??(end-value(h.deltaCash))):(h.personalCashBefore??end));
 const rows=[];
 const add=(label,amount,group)=>{amount=value(amount);if(amount!==0)rows.push({label,amount,group});};
 if(shop){
   // Operating flows sum to h.profit. Never count "profit" as a second deposit.
   add('商品の売上',h.sales,'営業');
   add('商品の仕入れ',-value(h.units)*value(h.cost),'営業');
   add('家賃',-value(h.rent),'営業');
   add('従業員の給与',-value(h.payroll),'営業');
   add('光熱費',-value(h.utilities),'営業');
   add('社会情勢による固定費',-value(h.macroFixed),'営業');
   add('施策・販促費',-value(h.extra),'営業');
   add('事故による損失',-value(h.incidentCost),'営業');
   add('借入金利',-value(h.interest),'営業');
   add('行政の是正費用',-value(h.macroPenalty),'営業');
   add('補助金',h.macroBonus,'営業');
   add('銀行からの借入',h.financing,'資金移動');
   // Store-side devil cash is credited during the decision, before weekly settlement.
   if(h.devilId==='shop')add('悪魔からの前借り',185000,'資金移動');
   add('銀行への元金返済',-value(h.principal),'資金移動');
   add('設備・人材への投資',-value(h.investment),'資金移動');
   add('コンサル報酬',-value(h.fee),'資金移動');
   add('社長の特別報酬',-value(h.boardroomBonus),'資金移動');
   add('悪魔への返済',-value(h.devilPayment),'資金移動');
   add('緊急再建で確保した資金',h.rescueAmount,'資金移動');
   add('事故後の追加補償',-value(h.remedyCost),'資金移動');
 }else{
   add('店からのコンサル報酬',h.fee,'収入');
   add('社長からの特別報酬',h.boardroomBonus,'収入');
   if(h.devilId==='personal')add('悪魔からの前借り',120000,'収入');
   add('生活費',-value(h.personalLiving),'支払い');
   add('養育費の支払い',-value(h.supportPaid),'支払い');
   add('悪魔への返済',-value(h.personalDevilPayment),'支払い');
 }
 const sum=rows.reduce((a,r)=>a+r.amount,0);
 const delta=end-start;
 const residual=delta-sum;
 // Older saves may omit old report fields. Never silently claim full reconciliation.
 if(residual!==0){
   add(shop?'過去データ・未記録の入出金':'支払い不足・残高調整',residual,'確認');
 }
 const inTotal=rows.reduce((a,r)=>a+Math.max(0,r.amount),0);
 const outTotal=rows.reduce((a,r)=>a+Math.max(0,-r.amount),0);
 const sections=shop?[{name:'営業',amount:rows.filter(r=>r.group==='営業').reduce((a,r)=>a+r.amount,0),description:'売上 − 仕入れ・固定費など'},{name:'資金移動',amount:rows.filter(r=>r.group==='資金移動').reduce((a,r)=>a+r.amount,0),description:'融資・投資・報酬・返済など'}]:[];
 return {kind,week:value(h.week),start,end,delta,inTotal,outTotal,rows,sections,residual,
   note:residual!==0?(shop?'古い記録などで内訳に差額があります。差額を別行で明示しています。':'残高の不足分は未払い計上などに振り替えられます。'):shop?'営業利益と口座の増減は別です。融資や投資・報酬の支払いも現金を動かします。':'生活費と養育費は、自分の財布から払います。店の経費とは別です。'};
}
const api={createLedger};root.FinanceLedger=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);