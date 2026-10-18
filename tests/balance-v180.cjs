'use strict';
// Observational policies only: never inspect future RNG or simulate candidate outcomes.
const G=require('../engine.js'), F=require('../finance.js');
const fs=require('node:fs');
const count=Number(process.env.SEEDS||200);
const q=(xs,p)=>[...xs].sort((a,b)=>a-b)[Math.floor((xs.length-1)*p)];
const dist=xs=>({min:q(xs,0),p10:q(xs,.1),median:q(xs,.5),p90:q(xs,.9),max:q(xs,1)});
function score(s,a,mode){
 const steady={fix_equipment:100,fix_people:100,fix_fans:100,loyalty:65,audit:55,explain:50,local:45,quality:35,apology:30,bills:25,ceocut:20};
 const bold={shrink:65,cheap:60,raise:55,staff:45,airtax:40,blame:35,stamp:30,points:25};
 let n=(mode==='B'?bold[a.id]:steady[a.id])??(a.type===(mode==='B'?'hard':'kind')?20:-20);
 if(mode==='C'){
  n=(a.id.startsWith('fix_')?100:0)+(a.type==='kind'?15:0);
  if(s.cash<100000&&a.id==='loan')n+=150;
  if(s.fire>=35||s.frust>=50)n+=({apology:95,loyalty:80,audit:70,explain:60,recall:s.cash>180000?75:15}[a.id]||0);
  else n+=({ceocut:60,bills:55,loyalty:50,local:40,stamp:35,raise:s.price<220?45:-25,shrink:s.size>85?40:-30,quality:s.quality<65?30:-10}[a.id]||0);
 }
 return n;
}
const results={protocol:{seeds:count,seedFormula:'Math.imul(i,2654435761) >>> 0; i=1..N',random:'independent LCG, no engine RNG consumed',completion:'week=31 and no bankruptcy/personal failure',shortage:'at least one cash<0, including rescued',policies:'See score(). A trust; B short-term aggressive; C state-based; D uniform random. A/C invest with 180000 yen reserve; B/D no investment. A/C repair with 80000 reserve. All rescue; C may take personal pact when arrears>0 and wallet<20000, shop pact when cash<50000 without loan; others none. These are heuristics, not optimal human play.'},strategies:{}};
for(const mode of ['A','B','C','D']){
 const runs=[],actions={},phases=[0,1,2].map(()=>({weeks:0,lossWeeks:0,shortages:0,fires:0,profit:0}));
 let saveErrors=0,storeResiduals=0,personalResiduals=0,deltaErrors=0,firstSaveError=null;
 for(let i=1;i<=count;i++){
  const seed=Math.imul(i,2654435761)>>>0;let s=G.initial(seed),r=seed^0xabc123;
  const random=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
  let shortage=false,fires=0,recoveries=0,loans=0,pacts=0,livingShortfall=0,supportDue=0,supportPaid=0;
  while(!s.finished){
   const offers=G.weeklyOffers(s),a=mode==='D'?offers[Math.floor(random()*offers.length)]:[...offers].sort((a,b)=>score(s,b,mode)-score(s,a,mode))[0];
   const opts={};
   if(['A','C'].includes(mode))opts.project=G.availableProjects(s).filter(p=>p.nextCost!==null&&s.cash-p.nextCost>=180000).sort((a,b)=>a.level-b.level)[0]?.id||null;
   if(mode==='C'&&G.pactAvailable(s)){if(s.arrears>0&&s.personalCash<20000)opts.devil='personal';else if(s.cash<50000&&a.id!=='loan')opts.devil='shop';}
   const before=s;s=G.play(s,a.id,opts);const h=s.lastResult;
   shortage ||= s.cash<0;fires+=+h.fireHit;loans+=+(a.id==='loan');pacts+=+!!opts.devil;
   livingShortfall+=Math.max(0,-(before.personalCash+h.fee+h.boardroomBonus+(opts.devil==='personal'?120000:0)-h.personalLiving-h.personalDevilPayment));
   supportDue+=h.supportDue;supportPaid+=h.supportPaid;
   const phase=phases[Math.floor((h.week-1)/10)];phase.weeks++;phase.profit+=h.profit;phase.lossWeeks+=+(h.profit<0);phase.fires+=+h.fireHit;phase.shortages+=+(s.cash<0);
   if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s).find(x=>x.id==='owner')?.id||G.rescueOptions(s)[0].id);
   if(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&!h.accidentResponse){const cost=Math.min(28000,Math.round(h.incidentCost*.48)+4000);s=G.handleAccident(s,['A','C'].includes(mode)&&s.cash-cost>=80000?'repair':'ignore');}
   recoveries+=+(before.storeRep<50&&s.storeRep>=50);
   const row=actions[a.id]??={offered:0,chosen:0,profit:0,directRep:0,failures:0};row.chosen++;row.profit+=h.profit;row.directRep+=h.actionImpact?.rep||0;row.failures+=+(h.performanceTier==='failure');
   for(const o of offers)(actions[o.id]??={offered:0,chosen:0,profit:0,directRep:0,failures:0}).offered++;
   storeResiduals+=+(F.createLedger(s.lastResult,'store').residual!==0);personalResiduals+=+(F.createLedger(s.lastResult,'personal').residual!==0);
   for(const [key,delta] of [['storeRep','deltaRep'],['sat','deltaSat'],['fire','deltaFire'],['frust','deltaFrust'],['skill','deltaSkill']])deltaErrors+=+(s[key]-before[key]!==s.lastResult[delta]);
   try{G.validateSaved(JSON.parse(JSON.stringify(s)));}catch(e){saveErrors++;firstSaveError??={seed,week:h.week,message:e.message,bodyLength:h.body.length};}
  }
  runs.push({seed,weeks:s.history.length,complete:s.week===31&&!s.bankrupt&&!s.personalFailed,passed:G.ending(s).passed,shortage,personalFailed:s.personalFailed,arrears:s.arrears,livingShortfall,supportDue,supportPaid,fires,recoveries,loans,pacts,rescues:s.rescueUsed,profit:G.goalStatus(s).profit,cash:s.cash,rep:s.storeRep,ending:G.ending(s).name,lastActions:s.history.slice(-3).map(h=>h.actionId)});
 }
 const sum=k=>runs.reduce((a,r)=>a+Number(r[k]),0);
 results.strategies[mode]={count,completed:sum('complete'),passed:sum('passed'),shortages:sum('shortage'),personalFailed:sum('personalFailed'),arrearsRuns:runs.filter(r=>r.arrears>0).length,livingShortfall:sum('livingShortfall'),supportDue:sum('supportDue'),supportPaid:sum('supportPaid'),fires:sum('fires'),recoveries:sum('recoveries'),loans:sum('loans'),pacts:sum('pacts'),rescues:sum('rescues'),weeks:dist(runs.map(r=>r.weeks)),profit:dist(runs.map(r=>r.profit)),rep:dist(runs.map(r=>r.rep)),phases,actions,saveErrors,firstSaveError,storeResiduals,personalResiduals,deltaErrors,failures:runs.filter(r=>!r.complete).slice(0,3),runs};
 console.error(mode,JSON.stringify({complete:sum('complete'),passed:sum('passed'),saveErrors,deltaErrors}));
}
fs.writeFileSync(process.argv[2]||'/tmp/balance.json',JSON.stringify(results,null,2).replace(/\{\n\s+"seed":[\s\S]*?\n\s+\}/g, row=>JSON.stringify(JSON.parse(row)))+'\n');
