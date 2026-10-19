/* v2.1.1: scene-specific graphic storytelling, without CSS-assembled human anatomy.
 * These visuals are separate from the financial engine and never mutate game state.
 */
(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg',q=s=>document.querySelector(s);
const frame=(sky,land,extra)=>'<rect width="720" height="350" fill="'+sky+'"/><rect y="249" width="720" height="101" fill="'+land+'"/>'+extra;
const portrait=(file,name,x,y,size)=>'<use href="./assets/'+file+'#'+name+'" x="'+x+'" y="'+y+'" width="'+size+'" height="'+size*1.2+'"/>';
const speech=(x,y,w,t)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="45" rx="18" fill="#fffbf1" stroke="#537f72" stroke-width="3"/><path d="M'+(x+20)+' '+(y+45)+'l-8 18 28-18" fill="#fffbf1" stroke="#537f72" stroke-width="3"/><text x="'+(x+w/2)+'" y="'+(y+29)+'" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="bold" fill="#355d53">'+t+'</text>';
const drawing={
 cover:frame('#f5ddbb','#987961','<circle cx="591" cy="66" r="52" fill="#ffedb1"/><path d="M0 143h720v106H0z" fill="#c1d7bf"/><path d="M86 118L210 38l129 80v151H86z" fill="#ffefd1" stroke="#795847" stroke-width="7"/><rect x="101" y="133" width="218" height="44" fill="#c77960"/><rect x="117" y="183" width="70" height="86" fill="#96bbc0"/><rect x="213" y="183" width="89" height="86" fill="#b8d5cd"/><path d="M0 294H720" stroke="#e1c59d" stroke-width="9"/><rect x="347" y="81" width="319" height="204" rx="15" fill="#f9f3e8" stroke="#aa8c6b" stroke-width="8"/><path d="M375 122h210m-210 34h160m-160 34h222" stroke="#a5b3a5" stroke-width="9" stroke-linecap="round"/><circle cx="624" cy="229" r="22" fill="#dba17b"/>'+portrait('manga-cast-v200.svg','manga-you-normal',440,101,154)),
 contract:frame('#d0e3dd','#c7ad8d','<circle cx="584" cy="48" r="40" fill="#fff3c9"/><path d="M32 209L148 86l116 123" fill="#faf1dc" stroke="#456e67" stroke-width="10"/><rect x="65" y="201" width="169" height="83" fill="#f6e4c2" stroke="#456e67" stroke-width="7"/><path d="M59 215h181" stroke="#c77a64" stroke-width="22"/><path d="M71 214v25m35-25v25m35-25v25m35-25v25" stroke="#fff8dd" stroke-width="6"/><rect x="119" y="244" width="57" height="40" fill="#7eaca0"/><rect x="305" y="48" width="350" height="259" rx="17" fill="#fff9ed" stroke="#68897b" stroke-width="7"/><path d="M346 101h215m-215 40h193m-193 40h153m-153 40h201" stroke="#d0c2a6" stroke-width="13" stroke-linecap="round"/><circle cx="601" cy="252" r="25" fill="#a3c6ad" stroke="#648c73" stroke-width="5"/><path d="M591 252l9 9 17-23" stroke="#fffefa" stroke-width="7" fill="none"/>'),
 voice:frame('#e3f0e4','#abc3ae','<circle cx="570" cy="60" r="35" fill="#fff1c6"/><path d="M0 251h720" stroke="#6d9c8c" stroke-width="9"/><rect x="35" y="83" width="650" height="210" rx="22" fill="#fcf8ee" stroke="#c8c5ab" stroke-width="8"/>'+portrait('portraits-v171.svg','portrait-mori-happy',76,108,150)+portrait('portraits-v171.svg','portrait-manager-normal',283,108,150)+portrait('portraits-v171.svg','portrait-saito-sad',496,108,150)+speech(43,29,163,'また来たい！')+speech(266,29,170,'改善しよう')+speech(489,29,185,'値上げは困る')),
 records:frame('#e1ebe3','#c3a787','<rect x="74" y="37" width="566" height="270" rx="14" fill="#fcf9ee" stroke="#6c8179" stroke-width="10"/><path d="M121 84h238m-238 39h175m-175 39h203" stroke="#b1b7a5" stroke-width="12" stroke-linecap="round"/><path d="M108 218h448" stroke="#dcc5a0" stroke-width="4"/><rect x="142" y="235" width="43" height="51" rx="5" fill="#89b8ac"/><rect x="222" y="203" width="43" height="83" rx="5" fill="#a7c7a1"/><rect x="302" y="176" width="43" height="110" rx="5" fill="#e5bc73"/><rect x="382" y="138" width="43" height="148" rx="5" fill="#d48c6d"/><rect x="462" y="110" width="43" height="176" rx="5" fill="#539586"/><circle cx="573" cy="112" r="43" fill="#d6b977" stroke="#a98b52" stroke-width="7"/><text x="573" y="128" text-anchor="middle" font-size="44" font-weight="900" fill="#fff8e3">¥</text>'),
 decision:frame('#e3efe6','#c4ad8d','<rect x="37" y="35" width="345" height="258" rx="12" fill="#fffdf4" stroke="#678f7c" stroke-width="9"/><path d="M77 101h260m-260 38h220m-220 38h236" stroke="#acc0ad" stroke-width="13" stroke-linecap="round"/><path d="M90 256l66-55 68 30 98-76" fill="none" stroke="#cb895d" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'+portrait('portraits-v171.svg','portrait-manager-happy',425,73,162)+speech(382,18,266,'今週の方針は？')),
 ledger:frame('#dfebe1','#d2bb96','<rect x="81" y="21" width="558" height="299" rx="12" fill="#fff9ea" stroke="#648779" stroke-width="10"/><path d="M107 83h496M107 139h496M107 195h496M107 251h496" stroke="#d2cdbb" stroke-width="5"/><path d="M289 73v233M453 73v233" stroke="#d2cdbb" stroke-width="4"/><path d="M132 109h110m-110 56h110m-110 56h110m-110 56h110" stroke="#73998a" stroke-width="9" stroke-linecap="round"/><path d="M332 112h85m-85 56h85m-85 56h85" stroke="#e2b46e" stroke-width="9" stroke-linecap="round"/><path d="M491 112h85m-85 56h85m-85 56h85" stroke="#cf8872" stroke-width="9" stroke-linecap="round"/><rect x="490" y="264" width="89" height="37" rx="9" fill="#3e8272"/><path d="M511 283l14 10 27-25" stroke="#fff" stroke-width="8" fill="none"/>'),
 status:frame('#deece6','#c6b496','<rect x="54" y="45" width="323" height="245" rx="15" fill="#fffcf1" stroke="#668c80" stroke-width="8"/><path d="M90 94h249m-249 42h249" stroke="#b4cabb" stroke-width="12" stroke-linecap="round"/><rect x="98" y="210" width="54" height="48" rx="6" fill="#90bca6"/><rect x="181" y="176" width="54" height="82" rx="6" fill="#e0be81"/><rect x="266" y="155" width="54" height="103" rx="6" fill="#cc9071"/>'+portrait('manga-cast-v200.svg','manga-you-normal',433,53,160)+speech(388,16,279,'経営指標を確認')),
 money:frame('#e7ecdf','#b3a083','<path d="M92 95h370v199H92z" fill="#fffcf2" stroke="#9c9b7b" stroke-width="8"/><path d="M127 143h290m-290 35h230m-230 35h275" stroke="#bac8b7" stroke-width="12" stroke-linecap="round"/><rect x="476" y="135" width="167" height="143" rx="19" fill="#d6ae73" stroke="#685c48" stroke-width="9"/><rect x="516" y="178" width="137" height="57" rx="15" fill="#f9eacc" stroke="#685c48" stroke-width="7"/><circle cx="545" cy="208" r="14" fill="#8aa99b"/><circle cx="550" cy="74" r="49" fill="#e9c86e" stroke="#a17d43" stroke-width="7"/><text x="550" y="92" text-anchor="middle" font-size="54" font-weight="900" fill="#735c39">¥</text>'),
 rescue:frame('#f5e4d7','#a88b83','<path d="M30 264l128-205 128 205" fill="#f8e7ba" stroke="#ae674f" stroke-width="14"/><path d="M158 131v65" stroke="#ae674f" stroke-width="17" stroke-linecap="round"/><circle cx="158" cy="225" r="10" fill="#ae674f"/><rect x="322" y="77" width="337" height="220" rx="16" fill="#fff9eb" stroke="#b67960" stroke-width="9"/><path d="M358 126h264m-264 49h190" stroke="#d9beaf" stroke-width="13" stroke-linecap="round"/><path d="M395 251l55-55 51 29 67-71" stroke="#c17d69" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
};
function makeScene(kind,label){
 const wrapper=document.createElement('div');wrapper.className='scene-v211 scene-v211-'+kind;
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 720 350');svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.setAttribute('role','img');svg.setAttribute('aria-label',label);svg.innerHTML=drawing[kind];
 wrapper.append(svg);return wrapper;
}
function insertAfter(target,node){if(target)target.insertAdjacentElement('afterend',node)}
function mount(){
 const title=q('#titleScreen .title-visual');
 if(title){title.replaceChildren(makeScene('cover','開店前の商店と経営コンサルタントの情景'));title.classList.remove('v210-illustrated-cover')}
 const contract=q('#contractsScreen .contract-item.available');
 if(contract){const old=contract.querySelector('.new-art-banner');if(old)old.remove();contract.insertBefore(makeScene('contract','再建が必要な店と依頼書'),contract.firstChild)}
 const office=q('#officeView .office-hero');if(office){office.querySelectorAll('.new-office-person').forEach(n=>n.remove());office.classList.add('scene-v211-office')}
 const viewScene=(sel,kind,label)=>{const heading=q(sel+' .scene-heading');const old=heading?.nextElementSibling;if(old?.classList.contains('new-art-banner'))old.remove();insertAfter(heading,makeScene(kind,label))};
 viewScene('#voiceView','voice','常連客・店長・買い物客の三者三様の声');
 viewScene('#recordsView','records','数字を記録した経営帳簿と売上グラフ');
 const proposal=q('#proposalSheet .proposal-top');
 insertAfter(proposal,makeScene('decision','ホワイトボードで週の戦略を相談する会議'));
 const report=q('#reportScene .report-sheet');
 if(report){report.querySelectorAll('.new-art-banner').forEach(n=>n.remove());report.insertBefore(makeScene('ledger','今週の経営結果をまとめた収支報告書'),report.firstChild)}
 insertAfter(q('#statusSheet .status-head'),makeScene('status','経営状況を調査するコンサルタントと棒グラフ'));
 insertAfter(q('#moneySheet .money-sheet-top'),makeScene('money','伝票と財布を並べた会計説明'));
 insertAfter(q('#rescueScene .rescue-kicker'),makeScene('rescue','経営危機の警告と資金回復グラフ'));
 const painting=q('#prologuePainting'),counter=q('#prologueCounter');
 if(painting&&counter){
  const symbol=document.createElement('div');symbol.className='v211-story-item';painting.append(symbol);
  const icons=['wallet','home','store','people','people','bill','devil'];
  const update=()=>{const i=Math.max(0,Math.min(icons.length-1,(parseInt(counter.textContent,10)||1)-1));symbol.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#art-'+icons[i]+'"></use></svg>'};
  update();new MutationObserver(update).observe(counter,{childList:true,characterData:true,subtree:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
