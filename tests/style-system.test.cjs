const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../engine');
const S=require('../strategy-styles');
const Season=require('../season-goals');
const fresh=()=>G.initial(371,{difficulty:'normal',choiceEdition:370,strategyVersion:380});
test('all 53 policies have independent style tags; investments and contracts accrue once',()=>{
 assert.equal(Object.keys(S.tags).length,53);
 for(const a of G.ACTIONS){assert(a.styleTags.length);for(const tag of a.styleTags)assert(S.styles[tag]);}
 assert.deepEqual([0,2,3,5,6,9,10,30].map(S.level),[0,0,1,1,2,2,3,3]);
 const s=fresh();Season.choose(s,Season.offers(s)[0].id);
 const out=G.play(s,'quality',{project:'people',devil:'shop'});
 assert.equal(out.stylePoints.QUALITY,1);assert.equal(out.stylePoints.TRUST,1);assert.equal(out.stylePoints.PEOPLE,1);assert.equal(out.stylePoints.BLACK,1);
 assert.deepEqual(out.stylePoints,S.pointsFromHistory(out.history));assert.equal(s.stylePoints.BLACK,0);
});
test('existing style levels, investment and relationships modify actual rules',()=>{
 const s=fresh();const before=G.performanceOdds(s,'quality').failure;
 s.stylePoints.QUALITY=10;
 assert(G.performanceOdds(s,'quality').failure<before);assert.equal(S.adjustedCost(s,'quality',10000),9200);
 s.stylePoints.BLACK=10;
 assert(S.benefit(s,'shrink').risk>0);assert(S.benefit(s,'shrink').demand>1);
 s.history=[{actionId:'quality'}];assert.equal(S.combo(s,'local').name,'地産地消');
 s.history=[{actionId:'cheap'},{actionId:'shrink'}];assert.equal(S.combo(s,'staff').name,'削りすぎ');
});
