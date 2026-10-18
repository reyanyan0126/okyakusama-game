/* v1.7.3: large, unambiguous single-object icons, no tiny character scenes. */
(function(root){
'use strict';
const explicit={
 raise:'price',lower:'discount',shrink:'scale',cheap:'food',quality:'leaf',staff:'people',
 explain:'chat',sale:'sale',points:'coins',pop:'megaphone',tasting:'spoon',
 local:'store',restorestaff:'people',apology:'apology',recall:'box',
 blame:'warning',loyalty:'heart',stamp:'sale',audit:'receipt',maintenance:'wrench',
 loan:'bank',airtax:'price',photo:'camera',ceocut:'coins',bills:'receipt',
 apologybot:'robot',fix_equipment:'wrench',fix_people:'people',fix_fans:'heart',
 arc_register_boss:'coins',arc_register_pay:'receipt',arc_register_machine:'robot',arc_register_graduation:'people',
 arc_bento_real:'food',arc_bento_camera:'camera',arc_bento_chef:'spoon',arc_bento_label:'price',
 arc_staff_listen:'chat',arc_staff_robot:'robot',arc_staff_pizza:'food',arc_staff_resign:'warning',
 arc_media_open:'camera',arc_media_fake:'camera',arc_media_ignore:'warning',arc_media_silence:'chat',
 arc_festival_locals:'store',arc_festival_parade:'megaphone',arc_festival_free:'coins',arc_festival_fee:'price',
 arc_finale_team:'people',arc_finale_steal:'coins',arc_finale_vote:'checklist',arc_finale_contract:'receipt'
};
const hints=[
 [/equipment|robot|repair|machine|freezer|maintenance/,'wrench'],
 [/staff|worker|employee|people|labor|shift/,'people'],
 [/press|photo|media|film|news|camera/,'camera'],
 [/advert|pop|promotion|festival|public|stunt/,'megaphone'],
 [/apolog|sorry|misunderstanding|admit/,'apology'],
 [/audit|inspect|account|record|open|explain/,'receipt'],
 [/trust|fan|customer|loyal|kind|listen/,'heart'],
 [/cash|budget|profit|loan|fund|pay|money|credit/,'coins'],
 [/meal|food|bento|quality|tast|recipe/,'food'],
 [/safety|clean|secure|risk/,'shield'],
 [/sale|discount|stamp|price|special|coupon/,'sale']
];
function key(actionId){
 const id=String(actionId||'');
 if(Object.prototype.hasOwnProperty.call(explicit,id))return explicit[id];
 for(const [pattern,icon]of hints)if(pattern.test(id))return icon;
 return 'checklist';
}
function markup(actionId){
 const icon=key(actionId);
 return '<svg class="policy-symbol" viewBox="0 0 80 80" focusable="false" aria-hidden="true"><use href="./assets/policy-icons-v173.svg#icon-'+icon+'"></use></svg>';
}
const api={key,markup,explicit};
root.PolicySymbols=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
