/* v2.5 illustrated live store status. The game engine, history and save remain untouched. */
(function(root){'use strict';
const SCENES=Object.freeze({
 normal:Object.freeze({id:'scene-normal',heading:'いつものモグモグマート',detail:'売り場は通常営業。今週の判断を待っています。'}),
 boom:Object.freeze({id:'scene-boom',heading:'今週は大盛況！',detail:'お客様の満足度とお店への信頼が高まっています。'}),
 slump:Object.freeze({id:'scene-slump',heading:'売り場に少し暗い影',detail:'資金不足や満足度の低下が、店の空気にも表れています。'}),
 fire:Object.freeze({id:'scene-fire',heading:'お店は炎上対応中',detail:'まずはお客様の不満と評判の悪化に向き合う必要があります。'})
});
function sceneFor({fire=0,sat=0,rep=0,cash=0}={}){
 if(fire>=45)return 'fire';
 if(cash<120000||sat<42)return 'slump';
 if(sat>=75&&rep>=70)return 'boom';
 return 'normal';
}
function readMetrics(){
 const content=id=>document.getElementById(id)?.textContent||'';
 const value=id=>parseFloat(content(id).replace(/,/g,''))||0;
 return {fire:value('heatCount'),sat:value('dashSat'),rep:value('repCount'),cash:Math.round(value('cashCount')*10000)};
}
function create(){
 const figure=document.createElement('figure');
 figure.id='storeWeatherV250';figure.className='store-weather-v250';
 figure.setAttribute('aria-label','経営状況とともに変わるモグモグマートの情景');
 const art=document.createElementNS('http://www.w3.org/2000/svg','svg');
 art.setAttribute('viewBox','0 0 720 400');art.setAttribute('preserveAspectRatio','xMidYMid meet');
 art.setAttribute('role','img');art.setAttribute('aria-label',SCENES.normal.heading);
 art.classList.add('store-weather-art-v250');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href','./assets/store-scenes-v250.svg#scene-normal');use.setAttribute('width','720');use.setAttribute('height','400');
 art.append(use);
 const caption=document.createElement('figcaption');caption.className='store-weather-copy-v250';
 const label=document.createElement('strong');label.className='store-weather-name-v250';
 const detail=document.createElement('p');detail.className='store-weather-detail-v250';
 caption.append(label,detail);figure.append(art,caption);
 return {figure,art,use,label,detail};
}
function mount(){
 const office=document.querySelector('#officeView .decision-card');
 if(!office||document.getElementById('storeWeatherV250'))return;
 const built=create();
 // Place after the weekly decision actions. Never push primary buttons underneath the sticky bottom nav.
 office.insertAdjacentElement('afterend',built.figure);
 let previous='';
 function refresh(){
  const id=sceneFor(readMetrics());
  if(id===previous)return;
  previous=id;const s=SCENES[id];
  built.figure.dataset.scene=id;
  built.use.setAttribute('href','./assets/store-scenes-v250.svg#'+s.id);
  built.art.setAttribute('aria-label',s.heading);
  built.label.textContent=s.heading;built.detail.textContent=s.detail;
 }
 const observer=new MutationObserver(refresh);
 for(const id of ['heatCount','dashSat','repCount','cashCount']){
  const node=document.getElementById(id);
  if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});
 }
 refresh();
}
const api=Object.freeze({sceneFor,SCENES,mount});
root.StoreScenesV250=api;
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
