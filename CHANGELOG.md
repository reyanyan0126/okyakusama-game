# CHANGELOG

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

### Presentation refresh — progress, readable cast and compact screens
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
