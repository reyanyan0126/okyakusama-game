/* v2.0.0 management trends: derived entirely from saved, already-settled history. */
(function(root){
'use strict';
const METRICS=[
 {id:'weekly',label:'週間営業利益',unit:'円'},
 {id:'cumulative',label:'累計営業利益',unit:'円'},
 {id:'store',label:'店舗現金',unit:'円'},
 {id:'personal',label:'主人公の所持金',unit:'円'}
];
const yen=n=>Math.round(n).toLocaleString('ja-JP')+'円';
function series(history,id){
 if(!Array.isArray(history))return [];
 let cumulative=0;
 const result=[];
 for(const h of history){
  if(!h||!Number.isSafeInteger(h.week)||h.week<1||h.week>30)continue;
  const value=id==='weekly'||id==='cumulative'?h.profit:id==='store'?h.cashAfter:id==='personal'?h.personalCashAfter:undefined;
  if(!Number.isFinite(value))continue;
  if(id==='cumulative')cumulative+=value;
  result.push({week:h.week,value:id==='cumulative'?cumulative:value});
 }
 // We do not invent missing old-save cash fields or interpolate missing weeks.
 return result;
}
function geometry(rows){
 if(!rows.length)return null;
 const vals=rows.map(p=>p.value),lo=Math.min(...vals),hi=Math.max(...vals),span=Math.max(1,hi-lo);
 const lastWeek=Math.max(1,...rows.map(p=>p.week));
 const x=week=>20+(lastWeek===1?140:280*(week-1)/(lastWeek-1));
 const y=value=>87-74*((value-lo)/span);
 const points=rows.map(p=>({week:p.week,value:p.value,x:Number(x(p.week).toFixed(2)),y:Number(y(p.value).toFixed(2))}));
 return {points,path:points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '),min:lo,max:hi};
}
function markup(history){
 const weekCount=Array.isArray(history)?history.length:0;
 if(!weekCount)return '<section class="trend-section" aria-label="経営の推移"><h3>経営の推移</h3><p>まだ決算記録がありません。第1週の営業後に表示されます。</p></section>';
 const charts=METRICS.map(metric=>{
  const rows=series(history,metric.id),g=geometry(rows);
  if(!g)return '<article class="trend-card"><h4>'+metric.label+'</h4><p>この指標の記録はありません。過去データを推測して補いません。</p></article>';
  const first=rows[0],last=rows[rows.length-1],point=g.points[g.points.length-1];
  const label=metric.label+'。第'+first.week+'週 '+yen(first.value)+'から第'+last.week+'週 '+yen(last.value)+'。最小 '+yen(g.min)+'、最大 '+yen(g.max);
  return '<article class="trend-card"><h4>'+metric.label+'</h4><svg class="trend-svg" viewBox="0 0 320 100" role="img" aria-label="'+label+'"><path class="trend-axis" d="M20 88 H300"/><path class="trend-line" d="'+g.path+'"/><circle class="trend-dot" cx="'+point.x+'" cy="'+point.y+'" r="4"/></svg><p class="trend-summary">第'+first.week+'週 '+yen(first.value)+' → 第'+last.week+'週 <strong>'+yen(last.value)+'</strong></p><small>期間内 最小 '+yen(g.min)+' / 最大 '+yen(g.max)+'</small></article>';
 }).join('');
 return '<section class="trend-section" aria-label="経営の推移"><h3>経営の推移</h3><p class="trend-intro">確定済みの週次記録から作成。店舗現金と自分の財布は別です。記録のない週は補完しません。</p><div class="trend-grid">'+charts+'</div></section>';
}
const api={METRICS,series,geometry,markup};
root.GameTrends=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
