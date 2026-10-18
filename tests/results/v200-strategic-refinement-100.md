# v2.0.0 — Strategic refinement: risk budgeting beats unconditional aggression

## Scope

The v2.0 milestone G implements **read-only strategic context in the four-choice proposal dialog**, not a new autopilot and not an economy rebalance.

- Current credit, cash, complaints, fire, product quality, staffing and private arrears feed a short optional checklist.
- The threshold notices are deterministic checks of **the existing game state**. No unseen future events are revealed or predicted.
- The numerical *baseline fire probability* before/after a policy uses `GameEngine.risk` and `GameEngine.previewRisk`: **standard policy effects are assumed**; independent news, accidents, prior-policy callbacks and actual policy success rolls can change the eventual probability.
- The goal pacing (remaining profit gap / weeks remaining) is exact arithmetic from recorded profit and saved contract terms; it is not a profitability forecast.
- Selected optional investment costs affect the cash-warning context, but no investment or loan is automatically purchased.
- Existing four weekly actions, save schema version 1, thirty-week contract, old twelve-week saves, and accounting remain unchanged.

## Fixed-seed controlled experiment

The research harness extends `tests/strategy-v200.cjs` with a fifth, non-player strategy `guarded-profit`: it still frequently chooses aggressive policies (including `blame`), but prioritizes repairing root causes and switches to apology, transparency or loyalty when reputation, frustration, fire, product quality, staffing, or working capital cross **documented fixed thresholds**. It never knows future rolls or changes any scenario conditions.

Comparison: **100 matched starting seeds** (seed formula `Math.imul(i,2654435761)>>>0` for i = 1..100) with identical investment/accident-compensation *rules* per arm. Each policy drives its own resulting state, so realized investments and repairs may differ.

| Finance rule | Strategy | Finished 30 weeks | Achieved contract goal | Cash below 0 at any point | Median operating profit |
| --- | --- | ---: | ---: | ---: | ---: |
| Investment, repair if reserve allows | Unconditional profit | 0/100 | 0/100 | 100/100 | -¥285,956 |
| Investment, repair if reserve allows | Guarded profit | 100/100 | 96/100 | 6/100 | ¥4,553,315 |
| No investment, repair if reserve allows | Unconditional profit | 0/100 | 0/100 | 100/100 | -¥353,373 |
| No investment, repair if reserve allows | Guarded profit | 99/100 | 20/100 | 6/100 | ¥2,071,967 |

All four test groups: **0 save-validation failures, 0 store/personal ledger residual failures, 0 recorded-stat delta discrepancies**.

The guarded-investment strategy still selected `blame` 659 times across 100 campaigns, along with `apology` 418 times, `loyalty` 258 times, and `raise` 256 times. It is *not* a conservative-only strategy: it aggressively takes profits until its risk budget requires recovery.

**Interpretation.** A short-profit strategy with contextual recovery can succeed under the current economic rules. Changing success probabilities or blindly increasing high-risk payouts is not supported by these results. Reserve-limited investments are also materially important under this algorithm. The app should help people *see risks before committing*, while leaving the strategic decision to them.

**Limitations.** These are comparisons of five fixed programmed heuristics, not representative human win rates or proof that the thresholds are optimal. Differences in timing and the resulting availability of action choices affect outcomes. The comparison is not a randomized one-action causal experiment. Player observation and real-device tests remain necessary.

## Reproduce locally

```bash
node tests/strategy-advisor-v200.test.cjs
node tests/strategy-v200.test.cjs
python tests/strategy-advisor-v200.py
STRATEGY_SEEDS=100 node tests/strategy-v200.cjs /tmp/v200-full-strategy.json
```

The final command evaluates **5 strategies × 4 financial rule sets × 100 matched seeds = 2,000 simulation campaigns** and produces complete distributions; it takes longer than the CI's small deterministic smoke. Read the 100-seed table above as an early checkpoint; all 2,000 combinations have *not* yet been run together.

## Release gate

- Review PR #19 on top of the previous stacked PRs.
- Verify new Node regression and Playwright Chromium/WebKit 320/390px, plus existing 320/375/390/430px smoke.
- Ensure script loading and Service Worker cache include `strategy-advisor-v200.js`.
- Test interactive warning refresh when optional investment changes and safe loading of older saves.
- No physical iPhone check has been made, and main/public Pages have not been updated.
