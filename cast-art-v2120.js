/* v2.12 — illustrate every named main-cast portrait in the game, not just the gallery.
 * Artwork is presentation-only. SVG references stay in place for backward-compatible
 * gameplay/voice switching; a real image is painted over each legacy SVG use.
 * Five protagonist moods exist; other four have normal portraits only, so use
 * their normal image rather than deceptively inventing new expressions.
 */
(function(root){'use strict';
const NS='http://www.w3.org/2000/svg';
const MOODS=new Set(['normal','happy','angry','sad','panic']);
const IDS=Object.freeze({
 you:'manga-you-',boss:'manga-boss-',manager:'portrait-manager-',
 worker:'manga-worker-',customer:'portrait-mori-'
});
const assets=()=>root.CastGalleryArtV2110||{};
function identify(href){
 const fragment=String(href||'').split('#').pop();
 if(!fragment||!String(href).includes('#'))return null;
 for(const [role,prefix] of Object.entries(IDS)){
  if(fragment.startsWith(prefix)){
   const mood=fragment.slice(prefix.length);
   if(MOODS.has(mood))return {role,mood};
  }
 }
 return null;
}
function candidate(role,mood='normal'){
 const a=assets();
 const wanted=MOODS.has(mood)?mood:'normal';
 const key=role+'-'+wanted, fallback=role+'-normal';
 return a[key]||a[fallback]||null;
}
function paint(use){
 if(!use||use.namespaceURI!==NS||use.localName!=='use')return false;
 const name=use.getAttribute('href')||use.getAttribute('xlink:href');
 const who=identify(name);
 const existing=use.nextElementSibling;
 const replacement=existing?.localName==='image'&&existing.hasAttribute('data-cast-v2120')?existing:null;
 if(!who){
  if(replacement)replacement.remove();
  use.removeAttribute('data-cast-v2120');
  use.removeAttribute('visibility');
  return false;
 }
 const source=candidate(who.role,who.mood);
 if(!source)return false;
 const state=who.role+'-'+who.mood;
 if(use.getAttribute('data-cast-v2120')===state&&replacement)return true;
 const image=replacement||document.createElementNS(NS,'image');
 image.setAttribute('data-cast-v2120',state);
 // SVG <use> in comics can have explicit x/y/width/height; nested portrait
 // <svg>s supply their own viewBox instead, so default to full viewport.
 for(const k of ['x','y','width','height']){
  image.setAttribute(k,use.getAttribute(k)||(k==='width'||k==='height'?'100%':'0'));
 }
 image.setAttribute('preserveAspectRatio','xMidYMid meet');
 image.setAttribute('pointer-events','none');
 image.setAttribute('aria-hidden','true');
 image.setAttribute('href',source);
 if(!replacement)use.parentNode.insertBefore(image,use.nextSibling);
 use.setAttribute('visibility','hidden');
 use.setAttribute('data-cast-v2120',state);
 image.onerror=()=>{image.remove();use.removeAttribute('data-cast-v2120');use.removeAttribute('visibility');};
 return true;
}
function scan(rootNode){
 if(!rootNode)return 0;
 let count=0;
 if(rootNode.localName==='use'&&paint(rootNode))count++;
 if(rootNode.querySelectorAll){
  for(const use of rootNode.querySelectorAll('svg use[href],svg use[xlink\\:href]'))if(paint(use))count++;
 }
 return count;
}
function mount(){
 if(!root.document||!root.MutationObserver)return false;
 scan(document.documentElement);
 const watcher=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='attributes'){paint(record.target);continue;}
   for(const node of record.addedNodes)if(node.nodeType===1)scan(node);
  }
 });
 watcher.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href','xlink:href']});
 return true;
}
const API=Object.freeze({identify,candidate,paint,scan,mount});
root.CastArtV2120=API;
if(typeof module==='object'&&module.exports)module.exports=API;
if(root.document){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
