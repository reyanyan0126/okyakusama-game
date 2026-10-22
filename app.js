/* お客様のために。v1.2.0 - 30-week chapters, incoming-call animation and concise optional actions, compact office, modal accessibility. */
(()=>{'use strict';
const G=window.GameEngine;
const F=window.FinanceLedger;
const B=window.PolicyStoryboards;
const STORAGE='okyakusama.save.v1';
const $=id=>document.getElementById(id);
const yen=n=>Number(n).toLocaleString('ja-JP');
const man=n=>(n/10000).toFixed(1);
const sign=n=>(n>0?'+':'')+yen(n);
const moneyChange=n=>(n>0?'＋':n<0?'−':'±')+yen(Math.abs(n))+'円';
const cashClass=n=>n>0?'up':n<0?'down':'flat';


const numberRolls=new WeakMap();
function rollFigure(node,from,to,format){
 if(!node)return;
 const old=numberRolls.get(node);if(old)window.cancelAnimationFrame(old);
 const drawValue=n=>{node.innerHTML=format(n);};
 const start=Number(from),finish=Number(to);
 node.classList.remove('number-rising','number-falling','number-rolling');
 if(!Number.isFinite(start)||!Number.isFinite(finish)){drawValue(finish||0);return;}
 if(start===finish||reducedMotion()){drawValue(finish);return;}
 node.classList.add('number-rolling',finish>start?'number-rising':'number-falling');
 drawValue(start);
 let beginning;
 const step=t=>{
  if(beginning===undefined)beginning=t;
  const p=Math.min(1,(t-beginning)/760),ease=1-Math.pow(1-p,3);
  drawValue(Math.round(start+(finish-start)*ease));
  if(p<1)numberRolls.set(node,window.requestAnimationFrame(step));
  else{numberRolls.delete(node);node.classList.remove('number-rolling');drawValue(finish);}
 };
 numberRolls.set(node,window.requestAnimationFrame(step));
}

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let game;
let selectedProject=null;
let selectedDevil=null;
let modalNext=null;
let toastTimer;
let resolving=false;
let lastScreen='office';
let entryMode='title';
let prologueStep=0;
let statusOrigin=null;
let weekSceneClosedByUser=false;
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
function showEntry(mode){
 entryMode=mode;
 $('titleScreen').hidden=mode!=='title';
 $('contractsScreen').hidden=mode!=='contracts';
 $('prologueScreen').hidden=mode!=='prologue';
 $('app').hidden=mode!=='game';
 document.body.classList.toggle('entry-mode',mode!=='game');
 if(mode==='title'){
  const active=game.history.length>0;
  $('titleResume').hidden=!active;
  if(active)$('titleResume').textContent=game.rescuePending?'緊急再建会議に戻る →':game.finished?'前回の最終成績を見る →':`第${game.week}週からつづける →`;
 }
}
function chooseMarket(){
 if(game.history.length && !confirm('新しい依頼を受けると、現在のプレイ記録が初期化されます。先に記録画面からバックアップできます。開始しますか？'))return;
 prologueStep=0;renderPrologue();showEntry('prologue');
}
const PROLOGUE=[
 {speaker:'第1幕｜雑居ビル3階',title:'最後の2万8,000円。',text:'独立したものの、仕事はずっとゼロ。机の上には請求書。家賃を払えば、財布はさらに軽くなる。',art:'art-wallet',label:'支払いが積もる小さな事務所'},
 {speaker:'第2幕｜忘れられない約束',title:'養育費だけは、遅れたくない。',text:'離れて暮らす子供への大切なお金。第4週には3万6,000円が必要だ。稼がなければならない理由がある。',art:'art-home',label:'養育費の支払日が記された手帳'},
 {speaker:'第3幕｜電話が鳴る',title:'プルルル……',text:'事務所の電話が鳴った。請求の催促か、仕事の依頼か。主人公は受話器に手を伸ばす。',art:'art-store',label:'事務所に電話が鳴り響く'},
 {speaker:'第4幕｜一本の電話',title:'「相談だけでも、できますか」',text:'受話器の向こうは、倒産寸前のスーパーの店長だった。「来月の給料も厳しいんです」……ようやく来た、初めての依頼。',art:'art-store',label:'窮状を語る店長から再建依頼が届く'},
 {speaker:'第5幕｜現場で見たもの',title:'店は、まだ生きている。',text:'棚には空きがあり、スタッフは疲れた顔。それでも通い続ける常連がいる。原因を見抜ければ、立て直せるかもしれない。',art:'art-people',label:'再建を待つスーパーの従業員と常連客'},
 {speaker:'第6幕｜経営再建契約',title:'再建に残されたのは、30週間。',text:'店舗資金19万5,000円。店のお金と自分の財布は別。毎週の報酬で生活をつなぎながら、店を立て直す契約を結んだ。',art:'art-bill',label:'30週間のコンサル契約書'},
 {speaker:'第7幕｜事務所の夜',title:'……どうするか。仕方ない。',text:'「炎上しない程度に、消費者を騙そう」……口にした途端、契約書の影が笑った気がした。「程度」という言葉ほど、悪魔の好きなものはない。',art:'art-devil',label:'事務所の机に落ちる悪魔の影と主人公の決意'}
];
function renderPrologue(){
 const item=PROLOGUE[prologueStep];
 $('prologueCounter').textContent=`${String(prologueStep+1).padStart(2,'0')} / ${String(PROLOGUE.length).padStart(2,'0')}`;
 $('prologueSpeaker').textContent=item.speaker;
 $('prologueHeading').textContent=item.title;
 $('prologueText').textContent=item.text;
 const illustrationStep=prologueStep+1;
 $('prologueArt').setAttribute('href','./assets/prologue-v160.svg#prologue-'+illustrationStep);
 $('prologueArt').setAttribute('x','0');$('prologueArt').setAttribute('y','0');
 $('prologueArt').setAttribute('width','720');$('prologueArt').setAttribute('height','420');
 const frames=['normal','sad','panic','angry','sad','happy','panic'];
 const visualCaptions=[
  ['最後の28,000円','残高 28,000円','家賃74,000円・光熱費18,400円'],
  ['請求書の山','仕事はゼロ','支払いだけが待っている'],
  ['一本の電話','依頼が来た','受けるか、断るか'],
  ['商談が始まる','再建の相談','数字と現場を見て決める'],
  ['店舗へ','問題は山積み','お客様の声が聞こえる'],
  ['決断のとき','店を変える','ごまかさず、考える'],
  ['契約書の影','誰のための改革？','あなたが選ぶ30週間']
 ];
 $('prologuePaintedPerson').querySelector('use').setAttribute('href','./assets/manga-cast-v200.svg#manga-you-'+frames[prologueStep]);
 $('prologuePaintedStage').textContent=String(prologueStep+1).padStart(2,'0')+' / 07　'+visualCaptions[prologueStep][0];
 $('prologuePaintedHeading').textContent=visualCaptions[prologueStep][1];
 $('prologuePaintedDetail').textContent=visualCaptions[prologueStep][2];
 $('prologueIllustration').dataset.scene=String(illustrationStep);
 $('prologueIllustration').classList.toggle('phone-ringing',prologueStep===2);
 $('prologueIllustration').classList.remove('story-art-enter');void $('prologueIllustration').offsetWidth;$('prologueIllustration').classList.add('story-art-enter');
 $('prologueIllustration').setAttribute('aria-label',item.label);
 [...document.querySelectorAll('.prologue-dots span')].forEach((dot,i)=>dot.classList.toggle('current',i===prologueStep));
 $('prologueNext').textContent=prologueStep===PROLOGUE.length-1?'覚悟を決めて始める →':prologueStep===2?'電話に出る →':'次へ →';
 const card=document.querySelector('.prologue-copy');card.classList.remove('prologue-enter');void card.offsetWidth;card.classList.add('prologue-enter');
}
function finishPrologue(){
 game=G.initial(Date.now());selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');showEntry('game');
 showFirstWeekGuide();
}
function advancePrologue(){
 if(prologueStep<PROLOGUE.length-1){prologueStep++;renderPrologue();}else finishPrologue();
}

function openStatusSheet(){
 const s=game,h=s.lastResult,macro=G.currentMacro(s),root=G.rootDiagnosis(s);
 const money=n=>Number(n||0).toLocaleString('ja-JP')+'円';
 const score=n=>String(n)+' / 100';
 const situation=s.cash<=0?'資金ショート':s.cash<85000?'資金危機':s.storeRep<35?'信用危機':'再建中';
 const groups=[
  ['財務・契約',[
   ['現在の状況',situation],['店舗の現金',money(s.cash)],
   ['累計利益 / 契約目標',money(G.goalStatus(s).profit)+' / '+money(s.contractGoal)],
   ['借入残高',money(s.debt)],['主人公の所持金',money(s.personalCash)]
  ]],
  ['売上・コスト',[
   ['直近の週間売上',h?money(h.sales):'営業前・基準 '+money(s.sales)],
   ['直近の営業利益',h?money(h.profit):'営業前・基準 '+money(s.profit)],
   ['基本固定費の見込み',money(155000-(60-s.staff)*800+(macro?.fixed||0))],
   ['今週の社会情勢',macro?.name||'なし']
  ]],
  ['商品・現場',[
   ['商品価格',money(s.price)+' / 個'],['商品の量',s.size+'g'],
   ['商品の品質',score(s.quality)],['スタッフの充足',score(s.staff)],
   ['設備更新レベル',(s.upgrades?.equipment||0)+' / 2'],
   ['人材育成レベル',(s.upgrades?.people||0)+' / 2'],
   ['常連施策レベル',(s.upgrades?.fans||0)+' / 2']
  ]],
  ['お客様・リスク',[
   ['お店の評判',score(s.storeRep)],['顧客満足度',score(s.sat)],
   ['顧客の不満',score(s.frust)],['炎上度',score(s.fire)],
   ['コンサルの悪名',score(s.notoriety)]
  ]],
  ['登場人物・因縁',[
   ['社長の信頼',String(s.cast?.boss||0)+'（−100〜100）'],
   ['店長の信頼',String(s.cast?.manager||0)+'（−100〜100）'],
   ['常連客の信頼',String(s.cast?.customers||0)+'（−100〜100）'],
   ['未解決の事件',G.STORIES.active(s).length+'件'],
   ['決着した事件',(s.storyJournal||[]).length+'件']
  ]],
  ['現場診断',[
   ['根本課題',root.active?root.title:'調査対象外・従来の経営を継続'],
   ['診断の進捗',!root.active?'対象外':root.solved?'根本対策済み':'対策未実施']
  ]]
 ];
 $('statusContent').innerHTML='<p class="status-lead">主要数値は経営画面、すべての内訳はここで確認できます。店舗の現金と個人の財布は別会計です。</p>'+
  groups.map(([heading,rows])=>'<section class="status-group"><h3>'+esc(heading)+'</h3>'+
   rows.map(([label,value])=>'<div class="status-line"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong></div>').join('')+'</section>').join('');
 $('statusReport').hidden=!h;
 $('statusSheet').hidden=false;document.body.classList.add('scene-locked');
 $('statusClose').focus({preventScroll:true});
}
function closeStatusSheet(){
 if($('statusSheet').hidden)return;
 $('statusSheet').hidden=true;
 if($('proposalSheet').hidden&&$('weekScene').hidden&&$('moneySheet').hidden&&$('modal').hidden)document.body.classList.remove('scene-locked');
 if(statusOrigin?.isConnected)statusOrigin.focus({preventScroll:true});
 statusOrigin=null;
}
function reopenLastReport(){
 if(!game.lastResult)return;
 closeStatusSheet();
 $('weekScene').hidden=false;$('workingScene').hidden=true;$('shockScene').hidden=true;
 document.body.classList.add('scene-locked');
 weekSceneClosedByUser=false;
 if(pendingAccident(game.lastResult))resumeTheater();else showWeekReport(game.lastResult,game.finished);
}
function closeWeekScene(){
 if($('weekScene').hidden)return;
 if(resolving || pendingAccident(game.lastResult) || game.rescuePending){toast('先に今週の結果と必要な対応を確認してください');return;}
 weekSceneClosedByUser=true;
 $('weekScene').hidden=true;
 if($('moneySheet').hidden&&$('proposalSheet').hidden&&$('statusSheet').hidden&&$('modal').hidden)document.body.classList.remove('scene-locked');
 const button=$('openStatusSheet');if(button&&!$('officeView').hidden)button.focus({preventScroll:true});
}
function openProposals(){
 if(resolving||!$('weekScene').hidden||game.finished)return;
 renderActions();renderDevil();$('optionalActions').open=!!(selectedProject||selectedDevil);$('proposalSheet').hidden=false;document.body.classList.add('scene-locked');
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
 // Four recognizable local residents rotate in four-week story chapters.
 // The manager is a stable recurring character; emotions change with game state.
 const locals=[['mori','森さん'],['saito','斎藤さん'],['aoki','青木さん'],['tanaka','田中さん']];
 const [resident,residentName]=locals[Math.floor((Math.max(1,s.week)-1)/4)%locals.length];
 for(const [id,mood,portrait,label] of [['bossFace',boss,'manager','店長'],['buyerFace',buyer,resident,'常連・'+residentName]]){
  $(id).dataset.mood=mood;
  $(id).dataset.persona=portrait;
  $(id).setAttribute('viewBox','0 0 100 120');
  $(id).innerHTML='<use href="./assets/portraits-v171.svg#portrait-'+portrait+'-'+mood+'"></use>';
  $(id).setAttribute('aria-label',label+'・'+({panic:'驚き',happy:'笑顔',angry:'怒り',sad:'落胆',normal:'普通'})[mood]+'の表情');
 }
 if($('buyerPersona'))$('buyerPersona').textContent=residentName;
}


function renderOfficeScene(){
 const scene=window.OfficeScene.describe(game);
 const hero=document.querySelector('#officeView .office-hero');
 if(!hero)return;
 const previous=hero.dataset.storeState;
 hero.dataset.storeState=scene.store;
 hero.dataset.billLoad=String(scene.bills);
 hero.dataset.officeState=scene.office;
 hero.dataset.devil=scene.devil?'yes':'no';
 hero.dataset.rootIssue=scene.rootIssue;
 $('officeSceneText').textContent=scene.note;
 const drawing=document.querySelector('.office-room-art');
 if(drawing){
  const kind=scene.store==='closed'?'closed':scene.store==='scandal'?'scandal':scene.store==='critical'?'critical':scene.rootIssue==='repair'?'repair':scene.store==='busy'?'busy':scene.office==='upgraded'?'upgraded':scene.devil?'devil':scene.store==='quiet'?'quiet':'normal';
  drawing.setAttribute('viewBox','0 0 720 420');
  drawing.innerHTML='<use href="./assets/office-cinema-v171.svg#office-'+kind+'"></use>';
}
 if(drawing)drawing.setAttribute('aria-label',scene.description+' 雑居ビルの事務所とモグモグマートの現場写真。');
 if(previous && previous!==scene.store && !reducedMotion()){
  hero.classList.remove('scene-status-changed');void hero.offsetWidth;
  hero.classList.add('scene-status-changed');
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
 fix_equipment:['冷凍庫を直したら廃棄が減った。当然のことがニュースになる。'],
 fix_people:['社員を雇ったら働く人が増えた。革命的な経営ですね。'],
 fix_fans:['客に話を聞いたら客が戻った。報告書は何ページ必要？'],
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
const EXTRA_REACTIONS={
 raise:['実質賃金は据え置き。値札だけ昇進した。','値上げの説明が「ご理解」だけで完結している。'],
 shrink:['袋の中身より、プレスリリースの方が重い。','量が減ったことを「体験価値」と呼ぶのはやめて。'],
 cheap:['原料を削ったら、味より先にリピーターが消えた。','これは商品開発ではなく、思い出の解体。'],
 staff:['店員を減らして増えたのは、客の待ち時間。','レジは無人化した。責任者も無人化した。'],
 points:['制度変更で得するのは、説明資料を作った人だけ。'],
 pop:['商品の価値より広告費が先に膨らむ、新しい製法。'],
 explain:['正直に言っただけで優良企業に見える不思議。'],
 blame:['責任の所在を探したら、社長だけ先に帰っていた。'],
 audit:['透明性を高めたら、役員室だけ曇りガラスになった。'],
 loan:['借りたお金で「自己資金は潤沢」と会見するな。'],
 quality:['普通にいいものを作る。革新的すぎて役員が動揺。'],
 local:['地域密着。役員報酬だけ国際水準。'],
 sale:['感謝祭で感謝しているのは、在庫管理システム。'],
 loyalty:['お客様の声を聞く会に、社長本人だけ欠席。'],
 maintenance:['何も起きなかった成果は、予算査定で消される。']
};
const RESULT_PUNCH={
 fix_equipment:'社長「壊れる前に直すとは……あまりにも先進的だ」',
 fix_people:'社長「人を増やしたら店が回る？ その理屈は理解したくない」',
 fix_fans:'社長「固定客が戻った！ 理由は私のカリスマだろう」',
 raise:'社長「価格改定は成長戦略。給与改定は時期尚早」',
 shrink:'社長「中身を減らしたのではない。余白を提供した」',
 staff:'社長「人手不足は、現場の工夫で解決してほしい」',
 cheap:'社長「品質は落ちていない。基準を最適化した」',
 quality:'社長「味はいい。だが原価まで正直にならなくていい」',
 points:'社長「お客様への還元を、当社へ還元した」',
 pop:'社長「広告の満足度は高い。商品の話は後で」',
 explain:'社長「説明責任は果たした。理解する責任は消費者にある」',
 sale:'社長「売上は伸びた。利益が付いてくるとは言っていない」',
 audit:'社長「透明な経営だ。私の報酬だけは個人情報だが」',
 blame:'社長「決めたのは私、責任を負うのは君。役割分担だ」',
 local:'社長「地域を大切に。決算だけ本社を大切に」',
 maintenance:'社長「壊れなかった。だから修理代は無駄だったな」',
 loan:'社長「資金が増えたぞ！ 返済表を見せるな」'
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
 $('voiceFace').innerHTML=`<svg class="mini-ill"><use href="#${s.fire>=50?'art-fire':s.frust>=60?'art-warning':s.sat>=75?'art-smile':'art-people'}"/></svg>`;
 $('voiceMoodQuote').textContent=s.fire>=50?'「社長の謝罪より、商品の説明が聞きたい」':s.frust>=60?'「お客様のために？ 誰のお客様？」':s.sat>=75?'「最近ちょっといいじゃない！」':'「悪くはない。褒めてないけど」';
 $('voiceHeadline').textContent=s.lastResult?.title??'開店準備は万端！';
 $('voiceBody').textContent=s.lastResult?.body??'まだ話題になる出来事はありません。';
 const feed=s.history.slice(-8).reverse();
 $('publicFeed').innerHTML=feed.length?feed.map((h,i)=>{
 const comments=[...(REACTIONS[h.actionId]||['ま、次の決算を見ようか。']),...(EXTRA_REACTIONS[h.actionId]||[])];
 const c=comments[(h.week+i)%comments.length];
 const person=PUBLIC_NAMES[(h.week*3+i)%PUBLIC_NAMES.length];
 return `<article class="social-post"><span class="post-avatar" aria-hidden="true"><svg class="mini-ill"><use href="#${h.fireHit?'art-fire':h.memoryEvent?'art-warning':h.eventType==='good'?'art-smile':'art-people'}"/></svg></span><div><div class="post-name">${esc(person)} <span>・第${h.week}週</span></div><p>${esc(c)}</p><small>いいね ${18+h.week*7+i*13}　 ↻ ${2+h.week+i}</small></div></article>`;
 }).join(''):'<div class="empty-feed">まだ口コミはありません。<br>まずは1週間、経営してみよう！</div>';
 $('recordsPay').textContent=yen(s.pay)+'円';
 $('recordsSales').textContent=man(s.history.reduce((sum,h)=>sum+h.sales,0))+'万円';
 $('recordsWeeks').textContent=s.history.length+'週';
 $('recordsPersonal').textContent=man(s.personalCash)+'万円';
}
function renderFlow(h){
 const entries=[
  {label:'売上',icon:'',amount:h.sales,cls:'revenue'},
  {label:'仕入れ',icon:'',amount:h.units*h.cost,cls:'cost'},
  {label:'人件費・家賃・光熱',icon:'',amount:(h.rent??75000)+(h.payroll??50000)+(h.utilities??30000)+(h.macroFixed??0),cls:'fixed'},
  {label:'施策・事故・金利',icon:'',amount:(h.extra??0)+(h.incidentCost??0)+(h.interest??0)+(h.macroPenalty??0)-(h.macroBonus??0),cls:'surprise'}
 ];
 const denominator=Math.max(...entries.map(x=>Math.abs(x.amount)),1);
 $('moneyFlowRows').innerHTML=entries.map(e=>`<div class="flow-item"><div class="flow-caption"><span>${e.label}</span><b>${e.amount<0||e.cls==='revenue'?'+':'−'}${man(Math.abs(e.amount))}万円</b></div><div class="flow-track"><span class="${e.cls}" style="width:${Math.max(1,Math.abs(e.amount)/denominator*100)}%"></span></div></div>`).join('');
 $('flowProfit').textContent=(h.profit>=0?'+':'')+man(h.profit)+'万円';
 $('flowProfit').className=h.profit>=0?'positive':'negative';
 const extraNote=h.devilNote?` ／ ${h.devilNote}`:'';
 const invested=h.investment??0;
 $('investmentResult').hidden=!invested;
 if(invested)$('investmentResult').textContent=`${h.projectLabel||'設備投資'}：${man(invested)}万円を現金から支出`;
 const loss=h.profit<0,good=h.profit>=95000;
 $('reportVerdict').className='report-verdict '+(loss?'loss':good?'good':'mid');
 $('reportVerdictIcon').innerHTML=`<svg class="mini-ill"><use href="#${loss?'art-warning':h.fireHit?'art-fire':good?'art-graph':'art-document'}"/></svg>`;
 $('reportVerdictTitle').textContent=h.rescueChoice&&h.rescueChoice!=='giveup'?'倒産寸前から生還！':loss?'赤字！ 資金が減る':h.fireHit?'儲かったけど、大炎上':good?'今週は好調！':'黒字。でも余裕は少ない';
 $('reportVerdictSub').textContent=`現金 ${man(h.cashBefore??0)}万 → ${man(h.cashAfter??0)}万円`;
}
let moneyKind='store';
let moneyReturnFocus=null;
const currency=n=>Number(n).toLocaleString('ja-JP')+'円';
function setMoneyKind(kind){
 moneyKind=kind;
 $('moneyStoreTab').setAttribute('aria-selected',String(kind==='store'));
 $('moneyPersonalTab').setAttribute('aria-selected',String(kind==='personal'));
 const h=game.lastResult;
 const opening=kind==='store'?game.cash:game.personalCash;
 const data=h?F.createLedger(h,kind):F.createLedger(null,kind);
 const current=h?data.end:opening, previous=h?data.start:opening;
 const delta=h?data.delta:0;
 $('moneyTitle').textContent=kind==='store'?'お店のお金':'自分のお金';
 $('moneyOverview').innerHTML=`<div class="money-comparison"><div><span>${h?'先週の残高':'開始時点'}</span><strong>${currency(previous)}</strong></div><div class="money-arrow">→</div><div><span>いまの残高</span><strong>${currency(current)}</strong></div></div><div class="money-outcome ${cashClass(delta)}">${h?'差し引き':'初期残高'} <strong>${h?moneyChange(delta):currency(current)}</strong></div>`;
 if(!h){
  const overhead=155000-(60-game.staff)*800+G.currentMacro(game).fixed;
  $('moneyQuestion').textContent=kind==='store'?'なぜ店の資金が減る？ 売上があっても、仕入れや固定費の支払いがあるからです。':'どうして自分の財布が減る？ 店から報酬が入りますが、毎週の生活費と、4週ごとの養育費を支払うからです。';
  $('moneyLines').innerHTML=kind==='store'?`<div class="money-simple-row"><span>店の残高</span><strong>${currency(opening)}</strong></div><div class="money-simple-row"><span>毎週の固定費（売上・仕入れとは別）</span><strong class="down">−${currency(overhead)}</strong></div>`:`<div class="money-simple-row"><span>今週の報酬</span><strong>営業後に確定</strong></div><div class="money-simple-row"><span>毎週の生活費</span><strong class="down">−${currency(G.PERSONAL.living)}</strong></div><div class="money-simple-row"><span>4週間ごとの養育費</span><strong class="down">−${currency(G.PERSONAL.support)}</strong></div>`;
  $('moneyExplainer').textContent='営業後、実際の入金・支払いがここに表示されます。';
  return;
 }
 const totals=`<div class="money-totals"><div>入ったお金<strong class="up">＋${currency(data.inTotal)}</strong></div><div>払ったお金<strong class="down">−${currency(data.outTotal)}</strong></div></div>`;
 let summary='';
 if(kind==='store'){
  const sum=group=>data.rows.filter(x=>x.group===group).reduce((t,x)=>t+x.amount,0);
  const transfer= sum('資金移動');
  summary=`<div class="money-simple-row"><span>① 営業収支（売上 − 仕入れ等）</span><strong class="${cashClass(sum('営業'))}">${moneyChange(sum('営業'))}</strong></div><div class="money-simple-row"><span>② 借入・投資・報酬など</span><strong class="${cashClass(transfer)}">${moneyChange(transfer)}</strong></div>`;
  const paid=(h.fee||0)+(h.boardroomBonus||0);
  $('moneyQuestion').textContent=paid?`店がコンサルに払った ${currency(paid)} は、自分の財布では収入になります。店の資金と自分のお金は別々です。`:'店の利益と口座残高は別です。投資・借入・返済でも現金が動きます。';
 }else{
  const earnings=(h.fee||0)+(h.boardroomBonus||0);
  const personalCosts=(h.personalLiving||0)+(h.supportPaid||0)+(h.personalDevilPayment||0);
  const otherIn=data.rows.filter(r=>r.amount>0&&!['店からのコンサル報酬','社長からの特別報酬'].includes(r.label)).reduce((a,r)=>a+r.amount,0);
  summary=`<div class="money-simple-row"><span>① 店からの報酬</span><strong class="up">＋${currency(earnings)}</strong></div><div class="money-simple-row"><span>② 生活費</span><strong class="down">−${currency(h.personalLiving||0)}</strong></div><div class="money-simple-row"><span>③ 養育費${h.supportDue?'（支払期限）':''}</span><strong class="${h.supportPaid?'down':'flat'}">${h.supportPaid?'−':''}${currency(h.supportPaid||0)}</strong></div>${h.personalDevilPayment?`<div class="money-simple-row"><span>④ 悪魔への返済</span><strong class="down">−${currency(h.personalDevilPayment)}</strong></div>`:''}${otherIn?`<div class="money-simple-row"><span>その他の入金（悪魔の前借り等）</span><strong class="up">＋${currency(otherIn)}</strong></div>`:''}`;
  $('moneyQuestion').textContent=personalCosts>earnings?`報酬 ${currency(earnings)} より支払い ${currency(personalCosts)} が多かったため、財布が減りました。`:`今週は報酬 ${currency(earnings)} に対して、支払いは ${currency(personalCosts)}。残りが生活資金です。`;
  if(h.arrearsAfter)$('moneyQuestion').textContent+=` 養育費未払い：${currency(h.arrearsAfter)}。`;
 }
 const rows=data.rows.map(r=>`<div class="money-line"><span>${esc(r.label)}</span><strong class="${cashClass(r.amount)}">${r.amount>=0?'＋':'−'}${currency(Math.abs(r.amount))}</strong></div>`).join('');
 $('moneyLines').innerHTML=`${totals}<div class="money-quick-summary">${summary}</div><details class="money-detail-list"><summary>1円単位の明細を見る</summary>${rows||'<p>明細はありません</p>'}<div class="money-ledger-end"><span>検算</span><strong>${currency(previous)} ＋ ${currency(data.inTotal)} − ${currency(data.outTotal)} ＝ ${currency(current)}</strong></div></details>`;
 $('moneyExplainer').textContent=data.residual!==0?'旧セーブなどで未記録の差額があるため、明細には調整行を表示しています。':'上の合計はすべて円単位。入金 − 支払い ＝ 残高の増減です。';
}

function openMoney(kind='store',source){
 moneyReturnFocus=source||document.activeElement;
 setMoneyKind(kind);
 $('moneySheet').hidden=false;
 document.body.classList.add('scene-locked');
 $('moneyClose').focus({preventScroll:true});
}
function closeMoney(){
 $('moneySheet').hidden=true;
 if($('weekScene').hidden&&$('proposalSheet').hidden)document.body.classList.remove('scene-locked');
 if(moneyReturnFocus?.isConnected)moneyReturnFocus.focus({preventScroll:true});
}
function showRescueScene(){
 hideTheater();setPresentation('settlement');
 $('workingScene').hidden=true;$('shockScene').hidden=true;$('reportScene').hidden=true;
 $('rescueScene').hidden=false;
 $('rescueDeficit').textContent=man(-game.cash)+'万円';
 $('rescueRemaining').textContent=`救済機会：残り${Math.max(0,2-(game.rescueUsed||0))}回。選んだ策の代償は次週にも残ります。`;
 $('rescueChoices').innerHTML=G.rescueOptions(game).map(o=>`<button type="button" class="rescue-option" data-rescue="${o.id}"><svg class="mini-ill" aria-hidden="true"><use href="#${o.art}"/></svg><span><strong>${esc(o.name)}</strong><small>${esc(o.detail)}</small></span></button>`).join('');
 $('rescueChoices').querySelector('button')?.focus({preventScroll:true});
}
function applyRescue(id){
 try{
  game=G.resolveRescue(game,id);save();paint();
  $('rescueScene').hidden=true;
  showWeekReport(game.lastResult,game.finished);
  toast(game.lastResult.rescueText);
 }catch(err){toast(err.message||'再建策を実行できませんでした');}
}
function showWeekReport(h,finish){
 if(game.rescuePending&&!(h.accidentId&&h.incidentCost>0&&h.accidentResponse===null)){showRescueScene();return;}
 hideTheater();setPresentation('settlement');
 $('rescueScene').hidden=true;
 const isFire=h.fireHit,isMemory=h.memoryEvent;
 $('workingScene').hidden=true;$('reportScene').hidden=false;
 $('reportScene').classList.toggle('is-fire',isFire);
 $('reportWeek').textContent='WEEK '+String(h.week).padStart(2,'0')+' / '+G.campaignWeeks(game);
 renderFlow(h);
 const macro=G.MACROS.find(x=>x.id===h.macroId);
 $('economyHeadline').textContent=macro?`${macro.tag}｜${macro.name}${h.macroPenalty?'：是正費用 '+man(h.macroPenalty)+'万円':h.macroBonus?'：補助金 +'+man(h.macroBonus)+'万円':''}`:'今週の景気の変化';

 $('reportIcon').textContent='';
 $('reportTitle').textContent=isFire?'大炎上！':isMemory?'過去の施策が再燃！':h.accidentId?(h.accidentPositive?'うれしい臨時ニュース！':'突発アクシデント！'):h.rootFixedThisWeek?'再建の突破口を発見！':h.boycottActive?'不買運動発生中！':h.profit<0?'赤字の決算…':'今週の決算！';
 $('reportHeadline').textContent=h.title;
 $('reportDescription').textContent=h.devilNote?`${h.devilNote} ${h.body}`:h.body;
 const chapter=h.storyEvent;
 $('storyEvent').hidden=!chapter;
 if(chapter){
  $('storyEvent').dataset.phase=chapter.phase;
  $('storyEvent').dataset.tier=chapter.tier;
  $('storyEpisodeLabel').textContent=chapter.phase==='follow'?'後日談｜あなたの過去の選択':'特別事件｜選択が未来を変える';
  $('storyEpisodeNext').textContent=chapter.next;
  $('storyEpisodeTitle').textContent=chapter.headline;
  $('storyEpisodeText').textContent=chapter.text;
  $('storyEpisodeQuote').textContent=chapter.quote;
  $('storyArtUse').setAttribute('href','#story-cut-'+chapter.art);
  $('storyTierUse').setAttribute('href','#story-tier-'+chapter.tier);
  $('storyArtwork').setAttribute('aria-label',chapter.headline+'：'+chapter.tier);
 }
 const echoItems=Array.isArray(h.storyEcho)?h.storyEcho:[];
 $('storyEcho').hidden=!echoItems.length;
 $('storyEchoText').textContent=echoItems.map(e=>e.text).join(' ');
 if(chapter && !h.fireHit && !h.memoryEvent) $('reportTitle').textContent=chapter.phase==='follow'?'あの事件の続報！':'今週の大事件！';
 const tier=h.performanceTier;
 const performanceLabel=tier==='great'?'大成功！':tier==='failure'?'失敗…':'成功！';
 const performanceMessage=tier==='great'?'作戦が予想以上に刺さった！ 通常の135％の施策効果。':tier==='failure'?'実行が空回り。施策効果は通常の80％。費用は通常どおり。':'狙いどおりに施策を実行。通常の100％の効果。';
 $('performanceReport').hidden=!tier;
 if(tier){
  $('performanceReport').className='performance-result result-'+tier;
  $('performanceName').textContent=performanceLabel;
  $('performanceMessage').textContent=performanceMessage;
  $('performanceDetail').textContent='施策判定｜失敗 '+h.performanceOdds.failure+'%・成功 '+h.performanceOdds.success+'%・大成功 '+h.performanceOdds.great+'%。'+(h.momentumAfter?'好調連続 '+h.momentumAfter+'週':'連続好調はいったん終了')+'。事故や炎上抽選は別判定。';
 }
 $('crisisResponseBox').hidden=!h.crisisResponse;
 $('crisisResponseText').textContent=h.crisisResponse||'';
 rollFigure($('reportCash'),h.cashBefore??h.cashAfter??game.cash,h.cashAfter??game.cash,n=>man(n)+'万円');
 const dc=h.deltaCash??0;
 $('reportCashChange').textContent='今週 '+moneyChange(dc);
 $('reportCashChange').className='money-change '+cashClass(dc);
 rollFigure($('reportExpenses'),h.personalCashBefore??h.personalCashAfter??game.personalCash,h.personalCashAfter??game.personalCash,n=>currency(n));
 const dp=(h.personalCashAfter??game.personalCash)-(h.personalCashBefore??0);
 $('reportPersonalChange').textContent='今週 '+moneyChange(dp);
 $('reportPersonalChange').className='money-change '+cashClass(dp);
 const storeLines=[['営業利益',h.profit],['融資など',h.financing||0],['悪魔の援助',h.devilId==='shop'?G.DEVIL_OFFERS.find(x=>x.id==='shop')?.gain||0:0],['返済',-(h.principal||0)],['設備投資',-(h.investment||0)],['コンサル報酬',-((h.fee||0)+(h.boardroomBonus||0))],['悪魔への返済',-(h.devilPayment||0)],['緊急再建',h.rescueAmount||0],['事故補償',-(h.remedyCost||0)]];
 const personalLines=[['報酬',(h.fee||0)+(h.boardroomBonus||0)],['生活費',-(h.personalLiving||0)],['養育費',-(h.supportPaid||0)],['悪魔への返済',-(h.personalDevilPayment||0)],['悪魔の援助',h.devilId==='personal'?G.DEVIL_OFFERS.find(x=>x.id==='personal')?.gain||0:0]];
 const fmtLines=lines=>lines.filter(x=>x[1]).map(([name,n])=>`${name}${n>=0?'＋':'−'}${man(Math.abs(n))}万`).join(' / ');
 const mainDrivers=lines=>lines.filter(x=>x[1]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,2).map(([name,n])=>`${name}${n>=0?'＋':'−'}${man(Math.abs(n))}万`).join(' / ');
 $('storeMoneyWhy').textContent='主な要因：'+(mainDrivers(storeLines)||'変化なし');
 $('personalMoneyWhy').textContent='主な要因：'+(mainDrivers(personalLines)||'変化なし');
 $('storeMoneyFull').textContent='お店：'+fmtLines(storeLines);
 $('personalMoneyFull').textContent='自分：'+fmtLines(personalLines);
 $('reportSatire').textContent=game.personalFailed?'社長「会社は守れたのに、君の生活までは契約外だ」':game.bankrupt?'社長「倒産の原因は、私の理想に現実が追いつかなかったことだ」':h.fireHit?'社長「炎上も宣伝だ。消防署には宣伝費を請求しよう」':h.boardroomBonus?'社長「君への報酬は私の温情。出どころは店の財布だが」':RESULT_PUNCH[h.actionId]||'社長「財務諸表より、発表資料の色味を改善してくれ」';
 $('reportAccident').textContent=`報酬 +${man(h.fee)}万${h.boardroomBonus?' / 社長指示 +'+man(h.boardroomBonus)+'万':''} / 生活費 −${man(h.personalLiving??0)}万${h.supportDue?' / 養育費期限':''}${h.arrearsAfter?' / 未払い '+man(h.arrearsAfter)+'万':''}`;
 $('reportSales').textContent=man(h.sales)+'万円';
 $('reportSalesDiff').textContent='前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円';
 $('reportSalesDiff').className=h.deltaSales<0?'falling':'rising';
 $('reportProfit').textContent=man(h.profit)+'万円';
 $('reportPay').textContent=yen(h.fee)+'円';
 $('reportFrust').textContent=game.frust+' / 100';
 const delta=n=>(n>0?'+':'')+n;
 for(const [id,n,positiveGood] of [['reportReputationChange',h.deltaRep,true],['reportSatisfactionChange',h.deltaSat,true],['reportFireChange',h.deltaFire,false]]){
  const el=$(id);el.textContent=delta(n);
  // Signed amounts are never red merely because the underlying indicator is bad.
  el.className=n===0?'even':n<0?'negative-number':(id==='reportFireChange'?'warning-positive':'positive-number');
  el.setAttribute('aria-label',n===0?'変化なし':(n>0?'増加':'減少')+' '+Math.abs(n));
 }
 $('reportBossFace').innerHTML=`<svg class="mini-ill"><use href="#${isFire?'art-warning':h.profit<0?'art-bill':h.profit>=145000?'art-coin':'art-meeting'}"/></svg>`;
 $('reportTakeaway').textContent=h.rescueChoice&&h.rescueChoice!=='giveup'?`緊急再建に成功！ ${h.rescueName}。代償は残ります`:game.personalFailed?'生活の支払いが限界。契約を続けられません':game.bankrupt?' 資金ショート。経営を続けられません！':h.cashAfter<80000?' 残り資金が危険水準です！':h.rootFixedThisWeek?' 根本原因を改善！ 来週以降の損失や客離れを抑えられます':isFire?' 利益より先に評判が燃えました':h.boycottActive?' 不買運動でお客さんが減っています':h.deltaRep<0&&h.profit>0?' 利益は出たけど、お店の信用が低下':h.deltaRep>0?' お店の信用が上がりました':h.profit<0?' 売上より経費が大きい週でした':' 大きなトラブルなく営業できました';
 $('reportCeo').textContent=h.ceo;
 if(h.storyEvent&&!h.fireHit)$('reportSatire').textContent=h.storyEvent.quote;
 else if(tier==='great'&&!h.fireHit)$('reportSatire').textContent='社長「素晴らしい！ 最初から私も同じ案だったことにしよう」';
 else if(tier==='failure'&&!h.fireHit)$('reportSatire').textContent='社長「計画は完璧だ。現実のほうが計画を理解していない」';
 const goal=G.goalStatus(game);
 $('reportGoal').textContent=`契約目標：利益 ${man(goal.profit)} / ${man(game.contractGoal)}万円・評判 ${goal.reputation} / ${G.CONTRACT.reputation}`;
 const next=G.weeklyBrief(game);
 $('reportNext').textContent=game.finished?'契約の最終審査が始まります':`次の相談：${next.title}`;
 const pending=!!h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&h.accidentResponse===null;
 $('accidentDecision').hidden=!pending;
 $('reportScene').classList.toggle('is-pending',pending);
 if(pending){
  const cost=Math.min(28000,Math.round(h.incidentCost*.48)+4000);
  $('accidentRepair').textContent=` 補償する −${man(cost)}万円`;
  $('accidentRepair').disabled=game.cash<cost;
  $('accidentDecisionText').textContent=game.cash<cost?'補償費が足りません。信用を失っても費用を抑えるしかありません。':'今すぐ補償すれば信用を守れる。見送れば財布は守れる。';
 }
 $('reportContinue').disabled=pending;
 $('reportContinue').textContent=pending?'先にトラブル対応を選んでね':finish?'最終決算を見る →':'次の経営会議へ →';
 $('reportTitle').textContent='今週の決算';
 $('settlementProfit').textContent=moneyChange(h.profit);
 $('settlementProfit').className=cashClass(h.profit);
 $('reportScene').scrollTop=0;
 $('reportContinue').focus({preventScroll:true});
}

const SCENE_TYPES=[
 {art:'tiny',ids:['shrink','cheap']},
 {art:'robot',ids:['apologybot']},
 {art:'boss',ids:['apology','blame']},
 {art:'fancy',ids:['photo','pop']},
 {art:'account',ids:['ceocut','bills']},
 {art:'points',ids:['points']},
 {art:'price',ids:['raise','lower','airtax']},
 {art:'promo',ids:['sale','stamp','pop','tasting']},
 {art:'repair',ids:['maintenance','fix_equipment']},
 {art:'people',ids:['staff','restorestaff','fix_people','loyalty']},
 {art:'trust',ids:['explain','apology','blame','apologybot','audit','fix_fans']},
 {art:'finance',ids:['bills','loan','ceocut','points']}
];
function policyScene(id){const p=G.STORIES.POLICIES_BY_ID[id];return p?'story-'+p.episode:SCENE_TYPES.find(scene=>scene.ids.includes(id))?.art||'product';}
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
 weekSceneClosedByUser=false;
 $('weekScene').hidden=false;
 $('workingScene').hidden=false;
 $('shockScene').hidden=true;
 $('reportScene').hidden=true;
 $('rescueScene').hidden=true;
 $('workingWeek').textContent='WEEK '+String(week).padStart(2,'0');
 const policy=G.ACTIONS.find(a=>a.id===choice);
 $('workingArtUse').setAttribute('href','#policy-scene-'+policyScene(choice));
 $('workingIllustration').setAttribute('aria-label',`「${policy?.name||'今週の施策'}」を実施する現場のイラスト`);
 $('workingAction').textContent=policy?.name||'選んだ施策を実施中';
 $('workingMessage').textContent=report.storyEvent?'選んだ判断が、現場の未来を動かす…':'現場へ施策を伝えて、今週の営業を進めています…';
 $('workingIllustration').dataset.outcome=report.performanceTier||'success';
 $('workingAction').dataset.outcome=report.performanceTier||'success';
 $('workingMessage').textContent='現場へ施策を伝えて、今週の営業を進めています…';
 document.body.classList.add('scene-locked');
 game.presentation={week:report.week,stage:'working',newsIndex:0};save();
 beginTheater(report);

}

const T=window.WeekTheater;
let theaterTimers=[],newsIndex=0;
const pendingAccident=h=>!!h?.accidentId&&!h.accidentPositive&&h.incidentCost>0&&h.accidentResponse===null;
function setPresentation(stage){if(!game.lastResult)return;game.presentation={week:game.lastResult.week,stage,newsIndex};save();}
function clearTheaterTimers(){theaterTimers.forEach(clearTimeout);theaterTimers=[];}
function hideTheater(){clearTheaterTimers();for(const id of ['workingScene','shockScene','outcomeScene','newsScene','reportScene','rescueScene'])$(id).hidden=true;resolving=false;}
function installTheaterLayout(){
 // The title now ships with its dedicated cinema artwork in index.html.
 // Never overwrite the cover and resident artwork during app initialization.
 const title=document.querySelector('.title-visual');if(title&&!title.querySelector('.title-cinema-svg'))title.innerHTML='<svg class="title-cinema-svg" viewBox="0 0 720 420" role="img" aria-label="再建が必要なスーパーとスーツ姿のコンサル"><use href="./assets/office-cinema-v171.svg#office-title"></use></svg>';
 // Intro artwork is a separate set of seven authored scenes, not the generic WeekTheater actors.
 const detail=$('financialDetail');
 for(const selector of ['#reportHeadline','#reportDescription','#storyEvent','#storyEcho','#performanceReport','#crisisResponseBox','#reportVerdict','#economyReport','#reportSatire','.report-impact','#reportGoal','.report-reaction']){
  const el=document.querySelector(selector);if(el)detail.append(el);
 }
 $('newsDecision').append($('accidentDecision'));
}
function beginTheater(h){
 clearTheaterTimers();resolving=true;
 const custom=!!B?.family(h.actionId);
 const lines=(custom?B.captions(h.actionId):null)||T.captions[T.setting(h.actionId)];
 const M=window.MangaCinema;
 // Whole-illustration frames. No CSS-assembled eyes, hair, arms or figure poses.
 $('workingComic').innerHTML=M.markup(h.actionId,lines,{setting:T.setting(h.actionId)});
 const frame=n=>{
  if($('workingScene').hidden)return;
  M.reveal($('workingComic'),n);
  $('workingMessage').textContent='第'+(n+1)+'コマ / 全3コマ · 演出中（いつでもスキップできます）';
 };
 frame(reducedMotion()?2:0);
 $('workingSkip').focus({preventScroll:true});
 const duration=reducedMotion()?6000:3900; // No motion, but leave time to read all three completed panels.
 if(!reducedMotion())for(const n of [1,2])theaterTimers.push(setTimeout(()=>frame(n),n*1200));
 theaterTimers.push(setTimeout(showOutcome,duration));
}
function showOutcome(){
 if($('workingScene').hidden)return;
 hideTheater();setPresentation('outcome');const h=game.lastResult,tier=h.performanceTier||'success';
 $('outcomeScene').hidden=false;$('outcomeScene').dataset.tier=tier;
 $('outcomeTitle').textContent={failure:'失敗…',success:'成功！',great:'大成功！'}[tier];
 $('outcomePolicy').textContent=h.actionName;
 // Three complete manga panels for the result, animated only as panels.
 $('outcomeArt').innerHTML=window.MangaCinema.result(h);
 const policy=G.STORIES.POLICIES_BY_ID[h.actionId];
 $('outcomeText').textContent=policy?.[tier]||h.storyEvent?.text||(tier==='failure'?'現場は手順に追われ、狙った効果を十分に出せなかった。':tier==='great'?'現場の工夫がかみ合い、想定を上回る手応えがあった。':'現場で方針を共有し、計画どおりに施策を実行できた。');
 const impact=h.actionImpact;
 $('outcomeImpact').innerHTML=impact?[['評判',impact.rep],['満足度',impact.sat],['炎上度',impact.fire]].map(([label,n])=>`<div><span>${label}</span><strong class="${n<0?'down':label==='炎上度'?'flat':'up'}">${sign(n)}</strong></div>`).join(''):'<p>この記録には施策単独の増減がありません。週全体の数字は決算で確認できます。</p>';
 $('outcomeQuote').textContent=h.storyEvent?.quote||(tier==='failure'?'店長「うまくいかなかった。でも、次の手は一緒に考えます」':(game.cast?.manager||0)<-10?'店長「成果は出ました。現場の声にも耳を傾けてください」':tier==='great'?'店長「みんな、よくやってくれました！」':'店長「一つずつ、立て直していきましょう」');
 // The detailed odds are intentionally hidden on every new outcome, independently of prior rounds.
 $('outcomeDetailsToggle').setAttribute('aria-expanded','false');
 $('outcomeDetailsPanel').hidden=true;
 const odds=h.performanceOdds;
 $('outcomeOdds').textContent=odds?`失敗 ${odds.failure}%・成功 ${odds.success}%・大成功 ${odds.great}%。効果倍率 ${h.performanceMultiplier}倍。費用は通常どおり。臨時ニュースは別判定です。`:'旧バージョンの記録です。';
 $('outcomeNext').textContent=T.news(h,G).length?'臨時ニュースへ →':'今週の決算へ →';
 $('outcomeScene').scrollTop=0;$('outcomeTitle').focus({preventScroll:true});
}
function renderNews(){
 hideTheater();const h=game.lastResult,items=T.news(h,G);
 if(newsIndex>=items.length&&pendingAccident(h))newsIndex=Math.max(0,items.findIndex(item=>item.title===h.accidentTitle));
 if(newsIndex>=items.length){showWeekReport(h,game.finished);return;}
 const item=items[newsIndex];setPresentation('news');$('newsScene').hidden=false;$('newsScene').dataset.kind=item.kind;
 $('newsStep').textContent=`03 / 04 · ${item.kind==='memory'?'過去の選択から':'臨時ニュース'} ${newsIndex+1} / ${items.length}`;
 $('newsTitle').textContent=item.title;$('newsText').textContent=item.text;
 $('newsArt').innerHTML='<svg class="news-symbol" viewBox="0 0 64 64" aria-hidden="true"><use href="#art-document"></use></svg>';
 const pending=pendingAccident(h),isAccident=item.title===h.accidentTitle;
 $('accidentDecision').hidden=!(pending&&isAccident);
 if(pending&&isAccident){const cost=Math.min(28000,Math.round(h.incidentCost*.48)+4000);$('accidentRepair').textContent=`補償する −${man(cost)}万円`;$('accidentRepair').disabled=game.cash<cost;$('accidentDecisionText').textContent=game.cash<cost?'補償費が不足しています。費用を抑える対応を選んでください。':'追加費用で信用を守るか、費用を抑えるかを選んでください。';}
 // Other news may precede the accident; advancing to its mandatory decision is allowed.
 $('newsNext').disabled=pending&&isAccident;
 $('newsNext').textContent=pending&&isAccident?'先に対応を選んでください':newsIndex+1<items.length?'次のニュースへ →':'今週の決算へ →';
 $('newsScene').scrollTop=0;$('newsTitle').focus({preventScroll:true});
}
function resumeTheater(){
 $('weekScene').hidden=false;document.body.classList.add('scene-locked');
 const stage=game.presentation?.stage;newsIndex=Number.isInteger(game.presentation?.newsIndex)?Math.max(0,game.presentation.newsIndex):0;
 if(stage==='working'||stage==='outcome'){hideTheater();$('workingScene').hidden=false;showOutcome();}
 else if(stage==='news'){renderNews();}
 else if(pendingAccident(game.lastResult)){newsIndex=0;renderNews();}
 else showWeekReport(game.lastResult,game.finished);
}
function finishWeek(){
 if(resolving||$('reportContinue').disabled||pendingAccident(game.lastResult)||game.rescuePending)return;
 game.presentation=null;save();
 const final=game.finished;
 $('weekScene').hidden=true;
 $('workingScene').hidden=false;$('shockScene').hidden=true;$('reportScene').hidden=true;$('rescueScene').hidden=true;
 document.body.classList.remove('scene-locked');
 changeScreen('office');
 const result=game.lastResult;
 if(result){
  rollFigure($('cashCount'),result.cashBefore,result.cashAfter,n=>man(n)+'<small>万円</small>');
  rollFigure($('personalBalance'),result.personalCashBefore,result.personalCashAfter,n=>currency(n));
 }
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
 $('personalBalance').textContent=currency(s.personalCash);
 const due=G.PERSONAL.dueWeeks.find(w=>w>=s.week);
 $('supportDue').textContent=due?`第${due}週 ${currency(G.PERSONAL.support)}`:'今期の支払い終了';
 $('arrearsBadge').hidden=!s.arrears;
 $('arrearsBadge').textContent='未払い '+man(s.arrears)+'万';
 const macro=G.currentMacro(s);
 $('macroName').textContent=macro.name;$('macroEffect').textContent=macro.detail;
 $('worldRibbon').classList.toggle('is-bad',macro.id==='inflation'||macro.id==='slump'||macro.id==='inspection');
 $('weekIndicator').textContent=`${Math.min(s.week,G.campaignWeeks(s))} / ${G.campaignWeeks(s)}`;
 $('progressBar').style.width=`${s.finished?100:Math.round((s.week-1)/G.campaignWeeks(s)*100)}%`;
 $('heroWeek').textContent=s.finished?'契約終了':`第${s.week}週`;
 const chapter=s.week<=10?'第1章・生存':s.week<=20?'第2章・再建':'第3章・決着';
 document.querySelector('.topline .eyebrow').textContent='CONSULTING FILE / 001 ・ '+chapter;
 $('decisionWeek').textContent=s.finished?'全日程終了':`第${s.week}週`;
 $('skillValue').textContent=s.skill;$('skillBar').style.width=s.skill+'%';
 $('payValue').textContent=yen(s.pay);$('notorietyText').textContent=`悪名：${s.notoriety} / 100`;
 $('consultantTitle').textContent=rating(s);
 $('cashCount').innerHTML=man(s.cash)+'<small>万円</small>';
 $('netCount').innerHTML=man(s.profit)+'<small>万円</small>';
 $('repCount').innerHTML=s.storeRep+'<small>/100</small>';
 $('dashSales').innerHTML=man(s.sales)+'<small>万円</small>';
 $('dashProfit').innerHTML=man(s.profit)+'<small>万円</small>';
 $('dashPrice').innerHTML=s.price+'<small>円</small>';
 $('dashQuality').innerHTML=s.quality+'<small>/100</small>';
 $('dashStaff').innerHTML=s.staff+'<small>/100</small>';
 $('dashSat').innerHTML=s.sat+'<small>/100</small>';
 $('heatCount').innerHTML=s.fire+'<small>/100</small>';
 $('repMeter').style.width=s.storeRep+'%';$('heatMeter').style.width=s.fire+'%';
 const shopDiff=s.lastResult?.deltaCash??0;
 const personalDiff=s.history.length?(s.personalCash-(s.lastResult?.personalCashBefore??s.personalCash)):0;
 $('cashTrend').textContent=s.history.length?'今週 '+moneyChange(shopDiff):'開始時点';
 $('cashTrend').className='cash-delta '+(s.history.length?cashClass(shopDiff):'flat');
 $('personalTrend').textContent=s.history.length?'今週 '+moneyChange(personalDiff):'開始時点';
 if($('personalFlow')){const h=s.lastResult; $('personalFlow').textContent=h?`入 +${yen((h.fee||0)+(h.boardroomBonus||0))} / 出 −${yen((h.personalLiving||0)+(h.supportPaid||0)+(h.personalDevilPayment||0))}`:'生活費 毎週7,000円';}
 $('personalTrend').className='cash-delta '+(s.history.length?cashClass(personalDiff):'flat');
 document.querySelector('.play-stat.money').classList.toggle('in-danger',s.cash<120000);
 $('overheadCount').textContent='毎週 '+man(155000-(60-s.staff)*800)+'万円';
 $('loanHint').textContent=s.debt>0?' / 借入残 '+man(s.debt)+'万円':'';
 $('proposalBudget').textContent='店 '+man(s.cash)+'万 / 自分 '+man(s.personalCash)+'万｜次の養育費 '+(due?'第'+due+'週':'支払済');
 $('meetingStatus').textContent=`経営指標は「詳細ステータス」から確認できます`;
 const diagnosis=G.rootDiagnosis(s);
 const scene=G.weeklyBrief(s),upcoming=G.STORIES.active(s);
 $('storyPulse').hidden=!(scene.episode||upcoming.length);
 $('storyPulse').textContent=scene.episode?
  '物語の転換点｜'+(scene.phase==='follow'?'過去の判断に続報':'大型事件発生')+'・4つの対応が未来を変える':
  upcoming.length?'未解決の因縁 '+upcoming.length+'件｜数週間後に新展開':'';
 $('meetingSignal').textContent=diagnosis.active&&!diagnosis.solved&&s.cash>=125000?'現場調査：'+diagnosis.label+'。'+diagnosis.clue:G.boardroomSignal(s);
 $('diagnosisBrief').hidden=!diagnosis.active;
 if(diagnosis.active){
  $('diagnosisBrief').classList.toggle('is-solved',diagnosis.solved);
  $('diagnosisHeadline').textContent=diagnosis.solved?'根本原因を改善済み':'現場メモ：'+diagnosis.label;
  $('diagnosisClue').textContent=diagnosis.solved?'対策済み。以前の損失や客離れが収まってきた。':diagnosis.clue+' '+diagnosis.witness;
 }
 $('proposalDiagnosis').hidden=!diagnosis.active||diagnosis.solved;
 if(diagnosis.active&&!diagnosis.solved)$('proposalDiagnosis').textContent='現場の証言：'+diagnosis.clue+' '+diagnosis.witness+' 根本対策の費用は'+(diagnosis.cost/10000).toFixed(1)+'万円。';

 const fixedBills=155000-(60-s.staff)*800+macro.fixed;
 const left=s.cash-fixedBills;
 $('meetingBills').textContent='約'+man(fixedBills)+'万円';
 $('meetingLeft').textContent=(left<0?'不足 ':'残り ')+man(Math.abs(left))+'万円';
 $('meetingLeft').className=left<0?'meeting-negative':'';
 const deal=G.boardroomDemand(s);
 $('meetingDeal').hidden=!deal;
 if(deal)$('meetingDealText').textContent=`社長案で報酬 +${yen(deal.bonus)}円（店の資金から）`;
 $('proposalMeetingTarget').textContent=deal?`社長の推し案「${deal.actionName}」で個人報酬 +${yen(deal.bonus)}円（店負担）`:'社長の臨時報酬なし。利益と信用で勝負。';
 $('repValue').textContent=s.storeRep;$('salesValue').textContent=man(s.sales);$('fireValue').textContent=s.fire;
 $('satValue').textContent=s.sat;$('frustValue').textContent=s.frust;
 $('satBar').style.width=s.sat+'%';$('frustBar').style.width=s.frust+'%';
 setFaces();
 renderOfficeScene();
 $('goalChip').textContent=`契約利益 ${man(G.goalStatus(s).profit)} / ${man(s.contractGoal)}万`;
 $('moodStatus').textContent=s.frust>=68?'不満爆発寸前':s.sat>=72?'ごきげん':s.frust>=43?'不満が蓄積':'まずまず';
 $('shopStatus').textContent=s.fire>=60?'大炎上':s.fire>=30?'騒動発生':'営業中';
 if(s.lastResult){$('latestHeadline').textContent=s.lastResult.title;$('latestBody').textContent=s.lastResult.body;}
 else{$('latestHeadline').textContent='支払い期限まで、あとわずか';$('latestBody').textContent='客足減少と固定費で資金が底をつきそう。初仕事から再建の正念場。';}
 const brief=G.weeklyBrief(s);
 $('directorQuote').textContent=brief.quote;
 $('actionHeading').textContent=brief.title;
 renderActions();renderProjects();renderDevil();renderHistory();renderPublic();
 $('advanceButton').disabled=false;
 $('openProposals').textContent=s.rescuePending?'緊急再建会議へ →':s.finished?'契約結果を見る →':'4つの作戦を見る →';
 $('advanceButton').innerHTML=s.finished?'最終決算を見る <span aria-hidden="true"></span>':'この案で営業する <span aria-hidden="true"></span>';
}
function renderActions(){const s=game;
 const offers=s.finished?[G.ACTIONS.find(a=>a.id===s.selected)||G.ACTIONS[0]]:G.weeklyOffers(s);
 if(!s.finished&&!offers.some(x=>x.id===s.selected))s.selected=offers[0].id;
 $('actions').innerHTML=offers.map(a=>{
 const on=s.selected===a.id,disabled=s.finished||!G.enabled(s,a.id);
 const bonus=G.boardroomDemand(s)?.actionId===a.id;
 const odds=G.performanceOdds(s,a.id);
 return `<button type="button" class="action-option${a.id.startsWith('fix_')?' root-option':''}" role="radio" aria-checked="${on}" ${disabled?'disabled':''} data-id="${esc(a.id)}"><span class="action-emoji policy-preview" aria-hidden="true">${window.PolicySymbols.markup(a.id)}</span><span class="action-name">${esc(a.name)}</span>${bonus?'<span class="boss-pick">社長の推し・臨時報酬</span>':''}${a.id.startsWith('fix_')?'<span class="root-pick">コンサルの根本対策</span>':''}<span class="action-effect">${esc(a.effect)}</span><span class="action-odds">失敗 ${odds?.failure??0}% <span>｜大成功 ${odds?.great??0}%</span></span></button>`;
 }).join('');
 const a=G.ACTIONS.find(a=>a.id===s.selected);
 $('selectedIcon').innerHTML=window.PolicySymbols.markup(a.id);$('selectedTitle').textContent=a.name;$('selectedDesc').textContent=a.detail;
 const r=riskLabel(G.previewRisk(s,s.selected)),label=$('riskLabel');label.textContent=r[0];label.className=r[1];
 $('riskNote').textContent=s.finished?'決算で結果を確認':r[2];
 const selectedOdds=G.performanceOdds(s,s.selected);
 $('selectedPerformance').textContent=selectedOdds?
  '失敗 '+selectedOdds.failure+'% ／ 成功 '+selectedOdds.success+'% ／ 大成功 '+selectedOdds.great+'%':
  '決算済み';
 $('successStreak').textContent='連続好調 '+(s.momentum||0)+'/3｜失敗時は原則80%効果・大成功は135%';
 $('pitchTone').textContent=G.weeklyBrief(s).quote;
 $('pitchTone').classList.toggle('is-crisis',!s.finished&&G.weeklyBrief(s).id==='crisis');
}
function updateOptionalSummary(){
 const chosen=[];
 if(selectedProject){const project=G.PROJECTS.find(x=>x.id===selectedProject);if(project)chosen.push('投資：'+project.name);}
 if(selectedDevil){const pact=G.DEVIL_OFFERS.find(x=>x.id===selectedDevil);if(pact)chosen.push('悪魔：'+pact.name);}
 $('optionalSummary').textContent=chosen.length?chosen.join(' / '):'選ばなければ0円・本業の4択は必須';
 $('optionalActions').classList.toggle('has-extra',chosen.length>0);
}
function renderProjects(){
 const s=game,options=G.availableProjects(s);
 if(selectedProject && options.find(x=>x.id===selectedProject)?.nextCost>s.cash)selectedProject=null;
 $('projectChoices').innerHTML=[{id:'none',icon:'',name:'投資なし',level:0,nextCost:0,desc:'手元の資金を守る'},...options].map(o=>{
  const isNone=o.id==='none',cost=o.nextCost;
  const disabled=!isNone&&(cost===null||s.cash<cost||s.finished);
  const selected=isNone?selectedProject===null:selectedProject===o.id;
  const caption=isNone?'0円':cost===null?'最大レベル':man(cost)+'万円';
  return `<button type="button" class="project-choice ${selected?'is-selected':''}" role="radio" aria-checked="${selected}" data-project="${o.id}" ${disabled?'disabled':''}><span><svg class="mini-ill"><use href="#${o.id==='equipment'?'art-warning':o.id==='people'?'art-people':o.id==='fans'?'art-heart':'art-coin'}"/></svg> ${esc(o.name)}</span><small>${isNone?'いつでもOK':`Lv${o.level}/2 · ${caption}`}</small></button>`;
 }).join('');
 const found=options.find(x=>x.id===selectedProject);
 $('projectNote').textContent=found?`今週 −${yen(found.nextCost)}円。${found.desc}。次週から効果。選ばなくても進めます。`:'追加投資なし：0円。まず4つの作戦から1つ選ぼう。';
 updateOptionalSummary();
}
function renderDevil(){
 const available=G.pactAvailable(game);
 if(!available)selectedDevil=null;
 $('devilAvailability').textContent=available?'契約は最大2回。代償を読もう':'今は契約できません';
 $('devilChoices').innerHTML=[{id:'none',name:'契約しない',desc:'今週は人間だけで何とかする'},...G.DEVIL_OFFERS].map(o=>{
  const selected=o.id==='none'?selectedDevil===null:selectedDevil===o.id;
  return `<button type="button" class="devil-choice" role="radio" aria-checked="${selected}" data-devil="${o.id}" ${!available&&o.id!=='none'?'disabled':''}><strong>${esc(o.name)}</strong><small>${esc(o.desc)}</small></button>`;
 }).join('');
 $('devilNotice').textContent=selectedDevil?`契約「${G.DEVIL_OFFERS.find(o=>o.id===selectedDevil)?.name}」を今週の営業と同時に実行します。`:'悪魔は任意。今すぐの利益と、数週後の返済を比べて選んでね。';
 updateOptionalSummary();
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
 openModal(`<div class="modal-kicker">WEEK ${String(h.week).padStart(2,'0')} / ${G.campaignWeeks(game)} — ${esc(badge)}</div><h2 id="modalTitle">今週の経営結果</h2><div class="modal-news"><strong>${esc(h.title)}</strong><p>${esc(h.body)}</p></div><div class="result-grid">${tile('週間売上',man(h.sales)+'万円','前週比 '+(h.deltaSales>=0?'+':'')+man(h.deltaSales)+'万円',h.deltaSales<0)}${tile('今週の粗利益',man(h.profit)+'万円',h.profit<0?'赤字に転落！':'売上−原価−経費',h.profit<0)}${tile('コンサル報酬',yen(h.fee)+'円','累計 '+yen(game.pay)+'円')}${tile('店の資金',man(h.cashAfter??game.cash)+'万円','前週比 '+man(h.deltaCash||0)+'万円',(h.deltaCash||0)<0)}</div><div class="modal-comment">${esc(h.ceo)}</div><div class="modal-detail">世間評価 <b>${game.storeRep}/100</b>（${val(h.deltaRep)}） ／ 炎上度 <b>${game.fire}/100</b>（${val(h.deltaFire)}）<br>有能さ <b>${game.skill}/100</b>（${val(h.deltaSkill)}）${h.boycottActive?'<br> 不買運動による売上減少が発生':''}</div><div class="modal-actions"><button id="resultContinue" class="primary-btn" type="button">${finish?'最終決算へ':'わかった！ 次の週へ'} <span aria-hidden="true"></span></button></div>`,finish?()=>finishModal():null);
 $('resultContinue').addEventListener('click',closeModal);
}
function finishModal(){
 const s=game,goal=G.goalStatus(s),outcome=G.ending(s);
 const fires=s.history.filter(h=>h.fireHit).length;
 const memories=(s.storyJournal||[]).length;
 openModal(`<div class="modal-kicker">${s.bankrupt?'EMERGENCY / 資金ショート':'FINAL REPORT / 契約の最終審査'}</div><h2 id="modalTitle">${outcome.passed?' 契約達成！':' 契約結果のお知らせ'}</h2><div class="end-stamp"><svg class="mini-ill"><use href="#art-document"/></svg> ${esc(outcome.name)}</div><div class="result-grid" style="margin-top:15px"><div class="result-tile"><span>累計利益 / 目標</span><b>${man(goal.profit)} / ${man(s.contractGoal)}万</b><small>${goal.profit>=s.contractGoal?'利益目標クリア':'利益目標まで'+man(goal.profitGap)+'万円'}</small></div><div class="result-tile"><span>評判 / 条件</span><b>${s.storeRep} / 50</b><small>${s.storeRep>=50?'信用条件クリア':'信用条件まであと'+goal.repGap}</small></div><div class="result-tile"><span>累計報酬</span><b>${yen(s.pay)}円</b></div><div class="result-tile"><span>炎上回数</span><b>${fires}回</b></div></div><div class="modal-comment">${esc(outcome.line)}</div><p class="modal-detail">主人公の財布：${man(s.personalCash)}万円 ／ 養育費未払い：${man(s.arrears)}万円 ／ 悪魔の契約：${s.pactCount}回 ／ 解決した事件：${memories}件。お店だけでなく、あなた自身も生き残れた？</p><div class="modal-actions"><button id="endRestart" class="primary-btn" type="button">新しい依頼を探す </button></div>`);
 $('endRestart').addEventListener('click',()=>{closeModal();showEntry('contracts');});
}
function showFirstWeekGuide(){
 openModal(`<div class="modal-kicker">はじめての経営 / WEEK 01</div><h2 id="modalTitle">さあ、最初の経営会議よ。</h2><div class="modal-detail first-week-guide"><p>あなたの仕事は、<b>30週間でモグモグマートを立て直すこと。</b> まずは、たった3つの操作だけ覚えてね。</p><ol><li><b>今週の課題を読む</b> — 社長や店長からの相談を確認。</li><li><b>「4つの作戦を見る」</b> — 対応策を1つ選ぶ。投資と悪魔の契約は任意よ。</li><li><b>「この案で営業する」</b> — 失敗・成功・大成功を判定し、数週間後に後日談が生まれることもあるわ。</li></ol><p><b>忘れないで：</b>店の資金・自分の財布・お店の評判は別々。お金だけ増やしても、信用を失えば再建失敗よ。</p><p class="first-week-goal">契約目標：累計利益255万円 ＋ 評判50以上</p></div><div class="modal-actions"><button id="firstWeekStart" class="primary-btn" type="button">わかった！ 今週の課題を見る →</button></div>`);
 $('firstWeekStart').addEventListener('click',()=>{closeModal();$('openProposals').focus({preventScroll:true});});
 $('firstWeekStart').focus({preventScroll:true});
}
function aboutModal(){openModal(`<div class="modal-kicker">HOW TO PLAY</div><h2 id="modalTitle">遊び方は、とっても簡単。</h2><div class="modal-detail"><ol><li><b>依頼を受ける。</b>タイトルからモグモグマートを選ぶ。</li><li><b>相談に答える。</b>店長や社長からの問題に4つの対応策から選ぶ。施策ごとに失敗・成功・大成功の確率が違う。</li><li><b>1週間進める。</b>売上・利益・世間の評価などが変化。炎上は確率で起きる。選んだ対応は、数週間後に後日談となって返ってくる。</li><li><b>生き残る。</b>店舗資金と主人公の生活費を別々に管理。毎週の生活費・4週間ごとの養育費を払おう。</li><li><b>社会情勢と悪魔。</b>景気や行政で売上・原価が変化。悪魔に助けを求めると期限付きの代償が発生する。</li><li><b>契約達成。</b>30週間で利益255万円・評判50以上。店の倒産や生活破綻で途中終了。</li></ol><p>「有能さ」は依頼先からの評価。「悪名」は世間の悪評。消費者の満足度と不満は別々に動くわ。</p><p>セーブはこの端末のブラウザ内に自動保存。必要ならJSONでバックアップできるの。</p><p><b>この作品はフィクション。</b>企業名・商品・事件や数値は架空で、現実の企業経営に関する助言ではありません。</p></div><div class="modal-actions"><button id="aboutClose" class="primary-btn" type="button">わかった！ </button></div>`);$('aboutClose').addEventListener('click',closeModal);}
function setup(){
 game=load();installTheaterLayout();paint();showEntry('title');
 $('titleStart').addEventListener('click',()=>showEntry('contracts'));
 $('titleResume').addEventListener('click',()=>{
  changeScreen('office');showEntry('game');
  if(game.presentation?.week===game.lastResult?.week){resumeTheater();}
  else if(game.rescuePending||game.lastResult?.accidentResponse===null&&game.lastResult?.incidentCost>0&&game.lastResult?.accidentId){
   resumeTheater();
  }else if(game.finished)finishModal();
 });
 $('titleHelp').addEventListener('click',aboutModal);
 $('contractsBack').addEventListener('click',()=>showEntry('title'));
 $('acceptMarket').addEventListener('click',chooseMarket);
 $('prologueNext').addEventListener('click',advancePrologue);
 $('prologueSkip').addEventListener('click',finishPrologue);
 $('backTitle').addEventListener('click',()=>showEntry('title'));
 $('projectChoices').addEventListener('click',ev=>{const b=ev.target.closest('[data-project]');if(!b||b.disabled||game.finished)return;selectedProject=b.dataset.project==='none'?null:b.dataset.project;renderProjects();});
 $('devilChoices').addEventListener('click',event=>{const b=event.target.closest('[data-devil]');if(!b||b.disabled)return;selectedDevil=b.dataset.devil==='none'?null:b.dataset.devil;renderDevil();});
 $('actions').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button||button.disabled||game.finished)return;game.selected=button.dataset.id;save();renderActions();});
 $('advanceButton').addEventListener('click',startWeek);
 $('workingSkip').addEventListener('click',showOutcome);
 $('outcomeDetailsToggle').addEventListener('click',()=>{
  const toggle=$('outcomeDetailsToggle'),panel=$('outcomeDetailsPanel');
  const willOpen=toggle.getAttribute('aria-expanded')!=='true';
  toggle.setAttribute('aria-expanded',String(willOpen));panel.hidden=!willOpen;
  if(willOpen)panel.scrollIntoView({block:'nearest',behavior:'auto'});
 });
 $('outcomeNext').addEventListener('click',()=>{if($('outcomeScene').hidden)return;newsIndex=0;renderNews();});
 $('newsNext').addEventListener('click',()=>{if($('newsScene').hidden||$('newsNext').disabled)return;newsIndex++;renderNews();});
 $('officeStoreMoney').addEventListener('click',()=>openMoney('store',$('officeStoreMoney')));
 $('officePersonalMoney').addEventListener('click',()=>openMoney('personal',$('officePersonalMoney')));
 $('meetingMoneyButton').addEventListener('click',()=>openMoney('store',$('meetingMoneyButton')));
 $('proposalMoneyButton').addEventListener('click',()=>openMoney('store',$('proposalMoneyButton')));
 $('reportLedgerButton').addEventListener('click',()=>openMoney('store',$('reportLedgerButton')));
 $('moneyStoreTab').addEventListener('click',()=>setMoneyKind('store'));
 $('moneyPersonalTab').addEventListener('click',()=>setMoneyKind('personal'));
 $('moneyClose').addEventListener('click',closeMoney);
 $('moneyDone').addEventListener('click',closeMoney);
 $('moneyBackdrop').addEventListener('click',closeMoney);
 $('openStatusSheet').addEventListener('click',openStatusSheet);
 $('statusClose').addEventListener('click',closeStatusSheet);
 $('statusBackdrop').addEventListener('click',closeStatusSheet);
 $('statusDone').addEventListener('click',closeStatusSheet);
 $('statusReport').addEventListener('click',reopenLastReport);
 $('weekSceneClose').addEventListener('click',closeWeekScene);
 // Block only rapid double-tap zoom on game dialogs. Normal taps, scrolling and pinch remain available.
 for(const panel of document.querySelectorAll('.proposal-sheet,.money-sheet,.status-sheet,.week-scene,.modal-layer')){
  let lastTap=0;
  panel.addEventListener('touchend',event=>{
   const now=Date.now();
   if(event.target.closest('button,summary,details,input,select,textarea,a,label')){lastTap=0;return;}
   if(now-lastTap<310&&event.touches.length===0&&event.changedTouches.length===1){event.preventDefault();lastTap=0;}
   else lastTap=now;
  },{passive:false});
  panel.addEventListener('dblclick',event=>event.preventDefault());
 }

 $('openProposals').addEventListener('click',()=>{if(game.rescuePending){$('weekScene').hidden=false;document.body.classList.add('scene-locked');showRescueScene();}else if(game.lastResult?.accidentResponse===null&&game.lastResult?.incidentCost>0&&game.lastResult?.accidentId){reopenLastReport();}else if(game.finished)finishModal();else openProposals();});
 $('closeProposals').addEventListener('click',closeProposals);
 $('closeProposalBackdrop').addEventListener('click',closeProposals);
 $('reportContinue').addEventListener('click',finishWeek);
 $('rescueChoices').addEventListener('click',e=>{const b=e.target.closest('[data-rescue]');if(b)applyRescue(b.dataset.rescue);});
 $('rescueGiveUp').addEventListener('click',()=>applyRescue('giveup'));
 for(const [id,response]of [['accidentRepair','repair'],['accidentIgnore','ignore']])$(id).addEventListener('click',()=>{
  try{game=G.handleAccident(game,response);save();paint();renderNews();toast(game.lastResult.responseText);}catch(err){toast(err.message||'対応できませんでした');}
 });
 document.querySelectorAll('.game-tab').forEach(b=>b.addEventListener('click',()=>changeScreen(b.dataset.screen)));
 $('aboutButton').addEventListener('click',aboutModal);
 $('modalClose').addEventListener('click',closeModal);
 $('modal').querySelector('.modal-backdrop').addEventListener('click',closeModal);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(!$('moneySheet').hidden){closeMoney();return;}if(!$('statusSheet').hidden){closeStatusSheet();return;}if(!$('weekScene').hidden){closeWeekScene();return;}if(!$('proposalSheet').hidden)closeProposals();else if(!$('modal').hidden)closeModal();}});
 document.querySelectorAll('.hint').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.tip)));
 $('historyToggle').addEventListener('click',()=>{const p=$('historyPanel');p.hidden=!p.hidden;$('historyToggle').setAttribute('aria-expanded',String(!p.hidden));});
 $('restartButton').addEventListener('click',()=>{if(!confirm('現在の経営を初期化しますか？（元に戻せません）'))return;game=G.initial(Date.now());selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');showEntry('contracts');toast('新しい依頼を選んでください');});
 $('exportButton').addEventListener('click',()=>{
  const data=new Blob([JSON.stringify(game,null,2)],{type:'application/json'}),url=URL.createObjectURL(data);const a=document.createElement('a');a.href=url;a.download='okyakusama-save-v1.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('セーブをJSONで書き出しました');
 });
 $('importButton').addEventListener('click',()=>$('importInput').click());
 $('importInput').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{if(file.size>1024*1024)throw Error('ファイルが大きすぎます');const s=G.validateSaved(JSON.parse(await file.text()));if(!confirm(`第${Math.min(s.week,G.campaignWeeks(s))}週のデータを読み込み、今の記録を上書きしますか？`))return;game=s;selectedProject=null;selectedDevil=null;save();paint();changeScreen('office');toast('セーブを復元しました');}
  catch(err){toast('読み込み不可：'+(err.message||'ファイルが不正です'));}
 });
 if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('オフライン準備に失敗',err));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();