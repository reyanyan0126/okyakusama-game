# v2.0.0 strategy audit — first controlled checkpoint

Development base: PR #12 head `e638028b79da6d8411c5309bc231e9c69e54baa5`. **This is not a v2.0.0 release or a balanced game.**

## What changed
- Added a reproducible four-strategy / four-finance-policy experiment (16 groups) using the real engine and finance ledger.
- Matched seeds per group; fixed and independently generated random-policy decisions. No future-RNG inspection or game-state mutation in selection.
- The same cash-reserve investment algorithm, accident compensation algorithm, and rescue selection apply to every strategy within a finance-policy arm.
- Controls: no investment vs. investment; cash-reserve repair vs. ignoring accidents.
- Added Node assertions for deterministic replays, save validation, accounting ledger reconciliation and bounded delta reporting. CI performs a small sample as a regression smoke test.
- No gameplay amounts, success probabilities, save schema, dialogue or published PWA assets were changed.

## First measured checkpoint (40 matched seeds per strategy, same no-investment/repair rule)
| Policy | Finished 30 weeks | Reached goal | Ever short of store cash | Median cumulative operating profit |
| --- | ---: | ---: | ---: | ---: |
| Trust-first | 40/40 | 40/40 | 0/40 | ¥3,456,735 |
| Profit-first | 0/40 | 0/40 | 40/40 | -¥357,570 |
| Adaptive | 40/40 | 40/40 | 0/40 | ¥4,180,152 |
| Uniform random | 32/40 | 19/40 | 10/40 | ¥2,539,866 |

All groups above had zero per-week save validation, ledger residual, and recorded-stat delta errors.

This small checkpoint shows the drastic difference still exists **when investment and compensation rules are matched**, though it does not identify which individual action causes it. The strategies are fixed heuristic policies, not optimal players or human win rates; the conclusions cannot be extrapolated to player populations. The differences in the *realized* investments still depend on state, not strategy identity.

## Reproduction
- `node tests/strategy-v200.test.cjs`
- `STRATEGY_SEEDS=12 node tests/strategy-v200.cjs /tmp/v200-smoke.json`
- `STRATEGY_SEEDS=200 node tests/strategy-v200.cjs /tmp/v200-full.json` (recommended full local experiment; takes longer)
- JSON groups report completed, passed, shortages, fires, project purchases, compensated accidents, loans, rescues, accounting/save integrity, quantiles, ten-week phase distributions, and action counts.

## Next gates before changing probabilities
1. Run the 200-seed four-finance-arm full factorial; save results and test runtime.
2. Inspect action availability/selection frequencies, profit and failure cases. Avoid attributing observed association to the action without a controlled intervention.
3. Propose *minimal* gameplay changes from validated findings, keep prior 30/12-week saves, and rerun the exact same seed-policy pairs.
4. Verify new game decisions in mobile Chromium and WebKit.
5. Keep PR #12 and public main untouched until reviewed and approved.
