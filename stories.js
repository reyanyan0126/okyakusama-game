/* v1.3.0 — six authored, persistent story arcs. No personal data is transmitted. */
(function(root){
'use strict';
const EPISODES=[
 {
  "id": "register",
  "week": 2,
  "art": "register",
  "title": "レジが大渋滞！ 社長「気合で回せ」",
  "quote": "店長「30人並んでいます」 社長「大人気の証拠だ！」",
  "follow": [
   "loyalty",
   "apology",
   "audit",
   "blame"
  ],
  "followTitle": "あのレジ騒動、投稿動画が公開された",
  "followQuote": "元従業員「レジは直った。でも社長の頭は再起動されていません」",
  "echo": "レジ前の証言が町中を回り始めた",
  "choices": [
   {
    "id": "arc_register_boss",
    "name": "社長を1週間レジに立たせる",
    "effect": "費用 1.2万 ／ 話題性と炎上に注意",
    "detail": "レジが大渋滞！ 社長「気合で回せ」。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "register",
    "cost": 12000,
    "demand": 1.06,
    "delta": {
     "sat": 4,
     "frust": -2,
     "storeRep": 2,
     "fire": 3
    },
    "tone": "bold",
    "index": 0,
    "failure": "社長がバーコードリーダーに命令。列が倍に伸びた。",
    "success": "社長「ピッて鳴る機械は意外と従順だ」。店長は無言で頷いた。",
    "great": "社長の接客が謎の人気を獲得。「レジ王」として取材依頼が届く。",
    "art": "register"
   },
   {
    "id": "arc_register_pay",
    "name": "残業代を全額払い、人を増やす",
    "effect": "費用 2.6万 ／ 地道な信頼回復",
    "detail": "レジが大渋滞！ 社長「気合で回せ」。堅実な対処。失敗しても費用は戻らない。",
    "episode": "register",
    "cost": 26000,
    "demand": 1.12,
    "delta": {
     "sat": 7,
     "frust": -8,
     "storeRep": 4,
     "fire": -3
    },
    "tone": "steady",
    "index": 1,
    "failure": "採用初日、社長が勤務表を紛失。人は増えたが現場は混乱。",
    "success": "レジの行列が短くなった。従業員の表情も戻ってきた。",
    "great": "常連客が「やっと人間を大事にした」と口コミを拡散した。",
    "art": "register"
   },
   {
    "id": "arc_register_machine",
    "name": "全レジをセルフ化して祈る",
    "effect": "費用 3.5万 ／ 話題性と炎上に注意",
    "detail": "レジが大渋滞！ 社長「気合で回せ」。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "register",
    "cost": 35000,
    "demand": 1.19,
    "delta": {
     "sat": 1,
     "frust": 5,
     "storeRep": -2,
     "fire": 6
    },
    "tone": "bold",
    "index": 2,
    "failure": "精算機が「係員を呼んでください」を連呼。係員は退職済み。",
    "success": "セルフレジが稼働。社長「人類の進化だ」。客は説明書を熟読。",
    "great": "高齢客にも使いやすい設定が偶然完成。新しい客層が増えた。",
    "art": "register"
   },
   {
    "id": "arc_register_graduation",
    "name": "退職者を『卒業生』として送り出す",
    "effect": "節約 1.7万 ／ 話題性と炎上に注意",
    "detail": "レジが大渋滞！ 社長「気合で回せ」。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "register",
    "cost": -17000,
    "demand": 1.04,
    "delta": {
     "sat": -6,
     "frust": 12,
     "storeRep": -6,
     "fire": 9
    },
    "tone": "bold",
    "index": 3,
    "failure": "『卒業式』の映像が拡散。卒業生本人は怒っている。",
    "success": "人件費は削れたが、残った従業員の目は笑っていない。",
    "great": "卒業生が社長のスピーチをネタ動画化。バズったが信頼も削れた。",
    "art": "register"
   }
  ]
 },
 {
  "id": "bento",
  "week": 5,
  "art": "bento",
  "title": "広告の弁当と現物が別生物！",
  "quote": "消費者「広告は唐揚げ5個、実物は1個」。社長「角度の問題だ」",
  "follow": [
   "recall",
   "explain",
   "pop",
   "blame"
  ],
  "followTitle": "弁当の比較画像が町内会で議題に",
  "followQuote": "町内会長「写真に写った唐揚げを連れてきてください」",
  "echo": "あの唐揚げの数を、町の人はまだ覚えている",
  "choices": [
   {
    "id": "arc_bento_real",
    "name": "本当に唐揚げを5個に増やす",
    "effect": "費用 3.0万 ／ 地道な信頼回復",
    "detail": "広告の弁当と現物が別生物！。堅実な対処。失敗しても費用は戻らない。",
    "episode": "bento",
    "cost": 30000,
    "demand": 1.15,
    "delta": {
     "sat": 9,
     "frust": -8,
     "storeRep": 5,
     "fire": -4
    },
    "tone": "steady",
    "index": 0,
    "failure": "増量初日に仕入れが間に合わない。社長の昼食も唐揚げ1個。",
    "success": "写真どおりの弁当が売れた。お客様の驚きはいい意味だった。",
    "great": "唐揚げ弁当が町の名物に。社長は記念像を要求する。",
    "art": "bento"
   },
   {
    "id": "arc_bento_camera",
    "name": "撮影用の巨大弁当で再撮影",
    "effect": "費用 2.0万 ／ 話題性と炎上に注意",
    "detail": "広告の弁当と現物が別生物！。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "bento",
    "cost": 20000,
    "demand": 1.3,
    "delta": {
     "sat": -5,
     "frust": 10,
     "storeRep": -5,
     "fire": 12
    },
    "tone": "bold",
    "index": 1,
    "failure": "背景の人間より大きな弁当が写り、景品表示への批判が殺到。",
    "success": "広告に注目が集まる。社長「現物の説明は別部署だ」。",
    "great": "巨大な弁当広告がネットの人気ネタに。ただし比較投稿も増えた。",
    "art": "bento"
   },
   {
    "id": "arc_bento_chef",
    "name": "地元の料理人に監修を依頼",
    "effect": "費用 2.5万 ／ 地道な信頼回復",
    "detail": "広告の弁当と現物が別生物！。堅実な対処。失敗しても費用は戻らない。",
    "episode": "bento",
    "cost": 25000,
    "demand": 1.14,
    "delta": {
     "sat": 7,
     "frust": -5,
     "storeRep": 5,
     "fire": -2
    },
    "tone": "steady",
    "index": 2,
    "failure": "料理人が社長の試食コメントに激怒。改良は少し遅れた。",
    "success": "味も見た目も改善。常連が久しぶりに弁当を買った。",
    "great": "料理人と共同開発が実現。予約待ちの人気商品に。",
    "art": "bento"
   },
   {
    "id": "arc_bento_label",
    "name": "『写真はイメージです』を10倍に拡大",
    "effect": "節約 0.9万 ／ 話題性と炎上に注意",
    "detail": "広告の弁当と現物が別生物！。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "bento",
    "cost": -9000,
    "demand": 1.03,
    "delta": {
     "sat": -5,
     "frust": 9,
     "storeRep": -5,
     "fire": 7
    },
    "tone": "bold",
    "index": 3,
    "failure": "但し書きが商品名より大きい。苦情も大きくなった。",
    "success": "説明責任は果たしたと社長は主張。お客様は首を傾げた。",
    "great": "巨大な但し書きが逆に話題化。広告賞を狙う社長が暴走。",
    "art": "bento"
   }
  ]
 },
 {
  "id": "staff",
  "week": 8,
  "art": "staff",
  "title": "従業員が一斉に『退職します』",
  "quote": "店長「シフト表が空白です」。社長「余白は可能性だ！」",
  "follow": [
   "explain",
   "loyalty",
   "audit",
   "blame"
  ],
  "followTitle": "従業員の匿名アンケートが届いた",
  "followQuote": "店長「社長の良いところ欄、全員が空欄です」",
  "echo": "辞めた従業員の話が取引先にも伝わった",
  "choices": [
   {
    "id": "arc_staff_listen",
    "name": "従業員の要求を最後まで聞く",
    "effect": "費用 1.7万 ／ 地道な信頼回復",
    "detail": "従業員が一斉に『退職します』。堅実な対処。失敗しても費用は戻らない。",
    "episode": "staff",
    "cost": 17000,
    "demand": 1.08,
    "delta": {
     "staff": 6,
     "sat": 5,
     "frust": -9,
     "storeRep": 3
    },
    "tone": "steady",
    "index": 0,
    "failure": "社長が途中で自分語りを始め、会議が延長戦に突入した。",
    "success": "休みと給与の約束で何人かが踏みとどまった。",
    "great": "現場の改善チームが誕生。店長が頼れる仲間になった。",
    "art": "staff"
   },
   {
    "id": "arc_staff_robot",
    "name": "無人ロボット店員を試験投入",
    "effect": "費用 4.4万 ／ 話題性と炎上に注意",
    "detail": "従業員が一斉に『退職します』。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "staff",
    "cost": 44000,
    "demand": 1.24,
    "delta": {
     "sat": -1,
     "frust": 5,
     "storeRep": -1,
     "fire": 5
    },
    "tone": "bold",
    "index": 1,
    "failure": "ロボットが社長を『返品可能商品』と誤認。会場は大混乱。",
    "success": "ロボットは働く。ただし「係員を呼んでください」は人間頼み。",
    "great": "ロボットが会計ミスを減らし、現場に拍手が起きた。",
    "art": "staff"
   },
   {
    "id": "arc_staff_pizza",
    "name": "ピザ一枚で全員を引き留める",
    "effect": "費用 0.7万 ／ 話題性と炎上に注意",
    "detail": "従業員が一斉に『退職します』。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "staff",
    "cost": 7000,
    "demand": 1.09,
    "delta": {
     "sat": -3,
     "frust": 7,
     "storeRep": -1,
     "fire": 4
    },
    "tone": "bold",
    "index": 2,
    "failure": "人数分のピザが足りない。最後の一切れで労使交渉が決裂。",
    "success": "昼休みだけは和やかに。ただし給与の問題は何も解決していない。",
    "great": "従業員が休憩室で本音を語り始め、社長抜きの改善案が生まれた。",
    "art": "staff"
   },
   {
    "id": "arc_staff_resign",
    "name": "社長に『現場責任者』辞令を出す",
    "effect": "費用 0.9万 ／ 話題性と炎上に注意",
    "detail": "従業員が一斉に『退職します』。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "staff",
    "cost": 9000,
    "demand": 1.1,
    "delta": {
     "staff": 3,
     "sat": 4,
     "frust": -3,
     "storeRep": 2,
     "fire": 3
    },
    "tone": "bold",
    "index": 3,
    "failure": "社長が肩書きを喜び、現場の仕事を全部止めた。",
    "success": "社長が一度だけ現場を回った。「大変だ」と本音が漏れた。",
    "great": "社長がレジの達人になり、従業員から妙な敬意を得た。",
    "art": "staff"
   }
  ]
 },
 {
  "id": "media",
  "week": 12,
  "art": "media",
  "title": "週刊誌が『お客様のために』を調査",
  "quote": "記者「お客様とは誰ですか？」 社長「概念だ！」",
  "follow": [
   "audit",
   "apology",
   "loyalty",
   "blame"
  ],
  "followTitle": "週刊誌の特集号が発売された",
  "followQuote": "記者「今回は見出しより、あなたの対応を見ています」",
  "echo": "過去の記事が契約審査に引用された",
  "choices": [
   {
    "id": "arc_media_open",
    "name": "不都合な数字まで全部公開する",
    "effect": "費用 1.9万 ／ 地道な信頼回復",
    "detail": "週刊誌が『お客様のために』を調査。堅実な対処。失敗しても費用は戻らない。",
    "episode": "media",
    "cost": 19000,
    "demand": 1.06,
    "delta": {
     "storeRep": 8,
     "frust": -8,
     "sat": 5,
     "fire": -7
    },
    "tone": "steady",
    "index": 0,
    "failure": "資料が難しすぎて誤解が発生。社長だけが簡潔に黙っていた。",
    "success": "取材班に帳簿と改善策を公開。批判記事にも評価が混ざった。",
    "great": "記者が『社長はともかく現場は優秀』と特集を組んだ。",
    "art": "media"
   },
   {
    "id": "arc_media_fake",
    "name": "『社長の密着ドキュメンタリー』で対抗",
    "effect": "費用 2.3万 ／ 話題性と炎上に注意",
    "detail": "週刊誌が『お客様のために』を調査。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "media",
    "cost": 23000,
    "demand": 1.21,
    "delta": {
     "storeRep": -4,
     "frust": 7,
     "fire": 10,
     "notoriety": 5
    },
    "tone": "bold",
    "index": 1,
    "failure": "密着映像の大半が社長の休憩だった。番組が炎上。",
    "success": "社長の真顔が話題。店には人が来たが信用は微妙。",
    "great": "社長の珍発言がネットミーム化。客数は急増、記者は笑いを堪える。",
    "art": "media"
   },
   {
    "id": "arc_media_ignore",
    "name": "取材には答えず店を改善する",
    "effect": "費用 1.5万 ／ 地道な信頼回復",
    "detail": "週刊誌が『お客様のために』を調査。堅実な対処。失敗しても費用は戻らない。",
    "episode": "media",
    "cost": 15000,
    "demand": 1.1,
    "delta": {
     "storeRep": 4,
     "sat": 6,
     "frust": -4,
     "fire": -2
    },
    "tone": "steady",
    "index": 2,
    "failure": "取材拒否の文字だけが見出しに。改善の成果は届かなかった。",
    "success": "記事は辛口でも、実際に来た客の評価が少し上向いた。",
    "great": "取材班が黙って店を訪問。改善ぶりが予想外に高評価。",
    "art": "media"
   },
   {
    "id": "arc_media_silence",
    "name": "全社員に口止めメールを誤送信",
    "effect": "節約 1.1万 ／ 話題性と炎上に注意",
    "detail": "週刊誌が『お客様のために』を調査。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "media",
    "cost": -11000,
    "demand": 1.05,
    "delta": {
     "storeRep": -7,
     "frust": 12,
     "fire": 15,
     "notoriety": 7
    },
    "tone": "bold",
    "index": 3,
    "failure": "宛先に記者まで入っていた。社長はメールのせいにした。",
    "success": "口止めメールが社内で話題。情報は漏れず、不信だけ残った。",
    "great": "社長の文面があまりに奇妙で話題化。批判と客足が同時に増える。",
    "art": "media"
   }
  ]
 },
 {
  "id": "festival",
  "week": 17,
  "art": "festival",
  "title": "町内祭りで店を救え！ ただし予算がない",
  "quote": "町内会長「屋台を出しませんか」。社長「うちが主賓だろう？」",
  "follow": [
   "local",
   "explain",
   "tasting",
   "blame"
  ],
  "followTitle": "町内会が店の『公式な評判』を採点",
  "followQuote": "町内会長「お祭りは終わったが、請求書と感想は終わらない」",
  "echo": "町内会の口コミが街じゅうに定着した",
  "choices": [
   {
    "id": "arc_festival_locals",
    "name": "地元農家と一緒に小さな屋台を出す",
    "effect": "費用 2.2万 ／ 地道な信頼回復",
    "detail": "町内祭りで店を救え！ ただし予算がない。堅実な対処。失敗しても費用は戻らない。",
    "episode": "festival",
    "cost": 22000,
    "demand": 1.18,
    "delta": {
     "storeRep": 7,
     "sat": 6,
     "frust": -5
    },
    "tone": "steady",
    "index": 0,
    "failure": "社長が挨拶を30分延長。客は屋台が閉まったと勘違い。",
    "success": "地元野菜が完売。町内会が次も声をかけてくれた。",
    "great": "町内会と継続協定。店のファンが増え、社長は自分の功績と主張。",
    "art": "festival"
   },
   {
    "id": "arc_festival_parade",
    "name": "社長の等身大パレードを開催",
    "effect": "費用 2.9万 ／ 話題性と炎上に注意",
    "detail": "町内祭りで店を救え！ ただし予算がない。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "festival",
    "cost": 29000,
    "demand": 1.32,
    "delta": {
     "storeRep": -4,
     "fire": 9,
     "notoriety": 8
    },
    "tone": "bold",
    "index": 1,
    "failure": "巨大な社長像が道をふさいだ。祭りの主役は交通整理の人。",
    "success": "社長像が記念撮影スポットに。翌日の謝罪会見までがセット。",
    "great": "社長像が奇跡の大人気。地元のゆるキャラと誤認される。",
    "art": "festival"
   },
   {
    "id": "arc_festival_free",
    "name": "試食を無料にして本業で勝負",
    "effect": "費用 3.2万 ／ 地道な信頼回復",
    "detail": "町内祭りで店を救え！ ただし予算がない。堅実な対処。失敗しても費用は戻らない。",
    "episode": "festival",
    "cost": 32000,
    "demand": 1.21,
    "delta": {
     "sat": 7,
     "storeRep": 5,
     "frust": -4
    },
    "tone": "steady",
    "index": 2,
    "failure": "無料目当ての列が伸び、商品を買う人が見当たらない。",
    "success": "試食をきっかけに店に戻る客が増えた。",
    "great": "料理の魅力が話題になり、翌月の団体注文が舞い込んだ。",
    "art": "festival"
   },
   {
    "id": "arc_festival_fee",
    "name": "祭り客から『歩行協力金』を取る",
    "effect": "節約 1.6万 ／ 話題性と炎上に注意",
    "detail": "町内祭りで店を救え！ ただし予算がない。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "festival",
    "cost": -16000,
    "demand": 1.08,
    "delta": {
     "sat": -6,
     "frust": 12,
     "fire": 12,
     "storeRep": -7
    },
    "tone": "bold",
    "index": 3,
    "failure": "町内会長「道は町のものです」。社長「では空気は？」",
    "success": "徴収は一部成功したが、店の信用は広場に置き忘れた。",
    "great": "悪名が全国に広まり、見物客は増えた。町内会は出入りを禁じた。",
    "art": "festival"
   }
  ]
 },
 {
  "id": "finale",
  "week": 23,
  "art": "finale",
  "title": "社長が再建の手柄を独り占め！",
  "quote": "社長「私の采配でここまで来た！」 店長「初日に現場を見たのは誰でしたっけ」",
  "follow": [
   "audit",
   "loyalty",
   "explain",
   "blame"
  ],
  "followTitle": "最終審査の資料を誰が出す？",
  "followQuote": "社長「資料の一枚目は私の写真だ。決算は二枚目からでいい」",
  "echo": "最終審査で、積み重ねた選択が証言になった",
  "choices": [
   {
    "id": "arc_finale_team",
    "name": "現場スタッフの功績を表彰する",
    "effect": "費用 2.4万 ／ 地道な信頼回復",
    "detail": "社長が再建の手柄を独り占め！。堅実な対処。失敗しても費用は戻らない。",
    "episode": "finale",
    "cost": 24000,
    "demand": 1.11,
    "delta": {
     "storeRep": 7,
     "sat": 7,
     "frust": -7,
     "skill": 5
    },
    "tone": "steady",
    "index": 0,
    "failure": "社長が表彰状をすべて自分宛に印刷。印刷代が増えた。",
    "success": "現場の努力が見える化。スタッフが少し胸を張った。",
    "great": "街が『働く人を大切にする店』として称賛。社長も照れた。",
    "art": "finale"
   },
   {
    "id": "arc_finale_steal",
    "name": "社長に全成果を譲って昇進を狙う",
    "effect": "節約 1.0万 ／ 話題性と炎上に注意",
    "detail": "社長が再建の手柄を独り占め！。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "finale",
    "cost": -10000,
    "demand": 1.15,
    "delta": {
     "skill": 2,
     "storeRep": -3,
     "frust": 6,
     "notoriety": 4
    },
    "tone": "bold",
    "index": 1,
    "failure": "社長が昇進辞令を自分に出した。あなたの席は倉庫へ。",
    "success": "社長の機嫌が最高潮。報酬交渉はうやむや。",
    "great": "社長の鼻が高すぎてニュースに。集客は増えたが不信も膨らむ。",
    "art": "finale"
   },
   {
    "id": "arc_finale_vote",
    "name": "お客様に『社長の点数』を公開投票させる",
    "effect": "費用 1.2万 ／ 話題性と炎上に注意",
    "detail": "社長が再建の手柄を独り占め！。成功すれば派手だが、失敗した際の反発も大きい。",
    "episode": "finale",
    "cost": 12000,
    "demand": 1.23,
    "delta": {
     "storeRep": 4,
     "fire": 6,
     "frust": -3,
     "notoriety": 5
    },
    "tone": "bold",
    "index": 2,
    "failure": "1点が最多。社長「採点基準がおかしい！」",
    "success": "投票を経て社長が一部改善を約束。まだ半信半疑。",
    "great": "社長の珍回答が話題に。公開投票が店の名物イベントとなる。",
    "art": "finale"
   },
   {
    "id": "arc_finale_contract",
    "name": "最終契約を社長に突きつける",
    "effect": "費用 1.4万 ／ 地道な信頼回復",
    "detail": "社長が再建の手柄を独り占め！。堅実な対処。失敗しても費用は戻らない。",
    "episode": "finale",
    "cost": 14000,
    "demand": 1.06,
    "delta": {
     "skill": 4,
     "storeRep": 4,
     "frust": -4,
     "fire": -2
    },
    "tone": "steady",
    "index": 3,
    "failure": "社長が契約書を逆さに読む。交渉は難航した。",
    "success": "再建目標と役割分担を確認。社長の言い逃れが減った。",
    "great": "社長が責任分担に署名。従業員から拍手が起きた。",
    "art": "finale"
   }
  ]
 }
];
const BY_ID=Object.fromEntries(EPISODES.map(e=>[e.id,e]));
const POLICIES=EPISODES.flatMap(e=>e.choices.map(c=>({...c,icon:'',type:c.tone==='bold'?'hard':'kind',minMax:null})));
const POLICIES_BY_ID=Object.fromEntries(POLICIES.map(p=>[p.id,p]));
const cap=(v)=>Math.max(-100,Math.min(100,Math.round(v)));
const tiers=['failure','success','great'];
const tones={
 manager:{failure:'店長「また説明する仕事が増えました」',success:'店長「今日は現場が少し前に進みました」',great:'店長「スタッフが自主的に動き始めました！」'},
 boss:{failure:'社長「私に恥をかかせる計画だったのか？」',success:'社長「この成功を私の週報に載せよう」',great:'社長「天才の私がついていると違うな！」'},
 customers:{failure:'常連「また看板の言葉だけが立派になった」',success:'常連「やっと行動で示したね」',great:'常連「今度は友達も連れて来るわ」'}
};
const afterLines={
 register:['記者がレジ動画の続報を求めてきた。','社長がレジ王のサイン会を提案。','店長がシフト改善案を持ってきた。'],
 bento:['町内会で唐揚げの数が討論になった。','新しい弁当には予約が入った。','過去の広告写真が再び貼り出された。'],
 staff:['辞めた人の口コミが届いた。','現場から新しい仕事の提案が生まれた。','社長が今さらシフトを覚えた。'],
 media:['週刊誌の見出しが契約審査に再登場した。','取材記録が公開された。','記者が再来店した。'],
 festival:['祭り客の口コミが口コミを呼んだ。','町内会の掲示板に店の評判が貼られた。','来年の祭りの相談が届いた。'],
 finale:['契約審査員に社長の発言録が届いた。','店長が本当の功労者を証言した。','社長が勝手に祝勝会を予約していた。']
};
function active(s){return (s.storyArcs||[]).filter(a=>a.stage!=='done');}
function brief(s){
 if((s.campaignWeeks??12)!==30||s.finished)return null;
 const opening=EPISODES.find(e=>e.week===s.week && !(s.storyJournal||[]).some(j=>j.id===e.id));
 if(opening)return {id:'story:'+opening.id,title:opening.title,quote:opening.quote,choices:opening.choices.map(c=>c.id),episode:opening.id,phase:'opening',art:opening.art};
 const due=active(s).filter(a=>a.stage==='follow'&&a.due<=s.week).sort((a,b)=>a.due-b.due)[0];
 if(due){
  const e=BY_ID[due.id];return {id:'story-follow:'+e.id,title:e.followTitle,quote:e.followQuote,choices:e.follow,episode:e.id,phase:'follow',art:e.art};
 }
 return null;
}
function castChange(s,delta){
 if(!s.cast)s.cast={boss:0,manager:0,customers:0};
 for(const [k,v] of Object.entries(delta)){
  if(['boss','manager','customers'].includes(k))s.cast[k]=cap((s.cast[k]||0)+v);
 }
}
function influence(policy,tier,stage){
 const good=policy?.tone==='steady'||policy?.type==='kind';
 const strength=tier==='failure'?0:tier==='great'?2:1;
 if(stage==='opening')return good?{manager:2+strength,customers:2+strength,boss:-2}:{manager:-2-strength,customers:-3-strength,boss:2+strength};
 if(stage==='follow')return good?{manager:2+strength,customers:3+strength,boss:-1}:{manager:-2,customers:-3-strength,boss:2};
 return {manager:0,boss:0,customers:0};
}
function storyResult(s,scene,id,tier,action){
 if(!scene)return null;
 const e=BY_ID[scene.episode],kind=scene.phase;
 if(!e)return null;
 if(kind==='opening'){
  const policy=POLICIES_BY_ID[id];if(!policy||policy.episode!==e.id)return null;
  const item={id:e.id,stage:'follow',due:s.week+2,choice:id,tier,route:policy.tone,followAction:null};
  s.storyArcs=(s.storyArcs||[]).filter(x=>x.id!==e.id).concat([item]).slice(-3);
  castChange(s,influence(policy,tier,'opening'));
  const who=policy.tone==='steady'?'manager':'boss';
  return {id:e.id,phase:'opening',art:e.art,headline:policy.name,text:policy[tier],quote:tones[who][tier],next:'2〜3週間後に続報',tier};
 }
 if(kind==='follow'){
  const item=(s.storyArcs||[]).find(x=>x.id===e.id&&x.stage==='follow');
  if(!item)return null;
  item.stage='echo';item.due=s.week+3;item.followAction=id;
  castChange(s,influence(action,tier,'follow'));
  const honest=action.type==='kind';
  const actor=honest?'customers':'boss';
  const variants={
   failure:honest?'対策は遅れ、怒りはすぐには収まらなかった。':'言い訳が逆効果。以前の証拠まで蒸し返された。',
   success:honest?'具体的な改善を約束。信用を少し取り戻した。':'社長は逃げ切った気分だが、町の視線は冷たい。',
   great:honest?'一人ひとりへの対応が評価され、思いがけない応援が集まった。':'強気な態度が珍妙な人気を呼んだ。ただし火種は消えていない。'
  };
  return {id:e.id,phase:'follow',art:e.art,headline:e.followTitle,text:variants[tier]+' '+e.echo,quote:tones[actor][tier],next:'数週間後に決着',tier};
 }
 return null;
}
function echoes(s){
 if(!Array.isArray(s.storyArcs)||!s.storyArcs.length)return {extra:0,demand:1,text:'',items:[]};
 let extra=0,demand=1;const items=[];
 for(const item of s.storyArcs){
  if(item.stage!=='echo'||item.due>s.week)continue;
  const ep=BY_ID[item.id];if(!ep)continue;
  const reparative=['apology','recall','audit','loyalty','explain','restorestaff','local','tasting'].includes(item.followAction);
  const stable=item.route==='steady'||reparative;
  const reversal=item.tier==='great'&&!stable;
  const cost=stable?-11000:reversal?18000:14000;
  extra+=cost;demand*=stable?1.045:.945;
  const delta=stable?{storeRep:3,sat:3,frust:-3,fire:-2}:{storeRep:-4,sat:-2,frust:5,fire:4};
  for(const [k,v]of Object.entries(delta))s[k]=Math.max(0,Math.min(100,Math.round((s[k]||0)+v)));
  castChange(s,stable?{manager:2,customers:3,boss:-1}:{manager:-2,customers:-3,boss:1});
  const outcome=stable?'改善が実を結び、固定客が少し戻った。':'当時の判断が蒸し返され、客足に影を落とした。';
  const text=ep.echo+'。'+outcome+' '+afterLines[item.id][Math.abs((s.rngSeed||1)+s.week)%3];
  items.push({id:item.id,art:ep.art,title:ep.followTitle,text,positive:stable});
  s.storyJournal=(s.storyJournal||[]).concat([{id:item.id,choice:item.choice,tier:item.tier,followAction:item.followAction,positive:stable,summary:text}]).slice(-12);
  item.stage='done';
 }
 s.storyArcs=s.storyArcs.filter(x=>x.stage!=='done');
 return {extra,demand,text:items.map(i=>i.text).join(' '),items};
}
function castLine(s){const c=s.cast||{boss:0,manager:0,customers:0};return c.manager>=10?'店長「あなたの判断なら、現場はついていきます」':c.manager<=-10?'店長「もう社長より、あなたを信じていいのか分かりません」':c.customers>=10?'常連「この店、少し変わったね」':c.customers<=-10?'常連「謝るより先に値札を見て」':c.boss>=10?'社長「君は話が分かるな。責任も頼む」':'店長「数字だけでなく現場も見てください」';}
const gameStories={EPISODES,POLICIES,POLICIES_BY_ID,brief,storyResult,echoes,castLine,active};
root.GameStories=gameStories;
if(typeof module==='object'&&module.exports)module.exports=gameStories;
})(typeof globalThis!=='undefined'?globalThis:this);
