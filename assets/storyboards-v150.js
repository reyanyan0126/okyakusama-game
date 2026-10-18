/* v1.5.0: separately authored SVG storyboard assets; three visible story beats per action. */
(function(root){'use strict';
const families=[["register",["arc_register_boss"]],["robot",["arc_staff_robot"]],["bento",["arc_bento_real"]],["photo",["arc_bento_camera"]],["staff",["arc_staff_listen"]],["parade",["arc_festival_parade"]],["press",["arc_media_open"]],["credit",["arc_finale_steal"]]];
const lookup=Object.fromEntries(families.flatMap(([family,ids])=>ids.map(id=>[id,family])));
const BASE='./assets/storyboards-v150.svg#';
const ADDITIONAL='./assets/policies-v160.svg#';
const EXTRA={
 "raise": "古い値札を外す",
 "lower": "値下げを決める",
 "shrink": "食品を計量する",
 "cheap": "材料の原価を調べる",
 "quality": "新鮮な材料を選ぶ",
 "staff": "レジの列を確認",
 "explain": "説明する内容を準備",
 "sale": "セール札を印刷",
 "points": "還元率を確認",
 "pop": "宣伝のコピーを考える",
 "tasting": "試食品を用意",
 "local": "農家と仕入れ相談",
 "restorestaff": "求人募集を出す",
 "apology": "クレームを集約",
 "recall": "問題商品を確認",
 "blame": "会見内容を確認",
 "loyalty": "常連さんを迎える",
 "stamp": "台紙を印刷",
 "audit": "帳簿を開く",
 "maintenance": "古い冷蔵庫を調査",
 "loan": "銀行窓口に相談",
 "airtax": "商品の空気を計る",
 "photo": "商品を撮影台に置く",
 "ceocut": "社長の報酬を確認",
 "bills": "請求書を集める",
 "apologybot": "謝罪AIを起動"
};
const family=id=>lookup[id]||(EXTRA[id]?id:null);
function symbol(id,phase='work',step=0){const group=family(id);if(!group)return null;
 const src=lookup[id]?BASE+group:ADDITIONAL+'policy-'+group;
 if(phase==='work')return src+'-work-'+Math.max(0,Math.min(2,Math.trunc(step)||0));
 if(phase==='result')return src+'-'+(['failure','success','great'].includes(step)?step:'success');
 return src+'-work-1';
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
const captions=id=>scripts[family(id)]||EXTRA[id]||null;
root.PolicyStoryboards={family,symbol,markup,captions,BASE,families};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PolicyStoryboards;
})(typeof window!=='undefined'?window:globalThis);
