/* v2.1 — distinct finished-art presentations outside the preserved outcome three-panel sheet.
 * No changes to game state, RNG, bookkeeping, persistence, or story outcomes.
 */
(function(){
'use strict';
const IMAGES={
  thinking:'./assets/illustrated-protagonist-thinking-v173.webp',
  ready:'./assets/illustrated-protagonist-determined-v173.webp',
  normal:'./assets/illustrated-protagonist-v173.webp'
};
const $=selector=>document.querySelector(selector);
function photo(src,alt,classes=''){
 const image=document.createElement('img');
 image.src=src;image.alt=alt;image.className=classes;image.decoding='async';image.loading='lazy';
 return image;
}
function banner(title,body,src,kind){
 const section=document.createElement('section');
 section.className='new-art-banner new-art-banner-'+kind;
 const picture=photo(src,title+'の一場面','new-art-banner-img');
 section.appendChild(picture);
 const words=document.createElement('div');words.className='new-art-banner-copy';
 const strong=document.createElement('strong');strong.textContent=title;
 const small=document.createElement('p');small.textContent=body;
 words.append(strong,small);section.appendChild(words);
 return section;
}
function mount(){
 const title=$('#titleScreen .title-visual');
 if(title){
  title.replaceChildren(banner('はじめての依頼','残高28,000円。顧客の信頼と、あなたの生活がかかっている。',IMAGES.thinking,'cover'));
  title.classList.add('v210-illustrated-cover');
 }
 const contract=$('#contractsScreen .contract-item.available');
 if(contract){
  const look=banner('CLIENT FILE 001','町のスーパー・モグモグマート。30週間で再建できるか。',IMAGES.ready,'contract');
  contract.insertBefore(look,contract.firstChild);
 }
 const hero=$('#officeView .office-hero');
 if(hero&&!hero.querySelector('.new-office-person')){
  hero.appendChild(photo(IMAGES.ready,'経営再建の方針を考えるコンサルタント','new-office-person'));
 }
 const voice=$('#voiceView .scene-heading');
 if(voice)voice.insertAdjacentElement('afterend',
  banner('世間は見ている','一度の成功より、積み重ねた信頼が店を支える。',IMAGES.normal,'voice'));
 const records=$('#recordsView .scene-heading');
 if(records)records.insertAdjacentElement('afterend',
  banner('数字と向き合う','会社の利益と、あなたの財布。両方を記録する。',IMAGES.thinking,'records'));
 const report=$('#reportScene .report-sheet');
 if(report)report.insertBefore(banner('WEEKLY REPORT','現場の結果を、数字でも確かめる。',IMAGES.ready,'report'),report.firstChild);
 // Do not inject visual elements into #outcomeScene: its three-panel composition stays intact.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
