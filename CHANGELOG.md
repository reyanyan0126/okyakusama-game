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

### Events (original 0.9.7 scope)
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
