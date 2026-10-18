/* v0.9.6: Presentation-only visual state; never mutates saved game finances. */
(function(root){'use strict';
const safeNumber=value=>Number.isFinite(Number(value))?Number(value):0;
function describe(s){
 const cash=safeNumber(s.cash),wallet=safeNumber(s.personalCash),rep=safeNumber(s.storeRep),fire=safeNumber(s.fire),sat=safeNumber(s.sat),frust=safeNumber(s.frust);
 const closed=Boolean(s.bankrupt);
 let store='normal';
 if(closed)store='closed';
 else if(fire>=55)store='scandal';
 else if(cash<80000 || rep<28)store='critical';
 else if(cash<170000 || rep<50 || sat<48 || frust>=55)store='quiet';
 else if(cash>=300000 && rep>=68 && sat>=65 && frust<=45)store='busy';
 const rootIssue=s.rootCause==='equipment' && s.rootSolved===false ? 'repair' : 'none';
 const invoiceWeight=(wallet<17000?1:0)+(cash<120000?1:0)+(safeNumber(s.arrears)>0?2:0);
 const bills=Math.max(0,Math.min(3,invoiceWeight));
 const office=wallet>=100000 && cash>=320000 && rep>=58 && !s.personalFailed?'upgraded':'ordinary';
 const devil=Array.isArray(s.pacts)&&s.pacts.length>0;
 const words={closed:'シャッターが下りた',scandal:'抗議の声が店先に',critical:'売り場は閑散としている',quiet:'客足が伸び悩んでいる',normal:'何とか営業を続けている',busy:'常連が戻り、店が賑わう'};
 let note='現場：'+words[store];
 if(store!=='closed'&&store!=='scandal'&&s.rootSolved===true&&s.rootCause&&s.rootCause!=='legacy')note+='・改善が効いている';
 if(closed)note+='。再建は失敗';
 return {store,bills,office,devil,rootIssue,note,description:'現場は'+words[store]+'。'+(bills>=2?'事務所には未払い請求書が積み上がっている。':'')+(devil?'悪魔の契約が有効。':'')+(office==='upgraded'?'事務所に観葉植物が置かれている。':'')};
}
const exported={describe};
if(typeof module!=='undefined'&&module.exports)module.exports=exported;
root.OfficeScene=exported;
})(typeof window!=='undefined'?window:globalThis);
/* v1.4.0: original layered comic scenes. Pure presentation: no RNG or finance writes. */
(function(root){'use strict';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setting(id){
 if(/robot|apologybot|machine/.test(id))return 'robot';
 if(/camera|photo|fake/.test(id))return 'photo';
 if(/parade/.test(id))return 'parade';
 if(/steal/.test(id))return 'credit';
 if(/media|audit|explain/.test(id))return 'press';
 if(/register_boss/.test(id))return 'register';
 if(/staff|people|listen|resign|graduation/.test(id))return 'staff';
 if(/bento|quality|tasting|cheap|shrink/.test(id))return 'bento';
 if(/maintenance|equipment/.test(id))return 'repair';
 if(/office|intro|finale|ceocut|loan|bills|contract/.test(id))return 'office';
 if(/festival/.test(id))return 'festival';
 return 'shop';
}
const captions={register:['社長「私がレジを指揮する！」','店長「まず商品を、こちらへ…」','従業員「次のお客様、どうぞ」'],robot:['社長「休憩も有給も不要だ！」','店長「お客様、その機械はまだ研修中です」','従業員「人間の出番、まだありますね」'],photo:['社長「もっと大きく写せないか？」','従業員「実物との距離が開いています」','店長「写真と売り場、見比べないで…」'],parade:['社長「主役の登場だ！」','店長「売り場は誰が見るんですか」','常連「今日は何のお祭り？」'],credit:['店長「みんなで積み上げた成果です」','社長「つまり私の指導力だね」','従業員「拍手にも体力が要りますね」'],press:['記者「現場のお話も聞かせてください」','社長「私の写真はこの角度で」','店長「数字は、そのままお伝えします」'],staff:['店長「今日は、最後まで話を聞こう」','従業員「現場のことを知ってほしいです」','あなたは、二人の話をメモに残した'],bento:['従業員「お弁当、準備していきます」','店長「見た目も中身も確認を」','常連「今日のお昼、どうしようかな」'],repair:['店長「まずは現場の点検から」','従業員「冷蔵庫の音、いつもと違います」','あなたは修理の進み具合を確かめた'],office:['あなたは帳簿を開いた','店長「店と私生活、財布は別ですよ」','社長「私の夢も経費になりますか？」'],festival:['従業員「屋台の準備、できました」','店長「町の人にも声をかけよう」','常連「いつもの店が賑やかね」'],shop:['店長「今週の方針を共有します」','従業員「売り場から変えていきましょう」','常連が、棚の前で足を止めた']};
function person(role,x,y,mood='normal',pose='idle',scale=1){
 const boss=role==='boss',manager=role==='manager',you=role==='you',customer=role==='customer';
 const hair=boss?'#594038':manager?'#343747':customer?'#735044':'#363f50';
 const shirt=boss?'#c9a158':manager?'#538a82':you?'#536581':customer?'#d58a7a':'#dcad61';
 const eyes=mood==='joy'?'<path d="M-13 -27q4 -7 8 0m10 0q4 -7 8 0"/>':mood==='down'?'<path d="M-13 -25l8 2m10 0l8 -2"/>':'<path d="M-10 -29v5m20 -5v5"/>';
 const brow=mood==='anger'?'<path d="M-15 -36l10 4m10 0l10 -4"/>':mood==='worry'?'<path d="M-14 -33l9 -5m10 0l9 5"/>':'';
 const mouth=mood==='joy'?'<path d="M-7 -17q7 12 14 0Z" fill="#a4554d"/>':mood==='worry'?'<ellipse cx="0" cy="-16" rx="4" ry="5" fill="#a4554d"/>':mood==='down'||mood==='anger'?'<path d="M-6 -14q6 -5 12 0"/>':'<path d="M-6 -17q6 4 12 0"/>';
 return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="cast cast-${role} mood-${mood} pose-${pose}" stroke="#403a3c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="0" cy="68" rx="30" ry="5" fill="#463a3320" stroke="none"/><path d="M-14 39l-3 26h12l6-26m6 0l4 26h12l-4-26" fill="#3b4655"/><path d="M-20 1q20-10 40 0l5 43h-50Z" fill="${shirt}"/><path d="M-7 -2l7 14 7-14" fill="#fff9e9"/>${boss?'<path d="M0 10l-4 19 5 5 4-6Z" fill="#873d42"/>':manager||role==='worker'?'<path d="M-14 13h28v30h-28Z" fill="#eee1b9"/><path d="M-8 25h16v10h-16Z" fill="#d2c197"/>':''}<g class="arm arm-left"><path d="M-21 4q-12 12-9 26l13 1 3-20" fill="${shirt}"/><ellipse cx="-24" cy="32" rx="7" ry="6" fill="#f4c6a5"/></g><g class="arm arm-right"><path d="M21 4q12 10 13 24l-13 4-7-20" fill="${shirt}"/><ellipse cx="27" cy="31" rx="7" ry="6" fill="#f4c6a5"/></g><g class="head"><path d="M-6 -8v11q6 6 12 0v-11" fill="#efb897"/><ellipse cx="0" cy="-27" rx="23" ry="26" fill="#f4c6a5"/><path d="M-23-25q-8-31 18-31 29-1 29 29l-8-13q-14 4-28-3Z" fill="${hair}"/>${you?'<path d="M-23 -29q12-18 43-8l-4 12q-20 5-39-4" fill="#363f50"/>'+mouth:eyes+brow+mouth}${boss?'<path d="M-19 -5q19 13 38-2" fill="none"/>':manager?'<path d="M-15 -19h6m12 0h6" stroke="#c28a78"/>':''}${mood==='worry'?'<path d="M29 -36q-8 12 0 12 6-2 0-12" fill="#80c4d5" stroke="none"/>':''}</g></g></g>`;
}
function art(id,mood='normal',phase='work'){
 const scene=setting(id),office=['office','credit','staff','press'].includes(scene),lead=id.startsWith('intro')?'you':['register','parade','credit','photo'].includes(scene)?'boss':'manager';
 const bg=office?'<rect x="24" y="30" width="100" height="66" rx="3" fill="#f6f1df"/><path d="M34 46h76M34 59h52M34 72h65" stroke="#b4b4a0" stroke-width="3"/><rect x="242" y="22" width="90" height="77" fill="#b8d4d4"/><path d="M287 22v77m-45-38h90" stroke="#fff8e8" stroke-width="5"/>':'<path d="M14 68h332M14 107h332" stroke="#a8977c" stroke-width="8"/>'+[0,1,2,3,4,5,6,7,8,9].map((n)=>`<rect x="${19+n*33}" y="${n%2?38:78}" width="22" height="27" rx="4" fill="${['#d8a26f','#91b2a0','#d7c579'][n%3]}"/><path d="M${23+n*33} ${n%2?51:91}h14" stroke="#fff4d4" stroke-width="6"/>`).join('');
 let props='';
 if(scene==='register')props='<g class="scan-item"><rect x="185" y="151" width="28" height="20" rx="4" fill="#dfa45f"/><path d="M192 154v13m4-13v13m4-13v13" stroke="#493b38"/></g><path class="scan-light" d="M177 147l57 12" stroke="#67c8b1" stroke-width="3"/><rect x="216" y="126" width="43" height="30" rx="4" fill="#566b70"/><rect x="222" y="132" width="31" height="15" fill="#b9ddd2"/>';
 if(scene==='robot')props='<g class="robot"><circle cx="239" cy="189" r="9" fill="#414b55"/><circle cx="277" cy="189" r="9" fill="#414b55"/><rect x="229" y="122" width="59" height="59" rx="12" fill="#d3dedb"/><rect x="224" y="80" width="68" height="44" rx="13" fill="#f2eedf"/><rect x="234" y="91" width="48" height="20" rx="7" fill="#41565e"/><path d="M245 99h5m11 0h5" stroke="#a7e5d0" stroke-width="4"/><path d="M257 80v-12m-28 72l-14 14m73-14l11 14" stroke="#596b71" stroke-width="5"/></g>';
 if(scene==='photo'||scene==='press')props='<g class="camera"><path d="M247 148l-18 49m18-49l21 49" stroke="#58606b" stroke-width="4"/><rect x="218" y="110" width="60" height="39" rx="5" fill="#46505a"/><circle cx="250" cy="129" r="14" fill="#a9cbcf" stroke="#2e3944" stroke-width="5"/><rect x="222" y="102" width="19" height="10" fill="#505660"/><path class="camera-flash" d="M285 104l17-8-7 17 18 1-24 11" fill="#f7d784"/></g>';
 if(scene==='bento'||scene==='photo'||scene==='festival')props+='<g class="food"><rect x="137" y="159" width="78" height="35" rx="8" fill="#604b42"/><rect x="142" y="163" width="29" height="25" rx="5" fill="#fff2d5"/>'+[0,1,2,3,4].map((n)=>`<circle cx="${179+(n%2)*17}" cy="${168+Math.floor(n/2)*9}" r="7" fill="#bd783b"/>`).join('')+'</g>';
 if(scene==='parade')props='<g class="parade-banner"><path d="M30 30h300v30H30Z" fill="#f7d58a"/><path d="M33 30v130m294-130v130" stroke="#8c6a50" stroke-width="4"/><text x="180" y="51" text-anchor="middle" fill="#704d35" stroke="none" font-size="15" font-weight="bold">社長 ON STAGE</text></g>';
 if(scene==='credit')props='<g class="trophy"><path d="M224 126h36l-7 25h-22Z" fill="#dfb756"/><path d="M241 151v20m-13 0h27m-31-39q-18 0-9 15l15 2m30-17q18 0 9 15l-15 2" fill="none" stroke="#c39a44" stroke-width="5"/></g>';
 if(scene==='repair')props='<rect x="214" y="59" width="91" height="132" rx="7" fill="#c6d9d6" stroke="#566966" stroke-width="3"/><path d="M220 121h78m-7-43v20m0 45v22" stroke="#657f7c" stroke-width="4"/>';
 if(scene==='staff'||scene==='office')props='<rect x="145" y="156" width="65" height="35" rx="3" fill="#fff5d9" transform="rotate(-8 145 156)"/><path d="M155 166h42m-40 8h30" stroke="#98a3a0" stroke-width="3"/>';
 if(id==='intro-calendar')props+='<g><rect x="235" y="25" width="85" height="76" rx="5" fill="#fff9e5" stroke="#6d7065" stroke-width="2"/><path d="M235 44h85" stroke="#b97d68" stroke-width="15"/><text x="277" y="79" text-anchor="middle" font-size="19" fill="#654d46">第4週</text><circle cx="277" cy="73" r="24" fill="none" stroke="#b97d68" stroke-width="2"/></g>';
 if(id==='intro-phone')props+='<g class="phone-prop"><rect x="200" y="166" width="65" height="22" rx="8" fill="#556d6c"/><path d="M206 164q25-16 52 0" fill="none" stroke="#3b5555" stroke-width="12"/><path d="M268 151q10 10 0 20m7-25q17 16 0 31" fill="none" stroke="#ab8c58" stroke-width="3"/></g>';
 if(id==='intro-shadow')props+='<path d="M233 51l-8-25 25 17q17-5 29 0l25-17-8 27q22 49-4 78h-55q-29-25-4-80" fill="#483f57" opacity=".5"/><path d="M247 65l9 3m18 0l9-3" stroke="#efcf9d" stroke-width="4"/>';
 const alert=phase==='news'?'<g class="news-notifications"><rect x="269" y="45" width="52" height="78" rx="7" fill="#3d4b61"/><rect x="274" y="53" width="42" height="58" rx="3" fill="#e7efea"/><path d="M280 63h28m-28 13h20m-20 13h27" stroke="#c18066" stroke-width="4"/><circle cx="317" cy="48" r="11" fill="#b2604c"/></g>':'';
 return `<svg class="comic-scene phase-${phase} scene-${scene}" viewBox="0 0 360 230" role="img" aria-label="${escape(({register:'レジで商品をスキャンする社長',robot:'ロボット店員と見守る店長',photo:'広告写真を撮影する社長',parade:'パレードで指示を出す社長',credit:'現場の成果を自慢する社長',press:'事務所で取材を受ける店長',staff:'バックヤードで従業員と話し合う店長',bento:'弁当売り場で働く店長',repair:'冷蔵庫を点検する店長',office:'帳簿を確認する店長',festival:'町の屋台で働くスタッフ',shop:'スーパーの売り場で働く店長'})[scene])}"><rect width="360" height="230" rx="18" fill="#f0e6d1"/><path d="M0 125h360v105H0Z" fill="#dfd2b8"/><path d="M0 170h360M60 125L20 230M170 125v105M280 125l45 105" stroke="#cec2aa" stroke-width="2"/>${bg}${person('worker',54,122,mood==='down'?'worry':'normal','carry',.7)}${person(lead,145,114,mood,scene==='register'?'scan':scene==='parade'||scene==='credit'?'gesture':'work',1.05)}${!['robot','repair'].includes(scene)?person(scene==='staff'?'worker':scene==='office'?'you':'customer',295,133,scene==='office'?mood:mood==='joy'?'joy':'normal','reach',.8):''}${['parade','robot','repair'].includes(scene)?'':'<path d="M101 174h225v39H101Z" fill="#9aaf9b"/><path d="M95 172h237" stroke="#fff4dc" stroke-width="9"/>'}${props}${alert}${phase==='result'&&mood==='joy'?'<g class="celebration" fill="#d3a14e"><path d="M50 48l3-10 3 10 10 3-10 3-3 10-3-10-10-3Zm260 7l3-9 3 9 9 3-9 3-3 9-3-9-9-3Z"/></g>':''}</svg>`;
}
function news(h,G){const items=[];
 if(h.fireHit)items.push({title:'SNSで批判が拡散',text:'施策の成否とは別に、店への批判が広がっています。',kind:'warning',visualId:'fire'});
 if(h.memoryEvent)items.push({title:'以前の判断が再び話題に',text:'過去の施策が再燃。今週の成否とは別の出来事です。',kind:'memory',visualId:'memory'});
 if(h.accidentId){const a=G.ACCIDENTS.find(a=>a.id===h.accidentId);items.push({title:h.accidentTitle,text:a?.body||'現場から臨時の報告が届きました。',kind:h.accidentPositive?'positive':'warning',visualId:a?.id||'memory'});}
 if(h.boycottHit)items.push({title:'不買運動が始まりました',text:'お客様の足が遠のいています。次の対応を考えましょう。',kind:'warning',visualId:'boycott'});
 if(h.devilPayment||h.personalDevilPayment)items.push({title:'契約の支払期限',text:'悪魔への返済が発生。支払額は決算の明細で確認できます。',kind:'warning',visualId:'devil'});
 for(const echo of h.storyEcho||[])items.push({title:'あの選択の後日談',text:echo.text,kind:'memory',visualId:['register','bento','staff','media','festival','finale'].includes(echo.id)?'echo-'+echo.id:'memory'});
 return items;
}
const api={setting,captions,art,person,news};root.WeekTheater=api;
if(typeof module!=='undefined'&&module.exports)module.exports.theater=api;
})(typeof window!=='undefined'?window:globalThis);
