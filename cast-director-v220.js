/* お客様のために。 v2.2.0 A — cast identities and emotional direction.
 * Presentation only; no game-state writes, RNG, or CSS-assembled human anatomy.
 */
(function(root){'use strict';
const CAST=Object.freeze([
 Object.freeze({id:'you',label:'主人公',role:'経営コンサルタント',description:'数字と現場のあいだで再建を判断する。',base:'./assets/manga-cast-v200.svg#manga-you-'}),
 Object.freeze({id:'boss',label:'社長',role:'依頼主',description:'利益と世間体を気にかける経営者。',base:'./assets/manga-cast-v200.svg#manga-boss-'}),
 Object.freeze({id:'manager',label:'店長',role:'現場の責任者',description:'スタッフとお客様の声を受け止める。',base:'./assets/portraits-v171.svg#portrait-manager-'}),
 Object.freeze({id:'worker',label:'従業員',role:'店舗スタッフ',description:'売り場と日々の接客を支える。',base:'./assets/manga-cast-v200.svg#manga-worker-'}),
 Object.freeze({id:'customer',label:'常連客',role:'街の人たちの代表',description:'お店の変化を長く見守っている。',base:'./assets/portraits-v171.svg#portrait-mori-'})
]);
const lookup=Object.fromEntries(CAST.map(p=>[p.id,p]));
const MOODS=Object.freeze(['normal','happy','angry','sad','panic']);
function expression(text,index=0,tier='success'){
 const s=String(text??'');
 if(tier==='failure'&&index===2)return 'sad';
 if(tier==='great'&&index===2)return 'happy';
 // Sentiment over punctuation: an exclamation is not necessarily anger.
 if(/怒|許さ|反対|責任逃れ|ふざけ|裏切|嘘をつ|腹立|不買|激怒/.test(s))return 'angry';
 if(/困|危機|誰が|心配|大変|どうしよう|まさか|え[っ！]?？|本当[に]?？|大丈夫[？?]/.test(s))return 'panic';
 if(/減少|損失|厳し|無理|残念|悲し|失敗|足りな|売れな|落胆|倒産|閉店/.test(s))return 'sad';
 if(/ありがとう|感謝|順調|よかった|良かった|嬉し|成功|助かっ|最高|うまくいっ|笑顔|楽しい|おめでとう/.test(s))return 'happy';
 return ['normal','normal','happy'][Math.max(0,Number(index)||0)%3];
}
function portraitRef(role,mood='normal'){
 const p=lookup[role]||lookup.manager;
 return p.base+(MOODS.includes(mood)?mood:'normal');
}
function createPortrait(p){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 100 120');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',p.label+'・通常の表情');svg.classList.add('cast-v220-portrait');
 const use=document.createElementNS('http://www.w3.org/2000/svg','use');
 use.setAttribute('href',portraitRef(p.id));svg.append(use);return svg;
}
function mount(){
 const view=document.querySelector('#voiceView');
 if(!view||document.querySelector('#castGalleryV220'))return;
 const panel=document.createElement('details');panel.id='castGalleryV220';panel.className='cast-v220-gallery';
 const summary=document.createElement('summary');summary.textContent='登場人物を見る';
 summary.setAttribute('aria-label','経営に関わる5人の登場人物を表示');
 const intro=document.createElement('p');intro.className='cast-v220-intro';
 intro.textContent='再建を動かす人たち。表情や立場の違いにも注目。';
 const grid=document.createElement('div');grid.className='cast-v220-grid';
 for(const p of CAST){
  const card=document.createElement('article');card.className='cast-v220-card cast-v220-'+p.id;
  const pic=document.createElement('div');pic.className='cast-v220-picture';pic.append(createPortrait(p));
  const words=document.createElement('div');words.className='cast-v220-words';
  const name=document.createElement('strong');name.textContent=p.label;
  const label=document.createElement('small');label.textContent=p.role;
  const desc=document.createElement('p');desc.textContent=p.description;
  words.append(name,label,desc);card.append(pic,words);grid.append(card);
 }
 panel.append(summary,intro,grid);
 const anchor=view.querySelector('.scene-v211-voice')||view.querySelector('.voice-top-card')||view.querySelector('.scene-heading');
 if(anchor)anchor.insertAdjacentElement('afterend',panel);else view.append(panel);
}
const api=Object.freeze({CAST,MOODS,expression,portraitRef,mount});
root.CharacterCastV220=api;
if(typeof module==='object'&&module.exports)module.exports=api;
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
