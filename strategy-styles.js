(function(root){
'use strict';
const styles={
 QUALITY:{name:'商品第一',effects:['品質施策費 −8%','品質施策の失敗 −3pt','品質成功時の評判 +1']},
 PEOPLE:{name:'現場主義',effects:['毎週疲労 −1','人材施策の失敗 −3pt','離職率 −3pt']},
 LOCAL:{name:'地域密着',effects:['地域施策の客数 +3%','地域施策で評判 +1','地域施策の客数さらに +3%']},
 COST:{name:'節約経営',effects:['光熱費 −8%','削減額 +12%','光熱費さらに −8%・削減施策で不満 +1']},
 PROMOTION:{name:'話題先行',effects:['宣伝施策の客数 +3%','宣伝施策の失敗 −3pt','宣伝施策の客数さらに +4%']},
 TRUST:{name:'説明責任',effects:['説明施策で炎上度 −1','説明施策の失敗 −3pt','説明成功時の評判 +1']},
 EFFICIENCY:{name:'効率経営',effects:['設備事故の損失 −10%','効率施策の失敗 −3pt','設備事故の損失さらに −10%']},
 BLACK:{name:'社長イズム',effects:['強引な施策の客数 +5%','強引な施策の客数さらに +5%・疲労 +1','強引な施策の客数さらに +5%・炎上率 +2pt']}
};
const groups={
 QUALITY:'quality local tasting recall arc_bento_real arc_bento_chef arc_festival_locals',
 PEOPLE:'restorestaff ceocut fix_people arc_register_pay arc_staff_listen arc_staff_pizza arc_finale_team',
 LOCAL:'local loyalty tasting stamp fix_fans arc_staff_listen arc_festival_locals arc_festival_free arc_finale_vote',
 COST:'staff shrink cheap raise bills loan ceocut airtax points arc_register_graduation arc_staff_resign arc_media_ignore arc_festival_fee',
 PROMOTION:'photo sale pop tasting stamp apologybot arc_register_boss arc_bento_camera arc_media_fake arc_festival_parade arc_festival_free arc_finale_vote',
 TRUST:'explain audit quality apology recall loyalty arc_bento_label arc_media_open arc_finale_contract',
 EFFICIENCY:'maintenance bills fix_equipment fix_people lower arc_register_machine arc_staff_robot apologybot',
 BLACK:'staff shrink cheap blame airtax photo points arc_register_graduation arc_staff_resign arc_media_fake arc_media_silence arc_media_ignore arc_bento_camera arc_festival_fee arc_finale_steal'
};
const tags={};for(const [key,ids] of Object.entries(groups))for(const id of ids.split(' '))(tags[id]??=[]).push(key);
const level=n=>n>=10?3:n>=6?2:n>=3?1:0;
const rank=(s,k)=>level(s.stylePoints?.[k]||0);
const has=(id,k)=>tags[id]?.includes(k);
const perk=(s,k)=>s.perks?.includes(k);
function award(points,h){
 for(const k of tags[h.actionId]||[])points[k]++;
 if(h.devilId)points.BLACK++;
 const k={equipment:'EFFICIENCY',people:'PEOPLE',fans:'LOCAL'}[h.projectId];if(k)points[k]++;
}
function pointsFromHistory(history){const p=Object.fromEntries(Object.keys(styles).map(k=>[k,0]));for(const h of history)award(p,h);return p;}
function dominant(s){const id=Object.keys(styles).sort((a,b)=>(s.stylePoints[b]||0)-(s.stylePoints[a]||0))[0];return s.stylePoints[id]?{id,name:styles[id].name,level:rank(s,id),points:s.stylePoints[id]}:null;}
const combos=[
 [['COST','COST','BLACK'],'削りすぎ','不満 +3・疲労 +2'],
 [['PROMOTION','BLACK'],'誇大広告疑惑','炎上率 +2pt'],
 [['QUALITY','LOCAL'],'地産地消','客数 +4%'],
 [['PEOPLE','PROMOTION'],'接客が評判に','満足 +2'],
 [['TRUST','QUALITY'],'改善の証明','評判 +1'],
 [['EFFICIENCY','PEOPLE'],'現場改善','疲労 −2']
];
function combo(s,id){const ids=[...s.history.slice(-2).map(h=>h.actionId),id];for(const [seq,name,effect] of combos){if(ids.length>=seq.length&&seq.every((k,i)=>has(ids[ids.length-seq.length+i],k)))return {name,effect};}return null;}
function adjustedCost(s,id,yen){if(s?.strategyVersion!==380)return yen;
 const reduction=has(id,'QUALITY')?(rank(s,'QUALITY')>=1?.08:0)+(perk(s,'buyer')?.10:0):0;
 return Math.round(yen*(yen>=0?1-reduction:rank(s,'COST')>=2?1.12:1));
}
function benefit(s,id){
 const l=k=>rank(s,k), active=k=>has(id,k),c=combo(s,id)?.name;
 const black=active('BLACK')?l('BLACK'):0,local=active('LOCAL')?l('LOCAL'):0,promo=active('PROMOTION')?l('PROMOTION'):0;
 return {
 demand:1+black*.05+(local?0.03:0)+(local===3?.03:0)+(promo?.03:0)+(promo===3?.04:0)+(c==='地産地消'?.04:0)+(perk(s,'merchant')?.02:0),
 risk:(black===3?.02:0)+(c==='誇大広告疑惑'?.02:0),fatigue:(black>=2?1:0)-(l('PEOPLE')?1:0)+(c==='削りすぎ'?2:c==='現場改善'?-2:0),
 failure:Math.min(8,(tags[id].some(k=>['QUALITY','PEOPLE','TRUST','PROMOTION','EFFICIENCY'].includes(k)&&l(k)>=2)?3:0)+((active('PEOPLE')||active('EFFICIENCY'))&&s.cast.manager>=10?2:0)+(active('PEOPLE')&&s.upgrades.people===2&&l('PEOPLE')?2:0)+(active('PEOPLE')&&perk(s,'mentor')?3:0)+(active('EFFICIENCY')&&perk(s,'planner')?3:0)),
 rep:(local>=2?1:0)+(local&&s.upgrades.fans===2?1:0)+(c==='改善の証明'?1:0)+(active('LOCAL')&&perk(s,'neighbor')?1:0),
 sat:(c==='接客が評判に'?2:0)+((active('LOCAL')||active('QUALITY'))&&s.cast.customers>=10?1:0),
 fire:-(active('TRUST')&&l('TRUST')?1:0)-(perk(s,'firekeeper')?1:0),
 frust:(c==='削りすぎ'?3:0)+(active('COST')&&l('COST')===3?1:0),
 accident:1-(l('EFFICIENCY')?.1:0)-(l('EFFICIENCY')===3?.1:0)-(l('EFFICIENCY')&&s.upgrades.equipment===2?.08:0),
 utilities:1-(l('COST')?.08:0)-(l('COST')===3?.08:0)
 };
}
const api={styles,tags,level,rank,dominant,pointsFromHistory,award,combo,adjustedCost,benefit};
root.StrategyStyles=api;if(typeof module==='object')module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
