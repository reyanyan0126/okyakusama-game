'use strict';
// v2.0.0: matched-seed strategy experiment. This module never edits saves or the game rules.
const G=require('../engine.js');
const F=require('../finance.js');
const STRATEGIES=['trust','profit','adaptive','random','guarded-profit'];
const FINANCE_POLICIES=['no-invest-repair','invest-repair','no-invest-ignore','invest-ignore'];
const TRUST={fix_equipment:100,fix_people:100,fix_fans:100,loyalty:65,audit:55,explain:50,local:45,quality:35,apology:30,bills:25,ceocut:20};
const PROFIT={shrink:65,cheap:60,raise:55,staff:45,airtax:40,blame:35,stamp:30,points:25};
const RISK_BUDGET={shrink:110,cheap:105,raise:100,staff:95,airtax:90,blame:88,stamp:85,points:82,photo:80,pop:77};
// Forensics: can aggressive actions work when a player stops pushing through a crisis?
// This is a reproducible comparator, never an automatic in-game recommendation or win-rate claim.
function guardedScore(s,a){
 if(a.id.startsWith('fix_'))return 400;
 if(s.cash<95000&&a.id==='loan')return 310;
 const alarm=s.storeRep<48||s.frust>=55||s.fire>=32||s.sat<47||s.staff<=40||s.quality<35||s.size<=65||s.cash<100000;
 if(alarm){
  const help={apology:240,recall:230,loyalty:215,audit:210,explain:205,quality:s.quality<40?225:160,restorestaff:s.staff<=40?225:160,bills:170,ceocut:165,local:160,sale:140,stamp:s.fire<20?110:0};
  return help[a.id]??(a.type==='kind'?65:-110);
 }
 let score=RISK_BUDGET[a.id]??0;
 if(a.id==='raise'&&s.price>=235)score-=120;
 if(a.id==='shrink'&&s.size<=75)score-=150;
 if(a.id==='cheap'&&s.quality<=45)score-=150;
 if(a.id==='staff'&&s.staff<=45)score-=150;
 if(a.id==='stamp'&&s.fire>=20)score-=75;
 return score;
}
function score(s,a,strategy){
 if(strategy==='guarded-profit')return guardedScore(s,a);
 if(strategy==='adaptive'){
  let n=(a.id.startsWith('fix_')?100:0)+(a.type==='kind'?15:0);
  if(s.cash<100000&&a.id==='loan')n+=150;
  if(s.fire>=35||s.frust>=50)n+=({apology:95,loyalty:80,audit:70,explain:60,recall:s.cash>180000?75:15}[a.id]||0);
  else n+=({ceocut:60,bills:55,loyalty:50,local:40,stamp:35,raise:s.price<220?45:-25,shrink:s.size>85?40:-30,quality:s.quality<65?30:-10}[a.id]||0);
  return n;
 }
 const priority=strategy==='profit'?PROFIT:TRUST;
 return priority[a.id]??(a.type===(strategy==='profit'?'hard':'kind')?20:-20);
}
function select(s,offers,strategy,nextRandom){
 if(strategy==='random')return offers[Math.floor(nextRandom()*offers.length)];
 return [...offers].sort((a,b)=>score(s,b,strategy)-score(s,a,strategy))[0];
}
function execute(seed,strategy,finance){
 if(!STRATEGIES.includes(strategy)||!FINANCE_POLICIES.includes(finance))throw Error('Unsupported comparison policy');
 if(!Number.isSafeInteger(seed)||seed<=0||seed>4294967295)throw Error('Invalid seed');
 let s=G.initial(seed),r=(seed^0xabc123)>>>0;
 const nextRandom=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
 const invest=finance.startsWith('invest-'),repair=finance.endsWith('-repair');
 let shortage=false,fireCount=0,saveErrors=0,ledgerErrors=0,deltaErrors=0,projects=0,remedies=0,loans=0,chosen={};
 const phase=[0,1,2].map(()=>({observed:0,lossWeeks:0,profit:0}));
 while(!s.finished){
  if(s.history.length>=G.MAX_WEEKS)throw Error('Game exceeded week cap');
  const offers=G.weeklyOffers(s),a=select(s,offers,strategy,nextRandom);
  const project=invest?G.availableProjects(s).filter(p=>p.nextCost!==null&&s.cash-p.nextCost>=180000).sort((a,b)=>a.level-b.level)[0]?.id||null:null;
  const before=s;
  s=G.play(s,a.id,{project});
  if(project)projects++;
  if(a.id==='loan')loans++;
  const h=s.lastResult;
  fireCount+=Number(h.fireHit);
  shortage ||= s.cash<0;
  const p=phase[Math.floor((h.week-1)/10)];
  p.observed++;p.lossWeeks+=Number(h.profit<0);p.profit+=h.profit;
  chosen[a.id]=(chosen[a.id]||0)+1;
  if(s.rescuePending){
   const choices=G.rescueOptions(s);
   s=G.resolveRescue(s,choices.find(x=>x.id==='owner')?.id||choices[0].id);
  }
  if(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&!h.accidentResponse){
   const cost=Math.min(28000,Math.round(h.incidentCost*.48)+4000);
   const response=repair&&s.cash-cost>=80000?'repair':'ignore';
   s=G.handleAccident(s,response);
   remedies+=Number(response==='repair');
  }
  ledgerErrors+=Number(F.createLedger(s.lastResult,'store').residual!==0);
  ledgerErrors+=Number(F.createLedger(s.lastResult,'personal').residual!==0);
  for(const [key,delta] of [['storeRep','deltaRep'],['sat','deltaSat'],['fire','deltaFire'],['frust','deltaFrust'],['skill','deltaSkill']])
   deltaErrors+=Number(s[key]-before[key]!==s.lastResult[delta]);
  try{G.validateSaved(JSON.parse(JSON.stringify(s)));}catch(_){saveErrors++;}
 }
 return {seed,strategy,finance,weeks:s.history.length,complete:s.week===G.MAX_WEEKS+1&&!s.bankrupt&&!s.personalFailed,
  passed:G.ending(s)?.passed===true,shortage,fireCount,projects,remedies,loans,rescues:s.rescueUsed||0,
  profit:G.goalStatus(s).profit,cash:s.cash,rep:s.storeRep,arrears:s.arrears,saveErrors,ledgerErrors,deltaErrors,phase,chosen};
}
function summary(rows){
 const sum=key=>rows.reduce((n,r)=>n+Number(r[key]),0);
 const sorted=key=>rows.map(x=>x[key]).sort((a,b)=>a-b);
 const percentile=(xs,p)=>xs[Math.floor((xs.length-1)*p)];
 const metric=key=>{const xs=sorted(key);return {p10:percentile(xs,.1),median:percentile(xs,.5),p90:percentile(xs,.9)};};
 const phase=[0,1,2].map(i=>rows.reduce((o,r)=>({observed:o.observed+r.phase[i].observed,lossWeeks:o.lossWeeks+r.phase[i].lossWeeks,profit:o.profit+r.phase[i].profit}),{observed:0,lossWeeks:0,profit:0}));
 const chosen={};for(const r of rows)for(const [id,count]of Object.entries(r.chosen))chosen[id]=(chosen[id]||0)+count;
 return {runs:rows.length,completed:sum('complete'),passed:sum('passed'),shortages:sum('shortage'),fires:sum('fireCount'),
  projects:sum('projects'),repairs:sum('remedies'),loans:sum('loans'),rescues:sum('rescues'),
  saveErrors:sum('saveErrors'),ledgerErrors:sum('ledgerErrors'),deltaErrors:sum('deltaErrors'),
  weeks:metric('weeks'),profit:metric('profit'),cash:metric('cash'),rep:metric('rep'),phase,chosen,
  sampleFailures:rows.filter(x=>!x.complete).slice(0,3).map(x=>({seed:x.seed,week:x.weeks,cash:x.cash,rep:x.rep,profit:x.profit}))};
}
function experiment(count=200){
 if(!Number.isInteger(count)||count<1||count>10000)throw Error('Invalid sample count');
 const results={protocol:{seeds:count,seedFormula:'Math.imul(i,2654435761)>>>0; i=1..N',random:'independent LCG; no game RNG used',
  controls:'same investments, compensation and rescue decision rules in each finance arm; realized decisions differ with game state',
  note:'observational heuristics; not human win rates or causal estimates; no future-state lookahead'},groups:{}};
 for(const finance of FINANCE_POLICIES)for(const strategy of STRATEGIES){
  const runs=[];
  for(let i=1;i<=count;i++)runs.push(execute(Math.imul(i,2654435761)>>>0,strategy,finance));
  results.groups[finance+'/'+strategy]=summary(runs);
 }
 return results;
}
module.exports={STRATEGIES,FINANCE_POLICIES,score,guardedScore,select,execute,summary,experiment};
if(require.main===module){
 const count=Number(process.env.STRATEGY_SEEDS||200),results=experiment(count);
 if(process.argv[2])require('node:fs').writeFileSync(process.argv[2],JSON.stringify(results,null,2)+'\n');
 else console.log(JSON.stringify(results,null,2));
}