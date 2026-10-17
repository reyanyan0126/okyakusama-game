/* お客様のために。v0.8 - survival finance, devil pacts, visual shock scenes. */
(()=>{'use strict';
const G=window.GameEngine;
const STORAGE='okyakusama.save.v1';
const $=id=>document.getElementById(id);
const yen=n=>Number(n).toLocaleString('ja-JP');
const man=n=>(n/10000).toFixed(1);
const sign=n=>(n>0?'+':'')+yen(n);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let game;
let selectedProject=null;
let selectedDevil=null;
let modalNext=null;
let toastTimer;
let resolving=false;
let lastScreen='office';
let entryMode='title';
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
function showEntry(mode){
 entryMode=mode;
 $('titleScreen').hidden=mode!=='title';
 $('contractsScreen').hidden=mode!=='contracts';
 $('app').hidden=mode!=='game';
 document.body.classList.toggle('entry-mode',mode!=='game');
 if(mode==='title'){
  const active=game.history.length>0;
  $('titleResume').hidden=!active;
  if(active)$('titleResume').innerHTML=game.finished?'前回の最終成績を見る →':`第${game.week}週からつづける →`;
 }
}
function chooseMarket(){
 if(game.history.length && !confirm('新しい依頼を受けると、現在の12週チャレンジが初期化されます。先に記録画面からバックアップできます。開始しますか？'))return;
 game=G.initial(Date.now());selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');showEntry('game');
 toast('モグモグマートの依頼を受けました！');
}
function openProposals(){
 if(resolving||!$('weekScene').hidden||game.finished)return;
 renderActions();renderDevil();$('proposalSheet').hidden=false;document.body.classList.add('scene-locked');
 $('closeProposals').focus({preventScroll:true});
}
function closeProposals(){
 if($('proposalSheet').hidden)return;
 $('proposalSheet').hidden=true;document.body.classList.remove('scene-locked');
 $('openProposals').focus({preventScroll:true});
}
function setFaces(){
 const s=game;
 const boss=s.fire>=48?'panic':s.profit>=145000?'happy':s.profit<0?'angry':'normal';
 const buyer=s.frust>=65?'angry':s.sat>=75?'happy':s.frust>=40?'sad':'normal';
 for(const [id,mood,label] of [['bossFace',boss,'店長'],['buyerFace',buyer,'消費者']]){
  $(id).dataset.mood=mood;
  $(id).setAttribute('aria-label',label+'・'+({panic:'パニック',happy:'笑顔',angry:'怒り',sad:'不満',normal:'普通'})[mood]+'の表情');
 }
}

function changeScreen(screen){
 if(!['office','voice','records'].includes(screen)||resolving)return;
 lastScreen=screen;
 if(screen==='records'&&game.history.length){$('historyPanel').hidden=false;$('historyToggle').setAttribute('aria-expanded','true');}
 for(const id of ['office','voice','records']){
  const panel=$(id+'View');panel.hidden=id!==screen;
  if(id===screen){panel.classList.remove('scene-fresh');void panel.offsetWidth;panel.classList.add('scene-fresh');}
 }
 for(const tab of document.querySelectorAll('.game-tab')){
  const active=tab.dataset.screen===screen;
  tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active));
 }
 const panel=$(screen+'View');panel.scrollTop=0;
}
const REACTIONS={
 raise:['財布が値上げに追いつく予定はありません。','10円くらいって言う人、毎回10円くれ。','商品が成長したのではなく値札が成長した。'],
 lower:['10円引いても人生の苦味は据え置き。','値下げありがとう。先週買った私には関係ないけど。','どうした、今日は急にお客様思いじゃないか。'],
 shrink:['袋を開けたら空気が先に挨拶してきた。','小さくて持ちやすい。買う理由も小さくなった。','ダイエットに協力してくれてありがとう（怒）。'],
 cheap:['味が変わった？ 私の舌が経営会議に出てないだけ？','原材料は減った。社長の自信だけ増えた。','懐かしい味は思い出の中でしか買えないのか。'],
 quality:['珍しくちゃんと改善してる。どうしたの？','味が良くなった。経理さんは生きて。','普通にうれしいニュースで逆に驚く。'],
 staff:['セルフレジの次はセルフ品出しかな。','レジ待ち中に季節がひとつ進んだ。','人件費削減の成果を客の時間で支払っている。'],
 explain:['説明だけで好感度が上がる業界ってすごい。','謝っただけでニュースになる世界。','最初から言ってよ。でも説明はありがとう。'],
 sale:['安い！ でも昨日買った。泣きたい。','特売を見て財布が緊急招集された。','セールに来たのに買う予定の物は定価。'],
 points:['ポイントって貯めるものじゃなくて消えるもの？','改定のお知らせ、得する部分だけ小さい字。','持続可能なのは店の利益だけで草。'],
 pop:['広告の写真、実物より栄養ありそう。','宣伝に感動した。商品はまだ見てない。','期待は大盛り。中身は普通盛り。'],
 tasting:['今日の試食が一番ちゃんとした昼ごはん。','おいしい。珍しく文句を言う場所がない。','タダで食べさせてくれるのが一番誠実。'],
 local:['地元の野菜、社長の言い訳より新鮮。','こういう普通の努力でいいんだよ。','やればできるのに、なんで普段やらない？'],
 restorestaff:['店員さんがいる！ 近未来のスーパーか？','レジが速い。文明が戻ってきた。','人が働いているだけで感動できる時代。'],
 apology:['社長の謝罪、珍しく原稿を読んだ。','謝ったのはいい。商品は変わった？','社長の頭が一番下がっていた。株価よりは。'],
 recall:['やっと商品が戻った。値段まで戻ったら泣く。','品質改善は拍手。社長の顔だけ曇っている。','最初からこれやってればニュースにならなかった。'],
 blame:['誤解です、じゃなくて事実を話して。','広報の人がかわいそうすぎる。','誤解だけでこんなに客が減るなら、理解されたらどうなるんだ。'],
 loyalty:['客の声を読んでくれたの？奇跡？','アンケートに「普通にして」と書いた。','店長さん、やっとレシートより長い話を聞いてくれた。'],
 stamp:['限定企画で客が殺到。私は限定に弱い。','来週も同じ値段だと思うなよ。','買ってから限定だったことに気づいた。'],
 audit:['数字公開って珍しい。普通なのに。','ちゃんと説明してくれたら、文句も減るんだよ。','社長が資料を出した瞬間、経理が泣いていた。']
};
const PUBLIC_NAMES=['買い物歴20年','節約が趣味','お弁当評論家','元・常連','レシート収集家','今日も特売待ち'];
function renderPublic(){
 const s=game;
 $('voiceTrust').textContent=s.storeRep+' / 100';
 $('voiceTrustBar').style.width=s.storeRep+'%';
 $('voiceSat').textContent=s.sat;
 $('voiceFrust').textContent=s.frust;
 $('voiceSatBar').style.width=s.sat+'%';
 $('voiceFrustBar').style.width=s.frust+'%';
 $('voiceFace').textContent=s.fire>=50?'🔥':s.frust>=60?'😡':s.sat>=75?'🥰':s.frust>=35?'😕':'🙂';
 $('voiceMoodQuote').textContent=s.fire>=50?'「社長の謝罪より、商品の説明が聞きたい」':s.frust>=60?'「お客様のために？ 誰のお客様？」':s.sat>=75?'「最近ちょっといいじゃない！」':'「悪くはない。褒めてないけど」';
 $('voiceHeadline').textContent=s.lastResult?.title??'開店準備は万端！';
 $('voiceBody').textContent=s.lastResult?.body??'まだ話題になる出来事はありません。';
 const feed=s.history.slice(-8).reverse();
 $('publicFeed').innerHTML=feed.length?feed.map((h,i)=>{
 const comments=REACTIONS[h.actionId]||['ま、次の決算を見ようか。'];
 const c=comments[(h.week+i)%comments.length];
 const person=PUBLIC_NAMES[(h.week*3+i)%PUBLIC_NAMES.length];
 return `<article class="social-post"><span class="post-avatar" aria-hidden="true">${h.fireHit?'🔥':h.memoryEvent?'🧐':h.eventType==='good'?'🥰':'🧑'}</span><div><div class="post-name">${esc(person)} <span>・第${h.week}週</span></div><p>${esc(c)}</p><small>♡ ${18+h.week*7+i*13}　 ↻ ${2+h.week+i}</small></div></article>`;
 }).join(''):'<div class="empty-feed">まだ口コミはありません。<br>まずは1週間、経営してみよう！</div>';
 $('recordsPay').textContent=yen(s.pay)+'円';
 $('recordsSales').textContent=man(s.history.reduce((sum,h)=>sum+h.sales,0))+'万円';
 $('recordsWeeks').textContent=s.history.length+'週';
 $('recordsPersonal').textContent=man(s.personalCash)+'万円';
}
function renderFlow(h){
 const entries=[
  {label:'売上',icon:'🛒',amount:h.sales,cls:'revenue'},
  {label:'仕入れ',icon:'📦',amount:h.units*h.cost,cls:'cost'},
  {label:'人件費・家賃・光熱',icon:'',amount:(h.rent??75000)+(h.payroll??50000)+(h.utilities??30000)+(h.macroFixed??0),cls:'fixed'},
  {label:'施策・事故・金利',icon:'',amount:(h.extra??0)+(h.incidentCost??0)+(h.interest??0)+(h.macroPenalty??0)-(h.macroBonus??0),cls:'surprise'}
 ];
 const denominator=Math.max(...entries.map(x=>Math.abs(x.amount)),1);
 $('moneyFlowRows').innerHTML=entries.map(e=>`<div class="flow-item"><div class="flow-caption"><span>${e.icon} ${e.label}</span><b>${e.amount<0||e.cls==='revenue'?'+':'−'}${man(Math.abs(e.amount))}万円</b></div><div class="flow-track"><span class="${e.cls}" style="width:${Math.max(1,Math.abs(e.amount)/denominator*100)}%"></span></div></div>`).join('');
 $('flowProfit').textContent=(h.profit>=0?'+':'')+man(h.profit)+'万円';
 $('flowProfit').className=h.profit>=0?'positive':'negative';
 const extraNote=h.devilNote?` ／ ${h.devilNote}`:'';
 const invested=h.investment??0;
 $('investmentResult').hidden=!invested;
 if(invested)$('investmentResult').textContent=`${h.projectLabel||'設備投資'}：${man(invested)}万円を現金から支出`;
 const loss=h.profit<0,good=h.profit>=95000;
 $('reportVerdict').className='report-verdict '+(loss?'loss':good?'good':'mid');
 $('reportVerdictIcon').textContent=loss?'💥':h.fireHit?'🔥':good?'🎉':'🧾';
 $('reportVerdictTitle').textContent=loss?'赤字！ 資金が減る':h.fireHit?'儲かったけど、大炎上':good?'今週は好調！':'黒字。でも余裕は少ない';
 $('reportVerdictSub').textContent=`現金 ${man(h.cashBefore??0)}万 → ${man(h.cashAfter??0)}万円`;
}
function showWeekReport(h,finish){
 const isFire=h.fireHit,isMemory=h.memoryEvent;
 $('workingScene').hidden=true;$('reportScene').hidden=false;
 $('reportScene').classList.toggle('is-fire',isFire);
 $('reportWeek').textContent='WEEK '+String(h.week).padStart(2,'0')+' / 12';
 renderFlow(h);
 const macro=G.MACROS.find(x=>x.id===h.macroId);
 $('economyHeadline').textContent=macro?`${macro.tag}｜${macro.name}${h.macroPenalty?'：是正費用 '+man(h.macroPenalty)+'万円':h.macroBonus?'：補助金 +'+man(h.macroBonus)+'万円':''}`:'今週の景気の変化';

 $('reportIcon').textContent=isFire?'🔥':h.accidentId?(h.accidentIcon||'⚡'):h.boycottHit?'🚫':isMemory?'💥':h.profit<0?'📉':'💰';
 $('reportTitle').textContent=isFire?'大炎上！':h.accidentId?'突発アクシデント！':h.boycottActive?'不買運動発生中！':isMemory?'過去の施策が再燃！':h.profit<0?'赤字の決算…':'今週の決算！';
 $('reportHeadline').textContent=h.title;
 $('reportDescription').textContent=h.devilNote?`${h.devilNote} ${h.body}`:h.body;
 $('reportCash').textContent=man(h.cashAfter??game.cash)+'万円';
 const dc=h.deltaCash??0;
 $('reportCashChange').textContent='先週から '+(dc>=0?'+':'')+man(dc)+'万円';
 $('reportCashChange').style.color=dc<0?'#a93f37':'#397b53';
 $('reportExpenses').textContent=man(h.personalCashAfter??game.personalCash)+'万円';
 $('reportAccident').textContent=`報酬 +${man(h.fee)}万 / 生活費 −${man(h.personalLiving??0)}万${h.supportDue?' / 養育費期限':''}${h.arrearsAfter?' / 未払い '+man(h.arrearsAfter)+'万':''}`;
 $('reportSales').textContent=man(h.sales)+'万円';
 $('reportSalesDiff').textContent='前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円';
 $('reportSalesDiff').className=h.deltaSales<0?'falling':'rising';
 $('reportProfit').textContent=man(h.profit)+'万円';
 $('reportPay').textContent=yen(h.fee)+'円';
 $('reportFrust').textContent=game.frust+' / 100';
 const delta=n=>(n>0?'+':'')+n;
 for(const [id,n,positiveGood] of [['reportReputationChange',h.deltaRep,true],['reportSatisfactionChange',h.deltaSat,true],['reportFireChange',h.deltaFire,false]]){
  const el=$(id);el.textContent=delta(n);el.className=n===0?'even':((n>0)===positiveGood?'good':'bad');
 }
 $('reportBossFace').textContent=isFire?'😱':h.profit<0?'😰':h.profit>=145000?'🤑':'👨🏻‍💼';
 $('reportTakeaway').textContent=game.personalFailed?'生活の支払いが限界。契約を続けられません':game.bankrupt?'💸 資金ショート。経営を続けられません！':h.cashAfter<80000?'🚨 残り資金が危険水準です！':isFire?'⚠️ 利益より先に評判が燃えました':h.boycottActive?'⚠️ 不買運動でお客さんが減っています':h.deltaRep<0&&h.profit>0?'💰 利益は出たけど、お店の信用が低下':h.deltaRep>0?'👏 お店の信用が上がりました':h.profit<0?'📉 売上より経費が大きい週でした':'✅ 大きなトラブルなく営業できました';
 $('reportCeo').textContent=h.ceo;
 const goal=G.goalStatus(game);
 $('reportGoal').textContent=`契約目標：利益 ${man(goal.profit)} / ${man(game.contractGoal)}万円・評判 ${goal.reputation} / ${G.CONTRACT.reputation}`;
 const next=G.weeklyBrief(game);
 $('reportNext').textContent=game.finished?'12週間の契約審査が始まります':`次の相談：${next.title}`;
 const pending=!!h.accidentId&&h.incidentCost>0&&h.accidentResponse===null;
 $('accidentDecision').hidden=!pending;
 $('reportScene').classList.toggle('is-pending',pending);
 if(pending){
  const cost=Math.min(28000,Math.round(h.incidentCost*.48)+4000);
  $('accidentRepair').textContent=`💗 補償する −${man(cost)}万円`;
  $('accidentRepair').disabled=game.cash<cost;
  $('accidentDecisionText').textContent=game.cash<cost?'補償費が足りません。信用を失っても費用を抑えるしかありません。':'今すぐ補償すれば信用を守れる。見送れば財布は守れる。';
 }
 $('reportContinue').disabled=pending;
 $('reportContinue').textContent=pending?'先にトラブル対応を選んでね':finish?'12週間の最終決算を見る →':'次の経営会議へ →';
 $('reportContinue').focus({preventScroll:true});
}
function startWeek(){
 if(resolving||!$('weekScene').hidden)return;
 if(!$('proposalSheet').hidden)closeProposals();
 if(game.finished){finishModal();return;}
 resolving=true;
 $('advanceButton').disabled=true;
 const week=game.week,choice=game.selected;
 let report;
 try{
  game=G.play(game,choice,{project:selectedProject,devil:selectedDevil});
  selectedProject=null;selectedDevil=null;
  report=game.lastResult;
  if(!save())toast('保存できません。JSON書き出しをご利用ください。');
  paint();
 }catch(err){resolving=false;$('advanceButton').disabled=false;toast(err.message||'処理に失敗しました');return;}
 $('weekScene').hidden=false;
 $('workingScene').hidden=false;
 $('shockScene').hidden=true;
 $('reportScene').hidden=true;
 $('workingWeek').textContent='WEEK '+String(week).padStart(2,'0');
 $('workingMessage').textContent='家賃・人件費・光熱費を支払っています…';
 document.body.classList.add('scene-locked');
 const duration=reducedMotion()?120:1400;
 window.setTimeout(()=>{$('workingMessage').textContent='お客様の買い物と突発ニュースを集計中…';},duration*.40);
 window.setTimeout(()=>{$('workingMessage').textContent='今週の結果を発表します！';},duration*.72);
 window.setTimeout(()=>{
  const notable=report.fireHit||report.accidentId||report.devilPayment||report.personalDevilPayment;
  if(notable&&!reducedMotion()){
   $('workingScene').hidden=true;$('shockScene').hidden=false;
   const positive=false;
   $('shockScene').classList.toggle('positive',positive);
   const crisis=report.fireHit?{title:'炎上速報！',label:'SOCIAL CRISIS',text:'週刊報告より先に、批判が届きました',art:'art-fire'}:
    report.accidentId?{title:report.accidentTitle,label:'EMERGENCY',text:'設備と資金に想定外の負荷が発生',art:report.accidentId==='freezer'?'art-warning':'art-bill'}:
    {title:'悪魔の取り立て',label:'PAYMENT DUE',text:'契約書に書いてあった期限が来ました',art:'art-devil'};
   $('shockLabel').textContent=crisis.label;$('shockTitle').textContent=crisis.title;$('shockText').textContent=crisis.text;
   $('shockUse').setAttribute('href','#'+crisis.art);
   window.setTimeout(()=>{$('shockScene').hidden=true;showWeekReport(report,game.finished);resolving=false;},950);
  }else{showWeekReport(report,game.finished);resolving=false;}
 },duration);
}
function finishWeek(){
 if(resolving||$('reportContinue').disabled)return;
 const final=game.finished;
 $('weekScene').hidden=true;
 $('workingScene').hidden=false;$('shockScene').hidden=true;$('reportScene').hidden=true;
 document.body.classList.remove('scene-locked');
 changeScreen('office');
 if(final)finishModal();
 else{
  document.querySelector('.stats-stack').classList.remove('stats-pulse');
  void document.querySelector('.stats-stack').offsetWidth;
  document.querySelector('.stats-stack').classList.add('stats-pulse');
 }
}

function load(){try{const raw=localStorage.getItem(STORAGE);if(raw)return G.validateSaved(JSON.parse(raw));}catch(err){console.warn('セーブの読み込みに失敗しました',err);}return G.initial(Date.now());}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(game));return true;}catch(err){console.warn('保存できませんでした',err);return false;}}
function toast(msg){$('toast').textContent=msg;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2800);}
function rating(s){if(s.skill>=85)return '伝説のコンサル';if(s.skill>=70)return '敏腕コンサル';if(s.skill>=55)return '期待のコンサル';if(s.skill>=35)return '駆け出し';return '要・経営改善';}
function riskLabel(n){return n>=.17?['高','high','かなり危険']:n>=.08?['中','medium','やや注意']:['低','','比較的落ち着いている'];}
function paint(){
 const s=game;
 $('personalBalance').textContent=man(s.personalCash)+'万円';
 const due=G.PERSONAL.dueWeeks.find(w=>w>=s.week);
 $('supportDue').textContent=due?`第${due}週・${man(G.PERSONAL.support)}万円`:'今期の支払い終了';
 $('arrearsBadge').hidden=!s.arrears;
 $('arrearsBadge').textContent='未払い '+man(s.arrears)+'万';
 const macro=G.currentMacro(s);
 $('macroName').textContent=macro.name;$('macroEffect').textContent=macro.detail;
 $('worldRibbon').classList.toggle('is-bad',macro.id==='inflation'||macro.id==='slump'||macro.id==='inspection');
 $('weekIndicator').textContent=`${Math.min(s.week,12)} / 12`;
 $('progressBar').style.width=`${s.finished?100:Math.round((s.week-1)/12*100)}%`;
 $('heroWeek').textContent=s.finished?'12週終了':`第${s.week}週`;
 $('decisionWeek').textContent=s.finished?'全日程終了':`第${s.week}週`;
 $('skillValue').textContent=s.skill;$('skillBar').style.width=s.skill+'%';
 $('payValue').textContent=yen(s.pay);$('notorietyText').textContent=`悪名：${s.notoriety} / 100`;
 $('consultantTitle').textContent=rating(s);
 $('cashCount').innerHTML=man(s.cash)+'<small>万円</small>';
 $('netCount').innerHTML=man(s.profit)+'<small>万円</small>';
 $('repCount').innerHTML=s.storeRep+'<small>/100</small>';
 $('heatCount').innerHTML=s.fire+'<small>/100</small>';
 $('repMeter').style.width=s.storeRep+'%';$('heatMeter').style.width=s.fire+'%';
 $('cashTrend').textContent=s.cash<0?'支払い超過！ 今すぐ資金対策を':s.cash<120000?'ピンチ！ 週の支払いに注意':s.history.length?'前週比 '+(s.lastResult.deltaCash>=0?'+':'')+man(s.lastResult.deltaCash)+'万円':'赤字が続くと資金ショート';
 document.querySelector('.play-stat.money').classList.toggle('in-danger',s.cash<120000);
 $('overheadCount').textContent='毎週 '+man(155000-(60-s.staff)*800)+'万円';
 $('loanHint').textContent=s.debt>0?' / 借入残 '+man(s.debt)+'万円':'';
 $('proposalBudget').textContent='店 '+man(s.cash)+'万 / 自分 '+man(s.personalCash)+'万｜次の養育費 '+(due?'第'+due+'週':'支払済');
 $('meetingStatus').textContent=s.cash<120000?'資金が危ない！ 収入を増やすか銀行へ。':`投資Lv：設備${s.upgrades?.equipment??0}・人材${s.upgrades?.people??0}・常連${s.upgrades?.fans??0}`;
 $('repValue').textContent=s.storeRep;$('salesValue').textContent=man(s.sales);$('fireValue').textContent=s.fire;
 $('satValue').textContent=s.sat;$('frustValue').textContent=s.frust;
 $('satBar').style.width=s.sat+'%';$('frustBar').style.width=s.frust+'%';
 setFaces();
 $('goalChip').textContent=`契約利益 ${man(G.goalStatus(s).profit)} / ${man(s.contractGoal)}万`;
 $('moodStatus').textContent=s.frust>=68?'不満爆発寸前':s.sat>=72?'ごきげん':s.frust>=43?'不満が蓄積':'まずまず';
 $('shopStatus').textContent=s.fire>=60?'大炎上':s.fire>=30?'騒動発生':'営業中';
 if(s.lastResult){$('latestHeadline').textContent=s.lastResult.title;$('latestBody').textContent=s.lastResult.body;}
 else{$('latestHeadline').textContent='開店準備は万端！';$('latestBody').textContent='今週はあなたの初仕事。まずは経営施策を1つ選んでみよう。';}
 const brief=G.weeklyBrief(s);
 $('directorQuote').textContent=brief.quote;
 $('actionHeading').textContent=brief.title;
 renderActions();renderProjects();renderDevil();renderHistory();renderPublic();
 $('advanceButton').disabled=false;
 $('openProposals').textContent=s.finished?'📋 契約結果を見る →':'💼 提案を選ぶ →';
 $('advanceButton').innerHTML=s.finished?'12週間の決算を見る <span aria-hidden="true">↗</span>':'この案で営業する <span aria-hidden="true">↗</span>';
}
function renderActions(){const s=game;
 const offers=s.finished?[G.ACTIONS.find(a=>a.id===s.selected)||G.ACTIONS[0]]:G.weeklyOffers(s);
 if(!s.finished&&!offers.some(x=>x.id===s.selected))s.selected=offers[0].id;
 $('actions').innerHTML=offers.map(a=>{
 const on=s.selected===a.id,disabled=s.finished||!G.enabled(s,a.id);
 return `<button type="button" class="action-option" role="radio" aria-checked="${on}" ${disabled?'disabled':''} data-id="${esc(a.id)}"><span class="action-emoji" aria-hidden="true"><svg class="mini-ill"><use href="#${a.type==='kind'?'art-people':'art-graph'}"/></svg></span><span class="action-name">${esc(a.name)}</span><span class="action-effect">${esc(a.effect)}</span></button>`;
 }).join('');
 const a=G.ACTIONS.find(a=>a.id===s.selected);
 $('selectedIcon').innerHTML=`<svg class="mini-ill"><use href="#${a.type==='kind'?'art-people':'art-graph'}"/></svg>`;$('selectedTitle').textContent=a.name;$('selectedDesc').textContent=a.detail;
 const r=riskLabel(G.previewRisk(s,s.selected)),label=$('riskLabel');label.textContent=r[0];label.className=r[1];
 $('riskNote').textContent=s.finished?'決算で結果を確認':r[2];
 $('pitchTone').textContent=G.weeklyBrief(s).quote;
 $('pitchTone').classList.toggle('is-crisis',!s.finished&&G.weeklyBrief(s).id==='crisis');
}
function renderProjects(){
 const s=game,options=G.availableProjects(s);
 if(selectedProject && options.find(x=>x.id===selectedProject)?.nextCost>s.cash)selectedProject=null;
 $('projectChoices').innerHTML=[{id:'none',icon:'🪙',name:'投資なし',level:0,nextCost:0,desc:'手元の資金を守る'},...options].map(o=>{
  const isNone=o.id==='none',cost=o.nextCost;
  const disabled=!isNone&&(cost===null||s.cash<cost||s.finished);
  const selected=isNone?selectedProject===null:selectedProject===o.id;
  const caption=isNone?'0円':cost===null?'最大レベル':man(cost)+'万円';
  return `<button type="button" class="project-choice ${selected?'is-selected':''}" role="radio" aria-checked="${selected}" data-project="${o.id}" ${disabled?'disabled':''}><span>${o.icon} ${esc(o.name)}</span><small>${isNone?'いつでもOK':`Lv${o.level}/2 · ${caption}`}</small></button>`;
 }).join('');
 const found=options.find(x=>x.id===selectedProject);
 $('projectNote').textContent=found?`投資：${man(found.nextCost)}万円。${found.desc}。翌週以降も効果が続きます。`:'今週は投資せず、現金を確保します。';
}
function renderDevil(){
 const available=G.pactAvailable(game);
 if(!available)selectedDevil=null;
 $('devilAvailability').textContent=available?'契約は最大2回。代償を読もう':'今は契約できません';
 $('devilChoices').innerHTML=[{id:'none',name:'契約しない',desc:'今週は人間だけで何とかする'},...G.DEVIL_OFFERS].map(o=>{
  const selected=o.id==='none'?selectedDevil===null:selectedDevil===o.id;
  return `<button type="button" class="devil-choice" role="radio" aria-checked="${selected}" data-devil="${o.id}" ${!available&&o.id!=='none'?'disabled':''}><strong>${esc(o.name)}</strong><small>${esc(o.desc)}</small></button>`;
 }).join('');
 $('devilNotice').textContent=selectedDevil?`契約「${G.DEVIL_OFFERS.find(o=>o.id===selectedDevil)?.name}」を今週の営業と同時に実行します。`:'契約は任意。先の代償を見てから決めてください。';
}
function renderHistory(){const list=$('historyList');const arr=[...game.history].reverse();$('historyCount').textContent=`${arr.length}件`;
 if(!arr.length){list.innerHTML='<p class="modal-detail">まだ経営記録はありません。</p>';return;}
 list.innerHTML=arr.map(h=>`<div class="history-item"><span class="history-week">第${h.week}週</span><div><strong>${esc(h.actionName)}</strong><p>${esc(h.scenarioTitle||'経営会議')} → ${esc(h.title)}</p></div><span class="history-number">売上 ${man(h.sales)}万</span></div>`).join('');
}
function openModal(html,next){$('modalContent').innerHTML=html;modalNext=next||null;$('modal').hidden=false;document.body.style.overflow='hidden';$('modalClose').focus();}
function closeModal(){if($('modal').hidden)return;$('modal').hidden=true;document.body.style.overflow='';const next=modalNext;modalNext=null;if(next)next();}
function resultModal(h,finish){
 const badge=h.fireHit?'大炎上！':h.accidentId?h.accidentTitle:h.memoryEvent?'過去の施策が再燃':h.boycottActive?'不買運動中':'経営報告';
 const tile=(label,big,sub,down=false)=>`<div class="result-tile"><span>${esc(label)}</span><b>${esc(big)}</b><small class="${down?'negative':''}">${esc(sub)}</small></div>`;
 const val=(n)=>n>0?'+'+n:n.toString();
 openModal(`<div class="modal-kicker">WEEK ${String(h.week).padStart(2,'0')} / 12 — ${esc(badge)}</div><h2 id="modalTitle">今週の経営結果</h2><div class="modal-news"><strong>${esc(h.title)}</strong><p>${esc(h.body)}</p></div><div class="result-grid">${tile('週間売上',man(h.sales)+'万円','前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円',h.deltaSales<0)}${tile('今週の粗利益',man(h.profit)+'万円',h.profit<0?'赤字に転落！':'売上−原価−経費',h.profit<0)}${tile('コンサル報酬',yen(h.fee)+'円','累計 '+yen(game.pay)+'円')}${tile('店の資金',man(h.cashAfter??game.cash)+'万円','前週比 '+man(h.deltaCash||0)+'万円',(h.deltaCash||0)<0)}</div><div class="modal-comment">${esc(h.ceo)}</div><div class="modal-detail">世間評価 <b>${game.storeRep}/100</b>（${val(h.deltaRep)}） ／ 炎上度 <b>${game.fire}/100</b>（${val(h.deltaFire)}）<br>有能さ <b>${game.skill}/100</b>（${val(h.deltaSkill)}）${h.boycottActive?'<br>⚠️ 不買運動による売上減少が発生':''}</div><div class="modal-actions"><button id="resultContinue" class="primary-btn" type="button">${finish?'12週間の最終決算へ':'わかった！ 次の週へ'} <span aria-hidden="true">↗</span></button></div>`,finish?()=>finishModal():null);
 $('resultContinue').addEventListener('click',closeModal);
}
function finishModal(){
 const s=game,goal=G.goalStatus(s),outcome=G.ending(s);
 const fires=s.history.filter(h=>h.fireHit).length;
 openModal(`<div class="modal-kicker">${s.bankrupt?'EMERGENCY / 資金ショート':'FINAL REPORT / 12週間の契約審査'}</div><h2 id="modalTitle">${outcome.passed?'🎉 契約達成！':'📋 契約結果のお知らせ'}</h2><div class="end-stamp">${esc(outcome.icon)} ${esc(outcome.name)}</div><div class="result-grid" style="margin-top:15px"><div class="result-tile"><span>累計利益 / 目標</span><b>${man(goal.profit)} / ${man(s.contractGoal)}万</b><small>${goal.profit>=s.contractGoal?'利益目標クリア':'利益目標まで'+man(goal.profitGap)+'万円'}</small></div><div class="result-tile"><span>評判 / 条件</span><b>${s.storeRep} / 50</b><small>${s.storeRep>=50?'信用条件クリア':'信用条件まであと'+goal.repGap}</small></div><div class="result-tile"><span>累計報酬</span><b>${yen(s.pay)}円</b></div><div class="result-tile"><span>炎上回数</span><b>${fires}回</b></div></div><div class="modal-comment">${esc(outcome.line)}</div><p class="modal-detail">主人公の財布：${man(s.personalCash)}万円 ／ 養育費未払い：${man(s.arrears)}万円 ／ 悪魔の契約：${s.pactCount}回。お店だけでなく、あなた自身も生き残れた？</p><div class="modal-actions"><button id="endRestart" class="primary-btn" type="button">新しい依頼を探す ↗</button></div>`);
 $('endRestart').addEventListener('click',()=>{closeModal();showEntry('contracts');});
}
function aboutModal(){openModal(`<div class="modal-kicker">HOW TO PLAY</div><h2 id="modalTitle">遊び方は、とっても簡単。</h2><div class="modal-detail"><ol><li><b>依頼を受ける。</b>タイトルからモグモグマートを選ぶ。</li><li><b>相談に答える。</b>店長や社長からの問題に4つの対応策から選ぶ。</li><li><b>1週間進める。</b>売上・利益・世間の評価などが変化。炎上は確率で起きる。</li><li><b>生き残る。</b>店舗資金と主人公の生活費を別々に管理。毎週の生活費・第4・8・12週の養育費を払おう。</li><li><b>社会情勢と悪魔。</b>景気や行政で売上・原価が変化。悪魔に助けを求めると期限付きの代償が発生する。</li><li><b>契約達成。</b>12週間で利益100万円・評判50以上。店の倒産や生活破綻で途中終了。</li></ol><p>「有能さ」は依頼先からの評価。「悪名」は世間の悪評。消費者の満足度と不満は別々に動くわ。</p><p>セーブはこの端末のブラウザ内に自動保存。必要ならJSONでバックアップできるの。</p><p><b>この作品はフィクション。</b>企業名・商品・事件や数値は架空で、現実の企業経営に関する助言ではありません。</p></div><div class="modal-actions"><button id="aboutClose" class="primary-btn" type="button">わかった！ ↗</button></div>`);$('aboutClose').addEventListener('click',closeModal);}
function setup(){
 game=load();paint();showEntry('title');
 $('titleStart').addEventListener('click',()=>showEntry('contracts'));
 $('titleResume').addEventListener('click',()=>{
  changeScreen('office');showEntry('game');
  if(game.lastResult?.accidentResponse===null&&game.lastResult?.incidentCost>0&&game.lastResult?.accidentId){
   $('weekScene').hidden=false;$('workingScene').hidden=true;document.body.classList.add('scene-locked');showWeekReport(game.lastResult,game.finished);
  }else if(game.finished)finishModal();
 });
 $('titleHelp').addEventListener('click',aboutModal);
 $('contractsBack').addEventListener('click',()=>showEntry('title'));
 $('acceptMarket').addEventListener('click',chooseMarket);
 $('backTitle').addEventListener('click',()=>showEntry('title'));
 $('projectChoices').addEventListener('click',ev=>{const b=ev.target.closest('[data-project]');if(!b||b.disabled||game.finished)return;selectedProject=b.dataset.project==='none'?null:b.dataset.project;renderProjects();});
 $('devilChoices').addEventListener('click',event=>{const b=event.target.closest('[data-devil]');if(!b||b.disabled)return;selectedDevil=b.dataset.devil==='none'?null:b.dataset.devil;renderDevil();});
 $('actions').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button||button.disabled||game.finished)return;game.selected=button.dataset.id;save();renderActions();});
 $('advanceButton').addEventListener('click',startWeek);
 $('openProposals').addEventListener('click',()=>game.finished?finishModal():openProposals());
 $('closeProposals').addEventListener('click',closeProposals);
 $('closeProposalBackdrop').addEventListener('click',closeProposals);
 $('reportContinue').addEventListener('click',finishWeek);
 for(const [id,response]of [['accidentRepair','repair'],['accidentIgnore','ignore']])$(id).addEventListener('click',()=>{
  try{game=G.handleAccident(game,response);save();paint();showWeekReport(game.lastResult,game.finished);toast(game.lastResult.responseText);}catch(err){toast(err.message||'対応できませんでした');}
 });
 document.querySelectorAll('.game-tab').forEach(b=>b.addEventListener('click',()=>changeScreen(b.dataset.screen)));
 $('aboutButton').addEventListener('click',aboutModal);
 $('modalClose').addEventListener('click',closeModal);
 $('modal').querySelector('.modal-backdrop').addEventListener('click',closeModal);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!$('proposalSheet').hidden)closeProposals();else if(!$('modal').hidden)closeModal();}});
 document.querySelectorAll('.hint').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.tip)));
 $('historyToggle').addEventListener('click',()=>{const p=$('historyPanel');p.hidden=!p.hidden;$('historyToggle').setAttribute('aria-expanded',String(!p.hidden));});
 $('restartButton').addEventListener('click',()=>{if(!confirm('現在の経営を初期化しますか？（元に戻せません）'))return;game=G.initial(Date.now());selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');showEntry('contracts');toast('新しい依頼を選んでください');});
 $('exportButton').addEventListener('click',()=>{
  const data=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download='okyakusama-save-v1.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('セーブをJSONで書き出しました');
 });
 $('importButton').addEventListener('click',()=>$('importInput').click());
 $('importInput').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{if(file.size>1024*1024)throw Error('ファイルが大きすぎます');const s=G.validateSaved(JSON.parse(await file.text()));if(!confirm(`第${Math.min(s.week,12)}週のデータを読み込み、今の記録を上書きしますか？`))return;game=s;selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');toast('セーブを復元しました');}
  catch(err){toast('読み込み不可：'+(err.message||'ファイルが不正です'));}
 });
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('オフライン準備に失敗',err));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();