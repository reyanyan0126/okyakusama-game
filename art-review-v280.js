/* v2.8 original art review studio; local-only preview, never uploads or changes saves. */
(()=>{
'use strict';
const ROLES=[
 {id:'you',name:'主人公',file:'manga-cast-v200.svg',prefix:'manga-you-'},
 {id:'boss',name:'社長',file:'manga-cast-v200.svg',prefix:'manga-boss-'},
 {id:'manager',name:'店長',file:'portraits-v171.svg',prefix:'portrait-manager-'},
 {id:'worker',name:'従業員',file:'manga-cast-v200.svg',prefix:'manga-worker-'},
 {id:'customer',name:'常連客',file:'portraits-v171.svg',prefix:'portrait-mori-'}
];
const MOODS=[['normal','通常'],['happy','笑顔'],['angry','怒り'],['sad','悲しみ'],['panic','驚き']];
const FLAGS=[['identity','同一人物'],['expressions','表情が明確'],['style','線・塗り統一'],['anatomy','人体の破綻なし'],['transparentBackground','透明背景'],['phoneLegibility','スマホで鮮明']];
const TARGETS=new Map(),CANDIDATES=new Map(),MAX_BYTES=6*1024*1024,MIN_W=1024,MIN_H=1280;
let filter='all';
const $=id=>document.getElementById(id);
function node(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
function symbol(ref){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 100 120');svg.setAttribute('role','img');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href',ref);svg.append(use);return svg;
}
function status(target,message,state='empty'){
 target.card.dataset.state=state;target.status.textContent=message;
 target.status.classList.toggle('error',state==='invalid');
}
function qualified(target){
 if(!target.imageValid)return false;
 return [...target.flags.values()].every(x=>x.checked);
}
function counts(){
 const valid=[...TARGETS.values()].filter(t=>t.imageValid).length;
 const approved=[...TARGETS.values()].filter(qualified).length;
 $('assetCount').textContent=valid+' / 25';
 $('approvedCount').textContent=approved+' / 25';
}
function clearCandidate(target){
 if(target.url)URL.revokeObjectURL(target.url);
 target.url=null;target.imageValid=false;target.newImage.replaceChildren(node('span','portrait-placeholder','未登録'));
 for(const box of target.flags.values()){box.checked=false;box.disabled=true;}
 status(target,'新規原画：未登録');counts();
}
function makeCard(actor,mood){
 const key=actor.id+'-'+mood[0],card=node('article','portrait-card'),header=node('div','portrait-head');
 card.dataset.role=actor.id;card.dataset.state='empty';card.id='portrait-'+key;
 header.append(node('h3','',actor.name+'・'+mood[1]),node('span','portrait-tag',key));
 const pair=node('div','portrait-pair');
 const oldFigure=node('figure'),oldLabel=node('figcaption','','既存SVG'),oldFrame=node('div','portrait-frame');
 oldFrame.append(symbol('./assets/'+actor.file+'#'+actor.prefix+mood[0]));oldFigure.append(oldLabel,oldFrame);
 const newFigure=node('figure'),newLabel=node('figcaption','','新規原画候補'),newFrame=node('div','portrait-frame');
 newFrame.append(node('span','portrait-placeholder','未登録'));newFigure.append(newLabel,newFrame);
 pair.append(oldFigure,newFigure);
 const msg=node('p','portrait-status','新規原画：未登録');msg.setAttribute('role','status');
 const checks=node('div','review-flags');checks.setAttribute('aria-label',actor.name+'・'+mood[1]+'の目視評価');
 const flags=new Map();
 for(const [id,label] of FLAGS){
  const wrapper=node('label'),box=document.createElement('input');box.type='checkbox';box.disabled=true;
  box.setAttribute('aria-label',actor.name+'・'+mood[1]+'：'+label);
  box.addEventListener('change',()=>{if(qualified(target))status(target,'画像・目視条件クリア','ready');else if(target.imageValid)status(target,'画像条件OK・目視確認待ち','pending');counts();});
  wrapper.append(box,document.createTextNode(label));checks.append(wrapper);flags.set(id,box);
 }
 card.append(header,pair,msg,checks);
 const target={key,card,status:msg,newImage:newFrame,flags,imageValid:false,url:null,width:0,height:0};
 TARGETS.set(key,target);
 return card;
}
function filterItems(){
 for(const t of TARGETS.values())t.card.hidden=filter!=='all'&&t.card.dataset.role!==filter;
 for(const b of $('characterFilter').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.role===filter));
}
function build(){
 const root=$('portraitGrid'),bar=$('characterFilter');
 for(const [id,name] of [['all','全員'],...ROLES.map(r=>[r.id,r.name])]){
  const b=node('button','',name);b.type='button';b.dataset.role=id;b.setAttribute('aria-pressed',String(id==='all'));
  b.addEventListener('click',()=>{filter=id;filterItems();});bar.append(b);
 }
 for(const actor of ROLES)for(const mood of MOODS)root.append(makeCard(actor,mood));
 counts();
}
async function loadFile(file){
 const base=file.name.replace(/\.(png|webp)$/i,'');
 const t=TARGETS.get(base);
 if(!t)return {name:file.name,error:'命名規則に一致しません'};
 clearCandidate(t);
 const ext=(file.name.match(/\.(png|webp)$/i)||[])[1]?.toLowerCase();
 if(!ext){status(t,'PNGまたはWebPのみ','invalid');return {name:file.name,error:'非対応形式'};}
 if(file.size>MAX_BYTES){status(t,'容量が6MiBを超えています','invalid');return {name:file.name,error:'容量超過'};}
 const url=URL.createObjectURL(file);t.url=url;
 let natural;
 try{natural=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve({img,width:img.naturalWidth,height:img.naturalHeight});img.onerror=reject;img.src=url;});}
 catch(e){status(t,'画像を読み込めません','invalid');return {name:file.name,error:'画像破損'};}
 const {width,height,img}=natural;t.width=width;t.height=height;
 const ratio=width/height;
 if(width<MIN_W||height<MIN_H){status(t,'解像度不足：'+width+'×'+height,'invalid');return {name:file.name,error:'解像度不足'};}
 if(Math.abs(ratio-0.8)>0.06){status(t,'縦横比が4:5から外れています：'+width+'×'+height,'invalid');return {name:file.name,error:'比率不適合'};}
 t.newImage.replaceChildren(img);img.alt=t.key+'・新規原画候補';
 t.imageValid=true;
 for(const box of t.flags.values())box.disabled=false;
 status(t,'画像条件OK・目視確認待ち','pending');
 return {name:file.name,ok:true};
}
function exportManifest(){
 const approvedAssets=[...TARGETS.values()].filter(qualified).map(t=>t.key);
 const completed=approvedAssets.length===25;
 const manifest={
  version:'v2.8.0',status:completed?'ready':'draft',
  purpose:'Portrait review proposal. GitHub CI must verify asset files and independent final approval.',
  roles:ROLES.map(r=>r.id),moods:MOODS.map(m=>m[0]),minWidth:MIN_W,minHeight:MIN_H,maxFileBytes:MAX_BYTES,
  approvedAssets,
  humanReview:Object.fromEntries(FLAGS.map(([id])=>[id,completed])),
  reviewOnly:true
 };
 const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='art-review-proposal-v280.json';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 $('uploadStatus').textContent='審査結果JSONを出力しました。これは承認候補であり、正式なGitHub反映ではありません。';
}
function init(){
 if(!$('portraitGrid')||!$('candidateFiles'))return;
 build();
 $('candidateFiles').addEventListener('change',async e=>{
  const files=[...e.target.files].slice(0,60);
  let okay=0,invalid=0;
  for(const file of files){const res=await loadFile(file);res.ok?okay++:invalid++;}
  counts();
  $('uploadStatus').textContent='読み込み：適合 '+okay+'件、不適合 '+invalid+'件。透過・絵柄・顔の一貫性は目視確認してください。';
  e.target.value='';
 });
 $('exportReview').addEventListener('click',exportManifest);
 window.addEventListener('pagehide',()=>{for(const t of TARGETS.values())if(t.url)URL.revokeObjectURL(t.url);});
}
const API=Object.freeze({ROLES,MOODS,FLAGS,MIN_W,MIN_H,MAX_BYTES});
window.PortraitReviewV280=API;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();