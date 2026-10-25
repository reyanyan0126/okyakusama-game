# Test migration

The original 38-file suite passed on main 41901f2 before edits. Legacy UI assertions explicitly require the removed DOM, manga art and CSS layers. They are retained as historical specifications, not represented as current tests. Engine, story, finance, four-choice, performance, rescue, root-cause and save assertions remain active. Mixed tests had only obsolete presentation assertions removed, with originals retained. New browser tests exercise actual rendered flows instead of fake DOM hooks.

Historical presentation tests:
- manga-v200.test.cjs
- cast-art-v2120.test.cjs
- cast-gallery-v2100.test.cjs
- visual-v210.test.cjs
- office-v171.test.cjs
- audit-cast-art-v270.test.cjs
- cast-direction-v220.test.cjs
- protagonist-preview-v2101.test.cjs
- legacy-people-v213.test.cjs
- ui-smoke.test.cjs
- layout-repair-v290.test.cjs
- cinema-v170.test.cjs
- art-review-v280.test.cjs
- cast-gallery-art-v2110.test.cjs
- cast-layout-v161.test.cjs
- art-review-handoff-v300.test.cjs
- compact-home-v214.test.cjs
- cast-cinema-v260.test.cjs
- onboarding-v101.test.cjs
- ui-current.test.cjs
- illustration-v173.test.cjs
- art-v160.test.cjs
- storyboards-v150.test.cjs
- store-scenes-v250.test.cjs
- scene-art-v211.test.cjs
