/* v2.6 milestone A: inspect 5 actors × 5 completed vector expressions.
 * Only whole-character images; no hair, face or limbs composed with CSS.
 * Stage direction is presentational and never updates game state.
 */
(function(root){'use strict';
const Cast=(typeof module==='object'&&module.exports)?require('./cast-director-v220.js'):root.CharacterCastV220;
const LABELS=Object.freeze({normal:'通常',happy:'喜び',angry:'怒り',sad:'悲しみ',panic:'驚き'});
const MOODS=Object.freeze(['normal','happy','angry','sad','panic']);
const SETTINGS=Object.freeze({
 office:{name:'事務所',timing:420},
 shop:{name:'売り場',timing:450},
 staff:{name:'従業員との対話',timing:460},
 press:{name:'取材・記者会見',timing:520},
 bento:{name:'商品の開発',timing:430}
});
function stageFor(kind='shop',mood='normal',tier='success'){
 const key=Object.hasOwn(SETTINGS,kind)?kind:'shop';
 const feeling=MOODS.includes(mood)?mood:'normal';
 return Object.freeze({kind:key,mood:feeling,duration:SETTINGS[key].timing,tier:['failure','success','great'].includes(tier)?tier:'success'});
}
function makeButton(mood,active){
 const button=document.createElement('button');
 button.type='button';button.className='cast-v260-mood';
 button.dataset.mood=mood;
 button.textContent=LABELS[mood];
 button.setAttribute('aria-pressed',String(active));
 button.setAttribute('aria-label',LABELS[mood]+'の表情を表示');
 return button;
}
function enhanceCard(card,person){
 if(card.dataset.expressionsReady==='true')return;
 const svg=card.querySelector('svg.cast-v220-portrait'),use=svg?.querySelector('use');
 if(!use)return;
 const img=card.querySelector('.cast-v220-picture');
 if(img)img.setAttribute('aria-label',person.label+'の表情イラスト');
 svg.setAttribute('aria-label',person.label+'・通常');
 svg.setAttribute('focusable','false');
 const tools=document.createElement('div');tools.className='cast-v260-tools';
 const title=document.createElement('strong');title.className='cast-v260-caption';title.textContent='表情を選ぶ';
 const buttons=document.createElement('div');buttons.className='cast-v260-moods';
 buttons.setAttribute('role','group');buttons.setAttribute('aria-label',person.label+'の表情切り替え');
 for(const mood of MOODS)buttons.append(makeButton(mood,mood==='normal'));
 const feedback=document.createElement('span');feedback.className='cast-v260-current';
 feedback.textContent='通常';feedback.setAttribute('aria-live','off');
 tools.append(title,buttons,feedback);
 card.append(tools);
 function change(mood){
  if(!MOODS.includes(mood))return;
  // Complete external vector portrait. Never substitute the low-resolution WebP atlas.
  use.setAttribute('href',Cast.portraitRef(person.id,mood));
  svg.setAttribute('aria-label',person.label+'・'+LABELS[mood]);
  feedback.textContent=LABELS[mood];
  card.dataset.mood=mood;
  for(const button of buttons.querySelectorAll('button')){
   button.setAttribute('aria-pressed',String(button.dataset.mood===mood));
  }
  if(!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
   svg.classList.remove('cast-v260-switch');
   // Restart the one-shot whole-portrait fade only.
   void svg.getBoundingClientRect().width;
   svg.classList.add('cast-v260-switch');
  }
 }
 buttons.addEventListener('click',e=>{
  const button=e.target.closest('button[data-mood]');
  if(button&&buttons.contains(button))change(button.dataset.mood);
 });
 card.dataset.expressionsReady='true';
 card.dataset.mood='normal';
}
function mount(){
 const gallery=document.getElementById('castGalleryV220');
 if(!gallery||gallery.dataset.moodGalleryReady==='true'||!Cast)return false;
 for(const person of Cast.CAST){
  const card=gallery.querySelector('.cast-v220-'+person.id);
  if(card)enhanceCard(card,person);
 }
 gallery.dataset.moodGalleryReady='true';
 return true;
}
const API=Object.freeze({LABELS,MOODS,SETTINGS,stageFor,mount});
root.CastCinemaV260=API;
if(typeof module==='object'&&module.exports)module.exports=API;
if(typeof document!=='undefined'){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
}
})(typeof window!=='undefined'?window:globalThis);
