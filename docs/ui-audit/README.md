# v2.17 UI audit (in progress)

Base: 931fa86f37047f60575a30b4c5054941cb61045f. No engine, finance, story or save-format changes.

## Confirmed defects and changes

| Priority | Problem | Change |
|---|---|---|
| P1 | Home CTA inherits a grid column and becomes right-aligned | A single full-width flex action group |
| P1 | Proposal confirmation covers lower choice cards | Separate scroll body and non-overlapping footer |
| P1 | Dialog cleanup scoped under #app misses sibling dialogs | Common sibling-dialog layout |
| P1 | Large numbers and long strings can overflow detail rows | Flexible zero-minimum columns and wrapping |
| P2 | 14 stylesheets apply conflicting important rules | One ui.css entry, explicit legacy/interface cascade layers |
| P2 | Identical nested detail disclosures | Move live metric nodes into the existing disclosure |
| P2 | Decorative scene banners crop faces and repeat information | Remove banner insertion from dialogue/report surfaces |
| P2 | Prologue repeats the title over a character collage | One portrait; narrative text below |
| P2 | Same actor repeated in one manga scene | Keep first portrait per distinct speaker, preserve all dialogue |
| P2 | Home week and headings repeated | One visible week indicator |
| P2 | Title still says v2.14 despite v2.16 cache | Visible release and cache version updated together |
| P3 | Overlarge choice illustrations and heavy shadows | Compact symbols, restrained borders |

## Validation

Before changes, 7 historical Node tests failed. Three encoded obsolete three-choice / twelve-week specifications and are preserved under tests/legacy-spec, superseded by current four-choice, campaign, rescue and finance suites. Other failures included a fixed old cache name and a removed office illustration. Current assertions check supported behavior.

Baseline: six widths 320 / 375 / 390 / 430 / 768 / 1024, screenshots in test-artifacts/before. The new runners cover first use, each prologue step, both money tabs, all four choices, optional investment/debt, dynamic branches, resume, 30 weeks, and offline reload. GitHub Actions artifacts retain screenshots for both Chromium and WebKit.

Validation is still in progress. Do not treat this document as release approval.

## Artwork boundary

Existing artwork is reused. No new portraits have been generated. The existing art manifest remains draft; the four non-protagonist characters have a single genuine portrait each, not five distinct expressions. This revision must not claim that missing expression assets have been completed or approved.

## CSS maintenance

The running game loads only ui.css. Its lower legacy layer retains historical presentation; the interface layer owns current layout. Historical standalone styles remain for auxiliary gallery/preview pages and archived tests. Edit current layout in the interface layer, not by adding another stylesheet. Only the HTML hidden semantic has an important declaration.
