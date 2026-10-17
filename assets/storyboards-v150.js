/* v1.5.0: separately authored SVG storyboard assets; three visible story beats per action. */
(function(root){'use strict';
const families=[["register",["arc_register_boss"]],["robot",["arc_staff_robot"]],["bento",["arc_bento_real"]],["photo",["arc_bento_camera"]],["staff",["arc_staff_listen"]],["parade",["arc_festival_parade"]],["press",["arc_media_open"]],["credit",["arc_finale_steal"]]];
const lookup=Object.fromEntries(families.flatMap(([family,ids])=>ids.map(id=>[id,family])));
const BASE='./assets/storyboards-v150.svg#';
const family=id=>lookup[id]||null;
function symbol(id,phase='work',step=0){const group=family(id);if(!group)return null;
 if(phase==='work')return BASE+group+'-work-'+Math.max(0,Math.min(2,Math.trunc(step)||0));
 if(phase==='result')return BASE+group+'-'+(['failure','success','great'].includes(step)?step:'success');
 return BASE+group+'-work-1';
}
function markup(id,phase='work',step=0,role='img'){
 const href=symbol(id,phase,step);if(!href)return null;
 const accessible=['work','result'].includes(phase)?'施策の専用イラスト':'イラスト';
 return '<svg class="storyboard-panel" viewBox="0 0 720 420" role="'+role+'" aria-label="'+accessible+'"><use href="'+href+'"></use></svg>';
}
const scripts=Object.freeze({
 register:['社長がレジへ入る','商品をスキャンして会計','列の様子に変化が…'],
 robot:['ロボットを売り場に搬入','接客を練習させる','本格稼働の結果を待つ'],
 bento:['売り場の弁当を点検','唐揚げを一つずつ詰める','お客様の反応を確かめる'],
 photo:['豪華な撮影セットを組む','商品にライトを当てる','完成写真を公開する'],
 staff:['従業員の意見を聞く','勤務条件を話し合う','新しい取り決めを掲示'],
 parade:['社長専用の山車を準備','商店街へ出発！','町の反応を見守る'],
 press:['記者の質問に答える','経営資料を公開する','記事の公開を待つ'],
 credit:['社長が表彰式を開く','社長が壇上の真ん中へ','従業員の反応は…']
});
const captions=id=>scripts[family(id)]||null;
root.PolicyStoryboards={family,symbol,markup,captions,BASE,families};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PolicyStoryboards;
})(typeof window!=='undefined'?window:globalThis);
