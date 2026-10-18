# お客様のために。

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


## v1.7.4 開発中 — 漫画の感情演出と本物の表情差分を段階的に適用
- v1.7.3の漫画にはセリフの感情判定があっても、人物画像が変わらない問題がありました。
- 主人公が登場する漫画では、既に公開版に同梱されている**3種類の完成済みWebPイラスト**を状況別に切り替えるようにします（焦り・落胆・決意。平常は既存の集合絵）。人物の髪・腕・顔をCSSで描画・変形しません。
- 「！」だけで怒りに分類しないよう判定を整理しました。全キャラクターのコマ枠には、平静・前向き・怒り・落胆・焦りの感情補助ラベルを付けます。キャラクター本体は静止した完成絵のまま、コマ全体だけが動きます。
- **制限事項：社長・店長・従業員・常連の実際の表情画像差分は未制作です。** これらの人物には現在の完成済みイラストを表示し、感情ラベル・コマ枠で補助するだけです。「5人×5表情の絵がある」とは見なさないでください。
- セーブ・シナリオ・週進行・経営数値を変更しません。既存画像のみ使用し、Service Workerのキャッシュ名を更新します。
- 自動テスト：`node tests/manga-expression-v174.test.cjs`、`python tests/manga-expression-v174.py`、既存Node/Chromium/WebKit回帰。iPhone実機は未検証。**main・公開版へは未反映**です。
