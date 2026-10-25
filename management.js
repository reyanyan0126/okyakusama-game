/* Additive management rules. Existing saves deliberately remain on legacy rules. */
(function(root){
'use strict';
const DIFFICULTIES={easy:{name:'やさしい',cash:300000,target:1800000},normal:{name:'標準',cash:195000,target:2550000},hard:{name:'厳しい',cash:150000,target:2900000}};
const ENDINGS={ideal:['理想の経営者','利益も休憩も守った。社長「私が何もしなかった成果だ」。'],profit:['利益こそ正義','利益目標を達成。会議では数字だけが拍手をした。'],customer:['お客様は神様','常連のために利益を譲った。神様も家賃までは払わない。'],black:['ブラック企業大賞','帳簿は黒字を目指した。職場の黒さだけは目標を超えた。'],viral:['炎上商法の天才','火消しと集客が同じ部署になった。消火器は広告費扱いだ。'],legend:['伝説のコンサル','契約を大幅超過。社長はあなたの名前を自分の名前に直して発表した。'],bankrupt:['倒産','資金が尽きた。社長「お客様のために、という看板は売れるかな」。'],revenge:['社長の逆襲','契約未達。社長は責任だけをあなたの個人事業に外注した。']};
const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
function setup(s,difficulty){
 if(!Object.hasOwn(DIFFICULTIES,difficulty))throw Error('難易度が不正です');
 const d=DIFFICULTIES[difficulty];
 return {...s,managementVersion:1,difficulty,cash:d.cash,contractGoal:d.target,workforce:{morale:65,fatigue:20,turnover:0,departures:0}};
}
function workforce(s,id,roll){
 if(s.managementVersion!==1)return {cost:0,demand:1,note:''};
 const w=s.workforce,kind=['restorestaff','loyalty','fix_people','ceocut','explain'].includes(id),cuts=['staff','cheap','shrink'].includes(id);
 w.fatigue=clamp(w.fatigue+(60-s.staff)/5-3-(kind?6:0)-(s.upgrades?.people||0));
 w.morale=clamp(w.morale+(kind?7:0)-(cuts?9:0)+(s.sat>=75?2:0)-(w.fatigue>=65?5:0));
 const quality=clamp(s.staff*.5+w.morale*.35+(100-w.fatigue)*.15);
 w.turnover=Math.min(30,Math.max(0,Math.round((w.fatigue-55)*.3+(40-w.morale)*.25)));
 const departed=roll*100<w.turnover;
 if(departed){w.departures++;s.staff=Math.max(30,s.staff-5);w.fatigue=clamp(w.fatigue+4);}
 const hidden=s.week>=20&&w.morale>=90&&w.fatigue<20&&w.departures===0&&!s.hiddenEventSeen;
 if(hidden)s.hiddenEventSeen=true;
 const complaints=quality<45?3:quality>=70?-1:0;
 s.frust=clamp(s.frust+complaints);s.sat=clamp(s.sat-complaints);
 return {cost:departed?18000:0,demand:Math.max(.92,Math.min(1.04,1+(quality-60)*.0015)),quality,departed,note:hidden?'隠し会議「誰も辞めない職場」。社長「退職者ゼロとは、送別会の予算削減に成功したな」。店長は有給申請書を差し出した。':departed?'従業員が退職。採用・引継ぎ費18,000円。社長「人材は宝。補充は経費」。':w.fatigue>=65?'従業員「休憩もお客様のためになります」。社長は議事録から休憩を消した。':kind?'現場の声を聞いた。社長「聞くだけなら無料だと思っていた」。':''};
}
function ending(s,goal,legacy){
 if(s.managementVersion!==1||!legacy)return legacy;
 const w=s.workforce,fires=s.history.filter(h=>h.fireHit).length;
 const id=s.bankrupt?'bankrupt':s.personalFailed?'revenge':w.morale<=35||w.departures>=3?'black':fires>=3&&s.notoriety>=25?'viral':goal.passed&&goal.profit>=s.contractGoal*1.25&&s.skill>=85?'legend':goal.passed&&s.storeRep>=75&&w.morale>=65&&w.fatigue<=40?'ideal':s.sat>=80&&s.storeRep>=65?'customer':goal.passed?'profit':'revenge';
 return {...legacy,id,name:ENDINGS[id][0],line:ENDINGS[id][1],legacyName:legacy.name,legacyLine:legacy.line};
}
function validate(s){
 if(s.managementVersion===undefined){if(s.workforce!==undefined||s.difficulty!==undefined)throw Error('経営ルールの指定がありません');return;}
 if(s.managementVersion!==1||!Object.hasOwn(DIFFICULTIES,s.difficulty))throw Error('経営ルールが不正です');
 if(s.hiddenEventSeen!==undefined&&typeof s.hiddenEventSeen!=='boolean')throw Error('隠しイベントの記録が不正です');
 const w=s.workforce;
 if(!w||Array.isArray(w)||typeof w!=='object'||['morale','fatigue','turnover','departures'].some(k=>!Number.isSafeInteger(w[k])||w[k]<0||w[k]>(k==='departures'||k==='turnover'?30:100)))throw Error('従業員データが不正です');
}
const api={DIFFICULTIES,ENDINGS,setup,workforce,ending,validate};root.ManagementRules=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
