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
