# v3.1.0 release verification

## Source and scope

- Repository: reyanyan0126/okyakusama-game; baseline main 8572e48.
- Actual baseline package/cache version: 3.0.0. README was stale at 2.14.0.
- HTML/CSS/JavaScript static application; no server-side application or database.
- GitHub Pages URL: https://reyanyan0126.github.io/okyakusama-game/
- Existing campaign length 30; legacy 12-week saves remain 12 weeks.
- Existing engine/finance/story regressions were executed before editing: 14/14 pass.
- Changes and the correspondence to requested stages are in CHANGELOG.md.

## Executed verification

- Regression suite including management addition: 15/15 passed locally.
- Forty complete legacy campaigns produce byte-identical final save fingerprints
  to the unmodified 3.0.0 engine, including RNG and every weekly report.
- 120 new campaigns (40 per difficulty): every-week JSON roundtrip, integer finance,
  exact store ledger reconciliation and operating-profit reconciliation pass.
- All eight new endings reached using legal offered choices only, from normal
  initial states. Fixtures contain seed, difficulty and full action sequences;
  no balance/stat/ending injection is used to prove reachability.
- Invalid workforce fields, invalid difficulty, malformed/inconsistent history and
  duplicate hidden-event prevention tested.
- Chromium and WebKit management browser checks: 320/390/1024px; all difficulty options,
  actual new-game selection, workforce display, eight ending screens, achievement
  persistence, charts, malformed JSON and simulated storage quota failure pass.
- Chromium and WebKit installed-service-worker upgrade: save preserved, pending outcome
  resumed without reroll, new cache replaces old cache.
- Chromium full-screen suite: 1,360 screens across 320/375/390/430/768/1024px, including full 30-week DOM campaigns, old save branches and offline use.
- Legal-choice retirement replay: a real resignation and 18,000-yen expense with zero ledger residual. Low fatigue no longer cancels low morale in turnover calculations.
- New-management offline reload tested by disconnecting the local HTTP server after service-worker activation, including the rules script and saved ending.
- Static build: 110 required files copied successfully, no missing precache assets.

## Acceptance boundaries

- iPhone hardware/Safari Home Screen installation has not been physically tested.
  Chromium or Linux WebKit is browser-engine coverage, not a real iPhone test.
- Ending reachability is tested; optimal play or absence of every dominant strategy
  is not mathematically proven. Difficulty changes only initial cash and target.
- New workforce rules are intentionally not retrofitted to old saves. Start a new
  game to use them. Old saves keep their existing contract and original ending.
- Achievements are local-only and not included in the exported game JSON.
- Old per-version visual tests under tests/legacy-spec remain historical references;
  active tests are tests/*.test.cjs, pixel-browser.cjs, pixel-upgrade.cjs and
  management-browser.cjs. No failing active test was disabled.
- Baseline engine/finance byte-freeze assertions belonged to the visual-only 3.0
  release. They are replaced by behavioral legacy campaign fingerprints for this
  gameplay release. The unchanged story-file byte assertion remains active.

## Changed areas

- management.js, engine.js, finance.js: opt-in rules, accounting, validation, endings.
- app.js, ui.css: difficulty, workforce, charts, achievements, atomic import.
- index.html, sw.js, package files: new script, cache and version.
- scripts/build-release.cjs: static release build.
- tests/fixtures, management tests, existing version-specific cache assertions and
  wait-public.cjs: compatibility, reachability, PWA and published-content checks.
- .github/workflows/ui-audit.yml: new browser tests on both engines.
- README.md, CHANGELOG.md, this report: controls, migration, verification boundaries.

Publication must match the verified committed source. A branch or PR alone does
not update Pages. Check merge/deployment status and compare published files before
claiming the new version is live.

Local WebKit needed additional shared libraries extracted into a temporary directory. The downloaded launcher was configured to preserve that library path; no application behavior or test assertion was bypassed. The normal GitHub Actions setup installs the standard WebKit dependencies.
