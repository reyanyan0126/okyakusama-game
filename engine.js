/* お客様のために。v0.7 - weekly strategies, persistent upgrades and optional incident handling. */
(function(root){
'use strict';
const VERSION = 1, MAX_WEEKS = 12;
const CONTRACT={profit:1000000,reputation:50}; // 12-week client success conditions
// Persistent investments are a second tactical choice. Their costs are capital outlays,
// not P&L expenses. A player can choose at most one per week, or skip investing.
const PROJECTS=[
 {id:'equipment',icon:'🧊',name:'設備を更新',costs:[45000,62000],desc:'故障リスクと事故被害を減らす'},
 {id:'people',icon:'🧑‍🍳',name:'スタッフを育てる',costs:[35000,52000],desc:'売上と接客力が毎週少し上がる'},
 {id:'fans',icon:'🤝',name:'常連を増やす',costs:[42000,59000],desc:'固定客が増え、評判が積み上がる'}
];
const PROJECTS_BY_ID=Object.fromEntries(PROJECTS.map(x=>[x.id,x]));
const blankUpgrades=()=>({equipment:0,people:0,fans:0});
function projectCost(s,id){const project=PROJECTS_BY_ID[id];if(!project)return null;const lvl=s.upgrades?.[id]??0;return lvl>=2?null:project.costs[lvl];}
function availableProjects(s){return PROJECTS.map(p=>({...p,level:s.upgrades?.[p.id]??0,nextCost:projectCost(s,p.id)}));}

const cap=(n,min,max)=>Math.max(min,Math.min(max,n));
const int=(n)=>Math.round(n);
const ACTIONS=[
 {id:'raise',icon:'💴',name:'「原材料のため」10円値上げ',effect:'利益↑ / 不満↑',detail:'価格を10円上げる。売れ行きには影響が出るかも。',minMax:'price',type:'hard'},
 {id:'lower',icon:'🏷️',name:'渾身の10円値下げ',effect:'人気↑ / 利益↓',detail:'価格を10円下げる。買いやすさで勝負。',minMax:'price',type:'kind'},
 {id:'shrink',icon:'📦',name:'お手軽サイズに進化',effect:'原価↓ / 不満↑',detail:'10g減らして「食べやすい」と発表。表示は正確、評判は別問題。',minMax:'size',type:'hard'},
 {id:'cheap',icon:'🥣',name:'昔の味は思い出の中に',effect:'原価↓ / 品質↓',detail:'原材料を見直して原価を抑える。味の変化に注意。',minMax:'quality',type:'hard'},
 {id:'quality',icon:'✨',name:'本当においしくする',effect:'満足↑ / 原価↑',detail:'信じられないが、原料をよくして味で勝負する。',minMax:'quality',type:'kind'},
 {id:'staff',icon:'👥',name:'行列こそ人気の証',effect:'経費↓ / 接客↓',detail:'人件費を削減。レジに並ぶ時間はお客様にプレゼント。',minMax:'staff',type:'hard'},
 {id:'explain',icon:'📣',name:'まさかの正直な説明',effect:'信頼↑ / 費用↑',detail:'全部ちゃんと説明する。広報費1万円。社長が不安そう。',type:'kind'},
 {id:'sale',icon:'🎉',name:'店長、反省セール',effect:'客数↑ / 経費↑',detail:'今週だけ15円引き。広告費1.2万円が必要。',type:'kind'},
 {id:'points',icon:'🪙',name:'ポイント制度の「進化」',effect:'経費↓ / 不満↑',detail:'還元率を減らして「制度を進化」。進化先は誰の財布？',type:'hard'},
 {id:'pop',icon:'📢',name:'広告の方が大盛り',effect:'客数↑ / 炎上↑',detail:'商品より先に広告だけ豪華に。期待だけが一人歩き。',type:'hard'},
 {id:'tasting',icon:'🥄',name:'胃袋で説得する',effect:'客数↑ / 費用↑',detail:'試食で商品の良さを伝える。今週の経費は増える。',type:'kind'},
 {id:'local',icon:'🥬',name:'地元と真面目に組む',effect:'満足↑ / 経費↑',detail:'地元産の商品を集めて特設売り場を作る。',type:'kind'},
 {id:'restorestaff',icon:'🧑‍💼',name:'人間のレジを復活',effect:'満足↑ / 経費↑',detail:'減らしたスタッフを戻す。行列と不満を減らそう。',type:'kind'},
 {id:'apology',icon:'🎙️',name:'社長を謝罪会見に出す',effect:'火消し↑ / 費用↑',detail:'社長の額に汗。真摯に説明して、炎上を鎮める。',type:'kind'},
 {id:'recall',icon:'🚚',name:'売り場を本気で立て直す',effect:'信用↑ / 利益↓↓',detail:'商品の品質と量を回復。お金はかかるが、次の常連を守る。',type:'kind'},
 {id:'blame',icon:'🫥',name:'「誤解」で押し通す',effect:'利益↑↑ / 炎上↑↑',detail:'説明を避けて一時的にコスト削減。火に油かもしれない。',type:'hard'},
 {id:'loyalty',icon:'📝',name:'常連の苦情を全部読む',effect:'信頼↑ / 経費↑',detail:'耳の痛い声ほど改善に使う。社長は耳栓を探している。',type:'kind'},
 {id:'stamp',icon:'🎟️',name:'「今だけ！」特別企画',effect:'売上↑↑ / 反動注意',detail:'本当に期間限定の販促で集客。来週の期待値も上がる。',type:'hard'},
 {id:'audit',icon:'🔎',name:'数字を正直に見せる',effect:'信用↑ / 費用↑',detail:'価格と原価の説明会。社長がグラフを見たがらない。',type:'kind'},
 {id:'maintenance',icon:'🛠️',name:'冷蔵庫にお金を使う',effect:'故障対策 / 費用↑',detail:'壊れてから直すよりは安い。社長には難しい概念。',type:'kind'},
 {id:'loan',icon:'🏦',name:'銀行に泣きつく',effect:'運転資金+20万円 / 借金↑',detail:'20万円のつなぎ融資。毎週返済が発生。友情は無利息、銀行は違う。',type:'hard'}
];
const ACTIONS_BY_ID=Object.fromEntries(ACTIONS.map(a=>[a.id,a]));
const QUOTES={
 raise:'社長「お客様の購買力を信じている。強く。」',
 lower:'社長「安くなったのはいい。利益はどこへ？」',
 shrink:'社長「環境にも配慮して、商品を軽量化した！」',
 cheap:'社長「味の違いは、企業努力である。」',
 quality:'社長「良いものを作る。利益もついてきてくれ。」',
 staff:'社長「少数精鋭だ！ 少数の方から苦情が来ているが！」',
 explain:'社長「説明責任を果たした。何を説明したかも説明しよう。」',
 sale:'社長「お客様の笑顔！ 私の電卓は泣いている！」',
 points:'社長「ポイントは気持ち。気持ちは経費で落ちない。」',
 pop:'社長「広告の声だけデカくしてみた。商品は通常運転だ。」',
 tasting:'社長「試食を配ったら会議室のお菓子が消えた！」',
 local:'社長「地元愛で売ろう。広告費は全国区だが！」',
 restorestaff:'社長「レジ待ちゼロ！ 人件費は見ないことにする。」',
 apology:'社長「反省している！ だがマイクの数には納得していない！」',
 recall:'社長「品質が上がったのは認める。請求書は認めない。」',
 blame:'社長「これは誤解だ。私の発言だけは正しく理解してくれ。」',
 loyalty:'社長「客の声を聞く会？ 私は別会議がある。」',
 stamp:'社長「お客様の熱意を感じる！ 本当は値札の赤色か？」',
 audit:'社長「透明性は大事だ。私の給与以外はな。」',
 maintenance:'社長「壊れていない物に金を払うのか？ 壊れたら文句を言うぞ！」',
 loan:'社長「借金は未来の私が返す。未来の私には期待している！」'
};
const NEWS={
 raise:['じわっと値上げ、財布にはずっしり','「お値段に気持ちを込めました」。消費者は値札を二度見。'],
 lower:['10円値下げ、拍手はまばら','「もう一声！」という声も。売り場の空気は少しやわらいだ。'],
 shrink:['「お手軽サイズ」へ進化','社長「持ち運びやすさを追求」。消費者「中身も持ち去られた」。'],
 cheap:['こだわりの「新しい味」発売','社長「進化です」。常連客「前の味を返して」。'],
 quality:['味にこだわり、経費は悲鳴','口コミ「最近おいしくなった」。経理「最近つらくなった」。'],
 staff:['レジの行列が大盛況','社長「人の集まる店になった！」。それ、待ち行列です。'],
 explain:['異例の「ちゃんと説明」会見','「容量と価格について正直に説明」。消費者「最初からそれでいい」。'],
 sale:['セール開催！レジは大忙し','「お買い得！」の声が続出。社長は粗利益の計算を始めた。'],
 points:['ポイント制度が進化（当社比）','お客様「還元率だけ先に未来へ行った」。社長は拍手。'],
 pop:['特大広告で客が集まる','期待だけ先に最高値を更新。肝心の商品はいつもの味。'],
 tasting:['試食で売り場に行列','「食べたら買う」が増加。社長「無料なのに売れる！」'],
 local:['地元野菜が人気に','お客様「こういうのでいい」。社長「普通すぎて逆に不安だ」。'],
 restorestaff:['レジの行列が短くなる','お客様「ちゃんと人がいる！」。社長「今まで何だったのか」。'],
 apology:['店長、まさかの謝罪会見','「普通の説明」がネットで好感触。社長は逆に不満。'],
 recall:['商品が本気で改善される','「そこまでやるなら見直す」。常連が少しずつ戻ってきた。'],
 blame:['会社側「誤解です」を連呼','消費者「まず何が誤解か教えて」。広報部の目が死んだ。'],
 loyalty:['常連客の本音を公開','「やっと人の話を聞いた」。社長「数字にしてくれ」。'],
 stamp:['週末限定企画に客が殺到','「今だけ！」が本当に今だけだった。珍しい。'],
 audit:['数字を出したら静かになった','原価を見せたら説得力。社長は帳簿を隠そうとした。'],
 maintenance:['壊れる前に修理した','経理「何も起きないのが成果です」。社長「ニュースにならん！」'],
 loan:['銀行から資金調達！','社長「資金が増えた！」経理「返す必要がある数字です」。']
};
const MEMORY_NEWS={
 shrink:['過去の容量変更が再注目','昔のパッケージ写真が拡散。「思い出だけは大容量」。'],
 cheap:['旧商品の味を懐かしむ投稿が話題','「昔はもっとおいしかった」と比較レビューが増加。'],
 staff:['レジ待ち体験談が拡散','「長すぎて季節が変わった」。客が行列の写真を投稿。'],
 points:['ポイント改定が掘り返される','昔の明細が発掘。「還元されていたのは期待だけ」。'],
 pop:['広告と実物の温度差が話題','「広告が一番おいしそう」。消費者が冷静な比較投稿。'],
 blame:['「誤解」発言が再炎上','「謝らない自由」と「買わない自由」が衝突した。'],
 stamp:['限定企画終了、客ががっかり','「先週だけのお得」が今週にはない。期待の反動が発生。']
};
const INCIDENTAL=[
 {id:'good',title:'常連客の口コミが好評',body:'「なんだかんだ便利」。そんな声が少し増えた。',demand:1.09,rep:2,sat:2,fire:-2},
 {id:'rival',title:'ライバル店が週末セール',body:'近くの店が特売を開始。お客様の足が少し遠のいた。',demand:.90,rep:0,sat:0,fire:0},
 {id:'trend',title:'お弁当需要が急増',body:'街のイベントで買い物客が増えた。社長は実力だと言い張る。',demand:1.12,rep:1,sat:0,fire:0},
 {id:'review',title:'レシートの長さが話題に',body:'「買ったのはおにぎり1つ。レシートは卒業証書」。',demand:1,rep:0,sat:0,fire:4}
];
// A turn may contain a weighted operational accident. The bad outcomes are not guaranteed;
// preparation, staffing and customer trust change their odds and/or severity.
const ACCIDENTS=[
 {id:'freezer',icon:'🧊',title:'冷凍庫が突然ストライキ',body:'冷凍庫「これ以上、企業努力に付き合えません」。食材を廃棄した。',cost:90000,demand:.89,sat:-4,rep:-2,fire:2,frust:4,weight:s=>(s.maintenance>0?.18:1.15)*(.62**(s.upgrades?.equipment??0))},
 {id:'power',icon:'⚡',title:'レジ設備がダウン！',body:'社長「レジを減らせとは言った。動かすなとは言ってない！」',cost:52000,demand:.84,sat:-3,rep:-1,fire:0,frust:4,weight:s=>(s.maintenance>0?.30:1)*(.67**(s.upgrades?.equipment??0))},
 {id:'waste',icon:'🥬',title:'野菜の在庫が大爆発',body:'廃棄コストが増加。社長「廃棄したのは希望だけではなかった」。',cost:64000,demand:.97,sat:0,rep:0,fire:0,frust:0,weight:s=>1.0},
 {id:'absent',icon:'😷',title:'レジ担当がまとめて欠勤',body:'「少数精鋭」の少数が今日は全員いません。',cost:28000,demand:.82,sat:-2,rep:-2,fire:2,frust:4,weight:s=>(s.staff<50?1.7:.6)*(.65**(s.upgrades?.people??0))},
 {id:'delivery',icon:'🚚',title:'配送トラックが渋滞',body:'今週の目玉商品は「入荷予定」の札です。',cost:32000,demand:.88,sat:-2,rep:-1,fire:0,frust:2,weight:s=>1},
 {id:'complaint',icon:'📱',title:'昔のレシートが発掘される',body:'「この量で、この値段だった時代があるらしい」。社長が記憶喪失に。',cost:14000,demand:.93,sat:-2,rep:-4,fire:9,frust:7,weight:s=>(s.frust>45||s.notoriety>35?1.7:.35)},
 {id:'rival',icon:'🏷️',title:'競合が突然半額祭り',body:'社長「うちは定価で信念を売っている！」。客は半額の方に走った。',cost:0,demand:.79,sat:0,rep:0,fire:0,frust:0,weight:s=>1},
 {id:'rain',icon:'☔',title:'大雨で客足が減る',body:'客足は雨宿りに行った。家賃は雨でも休まない。',cost:9000,demand:.78,sat:0,rep:0,fire:0,frust:0,weight:s=>1},
 {id:'viral',icon:'📺',title:'店員の神対応がバズる！',body:'「普通に親切」が大ニュース。社長「これも私の指導です」。',cost:0,demand:1.22,sat:4,rep:4,fire:-4,frust:-3,weight:s=>(s.staff>=55?1.1:.35)*(1+.2*(s.upgrades?.people??0))},
 {id:'festival',icon:'🎊',title:'近所でお祭り開催！',body:'買い物客が急増。社長「市場を動かしたのは私だ」。',cost:5000,demand:1.30,sat:1,rep:1,fire:0,frust:0,weight:s=>1},
 {id:'donation',icon:'🥖',title:'余ったパンが人気商品に',body:'地域活動で評判が上がった。社長「これ、広告費にできない？」',cost:13000,demand:1.10,sat:3,rep:3,fire:-2,frust:-1,weight:s=>(s.storeRep>=40?1:.6)}
];
function accidentOdds(s){return cap(.32+(s.staff<50?.09:0)+(s.frust>60?.08:0)-(s.maintenance>0?.12:0)-.055*(s.upgrades?.equipment??0),.10,.55);}
function selectAccident(s){
 if(draw(s)>=accidentOdds(s))return null;
 const pool=ACCIDENTS.map(a=>({a,w:a.weight(s)}));
 let roll=draw(s)*pool.reduce((n,x)=>n+x.w,0);
 for(const x of pool){roll-=x.w;if(roll<=0)return x.a;}
 return pool[pool.length-1].a;
}
// One story problem and four distinct reactions each week; prior decisions change future briefs.
const BRIEFS=[
 {id:'opening',title:'最初の依頼：利益を増やせ',quote:'社長「私が欲しいのは成果だ。責任は君にあげる。」',choices:['quality','shrink','raise','tasting']},
 {id:'checkout',title:'レジに行列！どうする？',quote:'店長「人手が足りません！」社長「人数は足りてるはずだ、数字では！」',choices:['staff','loyalty','sale','points']},
 {id:'bento',title:'名物弁当が売れ残る',quote:'社長「おいしくするか、軽くするか。重いのは私の決断だ。」',choices:['cheap','quality','shrink','pop']},
 {id:'survey',title:'常連が黙って帰り始めた',quote:'店長「苦情が減りました」消費者「来店自体を減らしただけです」',choices:['loyalty','tasting','points','raise']},
 {id:'package',title:'昔のパッケージが話題に',quote:'社長「昔のことを覚えている客は、記憶力が良すぎる！」',choices:['recall','audit','stamp','quality']},
 {id:'rival',title:'向かいに競合店が開店！',quote:'社長「相手が安い？ こちらは態度で勝て！」',choices:['sale','local','stamp','raise']},
 {id:'staff',title:'スタッフの疲労が限界',quote:'店長「休みがほしいです」社長「私もだ。特にこの会議。」',choices:['restorestaff','staff','loyalty','explain']},
 {id:'costs',title:'仕入れ価格がじわじわ上昇',quote:'社長「値上げ以外で何とか…いや、値上げでもいい！」',choices:['raise','cheap','quality','audit']},
 {id:'investigate',title:'週刊誌から取材の依頼',quote:'記者「お客様のために、って誰のこと？」 社長「質問が長い！」',choices:['audit','blame','apology','loyalty']},
 {id:'quarter',title:'決算直前、社長が焦る！',quote:'社長「ここから一発逆転だ。あとで説明できる案がいい。」',choices:['stamp','pop','local','points']},
 {id:'tv',title:'テレビが店を取材したいらしい',quote:'社長「カメラには良い面だけ向けたい。私の横顔とか。」',choices:['tasting','audit','pop','blame']},
 {id:'final',title:'最後の経営会議！',quote:'社長「最終週だ！ 私の評価も君のせいだ！」',choices:['quality','raise','loyalty','stamp']}
];
function weeklyBrief(s){
 if(s.finished)return {id:'done',title:'契約期間が終了しました',quote:'社長「審査結果を聞こう。座っていいか？」',choices:[]};
 const prev=s.lastResult;
 if(prev&&(prev.fireHit||prev.memoryEvent||s.fire>=57)){
  const cause=prev.memoryEvent?'過去の施策が発掘された！':prev.fireHit?'SNSで炎上！':'苦情が止まらない！';
  return {id:'crisis',title:cause+' 緊急会議',quote:'社長「君の提案だったよね？ さあ、どう収拾する？」',choices:['apology','recall','blame','explain']};
 }
 if(s.cash<135000)return {id:'cash',title:'🚨 今週の支払いが迫る！',quote:'経理「現金が足りません。社長の声量では振り込めません！」',choices:['loan','raise','staff','sale']};
 return BRIEFS[Math.min(s.week-1,BRIEFS.length-1)];
}
function weeklyOffers(s){
 if(s.finished)return [];
 const brief=weeklyBrief(s),picks=[];
 for(const id of brief.choices){if(enabled(s,id)&&!picks.includes(id))picks.push(id);}
 if(s.cash<145000&&enabled(s,'loan')&&!picks.includes('loan')){picks[3]='loan';}
 // Physical constraints may disable a preselected action; always offer four playable decisions.
 const seedOrder=ACTIONS.map(a=>a.id).sort((a,b)=>{
  const hash=str=>{let v=2166136261;for(const c of str+':'+s.week+':'+s.rng){v=Math.imul(v^c.charCodeAt(0),16777619)>>>0;}return v;};
  return hash(a)-hash(b);
 });
 for(const id of seedOrder){if(picks.length>=4)break;if(enabled(s,id)&&!picks.includes(id))picks.push(id);}
 return picks.slice(0,4).map(id=>ACTIONS_BY_ID[id]);
}
function goalStatus(s){
 const profit=s.history.reduce((n,h)=>n+h.profit,0),target=s.contractGoal??1800000;
 const reputation=s.storeRep;
 const passed=profit>=target&&reputation>=CONTRACT.reputation;
 return {profit,reputation,passed,profitGap:Math.max(0,target-profit),repGap:Math.max(0,CONTRACT.reputation-reputation)};
}
function ending(s){
 const g=goalStatus(s),fires=s.history.filter(h=>h.fireHit).length;
 if(!s.finished)return null;
 if(s.bankrupt)return {icon:'💸',name:'資金ショート！契約強制終了',line:'家賃も仕入れも待ってくれない。社長「店の資金繰りは君の担当だったよね？」',passed:false};
 if(g.passed&&s.notoriety>=35)return {icon:'😈',name:'悪魔の敏腕コンサル',line:'利益は達成。社長は大喜び。過去の発言は検索しないでほしいらしい。',passed:true};
 if(g.passed&&s.storeRep>=75)return {icon:'🏆',name:'優良店の改革者',line:'利益も信頼も守った。社長「こんなまともな結末、想定外だ！」',passed:true};
 if(g.passed)return {icon:'💼',name:'契約更新！',line:'目標達成。社長「次もよろしく。もちろん報酬は相談で！」',passed:true};
 if(s.storeRep<25||fires>=3)return {icon:'📦',name:'責任者、荷物をまとめる',line:'社長「すべて君の提案だった。私は最後まで応援していたぞ！」',passed:false};
 if(g.profitGap===0)return {icon:'🔥',name:'黒字の代償',line:'利益目標は達成。しかし店の評判は契約条件に届かなかった。',passed:false};
 return {icon:'📉',name:'契約満了、更新なし',line:'社長「努力は評価する。目標は未達だ。私の給料は守ってくれ。」',passed:false};
}
function initial(seed){
 let n=Number(seed);if(!Number.isFinite(n))n=Date.now();n=n>>>0;if(n===0)n=246813579;
 return {version:VERSION,rng:n,week:1,finished:false,selected:'shrink',skill:50,notoriety:5,pay:0,price:200,size:100,quality:60,staff:60,storeRep:65,fire:4,sat:66,frust:23,sales:480000,profit:61000,cash:250000,contractGoal:CONTRACT.profit,debt:0,maintenance:0,upgrades:blankUpgrades(),lowCashWeeks:0,bankrupt:false,boycottWeeks:0,memory:[],history:[],lastResult:null};
}
function draw(s){let x=s.rng>>>0;x^=(x<<13);x^=(x>>>17);x^=(x<<5);s.rng=x>>>0;return (s.rng>>>0)/4294967296;}
function enabled(s,id){switch(id){case'raise':return s.price<260;case'lower':return s.price>150;case'shrink':return s.size>60;case'cheap':return s.quality>30;case'quality':return s.quality<90;case'staff':return s.staff>30;case'restorestaff':return s.staff<60;case'loan':return s.cash<180000&&s.debt<250000;default:return !!ACTIONS_BY_ID[id];}}
function risk(s){return cap(.012+s.fire*.0014+Math.max(0,s.frust-23)*.0013+s.notoriety*.00045+Math.max(0,65-s.storeRep)*.0007,.01,.48);}
function unitCost(s){return int(20+s.size*.9+(s.quality-60)*.65);}
function adjust(s,changes){for(const [k,v] of Object.entries(changes)){s[k]=cap(int(s[k]+v),0,100);}}
function maybeRemember(s,kind,p){if(draw(s)<p){s.memory.push({kind,due:s.week+2+Math.floor(draw(s)*4)});}}
function applyAction(s,id){let extra=0,discount=0,demandFactor=1,financing=0;
 switch(id){
 case'raise':demandFactor=1.09;s.price+=10;adjust(s,{sat:-3,frust:7,storeRep:-2,fire:4,notoriety:2});break;
 case'lower':s.price-=10;adjust(s,{sat:4,frust:-5,storeRep:2,fire:-2,notoriety:-1});break;
 case'shrink':demandFactor=1.13;s.size-=10;adjust(s,{sat:-5,frust:9,storeRep:-3,fire:5,notoriety:3});maybeRemember(s,'shrink',.58);break;
 case'cheap':demandFactor=1.11;s.quality-=10;adjust(s,{sat:-5,frust:7,storeRep:-2,fire:4,notoriety:2});maybeRemember(s,'cheap',.48);break;
 case'quality':s.quality+=10;adjust(s,{sat:7,frust:-5,storeRep:3,fire:-3,notoriety:-2});break;
 case'staff':demandFactor=1.07;s.staff-=10;adjust(s,{sat:-4,frust:6,storeRep:-2,fire:4,notoriety:1});maybeRemember(s,'staff',.40);break;
 case'explain':extra=10000;adjust(s,{sat:2,frust:-7,storeRep:4,fire:-6,notoriety:-3});break;
 case'sale':discount=15;extra=12000;demandFactor=1.15;adjust(s,{sat:3,frust:-4,storeRep:1,fire:-1});break;
 case'points':extra=-16000;adjust(s,{sat:-3,frust:6,storeRep:-2,fire:6,notoriety:3});maybeRemember(s,'points',.42);break;
 case'pop':extra=23000;demandFactor=1.22;adjust(s,{sat:-2,frust:5,storeRep:-1,fire:5,notoriety:2});maybeRemember(s,'pop',.35);break;
 case'tasting':extra=17000;demandFactor=1.1;adjust(s,{sat:4,frust:-3,storeRep:2,fire:-1,notoriety:-1});break;
 case'local':extra=11000;demandFactor=1.07;adjust(s,{sat:5,frust:-4,storeRep:3,fire:-2,notoriety:-1});break;
 case'restorestaff':s.staff+=10;extra=8000;adjust(s,{sat:5,frust:-5,storeRep:3,fire:-3,notoriety:-2});break;
 case'apology':extra=18000;adjust(s,{sat:5,frust:-11,storeRep:7,fire:-24,notoriety:-4});break;
 case'recall':extra=43000;s.size=Math.min(100,s.size+10);s.quality=Math.min(90,s.quality+10);adjust(s,{sat:11,frust:-14,storeRep:9,fire:-23,notoriety:-5});break;
 case'blame':extra=-24000;demandFactor=1.10;adjust(s,{sat:-9,frust:15,storeRep:-10,fire:14,notoriety:10});maybeRemember(s,'blame',.65);break;
 case'loyalty':extra=10000;demandFactor=1.07;adjust(s,{sat:6,frust:-9,storeRep:5,fire:-6,notoriety:-2});break;
 case'stamp':extra=9500;demandFactor=1.30;adjust(s,{sat:1,frust:4,storeRep:-1,fire:3,notoriety:2});maybeRemember(s,'stamp',.45);break;
 case'audit':extra=11000;adjust(s,{sat:4,frust:-8,storeRep:7,fire:-8,notoriety:-3});break;
 case'maintenance':extra=26000;s.maintenance=3;adjust(s,{storeRep:1});break;
 case'loan':financing=200000;s.debt+=200000;adjust(s,{skill:-2});break;
 default:throw new Error('Unknown action');
 }
 return {extra,discount,demandFactor,financing};
}
function play(input,id,opts={}){if(input.finished||input.week>MAX_WEEKS)throw Error('ゲームは終了しています');if(!ACTIONS_BY_ID[id]||!enabled(input,id))throw Error('この施策は選べません');
 const plan=opts?.project??null;
 if(plan!==null){const cost=projectCost(input,plan);if(!PROJECTS_BY_ID[plan]||cost===null)throw Error('この設備投資は選べません');if(input.cash<cost)throw Error('投資資金が足りません');}
 const s=JSON.parse(JSON.stringify(input)),theWeek=s.week,brief=weeklyBrief(input);
 if(!s.upgrades)s.upgrades=blankUpgrades();
 const investment=plan?projectCost(s,plan):0;
 if(plan)s.upgrades[plan]++;
 const previous={sales:s.sales,rep:s.storeRep,sat:s.sat,frust:s.frust,fire:s.fire,skill:s.skill,cash:s.cash};
 const action=applyAction(s,id);
 // Benefits persist across weeks. Investments consume cash and become visible in cash flow.
 if(s.upgrades.people)adjust(s,{sat:s.upgrades.people,frust:-s.upgrades.people});
 if(s.upgrades.fans)adjust(s,{storeRep:s.upgrades.fans});
 // Situational advantages add depth without adding extra inputs to the UI.
 let storyFactor=1,storyCost=0,storyNote='';
 if(brief.id==='rival'&&['sale','local','stamp'].includes(id)){storyFactor=1.07;storyNote='競合への対抗策が今週はよく効いた。';}
 if(brief.id==='bento'&&['quality','tasting','cheap'].includes(id)){storyFactor=1.05;storyNote='弁当の話題性が客足に反映された。';}
 if(brief.id==='staff'&&id==='staff'){storyFactor=.89;storyNote='従業員の負担が限界。店が少し回らない。';}
 if(brief.id==='investigate'&&id==='audit'){storyFactor=1.05;storyNote='数字を出した姿勢が取材で評価された。';}
 if(brief.id==='crisis'&&id==='blame'){storyFactor=.88;storyNote='弁解が火に油。客足が遠のいた。';}
 if(brief.id==='crisis'&&['apology','recall'].includes(id)){storyFactor=1.06;storyNote='真面目な対応で客足が少し戻った。';}
 // No duplicated actions, and no hard-coded scenario win: later outcomes still depend on risk.
 action.extra+=storyCost;action.demandFactor*=storyFactor;
 let title=NEWS[id][0],body=NEWS[id][1],eventType='normal',demandModifier=1,fireHit=false,boycottHit=false,memoryEvent=false;
 const due=s.memory.filter(x=>x.due<=theWeek);
 s.memory=s.memory.filter(x=>x.due>theWeek).concat(due.slice(1).map(m=>({kind:m.kind,due:theWeek+1}))); 
 if(due.length){const m=due[0];memoryEvent=true;title=MEMORY_NEWS[m.kind][0];body=MEMORY_NEWS[m.kind][1];eventType='memory';adjust(s,{frust:5,fire:8,storeRep:-3});}
 const chance=risk(s),roll=draw(s);
 if(roll<chance){
  fireHit=true;eventType='fire';title='🔥 SNSで大炎上！';body=memoryEvent?'過去の施策が再燃。「これは偶然ではなく経営方針」とまで話題に。':'「お客様のために」がトレンド入り。引用符だけが好意的。';
  adjust(s,{fire:27,frust:10,sat:-5,storeRep:-9,notoriety:11,skill:-6});
  demandModifier*=.82;
  const boycottChance=cap(.25+s.frust*.0015,.25,.40);
  if(draw(s)<boycottChance){boycottHit=true;s.boycottWeeks=Math.max(s.boycottWeeks,2);body+=' 不買運動まで始まった！';adjust(s,{storeRep:-4,frust:5,skill:-3});}
 }else if(!memoryEvent && draw(s)<.17){
  const item=INCIDENTAL[Math.floor(draw(s)*INCIDENTAL.length)];title=item.title;body=item.body;eventType=item.id;demandModifier*=item.demand;adjust(s,{storeRep:item.rep,sat:item.sat,fire:item.fire});
 }
 // Extra incidents may happen independently of the management plan. A major scandal keeps the headline.
 const accident=selectAccident(s);
 let incidentCost=0;
 if(accident){
  incidentCost=Math.round(accident.cost*(1-.22*(s.upgrades.equipment??0)));demandModifier*=accident.demand;
  adjust(s,{sat:accident.sat,storeRep:accident.rep,fire:accident.fire,frust:accident.frust});
  if(!fireHit&&!memoryEvent){title=accident.title;body=accident.body;eventType='accident';}
  else body+=' '+accident.body;
 }
 if(storyNote)body+=' '+storyNote;
 // Existing and newly started boycotts affect the current week's purchases.
 const boycottActive=s.boycottWeeks>0;
 if(boycottActive)demandModifier*=.76;
 if(s.boycottWeeks>0)s.boycottWeeks--;
 if(!fireHit){adjust(s,{fire:-4,frust:boycottActive?-1:-2});if(s.sat>65&&s.frust<45)adjust(s,{storeRep:1});}
 let demand=2400 * cap(1-(s.price-200)*.005,.35,1.40)
  *cap(1+(s.size-100)*.0035,.70,1.20)
  *cap(1+(s.quality-60)*.004,.70,1.25)
  *cap(1+(s.staff-60)*.003,.78,1.15)
  *cap(1+(s.storeRep-65)*.005,.72,1.19)
  *cap(1+(s.sat-66)*.004,.75,1.15)
  *cap(1-(s.frust-23)*.003,.70,1.12);
 demand*=action.demandFactor*demandModifier*(1+.045*s.upgrades.people+.055*s.upgrades.fans)*(.97+draw(s)*.06);
 const units=cap(int(demand),500,4200),effectivePrice=s.price-action.discount;
 const sales=units*effectivePrice,cost=unitCost(s);
 const rent=75000,utilities=30000,payroll=50000-(60-s.staff)*800;
 const fixed=rent+utilities+payroll;
 const interest=s.debt>0?3000:0,principal=Math.min(s.debt,10000);
 const profit=units*(effectivePrice-cost)-fixed-action.extra-incidentCost-interest;
 const standardProfit=126000;
 let fee=cap(int(8000+Math.max(0,profit-standardProfit)*.07),8000,30000);
 if(fireHit||boycottActive)fee=int(fee*.65);
 fee=Math.max(0,fee);
 if(!fireHit){adjust(s,{skill:profit>=standardProfit?2:profit>=0?1:-2});if(s.sat>=80)adjust(s,{skill:1});}
 s.sales=sales;s.profit=profit;
 // Weekly operating bills are deducted even when no initiative is taken. Loan principal is a cash-flow item, not P&L.
 s.cash+=profit+action.financing-principal-investment;s.debt-=principal;s.pay+=fee;
 s.lowCashWeeks=s.cash<0?s.lowCashWeeks+1:0;
 if(s.cash<-120000||s.lowCashWeeks>=2){s.bankrupt=true;}
 if(s.maintenance>0)s.maintenance--;
 const report={week:theWeek,scenarioId:brief.id,scenarioTitle:brief.title,actionId:id,actionName:ACTIONS_BY_ID[id].name,title,body,ceo:fireHit?'社長「君の提案だったよね？ わたしは聞いてないよね？」':QUOTES[id],eventType,sales,profit,fee,units,price:effectivePrice,cost,extra:action.extra,rent,utilities,payroll,interest,principal,financing:action.financing,investment,projectId:plan,projectLabel:plan?PROJECTS_BY_ID[plan].name:"なし",incidentCost,accidentResponse:null,accidentId:accident?.id||null,accidentTitle:accident?.title||'',accidentIcon:accident?.icon||'',cashBefore:previous.cash,cashAfter:s.cash,deltaCash:s.cash-previous.cash,debtAfter:s.debt,fireHit,boycottHit,boycottActive,memoryEvent,chance,roll,deltaSales:sales-previous.sales,deltaRep:s.storeRep-previous.rep,deltaSat:s.sat-previous.sat,deltaFrust:s.frust-previous.frust,deltaFire:s.fire-previous.fire,deltaSkill:s.skill-previous.skill};
 s.history.push(report);s.lastResult=report;s.week++;
 if(s.week>MAX_WEEKS||s.bankrupt)s.finished=true;
 if(!weeklyOffers(s).some(a=>a.id===s.selected))s.selected=s.finished?s.selected:weeklyOffers(s)[0].id;
 return s;
}
function handleAccident(input,decision){
 if(!['repair','ignore'].includes(decision))throw Error('不明な事後対応です');
 if(!input.lastResult?.accidentId||input.lastResult.incidentCost<=0||input.lastResult.accidentResponse)throw Error('対応可能な事故はありません');
 const s=JSON.parse(JSON.stringify(input)),h=s.history[s.history.length-1];
 if(!h||h.week!==s.week-1||h.accidentResponse)throw Error('事故対応の記録が一致しません');
 const spending=decision==='repair'?Math.min(28000,Math.round(h.incidentCost*.48)+4000):0;
 if(decision==='repair'&&s.cash<spending)throw Error('補償する現金が足りません');
 if(decision==='repair'){
  s.cash-=spending;adjust(s,{storeRep:3,frust:-5,fire:-3,sat:2});
 }else{adjust(s,{storeRep:-2,frust:4,fire:3});}
 h.accidentResponse=decision;h.remedyCost=spending;h.cashAfter=s.cash;h.deltaCash=s.cash-h.cashBefore;
 h.deltaRep+=decision==='repair'?3:-2;h.deltaSat+=decision==='repair'?2:0;
 h.deltaFire+=decision==='repair'?-3:3;h.deltaFrust+=decision==='repair'?-5:4;
 h.responseText=decision==='repair'?'追加補償で信用を守った':'費用は浮いたが、苦情が広がった';
 s.lastResult=h;
 return s;
}
function validateSaved(x){if(!x||typeof x!=='object'||Array.isArray(x)||x.version!==VERSION)throw Error('対応していないセーブデータです');
 const numeric={rng:[1,4294967295],week:[1,13],skill:[0,100],notoriety:[0,100],pay:[0,100000000],price:[150,260],size:[60,100],quality:[30,90],staff:[30,60],storeRep:[0,100],fire:[0,100],sat:[0,100],frust:[0,100],sales:[0,10000000],profit:[-2000000,2000000],cash:[-10000000,100000000],boycottWeeks:[0,4]};
 for(const [k,[min,max]]of Object.entries(numeric)){if(typeof x[k]!=='number'||!Number.isSafeInteger(x[k])||x[k]<min||x[k]>max)throw Error('セーブデータに不正な数字があります: '+k);}
 if(typeof x.finished!=='boolean'||typeof x.selected!=='string'||!ACTIONS_BY_ID[x.selected])throw Error('セーブデータの状態が不正です');
 if(!Array.isArray(x.memory)||x.memory.length>12||x.memory.some(m=>!m||!MEMORY_NEWS[m.kind]||!Number.isInteger(m.due)||m.due<2||m.due>19))throw Error('イベント履歴が不正です');
 if(!Array.isArray(x.history)||x.history.length>12||x.history.some(h=>!h||!Number.isInteger(h.week)||h.week<1||h.week>12||!ACTIONS_BY_ID[h.actionId]||typeof h.title!=='string'||h.title.length>240||typeof h.body!=='string'||h.body.length>400||!Number.isFinite(h.sales)||!Number.isFinite(h.profit)||!Number.isFinite(h.fee)))throw Error('経営記録が不正です');
 if(x.history.length!==x.week-1||x.finished!==(x.week===13||x.bankrupt===true))throw Error('週数と記録が一致しません');
 const clone=JSON.parse(JSON.stringify(x));
 // Existing v0.1-v0.5 saves did not contain these optional financial state fields.
 for(const [name,value]of Object.entries({contractGoal:1800000,debt:0,maintenance:0,lowCashWeeks:0,bankrupt:false}))if(clone[name]===undefined)clone[name]=value;
 if(clone.upgrades===undefined)clone.upgrades=blankUpgrades();
 if(!clone.upgrades||typeof clone.upgrades!=='object'||Array.isArray(clone.upgrades)||Object.keys(clone.upgrades).some(k=>!PROJECTS_BY_ID[k])||PROJECTS.some(p=>!Number.isInteger(clone.upgrades[p.id])||clone.upgrades[p.id]<0||clone.upgrades[p.id]>2))throw Error('設備投資データが不正です');
 clone.upgrades={equipment:clone.upgrades.equipment,people:clone.upgrades.people,fans:clone.upgrades.fans};
 if(!Number.isSafeInteger(clone.contractGoal)||clone.contractGoal<100000||clone.contractGoal>3000000)throw Error('契約目標が不正です');
 if(!Number.isSafeInteger(clone.debt)||clone.debt<0||clone.debt>500000||!Number.isSafeInteger(clone.maintenance)||clone.maintenance<0||clone.maintenance>3||!Number.isSafeInteger(clone.lowCashWeeks)||clone.lowCashWeeks<0||clone.lowCashWeeks>12||typeof clone.bankrupt!=='boolean')throw Error('資金管理データが不正です');
 clone.memory=clone.memory.map(m=>({kind:m.kind,due:m.due}));
 clone.history=clone.history.map(h=>({...h,title:String(h.title).slice(0,240),body:String(h.body).slice(0,400),ceo:typeof h.ceo==='string'?h.ceo.slice(0,240):'',actionName:ACTIONS_BY_ID[h.actionId].name}));
 clone.lastResult=clone.history.length?clone.history[clone.history.length-1]:null;
 return clone;
}
function previewRisk(s,id){if(!ACTIONS_BY_ID[id]||!enabled(s,id))return risk(s);const clone=JSON.parse(JSON.stringify(s));applyAction(clone,id);return risk(clone);}
const engine={VERSION,MAX_WEEKS,CONTRACT,PROJECTS,availableProjects,projectCost,ACTIONS,ACCIDENTS,weeklyBrief,weeklyOffers,goalStatus,ending,initial,play,handleAccident,risk,previewRisk,unitCost,enabled,validateSaved};
root.GameEngine=engine;
if(typeof module==='object'&&module.exports)module.exports=engine;
})(typeof globalThis!=='undefined'?globalThis:this);