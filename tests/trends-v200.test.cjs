'use strict';
const assert=require('node:assert/strict');
const G=require('../engine.js');
const T=require('../trends-v200.js');
assert(T.markup([]).includes('まだ決算記録がありません'));
const old=[{week:1,profit:1000},{week:2,profit:-2000}];
assert.deepEqual(T.series(old,'weekly'),[{week:1,value:1000},{week:2,value:-2000}]);
assert.deepEqual(T.series(old,'cumulative'),[{week:1,value:1000},{week:2,value:-1000}]);
assert.deepEqual(T.series(old,'store'),[],'missing legacy cash must not be invented');
assert(T.markup(old).includes('この指標の記録はありません'));
const single=T.geometry([{week:1,value:42}]);
assert(single.path.startsWith('M'));assert(Number.isFinite(single.points[0].x));
let state=G.initial(42);
state=G.play(state,G.weeklyOffers(state)[0].id);
const before=JSON.stringify(state),out=T.markup(state.history);
assert(out.includes('週間営業利益'));assert(out.includes('累計営業利益'));assert(out.includes('店舗現金'));assert(out.includes('主人公の所持金'));assert(out.includes('role="img"'));
assert.equal(JSON.stringify(state),before,'render must not change save or RNG');
for(const entry of T.METRICS){
 const g=T.geometry(T.series(state.history,entry.id));
 assert(g&&g.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
}
assert.deepEqual(T.series([{week:2,profit:10,cashAfter:20},{week:1,profit:1,cashAfter:5}], 'store'),[{week:2,value:20},{week:1,value:5}]);
console.log('PASS v2.0 trends: stable 30-week history, separate finances, safe legacy gaps and pure SVG projection');