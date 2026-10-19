'use strict';
/* Public gallery of 25 existing SVG expressions — no save/game state changes. */
(()=>{
const cast=Object.freeze([
 {id:'you',name:'主人公',role:'経営コンサルタント',description:'貯金も時間も足りない。モグモグマートの再建を託され、難しい選択を迫られる。',asset:'manga-cast-v200.svg',prefix:'manga-you-'},
 {id:'boss',name:'社長',role:'モグモグマート経営者',description:'経営判断に口を出す人物。短期の数字と現場の事情、どちらを優先するか。',asset:'manga-cast-v200.svg',prefix:'manga-boss-'},
 {id:'manager',name:'店長',role:'店舗の責任者',description:'スタッフと売り場を守る現場の要。お客様の声と経営の板挟みになる。',asset:'portraits-v171.svg',prefix:'portrait-manager-'},
 {id:'worker',name:'従業員',role:'店舗スタッフ',description:'日々の接客と店舗運営を支えるメンバー。経営施策は働く人にも影響する。',asset:'manga-cast-v200.svg',prefix:'manga-worker-'},
 {id:'customer',name:'常連客・森さん',role:'お店を見守るお客様',description:'モグモグマートの変化を見届ける常連客。商売の数字だけでは測れない声を届ける。',asset:'portraits-v171.svg',prefix:'portrait-mori-'}
]);
const moods=Object.freeze([['normal','通常'],['happy','喜び'],['angry','怒り'],['sad','悲しみ'],['panic','驚き']]);
const $=id=>document.getElementById(id);
let actor=cast[0],mood=moods[0];
function artwork(item,moodId,label){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 100 120');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',label);
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href','./assets/'+item.asset+'#'+item.prefix+moodId);
 svg.append(use);return svg;
}
function show(){
 $('castName').textContent=actor.name;
 $('castRole').textContent=actor.role;
 $('castDescription').textContent=actor.description;
 $('castPortrait').replaceWith(Object.assign(artwork(actor,mood[0],actor.name+'・'+mood[1]),{id:'castPortrait'}));
 $('moodStatus').textContent=mood[1];
 for(const btn of document.querySelectorAll('.cast-button'))btn.setAttribute('aria-pressed',String(btn.dataset.id===actor.id));
 for(const btn of document.querySelectorAll('.mood-picks button'))btn.setAttribute('aria-pressed',String(btn.dataset.mood===mood[0]));
}
function init(){
 if(!$('castList')||!$('moodPicks'))return;
 const list=$('castList');
 for(const item of cast){
  const btn=document.createElement('button');btn.type='button';btn.className='cast-button';btn.dataset.id=item.id;
  const thumb=document.createElement('span');thumb.className='cast-thumb';thumb.append(artwork(item,'normal',item.name));
  const labels=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
  strong.textContent=item.name;small.textContent=item.role;labels.append(strong,small);btn.append(thumb,labels);
  btn.addEventListener('click',()=>{actor=item;mood=moods[0];show();});
  list.append(btn);
 }
 for(const current of moods){
  const btn=document.createElement('button');btn.type='button';btn.dataset.mood=current[0];btn.textContent=current[1];
  btn.addEventListener('click',()=>{mood=current;show();});
  $('moodPicks').append(btn);
 }
 show();
}
window.CastGalleryV2100=Object.freeze({cast,moods});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();