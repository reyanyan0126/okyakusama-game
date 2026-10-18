/* v2.0.0 — three-panel manga, complete portraits only. No limb/hair HTML or CSS composition. */
(function(root){'use strict';
const clean=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const PANELS=3;
const SCENES={
 office:{bg:['#e4ecf2','#eef0e4','#f4e0d7'],accent:'#5a7796',prop:'<path d="M105 16h44v47h-44Z" fill="#fbf6e6" stroke="#6a7e82" stroke-width="3"/><path d="M110 28h34m-34 9h28m-28 9h31" stroke="#9eb3b5" stroke-width="3"/>'},
 shop:{bg:['#dfe9db','#f5e9d5','#e0e8e9'],accent:'#4e9279',prop:'<path d="M104 27h53m-53 25h53m-45-20v-10m13 10V20m14 12V18m-27 26v-9m14 9v-9m14 9v-9" stroke="#79998f" stroke-width="5"/><path d="M101 60h56" stroke="#a18e73" stroke-width="8"/>'},
 bento:{bg:['#fbecd5','#eef0e3','#f4e5d3'],accent:'#bc794e',prop:'<rect x="108" y="28" width="45" height="36" rx="6" fill="#685649"/><rect x="112" y="32" width="17" height="27" rx="4" fill="#faf0d4"/><circle cx="141" cy="40" r="7" fill="#c5884c"/><circle cx="141" cy="53" r="6" fill="#a96c39"/>'},
 staff:{bg:['#e7f0e8','#e3eaf1','#fff1d5'],accent:'#50877a',prop:'<rect x="106" y="19" width="42" height="49" rx="3" fill="#fffaf0" stroke="#718c84" stroke-width="3"/><path d="M113 30h28m-28 10h22m-22 10h25" stroke="#99b5a7" stroke-width="3"/>'},
 press:{bg:['#e7e5f0','#f3e7d8','#e4edf0'],accent:'#716e91',prop:'<rect x="108" y="25" width="42" height="29" rx="5" fill="#465665"/><circle cx="129" cy="40" r="10" fill="#a5c3c3" stroke="#3e4b59" stroke-width="5"/><path d="M130 54v13m-18 0h36" stroke="#727980" stroke-width="3"/>'}
};
const SETTING={register:'shop',robot:'staff',photo:'press',parade:'shop',credit:'office',press:'press',staff:'staff',bento:'bento',repair:'staff',office:'office',festival:'shop',shop:'shop'};
const SPEAKER={
 boss:{label:'社長',base:'./assets/manga-cast-v200.svg#manga-boss-'},
 manager:{label:'店長',base:'./assets/portraits-v171.svg#portrait-manager-'},
 worker:{label:'従業員',base:'./assets/manga-cast-v200.svg#manga-worker-'},
 customer:{label:'常連客',base:'./assets/portraits-v171.svg#portrait-mori-'},
 you:{label:'主人公',base:'./assets/manga-cast-v200.svg#manga-you-'}
};
// Single finished paintings cropped by frame. This is one image for each person,
// never separately drawn or positioned face/hair/arm DOM nodes.
const PAINTED_CAST='./assets/manga-painted-cast-v173.webp';
const CAST_COLUMNS={you:0,boss:1,manager:2,worker:3,customer:4};
const CAST_WIDTH=90,CAST_HEIGHT=126;
// Unlike the cast group portrait, these are three distinct painted expressions
// of the protagonist already shipped for the seven-scene prologue.
const PROTAGONIST_PAINTED=Object.freeze({
 normal:null,
 happy:'./assets/illustrated-protagonist-determined-v173.webp',
 angry:'./assets/illustrated-protagonist-v173.webp',
 sad:'./assets/illustrated-protagonist-thinking-v173.webp',
 panic:'./assets/illustrated-protagonist-v173.webp'
});
const EMOTION_LABELS=Object.freeze({
 normal:'平静',happy:'前向き',angry:'怒り',sad:'落胆',panic:'焦り'
});
function portraitSource(role,mood){
 return role==='you'&&PROTAGONIST_PAINTED[mood]?PROTAGONIST_PAINTED[mood]:PAINTED_CAST;
}
const moodMap={boss:{normal:'normal',happy:'happy',angry:'angry',sad:'sad',panic:'panic'},
 manager:{normal:'normal',happy:'happy',angry:'angry',sad:'sad',panic:'panic'},
 worker:{normal:'normal',happy:'happy',angry:'angry',sad:'sad',panic:'panic'},
 customer:{normal:'normal',happy:'happy',angry:'angry',sad:'sad',panic:'panic'},
 you:{normal:'normal',happy:'happy',angry:'angry',sad:'sad',panic:'panic'}};
function speaker(text,index,actionId=''){
 const t=String(text??''),id=String(actionId);
 // Storyboard captions are often narration ("社長がレジへ"), not quoted dialogue.
 if(/社長/.test(t))return 'boss';
 if(/店長/.test(t))return 'manager';
 if(/常連|お客様/.test(t))return 'customer';
 if(/従業員|スタッフ/.test(t))return 'worker';
 if(/あなた|主人公/.test(t))return 'you';
 if(/boss|parade|credit|steal|camera|photo|fake|blame/.test(id))return ['boss','manager','worker'][index%3];
 if(/robot|staff|people|listen/.test(id))return ['worker','manager','boss'][index%3];
 if(/bento|festival|quality|cheap/.test(id))return ['worker','manager','customer'][index%3];
 return ['manager','worker','customer'][index%3];
}
function expression(text,index,tier){
 if(tier==='failure'&&index===2)return 'sad';
 if(tier==='great'&&index===2)return 'happy';
 const s=String(text??'');
 if(/怒|許さ|反対|責任|ふざけ|裏切/.test(s))return 'angry';
 if(/？|\?|困|危機|誰が|心配|驚|大変/.test(s))return 'panic';
 if(/減少|損失|厳し|無理|残念|悲し|失敗|足りな/.test(s))return 'sad';
 if(/ありがとう|感謝|順調|よかった|良かった|安心|嬉し|成功|！/.test(s))return 'happy';
 return ['normal','normal','happy'][index%3];
}
function sceneKey(id,setting){
 if(setting&&SETTING[setting])return SETTING[setting];
 const raw=String(id||'').toLowerCase();
 if(/audit|media|news|photo|camera|stamp/.test(raw))return 'press';
 if(/office|boss|credit|final|loan|bills|ceocut/.test(raw))return 'office';
 if(/staff|robot|people|listen|repair|equipment/.test(raw))return 'staff';
 if(/food|bento|cheap|quality|tasting|shrink/.test(raw))return 'bento';
 return 'shop';
}
function art(role,mood,kind,index){
 const s=SCENES[kind]||SCENES.shop;
 const data=SPEAKER[role]||SPEAKER.manager;
 const emotion=(moodMap[role]||moodMap.manager)[mood]||'normal';
 const bg=s.bg[index%3];
 // Every person below is one crop of a finished painted character; CSS never creates anatomy.
 return '<svg class="manga-picture" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" preserveAspectRatio="xMinYMid slice" role="img" aria-label="'+
  clean(data.label+'の完成イラスト。'+kind+'の場面')+'"><rect width="160" height="100" fill="'+bg+'"/>'+
  '<path d="M0 80H160" stroke="'+s.accent+'" opacity=".5" stroke-width="7"/>'+
  s.prop+
  '<path d="M8 88Q32 80 73 88" fill="none" stroke="#6a5546" stroke-width="2" opacity=".3"/>'+
  (portraitSource(role,emotion)===PAINTED_CAST?
   '<svg class="manga-painted-character" x="2" y="-9" width="99" height="118" viewBox="'+(CAST_COLUMNS[role]??CAST_COLUMNS.manager)*CAST_WIDTH+' 0 '+CAST_WIDTH+' '+CAST_HEIGHT+'" preserveAspectRatio="xMidYMid slice" overflow="hidden" aria-hidden="true">'+
    '<image href="'+PAINTED_CAST+'" x="0" y="0" width="'+(CAST_WIDTH*5)+'" height="'+CAST_HEIGHT+'" preserveAspectRatio="none"></image></svg>':
   '<svg class="manga-painted-character" x="2" y="-9" width="99" height="118" viewBox="0 0 196 224" preserveAspectRatio="xMidYMid slice" overflow="hidden" aria-hidden="true">'+
    '<image href="'+portraitSource(role,emotion)+'" x="0" y="0" width="196" height="224" preserveAspectRatio="none"></image></svg>')+
  '<rect x="2" y="2" width="156" height="96" rx="2" fill="none" stroke="#3e3735" stroke-width="2" opacity=".23"/></svg>';
}
function panel(line,index,kind,tier,all,actionId){
 const who=speaker(line,index,actionId),mood=expression(line,index,tier),label=SPEAKER[who].label;
 return '<article class="manga-panel'+(all?' is-revealed':'')+'" data-panel="'+index+'" data-emotion="'+mood+'"'+(all?'':' aria-hidden="true"')+'>'+
  '<div class="manga-visual">'+art(who,mood,kind,index)+'</div>'+
  '<div class="manga-dialogue"><span class="manga-beat">'+String(index+1)+' / 3 · '+clean(label)+'</span>'+ 
  '<span class="manga-emotion-cue" aria-label="このコマの感情の手掛かり">'+EMOTION_LABELS[mood]+'</span>'+
  '<p class="manga-line">'+clean(line)+'</p></div></article>';
}
function markup(id,lines,options={}){
 const raw=Array.isArray(lines)?lines:[];
 const fallback=['店長「今週の作戦を確認しましょう」','従業員「売り場へ伝えます」','常連「どんな店になるのかな」'];
 const text=[0,1,2].map(i=>raw[i]||fallback[i]);
 const scene=sceneKey(id,options.setting),all=Boolean(options.all);
 return '<div class="manga-strip'+(options.result?' manga-strip-result':'')+'" role="group" aria-label="3コマ漫画・'+clean(options.result?'施策の結果':'営業中の出来事')+'">'+
  text.map((line,i)=>panel(line,i,scene,options.tier||'success',all,id)).join('')+
  '<p class="manga-progress" aria-hidden="true">● ● ●</p></div>';
}
function reveal(container,index){
 if(!container)return 0;
 const panels=container.querySelectorAll('.manga-panel');
 let visible=0;
 panels.forEach((p,i)=>{
  const show=i<=index;
  p.classList.toggle('is-revealed',show);
  p.setAttribute('aria-hidden',String(!show));
  if(show)visible++;
 });
 return visible;
}
function result(h){
 const verdict=h.performanceTier==='great'?'大成功':h.performanceTier==='failure'?'失敗':'成功';
 const lines=[
  '店長「'+String(h.actionName||'今週の方針')+'を実施しました」',
  h.performanceTier==='failure'?'従業員「思ったほど成果が出ませんでした…」':'従業員「今週の数字を確認しましょう！」',
  h.performanceTier==='great'?'常連「なんだか店が良くなったね！」':h.performanceTier==='failure'?'常連「次は改善してほしいな」':'常連「これからも見ているよ」'
 ];
 return markup(h.actionId,lines,{result:true,all:true,tier:h.performanceTier,setting:h.sceneSetting})+
  '<span class="manga-verdict" aria-label="施策の判定">'+clean(verdict)+'</span>';
}
const api={PANELS,sceneKey,speaker,expression,art,markup,reveal,result,portraitSource,EMOTION_LABELS};
root.MangaCinema=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
