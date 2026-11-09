const test=require('node:test'),assert=require('node:assert/strict'),S=require('../season-goals');
const G={campaignWeeks:()=>30,PERSONAL:{dueWeeks:[4,8],support:36000,living:7000},STORIES:{EPISODES:[{id:'bento',week:5}]}};
test('timeline preserves contractual dues, installments, belief about recurrence, limits and ordering',()=>{
 const s={week:4,debt:15000,pacts:[{id:'personal',due:6,price:159000}],memory:[{due:5}],storyArcs:[]};
 const rows=S.timeline(s,G);
 const by=k=>rows.filter(r=>r.kind===k);
 assert.deepEqual(by('loan').map(x=>x.amount),[13000,8000]);assert.equal(by('devil')[0].account,'personal');assert.equal(by('devil')[0].certainty,'fixed');
 assert.equal(by('memory')[0].certainty,'possible');assert.equal(by('support')[0].amount,36000);assert.equal(by('season')[0].week,5);assert.equal(by('episode').length,1);
 assert(rows.every(x=>x.week>=4&&x.week<=8));assert.equal(S.homeTimeline(s,G).length,2);assert.equal(S.timeline({...s,week:29},G).at(-1).kind,'contract');
});
