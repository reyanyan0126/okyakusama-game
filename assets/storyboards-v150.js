/* v1.5.0: separately authored SVG storyboard assets; three visible story beats per action. */
(function(root){'use strict';
const families=[["register",["arc_register_boss"]],["robot",["arc_staff_robot"]],["bento",["arc_bento_real"]],["photo",["arc_bento_camera"]],["staff",["arc_staff_listen"]],["parade",["arc_festival_parade"]],["press",["arc_media_open"]],["credit",["arc_finale_steal"]]];
const lookup=Object.fromEntries(families.flatMap(([family,ids])=>ids.map(id=>[id,family])));
const BASE='./assets/storyboards-v150.svg#';
const CINEMA={
 "arc_register_boss": [
  "社長がレジへ",
  "バーコードを通す",
  "行列の行方は？"
 ],
 "arc_register_pay": [
  "残業代を計算",
  "給与を振り込む",
  "増員してレジ再開"
 ],
 "arc_register_machine": [
  "セルフ機械を搬入",
  "セルフ操作を案内",
  "精算機の反応は？"
 ],
 "arc_register_graduation": [
  "卒業式の準備",
  "従業員に花束を贈る",
  "本人の反応は…"
 ],
 "arc_bento_real": [
  "唐揚げを増量",
  "5個ずつ盛り付け",
  "実物を売り場へ"
 ],
 "arc_bento_camera": [
  "巨大弁当を作る",
  "広告を撮影",
  "実物との違いは？"
 ],
 "arc_bento_chef": [
  "料理人を招く",
  "試作品を調理",
  "監修弁当完成"
 ],
 "arc_bento_label": [
  "但し書きを作る",
  "巨大な文字を印刷",
  "広告に貼り出す"
 ],
 "arc_staff_listen": [
  "従業員の声を集める",
  "待遇改善を協議",
  "約束を確認する"
 ],
 "arc_staff_robot": [
  "ロボットを搬入",
  "接客を学習させる",
  "店内で動かす"
 ],
 "arc_staff_pizza": [
  "ピザを注文",
  "従業員に配る",
  "枚数が足りる？"
 ],
 "arc_staff_resign": [
  "現場辞令を印刷",
  "社長へ手渡す",
  "社長が現場へ"
 ],
 "arc_media_open": [
  "帳簿を整理",
  "記者に数字を説明",
  "記事の反応を待つ"
 ],
 "arc_media_fake": [
  "撮影の準備",
  "社長を密着取材",
  "動画を公開"
 ],
 "arc_media_ignore": [
  "取材は断る",
  "売り場を改善",
  "客に変化が伝わる？"
 ],
 "arc_media_silence": [
  "口止めメールを作成",
  "一斉送信する",
  "記者にも届いた!?"
 ],
 "arc_festival_locals": [
  "野菜を仕入れる",
  "地元屋台を組む",
  "町内客を迎える"
 ],
 "arc_festival_parade": [
  "山車を準備",
  "社長が登壇",
  "商店街でお披露目"
 ],
 "arc_festival_free": [
  "試食を準備",
  "祭り客に配る",
  "味で勝負する"
 ],
 "arc_festival_fee": [
  "料金札を用意",
  "通行人に請求",
  "町内会に見つかる？"
 ],
 "arc_finale_team": [
  "功労者を選考",
  "スタッフを招く",
  "表彰状を手渡す"
 ],
 "arc_finale_steal": [
  "社長が式を準備",
  "自分を表彰",
  "従業員の反応は"
 ],
 "arc_finale_vote": [
  "投票箱を設置",
  "お客様が投票",
  "社長の評価が判明"
 ],
 "arc_finale_contract": [
  "最終契約を準備",
  "社長に署名を求める",
  "再建契約の結末は"
 ]
};
const CINEMA_SRC='./assets/episode-cinema-v170.svg#cinema-';
const ADDITIONAL='./assets/policies-v160.svg#';
const EXTRA={
 "raise": [
  "古い値札を外す",
  "値札を貼り替える",
  "新価格にお客様が驚く"
 ],
 "lower": [
  "値下げを決める",
  "値引き札を貼る",
  "客が商品を手に取る"
 ],
 "shrink": [
  "食品を計量する",
  "中身を減らす",
  "いつもの袋を売り場へ"
 ],
 "cheap": [
  "材料の原価を調べる",
  "代用材料で調理",
  "お客様が試食する"
 ],
 "quality": [
  "新鮮な材料を選ぶ",
  "食材を調理する",
  "売り場に並べる"
 ],
 "staff": [
  "レジの列を確認",
  "人手を減らす",
  "行列が伸びる"
 ],
 "explain": [
  "説明する内容を準備",
  "お客様へ説明する",
  "反応を確かめる"
 ],
 "sale": [
  "セール札を印刷",
  "セール札を掲示",
  "お客様が集まる"
 ],
 "points": [
  "還元率を確認",
  "ポイント制度を改定",
  "会員カードに反応が"
 ],
 "pop": [
  "宣伝のコピーを考える",
  "巨大POPを掲示",
  "商品と比べる"
 ],
 "tasting": [
  "試食品を用意",
  "試食を勧める",
  "味の感想を聞く"
 ],
 "local": [
  "農家と仕入れ相談",
  "野菜売り場を整える",
  "町内の客が来店"
 ],
 "restorestaff": [
  "求人募集を出す",
  "新しい人を研修",
  "レジに入ってもらう"
 ],
 "apology": [
  "クレームを集約",
  "謝罪会見に臨む",
  "評判を確かめる"
 ],
 "recall": [
  "問題商品を確認",
  "商品を回収する",
  "交換・返金する"
 ],
 "blame": [
  "会見内容を確認",
  "責任を転嫁する",
  "従業員が反発"
 ],
 "loyalty": [
  "常連さんを迎える",
  "常連の声を聞く",
  "常連が再来店"
 ],
 "stamp": [
  "台紙を印刷",
  "スタンプを押す",
  "景品を渡す"
 ],
 "audit": [
  "帳簿を開く",
  "帳簿を照合する",
  "原因が明らかに"
 ],
 "maintenance": [
  "古い冷蔵庫を調査",
  "設備を修理する",
  "修理結果を確認"
 ],
 "loan": [
  "銀行窓口に相談",
  "契約書に署名する",
  "口座を確認する"
 ],
 "airtax": [
  "商品の空気を計る",
  "謎の料金を追加",
  "お客様が困惑"
 ],
 "photo": [
  "商品を撮影台に置く",
  "写真を撮影する",
  "広告を公開"
 ],
 "ceocut": [
  "社長の報酬を確認",
  "役員報酬を改定する",
  "社長の反応を確認"
 ],
 "bills": [
  "請求書を集める",
  "支払順に並べる",
  "支払いを終える"
 ],
 "apologybot": [
  "謝罪AIを起動",
  "謝罪文を生成する",
  "AIに送信させる"
 ]
};
const family=id=>CINEMA[id]?id:(lookup[id]||(EXTRA[id]?id:null));
function symbol(id,phase='work',step=0){
 if(CINEMA[id])return CINEMA_SRC+id+'-'+(phase==='work'?'work-'+Math.max(0,Math.min(2,Math.trunc(step)||0)):phase==='result'?(['failure','success','great'].includes(step)?step:'success'):'work-1');
 const group=family(id);if(!group)return null;
 const src=lookup[id]?BASE+group:ADDITIONAL+'policy-'+group;
 if(phase==='work')return src+'-work-'+Math.max(0,Math.min(2,Math.trunc(step)||0));
 if(phase==='result')return src+'-'+(['failure','success','great'].includes(step)?step:'success');
 return src+'-work-1';
}
function markup(id,phase='work',step=0,role='img'){
 const href=symbol(id,phase,step);if(!href)return null;
 const accessible=CINEMA[id]?'選んだ施策：'+CINEMA[id][phase==='work'?(Number.isInteger(step)?Math.min(2,Math.max(0,step)):1):2]:['work','result'].includes(phase)?'施策の専用イラスト':'イラスト';
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
const captions=id=>CINEMA[id]||scripts[family(id)]||EXTRA[id]||null;
root.PolicyStoryboards={family,symbol,markup,captions,BASE,families,CINEMA};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PolicyStoryboards;
})(typeof window!=='undefined'?window:globalThis);
