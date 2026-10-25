'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js'),ST=G.STORIES,F=require('../finance.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.equal(ST.EPISODES.length,6);
const basic=G.initial(31),trusted=G.initial(31);
trusted.cast={boss:20,manager:50,customers:50};
assert(G.performanceOdds(trusted,'quality').failure<G.performanceOdds(basic,'quality').failure,'earned trust must improve steady policy odds');
assert(G.performanceOdds(trusted,'quality').great>G.performanceOdds(basic,'quality').great,'earned trust must unlock bigger wins');
assert.equal(ST.POLICIES.length,24);
assert.equal(new Set(ST.POLICIES.map(x=>x.id)).size,24);
for(const e of ST.EPISODES){
 assert.equal(e.choices.length,4,'four policy branches '+e.id);
 assert.equal(e.choices.every(x=>['failure','success','great'].every(t=>typeof x[t]==='string'&&x[t].length>=10)),true);
 assert(html.includes('id="story-cut-'+e.art+'"'),'missing story cutaway '+e.art);
 assert(html.includes('id="policy-scene-story-'+e.art+'"'),'missing policy artwork '+e.art);
 const s=G.initial(76523);s.week=e.week;s.cash=500000;s.personalCash=180000;s.fire=3;s.memory=[];
 const brief=G.weeklyBrief(s);
 assert.equal(brief.episode,e.id,'opening '+e.id);
 assert.equal(G.weeklyOffers(s).length,4);
 assert(G.weeklyOffers(s).every(x=>x.episode===e.id),'no generic choice in special crisis');
 const chosen=e.choices[0].id;
 const after=G.play(s,chosen);
 assert.equal(after.lastResult.storyEvent.id,e.id);
 assert.equal(after.lastResult.storyEvent.phase,'opening');
 assert.equal(after.storyArcs.length,1);
 assert.equal(after.storyArcs[0].stage,'follow');
 assert.equal(after.storyArcs[0].due,e.week+2);
 assert.deepEqual(G.play(s,chosen),after,'seeded result reproducible');
 after.week=e.week+2;after.lastResult={actionId:chosen,actionName:'前の選択',fireHit:false,memoryEvent:false};
 const follow=G.weeklyBrief(after);
 assert.equal(follow.phase,'follow','follow must be available');
 assert.equal(follow.choices.length,4);
 const followAction=G.weeklyOffers(after)[0].id;
 const continuation=G.play(after,followAction);
 assert.equal(continuation.lastResult.storyEvent.phase,'follow');
 assert.equal(continuation.storyArcs[0].stage,'echo');
 continuation.week=e.week+5;continuation.lastResult={actionId:followAction,fireHit:false,memoryEvent:false};
 const echo=G.play(continuation,G.weeklyOffers(continuation)[0].id);
 assert.equal(echo.storyJournal.length,1,'echo recorded '+e.id);
 assert(echo.lastResult.storyEcho.length===1,'echo surfaced in result');
 assert(!echo.storyArcs.some(a=>a.id===e.id),'original echo resolved without blocking another episode');
 assert.notDeepEqual(echo.cast,s.cast,'persistent cast reputation');
}
for(const node of ['storyEvent','storyArtwork','storyEpisodeTitle','storyEpisodeText','storyEcho','storyPulse'])assert(html.includes('id="'+node+'"'),node);
for(const tier of ['failure','success','great'])assert(html.includes('id="story-tier-'+tier+'"'));
const old=G.initial(3);delete old.storyArcs;delete old.storyJournal;delete old.cast;
const hydrated=G.validateSaved(old);assert.deepEqual(hydrated.storyArcs,[]);assert.deepEqual(hydrated.storyJournal,[]);assert.deepEqual(hydrated.cast,{boss:0,manager:0,customers:0});
const broken=G.initial(3);broken.storyArcs=[{id:'typo',stage:'follow'}];assert.throws(()=>G.validateSaved(broken));
let ledgerWeeks=0,finalWeeks=0,openingCount=0;
for(let seed=1;seed<=140;seed++){
 let s=G.initial(seed*12343);
 while(!s.finished){
  const offers=G.weeklyOffers(s);assert.equal(offers.length,4);
  const chosen=offers[(seed+s.week)%4].id;
  const next=G.play(s,chosen);
  if(next.lastResult.storyEvent?.phase==='opening')openingCount++;
  assert.equal(next.lastResult.cashAfter-next.lastResult.cashBefore,next.lastResult.deltaCash);
  assert.equal(next.lastResult.personalCashAfter-next.lastResult.personalCashBefore,(next.personalCash-s.personalCash));
  let saved=G.validateSaved(next);
  assert.equal(saved.history.length,next.history.length);
  ledgerWeeks++;
  if(next.rescuePending){const opts=G.rescueOptions(next);s=G.resolveRescue(next,opts.length?opts[0].id:'giveup');}
  else s=next;
  if(s.lastResult?.accidentId&&!s.lastResult.accidentPositive&&s.lastResult.incidentCost>0&&s.lastResult.accidentResponse===null)s=G.handleAccident(s,'ignore');
 }
 if(s.week===31)finalWeeks++;
}
assert(openingCount>20,'authored events should appear in normal play');
console.log('PASS v1.3.0: six episode openings, 24 distinct choices, three written endings per choice, two callbacks, legacy save, 140 campaigns', {ledgerWeeks,openingCount,finalWeeks});
