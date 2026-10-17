'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=require('../engine.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const styles=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');
new Function(app);
const s=G.initial(2026123),steady=G.performanceOdds(s,'quality'),bold=G.performanceOdds(s,'shrink');
for(const o of [steady,bold])assert.equal(o.failure+o.success+o.great,100);
assert(bold.failure>steady.failure);assert(bold.great>steady.great);
assert.deepEqual(G.performanceOdds(s,'shrink'),G.performanceOdds(s,'shrink'),'preview does not consume RNG');
assert.equal(s.momentum,0);
let outcomes={failure:0,success:0,great:0};
for(let seed=1;seed<=700;seed++){
 const before=G.initial(seed),after=G.play(before,'quality'),h=after.lastResult;
 assert.equal(before.momentum,0,'input state unchanged');
 assert(h.performanceTier in outcomes);
 outcomes[h.performanceTier]++;
 assert.deepEqual(h.performanceOdds,G.performanceOdds(before,'quality'));
 assert.equal(h.performanceMultiplier,h.performanceTier==='failure'?.8:h.performanceTier==='great'?1.35:1);
 assert.equal(after.quality,h.performanceTier==='failure'?68:h.performanceTier==='great'?74:70);
 assert.equal(h.momentumAfter,h.performanceTier==='failure'?0:h.performanceTier==='great'?2:1);
 assert.equal(G.validateSaved(after).history[0].performanceTier,h.performanceTier);
 assert.deepEqual(G.play(G.initial(seed),'quality'),after,'same seed, same result');
}
assert(outcomes.failure>60&&outcomes.success>360&&outcomes.great>50,JSON.stringify(outcomes));
const old=G.initial(32);delete old.momentum;
assert.equal(G.validateSaved(old).momentum,0);
const broken=G.initial(32);broken.momentum=-1;assert.throws(()=>G.validateSaved(broken));
for(const id of ['performanceReport','performanceMessage','performanceName','performanceDetail','selectedPerformance','successStreak'])
 assert(html.includes('id="'+id+'"'),'missing UI '+id);
for(const id of ['tiny','boss','robot','fancy','account','points'])assert(html.includes('id="policy-scene-'+id+'"'));
assert.match(app,/function policyScene\(id\)/);
assert.match(styles,/warning-positive/);
assert(styles.includes('.report-cashflow .number-rising{color:#3d332a!important}'));
assert(styles.includes('.report-cashflow .number-falling,'));
console.log('PASS v1.2.0 probability distributions, numeric multiplier, reproducible results, momentum, old saves, UI',outcomes);
