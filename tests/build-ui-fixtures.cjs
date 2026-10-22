const fs=require('fs');const root=require('path').resolve(__dirname,'..');const G=require(root+'/engine.js');const fixtures={};
function add(name,s){if(fixtures[name])return;try{fixtures[name]=G.validateSaved(s)}catch(e){console.log('invalid',name,e.message)}}
for(let seed=1;seed<250;seed++){let s=G.initial(seed);for(let n=0;n<30&&!s.finished;n++){const choices=G.weeklyOffers(s);s=G.play(s,choices[(seed+n)%4].id);const h=s.lastResult;s.presentation={week:h.week,stage:'outcome',newsIndex:0};add('outcome-'+h.performanceTier,s);if(h.fireHit)add('fire',s);if(h.memoryEvent)add('memory',s);if(h.accidentId)add('accident-'+h.accidentId,s);if(h.storyEvent)add('story-'+(h.storyEvent.episode||h.actionId),s);if(s.rescuePending){add('rescue',s);s=G.resolveRescue(s,G.rescueOptions(s)[0]?.id||'giveup')}if(h.incidentCost>0&&s.lastResult.accidentResponse===null)s=G.handleAccident(s,'ignore');if(s.finished)add('ending-'+G.ending(s).name,s)} }
// A funded fixture exercises every week through the DOM without random insolvency.
let s=G.initial(12345);s.cash=10000000;s.personalCash=1000000;s=G.play(s,G.weeklyOffers(s)[0].id);s.presentation=null;add('campaign',s);
let large=JSON.parse(JSON.stringify(s));large.cash=100000000;large.pay=100000000;large.personalCash=9999999;large.storeRep=0;large.fire=100;large.presentation=null;add('large-low-reputation',large);
module.exports=fixtures;
