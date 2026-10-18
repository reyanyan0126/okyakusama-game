# v2.0.0 matched-finance strategy checkpoint (40 seeds × 16 groups)

Audit follow-up to tests/results/v200-strategy-checkpoint.md. Calculated against the original v1.8.0 game engine with `tests/strategy-v200.cjs`. This is *not* proof of optimal play, full balance, or a published v2.0 release.

## Controlled protocol

- Four independent game-selection heuristics: trust / profit / adaptive / independently seeded random.
- Four common finance rule sets: no investment or reserve-limited investment, crossed with reserve-limited compensation or no compensation.
- Every group uses exactly the same 40 starting seeds.
- Within any given finance rule set, investment and incident compensation rules are identical across strategies. Realized actions can vary because each strategy creates different cash and store conditions.
- Emergency rescue preference is identical for every group. Strategies may choose financing policies as a *weekly action*, which is part of the strategy being studied.
- No future-game RNG peeking, mutation of the engine during selection, or gameplay balance adjustments.
- All 640 campaign runs: save-validation failures 0, store/personal ledger residual errors 0, report delta errors 0.

## Observed results

Cell format: **contract goals met / campaigns (completed 30 weeks); median cumulative operating profit in yen**.

| Finance rules | Trust | Profit | Adaptive | Random |
| --- | --- | --- | --- | --- |
| No invest + compensate | 40/40 (40); ¥3,456,735 | 0/40 (0); -¥357,570 | 40/40 (40); ¥4,180,152 | 19/40 (32); ¥2,539,866 |
| Invest + compensate | 40/40 (40); ¥4,135,707 | 0/40 (0); -¥276,038 | 40/40 (40); ¥5,064,087 | 32/40 (34); ¥4,038,213 |
| No invest + ignore | 40/40 (40); ¥3,456,517 | 0/40 (0); -¥383,706 | 40/40 (40); ¥4,155,513 | 15/40 (28); ¥1,444,039 |
| Invest + ignore | 40/40 (40); ¥4,111,028 | 0/40 (0); -¥327,888 | 40/40 (40); ¥5,046,287 | 29/40 (33); ¥3,813,618 |

Investment changes the median profit substantially, especially for adaptive and random decisions; however, the aggressive short-term strategy still fails under these four tested financing rules. This supports prioritizing a deeper audit of customer retention, the crisis choice pool and delayed reputation consequences, but **does not justify an arbitrary buff to aggressive policies**. The trust-first strategy also seems too reliable across these sampled conditions.

## Restrictions and next experiment

These are 40-seed preliminary observations using one algorithm per strategy; they are not human success probabilities, and all four finance conditions are not automatically equivalent to player strategies. Median-profit variation includes survival bias and campaign lengths.

Before any balance changes:
1. Run `STRATEGY_SEEDS=200 node tests/strategy-v200.cjs /tmp/v200-full.json` (200 seeds × 16 matched groups) in a suitably long-lived local or CI job.
2. Inspect which specific aggressive actions dominate and whether the action mix changes as store conditions deteriorate.
3. Test isolated policy swaps in otherwise matched campaign conditions rather than inferring causal effects from observational averages.
4. If a small balance change is supported, compare the *same* starting seeds, rules and selections before/after.
5. Add tests for 12- and 30-week saves, PWA recovery and mobile event visibility when gameplay code eventually changes.

This report belongs to stacked development PRs and is not a release announcement.
