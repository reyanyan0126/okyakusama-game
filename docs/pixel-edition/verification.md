# Verification record

Local browser audit JSON is committed alongside this file.

| Engine | Widths | Screen/state captures | Result |
|---|---|---:|---|
| chromium | 320, 375, 390, 430, 768, 1024 | 1357 | Passed |
| webkit | 320, 375, 390, 430, 768, 1024 | 1360 | Passed |

Each width includes a full thirty-week interaction campaign, legacy event/rescue/outcome fixtures, backup export/import and offline views. The audit arrays end with offline-cast at every width. A fresh GitHub Actions run is required before merge. Production verification is still pending.

Fresh regression run: 14 test files passed, zero failed (78 seconds). The prior 38-file suite also passed before redesign; presentation assertions were migrated as documented.

Same-origin PWA upgrade: passed locally in Chromium. Test waits for both controller replacement and completed cache retirement before reloading, asserts unchanged JSON save, and resumes a pending outcome without advancing RNG. Browser CI runs this in both engines. There was a race in the first version of this test's asynchronous wait; it has been replaced with explicit lifecycle/cache completion checks.

[Before/after comparison](comparison.md) is included. Production jobs wait for exact committed `index.html`, `app.js` and `sw.js` on GitHub Pages before opening every screen with both engines at all six widths. Public WebKit omits the browser's broken offline-toggle simulation; offline is tested on the local origin by dropping network connections in the pre-merge suite.
