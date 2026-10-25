# お客様のために。Pixel Edition 3.0

## Source and scope

Baseline: main `41901f22fc7c6ced4f90a549093174c91dab19fd` (PR #44). PR #45 (`83654884673440a9adf0ae4a0b99e92aa1cd6d67`) was open, mergeable, and both CI workflows had failed when inspected. Its HTML removes a `.topline .eyebrow` node still written by `paint()`. It also changes the cache version beyond the old current-UI test's accepted versions. It has not been merged. This branch replaces the presentation rather than stacking its CSS-only changes.

The original 38 regression test files passed before editing. Before screenshots were captured from an isolated checkout of the exact baseline. `engine.js`, `stories.js`, and `finance.js` remain byte-identical. A checksum gate protects them. Save key `okyakusama.save.v1` and version 1 remain unchanged. Legacy 12-week contracts retain their original duration and economics.

## Design system

| Role | Color |
|---|---|
| Paper / background | `#f5eedc` |
| Panel | `#fff9e9` |
| Text / outline | `#293a35` |
| Primary / success | `#315c49` |
| Secondary / wood | `#886c53` |
| Danger / loss | `#a33f36` |
| Special / emphasis | `#d8ae58` |

Assets are original, rect-only SVG pixel art, with integer coordinates and `shape-rendering="crispEdges"`; they are vector-native pixel sprites, not downsampled illustrations. `scripts/build-pixel-art.py` is their reproducible source. No raster resampling or old illustration overlay runs in the game.

- Characters: 48×64 logical pixels, normally displayed at 2×; small actors at 1×.
- Portraits: 32×32 viewports using the identical character source; displayed at 1× or 2×.
- Store and room backgrounds: 144×80; displayed at 2×, or 3× for a desktop title.
- Icons: 16×16; labels are always present where meaning matters.
- Body text: system Japanese sans-serif, 15px; small supplementary text 12px. Browser tests inject a Japanese font only for reproducible screenshots. Font files are not a production network dependency.
- Buttons: minimum 44px; primary action 52px. Reduced-motion users receive no animation.

## Cast and assets

The five existing characters retain their original visual identifiers: dark-haired suited consultant with red tie; bespectacled president with brown suit; brown-haired female manager in green apron; orange-capped employee; brown-haired regular customer Mori in muted purple. The devil has a separate red/gold visual identity.

Every character has normal, happy, angry, confused, surprised and sad expressions, in both full-body and face forms. There are 72 character assets, six store states, four room backgrounds, and ten icons (92 SVG assets total). See [asset gallery](assets.html).

## Screen inventory and replacement

| Screen / state | New rendering |
|---|---|
| Title | One logo, one store, start/resume, help |
| Contract | Five exact contract conditions, confirmation before replacing a save |
| Prologue ×7 | Existing story copy, scene/character, one next action |
| Home | One week indicator, case, compact stateful store, three metrics, weekly issue, primary action |
| Choices | Four compact cards with cost, effect, risk; selected plan details and exact odds |
| Meeting | Field evidence and macroeconomics in a native disclosure |
| Investing | Optional radio choices, cost/level/effect start time |
| Devil | Separate receive/repay timing, maximum-contract restrictions, explicit credit consequences |
| Working | Brief store/actor animation, immediate skip |
| Outcome | Performance result separate from unrelated news; preserved policy story and dialogue |
| News / fire / memory / accidents | Short headline and scene, mandatory accident decision before progression |
| Rescue | Every engine-provided option and cost; confirmed abandonment |
| Report | Money/reputation deltas, reason, detailed reconciled ledgers, next action |
| Public opinion | Representative customer, reputation meter, expandable other comments |
| Records | Summary, cash trend, per-week disclosures, existing success/loss/fire statistics |
| Finances | Current balance, commitments, scheduled pact liabilities, exact account ledger |
| Status | All operational metrics, root-cause witness and cast relationships |
| Ending | Original engine ending, goal comparison, personal finances, story resolutions |
| Saves | Export, validated import, preserve unreadable raw data without silently overwriting |
| Cast gallery | All six expressions for each named role |

Old UI asset files and past drawing modules remain in repository history/current tree for archival review and old regression references. They are neither loaded by `index.html` nor precached by the new service worker. The release uses one stylesheet and one application controller. The old 200KB layered stylesheet and embedded portraits are removed from the live entrypoint.

## Verification

`npm ci`, `npm test`, `BROWSER=chromium npm run test:browser`, `BROWSER=webkit npm run test:browser`.

The browser suite covers 320, 375, 390, 430, 768 and 1024px. It checks each rendered image, horizontal overflow, duplicate IDs, runtime exceptions, and primary home action visibility; captures all ordinary screens and actual legacy branch fixtures; plays through 30 weeks per viewport; round-trips a downloaded save; and verifies installed offline home/choices/cast. WebKit offline verification drops origin connections (its automation-level offline toggle can cause an internal navigation error); Chromium uses the browser offline toggle.

The original source-coupled UI tests are preserved under `tests/legacy-spec/*.historical`. Their replacement is actual browser interaction rather than assertions requiring removed IDs and artwork. See [test migration](test-migration.md). Gameplay assertions in mixed tests remain active.

## Known limits

- WebKit is an automated desktop engine with mobile viewport dimensions; this is not a physical iPhone hardware test.
- Save data is local to each browser and origin, as before. Changing device/browser requires export/import.
- Costs on strategy cards describe the action's own expense or estimated saving, not total business outflow. Successful savings scale with outcome. Detailed financial records preserve that distinction.
- A final release report will record actual CI, merge, deployment, and public checks. Source implementation alone is not deployment completion.
