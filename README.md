# お客様のために。

## v2.13.0 — シーン内の旧図形人物を画像に一掃（ベータ）

以前は独立した5人のSVGのみが差し替え対象で、背景素材に直接描かれた古い丸顔・図形人物が残っていた。今回は以下を一括置換する。

- オープニング背景 `assets/prologue-v160.svg`
- 事務所・経営画面背景 `assets/office-cinema-v171.svg`
- 事故・ニュース `assets/incidents-v160.svg`
- 施策中の背景人物 `assets/policies-v160.svg`
- エピソード `assets/episode-cinema-v170.svg`
- ストーリーボード `assets/storyboards-v150.svg`
- 根本原因改善シーン `assets/root-cinema-v170.svg`
- HTML内の7つのストーリー画像とストーリー結果カット `index.html`

この更新では人物の図形グループを**削除**し、新イラストWebPを共有のSVG `<symbol>` と `<use>` で描画する。人物以外の背景・小物・文言は維持する。未制作の4人の表情差分は通常表情を使用。匿名の背景人物にも暫定的に既存の5人の画像を使うため、今後は固有人物の重複を解消する追加作画が必要。

**注意**：5人の正式承認された高精細原画は依然0/25。本更新は暫定的な展示用イラストへの視覚統一であって、25枚の正式採用ではない。

検証は `tests/legacy-people-v213.test.cjs` と `tests/legacy-people-v213.py` で、元の図形人物の再出現検知とChromium/WebKitでの画像実描画の比較を行う。会計、30週進行、保存形式は変更しない。


## v2.12.0 — ゲーム本編の主要5人の顔を新イラストへ統一

- 旧SVGの5人の**名前付き人物画像**（主人公、社長、店長、従業員、森さん）を、ギャラリー用の人物画像に置き換える。対象はタイトル・オープニング、経営画面の来客、街の声、人物詳細、会話・週結果の3コマ漫画、状態/相談シーンの画像。
- `assets/cast-gallery-art-v2110.js` と `cast-art-v2120.js` を本編起動前にロード。既存SVGの `<use>` は維持して同じ位置に画像を描画し、表情変化と画面差し替えに追従する。
- 主人公は5表情。残りの4名には通常表情1枚だけが存在し、他表情でも同じイラストを使用する。**存在しない高精細表情を完成扱いしない**。
- ギャラリー内で使った残り4人の顔はモックアップから切り出した暫定画像で、正式な25原画は**0/25承認**。背景画像に含まれる群衆や名前のない別人は差し替え対象外。
- 販売・利益計算、乱数、30週進行、セーブデータを変更せず、描画失敗時は旧SVGにフォールバック。iPhoneサイズのWebKit・Chromiumで回帰テスト。


## v2.11.0 — 全5人のギャラリー顔をイラストへ差し替え

- `cast-gallery-v2100.html` のキャラクター選択サムネイル5人と拡大プロフィール5人を新しいイラスト素材へ差し替え。
- 主人公は画像5表情を実装。他4人は以前制作したデザインモックのイラストを切り出した通常表情のみの仮素材を採用し、未制作の4表情ボタンは無効化して旧い平面顔を見せない。
- `assets/cast-gallery-art-v2110.js` に自己ホストのWebPを埋め込み。オフラインPWAのキャッシュを更新。会計・保存データ・ゲーム本体のストーリー演出は変更なし。
- **高精細原画の正式承認数は0/25**のまま。モック切り出しを新規の正式原画と扱わない。追加20表情の制作・目視審査・本編への反映はIssue #33で継続。


## v2.10.1 — 主人公原画5表情 先行公開（審査用）

- **新規人物イラスト5点を実際に閲覧できるページ** `protagonist-preview-v2101.html` を追加。画像は高精細なWebP 1024×1280px、透明背景、通常・喜び・怒り・悲しみ・驚きの5種類をHTMLへ埋め込んで配信。
- タイトル画面と登場人物ギャラリーからワンタップで表示。GitHub Pagesでも画像を別途配備しなくてよい自己完結ページ。
- **候補5/25・正式承認0/25**。既存ゲームの人物画像差し替え、公式アートマニフェストの `ready` 化は行わない。人物の同一性と手指・塗りの一貫性を独立して審査してからゲーム本編へ導入する。
- UI/会計/30週進行/セーブは従来どおり。PWAに先行公開ページを追加。スマホ320px/390px/430pxのブラウザ表示と埋め込み5画像のデコードをCIで検証。


## v2.10.0 — キャラクターギャラリー / 原画審査スタジオ

- タイトル画面に「登場人物ギャラリー」を追加。`cast-gallery-v2100.html` で5名×5表情（既存SVG全25種類）を切り替えて紹介。320/390/430pxのタップ操作・画面幅を自動検証。
- `art-review-v280.html` は人物原画候補をローカルで確認する開発用ツール。画像は外部へ送信せず、ゲームのセーブにもアクセスしない。
- 審査提案を `status: draft` とし、`approvedAssets` に自動承認が入らないように設計。SHA-256による審査時の画像との一致検証CLIを用意。
- 公式人物原画25点は**未制作・未承認（0/25）**。既存SVGを新規原画として数えない。独立した最終承認が揃うまで制作完了と表示しない。
- `scripts/verify-art-review-v300.cjs` はレビュー提案と画像の整合性だけ確認し、ゲームの人物絵を自動差し替えしない。
- UI以外の経営計算、乱数、30週間の進行、旧セーブ形式を変更しない。
- PWAキャッシュを更新。人物ギャラリー・審査画面をオフライン閲覧対象に追加。
- 検証: `tests/cast-gallery-v2100.test.cjs`、`tests/cast-gallery-v2100.py`、`tests/art-review-v280.test.cjs`、`tests/art-review-v280.py`、`tests/art-review-handoff-v300.test.cjs` と既存回帰テストをCIで実行。

**公開範囲**: ギャラリーはプレイヤー向け公開画面、審査スタジオは開発者向け独立ページ。原画25枚の本番採用は別リリースとする。


- 修正: オープニングの7枚のイラストをHTML内の実体あるSVGシンボルとして復元（前バージョンは存在しないIDを参照）。
- 炎上や過去の施策の再燃が発生すると、原因に応じて翌週に対応策3つが現れる。
- 対応した翌週の決算で、その施策単独の評判・炎上度・満足度への効果を、以後の不測の事態による最終変化と区別して説明。
- 30週の契約と12週の旧セーブ互換性は維持。
- 店の資金・自分の財布は従来通り分離。
## v1.4.0

Weekly presentation now follows **operating → policy outcome → news (when present) → settlement**. The 3.6-second operating scene is skippable; reduced-motion mode removes animations. Outcome impacts are captured before independent news, accidents and macroeconomic effects. Store cash, personal cash and operating profit remain separate.

Original layered SVG scenes cover checkout, robots, lunch boxes, photography, staff discussions, press interviews, parades and credit-taking. Scene rendering never draws random numbers or mutates the ledger. Save schema version 1 is retained; the optional `presentation` field resumes already-computed results. Older saves have no such field and continue normally. Required accident responses remain mandatory after reload.

### Verification

- Existing probability, story, legacy-save, crisis, campaign and accounting regressions remain in GitHub Actions.
- `node tests/theater-v140.test.cjs` checks distinct scene families, emotions, isolated policy impacts and outcome/news independence.
- `python tests/theater-v140.py` runs Chromium and WebKit at 375, 390 and 430px, with normal and reduced motion. It checks rapid skip, reload, mandatory accident responses and overflow.
- For environments lacking WebKit system libraries only: `THEATER_BROWSERS=chromium python tests/theater-v140.py`. CI requires both engines.
- No physical iPhone test has been performed. Browser emulation is not a physical-device test.

Backup before this release: `backup/pre-v1.4.0-20261018` (main `f305be3`).

## v1.5.0 — アセット主導の施策演出

代表的な8施策（社長レジ・ロボット店員・唐揚げ増量・広告撮影・従業員との対話・社長パレード・週刊誌への説明・功績の横取り）を、画面内で描き回す汎用人物SVGから、**独立した48コマのシナリオ別イラスト素材**に変更。

- `assets/storyboards-v150.svg`: 8場面 × 営業中3コマ＋成否別3コマの48独立SVGシンボル。人物、道具、背景、台詞を場面ごとに作画。
- `assets/storyboards-v150.js`: 施策IDから専用カットと短い進行テキストを引く純粋な描画カタログ。
- 営業画面は3.6秒内で3枚の場面画が切り替わり、スキップ・モーション軽減にも対応。
- 施策カードに専用の場面イラストを表示。失敗・成功・大成功の画も別途作成。
- 未対応の施策は既存演出へフォールバック。ロジック、財務、セーブ形式への変更はなし。
- `tests/storyboards-v150.test.cjs` は全48シンボルとルックアップの整合性を検証。PlaywrightでChromium/WebKitのSVG表示、フレームの切替、結果差分、画面幅をテスト。

資産はスマートフォン内へのPWAキャッシュに含まれ、ネットワーク不通でも既存設計の範囲内で再生可能です。

バックアップ: `backup/pre-v1.5.0-20261018`。

## v1.6.0 — 物語・事故・通常施策の絵を専用化

「その施策や事件で、誰が何をしているか絵から分からない」という問題への改修。

- 導入物語7幕は `assets/prologue-v160.svg` の**7つの独立した情景**へ。主人公の請求書・養育費の約束・着信・店長からのSOS・荒れた売り場・再建契約・悪魔の影を、台詞に対応する構図で描き直す。既存の汎用事務所絵の上書きを廃止。
- `assets/incidents-v160.svg` に**21の固有場面**。冷凍庫故障、レジ停電、廃棄野菜、スタッフ欠勤、配送渋滞、レシート炎上、競合半額祭り、大雨、親切のバズ、祭り、パンの寄付、炎上、過去の施策再燃、不買運動、悪魔の請求、6大型事件の後日談。
- `assets/policies-v160.svg` に**26の基本施策 × 営業中3コマ＋成否別3コマ＝156独立シンボル**。値札、袋の量、食材、レジの列、謝罪会見、商品回収、設備修理、銀行融資、ポイントなど施策ごとの小物と画面を作画し、別画像を切り替える。
- v1.5.0の8つの大型施策専用48コマは継続使用。残りの大型事件選択肢の一部には旧描画を使用しており、完全撤廃は今後の課題。
- 公開PWAのキャッシュに新素材3ファイルを追加。経営計算・成否判定・セーブ形式には変更なし。

### 検証
`tests/art-v160.test.cjs` で7幕・21ニュース・全26基本施策156コマと参照の整合性を検証。Playwright Chromium/WebKitで外部SVGの読み込み、各幕・各ニュースが実際に描画できることをスマホ幅でチェック。既存の回帰テストも継続。

バックアップ: `backup/pre-v1.6.0-20261018`。

## v1.6.1 — 「顔がみんな同じ」を減らす描き直しとスキップの重なり解消

- **スキップUI**: 絵・タイトル・進行文・進捗の下に独立した `.work-footer` を設け、ボタンを`position:static`にして重なりを防止。狭いiPhone画面では縦スクロール、余白とタップ領域を確保。
- **通常施策26種類・156コマ**: 旧来の同じ2人の描画を、主人公・店長・社長・スタッフ・常連客・記者・修理担当・銀行員・農家の**9職種の固有デザイン**へ差し替え。髪形・頭身・服装・制服・エプロン・帽子・作業道具・眼鏡を分離して役柄を明瞭に。準備・実行・結果、失敗・成功・大成功で、指差し／書類／作業／前のめり／落胆／歓喜などのポーズを変える。
- **大型事件8施策・48コマ**: 社長・店長・従業員・客の顔つきや体格、表情・ポーズを明確に描き分ける。
- 経営ロジック、成否確率、30週キャンペーン、ニュースの表示、セーブ形式は変更しない。
- PWAキャッシュを`v1.6.1`に更新して全画面を再描画。
- テスト: `tests/cast-layout-v161.test.cjs` で204場面・408人物差分を検証。`tests/cast-layout-v161.py` がChromium/WebKit・320/375/390/430pxでアート／進捗バー／ボタンの実座標、タップ遷移、SVG描画を確認。

バックアップ: `backup/pre-v1.6.1-20261018`。

## v1.7.1 — 日常の経営画面から使い回しを削減

- 目立つ汎用イラストが残っていたタイトル画面・事務所の経営画面を、`assets/office-cinema-v171.svg` の**10種類の独立した場面**に置き換え。普通・閑散・資金危機・炎上・繁盛・閉店・修理・事務所改装・悪魔の契約・表紙で背景や人物と小物が変わります。
- `assets/portraits-v171.svg` は **店長5表情＋常連客4人×5表情の25枚の専用肖像**。名札をつけた苦労人店長と、森さん・斎藤さん・青木さん・田中さんを髪形・服装・年齢感で区別。プレイ中は4週間ごとに別の常連が登場します（保存形式は変更しません）。
- 主人公は濃紺のスーツとネクタイで統一。短い静止カットで状態を伝え、無限ループを追加しません。
- 30週間の経営・会計・選択肢・旧セーブは変更しません。
- PWAキャッシュをv1.7.1へ更新。旧v1.7.0からそのまま続けられます。
- `tests/office-v171.test.cjs` と `tests/office-v171.py` で素材の参照・場面状態・WebKit/Chromiumモバイル描画を追加検証します。

変更前バックアップ: `backup/pre-v1.7.1-20261018`。


## v1.7.2 visual hotfix (independent of unreleased v2.0 stacked PRs)

This hotfix branch is based directly on **main v1.7.1**. It replaces the public game's CSS-animated hair, face, arms and the working/outcome theater with complete SVG portraits and a sequential three-panel comic. The office's initially inlined facial parts are also replaced by complete static SVG symbol references. No game rules, RNG, saved schema, money transfers, strategy choices or story logic were changed. The final build is **not yet public** until this PR is tested, reviewed and merged into main.

The manga has three sequential panels (1 → 2 → 3), with whole-panel fade/slide animations and immediate all-three display for reduced-motion users. The skip button remains available. Existing illustrated policy choice cards remain unchanged. The manga portraits reuse existing 25 resident expressions and add 15 fixed-pose full-figure SVG illustrations for protagonist, owner and worker.

The service-worker cache is bumped to `okyakusama-v1.7.2-manga-cache-1` to avoid keeping the old CSS-drawn version after release. Note that physical iPhone validation is still required; browser simulation is not equivalent to testing on an actual phone.


### v1.7.3 — イラスト・4択の視認性刷新

- プロローグの7画面で、従来の記号的な人体SVGを非表示にして、アニメ調で描いた主人公の完成済みイラスト3種を使うようにします。旧ストーリーの見出しと本文はそのまま。画像はWebPで自己ホストし、ネット接続なしでも表示できます。物語の主要人物の全表情刷新は別途必要です。
- 4択カードの小さくて複雑なシーン絵を廃止し、計26種類の意味が分かる単独オブジェクトの大きなSVGシンボルを採用。通常施策、根本修理、24の物語特別施策に対応。
- 320〜430pxでは2列×2行の選択肢を維持し、アイコンを60〜76pxに拡大。カード名、効果、成功率も併記します。コマ送り3コマ漫画、セーブ、RNG、会計は変更しません。
- プロローグ画像3点、3コマ漫画用の人物5人をまとめたWebP、アイコンSVGをPWAキャッシュへ登録し、キャッシュキーをv1.7.3へ更新。漫画内の人物も完成済みのイラスト画像に変更。表情差分は今後の課題です。
- 自動検証は `node tests/illustration-v173.test.cjs` と `python tests/illustration-v173.py`（Chromium/WebKit × 320/375/390/430px）。390pxの画面キャプチャをCIアーティファクトに含めます。
- リリース前にGitHub Actionsとスマホ幅のブラウザ画面を検証します。iPhone実機での検証は未実施です。
