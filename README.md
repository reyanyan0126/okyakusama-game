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
