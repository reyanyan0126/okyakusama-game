/* Scenario estimates use a separate deterministic random stream, never the save RNG. */
(function(root){
'use strict';
function estimate(G,input,id,options={}){
 const samples=64,values=[];
 for(let i=0;i<samples;i++){
  const s=JSON.parse(JSON.stringify(input));
  // Shared scenario seeds let players compare policies without rerolling previews.
  s.rng=(Math.imul(i+1,2654435761)^Math.imul(input.week,2246822519))>>>0 || 1;
  const h=G.play(s,id,options).lastResult;
  values.push({profit:h.profit,cash:h.cashAfter,rep:h.repAfter});
 }
 const summary=k=>{const a=values.map(x=>x[k]).sort((a,b)=>a-b);return {mean:Math.round(a.reduce((n,x)=>n+x,0)/samples),low:a[6],high:a[57]};};
 return {version:1,week:input.week,actionId:id,samples,profit:summary('profit'),cash:summary('cash'),rep:summary('rep')};
}
function valid(x,week){return !!x&&x.version===1&&x.week===week&&x.samples===64&&typeof x.actionId==='string'&&['profit','cash','rep'].every(k=>x[k]&&['mean','low','high'].every(n=>Number.isSafeInteger(x[k][n]))&&x[k].low<=x[k].high);}
const api={estimate,valid};root.DecisionForecast=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
