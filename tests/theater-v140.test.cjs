'use strict';
const assert=require('node:assert/strict'),G=require('../engine.js'),T=require('../scene.js').theater;
const ids=['arc_register_boss','arc_staff_robot','arc_bento_real','arc_bento_camera','arc_staff_listen','arc_festival_parade','arc_media_open','arc_finale_steal'];
assert.equal(new Set(ids.map(T.setting)).size,8);
for(const role of ['boss','manager','you','worker','customer'])for(const mood of ['normal','joy','worry','anger','down'])assert(T.person(role,0,0,mood).includes('mood-'+mood));
const seen=new Set(), impacts={};
for(let seed=1;seed<500;seed++){
 const state=G.play(G.initial(seed),'quality'),h=state.lastResult;
 assert(h.actionImpact);
 if(impacts[h.performanceTier])assert.deepEqual(h.actionImpact,impacts[h.performanceTier],'same policy tier has same direct impact despite accidents');
 impacts[h.performanceTier]=h.actionImpact;
 if(h.accidentId||h.fireHit)seen.add(h.performanceTier);
 state.presentation={week:h.week,stage:'outcome',newsIndex:0};const restored=G.validateSaved(state);
 assert.equal(restored.cash,state.cash);assert.equal(restored.rng,state.rng);assert.equal(restored.presentation.stage,'outcome');
 assert.deepEqual(T.news(h,G),T.news(h,G));
}
assert.equal(seen.size,3,'accidents can coexist with every outcome');
console.log('PASS v1.4.0 scenes, emotions, isolated impacts, resume and outcome/news independence');
