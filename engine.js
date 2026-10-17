/* お客様のために。v0.3 - game engine with weekly pitch lineup. */
(function(root){
'use strict';
const VERSION = 1, MAX_WEEKS = 12;
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
 {id:'restorestaff',icon:'🧑‍💼',name:'人間のレジを復活',effect:'満足↑ / 経費↑',detail:'減らしたスタッフを戻す。行列と不満を減らそう。',type:'kind'}
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
 restorestaff:'社長「レジ待ちゼロ！ 人件費は見ないことにする。」'
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
 restorestaff:['レジの行列が短くなる','お客様「ちゃんと人がいる！」。社長「今まで何だったのか」。']
};
const MEMORY_NEWS={
 shrink:['過去の容量変更が再注目','昔のパッケージ写真が拡散。「思い出だけは大容量」。'],
 cheap:['旧商品の味を懐かしむ投稿が話題','「昔はもっとおいしかった」と比較レビューが増加。'],
 staff:['レジ待ち体験談が拡散','「長すぎて季節が変わった」。客が行列の写真を投稿。'],
 points:['ポイント改定が掘り返される','昔の明細が発掘。「還元されていたのは期待だけ」。'],
 pop:['広告と実物の温度差が話題','「広告が一番おいしそう」。消費者が冷静な比較投稿。']
};
const INCIDENTAL=[
 {id:'good',title:'常連客の口コミが好評',body:'「なんだかんだ便利」。そんな声が少し増えた。',demand:1.09,rep:2,sat:2,fire:-2},
 {id:'rival',title:'ライバル店が週末セール',body:'近くの店が特売を開始。お客様の足が少し遠のいた。',demand:.90,rep:0,sat:0,fire:0},
 {id:'trend',title:'お弁当需要が急増',body:'街のイベントで買い物客が増えた。社長は実力だと言い張る。',demand:1.12,rep:1,sat:0,fire:0},
 {id:'review',title:'レシートの長さが話題に',body:'「買ったのはおにぎり1つ。レシートは卒業証書」。',demand:1,rep:0,sat:0,fire:4}
];
function weeklyOffers(s){
 const available=ACTIONS.filter(a=>enabled(s,a.id));
 const hard=available.filter(a=>a.type==='hard');
 const kind=available.filter(a=>a.type==='kind');
 // Some weeks favor aggressive pitches, while others favor normal improvements.
 const aggressive=s.week%3===1;
 const slots=aggressive?{hard:3,kind:1}:s.week%3===2?{hard:1,kind:3}:{hard:2,kind:2};
 const chosen=[];
 const rank=(a)=>{let v=2166136261;for(const c of a.id+':'+s.week+':'+s.rng){v=Math.imul(v^c.charCodeAt(0),16777619)>>>0;}return v;};
 const choose=(arr,count)=>{arr.sort((a,b)=>rank(a)-rank(b));for(const a of arr){if(chosen.length>=4||count<=0)break;if(!chosen.some(b=>b.id===a.id)){chosen.push(a);count--;}}};
 choose(hard,slots.hard);choose(kind,slots.kind);choose(available,4-chosen.length);
 return chosen.sort((a,b)=>rank(a)-rank(b));
}
function initial(seed){
 let n=Number(seed);if(!Number.isFinite(n))n=Date.now();n=n>>>0;if(n===0)n=246813579;
 return {version:VERSION,rng:n,week:1,finished:false,selected:'shrink',skill:50,notoriety:5,pay:0,price:200,size:100,quality:60,staff:60,storeRep:65,fire:4,sat:66,frust:23,sales:480000,profit:126000,cash:250000,boycottWeeks:0,memory:[],history:[],lastResult:null};
}
function draw(s){let x=s.rng>>>0;x^=(x<<13);x^=(x>>>17);x^=(x<<5);s.rng=x>>>0;return (s.rng>>>0)/4294967296;}
function enabled(s,id){switch(id){case'raise':return s.price<260;case'lower':return s.price>150;case'shrink':return s.size>60;case'cheap':return s.quality>30;case'quality':return s.quality<90;case'staff':return s.staff>30;case'restorestaff':return s.staff<60;default:return !!ACTIONS_BY_ID[id];}}
function risk(s){return cap(.012+s.fire*.0014+Math.max(0,s.frust-23)*.0013+s.notoriety*.00045+Math.max(0,65-s.storeRep)*.0007,.01,.48);}
function unitCost(s){return int(20+s.size*.9+(s.quality-60)*.65);}
function adjust(s,changes){for(const [k,v] of Object.entries(changes)){s[k]=cap(int(s[k]+v),0,100);}}
function maybeRemember(s,kind,p){if(draw(s)<p){s.memory.push({kind,due:s.week+2+Math.floor(draw(s)*4)});}}
function applyAction(s,id){let extra=0,discount=0,demandFactor=1;
 switch(id){
 case'raise':s.price+=10;adjust(s,{sat:-3,frust:7,storeRep:-2,fire:4,notoriety:2});break;
 case'lower':s.price-=10;adjust(s,{sat:4,frust:-5,storeRep:2,fire:-2,notoriety:-1});break;
 case'shrink':s.size-=10;adjust(s,{sat:-5,frust:9,storeRep:-3,fire:5,notoriety:3});maybeRemember(s,'shrink',.58);break;
 case'cheap':s.quality-=10;adjust(s,{sat:-5,frust:7,storeRep:-2,fire:4,notoriety:2});maybeRemember(s,'cheap',.48);break;
 case'quality':s.quality+=10;adjust(s,{sat:7,frust:-5,storeRep:3,fire:-3,notoriety:-2});break;
 case'staff':s.staff-=10;adjust(s,{sat:-4,frust:6,storeRep:-2,fire:4,notoriety:1});maybeRemember(s,'staff',.40);break;
 case'explain':extra=10000;adjust(s,{sat:2,frust:-7,storeRep:4,fire:-6,notoriety:-3});break;
 case'sale':discount=15;extra=12000;demandFactor=1.15;adjust(s,{sat:3,frust:-4,storeRep:1,fire:-1});break;
 case'points':extra=-8000;adjust(s,{sat:-3,frust:6,storeRep:-2,fire:6,notoriety:3});maybeRemember(s,'points',.42);break;
 case'pop':extra=23000;demandFactor=1.13;adjust(s,{sat:-2,frust:5,storeRep:-1,fire:5,notoriety:2});maybeRemember(s,'pop',.35);break;
 case'tasting':extra=17000;demandFactor=1.1;adjust(s,{sat:4,frust:-3,storeRep:2,fire:-1,notoriety:-1});break;
 case'local':extra=11000;demandFactor=1.07;adjust(s,{sat:5,frust:-4,storeRep:3,fire:-2,notoriety:-1});break;
 case'restorestaff':s.staff+=10;extra=8000;adjust(s,{sat:5,frust:-5,storeRep:3,fire:-3,notoriety:-2});break;
 default:throw new Error('Unknown action');
 }
 return {extra,discount,demandFactor};
}
function play(input,id){if(input.finished||input.week>MAX_WEEKS)throw Error('ゲームは終了しています');if(!ACTIONS_BY_ID[id]||!enabled(input,id))throw Error('この施策は選べません');
 const s=JSON.parse(JSON.stringify(input)),theWeek=s.week;
 const previous={sales:s.sales,rep:s.storeRep,sat:s.sat,frust:s.frust,fire:s.fire,skill:s.skill};
 const action=applyAction(s,id);
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
 demand*=action.demandFactor*demandModifier*(.97+draw(s)*.06);
 const units=cap(int(demand),500,4200),effectivePrice=s.price-action.discount;
 const sales=units*effectivePrice,cost=unitCost(s),fixed=90000-(60-s.staff)*800;
 const profit=units*(effectivePrice-cost)-fixed-action.extra;
 const standardProfit=126000;
 let fee=cap(int(8000+Math.max(0,profit-standardProfit)*.07),8000,30000);
 if(fireHit||boycottActive)fee=int(fee*.65);
 fee=Math.max(0,fee);
 if(!fireHit){adjust(s,{skill:profit>=standardProfit?2:profit>=0?1:-2});if(s.sat>=80)adjust(s,{skill:1});}
 s.sales=sales;s.profit=profit;s.cash+=profit;s.pay+=fee;
 const report={week:theWeek,actionId:id,actionName:ACTIONS_BY_ID[id].name,title,body,ceo:fireHit?'社長「君の提案だったよね？ わたしは聞いてないよね？」':QUOTES[id],eventType,sales,profit,fee,units,price:effectivePrice,cost,fireHit,boycottHit,boycottActive,memoryEvent,chance,roll,deltaSales:sales-previous.sales,deltaRep:s.storeRep-previous.rep,deltaSat:s.sat-previous.sat,deltaFrust:s.frust-previous.frust,deltaFire:s.fire-previous.fire,deltaSkill:s.skill-previous.skill};
 s.history.push(report);s.lastResult=report;s.week++;
 if(s.week>MAX_WEEKS)s.finished=true;
 if(!enabled(s,s.selected))s.selected=ACTIONS.find(a=>enabled(s,a.id)).id;
 return s;
}
function validateSaved(x){if(!x||typeof x!=='object'||Array.isArray(x)||x.version!==VERSION)throw Error('対応していないセーブデータです');
 const numeric={rng:[1,4294967295],week:[1,13],skill:[0,100],notoriety:[0,100],pay:[0,100000000],price:[150,260],size:[60,100],quality:[30,90],staff:[30,60],storeRep:[0,100],fire:[0,100],sat:[0,100],frust:[0,100],sales:[0,10000000],profit:[-2000000,2000000],cash:[-10000000,100000000],boycottWeeks:[0,4]};
 for(const [k,[min,max]]of Object.entries(numeric)){if(typeof x[k]!=='number'||!Number.isSafeInteger(x[k])||x[k]<min||x[k]>max)throw Error('セーブデータに不正な数字があります: '+k);}
 if(typeof x.finished!=='boolean'||typeof x.selected!=='string'||!ACTIONS_BY_ID[x.selected])throw Error('セーブデータの状態が不正です');
 if(!Array.isArray(x.memory)||x.memory.length>12||x.memory.some(m=>!m||!MEMORY_NEWS[m.kind]||!Number.isInteger(m.due)||m.due<2||m.due>19))throw Error('イベント履歴が不正です');
 if(!Array.isArray(x.history)||x.history.length>12||x.history.some(h=>!h||!Number.isInteger(h.week)||h.week<1||h.week>12||!ACTIONS_BY_ID[h.actionId]||typeof h.title!=='string'||h.title.length>240||typeof h.body!=='string'||h.body.length>400||!Number.isFinite(h.sales)||!Number.isFinite(h.profit)||!Number.isFinite(h.fee)))throw Error('経営記録が不正です');
 if(x.history.length!==x.week-1||x.finished!==(x.week===13))throw Error('週数と記録が一致しません');
 const clone=JSON.parse(JSON.stringify(x));
 clone.memory=clone.memory.map(m=>({kind:m.kind,due:m.due}));
 clone.history=clone.history.map(h=>({...h,title:String(h.title).slice(0,240),body:String(h.body).slice(0,400),ceo:typeof h.ceo==='string'?h.ceo.slice(0,240):'',actionName:ACTIONS_BY_ID[h.actionId].name}));
 clone.lastResult=clone.history.length?clone.history[clone.history.length-1]:null;
 return clone;
}
function previewRisk(s,id){if(!ACTIONS_BY_ID[id]||!enabled(s,id))return risk(s);const clone=JSON.parse(JSON.stringify(s));applyAction(clone,id);return risk(clone);}
const engine={VERSION,MAX_WEEKS,ACTIONS,weeklyOffers,initial,play,risk,previewRisk,unitCost,enabled,validateSaved};
root.GameEngine=engine;
if(typeof module==='object'&&module.exports)module.exports=engine;
})(typeof globalThis!=='undefined'?globalThis:this);