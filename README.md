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


## v1.8.0 — GAMEPLAY REFINEMENT（レビュー用）

- 事故対応・緊急再建後の増減を実際の0〜100の範囲に合わせ、施策単独の説明から過去の後日談を分離。
- 根本対策が失敗しても、購入済みの設備・人材・常連投資を失わないよう修正。
- 施策費と再燃の可能性を選択前に表示。投資の当週効果と成否確率への次週効果を区別。
- 個人の支払不足から未払いへの振替を明示。店舗と個人の独立会計を維持。
- キーボードの矢印/Home/End選択、フォーカス保持、決算の短い原因一覧を追加。演出段数は増やさない。
- 30週・4択・schema 1・12週旧セーブ・既存画像/PWAを維持。バランス定数と乱数順序は変更なし。

[監査と固定800キャンペーンの前後比較](tests/results/v180-audit.md)。
再計測: `node tests/balance-v180.cjs /tmp/balance.json`（200シード×4戦略）。
回帰: `node tests/refinement-v180.test.cjs` と `python tests/refinement-v180.py`。
ローカルでWebKit依存がない場合のみ `THEATER_BROWSERS=chromium python tests/refinement-v180.py`。CIは両エンジン必須。実機iPhoneは未検証。


## v2.0.0 — strategy audit (development PR, not released)

- First milestone: matched-seed policy evaluation across four strategies and four common investment/accident-compensation rules, without changing game balance or saves.
- Read [controlled-strategy checkpoint](tests/results/v200-strategy-checkpoint.md) for 40-seed preliminary measurements, limitations and reproduction.
- Run `node tests/strategy-v200.test.cjs` or `STRATEGY_SEEDS=200 node tests/strategy-v200.cjs /tmp/v200-full.json` to create a detailed audit JSON.
- This stage adds **tests and audit only**; no new gameplay or release was published. It is stacked on v1.8.0 PR #12.


### v2.0.0 — 管理画面の経営推移（開発PR）

- 詳細ステータス内で週間利益、累計利益、店舗現金、個人所持金の4系列を閲覧できます。ゲームの確定済みhistoryから描画するため、会計やRNGの処理は変更しません。
- 12週旧セーブに履歴項目が欠けている場合は、欠損データを補間せずその指標の不足を表示します。
- SVGと数値説明を併記し、追加依存なしで描画します。`node tests/trends-v200.test.cjs`で表示データを検証できます。
- PWAキャッシュに新しい表示専用モジュールを追加。PR #13に依存するレビュー用機能で、公開版ではありません。


### v2.0.0 — 実績とエンディング収集（開発PR）

- 30週完走、契約成功、悪魔との非契約、信用、関係性、炎上からの復活など、エンディング時に判定できる8種の実績を記録します。
- 通常セーブ`okyakusama.save.v1`とは独立した`okyakusama.achievements.v1`として端末内に保存し、既存のセーブ互換性・経営数値を変更しません。
- 記録画面から実績と発見済みエンディングを確認できます。実績は従来のセーブ書き出しに含まれません。
- `node tests/achievements-v200.test.cjs`で重複解放・破損・保存失敗をテストします。公開版には未反映です。


### v2.0.0 — 資金条件統一の追加調査（開発中）

- 4戦略×4資金管理条件×各40シード、合計640プレイを調査。詳細は[比較結果](tests/results/v200-finance-controlled-40.md)。
- これはヒューリスティックの予備実測であり、人間の勝率や施策の因果効果ではありません。バランス定数は未変更です。

### v2.0.0 — 社長との駆け引き（開発PR）

- 30週キャンペーンの第6・11・16・21・26・30週に社長が推す施策が提示される場合、採用または見送りによって社長・店長・常連客の信頼が小幅に変化します。危機下では影響も変わります。
- 追加の5択や別画面は作らず、既存の4択と社長の臨時報酬を使います。事前に対立構造を説明し、決算と経営記録に選択結果を表示します。
- 会計・新旧セーブ形式・乱数の消費順を直接変更しません。ただし関係値が後続週の成否確率と一部結末に影響するため、経営バランスへの間接効果を追跡する必要があります。
- 確認コマンド: node tests/boardroom-v200.test.cjs / python tests/boardroom-v200.py。現段階では公開版未反映です。

### v2.0.0 — 携帯できるセーブ＋実績バックアップ（開発PR）

- 従来の旧形式セーブJSONの書き出しはそのまま維持。新しい「セーブ＋実績をまとめて保存」でJSON形式のポータブルバックアップを書き出せます。
- バックアップ読込時は経営キャンペーンを検証し、実績・エンディング履歴は既存コレクションと統合します。旧形式セーブを読み込んでも実績は消しません。
- 書き込み失敗時は旧キーの復元を試み、失敗すればそのままエラーを表示します。実績はサーバーと自動同期されないため、端末移行にはバックアップが必要です。
- テストは node tests/backup-v200.test.cjs および python tests/backup-v200.py。PWAに新規モジュールを追加しています。公開版は未更新です。


### v2.0.0 — 判断のその後（開発PR）

- 記録画面で、進行中のストーリー、決着済みの後日談、重要会議で社長案に従ったかを一覧で見られます。
- 既存のstoryArcs、storyJournal、historyのみを使用し、セーブ形式・週進行・乱数には影響させません。旧セーブの欠損項目は空の記録として扱います。
- 未確定の未来は表示せず、後日談に記録された実際の文章だけを表示します。HTML文字列はすべてエスケープします。
- NodeとChromium/WebKitで閲覧、画面幅、セーブの不変性を検証します。公開版にはまだ反映しません。


### v2.0.0 — STRATEGIC REFINEMENT（開発PR）

- 毎週の4択に任意の折りたたみ「経営参謀のメモ」を追加。現在の信用・炎上・不満・現金・品質・人員・生活費の警戒水準を表示します。
- 施策の通常効果を仮定した基準炎上率を、実際のエンジンの`risk`と`previewRisk`から求めます。事故・景気・過去施策の再燃・施策の成否を織り込んだ結果予測ではないことを明示します。
- 残り契約週数と累計利益目標までの必要平均、任意の投資費用を差し引いた参考現金を表示。現金流入や支払を確定的に予測しません。
- エンジンの経済係数・RNG・30週間・4択・旧セーブschemaには変更なし。`node tests/strategy-advisor-v200.test.cjs`などで純粋性・旧12週・会計・画面を検証。
- 数字を操作して強引に高リスク施策を勝たせるのではなく、「利益を取りにいく週」と「信用を修復する週」をプレイヤーが見極められる情報を増やす施策です。

- 比較用に `guarded-profit` 戦略を追加。100固定シードの投資＋事故補償条件では、無計画な利益重視 0/100 に対し危険時に修復を挟む利益重視 96/100 が目標達成（自動プレイの比較であり人間の勝率ではありません）。[計測手順と留意点](tests/results/v200-strategic-refinement-100.md)。


### v2.0.0 — CHAPTER RECKONING（開発PR）

- 従来の6つのストーリーを維持し、第15・22・28週に、過去の行動や人物関係によって台詞が変わる重要会議を追加しました。いずれも既存の「4つの施策から1つ選ぶ」構造のままです。炎上・資金危機・未解決の既存ストーリーがある場合はそれを優先します。
- 重要会議では「現場優先」「短期の数字を優先」「社長優先」の選択が登場人物の信頼に影響し、履歴と決算に結果を記録します。会計への直接の追加支出はありませんが、信頼が後続施策の成否や結末に影響するため間接的なゲームバランス変化があります。
- 契約目標達成だけでは新しい特別エンディングになりません。解決済みストーリー、重要会議で選んだ路線、人物との信頼、救済経験を組み合わせて3種の特別な結末を判定し、通常のエンディングはそのまま残します。
- 最終審査では、保存済みの後日談・重要会議の結果から最大3件を引用して、積み重ねた判断を振り返れます。記録のない旧セーブに存在しないエピソードは作りません。
- 旧12週セーブ、経営資金と個人資金、30週契約、PWA、オフライン復元を保護します。セーブの新しい必須フィールドは増やしません。
- Node: `node tests/chapter-finales-v200.test.cjs`。Browser: `python tests/chapter-finales-v200.py`。実機iPhoneは未検証、公開版には未反映です。
