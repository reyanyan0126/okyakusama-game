# CHANGELOG

## 3.2.1 — 2026-10-29

- 公開後の旧版ブラウザで3.1.0の表示が残ったため、Service Workerの事前取得に `cache: reload` を指定。新キャッシュへ古いHTTPキャッシュを複製しない。
- 更新テストを1時間のHTTPキャッシュ付き旧版からの移行へ強化し、タイトルの実バージョン一致も必須とした。セーブ領域・会計・ゲーム内容は変更しない。

## 3.2.0 — 2026-10-29（公開準備）

- 基準: main `70cc849`、実バージョン3.1.0。旧指示書の1.0.1〜1.1.0を架空のリリース履歴として作成せず、現在のコードへ追加。
- キャラクター: 6人の同一性を維持した96×160/64×64の細部追加、8表情、関連ポーズ、144個の全身/顔/会話SVG。
- 演出: まばたき、短い口パク、呼吸、喜怒驚の反応、登場と営業終了時の退場。reduced motion対応。
- 状態連動: 資金危機・炎上・疲労・士気から表情を決定。黒字でも危機時は笑顔にしない。
- 判断支援: 独立した64シナリオで収支を予測。直近決算の予測と実績を比較し、表示情報をJSONへ保持。本番乱数・会計・旧セーブのルールは変更しない。
- UI修正: 人物を整数倍率で描画。投資説明の「次週から効果」を実挙動に合う「継続効果あり」へ修正（成功率以外には当週から効果がある）。
- PWA: 184ファイルの公開ビルドと新キャッシュ。実際の3.1.0コミットから更新する検証へ強化。
- 検証: 新規の予測/状態/画像テストとChromium・WebKit検証を追加。詳細・制約は `docs/release-v320.md`。

## 3.1.0 — 2026-10-26

Current baseline: main 8572e48 (3.0.0). The requested 0.9.5–1.0.0 milestones are
implemented as an additive release on current code, not a downgrade or invented
historical releases. Existing 30-week Pixel Edition remains intact.

### Stability (original 0.9.5 scope)
- Reject duplicated/out-of-order weekly history and invalid new management state.
- JSON imports persist successfully before replacing the live session. Storage
  failures preserve the old save AND current game. Invalid imports remain recoverable.
- Preserve v1 schema and old 12/30-week rules. Forty full campaign state hashes from
  unmodified 3.0.0 cover RNG, finance, rescue, story, accidents and round trips.

### Management (original 0.9.6 scope)
- New-game-only workforce morale, fatigue, turnover and departures. Staffing cuts
  save wages but worsen workforce health. Supportive policies and training help.
- Service quality affects demand, satisfaction and complaints. Departures cost
  18,000 yen, booked as operating costs and itemized in the cash ledger.
- Low fatigue does not negate low morale when calculating turnover. A legal-choice
  replay tests a real retirement and its expense.
- Existing credit, investments, future consequences and bankruptcy/rescue remain.

### Distinct character identities — 2026-10-28
- Redraw all six characters with distinct silhouettes and persistent identity details:
  slim consultant with rectangular glasses and briefcase; broad, bald, moustached boss;
  ponytailed manager with red bow and apron; capped worker with striped shirt and shorts;
  silver-bunned Mori with round glasses, long skirt and cane; horned devil with wings and cape.
- Regenerate all 72 full-body and portrait assets across six expressions per character.
- Refresh the offline asset cache while preserving existing saves and game rules.

### Concise interface — 2026-10-27
- Review every active screen; remove repeated selection instructions, duplicate selected-action heading, empty optional summaries, progress narration and generic ledger explanations.
- Use concise action labels and selected-account styling. Keep unique choice consequences, costs, repayment terms, incident effects, story dialogue and save warnings.
- Collapse the full choice explanation behind its details control; keep outcome odds and loan repayment warning visible.
- Consolidate non-obvious management/save rules in optional help; show extra trend sections only when data exists.
- Cache revision 9; no simulation or save-schema changes.

### Readability follow-up — 2026-10-27
- Pin browser CI to the official Playwright 1.56.1 image matching package-lock; use its preinstalled browsers and OS libraries instead of apt installation during each run.
- Replace native visible progress rendering with an explicit 28px fill whose width and orange/blue/purple/green color are driven by elapsed time; keep semantic progress for assistive technology. Show progress for 4.2 seconds plus completion hold.
- Redraw legs, shoes, eye whites and pupils; render complete 48×80 sprites at 96×160 and portraits at 96×96 without walk wobble. Label every gallery expression.
- Cache revision 8 refreshes presentation assets without changing save or financial logic.

### Presentation refresh — progress, readable cast and compact screens
- Wait for initial PWA installation before rapid reload tests, preventing a WebKit service-worker registration/navigation race without suppressing browser errors.
- Animate the weekly recap from 0 to 100%, with opening/sales/settlement phases, a completion hold and an immediate skip. Cancel stale animation callbacks when leaving the screen; no financial calculations are rerun.
- Redraw all six pixel characters and six moods (72 full-body/portrait SVGs) with distinct silhouettes, clothes, props and enlarged expressions. Keep the deterministic character generator as the art source.
- Split quoted dialogue by speaker after display-copy conversion; show each speaker and emotion explicitly. Full-body actors also receive visible name/emotion captions.
- Reduce global spacing, store art, result art and choice-card decoration while keeping readable portraits and 44px controls. Move accounting caveats into a labelled disclosure.
- Offline cache advanced to management-cache-7.

### Choice revision — direct action labels
- Rewrote names and individual explanations for all 53 policies. Each label names the action directly; the explanation separates its benefit, cost/risk and joke.
- Kept action IDs, financial rules and saved action names unchanged; historical names use the same display mapping.
- Replaced shared episode descriptions with action-specific copy, and made compensation/closure choices explicit.
- Simplified cost/risk vocabulary (施策費→作戦の費用, 原価→仕入れ代, 根本改善→原因を直す).
- Offline cache advanced to management-cache-6.

### Dialogue revision — direct satire
- Rewrote boss/customer remarks for all 53 actions, plus every existing reaction pool and result-tier response.
- Rewrote all 72 major-event outcomes; expanded display mappings to 276 passages covering meetings, scene dialogue, witnesses, news, callbacks and endings.
- Reviewed every character-attributed dialogue literal in the loaded engine/story/scene/management scripts. Kept financial instructions, numeric conditions and original save text intact.
- Corrected the limited-sale joke to agree with the actual one-week promotion.
- Added dialogue coverage and repeat-render checks; bumped the offline cache to management-cache-5.

### Events (original 0.9.7 scope)
- Review existing display copy: rewrite all 72 major-event outcomes plus meeting, news, old/new endings and scene dialogue. Apply plain-language terms to all rendered screens and historical saves without modifying saved text or simulation.
- Help now explains the selected difficulty target instead of claiming every game requires 2.55 million yen.
- Rewrite the 53 satire pairs in plain Japanese with concrete situations and short punchlines; simplify older reaction vocabulary and outcome-specific lines.
- Strengthen all 53 policy-specific CEO/customer lines and add three outcome reactions.
  Targets include unpaid labor, KPI gaming, PR apologies, greenwashing and responsibility dumping.
  Copy is presentation-only; RNG, money, saves and historical reports are unchanged.
- Retirement, fatigue and supportive policy dialogue with CEO satire.
- One-time hidden staff meeting after week 20 with sustained good workforce health.
- Existing multi-stage episodes, customer complaints, scandals and callbacks remain.

### UI (original 0.9.8 scope)
- Native difficulty selection with matching starting cash and contract target.
- Workforce metrics, operating margin and sales/profit/reputation charts added to
  existing cash graph. Historical reputation without recorded data is not invented.
- Existing pixel art, navigation, touch controls and weekly theater retained.

### Balance and replay (original 0.9.9 scope)
- Three starting cash / contract target profiles. No hidden difficulty RNG modifier.
- Eight new ending classifications; previous endings remain visible as contract
  evaluations. Legal-choice replay fixtures reach all eight from a new game.
- Per-browser ending achievements survive new games. They are separate from game
  JSON backups, explicitly disclosed in UI.

### Integration (original 1.0.0 scope)
- Package/UI/README/service-worker release identifiers synchronized to 3.1.0.
- New rules precached for offline use; installed-cache migration test updated.
- Static release builder checks/copies the 110-file precache set into dist/.
- CI includes new management/JSON/ending tests and both-engine browser coverage.
- Physical iPhone installation is not verified by browser emulation.
