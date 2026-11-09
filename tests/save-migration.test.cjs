const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../engine');
test('migrate a played v3.7 save once, preserving cash, pending result and RNG',()=>{
 let previous=G.initial(12,{difficulty:'normal',choiceEdition:370});
 previous=G.play(previous,'quality');
 previous.presentation={week:1,stage:'outcome',newsIndex:0};
 const raw=JSON.stringify(previous);
 const restored=G.validateSaved(JSON.parse(raw));
 assert.equal(restored.strategyVersion,380);
 assert(restored.stylePoints.QUALITY>=1);
 for(const key of ['cash','personalCash','rng','week','history','lastResult','presentation'])
   assert.deepEqual(previous[key],restored[key],key);
 assert.deepEqual(restored,G.validateSaved(JSON.parse(JSON.stringify(restored))));
 for(const corrupt of [s=>s.stylePoints.QUALITY=-1,s=>s.perks=['unknown'],s=>s.seasonGoal={id:'bad',end:900}]){
   const bad=structuredClone(restored);corrupt(bad);assert.throws(()=>G.validateSaved(bad));
 }
});
