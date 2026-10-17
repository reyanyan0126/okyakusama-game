/* お客様のために。v0.3 - compact fixed navigation and rotating weekly pitches and original save compatibility. */
(()=>{'use strict';
const G=window.GameEngine;
const STORAGE='okyakusama.save.v1';
const $=id=>document.getElementById(id);
const yen=n=>Number(n).toLocaleString('ja-JP');
const man=n=>(n/10000).toFixed(1);
const sign=n=>(n>0?'+':'')+yen(n);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let game;
let modalNext=null;
let toastTimer;
let resolving=false;
let lastScreen='office';
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
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
 restorestaff:['店員さんがいる！ 近未来のスーパーか？','レジが速い。文明が戻ってきた。','人が働いているだけで感動できる時代。']
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
}
function showWeekReport(h,finish){
 const isFire=h.fireHit,isMemory=h.memoryEvent;
 $('workingScene').hidden=true;$('reportScene').hidden=false;
 $('reportScene').classList.toggle('is-fire',isFire);
 $('reportWeek').textContent='WEEK '+String(h.week).padStart(2,'0')+' / 12';
 $('reportIcon').textContent=isFire?'🔥':h.boycottHit?'🚫':isMemory?'💥':h.profit<0?'📉':'💰';
 $('reportTitle').textContent=isFire?'大炎上！':h.boycottActive?'不買運動発生中！':isMemory?'過去の施策が再燃！':h.profit<0?'赤字の決算…':'今週の決算！';
 $('reportHeadline').textContent=h.title;
 $('reportDescription').textContent=h.body;
 $('reportSales').textContent=man(h.sales)+'万円';
 $('reportSalesDiff').textContent='前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円';
 $('reportSalesDiff').className=h.deltaSales<0?'falling':'rising';
 $('reportProfit').textContent=man(h.profit)+'万円';
 $('reportPay').textContent=yen(h.fee)+'円';
 $('reportFrust').textContent=game.frust+' / 100';
 $('reportCeo').textContent=h.ceo;
 $('reportContinue').textContent=finish?'12週間の最終決算を見る →':'次の経営会議へ →';
 $('reportContinue').focus({preventScroll:true});
}
function startWeek(){
 if(resolving||!$('weekScene').hidden)return;
 if(game.finished){finishModal();return;}
 resolving=true;
 $('advanceButton').disabled=true;
 const week=game.week,choice=game.selected;
 let report;
 try{
  game=G.play(game,choice);
  report=game.lastResult;
  if(!save())toast('保存できません。JSON書き出しをご利用ください。');
  paint();
 }catch(err){resolving=false;$('advanceButton').disabled=false;toast(err.message||'処理に失敗しました');return;}
 $('weekScene').hidden=false;
 $('workingScene').hidden=false;
 $('reportScene').hidden=true;
 $('workingWeek').textContent='WEEK '+String(week).padStart(2,'0');
 $('workingMessage').textContent='お客様が来店しています';
 document.body.classList.add('scene-locked');
 const duration=reducedMotion()?120:1400;
 window.setTimeout(()=>{$('workingMessage').textContent='売上と口コミを集計しています';},duration*.40);
 window.setTimeout(()=>{$('workingMessage').textContent='今週の結果を発表します！';},duration*.72);
 window.setTimeout(()=>{showWeekReport(report,game.finished);resolving=false;},duration);
}
function finishWeek(){
 if(resolving)return;
 const final=game.finished;
 $('weekScene').hidden=true;
 $('workingScene').hidden=false;$('reportScene').hidden=true;
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
 $('weekIndicator').textContent=`${Math.min(s.week,12)} / 12`;
 $('progressBar').style.width=`${s.finished?100:Math.round((s.week-1)/12*100)}%`;
 $('heroWeek').textContent=s.finished?'12週終了':`第${s.week}週`;
 $('decisionWeek').textContent=s.finished?'全日程終了':`第${s.week}週`;
 $('skillValue').textContent=s.skill;$('skillBar').style.width=s.skill+'%';
 $('payValue').textContent=yen(s.pay);$('notorietyText').textContent=`悪名：${s.notoriety} / 100`;
 $('consultantTitle').textContent=rating(s);
 $('repValue').textContent=s.storeRep;$('salesValue').textContent=man(s.sales);$('fireValue').textContent=s.fire;
 $('satValue').textContent=s.sat;$('frustValue').textContent=s.frust;
 $('satBar').style.width=s.sat+'%';$('frustBar').style.width=s.frust+'%';
 $('moodStatus').textContent=s.frust>=68?'不満爆発寸前':s.sat>=72?'ごきげん':s.frust>=43?'不満が蓄積':'まずまず';
 $('shopStatus').textContent=s.fire>=60?'大炎上':s.fire>=30?'騒動発生':'営業中';
 if(s.lastResult){$('latestHeadline').textContent=s.lastResult.title;$('latestBody').textContent=s.lastResult.body;}
 else{$('latestHeadline').textContent='開店準備は万端！';$('latestBody').textContent='今週はあなたの初仕事。まずは経営施策を1つ選んでみよう。';}
 $('directorQuote').textContent=s.finished?'社長「決算を開いてくれ。心の準備はできていない」':s.fire>=40?'社長「お客様の声が大きい！ ボリュームを下げてくれ！」':s.skill>=75?'社長「君は天才だ。だから来期も安く頼む！」':'社長「利益が欲しい！ ただし苦情は君が聞いてくれ！」';
 $('actionHeading').textContent=s.finished?'12週間、おつかれさま！':'今週、何をする？';
 renderActions();renderHistory();renderPublic();
 $('advanceButton').disabled=false;
 $('advanceButton').innerHTML=s.finished?'12週間の決算を見る <span aria-hidden="true">↗</span>':'この施策で1週間進める <span aria-hidden="true">↗</span>';
}
function renderActions(){const s=game;
 const offers=G.weeklyOffers(s);
 if(!offers.some(x=>x.id===s.selected))s.selected=offers[0].id;
 $('actions').innerHTML=offers.map(a=>{
 const on=s.selected===a.id,disabled=s.finished||!G.enabled(s,a.id);
 return `<button type="button" class="action-option" role="radio" aria-checked="${on}" ${disabled?'disabled':''} data-id="${esc(a.id)}"><span class="action-emoji" aria-hidden="true">${esc(a.icon)}</span><span class="action-name">${esc(a.name)}</span><span class="action-effect">${esc(a.effect)}</span></button>`;
 }).join('');
 const a=G.ACTIONS.find(a=>a.id===s.selected);
 $('selectedIcon').textContent=a.icon;$('selectedTitle').textContent=a.name;$('selectedDesc').textContent=a.detail;
 const r=riskLabel(G.previewRisk(s,s.selected)),label=$('riskLabel');label.textContent=r[0];label.className=r[1];
 $('riskNote').textContent=s.finished?'決算で結果を確認':r[2];
 $('pitchTone').textContent=s.week%3===1?'今週は強気の提案が多め':s.week%3===2?'今週は堅実な提案が多め':'攻めと守りの提案が半々';
}
function renderHistory(){const list=$('historyList');const arr=[...game.history].reverse();$('historyCount').textContent=`${arr.length}件`;
 if(!arr.length){list.innerHTML='<p class="modal-detail">まだ経営記録はありません。</p>';return;}
 list.innerHTML=arr.map(h=>`<div class="history-item"><span class="history-week">第${h.week}週</span><div><strong>${esc(h.actionName)}</strong><p>${esc(h.title)}</p></div><span class="history-number">売上 ${man(h.sales)}万</span></div>`).join('');
}
function openModal(html,next){$('modalContent').innerHTML=html;modalNext=next||null;$('modal').hidden=false;document.body.style.overflow='hidden';$('modalClose').focus();}
function closeModal(){if($('modal').hidden)return;$('modal').hidden=true;document.body.style.overflow='';const next=modalNext;modalNext=null;if(next)next();}
function resultModal(h,finish){
 const badge=h.fireHit?'大炎上！':h.memoryEvent?'過去の施策が再燃':h.boycottActive?'不買運動中':'経営報告';
 const tile=(label,big,sub,down=false)=>`<div class="result-tile"><span>${esc(label)}</span><b>${esc(big)}</b><small class="${down?'negative':''}">${esc(sub)}</small></div>`;
 const val=(n)=>n>0?'+'+n:n.toString();
 openModal(`<div class="modal-kicker">WEEK ${String(h.week).padStart(2,'0')} / 12 — ${esc(badge)}</div><h2 id="modalTitle">今週の経営結果</h2><div class="modal-news"><strong>${esc(h.title)}</strong><p>${esc(h.body)}</p></div><div class="result-grid">${tile('週間売上',man(h.sales)+'万円','前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円',h.deltaSales<0)}${tile('今週の粗利益',man(h.profit)+'万円',h.profit<0?'赤字に転落！':'売上−原価−経費',h.profit<0)}${tile('コンサル報酬',yen(h.fee)+'円','累計 '+yen(game.pay)+'円')}${tile('消費者の不満',game.frust+' / 100','前週比 '+val(h.deltaFrust),h.deltaFrust>0)}</div><div class="modal-comment">${esc(h.ceo)}</div><div class="modal-detail">世間評価 <b>${game.storeRep}/100</b>（${val(h.deltaRep)}） ／ 炎上度 <b>${game.fire}/100</b>（${val(h.deltaFire)}）<br>有能さ <b>${game.skill}/100</b>（${val(h.deltaSkill)}）${h.boycottActive?'<br>⚠️ 不買運動による売上減少が発生':''}</div><div class="modal-actions"><button id="resultContinue" class="primary-btn" type="button">${finish?'12週間の最終決算へ':'わかった！ 次の週へ'} <span aria-hidden="true">↗</span></button></div>`,finish?()=>finishModal():null);
 $('resultContinue').addEventListener('click',closeModal);
}
function finishModal(){
 const s=game,profit=s.history.reduce((a,x)=>a+x.profit,0),fires=s.history.filter(x=>x.fireHit).length,boycotts=s.history.filter(x=>x.boycottHit).length;
 const rank=s.skill>=80&&s.storeRep>=65?'理想の経営改革者':s.skill>=75&&s.notoriety>=45?'悪魔の敏腕コンサル':s.skill>=70?'売上の魔術師':s.storeRep<30?'世論と戦うコンサル':'一応、経営改善';
 const line=s.notoriety>=50?'「稼ぎ方は教わりたい。名前は出さないでほしい」と各社から評判。':s.storeRep>=75?'「お客様のために」を、珍しく本当に実践した人物として語られる。':fires>=2?'「炎上対策の会議」が企業の主力事業になったらしい。':'社長「次はもっと簡単に儲かる方法がいい。もちろん合法で！」';
 openModal(`<div class="modal-kicker">FINAL REPORT / 全12週間終了</div><h2 id="modalTitle">コンサル会社・最終決算</h2><div class="end-stamp">🏆 ${esc(rank)}</div><div class="result-grid" style="margin-top:15px">${`<div class="result-tile"><span>累計報酬</span><b>${yen(s.pay)}円</b></div>`}${`<div class="result-tile"><span>12週の店の利益</span><b>${man(profit)}万円</b></div>`}${`<div class="result-tile"><span>有能さ / 悪名</span><b>${s.skill} / ${s.notoriety}</b></div>`}${`<div class="result-tile"><span>炎上 / 不買</span><b>${fires}回 / ${boycotts}回</b></div>`}</div><div class="modal-comment">${esc(line)}</div><p class="modal-detail">同じ選択でもイベント抽選で結果は変化するわ。次はどんな経営方針にする？</p><div class="modal-actions"><button id="endRestart" class="primary-btn" type="button">新しい会社で再挑戦する ↗</button></div>`);
 $('endRestart').addEventListener('click',()=>{if(!confirm('12週間の記録を消して、最初から挑戦しますか？'))return;game=G.initial(Date.now());save();closeModal();paint();changeScreen('office');toast('新しい経営が始まりました');});
}
function aboutModal(){openModal(`<div class="modal-kicker">HOW TO PLAY</div><h2 id="modalTitle">遊び方は、とっても簡単。</h2><div class="modal-detail"><ol><li><b>経営施策を1つ選ぶ。</b>今週届いた4件の提案から選ぶ（内容は毎週入れ替わる）。</li><li><b>1週間進める。</b>売上・利益・世間の評価などが変化。炎上は確率で起きる。</li><li><b>12週間経営する。</b>報酬を稼ぎ、企業の信用を守るか、悪名を上げるかは自由。</li></ol><p>「有能さ」は依頼先からの評価。「悪名」は世間の悪評。消費者の満足度と不満は別々に動くわ。</p><p>セーブはこの端末のブラウザ内に自動保存。必要ならJSONでバックアップできるの。</p><p><b>この作品はフィクション。</b>企業名・商品・事件や数値は架空で、現実の企業経営に関する助言ではありません。</p></div><div class="modal-actions"><button id="aboutClose" class="primary-btn" type="button">わかった！ ↗</button></div>`);$('aboutClose').addEventListener('click',closeModal);}
function setup(){
 game=load();paint();
 $('actions').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button||button.disabled||game.finished)return;game.selected=button.dataset.id;save();renderActions();});
 $('advanceButton').addEventListener('click',startWeek);
 $('reportContinue').addEventListener('click',finishWeek);
 document.querySelectorAll('.game-tab').forEach(b=>b.addEventListener('click',()=>changeScreen(b.dataset.screen)));
 $('aboutButton').addEventListener('click',aboutModal);
 $('modalClose').addEventListener('click',closeModal);
 $('modal').querySelector('.modal-backdrop').addEventListener('click',closeModal);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modal').hidden)closeModal();});
 document.querySelectorAll('.hint').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.tip)));
 $('historyToggle').addEventListener('click',()=>{const p=$('historyPanel');p.hidden=!p.hidden;$('historyToggle').setAttribute('aria-expanded',String(!p.hidden));});
 $('restartButton').addEventListener('click',()=>{if(!confirm('現在の経営を初期化しますか？（元に戻せません）'))return;game=G.initial(Date.now());save();paint();changeScreen('office');toast('第1週からスタート！');});
 $('exportButton').addEventListener('click',()=>{
  const data=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download='okyakusama-save-v1.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('セーブをJSONで書き出しました');
 });
 $('importButton').addEventListener('click',()=>$('importInput').click());
 $('importInput').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{if(file.size>1024*1024)throw Error('ファイルが大きすぎます');const s=G.validateSaved(JSON.parse(await file.text()));if(!confirm(`第${Math.min(s.week,12)}週のデータを読み込み、今の記録を上書きしますか？`))return;game=s;save();paint();changeScreen('office');toast('セーブを復元しました');}
  catch(err){toast('読み込み不可：'+(err.message||'ファイルが不正です'));}
 });
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('オフライン準備に失敗',err));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();