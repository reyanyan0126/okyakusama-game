'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js'),S=G.STORIES,F=require('../finance.js'),C=require('../consequences-v200.js');
assert.deepEqual(S.CHAPTER_MOMENTS.map(x=>x.week),[15,22,28]);
const routes={audit:'people',bills:'people',loyalty:'people',local:'people',explain:'people',stamp:'sales',blame:'boss'};
for(const beat of S.CHAPTER_MOMENTS){
 const s=G.initial(314);s.week=beat.week;s.cash=650000;s.fire=1;s.frust=15;s.lastResult=null;s.storyArcs=[];
 const announced=G.weeklyBrief(s);
 assert.equal(announced.chapter,beat.id,'chapter at week '+beat.week);
 assert.equal(announced.id,'chapter:'+beat.id);
 assert.deepEqual(G.weeklyOffers(s).map(a=>a.id),beat.choices,'all four options must survive root-repair injection');
 const before=JSON.stringify(s);
 for(const action of beat.choices){
  const next=G.play(s,action),d=next.lastResult.chapterDecision;
  assert(d,'decision recorded for '+beat.id+'/'+action);
  assert.equal(d.route,routes[action]);
  assert.equal(d.id,beat.id);
  assert.equal(d.actionId,action);
  assert.equal(d.tier,next.lastResult.performanceTier);
  assert.equal(next.cast.manager-s.cast.manager,d.delta.manager);
  assert.equal(next.cast.customers-s.cast.customers,d.delta.customers);
  assert.equal(next.cast.boss-s.cast.boss,d.delta.boss);
  assert.equal(F.createLedger(next.lastResult,'store').residual,0);
  assert.equal(F.createLedger(next.lastResult,'personal').residual,0);
  assert.deepEqual(G.play(s,action),next,'same seed replays identically');
 }
 assert.equal(JSON.stringify(s),before,'chapter preview and play must not mutate input');
}
for(const week of [1,14,16,21,23,29,30]){
 const s=G.initial(204);s.week=week;s.cash=650000;s.fire=1;s.frust=15;s.lastResult=null;s.storyArcs=[];
 assert(!G.weeklyBrief(s).chapter,'not a chapter week '+week);
}
{
 const legacy=G.initial(112);legacy.campaignWeeks=12;legacy.week=12;
 assert.equal(S.chapterBrief(legacy),null,'old 12-week saves have no chapter hearings');
 const next=G.play(legacy,G.weeklyOffers(legacy)[0].id);
 assert.equal(next.lastResult.chapterDecision,null,'old save economic flow unchanged');
}
{
 const good=G.initial(25);good.week=15;good.storyJournal=[
  {id:'register',positive:true},{id:'bento',positive:true}];
 assert.equal(S.chapterBrief(good).path,'hopeful');
 const old=G.initial(25);old.week=15;
 assert.equal(S.chapterBrief(old).path,'skeptical');
}
function completedScenario(id){
 const s=G.initial(901);
 s.week=31;s.finished=true;s.storeRep=80;s.fire=3;
 s.history=Array.from({length:30},(_,i)=>({week:i+1,actionId:'quality',title:'記録',body:'記録',sales:450000,profit:102000,fee:15000,fireHit:false}));
 s.storyJournal=[
  {id:'register',choice:'arc_register_pay',tier:'success',positive:true,followAction:'loyalty',summary:'現場の勤務が安定した。'},
  {id:'bento',choice:'arc_bento_real',tier:'success',positive:true,followAction:'explain',summary:'地元の客が戻ってきた。'},
  {id:'staff',choice:'arc_staff_listen',tier:'success',positive:true,followAction:'audit',summary:'残業代の約束を守った。'}
 ];
 s.cast={boss:0,manager:20,customers:20};
 s.history[14].chapterDecision={id:'accountability',title:'中間監査',route:'people',text:'現場の証言を採用'};
 s.history[21].chapterDecision={id:'community',title:'町との約束',route:'people',text:'町の声を採用'};
 s.history[27].chapterDecision={id:'testimony',title:'最終証言',route:'sales',text:'数字を確認'};
 if(id==='boss'){
  s.cast={boss:30,manager:-20,customers:-20};
  s.storyJournal=s.storyJournal.map((x,i)=>({...x,positive:i>1}));
  s.history[14].chapterDecision.route='boss';
  s.history[21].chapterDecision.route='boss';
 }else if(id==='rescue'){
  s.cast={boss:0,manager:7,customers:7};s.rescueUsed=1;
 }else if(id==='none'){
  s.storyJournal=[];s.history.forEach(h=>delete h.chapterDecision);
 }
 assert.equal(G.validateSaved(JSON.parse(JSON.stringify(s))).history.length,30,'fixture is a valid v1 save');
 return s;
}
{
 const s=completedScenario('people');
 assert.equal(G.ending(s).name,'現場の証言で契約更新');
 assert.equal(G.ending(s).passed,true);
 const evidence=S.epilogue(s);
 assert(evidence.lines.length>=2);
 assert(evidence.lines.some(x=>x.text.includes('現場')));
 const list=C.entries(s);
 assert.equal(list.chapter.length,3);
 assert(C.markup(s).includes('中盤・終盤の選択'));
}
{
 const s=completedScenario('boss');
 assert.equal(G.ending(s).name,'社長の肖像画だけが先に届く');
}
{
 const s=completedScenario('rescue');
 assert.equal(G.ending(s).name,'閉店寸前から、町の約束へ');
}
{
 const s=completedScenario('none');
 assert.notEqual(G.ending(s).name,'現場の証言で契約更新');
 assert.equal(S.epilogue(s).lines.length,0);
}
for(const seed of [13,34,101,239]){
 let s=G.initial(seed);
 while(!s.finished){
  const previous=s,offers=G.weeklyOffers(s);
  assert.equal(offers.length,4,'four choices on every week seed '+seed+' week '+s.week);
  const action=offers.find(x=>x.id.startsWith('fix_'))||offers.find(x=>x.type==='kind')||offers[0];
  s=G.play(s,action.id);
  if(s.rescuePending){
   const rescues=G.rescueOptions(s);
   s=G.resolveRescue(s,rescues.find(x=>x.id==='owner')?.id||rescues[0]?.id||'giveup');
  }
  if(s.lastResult.incidentCost>0&&!s.lastResult.accidentResponse)
   s=G.handleAccident(s,'ignore');
  const h=s.lastResult;
  assert.equal(F.createLedger(h,'store').residual,0);
  assert.equal(F.createLedger(h,'personal').residual,0);
  assert.equal(G.validateSaved(JSON.parse(JSON.stringify(s))).week,s.week);
  for(const [key,delta]of [['storeRep','deltaRep'],['sat','deltaSat'],['fire','deltaFire'],['frust','deltaFrust'],['skill','deltaSkill']])
   assert.equal(s[key]-previous[key],h[delta],'visible delta seed '+seed+' week '+h.week+' '+key);
 }
 assert(G.ending(s),'ending defined for '+seed);
}
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
assert(app.includes('G.STORIES.epilogue(s)'),'final verdict must present saved evidence');
assert(app.includes('esc(line.text)'),'saved story dialogue must be escaped');
console.log('PASS v2.0 chapter finales: three hearings, four choices, evidence-based endings, legacy saves and accounting');
