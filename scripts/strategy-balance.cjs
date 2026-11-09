'use strict';

const fs = require('node:fs');
const path = require('node:path');
const G = require('../engine');
const Seasons = require('../season-goals');
const styles = ['QUALITY','PEOPLE','LOCAL','COST','PROMOTION','TRUST','EFFICIENCY','BLACK'];
const difficulties = ['easy','normal','hard'];
const good = ['quality','local','restorestaff','loyalty','explain','audit','tasting','ceocut','maintenance'];
const profit = ['raise','bills','quality','ceocut','local','tasting','restorestaff'];
function score(s, action, style, seed) {
  const tags = action.styleTags;
  // Default plans prefer staying in business, but do not inspect future random outcomes.
  let value = tags.includes(style) ? 11 : 0;
  value += action.choiceClass === 'GOOD' ? 4 : 0;
  if (style === 'GOOD') value += action.choiceClass === 'GOOD' ? 25 : 0;
  if (s.storeRep < 62 || s.fire >= 44)
    value += (tags.includes('TRUST') || tags.includes('LOCAL') || good.includes(action.id)) ? 11 : 0;
  if (s.workforce.fatigue >= 50 && tags.includes('PEOPLE')) value += 10;
  if (s.staff <= 45 && action.id==='restorestaff') value += 13;
  if (s.price < 170 && action.id === 'raise') value += 12;
  if (s.cash < 115000 && (action.id === 'loan' || profit.includes(action.id))) value += 7;
  if (style==='BLACK' && s.storeRep>=67 && s.fire<45 && action.choiceClass==='GREEDY') value+=5;
  // Fund aggressive weeks with margin and retention before the next campaign.
  if(style==='BLACK'){
    if(s.price<220 && action.id==='raise')value+=24;
    if(s.fire>27 || s.storeRep<72 || s.stylePoints.BLACK>=10)
      value+=profit.includes(action.id)||action.id==='loyalty'?15:0;
  }
  const order = G.ACTIONS.indexOf(action)+1;
  return value + ((seed*173 + order*31 + s.week*29 + order*seed*s.week)%79)/20;
}
function run(seed,difficulty,style,fixture,claim=true) {
  let state = G.initial(seed,{difficulty,choiceEdition:370,strategyVersion:380});
  const actions=[], goals=[];
  let missedContinued=false,goalHits=0;
  while (!state.finished) {
    if(Seasons.needsGoal(state)){
      const choices=Seasons.offers(state);
      const id=fixture?.goals[goals.length] ?? choices[(seed+goals.length)%choices.length].id;
      Seasons.choose(state,id);goals.push(id);
    }
    const offers=G.weeklyOffers(state);
    const action=fixture ? offers.find(a=>a.id===fixture.actions[actions.length]) :
      offers.reduce((best,a)=>score(state,a,style,seed)>score(state,best,style,seed)?a:best);
    if(!action)throw Error('Unavailable choice '+state.week);
    actions.push(action.id);
    state=G.play(state,action.id);
    const h=state.lastResult;
    if(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&!h.accidentResponse)
      state=G.handleAccident(state,'ignore');
    if(state.rescuePending)state=G.resolveRescue(state,G.rescueOptions(state)[0]?.id||'giveup');
    if(state.seasonReview){
      const r=Seasons.review(state);
      if(r.achieved)goalHits++;else if(!state.finished)missedContinued=true;
      Seasons.complete(state,claim ? state.perks.length===4 ? state.perks[0] : undefined : 'skip');
    }
  }
  const g=G.goalStatus(state);
  return {seed,difficulty,style,actions,goals,ending:G.ending(state).id,
    passed:!state.personalFailed&&!state.bankrupt&&actions.length===30&&g.passed,
    levelPoints:state.stylePoints[style]||0,perkCount:state.perks.length,goalHits,missedContinued,profit:g.profit,rep:state.storeRep};
}
function simulate(n=15) {
  const results=[];
  for(const style of [...styles,'GOOD'])for(const difficulty of difficulties)
    for(let i=1;i<=n;i++)results.push(run(101*i,difficulty,style));
  return results;
}
if(require.main===module){
  const results=simulate();const routes={};
  for(const r of results)routes[r.ending]??=r;
  for(const [ending,r] of Object.entries(require('../tests/fixtures/v370-endings.json'))){
    if(routes[ending])continue;
    const replay=run(r.seed,r.difficulty,'QUALITY',{actions:r.actions,goals:[]});
    routes[replay.ending]??=replay;
  }
  console.log('endings',Object.keys(routes));
  for(const style of [...styles,'GOOD'])console.log(style,difficulties.map(d=>results.filter(r=>r.difficulty===d&&r.style===style&&r.passed).length));
  fs.writeFileSync(path.join(__dirname,'../tests/fixtures/v380-endings.json'),JSON.stringify(Object.fromEntries(Object.entries(routes).map(([id,{seed,difficulty,goals,actions}])=>[id,{seed,difficulty,goals,actions}])),null,2)+'\n');
  const skipped=results.map(r=>run(r.seed,r.difficulty,r.style,undefined,false));
  const header=['# v3.8.0 運営方針の検証','','同一の15 seed（101〜1515を101刻み）を3難易度・9方針に使用した405契約。各セルは15件中の契約成功数。成功は30週完走、利益目標、評判50、個人・店舗破綻なし。週の候補からタグを優先し、評判・疲労・価格・資金に応じて補正した。追加投資と悪魔契約は全周未使用。実プレイヤーの勝率の推定には使わない。','','|優先方針|easy|normal|hard|成功率|平均利益|平均評判|','|---|---:|---:|---:|---:|---:|---:|'];
  for(const style of [...styles,'GOOD']){
    const rows=results.filter(r=>r.style===style);
    const wins=rows.filter(r=>r.passed).length;
    header.push('|'+[style,...difficulties.map(d=>rows.filter(r=>r.passed&&r.difficulty===d).length),(100*wins/rows.length).toFixed(1)+'%',Math.round(rows.reduce((sum,r)=>sum+r.profit,0)/rows.length).toLocaleString('ja-JP')+'円',(rows.reduce((sum,r)=>sum+r.rep,0)/rows.length).toFixed(1)].join('|')+'|');
  }
  header.push('','同じ方針で特典だけ全辞退した405周の達成数 '+skipped.filter(r=>r.passed).length+'件。獲得時 '+results.filter(r=>r.passed).length+'件。全周の保有特典最大 '+Math.max(...results.map(r=>r.perkCount))+'個。','目標未達後も継続した契約 '+results.filter(r=>r.missedContinued).length+'件。GOODは候補にある場合に優先する。選択可能な週のみに限定して純粋GOODの成績を計測したものではない。','');
  fs.writeFileSync(path.join(__dirname,'../docs/strategy-balance-v380.md'),header.join('\n'));
}
module.exports={run,simulate};
